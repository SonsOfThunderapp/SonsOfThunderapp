# Thunder Board — MASTER FINAL (20260815-master-final)
# Hard to scrutinize: every locked decision from design, motion, honor, and backend tech.

## Brand
- Pure black #000, yellow #FEF105, red #E30600
- Headers Bebas Neue, body Inter
- Private-room energy, not church-management
- Identity: Thunder doesn’t dull. NASB only for Scripture.

## Logo bolt (locked)
- assets/bolt-overlay.png over baked-in bolt region (28.2% / 1.4% / 18.1% / 92.2%)
- logoBoltStrike 7s: long silence → double strike → fast afterglow → black
- Header + splash; mix-blend screen; NEVER full-box glow on logo bounds
- prefers-reduced-motion = static / opacity 0

## Header
- Logo cleared below display edge: padding max(40px, 12px + safe-area-inset-top)

## Goldilocks motion (10)
1 Press scale ~0.97  2 Electric tbGlowHit / rsvpLockPulse  3 Stagger cards
4 Directional view-swipe-left/right  5 Living --tb-breathe 4s  6 tbSuccess micro
7 Light-follow glow  8 Elastic depth  9 Cinematic sheets  10 tb-skeleton
Rule: motion only for state, direction, hierarchy, reward.
Killer combo: press → haptic → electric confirm → living glow.

## Futuristic / Living (restrained)
- Glass rejected (pure black wins)
- Magnetic I’M IN, kinetic type on identity/splash, ambient #app gradients
- Electrical spark only (never confetti)
- Meeting-day phase-soon / phase-live energy toward 6:30
Tiers: Animation → Premium → Futuristic → Living

## Product structure
Home: Next Gathering + I’M IN, announcements, Sharpening Iron, Last Fire
Brothers: roster, phone opt-in, SHARE CONTACT + QR, name pulse
Events: date glow, RSS Range/Lake/Bible/Gym, public memory browse, Next Mission
More: The Code, SHARE THUNDER WITH A BROTHER, Text a Leader, Alerts, Leadership

## Honor layer
- Birthday MM-DD → TODAY, HAPPY BIRTHDAY, leader once/day alert
- joinedAt → Since Mon YYYY; ANNIV badge
- Show-up streak (MARK SHOWED UP); 3+ badge
- Carried weight 7-day note + CARRIED badge

## Backend tech in zip
- sw.js (PWA push + network-only fetch)
- manifest.json
- netlify/functions: thunder-ai, push-subscribe, push-unsubscribe, push-broadcast
- Supabase client + realtime; VAPID public in config
- MEMORIES_BUCKET: Sons Of Thunder Memories

## Supabase columns (run once)
birthday, joined_at, show_up_streak, last_showed_up, carried_note, carried_at, phone

## Netlify env
XAI_API_KEY, VAPID_PRIVATE_KEY

## Meeting rule
First Monday monthly; Labor Day / Memorial Day → second Monday
Venue: Crooked Can Brewery Patio, Winter Garden · 6:30 PM

## Build
APP_BUILD: 20260815-master-final
Deploy: Netlify drag-drop zip root → hard refresh

## PRE-SHIP AUDIT (mandatory before every zip)
1. Sheet lifecycle: open, ×, backdrop, Escape, re-open; clear mic/video/scroll/focus
2. Pulse DNA: --tb-breathe 4s only; names, SHARE CONTACT, labels, logo bolt glow, ⚡, event dates intense
3. More invite stack: SHARE + HOME SCREEN cards; video+poster in zip
4. Visual locks: pure black, no full-box logo glow, header safe-area, invite neutral borders
5. Public memories browse without forced sign-in wall
6. Zip: sw.js, bolt-overlay, install assets, netlify functions, APP_BUILD bumped
7. Leadership editors present (incl. Edit Ask Thunder)
8. No stuck body scroll / orphan overlays / dead FAB after modal
FAIL any → fix before zip.
