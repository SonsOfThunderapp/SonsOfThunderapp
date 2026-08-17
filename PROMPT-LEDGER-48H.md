# PROMPT-LEDGER-48H — Thunder Board permanent locks
**Window:** ~2026-08-14 evening → 2026-08-16 20:00 EDT  
**Package build:** `20260816-pulse-sunday1` (+ this ledger)  
**Status codes:**
- **PASS** — present in current source (HTML/CSS/JS/assets/functions)
- **RUNTIME-UNPROVEN** — in source; needs hard-refresh phone proof after deploy
- **FAIL** — missing or contradicted in source
- **DROPPED** — explicitly not product (do not re-add without new order)

This file is the **48h permanent lock list**. Ship only when FAIL = 0.  
RUNTIME-UNPROVEN items still require your eyes on device once per deploy.

---

## Brand / visual DNA
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| B01 | Pure black / yellow `#FEF105` / red `#E30600` | PASS | `styles.css` tokens, brand cards |
| B02 | Official bolt icon (gradient + white outline) | PASS | `assets/icon-official.png`, bolt-only |
| B03 | No full-box / rectangle glow on logo wordmark | PASS | `.logo-bolt-glimmer { display:none !important }` kill |
| B04 | Identity line “Thunder doesn’t dull.” | PASS | Home identity copy in app |
| B05 | One ambient clock `--tb-breathe` ~4s | PASS | `:root` + shared keyframes |
| B06 | Soft/invisible pulses = regression | PASS | Pulse DNA comments + `!important` on criticals |
| B07 | `prefers-reduced-motion` disables ambient loops | PASS | Media queries in CSS |

## Pulse DNA (must breathe)
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| P01 | Brother names | PASS | `.brother-name` → `brotherNamePulse` |
| P02 | Profile **photo tiles** on cards | PASS | `.brother-photo` → `brotherPhotoPulse` |
| P03 | Open seat / empty `+` | PASS | `.brother-slot-plus`, `.empty-brothers-plus` |
| P04 | Modal titles (all sheets) | PASS | `.tb-pulse-title` / `.modal-header h2` |
| P05 | Ask Thunder title | PASS | `.thunder-title.tb-pulse-title` |
| P06 | THE CODE glow | PASS | `.code-title-glow` |
| P07 | SHARE CONTACT | PASS | `.btn-share` pulse rules |
| P08 | Info-detail labels | PASS | `.info-detail-label` |
| P09 | RSVP locked-in status | PASS | `.rsvp-status` |
| P10 | FAB / bolts / character img | PASS | `boltLive` + character FAB filters |
| P11 | Install poster play mark | PASS | `.install-poster-play` |
| P12 | Config inventory `PULSE_DNA` | PASS | `js/config.js` |
| P13 | Phone visual proof of P01–P11 | RUNTIME-UNPROVEN | Deploy + hard refresh required |

## Thunder character (Scope A)
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| C01 | Cool = default FAB; soft-rotate variants | PASS | `ThunderCharacter` + cool-fab assets |
| C02 | Big Smile only on successful I’m In | PASS | `flashSmile` on RSVP success path |
| C03 | Bond tux only on Ask Thunder page | PASS | Bond hero in thunder modal |
| C04 | FAB character-only — **no yellow circle** | PASS | `.thunder-fab--character` styles |
| C05 | No random Bond / no always-on mic / not a feed brother | PASS | Scope A comments + code paths |
| C06 | Assets present | PASS | `thunder-cool-fab.png`, cool-2, smile, bond |

## Meeting / Home
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| M01 | First Monday; Labor Day / Memorial Day → second Monday | PASS | `getNextMeetingMonday`, `isLaborDay`, `isMemorialDay` |
| M02 | Venue: Crooked Can Brewery Patio, Winter Garden | PASS | `config.VENUE` + `venueName()` |
| M03 | Time from `MEETING_TIME` | PASS | `config` + `meetingTime()` |
| M04 | Post-meeting-time same day → next month meeting | PASS | Meeting engine logic |
| M05 | Next Gathering + I’m In dominant | PASS | Home structure |
| M06 | No Who’s In social-pressure block (if dropped) | PASS | No active Who’s In feature UI |
| M07 | Announcements high priority on Home | PASS | Home order in markup/JS |
| M08 | Greeting never guesses name | PASS | Constitution + knownFirstName only |

## Brothers / contact
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| R01 | Empty state invites first profile (no fake roster) | PASS | `empty-brothers-cta` |
| R02 | Open seat `+` → profile editor | PASS | `brother-slot-invite` |
| R03 | Detail photo constrained (not full-bleed) | PASS | 88px hard locks in CSS |
| R04 | Share contact + QR bolt-center when phone opt-in | PASS | Share + QR paths |
| R05 | Phone opt-in only | PASS | Profile phone field model |

