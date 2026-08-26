window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260826-film1',
  /* Public "who's in" presence — floor so no brother is ever alone on the card.
     seedFloor: deprecated for display count — keep 0. Truthful attendance only.
     anchorName: always listed first (leadership presence). */
  RSVP_PRESENCE: {
    publicOnHome: true,
    /* Truth only — never inflate attendance (ChatGPT red-team 2026-08-25). */
    seedFloor: 0,
    anchorName: 'Obie',
    openChairCopy: true
  },

  /* HEADER MARK — ETERNAL 2026-08-23. Phone-approved (IMG_7978).
     White SONS + gold 3D bolt through O + red OF THUNDER.
     Sticky top of Home / Brothers / Memories / More. z-index 8000.
     Source: assets/CANONICAL/logo-print-diecut.png → logo@2x/@3x/@4x.
     NEVER crop, hide, stretch, AI-redraw, or swap this mark.
     NEVER max-height / overflow:hidden / clip-path on #main-header or #header-logo. */
  HEADER_ANCHOR: {
    eternal: true,
    approved: '2026-08-23',
    proof: 'IMG_7978',
    source: 'assets/CANONICAL/logo-print-diecut.png',
    slots: ['assets/logo@2x.png', 'assets/logo@3x.png', 'assets/logo@4x.png'],
    aspect: '3000/2077',
    z: 8000,
    pages: ['home', 'brothers', 'events', 'about'],
    forbid: ['max-height-cap', 'overflow-hidden-header', 'clip-path-header', 'ai-redraw']
  },
  /* First-run tour does NOT auto-start. New phone lands in the room.
     Already finished (thunderTourV42 done) = no nag. More → TAKE THE TOUR remains. */
  /* I'M IN vault locked 2026-08-21 — live-coal rest, bolt strike, yellow settle,
     Thunder nod then drift. Sign-in / A2HS wait until the lock lands. */
  /* ONE-PUSH DEPLOY locked 2026-08-21
     After every finished piece: commit → push origin main.
     Netlify auto-publishes https://sonsofthunderboard.com (custom domain on this site). Grok "Publish App" is not the brothers' site. */
  ONE_PUSH_DEPLOY: true,
  /* WAR ROOM locked 2026-08-21 — WAR-ROOM.md. Eight chairs. Assassin last. */
  /* QR LAW locked 2026-08-20 — EVERY code in the app (profile, contact modal, Axum).
     Local integer modules. ECC H. Quiet zone 4 modules. Black on white.
     No remote QR API. No fuzzy strokes. Short payload (profile = FN + TEL only).
     Contact QR may keep bolt-for-qr center. paintThunderQr() is the only painter. */
  QR_LAW: {
    engine: 'paintThunderQr',
    ecc: 'H',
    quietModules: 4,
    colorDark: '#000000',
    colorLight: '#ffffff',
    remoteApi: false,
    profilePayload: 'FN+TEL'
  },
  ROOM_CUT: '1.0',
  VISUAL_PROOF_PROTOCOL: true,
  PRE_SHIP_HUNTER: true,
  SOURCE_PARENT: '20260818-p0-recovery1',
  REJECTED_ARCHIVES: ['20260818-whatsnext1', '20260818-header-safe1'],
  PRODUCT_LOCK: {
    date: '2026-08-16',
    label: 'LOCKED',
    systems: [
      'core-nav','meeting-engine','im-in','announcements','whats-next-retention',
      'brothers-profiles','qr-share-contact','events-memories','activity-rss',
      'the-code','ask-thunder-hybrid','thunder-fx','profile-fireworks',
      'laser-ignition','thunder-voice','hey-thunder-optin','thunder-tap',
      'manifest-shortcuts','pwa-install','splash-welcome','housekeeping-governor',
      'push-gathering-alerts','supabase-shared','leadership-pin-mild'
    ]
  },
  LOGO_CANON: {
    master: 'assets/CANONICAL/logo-print-diecut.png',
    header2x: 'assets/logo@2x.png',
    header3x: 'assets/logo@3x.png',
    header4x: 'assets/logo@4x.png',
    about: 'assets/logo-about.png',
    banned: ['pre-7697-wordmark', 'white-outline-legacy', 'logo*.old-backup']
  },
  THUNDER_BROTHERHOOD: 'assets/tour-faces/BROTHERHOOD.json',
  TOUR_HOST_IDLE: true,
  TOUR_SLIDES_APPROVED: [2, 3, 4],
  BACKSTAGE_IDLE: true,
  BUBBLE_REFRESH_EVERY_DAYS: 90,
  LABEL_PULSE: true,
  SPOTLIGHT_LAW: true,
  VISUAL_LOCKS: {
    welcomeBoltSrc: 'assets/bolt-only.png',
    welcomeBoltSize: 72,
    welcomeBoltPulse: true,
    noEmojiWelcomeBolt: true,
    noFullBoxLogoGlow: true,
    installExplainerKeepAudio: true,
    saveRewardOnProfileAndMemory: true,
    oneBreathingUnit: true,
    livingHome: true,
    theCodeRedGlow: true,
    splashLogoPhoneCenter: true,
    emailOnlyAuth: true
  },
  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',
  SENSORY: {
    vibrateEnabled: true,
    iphoneVibrate: false,
    thunderImpactMs: 40,
    pressMs: 10,
    confirmMs: 25,
    warningPattern: [25, 60, 35],
    selectionMs: 8,
    debounceMs: 100,
    soundEnabled: false
  },
  SAVE_REWARD: {
    durationMs: 3000,
    boltSrc: 'assets/bolt-only.png',
    profileTitle: 'PROFILE LOCKED IN',
    profileSub: 'Your seat in the roster.',
    memoryTitle: 'MEMORY LOCKED IN',
    memorySub: 'Part of the brotherhood record.',
    hapticMs: 18,
    enabled: true
  },
  INSTALL_EXPLAINER: {
    src: 'assets/install-explainer.mp4',
    keepAudio: false,  /* a2hs short silent tutorial 20260825 */
    loop: true,
    noNativeControls: true
  },
  PUBLIC_ORIGIN: 'https://sonsofthunderboard.com',
  /* SECURITY MODEL (cyber handoff — not marketing copy)
     LEADER_PIN = mild client UI gate ONLY. View Source reveals it.
     It must NEVER authorize push-broadcast, DB writes, or Netlify privileges.
     Server authority = Supabase session + app_members leader/admin (see push-broadcast.js).
     LEADER_SMS_PARTS = intentional public leadership contact for sms: deep links — NOT a secret.
     SUPABASE_ANON_KEY + VAPID_PUBLIC_KEY = browser-expected public material.
     Service role / XAI / VAPID private = Netlify env only. */
  LEADER_PIN: 'thunder-board-lead',
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};
