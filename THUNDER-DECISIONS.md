# Thunder Board Decisions Log

## 2026-08-16 — Living interface (alive1)

### Decision
Implement: Gathering-day transform (hardened), Personal Home (smaller), Actionable Thunder AI (smaller).
Defer: Deterministic history/milestones. Soft-touch only for “new since visit” (existing announcement seen map).

### Reason
Makes the app feel timely and personal without social-feed creep or engagement addiction.

### Source of truth
- Meeting phase: `meetingMondayOf` + `getNextMeetingMonday` + config time/venue
- Name: explicit brother profile tied to `myProfileId` only
- Thunder actions: existing DOM handlers (reminder, text leader, showView, rsvp)

### Rejected alternatives
- Recommendation / ranking engines
- Wrong-name greetings from stale storage
- AI-executed privileged mutations
- FOMO unread totals and RSS-as-unread
- Milestone nostalgia Push

### Revisit when
- Shared RSVP exists across devices
- Shared memory history is complete enough for honest milestones


## 2026-08-16 — Install Concierge (install1)

### Decision
Central `getInstallState()`: INSTALLED | IN_APP_BROWSER | ANDROID_NATIVE | IPHONE_SAFARI | GENERIC.
- Installed → no install tutorial; only GET A BROTHER share.
- In-app (FB/IG) → one-session gate + Open in Safari/Chrome.
- Android native prompt when beforeinstallprompt exists.
- iPhone → Share → Add to Home Screen overlay; never fake install complete.
- One-time YOU'RE IN toast when standalone first detected.

### Rejected
Bypass iOS install; experimental Web Install API as required path; stacking push + install on first paint.


## 2026-08-16 — Permanent Install Concierge (concierge1)
- Progressive iOS coach: one instruction at a time + I DON’T SEE IT alternate layout
- Rescue progress: ARRIVED → WRONG_BROWSER → READY_TO_INSTALL → INSTALL_ATTEMPTED → RETURNED_NOT_INSTALLED → INSTALLED
- Never marks INSTALLED without standalone / appinstalled
- STILL WITH YOU on return without install
- Deferred: experimental Web Install API, analytics SDK


## 2026-08-16 — Install Concierge Choreography (choreo1)
- Primary CTA owns the screen; secondary quieter
- 100–150ms press feedback; coach step settle ~140ms
- Progress dots (not “step 1 of 3”)
- Anticipatory copy before OS prompts
- YOU’RE IN success toast + confirm haptic once
- Clarity > speed > delight; no new libraries


## 2026-08-16 — Product Tour (tour1)
- Versioned first-run coach marks over REAL UI (thunderTourV1)
- Sequence: Home → Gathering → I’M IN → Brothers → Events → Ask Thunder → The Code → Alerts
- Follow the Bolt language; skip + REPLAY APP TOUR on More
- Coordinates after welcome; never blocks app if targets missing
- No slideshow, no fake data, no auto push permission


## 2026-08-16 — I’m In Thunder Commitment (imin1)
- Signature commit: press → lock → strike → YOU’RE IN ⚡ (reduced-motion = clean state only)
- RSVP remains device-local storage truth; never success on save failure
- Calendar: RFC5545 .ics from getNextMeetingMonday + venue/time; OS Add required
- Never claim “added to calendar”; sheet + ADD TO CALENDAR fallback
- Un-commit is calm; reminds user to edit native calendar themselves


## 2026-08-16 — ThunderFX cross-platform effects (tfx1)

### Capability matrix (authoritative for this release)
| Feature | iPhone Safari | iPhone PWA | Android Chrome | Android PWA | Desktop | Fallback |
|---------|---------------|------------|----------------|-------------|---------|----------|
| navigator.vibrate | NOT SUPPORTED (WebKit oppose) | NOT SUPPORTED | SUPPORTED | SUPPORTED | Rare/none | Visual only |
| press scale / spring | YES | YES | YES | YES | YES | — |
| glow / bolt pulse | YES | YES | YES | YES | YES | — |
| rsvpLockPulse / commit-strike | YES | YES | YES | YES | YES | reduced-motion off |
| Sound autoplay | REJECTED for ambient | same | same | same | same | silent by design |

### Architecture
- `ThunderFX` orchestrates experience recipes; `tbFeedback` remains the tactile adapter.
- No iOS vibrate hacks (checkbox/switch). Optional-call safe vibrate only when `typeof === 'function'`.
- STATE > EFFECT: lockedIn/success only after real save success.
- Anti-spam: debounce inside tbFeedback + once-keys for installComplete/tourComplete.

