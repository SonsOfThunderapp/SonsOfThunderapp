(function () {
  if (window.__tbGridBack) return;
  window.__tbGridBack = true;
  var woken = false;
  function addCss(href) {
    if (document.querySelector('link[href*="' + href.split('/').pop() + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href + '?v=20260829-grid-back';
    document.head.appendChild(l);
  }
  function addJs(src) {
    if (document.querySelector('script[src*="' + src.split('/').pop() + '"]')) return;
    var s = document.createElement('script');
    s.src = src + '?v=20260829-grid-back';
    s.defer = true;
    document.body.appendChild(s);
  }
  function wake() {
    if (woken) return;
    var ev = document.getElementById('view-events');
    if (!ev || !ev.classList.contains('active')) return;
    woken = true;
    addCss('css/memories-page.css');
    addJs('js/memories-grid.js');
  }
  function onNav(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-events');
    var v = n ? (n.getAttribute('data-view') || n.id || '') : '';
    if (v === 'events' || v === 'nav-events') setTimeout(wake, 40);
  }
  document.addEventListener('pointerdown', onNav, true);
  document.addEventListener('click', onNav, true);
  var ev = document.getElementById('view-events');
  if (ev && window.MutationObserver) {
    new MutationObserver(function () { if (ev.classList.contains('active')) wake(); })
      .observe(ev, { attributes: true, attributeFilter: ['class'] });
  }
})();
