window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260824-joel1',
  LAUNCH: {
    splashHoldMs: 200,
    splashFadeMs: 160,
    splashWatchMs: 500,
    extraCssMs: 800,
    extraJsMs: 900,
    roomBudgetMs: 600,
    lcpMs: 2500,
    inpMs: 200,
    cls: 0.1
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
  PUBLIC_ORIGIN: 'https://sonsofthunderboard.com',
  /* LEADER_PIN is a UI lock only. Server writes need a signed-in app_members leader. */
  LEADER_PIN: 'thunder-board-lead',
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};

/* 20260821-bday2: ghost-wordmark + birthday-honor lock companion */
(function () {
  try {
    var __tbB = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
    function addCss(href) {
      if (document.querySelector('link[href*="' + href.split('?')[0] + '"]')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href + '?v=' + encodeURIComponent(__tbB);
      (document.head || document.documentElement).appendChild(l);
    }
    function loadCompanions() {
      addCss('css/chief1-ghost.css');
      addCss('css/memories-latest.css');
      addCss('css/ask-clear.css');
      addCss('css/memories-page.css');
      addCss('css/website-wide.css');
      addCss('css/header-mark.css');
      addCss('css/hangout-tour.css');
      addCss('css/tour-roundtable.css');
    }
    if ('requestIdleCallback' in window) requestIdleCallback(loadCompanions, { timeout: 800 });
    else setTimeout(loadCompanions, (window.TB_CONFIG.LAUNCH && window.TB_CONFIG.LAUNCH.extraCssMs) || 800);

    try {
      var ev = document.querySelector('.nav-item[data-view="events"] span');
      if (ev) ev.textContent = 'Memories';
    } catch (eNav) {}

  } catch (e) {}
  function loadExtraJs() {
  try {
    if (!document.querySelector('script[src*="memories-grid.js"]')) {
      var mg = document.createElement('script');
      mg.src = 'js/memories-grid.js?v=' + encodeURIComponent(__tbB);
      mg.defer = true;
      (document.body || document.documentElement).appendChild(mg);
    }
  } catch (eSeed) {}
  try {

    if (!document.querySelector('script[src*="leader-door.js"]')) {
      var ld = document.createElement('script');
      ld.src = 'js/leader-door.js?v=' + encodeURIComponent(__tbB);
      ld.defer = true;
      (document.body || document.documentElement).appendChild(ld);
    }

    if (!document.querySelector('script[src*="nav-wire.js"]')) {
      var nw = document.createElement('script');
      nw.src = 'js/nav-wire.js?v=' + encodeURIComponent(__tbB);
      nw.defer = true;
      (document.body || document.documentElement).appendChild(nw);
    }


    if (!document.querySelector('script[src*="island-safe.js"]')) {
      var isf = document.createElement('script');
      isf.src = 'js/island-safe.js?v=' + encodeURIComponent(__tbB);
      (document.head || document.documentElement).appendChild(isf);
    }

    if (!document.querySelector('script[src*="tour-kill.js"]')) {
      var tk = document.createElement('script');
      tk.src = 'js/tour-kill.js?v=' + encodeURIComponent(__tbB);
      tk.defer = true;
      (document.body || document.documentElement).appendChild(tk);
    }

    if (!document.querySelector('script[src*="tour-first.js"]')) {
      var tf = document.createElement('script');
      tf.src = 'js/tour-first.js?v=' + encodeURIComponent(__tbB);
      tf.defer = true;
      (document.body || document.documentElement).appendChild(tf);
    }

    if (!document.querySelector('script[src*="more-legal.js"]')) {
      var ml = document.createElement('script');
      ml.src = 'js/more-legal.js?v=' + encodeURIComponent(__tbB);
      ml.defer = true;
      (document.body || document.documentElement).appendChild(ml);
    }

    if (!document.querySelector('script[src*="thunder-ask.js"]')) {
      var ta = document.createElement('script');
      ta.src = 'js/thunder-ask.js?v=' + encodeURIComponent(__tbB);
      ta.defer = true;
      (document.body || document.documentElement).appendChild(ta);
    }

    if (!document.querySelector('script[src*="ask-clear.js"]')) {
      var aj = document.createElement('script');
      aj.src = 'js/ask-clear.js?v=' + encodeURIComponent(__tbB);
      aj.defer = true;
      (document.body || document.documentElement).appendChild(aj);
    }


    if (!document.querySelector('script[src*="hangout-tour.js"]')) {
      var htj = document.createElement('script');
      htj.src = 'js/hangout-tour.js?v=' + encodeURIComponent(__tbB);
      htj.defer = true;
      (document.body || document.documentElement).appendChild(htj);
    }
    if (document.querySelector('script[src*="bday-autotext.js"]')) return;
    var s = document.createElement('script');
    s.src = 'js/bday-autotext.js?v=' + encodeURIComponent(__tbB);
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  } catch (e2) {}
  }
  setTimeout(loadExtraJs, (window.TB_CONFIG.LAUNCH && window.TB_CONFIG.LAUNCH.extraJsMs) || 900);
  setTimeout(function () {
    var v = window.__tbVitals = { lcp: 0, cls: 0, inp: 0 };
    try {
      if (!window.PerformanceObserver) return;
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (e) {
          v.lcp = Math.round(e.startTime);
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (e) {
          if (!e.hadRecentInput) v.cls = Math.round((v.cls + e.value) * 1000) / 1000;
        });
      }).observe({ type: 'layout-shift', buffered: true });
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (e) {
            var d = Math.round(e.duration || 0);
            if (d > v.inp) v.inp = d;
          });
        }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      } catch (eInp) {}
    } catch (eV) {}
  }, 1200);
})();

/* 20260823-auto1: old Home Screen copies fetch live build on open and retarget extras. */
(function () {
  var here = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '';
  function check() {
    try {
      var splash = document.getElementById('splash');
      if (splash && !splash.classList.contains('splash-done') && !splash.classList.contains('hidden')) {
        setTimeout(check, 400);
        return;
      }
      fetch('build.json?_=' + Date.now(), { cache: 'no-store' }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (j) {
        if (!j || !here) return;
        if (String(j.APP_BUILD || '') === String(here)) return;
        try { sessionStorage.setItem('tb_reloading', String(j.APP_BUILD)); } catch (e0) {}
        try { location.reload(); } catch (e1) {}
      }).catch(function () {});
    } catch (e2) {}
  }
  setTimeout(check, 1800);
})();
