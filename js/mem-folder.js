/* 20260830-mem-folder — one generic bucket. No invented nights. */
(function () {
  if (window.__tbMemFolder) return;
  window.__tbMemFolder = true;

  var COPY = 'PREVIOUS MEMORIES';

  function title() {
    return document.getElementById('memories-section-title');
  }

  function stamp() {
    var el = title();
    if (!el) return;
    if (el.textContent === COPY) return;
    el.textContent = COPY;
    el.classList.add('tb-mem-folder');
  }

  function onEvents() {
    var ev = document.getElementById('view-events');
    return !!(ev && ev.classList.contains('active'));
  }

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-events');
    var v = n ? (n.getAttribute('data-view') || n.id || '') : '';
    if (v === 'events' || v === 'nav-events') setTimeout(stamp, 40);
  }, true);

  var ev = document.getElementById('view-events');
  if (ev && window.MutationObserver) {
    new MutationObserver(function () {
      if (onEvents()) stamp();
    }).observe(ev, { attributes: true, attributeFilter: ['class'] });
  }
  var el = title();
  if (el && window.MutationObserver) {
    new MutationObserver(function () {
      if (onEvents() && el.textContent !== COPY) stamp();
    }).observe(el, { childList: true, characterData: true, subtree: true });
  }
  if (onEvents()) stamp();

  if (!document.querySelector('link[href*="mem-folder.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/mem-folder.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
