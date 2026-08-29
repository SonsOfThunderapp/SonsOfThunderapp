(function () {
  if (window.__tbHomeOnlyPull) return;
  window.__tbHomeOnlyPull = true;

  var startY = 0, startX = 0, armed = false, fired = false, headerLock = false;

  function onHome() {
    var home = document.getElementById('view-home');
    return !!(home && home.classList.contains('active'));
  }
  function inSheet(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('.modal, #brother-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-panel, #axum-drop, #tb-tour');
  }
  function inHeader(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('#main-header, #header-logo, .header');
  }
  function soft() {
    if (fired) return;
    fired = true;
    try { if (typeof window.tbToast === 'function') window.tbToast('BOARD UPDATED', 1800); } catch (e0) {}
    var finish = function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('_tb', String(Date.now()));
        window.location.replace(u.toString());
      } catch (e1) { window.location.reload(); }
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
    headerLock = false;
    if (!e.touches || !e.touches[0]) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    if (inSheet(e.target)) return;
    if (!onHome() && inHeader(e.target)) {
      headerLock = true;
      return;
    }
    if (!onHome()) return;
    if (startY > 120) return;
    armed = true;
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (!e.touches || !e.touches[0]) return;
    if (inSheet(e.target)) return;
    var y = e.touches[0].clientY || 0;
    if (headerLock && !onHome()) {
      e.preventDefault();
      return;
    }
    if (onHome() && armed && (y - startY) > 10) e.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (e) {
    headerLock = false;
    if (!armed) return;
    armed = false;
    if (!onHome() || inSheet(e.target)) return;
    var t = (e.changedTouches && e.changedTouches[0]) || {};
    var dy = (t.clientY || 0) - startY;
    var dx = (t.clientX || 0) - startX;
    if (dy >= 56 && Math.abs(dx) <= 40) soft();
  }, true);

  document.addEventListener('touchcancel', function () {
    armed = false;
    headerLock = false;
  }, true);
})();
