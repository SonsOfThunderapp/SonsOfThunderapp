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

See `CONCIERGE_TOUR_SPEC.md`. Tour must pause ambient (`body.tb-tour-open`) and resume without a synchronized burst of every pulse.

## Explicitly rejected motion

- Confetti, points, social-like celebrations
- Constant flashing, cartoon bounce, heavy camera shake
- Liquid glass / Material theater packs (rejected in product editor pass)
