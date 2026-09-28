#!/usr/bin/env python3
"""LPF CARD sidecar — FIRE E 2026-09-27.

Does not replace lpf-encode.mjs.
Vault original → isolate → TURN THE CARD → 1080×1350 poster.

  python3 lpf-card-encode.py <photo> [--profile profile.json] [--out DIR]
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1350
RED = (224, 4, 5, 255)
YEL = (244, 228, 9, 255)
WHT = (255, 255, 255, 255)
ROOT = Path(__file__).resolve().parent
FONTS = ROOT / "fonts"
MARK = ROOT / "assets" / "SOT-LOGO-WORDMARK.png"
BOLT = ROOT / "assets" / "SOT-BOLT-ICON.png"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def hard_stroke(src: Image.Image, width: int = 4, color=WHT) -> Image.Image:
    a = src.split()[-1]
    halo = a
    for _ in range(width):
        halo = halo.filter(ImageFilter.MaxFilter(3))
    edge = ImageChops.subtract(halo, a)
    plate = Image.new("RGBA", src.size, color)
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    return Image.alpha_composite(Image.composite(plate, out, edge), src)


def drop(src: Image.Image, ox=6, oy=9, blur=10, opacity=0.38) -> Image.Image:
    a = src.split()[-1].filter(ImageFilter.GaussianBlur(blur))
    sh = Image.new("RGBA", src.size, (0, 0, 0, 0))
    sh.putalpha(a.point(lambda p: int(p * opacity)))
    layer = Image.new("RGBA", src.size, (0, 0, 0, 0))
    layer.alpha_composite(ImageChops.offset(sh, ox, oy))
    layer.alpha_composite(src)
    return layer


def plate(w: int, h: int, radius: int = 16) -> Image.Image:
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((4, 4, w - 4, h - 4), radius=radius, fill=(0, 0, 0, 255))
    return drop(hard_stroke(im, 4))


def isolate(src: Path, dest: Path) -> Image.Image:
    if dest.exists():
        return Image.open(dest).convert("RGBA")
    from rembg import remove

    cut = remove(Image.open(src))
    cut.save(dest)
    return cut


def facing(cut: Image.Image) -> str:
    """Return 'man-left' when the gesture travels right of the head. Never flip pixels."""
    a = cut.split()[-1]
    bb = a.getbbox()
    if not bb:
        return "man-right"
    x0, y0, x1, y1 = bb
    crop = a.crop(bb)
    w, h = crop.size
    if w < 40 or h < 40:
        return "man-right"
    head = crop.crop((0, 0, w, max(1, int(h * 0.38))))
    # head centroid x
    total = 0
    acc = 0
    pix = head.load()
    hw, hh = head.size
    for y in range(0, hh, 3):
        for x in range(0, hw, 3):
            v = pix[x, y]
            if v > 80:
                acc += x * v
                total += v
    face_x = (acc / total) if total else w * 0.5
    # extreme opaque columns
    col = crop.load()
    left_x, right_x = w, 0
    for y in range(0, h, 4):
        for x in range(0, w, 3):
            if col[x, y] > 80:
                if x < left_x:
                    left_x = x
                if x > right_x:
                    right_x = x
    span_r = right_x - face_x
    span_l = face_x - left_x
    if span_r > span_l * 1.12:
        return "man-left"
    if span_l > span_r * 1.12:
        return "man-right"
    return "man-right"


def draw_icons(d: ImageDraw.ImageDraw, kind: str) -> None:
    if kind == "bio":
        d.rounded_rectangle((30, 28, 70, 76), outline=(0, 0, 0, 255), width=4)
        d.line((38, 40, 62, 40), fill=(0, 0, 0, 255), width=4)
        d.line((38, 52, 58, 52), fill=(0, 0, 0, 255), width=4)
    elif kind == "work":
        d.rounded_rectangle((28, 44, 72, 74), outline=(0, 0, 0, 255), width=4)
        d.rectangle((40, 32, 60, 44), outline=(0, 0, 0, 255), width=4)
    elif kind == "cake":
        d.rounded_rectangle((28, 46, 72, 76), outline=(0, 0, 0, 255), width=4)
        d.rectangle((28, 46, 72, 56), fill=(0, 0, 0, 255))
        d.line((50, 28, 50, 46), fill=(0, 0, 0, 255), width=4)
    elif kind == "pin":
        d.ellipse((32, 26, 68, 62), outline=(0, 0, 0, 255), width=4)
        d.ellipse((44, 38, 56, 50), fill=(0, 0, 0, 255))
        d.polygon([(50, 62), (38, 82), (62, 82)], fill=(0, 0, 0, 255))
    else:
        d.polygon(
            [(50, 24), (55, 42), (76, 42), (60, 54), (65, 74), (50, 62), (35, 74), (40, 54), (24, 42), (45, 42)],
            fill=(0, 0, 0, 255),
        )


def chip(kind: str, label: str, value: str) -> Image.Image:
    im = plate(500, 100, 16)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((12, 12, 88, 88), radius=12, fill=YEL)
    draw_icons(d, kind)
    d.text((102, 16), label, font=font("BebasNeue-Regular.ttf", 18), fill=YEL)
    value_font = None
    for cand in (
        "/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        if Path(cand).exists():
            value_font = ImageFont.truetype(cand, 22)
            break
    if value_font is None:
        value_font = font("BebasNeue-Regular.ttf", 28)
    d.text((102, 42), value, font=value_font, fill=WHT)
    return im


def bolt_cut() -> Image.Image:
    """Approved homescreen bolt only. Do not redraw."""
    im = Image.open(BOLT).convert("RGBA")
    # lift gold off the black field so it sits as the missing-face mark
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and r < 28 and g < 28 and b < 28:
                px[x, y] = (r, g, b, 0)
    return im


def compose(cut: Image.Image, layout: str, profile: dict, face: str = "photo") -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    slash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if layout == "man-left":
        ImageDraw.Draw(slash).polygon([(W, 0), (W - 600, 0), (W - 330, 340), (W, 255)], fill=RED)
        canvas.alpha_composite(drop(hard_stroke(slash, 4), -4, 6, 8, 0.25))
    else:
        ImageDraw.Draw(slash).polygon([(0, 0), (600, 0), (330, 340), (0, 255)], fill=RED)
        canvas.alpha_composite(drop(hard_stroke(slash, 4), 4, 6, 8, 0.25))
    rail = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(rail).rectangle((0, H - 14, W, H), fill=RED)
    canvas.alpha_composite(rail)

    wm = Image.open(MARK).convert("RGBA")
    wm.thumbnail((500, 344), Image.Resampling.LANCZOS)
    wm = drop(wm, 5, 8, 14, 0.32)
    if layout == "man-left":
        canvas.alpha_composite(wm, (W - wm.size[0] - 20, H - wm.size[1] - 14))
    else:
        canvas.alpha_composite(wm, (20, H - wm.size[1] - 14))

    body = cut.crop(cut.split()[-1].getbbox())
    if face == "bolt":
        body.thumbnail((980, 1100), Image.Resampling.LANCZOS)
        body = drop(body, 10, 16, 20, 0.28)
        if layout == "man-left":
            canvas.alpha_composite(body, (-20, 80))
        else:
            canvas.alpha_composite(body, (W - body.size[0] + 30, 70))
    else:
        body.thumbnail((640, 1000), Image.Resampling.LANCZOS)
        body = drop(hard_stroke(body, 5), 8, 14, 16, 0.42)
        if layout == "man-left":
            canvas.alpha_composite(body, (-40, 60))
        else:
            canvas.alpha_composite(body, (W - body.size[0] + 40, 70))

    first = (profile.get("first") or "FIRST").upper()
    last = (profile.get("last") or "LAST").upper()
    name = plate(520, 240, 18)
    nd = ImageDraw.Draw(name)
    nd.text((22, 10), "BROTHER", font=font("BebasNeue-Regular.ttf", 22), fill=YEL)
    nd.text((12, 34), first[:12], font=font("BlackOpsOne-Regular.ttf", 58), fill=WHT)
    nd.text((16, 140), last[:14], font=font("CinzelDecorative-Bold.ttf", 34), fill=WHT)

    joined = profile.get("joined") or profile.get("year_joined")
    badge = None
    if joined:
        badge = plate(200, 100, 12)
        bd = ImageDraw.Draw(badge)
        bd.rectangle((4, 4, 196, 16), fill=YEL)
        bd.text((16, 22), "JOINED", font=font("BebasNeue-Regular.ttf", 16), fill=YEL)
        bd.text((12, 42), str(joined), font=font("AlfaSlabOne-Regular.ttf", 32), fill=WHT)

    rows = [
        ("bio", "BIO", profile.get("bio_chip") or "Tap for the man"),
        ("work", "OCCUPATION", profile.get("occupation")),
        ("cake", "BIRTHDAY", profile.get("birthday")),
        ("pin", "CITY", profile.get("city")),
        ("hobby", "HOBBIES", profile.get("hobbies")),
    ]
    rows = [(k, lab, val) for k, lab, val in rows if val]

    if layout == "man-left":
        canvas.alpha_composite(name, (W - name.size[0] - 12, 10))
        if badge:
            canvas.alpha_composite(badge, (W - badge.size[0] - 16, 240))
        y = 348
        for k, lab, val in rows:
            ch = chip(k, lab, val)
            canvas.alpha_composite(ch, (W - ch.size[0] - 12, y))
            y += 100
    else:
        canvas.alpha_composite(name, (10, 8))
        if badge:
            canvas.alpha_composite(badge, (16, 248))
        y = 356
        for i, (k, lab, val) in enumerate(rows):
            canvas.alpha_composite(chip(k, lab, val), (12 if i % 2 == 0 else 20, y))
            y += 100
    return canvas


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("photo", nargs="?", default="")
    p.add_argument("--profile")
    p.add_argument("--out")
    p.add_argument("--cut")
    args = p.parse_args()
    out = Path(args.out or (ROOT / "card-out"))
    out.mkdir(parents=True, exist_ok=True)
    profile = {}
    if args.profile:
        profile = json.loads(Path(args.profile).read_text())
    photo = Path(args.photo) if args.photo else None
    face = "photo"
    if not photo or not photo.exists() or photo.name in {"-", "NONE", "BOLT"}:
        face = "bolt"
        cut = bolt_cut()
        layout = "man-right"
        (out / "cut-source.txt").write_text("BOLT_FALLBACK homescreen icon-180\n")
    else:
        shutil.copy2(photo, out / f"original{photo.suffix.lower()}")
        cut_path = Path(args.cut) if args.cut else out / "cut.png"
        cut = isolate(photo, cut_path)
        layout = facing(cut)
    card = compose(cut, layout, profile, face=face)
    png = out / "card.png"
    jpg = out / "card.jpg"
    card.save(png)
    card.convert("RGB").save(jpg, "JPEG", quality=95)
    manifest = {
        "law": "LPF-CARD FIRE E 2026-09-27",
        "facing": "TURN THE CARD" if face == "photo" else "BOLT_FALLBACK",
        "layout": layout,
        "face": face,
        "flipped_man": False,
        "profile_keys": sorted(profile.keys()),
        "outputs": [str(png), str(jpg)],
    }
    (out / "card.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
