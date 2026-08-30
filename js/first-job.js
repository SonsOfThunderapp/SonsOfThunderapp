(function () {
  if (window.__tbFirstJob) return;
  window.__tbFirstJob = true;

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#replay-tour-btn')) {
      window.__tbTourAllowed = true;
    }
  }, true);

  function hideAutoTour() {
    if (window.__tbTourAllowed) return;
    var t = document.getElementById('tb-tour');
    if (!t || t.classList.contains('hidden')) return;
    t.classList.add('hidden');
    t.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tb-tour-open');
  }

  var t = document.getElementById('tb-tour');
  if (t && window.MutationObserver) {
    new MutationObserver(hideAutoTour).observe(t, { attributes: true, attributeFilter: ['class'] });
  }

  function guestHome() {
    if (document.body.classList.contains('tb-seated')) return;
    try {
      if (localStorage.getItem('tb_seat_locked')) return;
    } catch (eG) {}
    var a2 = document.getElementById('home-a2hs');
    if (a2) {
      a2.classList.add('hidden');
      a2.setAttribute('hidden', 'hidden');
    }
  }
  hideAutoTour();
  guestHome();
  setTimeout(hideAutoTour, 400);
  setTimeout(hideAutoTour, 1200);
  setTimeout(guestHome, 400);
  setTimeout(guestHome, 1400);
})();
