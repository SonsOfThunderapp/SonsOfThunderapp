/* 20260830-home-only-pull
   Pull-to-latest lives on Home only.
   Hold the page. Release past the line. Then BOARD UPDATED.
   Other views never reload from a down swipe.
   Seat / sb-* stay. No app.js. */
(function () {
  if (window.__tbHomeOnlyPull) return;
  window.__tbHomeOnlyPull = true;

  var THRESH = 56;
  var MAX_PULL = 72;
  var TOP_ZONE = 120;
  var startY = 0;
  var startX = 0;
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
    document.body.classList.toggle('tb-home-pulling', y > 8);
    if (!el) return;
    el.style.transform = y ? 'translateY(' + Math.round(y * 0.35) + 'px)' : '';
    el.classList.toggle('is-pulling', y > 8);
  }

  function snap() {
    var el = mark();
    document.body.classList.remove('tb-home-pulling');
    if (el) {
      el.style.transform = '';
      el.classList.remove('is-pulling');
    }
  }

  function soft() {
    if (fired) return;
    fired = true;
    snap();
    try {
      if (typeof window.tbToast === 'function') window.tbToast('BOARD UPDATED', 1800);
    } catch (e0) {}
    var finish = function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('_tb', String(Date.now()));
        window.location.replace(u.toString());
      } catch (e1) {
        window.location.reload();
      }
    };
    var chain = Promise.resolve();
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        chain = navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all((regs || []).map(function (r) { return r.unregister(); }));
        });
      }
    } catch (e2) {}
    chain.then(function () {
      if (window.caches && caches.keys) {
        return caches.keys().then(function (keys) {
          return Promise.all((keys || []).map(function (k) { return caches.delete(k); }));
        });
      }
    }).catch(function () {}).then(finish);
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    pulling = false;
    if (!e.touches || !e.touches[0]) return;
    if (!onHome() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
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
    if (Math.abs(dx) > 40 && dy < THRESH) {
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
    var go = pulling && onHome() && !inSheet(e.target) && dy >= THRESH && Math.abs(dx) <= 40;
    pulling = false;
    if (go) soft();
    else snap();
  }, true);

  document.addEventListener('touchcancel', function () {
    armed = false;
    pulling = false;
    snap();
  }, true);
})();
