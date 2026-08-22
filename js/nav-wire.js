/* 20260822-chrome4: dock tabs in files old config already injects */
(function () {
  var OK = { home: 1, brothers: 1, events: 1, about: 1 };
  function show(name, btn) {
    if (!OK[name]) return;
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active');
      v.style.setProperty('display', 'none', 'important');
      v.style.setProperty('visibility', 'hidden', 'important');
    });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var pane = document.getElementById('view-' + name);
    if (pane) {
      pane.classList.add('active');
      pane.style.setProperty('display', 'block', 'important');
      pane.style.setProperty('visibility', 'visible', 'important');
    }
    if (btn) btn.classList.add('active');
  }
  function onNav(e) {
    var btn = e.target && e.target.closest && e.target.closest('.nav-item[data-view]');
    if (!btn) return;
    show(btn.getAttribute('data-view'), btn);
  }
  document.addEventListener('pointerdown', onNav, true);
  document.addEventListener('click', onNav, true);
})();
