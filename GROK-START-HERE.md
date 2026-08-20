# GROK-START-HERE — Thunder Board

**`VISUAL-PROOF-PROTOCOL.md` is permanent law.** Human-eye approval required. If the work is visual, SHOW THE VISUAL in the same turn. Description / code / path / "I generated it" is not proof. Design proof ≠ runtime proof.

**Before modifying Thunder Board, read this file, then the permanent constitution, then the current production source.**

## Authority order (highest first)

1. **Current production source** (HTML/CSS/JS/assets/functions in the deployed package)
2. **`SONS-OF-THUNDER-PRODUCT-CONSTITUTION.md`** (master product law — 2026-08-17)
3. **Repository constitution set** (`APPROVED-ASSET-MANIFEST.md`, `DO-NOT-RESURRECT-REGISTRY.md`, THUNDER-CONSTITUTION, VISUAL-DNA, etc.)
4. **User’s explicit new order** in the active conversation
5. **Conversational memory** (lowest — never reconstruct behavior from chat when source can be verified)

Conversational memory is **input**, not the archive.  
The repository remembers Thunder Board.

## Mandatory read order before code changes

1. `GROK-START-HERE.md` (this file)
2. `VISUAL-PROOF-PROTOCOL.md` (eyes first — if the work is visual, SHOW IT)
3. `SONS-OF-THUNDER-PRODUCT-CONSTITUTION.md`
3. `APPROVED-ASSET-MANIFEST.md` + `DO-NOT-RESURRECT-REGISTRY.md`
4. `THUNDER-CONSTITUTION.md`
5. `THUNDER-VISUAL-DNA.md`
6. `THUNDER-UX-STATE-MACHINE.md`
7. `SECURITY.md` + `THUNDER-SECURITY-GATE.md` (if present)
8. `THUNDER-REGRESSION-LESSONS.md`
9. `THUNDER-ACCEPTANCE-TESTS.md`
10. `SONS_OF_THUNDER_FEATURE_MANIFEST.md` / `PROMPT-LEDGER-48H.md`
11. **Then** open the actual files you will touch

## Absolute asset rule (product law)

If you cannot identify the **exact approved** logo or Thunder source asset → **STOP.** Report `APPROVED ASSET NOT VERIFIED.` Do not AI-redraw, guess, or use “similar” files.

- Official logo canon: `assets/CANONICAL/logo-official-IMG_7697.jpg`
- Official Thunder canon: `assets/CANONICAL/thunder-character-official-IMG_7692.jpg`
- File existence ≠ approval. Mockup ≠ production.

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
