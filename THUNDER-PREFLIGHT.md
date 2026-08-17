# Thunder Preflight — Clean Upgrade (not factory reset)

**APP_BUILD handshake:** `tb_app_build_persisted` in localStorage vs `TB_CONFIG.APP_BUILD`

## Golden rule
Clean **technical debris**. Preserve **brother data**.

## May prune
- CacheStorage names starting with `thunder`, `tb-`, `thunder-board`, `sot-`

## Must preserve
- Profiles / birthday / phone opt-in (`tb_brothers`, `tb_myProfileId`)
- I’m In / roster (`tb_rsvp`, `tb_rsvpRoster`)
- Tour / alerts prefs / reminders / announcements seen
- Auth session (Supabase) — never cleared by Preflight
- Push opt-in preference

## Never on every launch
- Unregister current service worker (breaks push)
- `Clear-Site-Data: *`
- Delete all localStorage
- Replay first-run Concierge solely because build changed

## REFRESH APP
Manual escape hatch: prune Thunder caches → SW `update()` → one controlled reload. Does **not** wipe profiles.

## Offline
No destructive cleanup when offline.

## Ownership
Under Housekeeping Governor → Preflight (one conductor).
