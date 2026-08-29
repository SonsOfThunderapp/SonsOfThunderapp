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
    if (typeof window.startMemberSignIn === 'function') {
      try { window.startMemberSignIn(); } catch (err) {}
      return;
    }
    var edit = document.getElementById('edit-profile-btn');
    if (edit && !edit.classList.contains('hidden')) {
      edit.click();
      return;
    }
    var btn = document.getElementById('auth-entry-btn') || document.getElementById('home-member-cta');
    if (btn) btn.click();
  }
  document.addEventListener('click', claim, true);
})();
