# Thunder Board — authorization deploy notes

## Architecture (hybrid)
- Public browse stays public (no login required for Home / About / etc.).
- Shared writes for announcements & events_board: **active leader/admin** in `app_members` (RLS + `is_sot_leader()`).
- Push broadcast: **Supabase access token** + leader/admin row — **not** client `LEADER_PIN`.
- `LEADER_PIN` in config is **UI only** (opens Leadership tools).

## One-time ops
1. Supabase → Authentication → disable **Allow new users to sign up** (invite-only).
2. Run full `supabase-schema.sql` in SQL Editor (includes `app_members` + leader policies).
3. After your user exists in Auth → Users, run:
   ```sql
   insert into public.app_members (user_id, role, active)
   values ('YOUR-AUTH-USER-UUID', 'admin', true)
   on conflict (user_id) do update set role = excluded.role, active = true;
   ```
4. Netlify env (required for alerts):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (never in client)
   - `SUPABASE_ANON_KEY` (optional, for auth/v1/user apikey header)
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT`
   - `XAI_API_KEY` for Thunder AI
5. More → REFRESH APP on installed phones after deploy.

## Before every deploy
```bash
bash scripts/release-check.sh
```
Must exit 0. After deploy: brothers use More → REFRESH APP once.


## WARNING — do not run sql/leadership-publish-policies.sql
That file re-opens shared writes (`with check (true)`). Production uses `supabase-schema.sql` + `app_members` only.
