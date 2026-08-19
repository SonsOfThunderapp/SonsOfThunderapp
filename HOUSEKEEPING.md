# Housekeeping Governor

Runtime health. Event-driven only. Heals **state**, never production code.

## When it runs
- **Launch** — `setupHousekeeping()` from init
- **Resume** — `visibilitychange` → visible
- **Online** — `window.online`

No polling. No auto-reload. No auto-delete of brothers, memories, or announcements.

## What it does
| Trigger | Action |
|---|---|
| Launch | Stamp `APP_BUILD` in session; strip ghost `#rsvp-add-cal`; refresh I’m In |
| Resume / Online | Reconcile Gathering Alerts with real PushManager; quiet `auth.getSession()` |
| Memory upload | If Storage succeeds and the DB insert fails, **remove that one storage object** |

## Forbidden
- Rewrite or deploy code
- Schema / RLS / role changes
- Delete memories except the exact orphan above
- Force-refresh the tab mid-task
- Health-check timers

## Docs this governor assumes
`THUNDER-CONSTITUTION.md` · `SOURCE-OF-TRUTH.md` · `RELEASE-GUARDIAN.md` · `DEPLOY-NOTES.md`
