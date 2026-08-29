(function () {
  if (window.__tbChairClaim) return;
  window.__tbChairClaim = true;
  function claim(e) {
    var t = e.target && e.target.closest && e.target.closest('#brother-open-chair');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    t.setAttribute('aria-label', 'Claim your seat');
    var open = window.openAuthGate || window.openAuth || window.lockSeat;
    if (typeof open === 'function') {
      try { open('chair'); } catch (err) {}
      return;
    }
    var btn = document.getElementById('auth-entry-btn') || document.getElementById('home-member-cta');
    if (btn) btn.click();
  }
  document.addEventListener('click', claim, true);
})();
