# Thunder Board — Sons of Thunder

Mobile-first PWA. Pure black, official bolt, red CTAs.

Live: https://sonsofthunder.netlify.app

---

## Watertight deploy (do this order)

### A. Netlify environment variables (secrets)

Site → Project configuration → Environment variables → Add (mark **Contains secret values**):

| Name | Value |
|------|--------|
| `XAI_API_KEY` | your key from https://console.x.ai |
| `VAPID_PUBLIC_KEY` | `BCgwDSLwty9ggT-AB7uJ1FyMCkL51HeJ0ceu-1g6mxU3EOROSBq254SHkRZfA8S_UNEKPhS3epV9egEtcU7i2Y4` |
| `VAPID_PRIVATE_KEY` | (the private key you already set in Netlify — never commit it) |
| `LEADER_PIN` | `thunder` |
| `SUPABASE_URL` | `https://mnsempcgomukcpofgvlm.supabase.co` |
| `SUPABASE_ANON_KEY` | same publishable key as in `js/config.js` |

Scopes: Production (and Preview if you use it).

### B. Build settings (critical — prevents exit code 2)

Project configuration → Build & deploy → Build settings:

- **Build command:** leave **EMPTY** (clear any npm / cd commands)
- **Publish directory:** `.` or blank / site root
- Functions directory is set by `netlify.toml` → `netlify/functions`

### C. Supabase (one-time SQL)

Supabase → SQL Editor → paste and run `sql/push_subscriptions.sql`  
(or the push_subscriptions section at the bottom of `supabase-schema.sql`).

### D. Deploy the site

**Preferred (fewest failures):** Netlify → Deploys → Deploy manually → drag the **unzipped site root** (or the zip if Netlify accepts it).  
Files must sit at site root: `index.html`, `js/`, `css/`, `assets/`, `netlify/`, `sw.js`, `manifest.json`.

**If using GitHub:** push this exact tree to `main`, then Trigger deploy. Build command must stay empty.

After env vars change → always redeploy once so Functions pick them up.

---

## What works without extra setup

| Feature | Needs |
|---------|--------|
| Home, I’m In, Brothers, Events, About, Code | Nothing |
| Smart install CTA | Nothing |
| Leadership edits (local) | PIN `thunder` |
| Thunder AI local answers | Nothing |
| Thunder AI Grok answers | `XAI_API_KEY` + redeploy |
| Shared profiles / memories | Supabase (already in config) + schema |
| Gathering Alerts (phone push) | VAPID keys + `push_subscriptions` table + env above |

---

## Architecture notes

- **Root `package.json`** lists only `web-push` (required so Netlify esbuild can resolve it). No build scripts — static site only.
- **No `package.json` inside `netlify/functions`** — deps come from the project root.
- **Private VAPID key never in client** — only in Netlify env.
- **Meeting rule:** first Monday; if that Monday is Labor Day or Memorial Day → second Monday.
- **Venue:** Crooked Can Brewery Patio, Winter Garden · 6:30 PM.

---

## Quick test after deploy

1. Open https://sonsofthunder.netlify.app — Home loads.
2. Functions list in Netlify shows: `thunder-ai`, `push-subscribe`, `push-unsubscribe`, `push-broadcast`.
3. More → Gathering Alerts: should NOT say “VAPID public key missing” (after hard refresh / reopen from home screen icon).
4. Leadership → add test announcement → opted-in phones get a short push.
5. Ask Thunder a random question → Grok answers if `XAI_API_KEY` is set.

---

## Troubleshooting exit code 2

Almost always: a **Build command** set in the Netlify UI. Clear it.  
This site is static HTML/CSS/JS + serverless functions. There is nothing to compile.
