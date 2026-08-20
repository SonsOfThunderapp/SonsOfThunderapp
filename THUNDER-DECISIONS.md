# Thunder Board Decisions Log

## 2026-08-20 — ROOM CUT 1.0 (locked)

### Decision
Member-facing product: the app supports the brotherhood; it doesn’t compete with it.

1. Home poster: logo → next gathering date/time → I’M IN. Announcements only when real.
2. First run: splash → Home. Tour only from More → TAKE THE TOUR.
3. Thunder present, quiet. Ask on tap. No unsolicited bubbles. Mute remains.
4. Brothers / Memories: real people and real shots only. Dignified empty states.
5. Leadership is infrastructure. Hidden from member nav (7 taps on header logo). PIN tools unchanged.

FREEZE — hide, do not delete: raffle, Axum, FOMO count, I’M HERE.

`TB_CONFIG.ROOM_CUT = '1.0'`

### Revisit
Not until Obie names the next version. Do not pile features onto 1.0.

## 2026-08-20 — SPOTLIGHT LAW (locked)


### Decision
The highlighted thing is the star. Everything else is shadow.

1. Spotlight the feature (logo, I’M IN, faces, memories, CTA). Full brightness. Front layer. Never covered.
2. Dim the rest of the stage to ~40% — shadow, not gone.
3. Word bubble is SUPPORTING. Above, below, or beside — with a gap. NEVER on text, CTAs, faces, or the logo.
4. Thunder never covers the spotlight or the bubble.
5. If bubble and feature collide, MOVE THE BUBBLE. Do not shrink the feature.
6. One-second test: What is highlighted? Can I read every word on it? If no = fail.

Forbidden: bubble on OF THUNDER, I’M IN, brother faces, DROP A SHOT, or any live label.

`TB_CONFIG.SPOTLIGHT_LAW = true`. Tour CSS: bubble stacks above the phone mock, never `position:absolute` on the feature.

### Revisit
Never, unless Obie explicitly reopens it.

## 2026-08-20 — Thunder bubble library / 90-day refresh

### Decision
Backstage Thunder speaks from `FAB_BUBBLES` in `js/app.js`. Shuffle the full deck. No repeat until empty. ~90 seconds apart. 8s hold. First line ~20s.

Unsigned brothers: ~45% of bubbles are **sign-in benefit** lines (`SIGN_IN_LINES`). Signed-in: those lines stay off. Reward, never nag.

Three families only:
1. **Locked 10 encouragement** — never rewrite unless Obie reopens.
2. **Feature rewards** — clever, never nag. Reward the brother. Don’t sell the app.
3. **Nuggets** — short guy-facts. Sports, music, entertainment, building, tools, cars, cigars, fishing, history, space, food. Word economy. Thunder voice.

Jokes that try too hard: rejected.

### 90-DAY REFRESH PROMPT (paste this)

```
THUNDER BUBBLE REFRESH — 90 day.

Read js/app.js FAB_BUBBLES, js/config.js, THUNDER-DECISIONS.md.

Do not touch the locked 10 encouragement lines.

Refresh two packs only:

A) FEATURE REWARDS (8–12 lines)
Reward the brother for using the room. Never “open the app.” Never FOMO. Never daily-verse. Thunder voice: Bond + best friend. Wise, sexy, smooth. Least words.
Cover: Memories (drop a night), Text a leader, Ask Thunder (he answers anything), I’m In / lock the seat, Brothers (you’re not solo).
Tone = after he already belongs. “That’s how the room remembers.” Not “don’t forget to upload.”

B) NUGGETS (add 40–60 new, retire any that feel quiz-show or already burned)
Categories: sports, country/music, movies/TV, building/tools, trucks/cars, cigars, fishing/outdoors, military/history, space, food.
Rules: 6–14 words. Periods, not setups. No “Did you know.” No dad jokes. No church words. True, or don’t ship.
Keep the best current nuggets. Cut duds. Total nugget pile ~80–120. Quality over a thousand.

Keep shuffle + 90s gap + 8s hold. Bump APP_BUILD. Deploy.

Show Obie: the new feature lines, and 10 sample new nuggets. Don’t dump the whole deck in chat.
```

### Revisit
Every 90 days, or when Obie says refresh.

---


## 2026-08-20 — Tour slides 2 / 3 / 4 APPROVED

### Decision
Lock tour slides 2, 3, and 4. Do not restyle, rewrite copy, or swap assets unless Obie reopens them.

