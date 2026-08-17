# DEPLOYMENT GATES

## Never in the same breath

Audit ≠ zip ≠ deploy. User must explicitly approve zip creation and deploy separately.

## Gate A — Preservation

- Forensic inventory done for this APP_BUILD
- PROTECTED_BASELINE + manifests updated
- release-check.sh pass

## Gate B — Security

- No client secrets
- Push broadcast identity path
- Schema path private/<user_id>/...
- Honest LEADER_PIN threat model documented

## Gate C — Product

- Meeting engine consistent
- Visual hard fails clear
- Tour does not trap older users (Skip works)

## Gate D — Runtime (human)

- Live or local smoke on real phone
- Tour attention test (optional until cinematic pass ships)
- Supabase ops confirmed if claiming shared data

## Gate E — Package

- Zip root = site root (index.html top-level)
- No node_modules, .env, private keys
- APP_BUILD bumped when behavior changes

## Current recommendation seed

See latest forensic report in conversation / CHANGELOG.  
**As of 2026-08-16 bolt1 audit: NOT SAFE TO CREATE FINAL ZIP** until director tour pass decision and remaining PARTIAL items accepted or fixed.
