# THUNDER CHARACTER + PRODUCT CONTINUITY
**Build lineage:** 20260817-no-wake1 (supersedes full-lock1)

Repo outranks chat memory. Read this + THUNDER-DECISIONS.md + SOURCE-OF-TRUTH.md before changing Thunder Board.

## Official Thunder (marketing + app — same DNA)
- Geometric yellow 3D lightning-bolt **HEAD only**
- Black wayfarer sunglasses
- Restrained masculine smirk
- Assets: `assets/thunder-cool.png`, `thunder-cool-fab.png` (+ cool-2 variants)
- **FORBIDDEN:** human face, skin, Bond head, tuxedo, torso, full body, redesigned bolt
- **On disk but MUST NOT EXECUTE:** `thunder-bond.png`, `thunder-bond-hero.png`

## Character layers (do not collapse)
| Layer | Meaning |
|-------|---------|
| A. Production bridge | cool bolt assets wired on FAB / tour / Ask |
| B. Approved canon | same head DNA — permanent |
| C. Seven reaction states | approved direction — **implementation pending**; not “shipped” |
| D. Rejected | Bond / human / tux — never re-wire |

## Surfaces
- FAB off-stage: cool fab, character-only glow, **no yellow circle**
- Tour host: `thunder-cool.png`
- Ask Thunder hero: `thunder-cool.png` (NOT bond-hero)
- Ask UI: primary **type + Send**; secondary **SPEAK only**

## HEY THUNDER / continuous wake — RETIRED (2026-08-17) FOREVER
- **Removed from product:** continuous “Hey Thunder” listen, WAKE chip, auto-restore of wake
- **Kept:** Ask Thunder intelligence — type, Send, SPEAK (tap-to-talk)
- **Code law:** `setWakeEnabled` forces off; `startWakeLoop` no-ops; no `#thunder-wake-chip` in DOM
- **Do not resurrect** wake chip, `tb_hey_thunder` preference UI, or “HEY THUNDER ON” labels
- Deep link `?ask=1` may still open Ask; that is **not** continuous wake

## Encouragement bubbles
- Exact 10 friend-style lines (not long Scripture essays)
- First message ~15s after Thunder visible; 8s visible + 7s quiet
- Default **ON**; opt-out only via `localStorage tbWisdomAmbientOff=1`
- `ambientOff()` must never hard-return true
- Pause on tour / modal / background / Thunder AI focus

## Other locked product DNA (do not strip)
- Identity: **Thunder doesn’t dull**
- Venue: Crooked Can Brewery Patio, Winter Garden
- Meeting: first Monday; Labor Day / Memorial Day → second Monday
- Install explainer: `assets/install-explainer.mp4` + HOW/poster; no native controls; keepAudio
- Header bolt pulse: bolt-shaped only on `--tb-breathe`; never full-box wordmark glow
- Pulse DNA: brother names, SHARE CONTACT, THE CODE, info labels, FAB, locked-in, etc.
- Tour: TB_TOUR_VERSION 10+, character host, mandatory first-run of current version
- Who’s In **group presence UI:** removed / unreachable

## Anti-resurrection (before any deploy)
- Prove old rejected behavior cannot **WIN** via CSS/HTML/JS/fallback/manifest/SW
- SW is network-only (no shell precache) — still require REFRESH APP / hard reload on device
- Source inspected ≠ zip contents — verify identity at package time
- Device iPhone is final visual acceptance; source PASS ≠ DEVICE VERIFIED

## Room to change (not frozen)
Announcements, events notes, profiles, leadership content, memories — content edits OK.

**Do not strip this file.** Future Grok/sessions: open this first when unsure.

## IMAGE GENERATION HARD LOCK (2026-08-17 — ETERNITY)
Any Thunder visual (tour slides, mocks, marketing, reactions, FAB previews):
1. Official bolt-head ONLY — yellow geometric 3D head + black wayfarers + restrained smirk
2. Reference-first: use locked asset (IMG_7692 / thunder-cool.png family) — never invent from text alone when reference exists
3. Every prompt MUST include hard bans: no human face, no skin, no Bond head, no torso, no arms, no legs, no tuxedo
4. Violating frame = dead on arrival — do not show, do not negotiate, regenerate or abort
5. Root cause of past failures: text-only prompts → model drift into human/Bond faces. Cure: reference + hard negatives every generation.

This is permanent. Future sessions read this before any Thunder image work.

## OFFICIAL ASSET LOCK (2026-08-17 — ETERNITY)
Authoritative visual sources (user-provided, locked forever):
1. **Thunder character:** IMG_7692 — yellow geometric 3D bolt HEAD only, black wayfarers, restrained smirk. Production files: `assets/thunder-cool.png`, `assets/thunder-cool-fab.png`, `assets/thunder-official-ref.png`. Bond files quarantined as `.rejected`.
2. **Wordmark logo:** IMG_7697 — bold white SONS, yellow 3D bolt through O (no white outline on clean header), solid red OF THUNDER, tagline THUNDER DOESN'T DULL. Production: `assets/logo.png`, `logo@2x.png`, `logo@3x.png`, `logo-about.png`.

Never replace these with AI reinterpretations. Image generation must match these pixels, not reinvent them.
