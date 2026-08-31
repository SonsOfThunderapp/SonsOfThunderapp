/* Open Chair = you take the seat. Not bring-a-buddy. Survives renderBrothers. */
(function () {
  function stamp() {
    var chair = document.getElementById('brother-open-chair');
    if (!chair) return;
    chair.setAttribute('aria-label', 'Take this seat');
    var sub = chair.querySelector('.brother-slot-sub');
    if (sub) {
      sub.innerHTML = 'Welcome to the Brotherhood.<br>Sign in. Be a real part of the room.';
    }
    var title = chair.querySelector('.brother-chair-title');
    if (title) title.textContent = 'OPEN CHAIR';
  }

  function bind() {
    stamp();
    var grid = document.getElementById('brothers-grid');
    if (grid && grid.dataset.tbChairCopy !== '1') {
      grid.dataset.tbChairCopy = '1';
      new MutationObserver(stamp).observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 400);
  setTimeout(stamp, 1200);
  ['js/seat-welcome.js', 'js/hq-card.js'].forEach(function (src) {
    if (document.querySelector('script[src*="' + src.split('/').pop() + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  });
})();
