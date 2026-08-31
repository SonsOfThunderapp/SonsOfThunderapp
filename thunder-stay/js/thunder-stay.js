/* 20260831-thunder-stay — Ask Thunder closes on the X only. */
(function () {
  if (window.__tbThunderStay) return;
  window.__tbThunderStay = true;

  function modal() { return document.getElementById('thunder-modal'); }
  function open() {
    var m = modal();
    return !!(m && !m.classList.contains('hidden'));
  }
  function isX(t) {
    return !!(t && t.closest && t.closest('#thunder-modal [data-close], #thunder-modal .modal-close'));
  }

  document.addEventListener('click', function (e) {
    if (!open()) return;
    if (isX(e.target)) return;
    var m = modal();
    if (!m) return;
    if (e.target === m || (e.target.classList && e.target.classList.contains('thunder-modal'))) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('touchend', function (e) {
    if (!open()) return;
    if (isX(e.target)) return;
    var m = modal();
    if (e.target === m) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  document.addEventListener('keydown', function (e) {
    if (!open()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  if (!document.querySelector('link[href*="thunder-stay.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/thunder-stay.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
