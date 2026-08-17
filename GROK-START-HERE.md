# GROK — START HERE

**Read first every session:**

1. `SONS-OF-THUNDER-MASTER-CONSTITUTION.md` — **reigns overall** (how to work + non-negotiables)
2. Current `js/config.js` → `APP_BUILD`
3. `SOURCE-OF-TRUTH.md` + `PROTECTED_BASELINE.md`
4. Then domain docs only as needed

Chat memory is evidence. **Source + Master Constitution are authority.**

---

# GROK-START-HERE — Thunder Board

**Before modifying Thunder Board, read this file, then the permanent constitution, then the current production source.**

## Authority order (highest first)

1. **Current production source** (HTML/CSS/JS/assets/functions in the deployed package)
2. **Repository constitution set** (files listed below)
3. **User’s explicit new order** in the active conversation
4. **Conversational memory** (lowest — never reconstruct behavior from chat when source can be verified)

Conversational memory is **input**, not the archive.  
The repository remembers Thunder Board.

## Mandatory read order before code changes

1. `GROK-START-HERE.md` (this file)
2. `THUNDER-CONSTITUTION.md
- **THUNDER-AI-CONSTITUTION.md** (Thunder = orchestrator, not chatbot; truth hierarchy; action chips)`
3. `THUNDER-VISUAL-DNA.md`
4. `THUNDER-UX-STATE-MACHINE.md`
5. `SECURITY.md` + `THUNDER-SECURITY-GATE.md` (if present)
6. `THUNDER-REGRESSION-LESSONS.md`
7. `THUNDER-ACCEPTANCE-TESTS.md`
8. `SONS_OF_THUNDER_FEATURE_MANIFEST.md` / `PROMPT-LEDGER-48H.md`
9. **Then** open the actual files you will touch

## Working method (non-negotiable)

**Inspect → prove → modify**

1. Inspect the **actual current source**
2. Identify what already exists and what collides
3. Find root cause
4. Make the **smallest** appropriate change
5. Prove no protected DNA regressed
6. Only then package a zip

Evidence over confidence. “Should work” is not evidence.

## Stop-coding rule

Once a build passes the agreed gate, **do not touch it** without a concrete new reason from the user. Endless polishing is itself a regression risk.

## Labels (never conflate)

| Label | Meaning |
|-------|---------|
| SOURCE VERIFIED | Present and correct in package source |
| TESTED | Automated or local script check passed |
| DEPLOYED | Published to Netlify |
| BUILD CONFIRMED | Live `APP_BUILD` matches intended zip |
| DEVICE VERIFIED | Human saw it on a real phone after hard refresh |

You may not claim “works on iPhone” from SOURCE VERIFIED alone.
