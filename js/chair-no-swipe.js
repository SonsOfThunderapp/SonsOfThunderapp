/* 20260827-nswipe1: kill tab swipe for the whole edit. Do not dump the chair out. */
(function () {
  function modalOpen() {
    try {
      if (document.querySelector('.modal:not(.hidden)')) return true;
      if (document.getElementById('tb-chair-pin-sheet') && document.getElementById('tb-chair-pin-sheet').classList.contains('is-open')) return true;
      if (document.body.classList.contains('cal-sheet-open') || document.body.classList.contains('tb-axum-open')) return true;
    } catch (e) {}
    return false;
  }
  function toolsOpen() {
    var tools = document.getElementById('leader-tools');
    if (!tools) return false;
    if (tools.classList.contains('hidden')) return false;
    try {
      var cs = window.getComputedStyle(tools);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    } catch (e1) {}
    return true;
  }
  function onMore() {
    var v = document.getElementById('view-about');
    if (v && v.classList.contains('active')) return true;
    try { return document.body.classList.contains('tb-view-about'); } catch (e) { return false; }
  }
  function editing() {
    if (modalOpen()) return true;
    if (toolsOpen()) return true;
    try { if (document.body.classList.contains('tb-chair') && onMore()) return true; } catch (e0) {}
    try { if (sessionStorage.getItem('tb_chair_pin') === '1' && onMore()) return true; } catch (e2) {}
    return false;
  }
  function keepEditTap(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('.modal, #tb-chair-pin-sheet, input, textarea, select, button, a, label');
  }
  function gate(e) {
    if (!editing()) return;
    if (keepEditTap(e.target)) return;
    e.stopImmediatePropagation();
  }
  document.addEventListener('touchstart', gate, true);
  document.addEventListener('touchend', gate, true);
  document.addEventListener('touchcancel', gate, true);
})();