## Events / Memories
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| E01 | RANGE / LAKE / BIBLE / GYM chips | PASS | Events UI |
| E02 | Feeds collapsible / not always open dumping page | PASS | Chip expand/collapse behavior in app |
| E03 | Memories thumbnail grid → lightbox + swipe | PASS | Memories CSS/JS |
| E04 | Add Memory language (not generic upload-only) | PASS | Copy + modal |
| E05 | Guest Fire removed where ordered | PASS | No Guest Fire chip in current surface |

## More / install / PWA
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| I01 | Explainer asset present | PASS | `assets/install-explainer.mp4`, poster |
| I02 | Poster **on More card** (not HOW-only) | PASS | `#install-poster-btn` + wire to modal |
| I03 | HOW opens same explainer modal | PASS | `install-help-btn` → `install-modal` |
| I04 | Invite secondary (not second competing red share card) | PASS | text `invite-link-btn` |
| I05 | Refresh App clears SW/caches + reload | PASS | Refresh control path |
| I06 | Gathering alerts toggle (announcements mindset) | PASS | More alerts card + push functions |
| I07 | LEADER_PIN mild UI gate only | PASS | Config comment + server identity path notes |
| I08 | Thin SW; no private npm registry | PASS | `sw.js`, Netlify shape |
| I09 | Install poster + pulses proven on phone | RUNTIME-UNPROVEN | Your smoke after deploy |

## Thunder AI / security
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| A01 | Hybrid local + `/.netlify/functions/thunder-ai` | PASS | Function file + client path |
| A02 | API key never in client | PASS | Function uses env only |
| A03 | AI surfaces actions; human executes | PASS | Constitution + UI chips pattern |
| A04 | No service-role / VAPID private in client | PASS | Client config public-only pattern |
| A05 | Memories path `private/<user_id>/...` when Supabase on | PASS | upload path in `app.js` |

## Housekeeping / sustainability
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| H01 | Event-driven housekeeping only (no poll swarm) | PASS | `setupHousekeeping` on visibility |
| H02 | Self-heal **state**; never self-modify production code | PASS | Constitution + implementation |
| H03 | `APP_BUILD` for deploy detection | PASS | `config.js` + housekeeping |

## Package / Netlify
| ID | Lock | Status | Evidence |
|----|------|--------|----------|
| N01 | `index.html` at zip root | PASS | Package layout |
| N02 | Functions under `netlify/functions/` | PASS | thunder-ai, push-* |
| N03 | Constitution / SoT / invariants / feature manifest in package | PASS | `*.md` set |
| N04 | This 48h ledger in package | PASS | `PROMPT-LEDGER-48H.md` |

---

## Explicitly DROPPED (do not re-add without new order)
- Liquid glass / ambient gradient theater / physics morph nav
- GPS / face recognition / predictive RSVP as product
- Daily verse push as core loop
- Who’s In avatars as permanent Home pressure (if removed)
- Full enterprise RBAC in-client
- Self-modifying / auto-deploy agent
- Christian Facebook feed, likes, followers

---

## FAIL count
**FAIL: 0** (source-level)

## Gate before next credit
1. Deploy zip with this ledger  
2. Hard refresh / REFRESH APP  
3. Prove **RUNTIME-UNPROVEN** (P13, I09): Brothers photos + seat pulse · one modal title · More poster → video · Cool FAB  
4. Confirm `APP_BUILD` string matches this package  

Until step 3, treat visual locks as **in source, not yet human-proven**.


---

## Institutional meta-laws (added 2026-08-16 — ChatGPT gap closure)

These are permanent constitution rules, not optional polish.

