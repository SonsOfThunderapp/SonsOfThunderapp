# MOTION, VISUAL EFFECTS & HAPTICS SPEC

## Shared heartbeat

- CSS variable: `--tb-breathe` (≈4s ease-in-out, peak mid-cycle)
- Keyframe systems: `boltLive`, `codeTitleGlow`, `rsvpLockPulse`, brother name pulse, etc.
- Rule: ambient pulses share one clock; one-shots stay one-shot
- `prefers-reduced-motion: reduce` → disable loops; keep utility

## Logo / bolt

- Wordmark: official assets; **no** full-box gradient/filter slab
- Header pulse uses bolt-shaped overlay / `logo-bolt-pulse` asset approach — not rectangular glimmer
- `.logo-bolt-glimmer` / splash variant: **disabled** (`display: none !important`)

## Haptics (`tbFeedback` + `TB_CONFIG.SENSORY`)

| Semantic | Meaning | Platform |
|----------|---------|----------|
| thunderImpact | Brand hit / arrival | Visual all; vibrate Android optional |
| press | CTA down | Visual + short vibrate if enabled |
| confirm | Success | Visual + vibrate optional |
| selection | Soft select | Light |
| warningOrError | Fail / warn | Pattern optional |

iPhone PWA: **no** `navigator.vibrate` — never fake it. Visual tactility only.

## Tour motion

See `CONCIERGE_TOUR_SPEC.md` and **`THUNDER-CINEMATIC-MOTION-LANGUAGE.md`** (eternity lock 2026-08-18).

Governing principle: Thunder speaks → one feature wakes → eye moves there → feature responds → settle → continue.

- One dominant motion event at a time
- Thunder entrance 150–250ms then **stays put** (no bounce/travel)
- Electric scene transition 300–400ms (no Ken Burns / full-screen zoom)
- Scene 7 only: one synchronized final heartbeat on “YOU'RE READY / LET'S GO”
- Tour must pause ambient (`body.tb-tour-open`) and resume without a synchronized burst of every pulse

## Explicitly rejected motion

- Confetti, points, social-like celebrations
- Constant flashing, cartoon bounce, heavy camera shake
- Liquid glass / Material theater packs (rejected in product editor pass)
- Ken Burns / continuous whole-screen scaling on tour
- Multiple simultaneous dominant motions during tour
- Thunder bouncing around the screen after entrance
