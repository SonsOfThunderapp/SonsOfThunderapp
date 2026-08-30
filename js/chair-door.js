(function () {
  if (window.__tbChairDoor) return;
  window.__tbChairDoor = true;
  function openDoor() {
    var gate = document.getElementById('auth-gate');
    if (gate) {
      gate.classList.remove('hidden');
      gate.setAttribute('aria-hidden', 'false');
    }
    try { if (typeof window.openChairSignIn === 'function') window.openChairSignIn(); } catch (e) {}
    try { if (typeof window.openAuthGate === 'function') window.openAuthGate('Lock the chair.'); } catch (e2) {}
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#leader-unlock-btn, #header-bolt, .btn-leadership')) {
      openDoor();
    }
  }, true);
})();
