# Thunder Board Constitution (permanent product rules)

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

## Thunder AI
- Authoritative app facts (meeting, venue, Code, identity) outrank Grok guesses.
- AI may **surface** actions (calendar, text leader, brothers, I’m In).
- AI may **not** autonomously publish, push-broadcast, edit membership, delete memories, or change RLS.
- Human must tap every resulting action.

## NEW indicators
- No FOMO counters or “7 things you missed.”
- Announcements: per-item seen when opened.
- RSS is **never** part of unread / “new since visit.”

## Sensory / motion
- Visual-first; Android vibrate optional progressive enhancement only.
- One ambient heartbeat: `--tb-breathe` (4s, delay 0).
- Logo full-box glimmer stays disabled (rectangle hard fail).

## Scale
- Built for ~100–250 active brothers, not viral consumer growth machinery.


## Install Concierge
- One environment → one primary action. No PWA jargon for brothers.
- Never mark installed unless standalone/Home Screen is detected (or appinstalled).
- Facebook/in-app browser: hand off to Safari/Chrome before Home Screen steps.
- Gathering Alerts after install value is clear — not stacked on first QR open.


## Product Tour
- First-run only (versioned). Replay from More.
- Coach marks on real controls — not a slideshow.
- Follow the Bolt. One message at a time. Skip always available.
- Tour failure never blocks navigation.
- Coordinate after welcome; install concierge takes priority if open.


## ThunderFX (permanent)
- Single effect vocabulary: ThunderFX.trigger-style recipes via ThunderFX.* methods.
- Cross-platform **parity**, not identical hardware buzz.
- No unsupported iOS vibration hacks.
- Signature effects are scarce; never fire success without authoritative success.
- prefers-reduced-motion strips motion; state remains clear.


## Signature heroes (permanent)
- Profile save success → Thunder Fireworks (authoritative success only).
- Cold splash launch → Thunder Laser Ignition (not ordinary resume).
- Scarcity: heroes are rare; ordinary UI stays restrained.
- Android may use short supported vibrate patterns; iPhone visual parity only.
- prefers-reduced-motion: confirmation without full motion storm.


## Thunder Voice Architecture (permanent)
- One doorway: Ask Thunder. Many entries (FAB, mic, `?ask=1&voice=1`, shortcuts, future Siri/Android intents).
- One pipeline: existing local + Grok hybrid. Voice is input only — not authority.
- Privacy: explicit opt-in for wake; visible listening; stop on background; no raw audio to xAI; transcript text only.
- Foreground "Hey Thunder" is optional and stops when the app is hidden. Not system-wide.
- Fallback always: TAP TO SPEAK / type.
- No background microphone. No fake always-listening claims.


## Tap Thunder (permanent)
- Physical interface: NFC/QR encode durable `https://…/tap/{intent}` only.
- Scan away · Tap here · Voice when you need something — three doors, one board.
- NFC is never authority. App routes intent; auth still required for privileged acts.
- Always ship QR fallback on the same object.
- Do not hardcode event dates into physical tags.


## Final product lock (2026-08-16)
- Build label: **20260816-LOCKED**
- Inventory of every signed-off system lives in **SOURCE-OF-TRUTH.md** — read it first.
- Housekeeping repairs collisions and state; it does not remove locked product surface.
- Three doors: Scan (away) · Tap (here) · Voice (need something) → one Ask Thunder / one board.
