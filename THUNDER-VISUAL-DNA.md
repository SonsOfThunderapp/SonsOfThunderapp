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
