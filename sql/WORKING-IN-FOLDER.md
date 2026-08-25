# WORKING IN THE FOLDER — Thunder Board

**Chat is for orders. This folder is the product.**

## Authority
1. Live production: https://sonsofthunderboard.com
2. This folder (when APP_BUILD matches live)
3. Constitution docs in this repo
4. Chat memory (lowest)

## Before any edit
1. Read `GROK-START-HERE.md`
2. Compare:
   - Live: `https://sonsofthunderboard.com/build.json`
   - Folder: `js/config.js` → `APP_BUILD`
3. Only edit when they **MATCH**
4. After deploy: More → REFRESH APP on a real phone

## Official URL
https://sonsofthunderboard.com  
(not netlify.app, not a zip path)

## Sync note (2026-08-24)
Runtime (HTML/CSS/JS/assets/sw/manifest/build.json) was pulled from live **20260824-splash1**.
Constitution markdown retained from package docs.
Netlify function *source* may lag live server binary — treat live behavior as truth for API; edit functions only with care.

## Labels
SOURCE VERIFIED · LIVE CHECKED · DEVICE NOT YET VERIFIED
Never claim iPhone from source alone.

## Cyber handoff (2026-08-24)
- See SECURITY-HANDOFF.md — give to assessor as-is.
- Build id after hardening pass: 20260824-sec-hand1 (folder). Deploy required before live matches.
