# Concierge / Product Tour — SPEC (authority)

**Updated:** 2026-08-18  
**Canonical:** Slide-based tour V11 (`TB_TOUR_VERSION = 11`)

## Status
OLD floating/bouncing Concierge (`placeTourHost`, spotlight, tip chase) is **RETIRED**.  
See `DO-NOT-RESURRECT-REGISTRY.md`.

## Runtime
- DOM: `#tb-tour.tb-tour-slides`, `#tb-tour-slide-img`, caption + NEXT/BACK/SKIP
- Assets: `assets/tour-01.png` … `tour-07.png`
- Storage: `thunderTourV11`
- Entry: first-run via `maybeStartProductTour()`; replay via `#replay-tour-btn`

## Motion (CINEMATIC LANGUAGE — locked 2026-08-18)

Full vocabulary and hard rules: **`THUNDER-CINEMATIC-MOTION-LANGUAGE.md`**

Summary:
- Principle: Thunder speaks → one feature wakes → eye follows → responds → settles → continue
- One dominant motion at a time
- Thunder entrance ~150–250ms then **stays put** (no bounce / no travel)
- Living idle only while present and not transitioning
- Type-out with rare phrase emphasis (LOCK IT IN, THE CODE, etc.)
- Feature acknowledgement: compress → rebound → electric confirm → settle
- Scene transition: electric wipe/dissolve ~300–400ms
- Focus falloff + optional electric trace on real UI (focus device, not permanent deco)
- Scene 7 only: one synchronized final heartbeat on “YOU'RE READY / LET'S GO”
- **NO** Ken Burns, full-screen zoom, aggressive camera, bouncing cards, multi-motion chaos
- `prefers-reduced-motion` → fades + utility only
