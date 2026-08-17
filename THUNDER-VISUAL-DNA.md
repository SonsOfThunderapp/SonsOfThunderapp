# THUNDER-VISUAL-DNA — permanent visual & motion locks

## Brand tokens
- Background: pure black `#000000`
- Yellow: `#FEF105` (bolt / energy)
- Red: `#E30600` (CTAs / emphasis)
- Text: white + soft gray secondary
- Typography: display headers (Bebas-class), body Inter-class
- Tagline: **Thunder doesn’t dull.**

## Logo & bolt
- Official wordmark: white SONS, yellow bolt through O, red OF THUNDER — do not redraw/recolor locked assets
- Official icon: yellow-to-orange gradient bolt, white outline, black rounded square
- **Hard fail:** rectangle, slab, black pad, or full-box gradient/filter around wordmark or splash
- `.logo-bolt-glimmer` remains killed (`display: none !important`) unless replaced by **bolt-shaped-only** treatment
- Header bolt heartbeat (if present): bolt-shaped asset only; position % never animated; reaches true low opacity without layout shift

## MASTERPIECE baseline (protected — do not regress)
- Header bolt fully disappears and returns **without shifting layout**
- Next Gathering / Announcement cards may breathe on shared clock
- Brother names pulse in **grid and detail**
- Profile **photo tiles** pulse (`.brother-photo`)
- Open seat / empty `+` pulse
- Event month/day glow (text-shadow bloom, not opacity-only)
- Modal titles pulse (`.tb-pulse-title`)
- THE CODE yellow fill + red outline pulse
- SHARE CONTACT / info labels / locked-in status share clock
- More / About logo stays below status area (`safe-area-inset-top` when header hidden)
- Concierge first-use without repeat spam
- Android: legitimate `navigator.vibrate` where supported
- iPhone: **no false vibration claims** — perceived tactility via motion/glow only

## Pulse DNA
- **One clock:** `--tb-breathe` 4s ease-in-out, peak ~50%, delay 0
- Soft/invisible pulses = regression
- Inventory also in `PULSE-DNA-LOCK.md` and `config.PULSE_DNA`
- `prefers-reduced-motion`: ambient loops off

## Thunder character (Scope A)
- Cool (sunglasses) = default FAB; soft-rotate variants on open
- Big Smile = short flash on successful I’m In only
- Bond tux (no sunglasses) = Ask Thunder page only
- FAB: character-only + glow — **no yellow circle**
- Hard no: random Bond, always-on mic, Thunder as feed brother

## Intensity ladder (visual)
L0 static → L1 press → L2 ambient pulse → L3 success → L4 rare signature  
Navigation is L0–L1 only.

## Install / More
- Explainer **poster visible** on install card (not HOW-only)
- Poster + HOW open same explainer modal (`install-explainer.mp4`)
- Invite brother is secondary text action, not a second competing red share card


## Tour host character (locked 2026-08-16 — pending code)
- Product tour **host** must be the Thunder **character** (Cool / Scope A family), **not** plain `bolt-only.png`.
- Plain bolt-only remains for: welcome bolt, header bolt pulse, QR center, brand marks.
- Ask Thunder page: Bond hero must be **much larger** / dominant when Thunder is open (no yellow circle).
- Status until coded: **FAIL in source** — see PROMPT-LEDGER TC01 / TC03.


## Living idle — Cool FAB character (20260816-char-idle1)
- Additive CSS on existing `thunder-cool-fab` assets only
- Stage: breathe (translate); img: glow pulse + 16s rare personality; sparks on ring layers
- Seamless 0%/100% keyframes; pause when tab hidden / fab-hit / reduced-motion
- Does not change Bond hero size or tour host (still pending TC01/TC03)

## Thunder character canon (Gate 1 corrected — 2026-08-17)

### Identity (current approved)
- Premium **faceted dimensional golden** bolt
- Black sunglasses where the look calls for them
- Restrained, confident, masculine, private-room energy
- One unified character: FAB, Concierge host, Ask Thunder, encouragement companion

### Seven emotional / reaction states — CURRENT APPROVED CANON
Implementation: **APPROVED + PENDING** visual/motion proof. Do **not** treat as optional. Do **not** silently drop to three looks.

1. LOCKED IN
2. GOOD CALL
3. LET'S GO
4. THINKING
5. BROTHERHOOD
6. APPRECIATE THAT
7. I'M ALL EARS

### Legacy / bridge production assets (still in code until migration)
- Cool / Cool-2 FAB — live FAB + tour host
- Smile FAB — I'm In flash
- Bond / Bond hero — Ask Thunder
- bolt-only / masks — logo overlay, QR

Bridge assets **do not supersede** the seven-state + faceted-gold canon.

