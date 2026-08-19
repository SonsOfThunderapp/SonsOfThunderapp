# Release Guardian

Gate before credit. Code presence ≠ working.

## Before any ship
1. `APP_BUILD` in `js/config.js` matches the cache-bust query on `index.html` scripts.
2. Run `scripts/release-check.sh`.
3. Splash → tour has no foreign overlay (no OPEN IN SAFARI on first run).
4. Home **Already a Member?** and Brothers **SIGN IN** open the same auth gate.
5. Header wordmark is the stacked 7697 mark (white SONS, yellow bolt, **red OF THUNDER**). No box glow.
6. Modal sheets: category chip quiet; **real title** pulses.
7. Housekeeping: `setupHousekeeping();` is called; no new `setInterval` for “health”.

## Never
- Zip without a visual proof when the change is visual
- Claim live until phone hard-refresh shows the new `APP_BUILD`
- Let housekeeping invent features

## Deploy
See `DEPLOY-NOTES.md`. After publish: More → REFRESH APP.
