# THUNDER BOARD — EFFECTS & MOTION CONSTITUTION
## Permanent motion law (under Master Constitution)

**Status:** Permanent product law  
**Parent:** `SONS-OF-THUNDER-MASTER-CONSTITUTION.md`  
**Companion:** `THUNDER-VISUAL-DNA.md`, `PULSE-DNA-LOCK.md`, `MOTION_HAPTICS_SPEC.md`

> USE THE BEST EFFECT · AT THE BEST MOMENT · AT THE LOWEST NECESSARY INTENSITY · WITH ZERO COMPETING CHOREOGRAPHY.

This document is **not** permission to add more animation everywhere.  
It is the permanent filter for what may stay, what may be added, and what must never return.

---

## 1. ThunderFX conductor (required mental model)

All motion lives in **layers**. Only the owning layer gets the stage.

| Layer | Owns | Examples |
|--------|------|----------|
| **AMBIENT** | Quiet life when nothing is focused | `--tb-breathe` pulse, Thunder living-idle |
| **INTERACTION** | Finger acknowledgment | Press, compression/rebound, selection tick |
| **FOCUS** | One experience is the star | Concierge, modal, Ask Thunder |
| **MOMENT** | Rare meaningful success | I’m In lock, profile save reward |
| **TRANSITION** | Spatial continuity between views | Tab change, card → detail (future View Transitions only if approved) |

**When FOCUS owns the stage:** suppress competing AMBIENT (pause title/name pulses if they fight the spotlight).  
**When MOMENT owns the stage:** one primary + one support + optional supported physical feedback — no pile-on.

### Effects budget (hard)
At any instant:

1. **One primary motion**  
2. **+ one supporting effect**  
3. **+ optional physical feedback** (only if the platform actually supports it)

Exceed only with an explicit documented reason.

---

## 2. Approved effect families (12)

| # | Family | Strength | Default use |
|---|--------|----------|-------------|
| 1 | Living Gold Pulse | Ambient | Header bolt, labels, brother names, event dates, THE CODE, SHARE CONTACT — **one clock: `--tb-breathe`** |
| 2 | Thunder Living Idle | Ambient | FAB / off-stage character only |
| 3 | Physical Press | Micro | Primary buttons (critical on iPhone) |
| 4 | Light compression + rebound | Micro | CTA taps — restrained, not rubbery |
| 5 | Gold energy sweep | Medium | Important success only (optional; must not stack with full flash) |
| 6 | Thunder semantic reactions | Medium | Meaningful success only — via ThunderFX / character state, not random |
| 7 | View Transitions | Medium | **Candidate** — Brother→Profile, Memory→viewer, FAB→Ask, nav where spatial continuity helps. Not everywhere. |
| 8 | Shared-element morph | Medium | **Candidate** — same as above; requires support check + visual proof |
| 9 | Spotlight / focus isolation | Strong | Concierge only |
| 10 | Scroll-driven reveal | Low | **Sparingly** if at all — 4–10px + opacity, never presentation mode |
| 11 | Short electric accent | Strong | I’m In / Thunder wake / rare milestone — **100–250ms**, never constant |
| 12 | Cinematic wake | Signature | Cold open / Thunder AI activate — visual first; Android vibrate second |

Families 7, 8, 10 are **not auto-ship**. They require inspect → platform matrix → visual proof → director approval → implement.

---

## 3. Signature choreography (protected intent)

### I’M IN
PRESS → confirm success → short gold/electric accent → Thunder LET’S GO (one-shot) → locked-in settle → ambient resumes.  
Android: supported vibrate accent. iPhone: stronger **visual** tactility only. **Never fake vibration.**

### THUNDER AI WAKE
Activate → Thunder notices → edge wake → focus shift → I’M ALL EARS → thinking → answer → ack → settle.  
Character system owns this — not full-screen lasers every time.

### CONCIERGE
Focus mode → environment dims → target stays clear → Thunder enters → dialogue → target acknowledges → next scene.  
**Pause ambient competition during Concierge.**

