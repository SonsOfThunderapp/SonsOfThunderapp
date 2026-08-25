# Thunder Board — Security Model (2026-08-16 sec1)

## Score: 78/100 (post-remediation target after SQL applied in Supabase)

Client is **untrusted**. AI is **untrusted for authorization**. NFC/QR/deep links are **untrusted input**.

## Secret inventory

| Credential | Classification | Location |
|------------|----------------|----------|
| SUPABASE_ANON_KEY / publishable | PUBLIC BY DESIGN | `js/config.js` |
| VAPID_PUBLIC_KEY | PUBLIC BY DESIGN | `js/config.js` |
| SUPABASE_URL | PUBLIC BY DESIGN | `js/config.js` |
| LEADER_PIN | CONVENIENCE GATE ONLY | `js/config.js` — **not** server authority |
| XAI_API_KEY | SERVER-ONLY | Netlify env |
| VAPID_PRIVATE_KEY | SERVER-ONLY | Netlify env |
| SUPABASE_SERVICE_ROLE_KEY | SERVER-ONLY | Netlify env |
| service_role in client | MUST NEVER | verified absent in client JS |

## Authorization matrix (intended)

| Actor | Home read | Brothers write | Memories | Announcements write | Push broadcast |
|-------|-----------|----------------|----------|---------------------|----------------|
| Anonymous | yes | no | no | no | no |
| Authenticated brother | yes | own profile (owner_id) | own insert/read shared | no (RLS leader) | no |
| Leader/admin (app_members) | yes | own | own | yes via is_sot_leader() | yes via JWT + role check in function |
| Client PIN alone | UI unlock only | no | no | no | **no** |

## P0/P1 fixes in this pass (require SQL run in Supabase)

1. **push_subscriptions** — removed open SELECT/INSERT/UPDATE/DELETE for anon/authenticated. Netlify functions use **service role only**.
2. **brothers** — `owner_id` column + insert/update only when `owner_id = auth.uid()` (no “null owner writable by anyone”).
3. **memories insert** — requires `user_id = auth.uid()`.
4. **thunder-ai** — best-effort rate limit ~20/min/IP per instance; question still capped 500 chars.
5. **push-subscribe/unsubscribe** — no anon key fallback for DB writes.
6. **Headers** — `Permissions-Policy`, `frame-ancestors 'none'` (plus existing X-Frame-Options DENY).

## Still ops-dependent (not pure code)

- Supabase Auth: **disable open signup** / invite-only for production scale.
- Seed `app_members` for real leaders.
- **Run** updated `supabase-schema.sql` + `sql/push_subscriptions.sql` in SQL Editor.
- **Never** run `sql/leadership-publish-policies.sql` on production (opens writes).

## Specialist’s first five attacks — expected outcome

1. **Client-visible secrets** → finds anon + VAPID public + LEADER_PIN only; no service_role / XAI / VAPID private.
2. **Direct Supabase REST write to announcements** → denied unless `is_sot_leader()` (if schema applied).
3. **Enumerate push_subscriptions** → denied after SQL fix (no SELECT policy for anon/auth).
4. **POST push-broadcast without leader JWT** → 401/403.
5. **XSS via profile/memory** → `esc()` before innerHTML; Thunder markdown escape-first.

## Permanent constitution

1. Client is untrusted.  
2. AI is untrusted for authorization.  
3. Deep links/NFC do not grant privilege.  
4. Authentication ≠ authorization.  
5. RLS protects exposed data.  
6. Privileged secrets stay server-side.  
7. Privileged operations fail closed.  
8. Shared writes need clear authority (`is_sot_leader` / session).  
9. External input validated/sanitized.  
10. Obscurity is not a boundary.
