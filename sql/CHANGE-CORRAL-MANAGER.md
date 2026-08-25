# CHANGE CORRAL MANAGER
**Thunder Board — post-fail change control**  
**Last failed zip baseline:** pre-`20260817-p1-repair` (user: failed deploy / credit burn)  
**Current local package build:** `20260817-p1-repair`  
**Manager job:** one place that lists every change since the fail, its status, and whether it is allowed into the next ZIP.

Rule: **No new ZIP until user asks.** Mock → approval → then package.

---

## HOW TO USE THIS FILE

1. Every approved change lands in one row below (or gets rejected here).
2. Status codes:
   - **IN SOURCE** — present in local `thunder-board-deploy`
   - **PRODUCT LAW ONLY** — locked in memory/constitution; no code yet
   - **NEEDS PROOF** — in source but needs device/visual verification before ship
   - **BLOCKED** — must not ship until fixed
   - **REJECTED** — deliberately not building
3. Next ZIP only when **BLOCKED = 0** and user explicitly requests package.

---

## A. PRODUCT LAWS LOCKED SINCE FAIL (no code required)

| # | Law | Status |
|---|-----|--------|
| A1 | **Never reimagine Thunder** — IMG_7692 / thunder-cool.png only; head only; no Bond/tux/full body | PRODUCT LAW + CANONICAL assets |
| A2 | **Notification law** — interrupt only when silence costs him something; 4 launch types; reject spam | PRODUCT LAW |
| A3 | **Anti-annoyance constitution** — 7 enemies; one-prompt rule; silence/delete tests; pre-ZIP sweep | PRODUCT LAW |
| A4 | **Visual proof before ZIP** — mock → approval → package; no surprise zips | PRODUCT LAW |
| A5 | **Standing room law** — no ZIP without mockup approval | PRODUCT LAW |

---

## B. CODE CHANGES IN CURRENT LOCAL BUILD (`20260817-p1-repair`)

| # | Change | Status | Proof needed |
|---|--------|--------|--------------|
| B1 | **Hey Thunder continuous wake RETIRED** — `setWakeEnabled` no-op; chip forced hidden; preference cleared | IN SOURCE | Device: Ask Thunder shows type+Send, no wake chip |
| B2 | **Tour host = official cool Thunder** (TB_TOUR_VERSION 10) — not generic bolt | IN SOURCE | Tour host matches IMG_7692; no Bond |
| B3 | **ADD TO CALENDAR** replaces 7-DAY REMINDER label/path | IN SOURCE | Home button copy + honest “hit Save” |
| B4 | **ICS + VALARMs** (7d / 1d / 2h) on calendar handoff; never claim “calendar saved” | IN SOURCE | Open calendar → user must Save |
| B5 | **I’m In → LOCKED IN** then calendar handoff; primary RSVP not rolled back if calendar fails | IN SOURCE | RSVP sticks if user cancels calendar |
| B6 | **Canonical assets** — logo-official-7697-header; thunder-character-official-IMG_7692 | IN SOURCE | Header + character pixels match locked refs |
| B7 | Bond / alternate hosts quarantined (do not execute) | IN SOURCE | No Bond face on tour/Ask |

---

## C. STILL OPEN / NOT IN THIS CORRAL AS SHIPPED CODE

| # | Item | Status | Notes |
|---|------|--------|-------|
| C1 | Gathering push cadence (7d/1d only; 2h opt-in) | PRODUCT LAW | Wire only when you order it |
| C2 | Birthday honor push (restrained) | PRODUCT LAW | Needs profile birthday data + leadership path |
| C3 | Deep-link every push to exact target | PARTIAL | Architecture intent; verify per notification type |
| C4 | One-prompt rule on first I’m In (no permission pile-on) | NEEDS PROOF | Behavior audit on device |
| C5 | Installed PWA = hard suppress install nag | NEEDS PROOF | Test standalone mode |
| C6 | Pause ambient Thunder during tour/modal/Ask | NEEDS PROOF | Historical collision risk |
| C7 | Live APP_BUILD match after deploy | BLOCKED until post-deploy | curl live config vs zip |
| C8 | Concierge geometry (host never covers CTA) | NEEDS PROOF | Device tour walk |
| C9 | Supabase invite-only / open signup ops | OPS | Dashboard, not zip contents |

---

## D. EXPLICIT REJECTS (do not resurrect)

- Daily verse / quote / “we miss you” / streak / FOMO attendance pushes  
- Fake iPhone haptics  
- Continuous system-wide Hey Thunder  
- Full-body / tuxedo / Bond Thunder  
- Who’s In social pressure row on Home  
- ZIP without mock approval  
- Reimagining Thunder from text prompts  

---

## E. NEXT SHIP GATE (manager checklist)

Before any new production ZIP:

- [ ] User requested ZIP explicitly  
- [ ] Mockups shown for any visual delta since last approval  
- [ ] B1–B7 still true in source (grep + visual)  
- [ ] No Hey Thunder chip in DOM path that can win  
- [ ] Tour host asset = thunder-cool / IMG_7692 family  
- [ ] Home calendar CTA = ADD TO CALENDAR  
- [ ] Anti-annoyance WATCH items acknowledged (onboarding stack, motion density)  
- [ ] APP_BUILD bumped for this package  
- [ ] Zip root has `index.html` (Netlify drag-drop safe)  
- [ ] No `.npmrc` private registry, no secrets in client  

**After deploy (user device):**

1. More → REFRESH APP  
2. Confirm live `APP_BUILD`  
3. Seven-point visual baseline if UI touched  
4. I’m In → calendar honesty  
5. Ask Thunder: no continuous wake  

---

## F. MANAGER DECISION LOG

| Date | Decision | Outcome |
|------|----------|---------|
| 2026-08-18 | Create CHANGE-CORRAL-MANAGER | Active |
| 2026-08-18 | Lock never-reimagine Thunder | PRODUCT LAW |
| 2026-08-18 | Lock notification + anti-annoyance constitutions | PRODUCT LAW |
| 2026-08-17 | p1-repair local package | IN SOURCE; deploy verification still user-side |

---

## G. ONE-LINE STATUS FOR OBIE

**Corral is active.** Laws locked. Code deltas for P1 are in local `20260817-p1-repair`. **No ZIP until you ask.** Highest remaining risk is still post-deploy proof (SW/cache + live build match + tour geometry), not missing product ideas.
