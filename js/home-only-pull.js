/* 20260830-home-only-pull
   Pull-to-latest lives on Home only.
   Hold the page. Release past the line. Then BOARD UPDATED.
   Other views never reload from a down swipe.
   Seat / sb-* stay. No app.js. */
(function () {
  if (window.__tbHomeOnlyPull2) return;
  window.__tbHomeOnlyPull2 = true;
  window.__tbHomePull = true;

  var THRESH = 64;
  var MAX_PULL = 96;
  var TOP_ZONE = 120;
  var startY = 0;
  var startX = 0;
  var armed = false;
  var pulling = false;
  var fired = false;

  function onHome() {
    var home = document.getElementById('view-home');
    if (!home || !home.classList.contains('active')) return false;
    if (document.querySelector('.view.active:not(#view-home)')) return false;
    return true;
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

  function resist(dy) {
    var t = Math.max(0, dy);
    return MAX_PULL * (1 - Math.exp(-t / 88));
  }

  function rubber(dy) {
    var el = mark();
    var y = resist(dy);
    document.body.classList.toggle('tb-home-pulling', y > 6);
    if (!el) return;
    el.classList.remove('is-release');
    el.style.transition = 'none';
    el.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(' + (1 + y / 420).toFixed(3) + ')';
    el.classList.toggle('is-pulling', y > 6);
  }

  function snap() {
    var el = mark();
    document.body.classList.remove('tb-home-pulling');
    if (!el) return;
    el.classList.add('is-release');
    el.style.transition = 'transform 0.48s cubic-bezier(0.22, 1.55, 0.32, 1)';
    el.style.transform = 'translateY(0) scale(1)';
    el.classList.remove('is-pulling');
    window.setTimeout(function () {
      el.classList.remove('is-release');
      el.style.transition = '';
      el.style.transform = '';
    }, 520);
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
    if (go) {
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      e.stopPropagation();
      soft();
    } else {
      snap();
    }
  }, true);

  var logo = mark();
  if (logo) logo.dataset.tbPull = '1';

  document.addEventListener('touchcancel', function () {
    armed = false;
    pulling = false;
    snap();
  }, true);
})();
