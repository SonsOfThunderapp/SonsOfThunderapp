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
