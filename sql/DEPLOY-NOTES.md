# Thunder Board — deploy this package

## This build: `20260824-sec-hand1`

Security-handoff tree. Product UI unchanged from the live-synced splash runtime plus:

- `SECURITY-HANDOFF.md` for the cybersecurity review
- Real CSP in `netlify.toml` (replaces frame-ancestors-only once this publish goes live)
- `push-subscribe` rate limit + endpoint validation
- `security.txt`
- Restored `_redirects` (SPA + security.txt)

## Official URL

https://sonsofthunderboard.com

## Deploy

1. Unzip so **index.html is at the zip/root you upload** (not a nested folder).
2. GitHub: replace repo root with these files → push `main` → Netlify auto-publish.
   Or Netlify Deploys → Deploy manually → drop the unzipped contents.
3. Confirm live identity:
   https://sonsofthunderboard.com/build.json  
   must show `"APP_BUILD": "20260824-sec-hand1"`
4. Phone: More → **REFRESH APP**.

## Env (already set — do not put in the zip)

`XAI_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## After publish

Hand `SECURITY-HANDOFF.md` to the cybersecurity guy.  
He must test **this** APP_BUILD, not an older live cache.