### Recipes shipped
- tap, select, lockedIn (I'm In signature), success, warning, installComplete, tourComplete
- I'm In path uses ThunderFX.lockedIn; iPhone gets tfx-ios-boost visual weight

### Rejected
- Continuous vibration, ambient buzz, sound on launch/tour, Level-4 hero spam, animation frameworks


## 2026-08-16 — Effect conflict forensic (tfx2)

### Failures found
1. **Dual `animation` on I’m In button** — `lock-pulse` + `commit-strike` both set `animation`. CSS allows only one; later rule won → lock-pulse never played (effect “cut off”).
2. **`tbGlowHit` on same node** — also sets `animation` → could wipe commit-strike mid-sequence.
3. **`tb-press` + `transform: scale() !important`** — capture-phase sensory delegation + handler press left tb-press on the button; !important blocked keyframe transforms for ~140ms (and longer if timers stacked).
4. **Double press** — delegation (capture) + handler both called `tbFeedback.press` on RSVP.

### Fixes
- ThunderFX.lockedIn: **only** `commit-strike`; strip `tb-press` / glow classes first; glow **card** only.
- Sensory delegation: **exclude** `#rsvp-btn` / `.btn-rsvp`.
- I’m In handler: selection haptic only (no tb-press class) before save.
- CSS: commit-strike wins over tb-press and residual glow classes.

### Law
One primary motion property owner per element per moment. No stacked animation names on the same node unless combined in one @keyframes.


## 2026-08-16 — Signature heroes (hero1)

### PROFILE → THUNDER FIREWORKS
- Trigger: `rewardSaveSuccess('profile')` only after save path completed (local + optional Supabase pushBrother).
- Never on Save tap alone, never on failure, never on memory (memory stays ordinary success).
- `ThunderFX.profileComplete` → canvas electrical gold fireworks ~1.1s + Android vibrate [14,40,14,40,30].
- Copy remains existing SAVE_REWARD: PROFILE LOCKED IN.
- Reduced-motion: soft gold veil, no particles.

### COLD LAUNCH → THUNDER LASER IGNITION
- Trigger: `runSplash` only when `tb_splash_done` is not set (session cold open).
- Ordinary resume / same-session return: splash skipped → no laser.
- `ThunderFX.appIgnition` once per session key.
- CSS laser streaks → core ignition; Android short tactile on impacts; iPhone visual-only.
- Does not block splash finish / Home.

### Hierarchy
touch < success < I'm In < **Fireworks / Laser**

### Rejected
Rainbow confetti, video/GIF heroes, Three.js, vibration hacks on iOS, laser on every resume.


## 2026-08-16 — Thunder Voice Architecture (voice1)

### Capability matrix (documentation-verified)
| Feature | iPhone Safari/PWA | Android Chrome/PWA | Desktop | Notes |
|---------|-------------------|--------------------|---------|-------|
| SpeechRecognition (tap-to-talk) | PARTIAL/SUPPORTED (WebKit) | SUPPORTED | Chrome/Edge yes; Firefox no | User gesture; may use vendor cloud STT |
| Continuous foreground wake | UNRELIABLE / PARTIAL | PARTIAL | PARTIAL | Opt-in only; stop on hide |
| System-wide "Hey Thunder" | NOT SUPPORTED | NOT SUPPORTED | NOT SUPPORTED | Cannot replace Siri/Google |
| Deep link `?ask=1&voice=1` | USEFUL (Safari/Shortcuts open URL) | USEFUL | USEFUL | Canonical voice entry |
| Manifest shortcuts | NOT SUPPORTED on iOS | SUPPORTED (Chrome) | SUPPORTED | Ask Thunder shortcut added |
| Native shell | FUTURE | FUTURE | — | Only if OS intents justify cost |

### Implemented NOW
- ThunderVoice router (openAsk, handleDeepLink, wake opt-in, lifecycle stop)
- Canonical route: `/?ask=1&voice=1`
- Manifest shortcuts: Ask Thunder, Next Gathering
- Human error copy for speech errors
- Mic stops on background / modal close

### Deferred
- Capacitor/native shell, App Intents, true system wake phrase, TTS spoken answers default-on

### Rejected
- Always-on background mic, unsupported Safari hacks, silent recording


## 2026-08-16 — Tap Thunder audit + durable /tap routing (tap1)

### Platform matrix (research)
| Capability | iPhone | Android | Native required? | Verdict |
|------------|--------|---------|------------------|---------|
| NDEF HTTPS URL on tag → OS opens browser/PWA | YES (notification → open) | YES | No | **BRILLIANT** core path |
| Web NFC in page | NO | Chrome only, gesture | — | **MARGINAL** — not used |
| Phone-to-phone NameDrop clone | NOT for 3rd parties in PWA | Limited | Yes for real parity | **REJECT** as product path |
| Check-in as authority from tag | — | — | Would need auth | **REJECT** silent check-in |

### Top opportunities ranked (summary)
1. **Durable /tap/* URLs** — infrastructure for all physical objects (IMPLEMENT)
2. **Tap → Ask Thunder** — same intelligence doorway (IMPLEMENT via /tap/ask)
3. **Tap → gathering Home** — ritual arrival surface, not fake attendance (IMPLEMENT SMALLER)
4. **Tap → install** — in-person onboarding equals QR power (IMPLEMENT)
5. Silent NFC check-in as I’m In — REJECT without shared truth + consent
6. Phone-to-phone NFC connect — REJECT / FUTURE NATIVE
7. Merchandise with no function — REJECT

### Three extra ideas (high signal)
- **Table bolt at Crooked Can** → `/tap/gathering` only on first Monday energy (same URL year-round; app knows date)
- **Welcome packet card** → `/tap/install` for new brothers at diaper parties / first night
- **Leader challenge coin** → still only public `/tap/ask` or `/tap/gathering` — never admin powers on the tag

### Security
Tag = public URL. No leadership, no RLS bypass, no push, no delete.


## 2026-08-16 — Integration conflict audit (tap1 → coherence)

### BUILD
APP_BUILD at audit: 20260816-tap1 (+ surgical coherence patches)

### CONFIRMED CONFLICTS FIXED
1. **Deep-link dual open** — ThunderTap + ThunderVoice could both schedule Ask Thunder.
   Fix: `window.__tbRouteOwned = 'tap'` on Tap route; Voice `handleDeepLink` no-ops if claimed.
2. **Double mic start** — openAsk called twice while listening.
   Fix: openAsk returns early if modal open + thunderListening; delayed start checks again.

### INVESTIGATED AND CLEARED
- **Laser vs resume:** gated by `tb_splash_done` sessionStorage + in-memory `onceKey('appIgnitionSession')`. visibilitychange does not call appIgnition.
- **Fireworks vs ordinary success:** profile only via profileComplete; memory uses success.
- **I'm In transform fight:** prior tfx2 fix (commit-strike sole animation; no tb-press on RSVP).
- **Housekeeping visibility:** only refreshes alerts UI + soft auth getSession — does not launch effects.
- **5× visibilitychange:** distinct owners (auth, body unlock path, voice stop/wake, housekeeping, other) — no shared mutation of splash/laser.

### OWNERSHIP MAP (one moment → one owner)
| Moment | Owner |
|--------|--------|
| Cold splash + laser | `runSplash` → `ThunderFX.appIgnition` |
| Deep link / NFC URL | `ThunderTap` first, else `ThunderVoice.handleDeepLink` |
| Ask Thunder open | `ThunderVoice.openAsk` |
| Mic recognition | single `thunderRecognition` / wakeRec exclusive |
| I'm In success motion | `ThunderFX.lockedIn` |
| Profile hero | `ThunderFX.profileComplete` |
| Meeting date | canonical meeting engine in config/helpers |
| Housekeeping on resume | `setupHousekeeping` Governor only |

### VISUAL DNA
No CSS cascade change in this pass. Protected pulses/glows left intact.

### STILL REQUIRES DEVICE TEST
- Real iPhone NFC NDEF URL → /tap/ask
- Hey Thunder continuous wake reliability on Android vs iOS
- Double-open Ask Thunder on slow devices


## 2026-08-16 — FINAL LOCKED PACKAGE
- APP_BUILD set to `20260816-LOCKED`
- SOURCE-OF-TRUTH.md written as permanent inventory
- Includes: core app + meeting engine + I’m In + announcements + RSS activities + Brothers/QR + Memories + Thunder AI hybrid + ThunderFX + Profile Fireworks + Laser Ignition + ThunderVoice (Hey Thunder opt-in) + ThunderTap `/tap/*` + manifest shortcuts + Housekeeping Governor + push alerts + Supabase paths + install/PWA + integration ownership fixes (cohere1)
- No new features in this packaging pass — freeze only


## 2026-08-16 — Housekeeping Manager run (LOCKED surface)

### Read
SOURCE-OF-TRUTH.md · THUNDER-CONSTITUTION.md · THUNDER-DECISIONS.md · actual source

### Hard fails
- Logo box: kill switch present; **moved to absolute end of styles.css** so later CSS cannot win
- Secrets: service_role / VAPID_PRIVATE only in “never put here” comments; no real private keys in client
- LEADER_PIN: mild client gate only (`thunder-board-lead`) — documented, not server authority
- Meeting engine: `meetingMondayOf` + Labor/Memorial → second Monday; post-meeting rollover OK
- Netlify: root index.html, public npm registry, functions present

### Collisions
- ThunderTap before ThunderVoice; `__tbRouteOwned` present
- openAsk idempotent; laser gated by splash session + onceKey
- 5× visibilitychange: separate owners, no laser/onboarding restart
- All SOT systems present in app.js

### Fixed
1. CSS logo kill switch appended as absolute final cascade rules

### Refused
- No feature adds/strips
- No LEADER_PIN “fake security” redesign
- No system-wide Hey Thunder / silent NFC authority claims
