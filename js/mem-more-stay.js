(function () {
  if (window.__tbMemMoreStay) return;
  window.__tbMemMoreStay = true;
  var startY = 0;
  function view() {
    return document.querySelector('#view-events.active, #view-about.active');
  }
  function inSheet(t) {
    return !!(t && t.closest && t.closest('.modal, #tb-theater, #thunder-panel, #tb-tour, #memory-viewer'));
  }
  document.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    startY = e.touches[0].clientY || 0;
  }, true);
  document.addEventListener('touchmove', function (e) {
    var v = view();
    if (!v || !e.touches || !e.touches[0] || inSheet(e.target)) return;
    var dy = (e.touches[0].clientY || 0) - startY;
    if (v.scrollTop <= 0 && dy > 6) {
      e.preventDefault();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, { capture: true, passive: false });
})();
