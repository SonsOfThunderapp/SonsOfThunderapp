/* 20260822-chrome3: dock tabs switch views even if app.js bindEvents never ran */
(function () {
  var OK = { home: 1, brothers: 1, events: 1, about: 1 };
  function show(name, btn) {
    if (!OK[name]) return;
    document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var pane = document.getElementById('view-' + name);
    if (pane) pane.classList.add('active');
    if (btn) btn.classList.add('active');
  }
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('.nav-item[data-view]');
    if (!btn) return;
    show(btn.getAttribute('data-view'), btn);
  }, true);
})();
