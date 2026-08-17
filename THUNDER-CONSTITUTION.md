> **Parent:** See `SONS-OF-THUNDER-MASTER-CONSTITUTION.md` for the unified operating + product reign document.

# Thunder Board Constitution (permanent product rules)

**Repo is memory.** Current production source + this constitution outrank conversational memory.

---

## Meta laws (how Grok may work on this app)

### Inspect → prove → modify
Never respond to a change request by immediately rewriting code. First inspect actual current source, identify what exists, identify collisions, find root cause, then make the smallest appropriate change. Evidence over confidence.

### One orchestration system
Animation, pulse, glow, overlays, gestures, and haptics share centralized timing/tokens (`--tb-breathe`, ThunderFX recipes, documented intensity ladder). Features must not invent independent ambient clocks.

### Effect intensity ladder
- **L0** static  
- **L1** press / active  
- **L2** ambient glow/pulse  
- **L3** meaningful success (I’m In lock, profile save ack)  
- **L4** rare signature (splash, first Thunder Wake, profile-complete celebration)  
Normal navigation never earns L4.

### No competing transforms
Positioning/alignment and animation must not fight the same `transform` property. Animate wrappers or dedicated layers when needed. (Root cause of past bolt-alignment damage.)

### Overlay ownership
Only one experience is the visual star. Install coach, Concierge/tour, modal, Thunder, Memory viewer, etc. have explicit priority. Never stack competing overlays or leave two things fighting for attention.

### Effects fire from truth, not taps
Success animation only after actual success. RSVP, profile save, upload, etc. must not celebrate a failed write.

### Exactly-once effects
Double taps, Enter+click, async callbacks, route changes, and retries must not cause duplicate writes, duplicate Thunder Wake, duplicate modals, or stacked animation.

### Motion cannot block function
Cinematic layer is subordinate to the product. Signature sequences (~700–1100 ms) may create impact; the app must not artificially wait for effects when data/UI is already ready.

### Lifecycle cleanup
Animations, listeners, observers, timers, typewriter sequences, and abortable async work clean up on navigation, background/resume, and interrupted flows.

### Collision gate before every ZIP
Before packaging, cross-check: lifecycle + overlays + gestures + transforms + Concierge + Thunder + deep links + housekeeping + retries + service worker + state + security. Fix **confirmed** collisions, not hypothetical ones.

### No innovation regression
A new feature is not successful merely because it works. It must prove previously protected features still work. Every enhancement has a blast radius.

### Source / deployed / device truth labels
SOURCE VERIFIED → TESTED → DEPLOYED → BUILD CONFIRMED → DEVICE VERIFIED. Never claim device success from source alone.

### Stop-coding rule
Once a build passes the agreed gate, do not touch it without a concrete user reason.

### No self-modifying “self healing”
Housekeeping may repair state, prune dead push endpoints, clean caches/session artifacts, recover gracefully. It must **never** autonomously rewrite or deploy production code.

### Failure degrades, not collapses
Grok down → local Thunder still answers authoritative facts. RSS down → Home works. Push down → app works. Animation fails → button works. Concierge fails → user reaches Home. Every enhancement needs a boring escape hatch.

---

## Private room, not Christian Facebook
- No infinite feed, likes, followers, streaks, points, leaderboards, or engagement-max mechanics.
- Brotherhood and real-world gathering > screen time.

## Canonical meeting engine
- All temporal Home states use `getNextMeetingMonday` + `meetingTime()` + `venueName()`.
- First Monday monthly; Labor Day / Memorial Day → second Monday.
- After meeting time on meeting day, next gathering rolls to next month.
- Gathering-day phases (normal / week / soon / tonight / post) are atmospheric only — not a second app theme.

## Identity
- Personal Home greeting uses **known profile name only** (`myDisplayName` / `knownFirstName`).
- **Never guess** identity from device, cache heuristics, or partial data.
- If name unknown: generic Home (no wrong “Morning, Mike”).

## I’m In
- Signature commitment action. Local device truth until shared RSVP exists.
- Do not imply group presence from local-only roster.
- Success UI only after local confirm succeeds.

