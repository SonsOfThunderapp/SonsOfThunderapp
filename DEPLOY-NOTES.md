# Thunder Board — ONE deploy checklist (credit-safe)

## This build: `20260815-life1`
- Logo box kill switch (no yellow rectangle on wordmark)
- Auth copy: shared memories only; invite-minded
- Leadership can edit announcements / Next Mission / events note (cloud when signed in + schema)
- Core DNA unchanged

## Deploy (Netlify)
1. Unzip so **index.html is at the root** of what you drag (not a nested folder).
2. Deploys → Deploy manually → drop files → wait for Published.
3. Phone: More → **REFRESH APP**.

## Prove logo (30 seconds)
Open Home. Wordmark must sit on pure black with **no yellow box**.
If box remains: REFRESH APP again or delete Home Screen icon and reopen.

## App-for-life (do once in Supabase — not a code deploy)
1. Auth → disable **open signup** if you only want invited brothers (or keep signup and invite manually).
2. Auth → turn **off** “Confirm email” if brothers get stuck on the confirm page (you control risk).
3. Run `supabase-schema.sql` in SQL Editor if not already.
4. Seed yourself as leader:
   ```sql
   insert into public.app_members (user_id, role, active)
   values ('YOUR-AUTH-USER-UUID', 'admin', true)
   on conflict (user_id) do update set role = excluded.role, active = true;
   ```
5. Netlify env: `XAI_API_KEY`, `VAPID_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only).

## After publish
Canary 5–10 brothers before the 900-member Facebook post.
