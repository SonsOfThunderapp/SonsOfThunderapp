window.TB_CONFIG = {
  // Bumped with each production zip so phones can detect a new build
  APP_BUILD: '20260829-door-own',
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
    warningMs: 25,
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
    function addPaint(hrefCss, srcJs) {
      if (!document.querySelector('link[href*="first-paint.css"]')) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = hrefCss + '?v=' + encodeURIComponent(__tbB);
        (document.head || document.documentElement).appendChild(l);
      }
      if (!document.querySelector('script[src*="first-paint.js"]')) {
        var s = document.createElement('script');
        s.src = srcJs + '?v=' + encodeURIComponent(__tbB);
        s.defer = false;
        (document.head || document.documentElement).appendChild(s);
      }
    }
    addPaint('css/first-paint.css', 'js/first-paint.js');
    addCss('text-leader-quiet.css', 'css/text-leader-quiet.css');
    addCss('imin-settle.css', 'css/imin-settle.css');
    addCss('lastfire-gone.css', 'css/lastfire-gone.css');
    addCss('header-mark.css', 'css/header-mark.css');
    addCss('seat-footer.css', 'css/seat-footer.css');
    addCss('auth-seat.css', 'css/auth-seat.css');
    addCss('seat-repair.css', 'css/seat-repair.css');
    addJs('auth-seat.js', 'js/auth-seat.js');
    addJs('seat-repair.js', 'js/seat-repair.js');
    addCss('chair-claim.css', 'css/chair-claim.css');
    addJs('chair-claim.js', 'js/chair-claim.js');
    addCss('home-film-poster.css', 'css/home-film-poster.css');
    addJs('home-film-poster.js', 'js/home-film-poster.js');
    addCss('header-slim.css', 'css/header-slim.css');
    addCss('sharpen-up.css', 'css/sharpen-up.css');
    addCss('seat-attach.css', 'css/seat-attach.css');
    addJs('seat-attach.js', 'js/seat-attach.js');
    addJs('memories-wake.js', 'js/memories-wake.js');
    addCss('mission-gone.css', 'css/mission-gone.css');
    addCss('seat-pencil.css', 'css/seat-pencil.css');
    addJs('seat-edit-btn.js', 'js/seat-edit-btn.js');
    try {
      var ev = document.querySelector('.nav-item[data-view="events"] span');
      if (ev) ev.textContent = 'Memories';
    } catch (eNav) {}
    addCss('tab-hold.css', 'css/tab-hold.css');
    addJs('tab-hold.js', 'js/tab-hold.js');
    addCss('home-only-pull.css', 'css/home-only-pull.css');
    addJs('home-only-pull.js', 'js/home-only-pull.js');
    addCss('no-ios-ptr.css', 'css/no-ios-ptr.css');
    addCss('proof-plate.css', 'css/proof-plate.css');
    addCss('imin-hit.css', 'css/imin-hit.css');
    addCss('chair-ring.css', 'css/chair-ring.css');
    addCss('card-chips.css', 'css/card-chips.css');
    addJs('card-chips.js', 'js/card-chips.js');
    addCss('logo-home.css', 'css/logo-home.css');
    addCss('live-home.css', 'css/live-home.css');
    addCss('ask-hit.css', 'css/ask-hit.css');
    addJs('first-job.js', 'js/first-job.js');
    addJs('theater-sound.js', 'js/theater-sound.js');
    addCss('proof-btn.css', 'css/proof-btn.css');
    addJs('proof-btn.js', 'js/proof-btn.js');
    addJs('hush-bubble.js', 'js/hush-bubble.js');
    addCss('ptr-kill.css', 'css/ptr-kill.css');
    addCss('week-lines.css', 'css/week-lines.css');
    addJs('week-lines.js', 'js/week-lines.js');
    addJs('seat-dead.js', 'js/seat-dead.js');
    addCss('proof-pipe.css', 'css/proof-pipe.css');
    addJs('proof-pipe.js', 'js/proof-pipe.js');
    addCss('chair-stack.css', 'css/chair-stack.css');
    addJs('chair-stack.js', 'js/chair-stack.js');
    addJs('mem-more-stay.js', 'js/mem-more-stay.js');
    addCss('mem-tight.css', 'css/mem-tight.css');
    addCss('thunder-same.css', 'css/thunder-same.css');
    addJs('theater-loud.js', 'js/theater-loud.js');
    addCss('grid-back.css', 'css/grid-back.css');
    addJs('grid-back.js', 'js/grid-back.js');
    addJs('tb-island-loader.js', 'js/tb-island-loader.js');
  } catch (e2) {}
})();