## Thunder AI
- Authoritative app facts (meeting, venue, Code, identity) outrank Grok guesses.
- AI may **surface** actions (calendar, text leader, brothers, I’m In).
- AI may **not** autonomously publish, push-broadcast, edit membership, delete memories, or change RLS.
- Human must tap every resulting action.
- **Thunder AI is not authority.** Grok cannot decide leadership, authorize broadcast, alter membership, or override DB permissions. Every privileged operation is independently authorized.

## NEW indicators
- No FOMO counters or “7 things you missed.”
- Announcements: per-item seen when opened.
- RSS is **never** part of unread / “new since visit.”

## Sensory / motion
- Visual-first; Android `navigator.vibrate` optional where supported.
- **iPhone must not be falsely represented as vibrating** through the web app; use compression, rebound, glow, bolt motion for perceived tactility.
- One ambient heartbeat: `--tb-breathe` (4s, delay 0).
- Logo full-box glimmer stays disabled (rectangle hard fail).

## Scale
- Built for ~100–250 active brothers, not viral consumer growth machinery.

## Install Concierge
- One environment → one primary action. No PWA jargon for brothers.
- Never mark installed unless standalone/Home Screen is detected (or appinstalled).
- Facebook/in-app browser: hand off to Safari/Chrome before Home Screen steps.
- Gathering Alerts after install value is clear — not stacked on first QR open.

## Product Tour / Bolt Concierge
- First-run only (versioned). Replay from More.
- Philosophy: app recedes; Bolt Concierge is foreground; speech/typewriter explains **one real feature at a time**; corresponding real UI is spotlighted; irrelevant UI is dimmed.
- Feels like a polished game tutorial, not a webpage popup.
- State machine must handle intentionally: first run, returning user, skipped, interrupted, completed, replay, install overlay open, abandon-to-explore.
- **No Concierge spam.**
- Coach marks on real controls. Skip always available. Tour failure never blocks navigation.
- Coordinate after welcome; install concierge takes priority if open.

## “OR JUST ASK THUNDER” real demo
- When Concierge offers a sample (e.g. WHEN’S THE NEXT GATHERING?), path must use **real** Thunder interface → real pipeline → authoritative meeting data → real answer.
- No fake demo, no canned second source of truth.

## Thunder Wake hierarchy
- First-ever Thunder activation may get full L4 signature.
- New session: shorter acknowledgement.
- Follow-up questions: restrained.
- Thunder already open: no repeat spectacle.

## Profile-save signature
- Profile completion is a rare L3/L4 celebration in Thunder’s own visual language (not rainbow confetti; bolt/energy language).
- Fires only after successful save.

## Security constitution (summary — detail in SECURITY.md)
- Client is untrusted.
- Authentication ≠ authorization.
- AI is never authorization.
- QR / NFC / deep links are untrusted inputs.
- Privileged secrets remain server-side.
- Privileged actions fail closed.
- Supabase RLS / server checks — not hidden UI — protect important operations.

## Security test matrix (release)
Always consider: Anonymous / Brother A / Brother B / Leader / expired session — especially own-vs-other profile/data and leadership actions.

## Housekeeping
- Event-driven only (visibility/resume, failed push prune, build detect).
- Self-heal **state** only; never self-modify production code.

## ThunderFX
- Single effect vocabulary via documented recipes; no per-feature rogue clocks.


## Tour host is character (2026-08-16)
- Click-to-click Concierge/tour is led by the Thunder **character**, not the plain logo bolt.
- Ask Thunder Bond hero is large and dominant on the Thunder page.
- Implementation deferred until explicit build order; listed FAIL in PROMPT-LEDGER until shipped.

## Thunder character unity (locked 2026-08-16)

Thunder is the single official mascot and concierge character. The concierge lightning bolt must always use the authoritative Thunder character (sunglasses bolt assets: thunder-cool / smile variants). Whenever Thunder is visible but not actively performing, he uses a subtle living-idle animation. Active concierge behavior and idle behavior are coordinated through one state system (`hidden | entering | idle | speaking | guiding | reacting | exiting`) and must never conflict.

- No generic concierge bolt competing with Thunder.
- Encouragement bubbles (10 exact lines, 15s cycle) pause during guiding; living-idle pauses during speaking/guiding.
- Future ZIPs may not silently restore a generic bolt, freeze idle, or allow overlapping bubbles/states.

