/* First visit: walk the room. Returners who already finished stay quiet.
   More → TAKE THE TOUR still replays. Patio QR and magic-link sign-in skip.
   20260822-flowfix1: last step always completes; close/done always offered;
   DROP A SHOT copy → Drop a pic. */
(function () {
  var started = false;
  var bound = false;

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

  function finishTour(skipped) {
    try {
      localStorage.setItem('tb_thunderTourV42', JSON.stringify({
        done: true,
        completed: !skipped,
        skipped: !!skipped,
        at: Date.now()
      }));
    } catch (e) {}
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
  }

  function progressText() {
    var p = document.getElementById('tb-tour-progress');
    return ((p && p.textContent) || '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function isLastStep() {
    var t = progressText();
    var m = t.match(/(\d+)\s*OF\s*(\d+)/);
    if (m) return Number(m[1]) >= Number(m[2]);
    return false;
  }

  function isStep(n) {
    var t = progressText();
    var m = t.match(/(\d+)\s*OF\s*(\d+)/);
    return !!(m && Number(m[1]) === n);
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
      if (isLastStep()) next.textContent = 'DONE';
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
        finishTour(false);
        return;
      }
      if (isStep(5)) {
        setTimeout(function () {
          if (!document.body.classList.contains('tb-tour-open')) return;
          if (isStep(5)) finishTour(false);
        }, 900);
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
