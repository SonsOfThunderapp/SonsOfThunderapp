# SONS OF THUNDER — PRODUCT CONSTITUTION
## Absolute Source-of-Truth / Non-Regression Law

**Status:** PERMANENT  
**Recorded:** 2026-08-17  
**Authority:** Product owner (Obie). Conversational memory does not outrank this file + production source.  
**Naming note:** Source prompt used “Erica”; project owner is **Obie**. Product overrides require **Obie’s** explicit approval.

This is not a suggestion. This is not a temporary prompt. This is not guidance for one ZIP.

These rules survive: new conversations, phone/desktop Grok, future ZIPs, GitHub replacements, Netlify deploys, refactors, optimization passes, future AI models, future developers, future asset additions.

Unless the product owner **explicitly** overrides a protected decision, these rules remain law.

---

## 1. THE TWO MASTER VISUAL ASSETS

### IMAGE 1 — OFFICIAL SONS OF THUNDER LOGO
- **Canonical path:** `assets/CANONICAL/logo-official-IMG_7697.jpg`
- **SHA256:** `e9358789e55c5cc06eabe968d775621b8388a2ee90f7bf7d8adf72b934843593`
- **Source identity:** User-approved IMG_7697 family (white SONS, gold dimensional bolt through O, red OF THUNDER, tagline THUNDER DOESN'T DULL)
- **Status:** CANONICAL

### IMAGE 2 — OFFICIAL THUNDER CHARACTER
- **Canonical path:** `assets/CANONICAL/thunder-character-official-IMG_7692.jpg`
- **SHA256:** `e9aa55a9614ce9cff2d3be797b2f51dec022e3e7f08cb9e99f54bb814c76124b`
- **Source identity:** User-approved IMG_7692 — premium faceted dimensional golden lightning-bolt **head only**, black wayfarer sunglasses **on the bolt**, restrained masculine smirk
- **Status:** CANONICAL
- **Hard bans:** human face, skin, Bond head, torso, arms, legs, tuxedo, full body, emoji/smiley reinterpretation, children’s mascot

Never silently overwrite these files. Never use “close enough” AI redraws as production.

### HEADER MARK — ETERNAL (phone-approved 2026-08-23)

The in-app header is the HD stacked mark: **white SONS + gold 3D bolt + red OF THUNDER**.  
Source: `assets/CANONICAL/logo-print-diecut.png` → `logo@2x` / `@3x` / `@4x`.  
Sticky on every tab. Never crop, hide, stretch, or swap. Law: `HEADER-MARK-LOCK.md`.


---

## 2. ABSOLUTE APPROVED-ASSET RULE

**NEVER** show the product owner an image and **NEVER** put an image into production unless it comes from an approved Sons of Thunder asset **or** a new asset the product owner has **explicitly** approved.

DO NOT: guess, approximate, recreate from memory, substitute, redraw, reinterpret, AI-generate a replacement, grab a similarly named legacy asset, use old Thunder because it exists in `/assets`, use a generic lightning bolt, use an old logo, use a concept mockup as production art.

- FILE EXISTENCE ≠ APPROVAL  
- OLDER ASSET ≠ CANON  
- AI-GENERATED ≠ APPROVED  
- MOCKUP ≠ PRODUCTION ASSET  

If the exact approved source asset cannot be identified: **STOP.** Report `APPROVED ASSET NOT VERIFIED.` Do not improvise.

---

## 3. ASSET PROVENANCE SYSTEM

Maintain `APPROVED-ASSET-MANIFEST.md` permanently.

Statuses: CANONICAL | APPROVED | APPROVED VARIANT | IMPLEMENTATION PENDING | BRIDGE ASSET | LEGACY | SUPERSEDED | DO NOT USE | EXPERIMENTAL | UNVERIFIED

Production may use only appropriate APPROVED / CANONICAL (or explicitly documented BRIDGE) assets.

---

## 4. NO LEGACY RESURRECTION

Old files may remain in Git history. That does **not** give them permission to return.

Before every ZIP/build/deploy, scan HTML, CSS, JS, asset refs, manifest, service worker, precache, dynamic imports, fallbacks, marketing, Concierge, Thunder AI, install, splash, FAB, modals.

A legacy asset surviving in a directory is not permission to render it.

---

## 5. OFFICIAL LOGO PROTECTION

Do not: change words, typography, proportions; recreate with HTML text; replace its bolt; stretch; invent another logo; use obsolete logo art.

**Historical regression law:** NO full rectangular / box glow around the entire logo. Permanently rejected. Bolt-shaped treatment only.

---

## 6. THUNDER CHARACTER CANON

Thunder is: premium, faceted, dimensional, golden, confident, restrained, masculine, cool, brotherly, slightly humorous, private-room, alive.

Thunder is NOT: children’s mascot, emoji, sticker, goofy cartoon, superhero caricature, jacked, mean, hyperactive, cute-kid, rubbery, bouncy, desperate for attention.

Body lock: **floating head only.** Hands only for clear approved gestures. NO full arms, torso, legs, shoes, tuxedo.

---

## 7. SEVEN APPROVED THUNDER STATES

1. LOCKED IN  
2. GOOD CALL  
3. LET'S GO  
4. THINKING  
5. BROTHERHOOD  
6. APPRECIATE THAT  
7. I'M ALL EARS  

Emotional states of **one** Thunder — not permission to redesign Thunder seven times. Where production art is not yet explicitly approved: `APPROVED CANON — IMPLEMENTATION PENDING`. Never fill gaps with invented artwork.

---

## 8–11. MOTION / ORCHESTRA / SHARED PULSE

- Motion may enhance approved art; motion may **never** reinterpret approved art.
- Preferred: subtle living idle, controlled gold-light breathing, restrained glint, micro expression via approved layers, precise one-shot reactions, premium easing.
- Avoid: bouncing, rubber deformation, giant scaling, Ken Burns zooms, constant motion, excessive particles, cartoon springs, uncontrolled shake, cheap GIF loops.
- **Three levels:** Ambient | Acknowledgment | Moment (scarce).
- **One action = one directed experience.** One conductor for sensory feedback.
- **Shared living pulse:** `--tb-breathe` (4s ease-in-out, peak ~50%). No drifting unrelated pulse clocks.

---

## 12–13. EFFECTS + INNOVATION

Investigate what mobile PWAs can **actually** do on iPhone Safari / iPhone PWA / Android Chrome / Android PWA. Progressive enhancement. Never fake platform capabilities (especially iPhone vibration). Source presence ≠ runtime proof.

Innovation only if it improves experience, works on target devices, does not conflict, does not add unjustified weight/failure risk, looks premium, and a brother would care.

---

## 14–18. DIRECTOR / VISUAL PROOF / MOCKUPS / FREEZE-FRAME / TEXT

Inspect as engineer + director + designer + motion + character + a11y + performance + security + QA + product + release guardian + end user.

For meaningful visual changes require: SOURCE + RUNTIME/GEOMETRY + PHONE-SCREEN VISUAL + FUNCTIONAL + REGRESSION proof.

When proving the app: do **not** generate idealized fake versions as if production. Classify: CONCEPT | CURRENT IMPLEMENTATION | PROPOSED CHANGE | PRODUCTION PROOF.

Freeze-frame test for animation: START / 25% / 50% / 75% / END — each must stand as an approved still.

Do not let generative systems redraw functional UI text (names, dates, times, locations, headings, buttons, nav, counts, instructions).

---

## 19–20. CONCIERGE + ENCOURAGEMENT

Concierge: THUNDER → MESSAGE → ACTION. One visual star. Thunder fully visible. Target visible. No status-bar / bottom-nav collision. No target obstruction. No giant Thunder. No darkness stacking. No competing effects.

**Standing Room Law / Visual Proof Constitution:** Mockup → user approval → then code/ZIP. No mockup = no implementation. No approval = no ZIP.

Encouragement: approved 10 short friend-style lines; timing 15s start, 8s visible, 7s quiet; pause on modal/tour/background; never compete with Concierge / Thunder AI / install / hero moments.

---

## 21–26. SECURITY / HOUSEKEEPING / INSTALL / PERFORMANCE / ASSETS / A11Y

- AI is intelligence, not authorization. No service-role in client. RLS protects shared writes. Client PIN = mild UI gate only. Secrets server-side.
- Housekeeping: self-cleaning / self-healing / self-optimizing — **not** self-rewriting production code.
- Version APP_BUILD, SW, caches deliberately. Distinguish disposable cache vs valuable user data.
- Premium ≠ heavy. Watch startup, weight, GPU, timers, battery.
- Lightest format that preserves approved quality.
- prefers-reduced-motion, tap targets, contrast, safe areas.

---

## 27–28. HISTORICAL FAILURES + DO-NOT-RESURRECT

Maintain permanent regression list and explicit DO-NOT-RESURRECT registry. We do not pay twice for the same lesson. Code history is not product authority.

---

## 29–35. PREEMPTIVE FAILURE / HONEST STATUS / PRE-ZIP GATE / ZIP VERIFY / DEPLOY CHAIN / CHANGE CONTROL / GOLDILOCKS

Ask what you are about to miss before saying done.

Statuses: SOURCE VERIFIED | RUNTIME VERIFIED | VISUALLY VERIFIED | DEVICE VERIFIED | LIVE VERIFIED | NOT PROVEN — never collapse into “done.”

Pre-ZIP gate must pass or report NOT PROVEN. Unpack the ZIP and verify contents. Proof chain: SOURCE → PACKAGE → DEPLOYED → APP_BUILD → LIVE VISUAL → DEVICE.

Do not quietly change product DNA during bugfix/cleanup/refactor. Material changes require stop + explain + wait.

Goldilocks: power/simplicity, motion/restraint, technology/humanity, premium/fast, AI/authority, brotherhood/social noise, character/gimmick.

---

## 36. FINAL PRODUCT LAW

Sons of Thunder is one orchestrated experience — not a collection of features. Protect the whole.

---

## 37–38. RECORDING + PROOF

This file is the master product constitution. Reconcile into SOURCE-OF-TRUTH, THUNDER-CONSTITUTION, THUNDER-VISUAL-DNA, APPROVED-ASSET-MANIFEST, DO-NOT-RESURRECT-REGISTRY, THUNDER-REGRESSION-LESSONS, GROK-START-HERE, PRE-ZIP gates. Do not create competing contradictory constitutions.

**Absolute final rule:** If unsure which image, Thunder, logo, effect, motion, feature, or decision was approved: DO NOT GUESS. TRACE THE APPROVED SOURCE. If you cannot prove it: NOT PROVEN. ASK BEFORE CHANGING IT.

THE APPROVED ASSET IS THE ASSET.  
THE APPROVED EXPERIENCE IS THE EXPERIENCE.  
THE SOURCE MUST MATCH THE PROMISE.  
THE ZIP MUST MATCH THE SOURCE.  
THE DEPLOYMENT MUST MATCH THE ZIP.  
THE PHONE MUST PROVE THE DEPLOYMENT.
