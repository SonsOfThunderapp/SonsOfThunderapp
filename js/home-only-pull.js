/* 20260830-home-pull-spring
   Home only. Logo is a mass. Finger = resist. Release = one overshoot.
   BOARD UPDATED after settle. Other views never reload. No app.js. */
(function () {
  if (window.__tbHomeOnlyPull3) return;
  window.__tbHomeOnlyPull3 = true;
  window.__tbHomePull = true;

  var THRESH = 64;
  var MAX_PULL = 96;
  var K = 0.22;
  var C = 0.72;
  var startY = 0;
  var startX = 0;
  var armed = false;
  var pulling = false;
  var fired = false;
  var pos = 0;
  var vel = 0;
  var raf = 0;
  var reduce = false;
  try {
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (eR) {}

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

  function inPullZone(t, y) {
    if (t && t.closest && t.closest('#main-header, #header-logo')) return true;
    var head = document.getElementById('main-header');
    if (head) {
      var r = head.getBoundingClientRect();
      if (y <= r.bottom + 24) return true;
    }
    var home = document.getElementById('view-home');
    if (home && (home.scrollTop || 0) <= 2 && y < 280) return true;
    return false;
  }

  function resist(dy) {
    var t = Math.max(0, dy);
    var y = MAX_PULL * (1 - Math.exp(-t / 88));
    if (t >= THRESH) y += 4;
    return y;
  }

  function paint(y, pullingNow) {
    var el = mark();
    pos = y;
    document.body.classList.toggle('tb-home-pulling', y > 6);
    document.body.classList.toggle('tb-home-armed', pullingNow && y >= resist(THRESH) - 1);
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = 'translateY(' + y.toFixed(2) + 'px) scale(' + (1 + y / 420).toFixed(3) + ')';
    el.classList.toggle('is-pulling', y > 6);
    el.classList.toggle('is-armed', pullingNow && y >= resist(THRESH) - 1);
    el.classList.toggle('is-release', !pullingNow && y > 0.4);
  }

  function stopRaf() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function restMark() {
    var el = mark();
    document.body.classList.remove('tb-home-pulling', 'tb-home-armed');
    pos = 0;
    vel = 0;
    if (!el) return;
    el.classList.remove('is-pulling', 'is-release', 'is-armed');
    el.style.transition = '';
    el.style.transform = '';
  }

  function spring(done) {
    stopRaf();
    var el = mark();
    if (reduce || !el) {
      restMark();
      if (done) done();
      return;
    }
    vel = Math.min(18, pos * 0.08);
    function tick() {
      vel += (-K * pos) - (C * vel);
      pos += vel;
      if (pos < -6) {
        pos = -6;
        vel *= -0.35;
      }
      paint(Math.max(0, pos), false);
      if (Math.abs(pos) < 0.35 && Math.abs(vel) < 0.18) {
        restMark();
        raf = 0;
        if (done) done();
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function rubber(dy) {
    stopRaf();
    paint(resist(dy), true);
  }

  function snap(done) {
    spring(done);
  }

  function soft() {
    if (fired) return;
    fired = true;
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
    spring(function () {
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
    });
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    pulling = false;
    if (!e.touches || !e.touches[0]) return;
    if (!onHome() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    if (!inPullZone(e.target, startY)) return;
    stopRaf();
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
