# PROTECTED BASELINE — Sons of Thunder / Thunder Board

**Authority:** Explicit user locks across the full project history (Aug 2026).  
**Rule:** Do not strip, mute, simplify, or “optimize away” items below without a new explicit user order.  
**Build identity under audit:** `APP_BUILD` in `js/config.js` (current: `20260816-MASTERPIECE1b-bolt1`).

## Product DNA (never casual)

- Pure black `#000000` environment
- Official yellow-to-orange bolt mark (`assets/bolt-only.png` / `icon-official.png`) — never emoji ⚡ as the brand mark
- Red CTAs `#E30600`; yellow accent `#FEF105`
- Identity line: **Thunder doesn’t dull.**
- Private-room energy — not church-management software, not Christian Facebook
- Language: accessible, no soft churchese; Scripture NASB when quoted
- No complex login required **to view** core content
- Venue: **Crooked Can Brewery Patio, Winter Garden**
- Time: **6:30 PM** from config (`MEETING_TIME`)
- Meeting rule: **first Monday**; if that Monday is **US Labor Day or Memorial Day** → **second Monday**
- Single meeting engine: `getNextMeetingMonday` (+ `isLaborDay` / `isMemorialDay` / `meetingMondayOf`)

## Visual hard fails (do not ship if present)

- Rectangle / slab / full-box gradient or filter outline around wordmark or splash mark
- `.logo-bolt-glimmer` / `.splash-logo-bolt-glimmer` active as full-box effects (must remain killed: `display: none !important` cascade)
- Oversized profile/memory media breaking phone viewport
- Modal X unreachable; body scroll stuck after close
- Secrets in client: `service_role`, `VAPID_PRIVATE`, `XAI_API_KEY` assignment values

## Interaction locks

- Bottom nav: Home | Brothers | Events | More (about)
- I’m In: local commitment language, lock pulse; no false success
- Install: platform-aware; explainer CapCut VO (`install-explainer.mp4`); keepAudio true
- Ask Thunder: hybrid local keywords + Netlify `thunder-ai` (Grok); key server-only
- Push: Gathering alerts only; private VAPID server-only; broadcast not PIN-as-security
- Memories path: `private/<user_id>/<unique_filename>` under bucket **Sons Of Thunder Memories**
- LEADER_PIN: mild UI gate only — never real authorization

## Concierge / tour (protected intent)

- Bolt is host/guide/narrator for first-run and replay
- Older / non-tech-friendly brothers: slow pacing, plain words, big targets, always Skip
- Director attention hierarchy when tour active: bolt → one feature → bubble → controls → rest subdued
- **Status note:** Living host + typing exist in source (tour v4); full cinematic director pass (tight spotlight, extinguish-before-travel, dual-red suppression) was specified and **not fully implemented** as of this baseline file. See `CONCIERGE_TOUR_SPEC.md`.

## Ops outside the zip (human)

- Supabase invite-only / disable open signup before wide FB blast
- SQL schemas applied in Supabase SQL Editor
- Netlify env: `XAI_API_KEY`, `VAPID_*`, `SUPABASE_*` (service role server-only)

## Change control

Future Grok/developer sessions: read this file + `SONS_OF_THUNDER_FEATURE_MANIFEST.md` + `NON_REGRESSION_CHECKLIST.md` before editing product surface. Run `scripts/release-check.sh` before claiming a ship zip.