---

## 4. Forbidden / remove-on-sight (unless explicitly re-approved)

- Ken Burns whole-screen zoom on UI or explainer transitions  
- Generic bounce / rubbery spring (except microscopic press)  
- Multiple independent ambient pulse clocks  
- Full-box / rectangular glow on logo or icon bounds  
- Fake iPhone haptic claims  
- Constant Thunder loops (idle must be behavioral + irregular micro-actions)  
- Confetti / particle spam  
- Screen shake  
- Excessive parallax  
- Long UI transitions (most UI **150–400ms**; character moments may breathe longer)  
- Everything pulsing at once  

Do **not** delete an existing approved effect solely because it appears on a review list — determine purpose first; replace with superior behavior when needed.

---

## 5. Platform honesty

| Platform | Physical vibrate | Visual tactility |
|----------|------------------|------------------|
| iPhone Safari / iPhone PWA | **Not dependable** — do not design around it | Required product |
| Android Chrome / Android PWA | Optional progressive enhancement | Required |
| Desktop | Usually none | Required |

`navigator.vibrate` is feature-detected only. Never UA-sniff. Never claim success when the API is missing.

---

## 6. Reduced motion

`prefers-reduced-motion: reduce` is a **coherent mode**, not random kills:

- Preserve hierarchy, state feedback, success confirmation, Thunder’s semantic meaning  
- Eliminate unnecessary movement (ambient loops → static; travel → fade or instant)  
- One-shot success can remain as a single opacity/glow settle if it communicates outcome  

---

## 7. Performance

Prefer compositor-friendly: `transform`, `opacity`, native WAAPI / CSS where appropriate.  
Avoid layout-thrashing animation.  
No heavy animation library unless value clearly exceeds weight.

---

## 8. Implementation gate (mandatory)

For any **new** or **replacement** medium/signature effect:

1. Inventory current owners in source  
2. Platform support matrix (real docs, not assumptions)  
3. Conflict map (what else fires at the same time)  
4. Visual proof: REST → ACTION → PEAK → SETTLE at phone scale  
5. Director / user approval  
6. Smallest implement  
7. Reduced-motion path  
8. Regression: pulse DNA, I’m In, Concierge, header bolt, character, preflight, security  

**NO ZIP that claims a new effects family without that gate.**

---

## 9. Current production baseline (inventory snapshot)

**KEEP (source-verified as of constitution1 era):**

- Shared `--tb-breathe` / `boltLive` ambient pulse  
- Header bolt overlay pulse (bolt-shaped only)  
- Brother name pulse, CODE title glow, event date treatment, info labels  
- `tb-press` / `tbFeedback` visual-first + optional Android vibrate  
- `rsvpLockPulse` / locked-in settle (single animation owner on button — do not stack competing `animation` on same node)  
- Thunder living-idle + character states  
- Concierge spotlight intent  
- SAVE_REWARD one-shot  
- `prefers-reduced-motion` kills on ambient loops  

**CONFLICTS TO GUARD:**

- Multiple classes setting `animation` on the same node (last wins — already documented in I’m In path)  
- Ambient pulse competing with Concierge focus  
- Transform on alignment wrappers fighting pulse scale  

**NOT YET IN SOURCE as full systems (candidates only):**

- Document View Transitions for card→detail  
- Gold energy sweep as a formal recipe  
- Scroll-driven reveals  

---

## 10. Relationship to other locks

| Doc | Role |
|-----|------|
| Master Constitution | How Grok works; overall reign |
| This file | What motion is allowed and how it is conducted |
| PULSE-DNA-LOCK | Exact elements on `--tb-breathe` |
| MOTION_HAPTICS_SPEC | Haptic/visual feedback API detail |
| Visual DNA | Brand colors, bolt, typography |

---

## Permanent command

Quiet most of the time.  
When I’m In, Thunder AI, or Concierge fires — make it count.  
One conductor. One budget. Platform honesty. No Vegas.
