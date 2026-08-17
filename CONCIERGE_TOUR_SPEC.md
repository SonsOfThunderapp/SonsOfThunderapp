# CONCIERGE TOUR SPEC — Follow the Bolt

## Purpose

First-run and replay guide. The official lightning bolt is the **host**, not a badge on a generic coach card.

## Audience constraint (locked 2026-08-16)

Many brothers are **older and not tech-friendly**.

Required:

- Slow, patient pacing
- One idea per step
- Plain language (no FAB/PWA/modal jargon)
- Large tappable controls
- Always-visible **SKIP TOUR**
- Tap speech to finish typing early
- No punishment for going slow

## Authoritative implementation

- Version key: `TB_TOUR_VERSION` in `js/app.js` (v4 as of bolt1)
- Storage: `thunderTourV{version}` localStorage
- DOM: `#tb-tour`, `#tb-tour-host`, `#tb-tour-tip`, `#tb-tour-spotlight`, `#tb-tour-dim`
- Entry: `maybeStartProductTour` after splash; install overlays win
- Replay: `#replay-tour-btn` on More

## Steps (v4 copy in source)

1. welcome — Follow me  
2. gathering — Next Gathering / Crooked Can / Monday rule  
3. imin — I’m In (allowTargetTap)  
4. brothers — nav  
5. events — nav  
6. code — The Code  
7. thunder — Ask Thunder + optional real demo  
8. finish — Replay from More / Thunder doesn’t dull  

## Motion / focus (required intent)

| Requirement | Spec | Source status |
|-------------|------|---------------|
| Host bolt separate from tip | `#tb-tour-host` + bolt-only.png | PRESENT |
| Arrival / travel / explain / celebrate classes | CSS host states | PRESENT |
| Live typing + tap to complete | `typeTourText` | PRESENT |
| Pause ambient under `body.tb-tour-open` | CSS animation-play-state | PRESENT |
| Dim + backdrop filter | `.tb-tour-dim` | PRESENT |
| Tight spotlight only on one target | director rule | PARTIAL — large yellow frames still possible |
| Extinguish previous before travel | director rule | PROMPTED BUT NOT FOUND as explicit phase machine |
| Curved path / electrical trace | director rule | PROMPTED BUT NOT FOUND |
| Suppress competing red CTA during non–I’m-In steps | director + older-user | PROMPTED BUT NOT FOUND |
| One-second attention test | director gate | FAILED on bolt1 review screenshots |
| Full cinematic sequence after approval | user hold for approve | NOT IMPLEMENTED pending explicit approve |

## Haptics during tour

- Arrival: `thunderImpact` (once)
- Step change: `selection`
- Complete: `confirm`
- No per-character haptics

## Non-regression

Do not replace this system with a second tour framework. Improve in place.  
Do not remove Skip/Close/Replay.  
Do not auto-start over install overlays.