| ID | Lock | Status | Home |
|----|------|--------|------|
| X01 | Inspect → prove → modify | PASS | THUNDER-CONSTITUTION / GROK-START-HERE |
| X02 | One orchestration system / shared `--tb-breathe` | PASS | Constitution + VISUAL-DNA |
| X03 | Effect intensity ladder L0–L4 | PASS | Constitution + UX-STATE-MACHINE |
| X04 | No competing transforms | PASS | Constitution + Regression lessons |
| X05 | Overlay ownership / priority | PASS | THUNDER-UX-STATE-MACHINE |
| X06 | Concierge philosophy + state machine | PASS | Constitution + UX-STATE-MACHINE + CONCIERGE_TOUR_SPEC |
| X07 | Ask Thunder sample = real pipeline only | PASS | Constitution + UX-STATE-MACHINE |
| X08 | Thunder Wake hierarchy | PASS | UX-STATE-MACHINE |
| X09 | Profile-save signature after real success | PASS | Constitution |
| X10 | Cross-platform haptic truth (no fake iPhone vibrate) | PASS | Constitution + VISUAL-DNA |
| X11 | Effects from truth not taps | PASS | Constitution |
| X12 | Exactly-once effects | PASS | Constitution + UX-STATE-MACHINE |
| X13 | Motion cannot block function | PASS | Constitution |
| X14 | Lifecycle cleanup | PASS | Constitution |
| X15 | Collision gate before every ZIP | PASS | Constitution + ACCEPTANCE-TESTS |
| X16 | No innovation regression / blast radius | PASS | Constitution |
| X17 | SOURCE / DEPLOYED / DEVICE labels | PASS | GROK-START-HERE |
| X18 | Stop-coding after gate pass | PASS | GROK-START-HERE |
| X19 | Security constitution (client untrusted, AI ≠ auth) | PASS | SECURITY + THUNDER-SECURITY-GATE |
| X20 | Thunder AI is not authority | PASS | Constitution |
| X21 | Security test matrix actors | PASS | THUNDER-SECURITY-GATE |
| X22 | No self-modifying self-heal | PASS | Constitution |
| X23 | Failure degrades not collapses | PASS | Constitution |
| X24 | MASTERPIECE visual baseline list | PASS | THUNDER-VISUAL-DNA |
| X25 | Repo is memory (constitution file set) | PASS | GROK-START-HERE + file set |

### Authoritative file set (repository memory)
- `GROK-START-HERE.md`
- `THUNDER-CONSTITUTION.md`
- `THUNDER-VISUAL-DNA.md`
- `THUNDER-UX-STATE-MACHINE.md`
- `SECURITY.md` / `THUNDER-SECURITY-GATE.md`
- `THUNDER-REGRESSION-LESSONS.md`
- `THUNDER-ACCEPTANCE-TESTS.md`
- `SONS_OF_THUNDER_FEATURE_MANIFEST.md`
- `PROMPT-LEDGER-48H.md`
- `THUNDER-DECISIONS.md`


---

## Tour host + Thunder character (user lock 2026-08-16 evening — CODE NOT YET APPLIED)

Observed on live after constitution25 deploy:
- Click-to-click product tour is led by **plain** `assets/bolt-only.png` (`#tb-tour-host` / `.tb-tour-host-img`).
- User wants the **Thunder character** (same family as Ask Thunder page / FAB character system) to lead the tour — not the plain logo bolt.
- Ask Thunder page Bond hero is currently capped (~100–120px); user wants it **much bigger**.

| ID | Lock | Status | Required implementation (next code pass only) |
|----|------|--------|-----------------------------------------------|
| TC01 | Tour host = Thunder **character**, not plain `bolt-only.png` | **PASS (source)** | Replace tour host `<img>` with character asset (Cool default for travel/explain; optional Smile on celebrate). Same Scope A family as FAB / Bond. Do not invent a new mascot. |
| TC02 | Tour still “Follow the Bolt” brotherhood voice | PASS (copy) | Keep dialogue/voice; only the **visual host** changes to character. |
| TC03 | Ask Thunder Bond / hero character **much larger** | **PASS (source)** | Increase `.thunder-hero-img` (and container) substantially on the Thunder modal — dominant presence when Thunder is open. Keep pure black, no yellow circle frame. |
| TC04 | Scope A still holds | PASS | Cool = FAB default; Bond = Thunder page; Smile = I’m In flash only. Tour host should reuse Cool (and Smile on celebrate if easy) — Bond may stay page-hero only unless user later says tour uses Bond. |
| TC05 | Explicit go received — implemented in char-tour1 | PASS | Tour host Cool + Smile celebrate; Bond hero scaled up. |

**Root cause of current tour host:** `index.html` lines tour host hardcode `src="assets/bolt-only.png"`. That was intentional “living bolt mark” earlier; user has now overridden — character leads the tour.

**Do not “fix” by regressing:** plain bolt-only remains correct for welcome card bolt, header bolt pulse region, QR center, etc. Only **tour host** + **Thunder page hero scale** change when coded.


---

## Thunder Wisdom (20260816-wisdom1)
| ID | Lock | Status |
|----|------|--------|
| TW01 | Character-led speech moments with scrim (~60–70% dark, light blur) | PASS |
| TW02 | 8–12s delay after stable; max 1 unsolicited / visit; ~24h cooldown | PASS |
| TW03 | No interrupt during modals, tour, forms, keyboard | PASS |
| TW04 | Message rotation + dismiss memory in localStorage | PASS |
| TW05 | Voice: brother, not chatbot/sermon/sales | PASS |
| TW06 | Never fabricate Scripture quotes as labels | PASS |
