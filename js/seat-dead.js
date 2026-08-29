(function () {
  if (window.__tbSeatDead) return;
  window.__tbSeatDead = true;

  function closeSeat() {
    if (window.__tbSeatAllow) return;
    var modal = document.getElementById('profile-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function allowBriefly() {
    window.__tbSeatAllow = true;
    setTimeout(function () { window.__tbSeatAllow = false; }, 1200);
  }

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#brother-slot-invite, #empty-brothers-cta, #brother-open-chair, #tb-own-edit-btn, #edit-profile-btn')) {
      allowBriefly();
    }
  }, true);

  var modal = document.getElementById('profile-modal');
  if (modal && window.MutationObserver) {
    new MutationObserver(closeSeat).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
  closeSeat();
  setTimeout(closeSeat, 300);
  setTimeout(closeSeat, 1200);
})();
