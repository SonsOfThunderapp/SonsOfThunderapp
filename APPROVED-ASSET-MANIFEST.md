# APPROVED ASSET MANIFEST
**Permanent.** Production may use only CANONICAL / APPROVED / documented BRIDGE assets.  
**Updated:** 2026-08-17

## Status legend
CANONICAL · APPROVED · APPROVED VARIANT · IMPLEMENTATION PENDING · BRIDGE ASSET · LEGACY · SUPERSEDED · DO NOT USE · EXPERIMENTAL · UNVERIFIED

---

## CANONICAL (master identity)

| ID | Filename | Purpose | Version | Notes |
|----|----------|---------|---------|-------|
| LOGO-MASTER-7697 | `assets/CANONICAL/logo-official-IMG_7697.jpg` | Official wordmark + tagline | 2026-08-17 | SHA256 e9358789… Never overwrite. |
| THUNDER-MASTER-7692 | `assets/CANONICAL/thunder-character-official-IMG_7692.jpg` | Official Thunder character | 2026-08-17 | SHA256 e9aa55a9… Head only + wayfarers + restrained smirk. |

Also mirrored under `/home/workdir/artifacts/sot-logo-official/` for non-deploy archival.

---

## APPROVED / PRODUCTION IN CURRENT DEPLOY PACKAGE

| ID | Filename | Purpose | Status |
|----|----------|---------|--------|
| LOGO-HEADER | `assets/logo@2x.png`, `assets/logo@3x.png`, `assets/logo.png` | In-app header wordmark | APPROVED (must remain consistent with 7697 DNA) |
| LOGO-ABOUT | `assets/logo-about.png` | About / More mark | APPROVED if matches DNA |
| ICON-OFFICIAL | `assets/icon-official.png` | PWA / home screen icon | APPROVED |
| BOLT-ONLY | `assets/bolt-only.png` | Welcome bolt, tour host bridge, pulse marks | **BRIDGE ASSET** — mark energy, not full character face |
| BOLT-FOR-QR | `assets/bolt-for-qr.png` | QR center | APPROVED for QR quiet-zone |
| BOLT-OVERLAY | `assets/bolt-overlay.png` / logo-bolt-pulse | Header bolt-region pulse only | APPROVED for bolt-shaped overlay only |
| INSTALL-EXPLAINER | `assets/install-explainer.mp4` | CapCut VO install | APPROVED when present |
| INSTALL-POSTER | `assets/install-poster.jpg` | Install card poster | APPROVED when present |

---

## IMPLEMENTATION PENDING

| ID | Purpose | Status |
|----|---------|--------|
| THUNDER-COOL-PROD | Production PNG of IMG_7692 for FAB / Concierge / Ask hero | CANONICAL source exists; **production deploy package currently missing `thunder-cool.png` family** |
| THUNDER-SEVEN-STATES | LOCKED IN / GOOD CALL / LET'S GO / THINKING / BROTHERHOOD / APPRECIATE THAT / I'M ALL EARS art | APPROVED CANON — IMPLEMENTATION PENDING (do not invent) |

---

## DO NOT USE / SUPERSEDED

| ID | Filename / pattern | Status | Reason |
|----|-------------------|--------|--------|
| BOND-HERO | `assets/thunder-bond-hero.png` | DO NOT USE | 0-byte file in deploy; Bond/human-face direction **rejected** |
| BOND-FAMILY | any Bond head / tuxedo / human-face Thunder | DO NOT USE | Character lock |
| EMOJI-BOLT | emoji ⚡ as brand mark | DO NOT USE | Welcome/tour must use bolt asset |
| FULL-BOX-LOGO-GLOW | rectangular glow/filter on wordmark bounds | DO NOT USE | Permanent visual hard fail |
| FULL-BODY-THUNDER | torso, legs, arms, shoes | DO NOT USE | Body lock |
| AI-REDRAW-LOGO | any AI recreation of wordmark | DO NOT USE | Use official asset only |
| AI-REDRAW-THUNDER | any AI “close enough” character | DO NOT USE | Trace IMG_7692 only |

---

## Provenance rule
If a file is on disk but not listed here as CANONICAL / APPROVED / BRIDGE: treat as **UNVERIFIED**. Do not ship it to production UI without explicit approval.
