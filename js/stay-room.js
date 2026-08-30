/* 20260830-stay-bros
   Off Home, a down-swipe must not reload the PWA.
   Reload always paints Home. Kill Safari PTR. No overflow:hidden. */
(function () {
  if (window.__tbStayRoom) return;
  window.__tbStayRoom = true;

  var startY = 0;
  var startX = 0;
  var armed = false;

  function otherView() {
    return document.querySelector('.view.active:not(#view-home)') ||
      document.querySelector('#view-brothers.active, #view-events.active, #view-about.active');
  }

  function navNotHome() {
    var a = document.querySelector('.bottom-nav [data-view].active, .nav-item[data-view].active');
    if (!a) return false;
    var v = a.getAttribute('data-view') || '';
    return v && v !== 'home';
  }

  function offHome() {
    if (document.body.classList.contains('tb-view-brothers') ||
        document.body.classList.contains('tb-view-events') ||
        document.body.classList.contains('tb-view-about')) return true;
    return !!otherView() || navNotHome();
  }

  function atTop() {
    var t = window.scrollY || window.pageYOffset || 0;
    var nodes = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById('app'),
      document.getElementById('views'),
      document.querySelector('.view.active'),
      document.getElementById('view-brothers')
    ];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] && typeof nodes[i].scrollTop === 'number' && nodes[i].scrollTop > t) t = nodes[i].scrollTop;
    }
    return t <= 0;
  }

  function inSheet(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(
      '.modal, #brother-detail, #info-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-modal, #thunder-panel, #axum-drop, #tb-tour, #auth-gate'
    );
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    if (!e.touches || !e.touches[0]) return;
    if (!offHome() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    armed = true;
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (!armed || !e.touches || !e.touches[0]) return;
    if (!offHome() || inSheet(e.target)) { armed = false; return; }
    var y = e.touches[0].clientY || 0;
    var x = e.touches[0].clientX || 0;
    var dy = y - startY;
    var dx = x - startX;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) { armed = false; return; }
    if (dy > 4 && atTop()) e.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function () { armed = false; }, true);
  document.addEventListener('touchcancel', function () { armed = false; }, true);
})();
