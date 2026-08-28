(function () {
  function $(id) { return document.getElementById(id); }
  function seated() {
    var bar = $('auth-session-bar');
    var who = $('auth-who');
    if (bar && !bar.classList.contains('hidden')) return true;
    if (who && String(who.textContent || '').indexOf('@') !== -1) return true;
    return false;
  }
  function hideDoor() {
    var entry = $('auth-entry-btn');
    if (!entry) return;
    var sub = entry.querySelector('.btn-auth-entry-sub');
    if (sub) sub.textContent = 'Phone, email, password.';
    if (!seated()) {
      entry.classList.remove('tb-seated-hide');
      document.body.classList.remove('tb-seated');
      return;
    }
    entry.classList.add('hidden'); entry.classList.add('tb-seated-hide');
    entry.setAttribute('hidden', 'hidden'); entry.style.display = 'none';
    document.body.classList.add('tb-seated');
  }
  function openFields() {
    var name = $('profile-name'), bio = $('profile-bio'), job = $('profile-skills');
    if (name) name.setAttribute('maxlength', '40');
    if (bio) { bio.setAttribute('maxlength', '240'); bio.setAttribute('placeholder', 'Who you are'); }
    if (job) job.setAttribute('maxlength', '120');
  }
  function hideGhostOd() {
    var grid = $('brothers-grid'); if (!grid) return;
    var cards = grid.querySelectorAll('.brother-card[data-brother-index]');
    var hasPhotoObie = false;
    cards.forEach(function (card) {
      var img = card.querySelector('img.brother-photo');
      var name = card.querySelector('.brother-name');
      var label = String(name && name.textContent || '').replace(/TODAY/g, '').trim().toLowerCase();
      if (img && (label === 'obie' || label === 'obie diaz')) hasPhotoObie = true;
    });
    if (!hasPhotoObie) return;
    cards.forEach(function (card) {
      var img = card.querySelector('img.brother-photo');
      var name = card.querySelector('.brother-name');
      var label = String(name && name.textContent || '').replace(/TODAY/g, '').trim().toLowerCase();
      var initials = card.querySelector('.brother-photo:not(img)');
      if (!img && initials && label === 'obie diaz') card.classList.add('tb-ghost-hide');
    });
  }
  function tick() { hideDoor(); openFields(); hideGhostOd(); }
  function bind() {
    tick();
    var bar = $('auth-session-bar');
    if (bar && bar.dataset.tbRepair !== '1') {
      bar.dataset.tbRepair = '1';
      new MutationObserver(tick).observe(bar, { attributes: true, childList: true, subtree: true });
    }
    var grid = $('brothers-grid');
    if (grid && grid.dataset.tbRepair !== '1') {
      grid.dataset.tbRepair = '1';
      new MutationObserver(function () { tick(); }).observe(grid, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 400); setTimeout(tick, 1200);
})();
