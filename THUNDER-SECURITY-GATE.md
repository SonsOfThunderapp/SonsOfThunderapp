# THUNDER-SECURITY-GATE — permanent trust boundaries

## Principles
1. **Client is untrusted.** UI visibility is not authorization.
2. **Authentication ≠ authorization.** Signed-in ≠ approved leader.
3. **AI is never authorization.** Thunder/Grok cannot grant roles or bypass RLS.
4. **QR / NFC / deep links are untrusted input.** Validate; never execute privileged ops from payload alone.
5. **Secrets server-side only:** `XAI_API_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. **Privileged actions fail closed.**
7. **RLS / Netlify function checks** protect data — not hidden buttons.
8. **LEADER_PIN** = mild UI convenience only — never server authority for push or DB.

## Release matrix (always)
| Actor | Expect |
|-------|--------|
| Anonymous | Public read; no shared writes |
| Brother A | Own profile/memory paths only |
| Brother B | Cannot edit A’s profile |
| Leader | Leadership writes only if `app_members` / server says so |
| Expired session | No privileged write; re-auth path |

## Housekeeping vs security
Housekeeping may prune dead push endpoints and refresh session UX.  
It may **not** promote users, alter RLS, rotate secrets, or deploy code.