- **2 LOCKED IN** — I'm In card, Crooked Can, tap-to-lock
- **3 BROTHERS** — personality grid is the show (no guide). Faces move before the bubble types. 74px heads, no boxes
- **4 MEMORIES** — larger tiles. Scenes: patio / fire pit / lake (`assets/tour-memories/mem-*.jpg`)

### Reason
Device-approved. Further "improvements" on these three burn the same credits as logo drift.

### Revisit when
Obie explicitly reopens a numbered slide.

---


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


## 2026-08-16 — Product tour auto-start suppressed
- **Fail:** “FOLLOW THE BOLT” coach marks covered Home / I’M IN and looked corporate.
- **Fix:** `maybeStartProductTour` no longer starts the tour; marks tour complete/suppressed.
- Replay remains on More only.
- APP_BUILD → `20260816-LOCKED2`


## 2026-08-16 — Visual DNA restore (LOCKED3)
Root cause: header bolt pulse was killed with rectangular `.logo-bolt-glimmer` (box bug). Other pulses existed but event dates used weak boltLive opacity; About logo had padding-top 8px without safe-area when main header hidden.
Fixes:
1. `header-bolt-live` uses `bolt-only.png` + boltLive (rectangle stays dead)
2. codeTitleGlow forced for THE CODE
3. brotherNamePulse intensified
4. eventDateGlow / eventDayGlow intense yellow bloom
5. about-container padding-top: max(28px, 12px + safe-area-inset-top)


## 2026-08-16 — Splash lasers removed (LOCKED4)
- Removed laser streak / core DOM from cold splash (`runThunderLaserIgnition` is haptic-only).
- Kept: splash CSS settle/zoom, identity line, `tbFeedback.thunderImpact`, Android vibrate pattern.
- Profile fireworks unchanged.


## 2026-08-16 — Header bolt overlay alignment (LOCKED5)
- Measured bolt bbox on `logo@2x.png` (556×248): x 28.8–46.0%, y 5.2–91.9%.
- `.header-bolt-live` repositioned to that box (`width: 17.3%`, `height: 86.7%`, `object-fit: contain`).
- Glow sits on the real wordmark bolt, not a guessed 36%/8% offset.


## 2026-08-16 — Tour host = character (accepted, not yet coded)
- **Accepted:** Product tour led by Thunder character (Cool family), not plain bolt-only.
- **Accepted:** Ask Thunder Bond hero much larger.
- **Parked code:** Wait for explicit go. Ledger TC01–TC05.

## Thunder character unity (locked 2026-08-16)

Thunder is the single official mascot and concierge character. The concierge lightning bolt must always use the authoritative Thunder character (sunglasses bolt assets: thunder-cool / smile variants). Whenever Thunder is visible but not actively performing, he uses a subtle living-idle animation. Active concierge behavior and idle behavior are coordinated through one state system (`hidden | entering | idle | speaking | guiding | reacting | exiting`) and must never conflict.

- No generic concierge bolt competing with Thunder.
- Encouragement bubbles (10 exact lines, 15s cycle) pause during guiding; living-idle pauses during speaking/guiding.
- Future ZIPs may not silently restore a generic bolt, freeze idle, or allow overlapping bubbles/states.

## Install explainer + HOW (locked 2026-08-16)

- Asset: assets/install-explainer.mp4 (CapCut VO, H.264, playsinline, loop, no native chrome)
- Poster: assets/install-poster.jpg
- More page: PUT IT ON YOUR HOME SCREEN card — INSTALL + HOW + poster play
- HOW / poster open #install-modal and play with audio (muted fallback + tap if blocked)
- Must ship in every production ZIP; never strip explainer from installed state

## Header logo — clean wordmark (locked 2026-08-16)
- Use clean high-def Sons of Thunder wordmark: white SONS, yellow bolt **without** white outline stroke, red OF THUNDER, transparent on pure black.
- Assets: assets/logo@2x.png, logo@3x.png, logo.png (from clean master).
- Keep pulsing/glowing overlay on the bolt only (`.header-bolt-live` / bolt-only pulse). Never restore rectangular `.logo-bolt-glimmer` full-box effect.
- Do not swap back to outlined-bolt wordmark without explicit user order.

## SUPERSESSION — 2026-08-17 Product Constitution
- **Bond / human-face / tuxedo Thunder = DO NOT USE** (canonical Thunder = IMG_7692 geometric bolt head + wayfarers + restrained smirk only).
- Older decision lines that “Accepted Bond hero” are **SUPERSEDED** by `SONS-OF-THUNDER-PRODUCT-CONSTITUTION.md` + `DO-NOT-RESURRECT-REGISTRY.md`.
- Tour host and Ask hero must use official 7692-family character art once production PNGs are approved and wired — not Bond, not AI approximate.
- Until production cool/character PNGs are present in the deploy package, tour may use bolt-only as BRIDGE mark only — report IMPLEMENTATION PENDING, do not invent art.


