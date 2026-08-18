# Thunder Board — Regression Lessons (permanent)

1. HEADER BOLT PULSE must use bolt-shaped asset (`bolt-only.png` / `.header-bolt-live`), never full-box `.logo-bolt-glimmer`.
2. PROTECTED place/card title glow (`codeTitleGlow`) must not be stripped as unused CSS.
3. MEMBER PROFILE NAME pulse (`.brother-name` / `brotherNamePulse`) is visual DNA.
4. EVENT CALENDAR DATE pulse (`.event-month` / `.event-day`) is visual DNA — prefer text-shadow bloom over opacity-only.
5. FINAL PAGE (About) LOGO must use `env(safe-area-inset-top)` when main header is hidden.
6. Test normal animation and `prefers-reduced-motion` paths separately — never global-kill ambient pulses outside that media query.
7. Logo rectangular kill switch must remain last for `.logo-bolt-glimmer` only — do not kill `.header-bolt-live`.


8. HEADER BOLT HEARTBEAT reaches true zero opacity at low point (normal motion only); position % never animated.
9. Generic WELCOME TO THE BOARD is not first-run authority — Thunder Concierge / Follow the Bolt is.
10. Tour is versioned (`thunderTourV*`), skippable, replayable; one onboarding owner at a time.
11. Haptics: never claim iPhone vibration; Android may use navigator.vibrate when present.
12. Housekeeping is event-driven; self-heal state only — never self-modify production code.

13. Inspect → prove → modify: rewriting from conversational memory without opening source re-broke logo box, pulse gaps, and buried explainer.
14. Competing transforms on the logo/bolt layer cause visible rectangle and alignment drift — animate dedicated layers only.
15. HOW without visible poster = “feature exists but brother can’t find it.”
16. Name pulse without photo-tile pulse = incomplete Brothers alive state.
17. Modal titles without `.tb-pulse-title` / shared clock = dead sheets.
18. Claiming iPhone haptic vibration in a PWA is a product lie — use visual tactility.
19. Success animations on button press before write confirmation = false success (trust damage).
20. Multiple ambient clocks (7s bolt vs 4s breathe) desync the “one heartbeat” DNA.
21. Innovation without blast-radius check strips protected CSS (code title glow, event date glow).
22. Packaging before collision gate leaves overlay + tour + install fighting.
23. Self-heal must never mean self-modify production code.
24. “Verified in source” ≠ “works on phone” — always separate labels.

25. Tour host used plain bolt-only.png while Thunder character already existed for FAB/Ask page — user requires character to lead the click-to-click tour; plain bolt stays for brand marks only.
26. Ask Thunder Bond hero sized too small relative to its role as page identity — scale up when coding TC03.


## PRODUCT CONSTITUTION + ASSET PROVENANCE (2026-08-17)

47. **Approved asset only:** Never show or ship AI-redrawn / approximate / legacy Thunder or logo. Trace `assets/CANONICAL/logo-official-IMG_7697.jpg` and `assets/CANONICAL/thunder-character-official-IMG_7692.jpg`.
48. **File existence ≠ approval.** `thunder-bond-hero.png` may exist (even as 0-byte) — Bond path is DO NOT USE.
49. **Deploy package gap:** Docs reference `thunder-cool` family; production `index.html` tour host currently uses `bolt-only.png` (BRIDGE). Full character in production UI = IMPLEMENTATION PENDING until official 7692-derived PNGs are approved and wired — do not invent substitutes.
50. **Visual proof law:** Mockup → approval → code/ZIP. No unsolicited ZIP. Concept images must be labeled CONCEPT, not PRODUCTION PROOF.
51. **Freeze-frame motion test:** Every keyframe of AI animation must stand as an approved still (START/25/50/75/END).
52. **One heartbeat:** Do not introduce a second ambient pulse clock that drifts from `--tb-breathe`.

## CONCIERGE HOST SIZE + PLACEMENT = ONE SYSTEM (2026-08-17 device fail)

HARD FAIL evidence: screenshots showed Thunder clipped by status bar, overlapping YOU'RE IN CTA, logo, speech disconnected.

RULES (permanent):
- NEVER enlarge Thunder CSS without revalidating placeTourHost against real rendered bounds
- Do not use old 72px pixel offsets with responsive character dimensions
- Character real offsetWidth/offsetHeight must drive placement (center of fixed+translate host)
- Thunder + speech bubble are one composition; bubble clearance uses host half-height
- Real app must remain recognizable under tour dimming (no near-black stack)
- No future ZIP may mark Concierge pass on CSS/DOM presence alone — DEVICE BLOCKING is required acceptance
- Target, host, tip, safe-area, bottom-nav: no prohibited intersections
