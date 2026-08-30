(function () {
  if (window.__tbPhoneSignin) return;
  window.__tbPhoneSignin = true;

  function signedIn() {
    try {
      if (window.TB && typeof window.TB.signedIn === 'function') return !!window.TB.signedIn();
    } catch (e) {}
    try { return !!(localStorage.getItem('tb_myProfileId') || localStorage.getItem('myProfileId')); } catch (e2) {}
    return false;
  }

  function openSignIn() {
    var gate = document.getElementById('auth-gate');
    if (gate) {
      gate.classList.remove('hidden');
      gate.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }
    try { if (typeof window.openAuthGate === 'function') window.openAuthGate(); } catch (e) {}
    try { if (typeof window.openChairSignIn === 'function') window.openChairSignIn(); } catch (e2) {}
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (signedIn()) return;
    if (t.closest('#auth-gate, #auth-email, #auth-password, #auth-phone')) return;
    if (t.closest('#profile-phone, #profile-phone-help, #profile-qr-unlock, .profile-phone-ghost, #contact-swap-hint, #home-member-cta, .home-member-cta, #already-member')) {
      e.preventDefault();
      e.stopPropagation();
      var seat = document.getElementById('profile-modal');
      if (seat) {
        seat.classList.add('hidden');
        seat.setAttribute('aria-hidden', 'true');
      }
      openSignIn();
    }
  }, true);
})();
