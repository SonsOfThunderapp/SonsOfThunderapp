(function () {
  if (window.__tbTabHold) return;
  window.__tbTabHold = true;

  var ORDER = ['home', 'brothers', 'events', 'about'];

  function inSheet(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('.modal, #brother-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-panel, #axum-drop, #tb-tour, #auth-gate');
  }
  function activeView() {
    var v = document.querySelector('#views .view.active') || document.querySelector('.view.active');
    if (!v || !v.id) return 'home';
    return v.id.replace('view-', '');
  }
  function go(dir) {
    var now = activeView();
    var i = ORDER.indexOf(now);
    if (i < 0) return;
    var next = ORDER[i + dir];
    if (!next) return;
    var btn = document.querySelector('.bottom-nav [data-view="' + next + '"], #nav-' + next);
    if (btn) btn.click();
  }

  var tab = { x: 0, y: 0, on: false };
  document.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    if (inSheet(e.target)) { tab.on = false; return; }
    tab.on = true;
    tab.x = e.touches[0].clientX;
    tab.y = e.touches[0].clientY;
  }, true);

  document.addEventListener('touchend', function (e) {
    if (!tab.on) return;
    tab.on = false;
    if (inSheet(e.target)) return;
    var t = (e.changedTouches && e.changedTouches[0]) || {};
    var dx = (t.clientX || 0) - tab.x;
    var dy = (t.clientY || 0) - tab.y;
    if (Math.abs(dx) < 56) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) go(1);
    else go(-1);
  }, true);

  document.addEventListener('touchcancel', function () { tab.on = false; }, true);
})();
