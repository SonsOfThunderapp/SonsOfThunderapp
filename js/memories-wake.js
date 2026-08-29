(function () {
  if (window.__tbMemWake) return;
  window.__tbMemWake = true;
  var done = false;
  function addCss(href) {
    if (document.querySelector('link[href*="' + href.split('/').pop() + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href + '?v=20260829-mission-last';
    document.head.appendChild(l);
  }
  function addJs(src) {
    if (document.querySelector('script[src*="' + src.split('/').pop() + '"]')) return;
    var s = document.createElement('script');
    s.src = src + '?v=20260829-mission-last';
    s.defer = true;
    document.body.appendChild(s);
  }
  function wake() {
    if (done) return;
    done = true;
    addCss('css/memories-page.css');
    addCss('css/choice2-proof.css');
    addCss('css/events-mission-stack.css');
    addCss('css/mission-last.css');
    addJs('js/memories-grid.js');
    addJs('js/choice2-proof.js');
  }
  function isMem(t) {
    if (!t || !t.closest) return false;
    var n = t.closest('[data-view], .nav-item, #nav-events');
    if (!n) return false;
    var v = n.getAttribute('data-view') || n.id || '';
    return v === 'events' || v === 'nav-events';
  }
  document.addEventListener('pointerdown', function (e) {
    if (isMem(e.target)) wake();
  }, true);
})();
