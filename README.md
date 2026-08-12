# Thunder Board — Sons of Thunder

Mobile-first PWA for the fraternity. Pure black, official bolt, red CTAs.

## Thunder AI (Grok hybrid)

- **Local (instant):** next meeting, I’m In, The Code, Mark 3:17 / identity, Proverbs 27:17, rough night → Text a Leader
- **Grok (xAI):** everything else, via Netlify Function so the API key never ships to the browser

### Deploy Grok brain on Netlify

1. Deploy this folder as the site root (or drag the zip into Netlify).
2. Site settings → Environment variables → add:
   - **Key:** `XAI_API_KEY`
   - **Value:** your key from https://console.x.ai (API Keys)
3. Ensure Functions are enabled (default). Function path:
   `/.netlify/functions/thunder-ai`
4. Redeploy after adding the env var.

Without `XAI_API_KEY`, local answers still work; open-ended questions show a clean “Can’t reach Thunder” fallback.

### Local test without Netlify

Open `index.html` for UI. Grok calls need the function hosted (or a local proxy). Keyword answers work offline.

### Config

`js/config.js` — VENUE, MEETING_TIME, LEADER_PIN, LEADER_SMS_PARTS

Meeting rule: first Monday monthly, except Labor Day / Memorial Day → second Monday.

### Thunder AI key (required for Grok)
Set **XAI_API_KEY** as a secret environment variable on the Netlify site, then **redeploy**. Without it, open-ended Ask Thunder questions will fail; local answers (meeting, Code, Scripture) still work.


## Shared roster, photos & memories (Supabase)

Profiles and memories **survive redeploy** and **sync across phones** when Supabase is configured.

### One-time setup
1. Create a free project at [supabase.com](https://supabase.com)
2. SQL Editor → paste and run `supabase-schema.sql` from this repo
3. Project Settings → API → copy **Project URL** and **anon public** key
4. Put them in `js/config.js`:
   ```js
   SUPABASE_URL: 'https://xxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ...'
   ```
5. Redeploy the site

### Behavior
- With keys set: save profile / memory → uploads to Supabase Storage + tables; every device pulls the same list on load
- Without keys: same local-only mode as before (data still survives redeploy on that phone)

### Notes
- Anon key is meant for the browser; RLS policies in the schema allow read/write for this private fraternity app. Tighten with auth later if needed.
- Local cache still used for offline; shared data is source of truth when online
