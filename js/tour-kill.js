/* 20260822-tourfix: splash only. Never hide #tb-tour. More TAKE THE TOUR must paint. */
(function () {
  function punchSplash() {
    var s = document.getElementById('splash');
    if (s) {
      s.classList.add('hidden', 'splash-done');
      s.style.setProperty('display', 'none', 'important');
    }
  }
  punchSplash();
  setTimeout(punchSplash, 0);
  setTimeout(punchSplash, 200);

  function paintTour() {
    var root = document.getElementById('tb-tour');
    if (!root) return;
    if (!document.body.classList.contains('tb-tour-open')) return;
    root.classList.remove('hidden', 'splash-done', 'splash-out');
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    root.style.setProperty('display', 'flex', 'important');
    root.style.setProperty('visibility', 'visible', 'important');
    root.style.setProperty('opacity', '1', 'important');
    root.style.setProperty('z-index', '50000', 'important');
    root.style.removeProperty('pointer-events');
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#replay-tour-btn, #take-tour-btn');
    if (!t) return;
    setTimeout(paintTour, 0);
    setTimeout(paintTour, 50);
    setTimeout(paintTour, 250);
    setTimeout(paintTour, 900);
  }, true);
})();
