# SECURITY & DATA SPEC

## Client is untrusted

Browser UI is never authority. Hiding buttons is not security.

## Secrets

| Secret | Allowed location |
|--------|------------------|
| XAI_API_KEY | Netlify env only → `thunder-ai` function |
| VAPID_PRIVATE_KEY | Netlify env only |
| SUPABASE_SERVICE_ROLE_KEY | Netlify env only (push / privileged) |
| SUPABASE_ANON / publishable | Client OK |
| VAPID_PUBLIC_KEY | Client OK |
| LEADER_PIN | Client OK **as mild UI gate only** |

## Supabase

- URL/anon in `js/config.js`
- Bucket: **Sons Of Thunder Memories** (private)
- Memory object path: `private/<user_id>/<timestamp>-<safe_filename>`
- Schema file: `supabase-schema.sql` (+ `sql/*.sql`)
- `app_members` + `is_sot_leader()` for leader writes
- Memories: authenticated read/insert; **no** authenticated DELETE policy
- Brothers: public read; authenticated write own rows (`owner_id`)

## Push

- `sw.js`: push + notificationclick; network-only fetch (no cache bloat)
- Subscribe → `push-subscribe`
- Broadcast → must require sign-in / leader identity path — not PIN alone
- Content: short announcement-style only; no prayer/private notes in push body

## XSS / HTML

- Prefer textContent; limited `**bold**` → strong after escape for Thunder replies
- User/UGC never raw HTML execute

## Auth model honesty

- Open Supabase signup (if enabled in project dashboard) means **authenticated ≠ approved brother**
- Before wide launch: disable open signup / invite-only (ops, not zip)
- Admin/Leader privileged paths fail closed server-side

## Phone numbers

- Leader SMS via split `LEADER_SMS_PARTS` — not shown as full visible marketing text
- Brother phones opt-in only
