(function () {
  if (window.__tbPullStrict) return;
  window.__tbPullStrict = true;

  function views() {
    return Array.prototype.slice.call(document.querySelectorAll('.view.active'));
  }
  function homeOnly() {
    var on = views();
    return on.length === 1 && on[0] && on[0].id === 'view-home';
  }
  function inSheet(t) {
    return !!(t && t.closest && t.closest('.modal, #brother-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-panel, #axum-drop, #tb-tour, #auth-gate'));
  }

  document.addEventListener('touchend', function (e) {
    if (inSheet(e.target)) return;
    if (homeOnly()) return;
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (inSheet(e.target)) return;
    if (homeOnly()) return;
    var v = document.querySelector('.view.active');
    if (!v || !e.touches || !e.touches[0]) return;
    if (v.scrollTop <= 0) {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, { capture: true, passive: false });
})();
