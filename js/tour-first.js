/* First visit: walk the room. Returners who already finished stay quiet.
   More → TAKE THE TOUR still replays. Patio QR and magic-link sign-in skip.
   20260822-tourclose1: last step / completeTour lands in the room.
   No offerHomeScreen from tour finish. Skip tux swap. Copy stays Drop a pic. */
(function () {
  var started = false;
  var bound = false;
  var closing = false;

  function tourDone() {
    try {
      var raw = localStorage.getItem('tb_thunderTourV42');
      var s = raw ? JSON.parse(raw) : null;
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

  function splashClear() {
    try {
      if (sessionStorage.getItem('tb_splash_done') === '1') return true;
    } catch (e) {}
    var el = document.getElementById('splash');
    if (!el) return true;
    return el.classList.contains('splash-done') || el.classList.contains('hidden') || el.classList.contains('splash-out');
  }

  function markOffered() {
    try { localStorage.setItem('tb_tb_tour_offered', '1'); } catch (e) {}
  }

  function muteTourInstallPitch() {
    /* completeTour still schedules offerHomeScreen('tour') at 900ms.
       That path bails if this flag is already set. imin/alerts still allowed. */
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
    if (body) body.textContent = 'Questions? I\u2019m in the corner. Tap me when you\u2019re ready. You\u2019re set, brother.';
    if (progress) progress.textContent = '6 OF 6';
    if (next) next.textContent = 'LET\u2019S GO';
    if (stage) {
      stage.classList.remove('tb-finale-leave');
      stage.setAttribute('data-board', '5');
    }
  }

  function finishTour(skipped) {
    if (closing) return;
    closing = true;
    try {
      localStorage.setItem('tb_thunderTourV42', JSON.stringify({
        done: true,
        completed: !skipped,
        skipped: !!skipped,
        at: Date.now()
      }));
    } catch (e) {}
    muteTourInstallPitch();
    try {
      var stage = document.querySelector('#tb-tour .tb-tour-stage');
      if (stage) stage.classList.remove('tb-finale-leave');
    } catch (e2) {}
    var root = document.getElementById('tb-tour');
    if (root) {
      root.classList.add('hidden');
      root.setAttribute('aria-hidden', 'true');
    }
    if (document.body) {
      document.body.classList.remove('tb-tour-open');
      document.body.classList.remove('tb-tour-mandatory');
    }
    showRoom();
    setTimeout(muteTourInstallPitch, 200);
    setTimeout(muteTourInstallPitch, 950);
    setTimeout(function () { closing = false; }, 1200);
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

  function showExits() {
    ['tb-tour-skip', 'tb-tour-close'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('hidden');
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', 'false');
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
    });
    var next = document.getElementById('tb-tour-next');
    if (next) {
      next.style.pointerEvents = 'auto';
      if (isLastStep()) next.textContent = 'LET\u2019S GO';
    }
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

  function bindRescue() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('#tb-tour-next') : null;
      if (!t || !document.body.classList.contains('tb-tour-open')) return;
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
        return;
      }
    }, true);
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('#tb-tour-close, #tb-tour-skip') : null;
      if (!t) return;
      setTimeout(function () {
        if (document.body.classList.contains('tb-tour-open')) finishTour(true);
      }, 180);
    }, false);
    setInterval(function () {
      if (document.body && document.body.classList.contains('tb-tour-open')) showExits();
      patchToast();
    }, 400);
  }

  function go() {
    if (started) return;
    if (tourDone()) return;
    if (fromPatio()) return;
    if (authLanding()) return;
    if (document.body && document.body.classList.contains('tb-tour-open')) return;
    if (typeof window.startTour !== 'function') return;
    if (!splashClear()) return;
    started = true;
    markOffered();
    try { window.startTour(); } catch (e) { started = false; }
  }

  function tick() {
    try { go(); } catch (e) {}
    try { bindRescue(); } catch (e2) {}
    try { patchToast(); } catch (e3) {}
    if (started || tourDone()) return;
    setTimeout(tick, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 800); });
  } else {
    setTimeout(tick, 800);
  }
  setTimeout(tick, 2600);
  bindRescue();
})();
