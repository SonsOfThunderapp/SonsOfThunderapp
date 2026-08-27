window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260827-imin1',
  RSVP_PRESENCE: {
    publicOnHome: true,
    seedFloor: 0,
    anchorName: 'Obie',
    openChairCopy: true
  },
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
  ONE_PUSH_DEPLOY: true,
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
    keepAudio: false,
    loop: true,
    noNativeControls: true
  },
  PUBLIC_ORIGIN: 'https://sonsofthunderboard.com',
  LEADER_PIN: 'thunder-board-lead',
  LEADER_SMS_PARTS: ['40', '77', '39', '62', '43'],
  SUPABASE_URL: 'https://mnsempcgomukcpofgvlm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_QkUCt8trZ0vUwXmqfaUQwg_qXZ5_87m',
  MEMORIES_BUCKET: 'Sons Of Thunder Memories',
  THEATER_BUCKET: 'thunder-theater',
  VAPID_PUBLIC_KEY: 'BGRjLCD3QnLBxb2VFNgxpGcJ1Ptxosp8yGq8yiJTGm2YS8OHVYsOhVvCFpmyREbeQsmsq6NaJ42j9yMx19Vl6hE'
};

if (!window.supabase || !window.supabase.createClient) {
  document.write('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js"><\/script>');
}

(function () {
  try {
    var __tbB = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
    function addCss(needle, href) {
      if (document.querySelector('link[href*="' + needle + '"]')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href + '?v=' + encodeURIComponent(__tbB);
      (document.head || document.documentElement).appendChild(l);
    }
    function addJs(needle, src) {
      if (document.querySelector('script[src*="' + needle + '"]')) return;
      var s = document.createElement('script');
      s.src = src + '?v=' + encodeURIComponent(__tbB);
      s.defer = true;
      (document.body || document.documentElement).appendChild(s);
    }
    addCss('chief1-ghost.css', 'css/chief1-ghost.css');
    addCss('memories-latest.css', 'css/memories-latest.css');
    addCss('ask-clear.css', 'css/ask-clear.css');
    addCss('memories-page.css', 'css/memories-page.css');
    addCss('events-mission-stack.css', 'css/events-mission-stack.css');
    addCss('imin-settle.css', 'css/imin-settle.css');
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
    addCss('header-mark.css', 'css/header-mark.css');
    addCss('hangout-tour.css', 'css/hangout-tour.css');
    addCss('tour-roundtable.css', 'css/tour-roundtable.css');
    addCss('seat-footer.css', 'css/seat-footer.css');
    try {
      var ev = document.querySelector('.nav-item[data-view="events"] span');
      if (ev) ev.textContent = 'Memories';
    } catch (eNav) {}
    addJs('supabase-js@2.49.4/dist/umd', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js');
    addJs('commit-reward.js', 'js/commit-reward.js');
    addJs('memories-grid.js', 'js/memories-grid.js');
    addJs('memories-lead.js', 'js/memories-lead.js');
    addJs('text-leader-brothers.js', 'js/text-leader-brothers.js');
    addJs('guest-qr-signin.js', 'js/guest-qr-signin.js');
    addJs('brothers-chair.js', 'js/brothers-chair.js');
    addJs('own-card-edit.js', 'js/own-card-edit.js');
    addJs('leader-door.js', 'js/leader-door.js');
    addJs('nav-wire.js', 'js/nav-wire.js');
    addJs('island-safe.js', 'js/island-safe.js');
    addJs('tour-kill.js', 'js/tour-kill.js');
    addJs('tour-first.js', 'js/tour-first.js');
    addJs('more-legal.js', 'js/more-legal.js');
    addJs('thunder-ask.js', 'js/thunder-ask.js');
    addJs('ask-clear.js', 'js/ask-clear.js');
    addJs('hangout-tour.js', 'js/hangout-tour.js');
    addCss('home-month-film.css', 'css/home-month-film.css');
    addCss('theater-month.css', 'css/theater-month.css');
    addJs('theater-compress.js', 'js/theater-compress.js');
    addJs('home-month-film.js', 'js/home-month-film.js');
    addJs('tb-sb-bridge.js', 'js/tb-sb-bridge.js');
    addJs('theater-month.js', 'js/theater-month.js');
    if (!document.querySelector('script[src*="bday-autotext.js"]')) {
      addJs('bday-autotext.js', 'js/bday-autotext.js');
    }
  } catch (e2) {}
})();

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
