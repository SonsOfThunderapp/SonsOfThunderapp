/* 20260831-dock-quiet — park Brothers/Memories/Home red dots. */
(function () {
  if (window.__tbDockQuiet) return;
  window.__tbDockQuiet = true;

  function wipe() {
    document.querySelectorAll('.bottom-nav .nav-new-dot, .nav-item .nav-new-dot').forEach(function (d) {
      d.remove();
    });
  }

  wipe();
  setTimeout(wipe, 400);
  setTimeout(wipe, 1600);

  if (!document.querySelector('link[href*="dock-quiet.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/dock-quiet.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
