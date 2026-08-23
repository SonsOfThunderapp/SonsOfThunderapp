window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260823-close1',
  /* First-run tour does NOT auto-start. New phone lands in the room.
     Already finished (thunderTourV42 done) = no nag. More → TAKE THE TOUR remains. */
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
    master: 'assets/CANONICAL/logo-official-7697-header.png',
    header2x: 'assets/logo@2x.png',
    header3x: 'assets/logo@3x.png',
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
  LEADER_PIN: 'thunder-board-lead',
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};

/* 20260821-bday2: ghost-wordmark + birthday-honor lock companion */
(function () {
  try {
    if (!document.querySelector('link[href*="chief1-ghost.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/chief1-ghost.css?v=20260822-chrome6';
      (document.head || document.documentElement).appendChild(l);
    }

    if (!document.querySelector('link[href*="memories-latest.css"]')) {
      var m = document.createElement('link');
      m.rel = 'stylesheet';
      m.href = 'css/memories-latest.css?v=20260822-chrome6';
      (document.head || document.documentElement).appendChild(m);
    }

    if (!document.querySelector('link[href*="ask-clear.css"]')) {
      var ac = document.createElement('link');
      ac.rel = 'stylesheet';
      ac.href = 'css/ask-clear.css?v=20260822-chrome6';
      (document.head || document.documentElement).appendChild(ac);
    }

    if (!document.querySelector('link[href*="memories-page.css"]')) {
      var p = document.createElement('link');
      p.rel = 'stylesheet';
      p.href = 'css/memories-page.css?v=20260822-chrome6';
      (document.head || document.documentElement).appendChild(p);
    }
    var __tbB = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
    var ww = document.querySelector('link[href*="website-wide.css"]');
    var wwHref = 'css/website-wide.css?v=' + encodeURIComponent(__tbB);
    if (!ww) {
      ww = document.createElement('link');
      ww.rel = 'stylesheet';
      ww.href = wwHref;
      (document.head || document.documentElement).appendChild(ww);
    } else if ((ww.getAttribute('href') || '').indexOf('v=' + __tbB) === -1) {
      ww.href = wwHref;
    }

    if (!document.querySelector('link[href*="hangout-tour.css"]')) {
      var ht = document.createElement('link');
      ht.rel = 'stylesheet';
      ht.href = 'css/hangout-tour.css?v=20260823-hang7';
      (document.head || document.documentElement).appendChild(ht);
    }

    try {
      var ev = document.querySelector('.nav-item[data-view="events"] span');
      if (ev) ev.textContent = 'Memories';
    } catch (eNav) {}

  } catch (e) {}
  try {
    if (!document.querySelector('script[src*="memories-grid.js"]')) {
      var mg = document.createElement('script');
      mg.src = 'js/memories-grid.js?v=20260822-chrome7';
      mg.defer = true;
      (document.body || document.documentElement).appendChild(mg);
    }
  } catch (eSeed) {}
  try {

    if (!document.querySelector('script[src*="leader-door.js"]')) {
      var ld = document.createElement('script');
      ld.src = 'js/leader-door.js?v=20260823-lead1';
      ld.defer = true;
      (document.body || document.documentElement).appendChild(ld);
    }

    if (!document.querySelector('script[src*="nav-wire.js"]')) {
      var nw = document.createElement('script');
      nw.src = 'js/nav-wire.js?v=20260822-chrome6';
      nw.defer = true;
      (document.body || document.documentElement).appendChild(nw);
    }


    if (!document.querySelector('script[src*="island-safe.js"]')) {
      var isf = document.createElement('script');
      isf.src = 'js/island-safe.js?v=20260823-share1';
      (document.head || document.documentElement).appendChild(isf);
    }

    if (!document.querySelector('script[src*="tour-kill.js"]')) {
      var tk = document.createElement('script');
      tk.src = 'js/tour-kill.js?v=20260823-bub1';
      tk.defer = true;
      (document.body || document.documentElement).appendChild(tk);
    }

    if (!document.querySelector('script[src*="tour-first.js"]')) {
      var tf = document.createElement('script');
      tf.src = 'js/tour-first.js?v=20260822-chrome6';
      tf.defer = true;
      (document.body || document.documentElement).appendChild(tf);
    }

    if (!document.querySelector('script[src*="more-legal.js"]')) {
      var ml = document.createElement('script');
      ml.src = 'js/more-legal.js?v=20260822-chrome6';
      ml.defer = true;
      (document.body || document.documentElement).appendChild(ml);
    }

    if (!document.querySelector('script[src*="thunder-ask.js"]')) {
      var ta = document.createElement('script');
      ta.src = 'js/thunder-ask.js?v=20260823-gold1e';
      ta.defer = true;
      (document.body || document.documentElement).appendChild(ta);
    }

    if (!document.querySelector('script[src*="ask-clear.js"]')) {
      var aj = document.createElement('script');
      aj.src = 'js/ask-clear.js?v=20260822-chrome6';
      aj.defer = true;
      (document.body || document.documentElement).appendChild(aj);
    }


    if (!document.querySelector('script[src*="hangout-tour.js"]')) {
      var htj = document.createElement('script');
      htj.src = 'js/hangout-tour.js?v=20260823-push1';
      htj.defer = true;
      (document.body || document.documentElement).appendChild(htj);
    }
    if (document.querySelector('script[src*="bday-autotext.js"]')) return;
    var s = document.createElement('script');
    s.src = 'js/bday-autotext.js?v=20260822-chrome6';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  } catch (e2) {}
})();

/* 20260823-auto1: old Home Screen copies fetch live build on open and retarget extras. */
(function () {
  var here = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '';
  try {
    fetch('build.json?_=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (j) {
      if (!j || !here) return;
      if (String(j.APP_BUILD || '') === String(here)) return;
      try { sessionStorage.setItem('tb_reloading', String(j.APP_BUILD)); } catch (e0) {}
      try { location.reload(); } catch (e1) {}
    }).catch(function () {});
  } catch (e2) {}
})();