## 2026-08-17 — I'm In → Calendar lock
- Single gathering ICS from meeting engine (`getNextMeetingMonday` + MEETING_TIME + venue).
- Title: Sons of Thunder — Next Gathering.
- VALARMs: -P7D, -P1D, -PT2H (require OS Save).
- Never claim calendar saved; copy = opened / hit Save.
- Home reminder control consolidated to same `launchGatheringCalendar()` — no second ICS engine.
- Gathering Alerts Web Push remains announcement channel (no duplicate meeting cron in this pass).


## 2026-08-17 — P1 repair (post bad-build gate)
- Hey Thunder continuous wake: RETIRED. setWakeEnabled forced off; startWakeLoop no-op; chip hidden DOM+CSS; tb_hey_thunder cleared.
- Tour host image: assets/thunder-cool.png (official cool bolt), not alternate/Bond.
- thunder-bond-hero.png moved to assets/.rejected/ — do not resurrect as runtime fallback.


## 2026-08-18 — Cinematic motion language (tour) LOCKED
- File: THUNDER-CINEMATIC-MOTION-LANGUAGE.md (eternity)
- Principle: Thunder speaks → one feature wakes → eye moves there → responds → settles → continue
- One dominant motion at a time; Thunder stays put after short entrance (150–250ms)
- Electric transitions 300–400ms; no Ken Burns / full-screen zoom / bounce travel
- Scene 7 only: one synchronized final heartbeat on YOU ARE READY / LET US GO
- Vocabulary: electric trace, focus falloff, living idle, type-out emphasis, feature ack, depth shift, electrified progress
- Cross-refs: MOTION_HAPTICS_SPEC.md, CONCIERGE_TOUR_SPEC.md updated
- Implementation only when explicitly ordered; this is the permanent allowed set

## 2026-08-19 — Brotherhood of Thunders (multifaceted group)
When Obie asks for a **group of Thunders**, he wants many personalities of **one authorized character** — not new mascots.

**Always**
- Gold 3D lightning-bolt HEAD
- Black sunglasses (never white)
- Same face geometry as `assets/thunder-cool.png`
- No human body in the group grid
- Tuxedo Thunder is **Ask Thunder page only** — never in a brothers grid

**Personality is accessories + expression, not a different species**
Locked examples: smirk, grin, wink, think, laugh, care, mustache, hat backwards, cigar.

A group should read as **brothers who all look like Thunder** — multifaceted, still one mark.

Live set: `assets/tour-faces/thunder-*.png`

## 2026-08-19 — Brotherhood roster LOCKED (app personality library)
Permanent set: `assets/tour-faces/` + index `assets/tour-faces/BROTHERHOOD.json`.
24 personalities of one Thunder. Use anywhere a *group of brothers* needs life (tour grid, empty states, celebrations) — never as a second mascot.
Tuxedo remains Ask Thunder page only.
Do not restyle glasses white. Do not humanize the skull.

## 2026-08-19 — Label pulse is CARDINAL
Anywhere a **label** exists (ANNOUNCEMENT, NEXT GATHERING, MISSION, LAST FIRE, THE NEXT MISSION, tour kickers), it glows and pulses.
**Titles** and **body/description** never pulse. They stand still.
Not labels: form field-label, file-label, QR wordmark, close-chip, brother names, dates.

## 2026-08-19 — Backstage Thunder idle (FAB)
Game-character idle, not a GIF. Baseline: 3px breath. 8–15s glance toward I’m In / announcements or 1–3° weight shift. 20–30s orientation. 45–60s quiet: look-at-you (slight scale hold). Any pointerdown snaps to baseline. No bounce, shake, spin, electricity. Tuxedo Ask page unchanged. Smirk / glasses-down / brow frames deferred until approved assets.

## 2026-08-19 — Cartoon arms, three beats only
Default Thunder remains bolt HEAD only.
Cute cartoon gold 4-finger arms allowed ONLY on backstage FAB for:
1. Watch check — waiting too long (~45–60s quiet)
2. Salute — soldier to captain (rare mid beat)
3. Bond glasses — hand pulls shades, eyebrow (occasional)
No torso. No skin. No arms on baseline idle. Touch = back to head-only.
