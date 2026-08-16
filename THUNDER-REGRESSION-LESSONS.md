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
