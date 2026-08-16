# Thunder Board (Sons of Thunder)

**Build:** `20260816-LOCKED` — permanent freeze of all signed-off systems as of 2026-08-16.

See **SOURCE-OF-TRUTH.md** for the full inventory. See **THUNDER-CONSTITUTION.md** for product rules.

Live: https://sonsofthunder.netlify.app/

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
| `VAPID_PUBLIC_KEY` | (same public key as in `js/config.js` — already set in Netlify) |
| `VAPID_PRIVATE_KEY` | (the private key you already set in Netlify — never commit it) |
| `LEADER_PIN` | (your leadership PIN — set only in Netlify env) |
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
| Leadership edits (local) | PIN from Netlify `LEADER_PIN` (or local fallback) |
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


## Tap Thunder (physical NFC / QR)

**Philosophy:** Scan when away · Tap when here · Say “Hey Thunder” when you need something.

Physical tags should only encode durable HTTPS URLs (never authority):

| Tag URL | Opens |
|---------|--------|
| `https://sonsofthunder.netlify.app/tap/ask` | Ask Thunder (voice ready when allowed) |
| `https://sonsofthunder.netlify.app/tap/gathering` | Home / next gathering |
| `https://sonsofthunder.netlify.app/tap/install` | Install path (More) |
| `https://sonsofthunder.netlify.app/tap/brothers` | Brothers |
| `https://sonsofthunder.netlify.app/tap/events` | Events / memories |

Optional object id suffix is ignored for routing base: `/tap/gathering-main` → gathering.

**Write tags as standard NDEF URL records** (iPhone background read + Android).  
Always pair with QR of the same URL. NFC is public — never grants leadership or private actions.

