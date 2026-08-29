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
  hideAutoTour();
  setTimeout(hideAutoTour, 400);
  setTimeout(hideAutoTour, 1200);
})();
