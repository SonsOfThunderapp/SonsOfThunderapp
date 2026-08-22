/* First visit lands in the room (Home). Tour does NOT auto-start.
   More → TAKE THE TOUR still calls startTour if it exists.
   20260822-noroomtrap1: capture Skip/X/SKIP TOUR always dismisses.
   1s failsafe if overlay is still open. Typewriter timers killed. No install pitch. */
(function () {
  var bound = false;
  var closing = false;
  var lastBody = '';
  var lastBodyAt = 0;

  var FULL_LINES = [
    'I\u2019m Thunder. I\u2019ve got your back. Let me show you around.',
    'I\'m Thunder. I\'ve got your back. Let me show you around.',
    'Tap I\u2019M IN. We save your seat and remind you so you don\u2019t miss it.',
    'This is where we stay connected. Names. Faces. A seat for every man — like knights at one table.',
    'The nights we keep. Drop a photo. Build the history.',
    'Rough day? Hard season? Text a leader. Confidential. Always.',
    'Questions? I\u2019m in the corner. Tap me when you\u2019re ready. You\u2019re set, brother.'
  ];

  function tourDone() {
    try {
      var raw = localStorage.getItem('tb_thunderTourV42');
      if (!raw) return false;
      if (raw === 'done' || raw === 'true') return true;
      var s = JSON.parse(raw);
      return !!(s && s.done);
    } catch (e) { return false; }
  }

  function fromPatio() {
    try { return sessionStorage.getItem('tb_patio') === '1'; } catch (e) { return false; }
  }

  function authLanding() {
    try {
      var h = String(location.hash || '');
      var s = String(location.search || '');
      return /access_token|refresh_token|type=magiclink|type=signup|type=recovery/i.test(h + s);
    } catch (e) { return false; }
  }

  function muteTourInstallPitch() {
    try { sessionStorage.setItem('tb_a2hs_shown', '1'); } catch (e) {}
    ['ios-install-overlay', 'inapp-install-overlay', 'welcome', 'imin-a2hs-sheet'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
    });
    var a2 = document.getElementById('home-a2hs');
    if (a2) a2.classList.add('hidden');
    try { document.body.classList.remove('cal-sheet-open', 'tb-axum-open'); } catch (e2) {}
  }

  function showRoom() {
    var home = document.getElementById('view-home');
    if (home) {
      document.querySelectorAll('#views .view, section.view').forEach(function (v) {
        v.classList.remove('active');
      });
      home.classList.add('active');
    }
    document.querySelectorAll('.nav-item').forEach(function (n) {
      var on = n.getAttribute('data-view') === 'home';
      n.classList.toggle('active', on);
    });
    try { window.scrollTo(0, 0); } catch (e3) {}
  }

  function killTypewriterTimers() {
    var keys = [
      'tbTypeTimer', '__tbTypeTimer', 'tbTourTypeTimer', '__tbTourTypeTimer',
      'typewriterTimer', '__typewriterTimer', 'tbTourTw', '__tbTourTw',
      'tourTypeId', '__tourTypeId', 'tbTwId', '__tbTwId'
    ];
    keys.forEach(function (k) {
      try {
        var v = window[k];
        if (typeof v === 'number') {
          clearTimeout(v);
          clearInterval(v);
          window[k] = null;
        }
      } catch (e) {}
    });
    try {
      Object.keys(window).forEach(function (k) {
        if (!/typewriter|tourType|tbType|twTimer/i.test(k)) return;
        var v = window[k];
        if (typeof v === 'number') {
          clearTimeout(v);
          clearInterval(v);
        }
      });
    } catch (e2) {}
  }

  function paintLastCopyNoTux() {
    var headline = document.getElementById('tb-tour-headline');
    var sub = document.getElementById('tb-tour-sub');
    var body = document.getElementById('tb-tour-body');
    var progress = document.getElementById('tb-tour-progress');
    var next = document.getElementById('tb-tour-next');
    var stage = document.querySelector('#tb-tour .tb-tour-stage');
    if (headline) headline.textContent = 'ASK THUNDER';
    if (sub) {
      sub.textContent = 'AT YOUR SERVICE';
      sub.classList.remove('hidden');
    }
    if (body) {
      body.textContent = 'Questions? I\u2019m in the corner. Tap me when you\u2019re ready. You\u2019re set, brother.';
      body.classList.remove('tb-tour-typing');
    }
    if (progress) progress.textContent = '6 OF 6';
    if (next) {
      next.textContent = 'LET\u2019S GO';
      next.disabled = false;
      next.removeAttribute('disabled');
      next.style.setProperty('pointer-events', 'auto', 'important');
    }
    if (stage) {
      stage.classList.remove('tb-finale-leave');
      stage.setAttribute('data-board', '5');
    }
  }

  function enableLetsGo() {
    var next = document.getElementById('tb-tour-next');
    if (!next) return;
    next.disabled = false;
    next.removeAttribute('disabled');
    next.removeAttribute('hidden');
    next.classList.remove('hidden');
    next.style.setProperty('pointer-events', 'auto', 'important');
    next.style.setProperty('visibility', 'visible', 'important');
    next.style.setProperty('opacity', '1', 'important');
  }

  function finishSentenceNow() {
    var body = document.getElementById('tb-tour-body');
    if (!body) return;
    var cur = body.textContent || '';
    var full = null;
    var i;
    for (i = 0; i < FULL_LINES.length; i++) {
      if (FULL_LINES[i].indexOf(cur) === 0 && FULL_LINES[i].length > cur.length) {
        full = FULL_LINES[i];
        break;
      }
    }
    if (!full && /Let me sh/i.test(cur)) full = FULL_LINES[0];
    if (full) body.textContent = full;
    body.classList.remove('tb-tour-typing');
    enableLetsGo();
  }

  function watchTypewriter() {
    if (!document.body || !document.body.classList.contains('tb-tour-open')) return;
    var body = document.getElementById('tb-tour-body');
    if (!body) return;
    var txt = body.textContent || '';
    var now = Date.now();
    if (txt !== lastBody) {
      lastBody = txt;
      lastBodyAt = now;
      return;
    }
    if (!lastBodyAt) lastBodyAt = now;
    if (now - lastBodyAt < 800) return;
    var incomplete = body.classList.contains('tb-tour-typing');
    var i;
    for (i = 0; i < FULL_LINES.length; i++) {
      if (FULL_LINES[i].indexOf(txt) === 0 && FULL_LINES[i].length > txt.length) {
        incomplete = true;
        break;
      }
    }
    if (incomplete) finishSentenceNow();
  }

  function hideTourOverlay() {
    var root = document.getElementById('tb-tour');
    if (root) {
      root.classList.add('hidden');
      root.setAttribute('aria-hidden', 'true');
      root.style.setProperty('display', 'none', 'important');
      root.style.setProperty('pointer-events', 'none', 'important');
    }
    if (document.body) {
      document.body.classList.remove('tb-tour-open');
      document.body.classList.remove('tb-tour-mandatory');
    }
  }

  function markTourDone(skipped) {
    try {
      localStorage.setItem('tb_thunderTourV42', 'done');
    } catch (e) {}
    try {
      localStorage.setItem('tb_thunderTourV42_meta', JSON.stringify({
        done: true,
        completed: !skipped,
        skipped: !!skipped,
        at: Date.now()
      }));
    } catch (e2) {}
  }

  function finishTour(skipped) {
    var stillOpen = !!(document.body && document.body.classList.contains('tb-tour-open'));
    var rootNow = document.getElementById('tb-tour');
    var rootVis = !!(rootNow && !rootNow.classList.contains('hidden') &&
      rootNow.style.display !== 'none');
    if (closing && !stillOpen && !rootVis) return;
    closing = true;
    killTypewriterTimers();
    markTourDone(skipped);
    muteTourInstallPitch();
    try {
      var stage = document.querySelector('#tb-tour .tb-tour-stage');
      if (stage) stage.classList.remove('tb-finale-leave');
    } catch (e2) {}
    hideTourOverlay();
    showRoom();
    setTimeout(muteTourInstallPitch, 200);
    setTimeout(muteTourInstallPitch, 950);
    setTimeout(function () { closing = false; }, 400);
  }

  function progressText() {
    var p = document.getElementById('tb-tour-progress');
    return ((p && p.textContent) || '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function stepNums() {
    var t = progressText();
    var m = t.match(/(\d+)\s*OF\s*(\d+)/);
    if (!m) return null;
    return { n: Number(m[1]), total: Number(m[2]) };
  }

  function isLastStep() {
    var s = stepNums();
    if (s) return s.n >= s.total;
    var stage = document.querySelector('#tb-tour .tb-tour-stage');
    return !!(stage && stage.getAttribute('data-board') === '5');
  }

  function isStep(n) {
    var s = stepNums();
    return !!(s && s.n === n);
  }

  function armExits() {
    ['tb-tour-skip', 'tb-tour-close'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('hidden');
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
      el.style.setProperty('display', 'inline-flex', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('pointer-events', 'auto', 'important');
      el.style.setProperty('opacity', '1', 'important');
    });
    enableLetsGo();
    var next = document.getElementById('tb-tour-next');
    if (next && isLastStep()) next.textContent = 'LET\u2019S GO';
    fixShotCopy();
  }

  function fixShotCopy() {
    ['tb-tour-sub', 'tb-tour-body', 'tb-tour-headline'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var txt = el.textContent || '';
      if (/DROP A SHOT/i.test(txt)) el.textContent = txt.replace(/DROP A SHOT/gi, 'Drop a pic');
    });
  }

  function patchToast() {
    if (window.__tbShotToastPatched) return;
    var fn = window.showInstallToast;
    if (typeof fn !== 'function') return;
    window.__tbShotToastPatched = true;
    window.showInstallToast = function (msg) {
      if (typeof msg === 'string') msg = msg.replace(/DROP A SHOT/gi, 'Drop a pic');
      var args = [msg];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      return fn.apply(this, args);
    };
  }

  function isExitTarget(el) {
    if (!el) return false;
    var node = el.nodeType === 3 ? el.parentElement : el;
    if (!node || !node.closest) return false;
    if (node.closest('#tb-tour-skip, #tb-tour-close, [data-tour-skip], .tb-tour-skip')) return true;
    var walk = node;
    var hops = 0;
    while (walk && hops < 6) {
      var id = (walk.id || '').toLowerCase();
      var cls = String(walk.className || '').toLowerCase();
      var txt = ((walk.textContent || '').replace(/\s+/g, ' ').trim()).toUpperCase();
      if (id === 'tb-tour-skip' || id === 'tb-tour-close') return true;
      if (/(^|\s)tb-tour-skip(\s|$)/.test(cls)) return true;
      if (txt === 'SKIP TOUR' || txt === 'SKIP' || txt === '×' || txt === 'X' || txt === '✕') return true;
      if (walk.getAttribute && walk.getAttribute('aria-label')) {
        var al = String(walk.getAttribute('aria-label')).toUpperCase();
        if (/SKIP TOUR|CLOSE/.test(al) && walk.closest && walk.closest('#tb-tour')) return true;
      }
      walk = walk.parentElement;
      hops++;
    }
    return false;
  }

  function tourOverlayVisible() {
    var root = document.getElementById('tb-tour');
    if (!root) return false;
    if (root.classList.contains('hidden')) return false;
    var cs = window.getComputedStyle ? window.getComputedStyle(root) : null;
    if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
    return true;
  }

  function bindRescue() {
    if (bound) return;
    bound = true;
    function onExit(e) {
      if (!isExitTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      try { e.stopImmediatePropagation(); } catch (err) {}
      finishTour(true);
    }
    document.addEventListener('pointerdown', onExit, true);
    document.addEventListener('click', onExit, true);
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('#tb-tour-next') : null;
      if (!t || !document.body.classList.contains('tb-tour-open')) return;
      if (document.getElementById('tb-tour-body') &&
          document.getElementById('tb-tour-body').classList.contains('tb-tour-typing')) {
        finishSentenceNow();
      }
      if (isLastStep()) {
        e.preventDefault();
        e.stopPropagation();
        try { e.stopImmediatePropagation(); } catch (err) {}
        muteTourInstallPitch();
        finishTour(false);
        return;
      }
      if (isStep(5)) {
        e.preventDefault();
        e.stopPropagation();
        try { e.stopImmediatePropagation(); } catch (err2) {}
        paintLastCopyNoTux();
        fixShotCopy();
        muteTourInstallPitch();
        setTimeout(function () { finishTour(false); }, 280);
      }
    }, true);
    setInterval(function () {
      if (document.body && document.body.classList.contains('tb-tour-open')) {
        armExits();
        watchTypewriter();
      }
      patchToast();
    }, 200);
  }

  function failsafeDismiss() {
    setTimeout(function () {
      var open = !!(document.body && document.body.classList.contains('tb-tour-open'));
      if (open && tourOverlayVisible()) finishTour(true);
    }, 1000);
  }

  /* NO auto-start. New phone lands on Home. More → TAKE THE TOUR uses window.startTour. */
  void tourDone;
  void fromPatio;
  void authLanding;

  function boot() {
    try { bindRescue(); } catch (e) {}
    try { patchToast(); } catch (e2) {}
    try { muteTourInstallPitch(); } catch (e3) {}
    failsafeDismiss();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  bindRescue();
})();
