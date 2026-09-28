# LPF CARD encoder

Sidecar for the Sons of Thunder profile photo. Not the avatar. Not a second app.

Look E is locked. This folder is the complete encoder: isolate, TURN THE CARD, poster.

Do not merge this branch to `main` until Obie says so. `main` is TB1 and stays frozen.
TB2 live (`sonsofthunderboard.com`, stamp `20260928-hang-diecut-turn`) already turns the layout in `brother-baseball-f2.js`. It does **not** run rembg. A CSS stroke on a rectangle is not this encoder.

## Run

```
pip install -r lpf-card/requirements.txt
python3 lpf-card/lpf-card-encode.py path/to/photo.jpg --profile profile.json --out ./card-out
```

No photo:

```
python3 lpf-card/lpf-card-encode.py BOLT --out ./card-out
```

`profile.json` keys (all optional — empty hides the row):

```
{
  "first": "OBIE",
  "last": "DIAZ",
  "joined": "2018",
  "bio_chip": "Jesus Follower",
  "occupation": "Morning Host",
  "birthday": "April 25",
  "city": "Orlando",
  "hobbies": "Fishing"
}
```

Outputs: `cut.png` (alpha), `card.png`, `card.jpg`, `original.*` (vault copy), `card.json` with `flipped_man: false`.

## TURN THE CARD

Never flip the man's pixels. `facing()` in `lpf-card-encode.py` and `facingFromImageData` in `facing.mjs` are the same rule.

- Head = top 38% of the cut bbox.
- `faceX` = opacity-weighted centroid X of that band.
- Gesture extends right of the head (`spanRight > spanLeft * 1.12`) → layout `man-left`. Chips, name, and wordmark go right. Energy enters the card.
- Gesture extends left → `man-right`. Chips and name go left.
- Tie, square, no alpha → `man-right`.
- Trout proof: man LEFT. Do not mirror him.

Browser: run `facing.mjs` on the alpha PNG only. Then:

```
card.dataset.layout = result.layout
card.dataset.mirrored = "false"
img.style.transform = "none"
```

Never `scaleX(-1)`.

## Die-cut

`rembg` isolates the subject. White ~4px stroke + shadow is drawn in `compose`. Fail closed if there is no alpha: the live app must keep a rectangular window, not a circle crop.

No photo, screenshot, or not-a-face → `assets/SOT-BOLT-ICON.png` (same bolt as `/icons/icon-180.png`). Do not redraw it.

`assets/SOT-LOGO-WORDMARK.png` is the only mark. Do not outline it, recolor it, or redraw it. Bottom of the chip side, above the red rail.

## Badge

`JOINED` + a four-digit year, or hidden. Never `CLASS '26`. Never `THUNDER '26`.

## What this commit does not do

- Does not change `main`.
- Does not overwrite `photo_url`.
- Does not set IMG_1375 or the trout as Obie's avatar. `obie-and-dad.jpg` stays a window (two people).
- Does not add Hubert Wilson.
- Does not put city/hobbies columns in Supabase. Those fields hide until they exist.
