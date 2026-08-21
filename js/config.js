window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260821-edge1',
  /* I'M IN vault locked 2026-08-21 — live-coal rest, bolt strike, yellow settle,
     Thunder nod then drift. Sign-in / A2HS wait until the lock lands. */
  /* ONE-PUSH DEPLOY locked 2026-08-21
     After every finished piece: commit → push origin main.
     Netlify auto-publishes sonsofthunder.netlify.app. Grok "Publish App" is not the brothers' site. */
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
  /* SONS OF THUNDER — ROOM CUT 1.0 (locked 2026-08-20)
     Member-facing: Home poster, splash→Home, Thunder quiet, real brothers/memories,
     Patio raffle is leader-activated (THE ROOM → OPEN THE PATIO).
     Freeze (hide, do not delete): FOMO in-count. */
  ROOM_CUT: '1.0',
  /* RAFFLE WIN POSTER locked 2026-08-20 — IMG_7854 / assets/raffle-win-lock.jpg
     THE WIN + giant WINNER + gold ticket (name + HE'S GOT IT) + Thunder host bottom + cast around.
     No fake TICKETS/PLAY/LEADERBOARD nav. Official bolt-heads only. */
  /* VISUAL PROOF PROTOCOL locked 2026-08-20 — VISUAL-PROOF-PROTOCOL.md
     Eyes approve. Show the visual in-chat. No description-as-proof. Design ≠ runtime. */
  VISUAL_PROOF_PROTOCOL: true,
  /* PRE-SHIP HUNTER locked 2026-08-20. Run before every credit. Phone is never first prototype. */
  PRE_SHIP_HUNTER: true,
  /* AUTHORITATIVE LINEAGE — do not package from mixed branches */
  SOURCE_PARENT: '20260818-p0-recovery1',
  REJECTED_ARCHIVES: ['20260818-whatsnext1', '20260818-header-safe1'],
  /* ── PRODUCT LOCK (2026-08-16 FINAL) ───────────────────────────
     This build freezes every signed-off system through cohe1/tap/voice/hero.
     Do not strip systems listed in SOURCE-OF-TRUTH.md without explicit user order.
     Housekeeping may repair collisions; it may not delete product surface.
     ───────────────────────────────────────────────────────────── */
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

  /* ── VISUAL LOCKS (do not regress) ─────────────────────────────
     Welcome bolt = assets/bolt-only.png (official mark), NOT emoji ⚡
     Must pulse via boltLive / --tb-breathe with every other bolt
     Logo: bolt-only effects; NEVER full-box gradient/slab on wordmark
     Install explainer: CapCut VO, H.264+AAC, keepAudio true
     ───────────────────────────────────────────────────────────── */
  /* LOGO CANON — OLD WORDMARK BANNED FOREVER
     Production header/splash/about MUST use assets/logo@2x.png + logo@3x.png
     derived ONLY from assets/CANONICAL/logo-official-7697-header.png (IMG_7697).
     Never restore pre-7697 white-outline / flat legacy wordmarks.
     Never keep *.old-backup logo files in the package.
  */
  LOGO_CANON: {
    master: 'assets/CANONICAL/logo-official-7697-header.png',
    header2x: 'assets/logo@2x.png',
    header3x: 'assets/logo@3x.png',
    about: 'assets/logo-about.png',
    banned: ['pre-7697-wordmark', 'white-outline-legacy', 'logo*.old-backup']
  },

  /* Brotherhood of Thunders — 24 personalities, one character. Tour + future group UI. */
  THUNDER_BROTHERHOOD: 'assets/tour-faces/BROTHERHOOD.json',

  /* Tour host idle — #tb-tour-host only. Breath + irregular glint/fidget/sway. No metronome. */
  TOUR_HOST_IDLE: true,

  /* LOCKED 2026-08-20 — Obie approved tour slides 2, 3, 4. Do not restyle.
     2 LOCKED IN / I'm In card
     3 BROTHERS grid — faces animate first, then bubble; 74px personalities
     4 MEMORIES — large tiles: patio, fire pit, lake (assets/tour-memories)
     Slide 6 Bond tux pop is separate. */
  TOUR_SLIDES_APPROVED: [2, 3, 4],

  /* Backstage FAB: head only, no arms. Float + glance/nod/shift/drift/bob/lean. Tap opens Ask. No glow. */
  BACKSTAGE_IDLE: true,

  /* Bubble library refresh: every 90 days. Run BUBBLE-REFRESH prompt in THUNDER-DECISIONS.md.
     Keep locked 10 encouragement. Refresh nuggets + feature rewards. Shuffle. 90s apart. */
  BUBBLE_REFRESH_EVERY_DAYS: 90,

  /* Cardinal: labels glow+pulse. Titles and body never do. */
  LABEL_PULSE: true,

  /* SPOTLIGHT LAW — locked 2026-08-20. Word bubbles never cover the star.
     Feature (logo, I'M IN, faces, memories, CTA) = full brightness, front layer.
     Rest of stage ~40% shadow. Bubble supporting: above/below/beside with a gap.
     Thunder never covers spotlight or bubble. Collision = move the bubble.
     Forbidden: bubble on OF THUNDER, I'M IN, brother faces, DROP A SHOT, live labels. */
  SPOTLIGHT_LAW: true,

  VISUAL_LOCKS: {
    welcomeBoltSrc: 'assets/bolt-only.png',
    welcomeBoltSize: 72,
    welcomeBoltPulse: true, // boltLive shared rhythm
    noEmojiWelcomeBolt: true,
    noFullBoxLogoGlow: true,
    installExplainerKeepAudio: true,
    saveRewardOnProfileAndMemory: true,
    oneBreathingUnit: true, // all ambient pulses --tb-breathe 4s delay 0
    livingHome: true, // gathering-day phases + personal name (never guess)
    theCodeRedGlow: true, // THE CODE = brand red #E30600 fill + red breathe glow — never yellow chip
    splashLogoPhoneCenter: true, // splash mark dead-center of the phone viewport
    emailOnlyAuth: true, // every sign-up/sign-in = email magic link. No password. Same LOCK YOUR SEAT sheet.
  },


  VENUE: 'Crooked Can Brewery Patio, Winter Garden',
  MEETING_TIME: '6:30 PM',

  /* ── INSTALL EXPLAINER (LOCKED) ─────────────────────────────────
     Source: CapCut VO cut. Asset: assets/install-explainer.mp4
     Encode: H.264 ~30fps ~540w + AAC voiceover + faststart.
     NEVER: mute permanently, strip audio, ship 120fps/HEVC, show native controls.
     Playback: HOW opens modal (user gesture) → try play WITH sound →
       if blocked, muted fallback + tap video to unmute/replay from 0 → loop.
     Close: pause + currentTime = 0.
     ─────────────────────────────────────────────────────────────── */

  /* ── SAVE REWARD (LOCKED) ─────────────────────────────────────
     ~3s Thunder pulse after successful profile save or new memory.
     Official bolt-only.png, masculine, no confetti / points / social.
     Only on real success — never on failed upload.
     ───────────────────────────────────────────────────────────── */

  /* ── SENSORY LIFE BLOOD (LOCKED) ───────────────────────────────
     Visual feedback is required on every platform.
     Vibration is optional Android progressive enhancement only.
     iPhone PWA has no navigator.vibrate — never force it.
     Semantic API only: thunderImpact / press / confirm / warningOrError / selection
     ───────────────────────────────────────────────────────────── */
  SENSORY: {
    vibrateEnabled: true,
    /* iPhone web/PWA: Vibration API unsupported — visual tactility only */
    iphoneVibrate: false,
    thunderImpactMs: 40,
    pressMs: 10,
    confirmMs: 25,
    warningPattern: [25, 60, 35],
    selectionMs: 8,
    debounceMs: 100,
    soundEnabled: true
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
    keepAudio: true,
    loop: true,
    noNativeControls: true
  },

  PUBLIC_ORIGIN: '',

  // Mild client-side UI gate only — NOT server security (View Source can reveal this).
  // Push broadcast and DB leadership writes use Supabase session + app_members role.
  // Change this sample before real use. Optional: same string only for opening Leadership UI.
  LEADER_PIN: 'thunder-board-lead',

  // SMS target as digit groups only — never shown in UI
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],

  // Supabase (publishable / anon key only — NEVER put service_role here)
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',

  // Exact Storage bucket name (private). Paths: private/<user_id>/<file>
  // Must match supabase-schema.sql bucket id/name
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',

  // Web Push — PUBLIC key only. Private key is Netlify env VAPID_PRIVATE_KEY (never in client).
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};
