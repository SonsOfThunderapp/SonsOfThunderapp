# THUNDER-UX-STATE-MACHINE — overlays, Concierge, Thunder, install

## Overlay priority (highest first)
1. **Blocking safety / in-app browser gate** (must leave IG/FB browser)
2. **Install concierge / Home Screen coach** (when user is in install path)
3. **Product tour / Bolt Concierge** (first-run or replay)
4. **Thunder modal**
5. **Feature modals** (profile, memory, leadership, QR, info-detail)
6. **Memory full-screen viewer**
7. **Toasts** (never block)

Only one of 2–6 should own the “star” treatment at a time.  
Dim or pause lower layers; never stack two full-screen coaches.

## Concierge / tour states
| State | Behavior |
|-------|----------|
| first_run | May auto-start after welcome (versioned); Skip available |
| returning_completed | No auto-start |
| skipped | Respect; no nag; Replay from More |
| interrupted | Resume or clean dismiss; no duplicate launch |
| completed | Persist version; no spam |
| replay | User-initiated from More only |
| install_open | Install coach wins; tour waits |
| abandon_explore | Dismiss cleanly; user free; no re-ambush same session |

**No Concierge spam.** Tour failure never blocks nav.

## Concierge philosophy
- App recedes; Bolt Concierge foreground
- One feature explanation at a time
- Spotlight **real** UI target; dim the rest
- Game-tutorial polish, not a webpage popup

## Ask Thunder sample (real path only)
Sample taps (e.g. WHEN’S THE NEXT GATHERING?) must:
1. Open real Thunder UI  
2. Use real local/Grok pipeline  
3. Answer from authoritative meeting engine  
No canned alternate truth.

## Thunder Wake intensity
| Moment | Level |
|--------|-------|
| First-ever open Thunder | L4 allowed |
| New session first open | L3 short |
| Follow-up while open | L1–L2 max |
| Already open | no new spectacle |

## Install states
- INSTALLED only when standalone / Home Screen / appinstalled truly detected
- IN_APP_BROWSER → hand off to Safari/Chrome first
- Poster + INSTALL + HOW on More when not installed
- Gathering Alerts after install value is clear

## Profile save
- L3/L4 signature only after **successful** save
- Thunder visual language, not confetti toys

## Exactly-once
Guard against double-submit on: I’m In, profile save, memory upload, push subscribe, Thunder send, tour step advance.


## Tour host visual (locked — pending code)
- Living host element `#tb-tour-host` must display Thunder **character** art (Cool default), not the logo bolt mark.
- Celebrate state may use Smile briefly; travel/explain use Cool.
- Bond remains the Ask Thunder page hero (scaled up per TC03).
- Copy “FOLLOW THE BOLT” may remain; the **face** of the tour is the character.
