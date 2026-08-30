/* 20260830-slow-pull
   Home only. Slow committed pull. Then latest build on iPhone and Android.
   Flick does nothing. Other views never reload. Seat / sb-* stay. No app.js. */
(function () {
  if (window.__tbHomeOnlyPull) return;
  window.__tbHomeOnlyPull = true;

  var THRESH = 128;
  var MAX_PULL = 176;
  var TOP_ZONE = 160;
  var SLOW_MS = 450;
  var DAMP = 0.2;
  var startY = 0;
  var startX = 0;
  var startT = 0;
  var armed = false;
  var pulling = false;
  var fired = false;

  function onHome() {
    if (document.querySelector('#view-brothers.active, #view-events.active, #view-about.active')) return false;
    if (document.querySelector('.view.active:not(#view-home)')) return false;
    var nav = document.querySelector('.bottom-nav [data-view].active, .nav-item[data-view].active');
    if (nav) {
      var dv = nav.getAttribute('data-view') || '';
      if (dv && dv !== 'home') return false;
    }
    if (document.body.classList.contains('tb-view-brothers') ||
        document.body.classList.contains('tb-view-events') ||
        document.body.classList.contains('tb-view-about')) return false;
    var home = document.getElementById('view-home');
    return !!(home && home.classList.contains('active'));
  }

  function inSheet(t) {
    if (!t || !t.closest) return false;
    return !!t.closest(
      '.modal, #brother-detail, #info-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-modal, #thunder-panel, #axum-drop, #tb-tour, #auth-gate'
    );
  }

  function mark() {
    return document.getElementById('header-logo') || document.querySelector('#main-header img');
  }

  function rubber(dy) {
    var el = mark();
    var y = Math.max(0, Math.min(MAX_PULL, dy));
    var ready = y >= THRESH;
    document.body.classList.toggle('tb-home-pulling', y > 8);
    document.body.classList.toggle('tb-home-armed', ready);
    if (!el) return;
    el.style.transform = y ? 'translateY(' + Math.round(y * DAMP) + 'px)' : '';
    el.classList.toggle('is-pulling', y > 8);
    el.classList.toggle('is-armed', ready);
  }

  function snap() {
    var el = mark();
    document.body.classList.remove('tb-home-pulling', 'tb-home-armed');
    if (el) {
      el.style.transform = '';
      el.classList.remove('is-pulling', 'is-armed');
    }
  }

  function latest() {
    if (fired) return;
    fired = true;
    snap();
    try {
      if (typeof window.tbToast === 'function') window.tbToast('BOARD UPDATED', 1800);
    } catch (e0) {}
    var t = Date.now();
    var keep = 'tb-share';
    var bust = function (path) {
      return fetch(path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + t, { cache: 'reload', credentials: 'same-origin' }).catch(function () {});
    };
    var chain = Promise.all([
      bust('/sw.js'),
      bust('/build.json'),
      bust('/js/config.js'),
      bust('/js/home-only-pull.js'),
      bust('/css/home-only-pull.css')
    ]);
    chain = chain.then(function () {
      if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return;
      return navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all((regs || []).map(function (r) { return r.unregister(); }));
      });
    });
    chain = chain.then(function () {
      if (!window.caches || !caches.keys) return;
      return caches.keys().then(function (keys) {
        return Promise.all((keys || []).filter(function (k) { return k !== keep; }).map(function (k) {
          return caches.delete(k);
        }));
      });
    });
    chain.catch(function () {}).then(function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('_tb', String(t));
        window.location.replace(u.pathname + u.search);
      } catch (e1) {
        window.location.href = '/?_tb=' + t;
      }
    });
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    pulling = false;
    if (!e.touches || !e.touches[0]) return;
    if (!onHome() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    startT = Date.now();
    if (startY > TOP_ZONE) return;
    armed = true;
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (!armed || !e.touches || !e.touches[0]) return;
    if (!onHome() || inSheet(e.target)) {
      armed = false;
      snap();
      return;
    }
    var y = e.touches[0].clientY || 0;
    var x = e.touches[0].clientX || 0;
    var dy = y - startY;
    var dx = x - startX;
    if (Math.abs(dx) > 48 && dy < THRESH) {
      armed = false;
      snap();
      return;
    }
    if (dy > 10) {
      pulling = true;
      rubber(dy);
      e.preventDefault();
    }
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (e) {
    if (!armed) return;
    armed = false;
    var t = (e.changedTouches && e.changedTouches[0]) || {};
    var dy = (t.clientY || 0) - startY;
    var dx = (t.clientX || 0) - startX;
    var held = (Date.now() - startT) >= SLOW_MS;
    var go = pulling && onHome() && !inSheet(e.target) && dy >= THRESH && held && Math.abs(dx) <= 48;
    pulling = false;
    if (go) latest();
    else snap();
  }, true);

  document.addEventListener('touchcancel', function () {
    armed = false;
    pulling = false;
    snap();
  }, true);
})();
