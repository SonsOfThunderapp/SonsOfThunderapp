/* Tap a Code line to hear the rest. Six lines stay. */
(function () {
  function bind() {
    var list = document.getElementById('code-list');
    if (!list || list.dataset.tbTight === '1') return;
    list.dataset.tbTight = '1';
    list.addEventListener('click', function (e) {
      var item = e.target && e.target.closest && e.target.closest('.code-item');
      if (!item) return;
      var on = item.classList.contains('is-open');
      list.querySelectorAll('.code-item.is-open').forEach(function (n) {
        n.classList.remove('is-open');
      });
      if (!on) item.classList.add('is-open');
    });
  }
  function bindWho() {
    var kick = document.getElementById('who-we-are-kicker');
    var title = document.getElementById('who-we-are-title');
    var body = document.getElementById('who-we-are-body');
    if (!kick || !body || kick.dataset.tbTight === '1') return;
    kick.dataset.tbTight = '1';
    function toggle() {
      body.classList.toggle('is-open');
    }
    kick.addEventListener('click', toggle);
    if (title) title.addEventListener('click', toggle);
  }
  function boot() {
    bind();
    bindWho();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(boot, 2000);
})();
