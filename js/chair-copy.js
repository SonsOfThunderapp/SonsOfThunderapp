(function () {
  function stamp() {
    var chair = document.getElementById('brother-open-chair');
    if (!chair) return;
    chair.setAttribute('aria-label', 'Take this seat');
    var sub = chair.querySelector('.brother-slot-sub');
    if (sub) sub.textContent = 'Take this seat';
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
})();
