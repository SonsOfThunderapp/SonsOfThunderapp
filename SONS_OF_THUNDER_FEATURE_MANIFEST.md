# SONS OF THUNDER — FEATURE MANIFEST

Living inventory of product surface. Status codes match the forensic audit language.

| ID | Feature | Primary evidence | Status (audit date 2026-08-16) |
|----|---------|------------------|--------------------------------|
| F01 | App identity / PWA name Thunder Board | `manifest.json`, `index.html` title | VERIFIED IN CURRENT SOURCE |
| F02 | Pure black / yellow / red brand tokens | `css/styles.css`, config comments | VERIFIED IN CURRENT SOURCE |
| F03 | Official bolt assets | `assets/bolt-only.png`, `icon-official.png` | VERIFIED IN CURRENT SOURCE |
| F04 | Identity line Thunder doesn’t dull | `index.html` `.identity-line` | VERIFIED IN CURRENT SOURCE |
| F05 | APP_BUILD versioning | `js/config.js` | VERIFIED IN CURRENT SOURCE |
| F06 | Splash opening | `index.html` splash, `app.js` splash path | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F07 | Header logo + safe-area padding | CSS `safe-area-inset-top` on header | VERIFIED IN CURRENT SOURCE |
| F08 | Logo full-box glimmer kill | CSS `.logo-bolt-glimmer { display:none !important }` | VERIFIED IN CURRENT SOURCE |
| F09 | Shared ambient pulse `--tb-breathe` / boltLive | CSS keyframes + multiple selectors | VERIFIED IN CURRENT SOURCE |
| F10 | Code title red/yellow glow pulse | `.code-title-glow` / `codeTitleGlow` | VERIFIED IN CURRENT SOURCE |
| F11 | Sensory / haptics API `tbFeedback` | `app.js` tbFeedback object, config SENSORY | VERIFIED IN CURRENT SOURCE |
| F12 | Next Gathering card | Home markup + `updateMeetingCard` | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F13 | Canonical meeting engine | `getNextMeetingMonday`, Labor/Memorial helpers | VERIFIED IN CURRENT SOURCE |
| F14 | Venue + time from config | `venueName()`, `meetingTime()` | VERIFIED IN CURRENT SOURCE |
| F15 | I’m In RSVP | `#rsvp-btn`, lock pulse CSS | VERIFIED IN CURRENT SOURCE |
| F16 | 7-day reminder | reminder UI + handlers | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F17 | Calendar / ICS paths | calendar helpers in app.js | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F18 | Text a Leader (split SMS parts) | `LEADER_SMS_PARTS`, `#text-leader-btn` | VERIFIED IN CURRENT SOURCE |
| F19 | Announcements | Home list + leadership edit | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F20 | Sharpening Iron RSS | Man in the Mirror feed code | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F21 | Activity RSS RANGE/LAKE/BIBLE/GYM | Events chips + feeds | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F22 | Brothers directory | Brothers view + profiles | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F23 | Profile detail / QR / Share contact | QR + vCard paths | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F24 | Events / Memories grid + lightbox | memory viewer, compress upload | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F25 | Supabase shared memories path | `private/` + user id upload | VERIFIED IN CURRENT SOURCE (code); live DB CANNOT VERIFY |
| F26 | About / Who We Are / Mark 3:17 | about section copy | VERIFIED IN CURRENT SOURCE |
| F27 | The Code | `#the-code` / code title | VERIFIED IN CURRENT SOURCE |
| F28 | Leadership PIN tools | mild gate LEADER_PIN | VERIFIED IN CURRENT SOURCE (UI only) |
| F29 | Ask Thunder hybrid + Netlify function | local answers + `/.netlify/functions/thunder-ai` | PARTIAL — live Grok depends on env |
| F30 | Product tour / living bolt host v4 | `TB_TOUR_VERSION=4`, `#tb-tour-host`, typing | PRESENT BUT PARTIAL vs director spec |
| F31 | Replay tour / Refresh app | More page controls | VERIFIED IN CURRENT SOURCE |
| F32 | Gathering alerts push | sw.js + push-* functions | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F33 | Install PWA / explainer MP4 | manifest, beforeinstallprompt, install modal | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F34 | Swipe tab navigation | touch handlers | IMPLEMENTED BUT NOT RUNTIME-VERIFIED |
| F35 | Housekeeping governor | `setupHousekeeping` + release-check | VERIFIED IN CURRENT SOURCE (wired check) |
| F36 | Last Fire card | lastFire references in app.js | HISTORY FOUND — treat as optional/partial |
| F37 | Birthday / honor system | honor build history | PROMPTED — confirm presence before claiming |
| F38 | Face recognition / geo check-in | early expansion prompt | REMOVED BY APPROVAL / never shipped as product |
| F39 | Daily Bible push | considered | INTENTIONALLY REJECTED (mid-month value elsewhere) |
| F40 | Who’s In social roster | considered then dropped | REMOVED BY APPROVAL |

Update this table when shipping a new APP_BUILD.
