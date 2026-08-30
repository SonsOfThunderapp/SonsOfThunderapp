(function () {
  function $(id) { return document.getElementById(id); }

  function seated() {
    if (document.body.classList.contains('tb-seated')) return true;
    var bar = $('auth-session-bar');
    var who = $('auth-who');
    if (bar && !bar.classList.contains('hidden')) return true;
    if (who && String(who.textContent || '').indexOf('@') !== -1) return true;
    try {
      if (localStorage.getItem('tb_seat_locked')) return true;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('auth-token') !== -1 || (k.indexOf('sb-') === 0 && k.indexOf('auth') !== -1)) {
          var v = localStorage.getItem(k) || '';
          if (v.indexOf('access_token') !== -1) return true;
        }
      }
    } catch (eS) {}
    return false;
  }

  function hideDoor() {
    var entry = $('auth-entry-btn');
    if (!entry) return;
    var sub = entry.querySelector('.btn-auth-entry-sub');
    if (sub) sub.textContent = 'Phone, email, password.';
    if (!seated()) {
      entry.classList.remove('tb-seated-hide');
      /* do not strip tb-seated here if a session stamp already set it */
      return;
    }
    document.body.classList.add('tb-seated');
    entry.classList.add('hidden');
    entry.classList.add('tb-seated-hide');
    entry.setAttribute('hidden', 'hidden');
    entry.style.display = 'none';
    document.body.classList.add('tb-seated');
  }

  function openFields() {
    var name = $('profile-name');
    var bio = $('profile-bio');
    var job = $('profile-skills');
    if (name) name.setAttribute('maxlength', '40');
    if (bio) { bio.setAttribute('maxlength', '240'); bio.setAttribute('placeholder', 'Who you are'); }
    if (job) job.setAttribute('maxlength', '120');
  }

  function hideGhostOd() {
    var grid = $('brothers-grid');
    if (!grid) return;
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
      if (!img && initials && label === 'obie diaz') {
        card.classList.add('tb-ghost-hide');
      }
    });
  }

  function hideHeaderEdit() {
    var header = $('edit-profile-btn');
    if (!header) return;
    var own = document.querySelector('#tb-own-edit-btn, .tb-own-edit-btn');
    if (own) {
      header.classList.add('hidden');
      header.classList.add('tb-header-edit-off');
      header.setAttribute('hidden', 'hidden');
    } else {
      header.classList.remove('hidden');
      header.classList.remove('tb-header-edit-off');
      header.removeAttribute('hidden');
    }
  }


  function ownFirst() {
    var grid = $('brothers-grid');
    if (!grid) return;
    var btn = grid.querySelector('#tb-own-edit-btn, .tb-own-edit-btn');
    if (!btn) return;
    var card = btn.closest('.brother-card');
    if (!card) return;
    if (grid.firstElementChild === card) return;
    grid.insertBefore(card, grid.firstChild);
  }

  function parkThunder() {
    var fab = $('thunder-fab');
    if (!fab) return;
    fab.style.right = '-6px';
    fab.style.width = '60px';
    fab.style.height = '60px';
    var img = fab.querySelector('.thunder-fab-img');
    if (img) { img.style.width = '56px'; img.style.height = '56px'; }
  }

  function tick() {
    hideDoor();
    openFields();
    hideGhostOd();
    hideHeaderEdit();
    parkThunder();
    ownFirst();
  }

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

  if (!document.querySelector('link[href*="page-titles.css"]')) {
    var t = document.createElement('link');
    t.rel = 'stylesheet';
    t.href = 'css/page-titles.css';
    (document.head || document.documentElement).appendChild(t);
  }

  function askHero() {
    var img = document.querySelector('#thunder-modal .thunder-ask-hero-img');
    if (img && img.dataset.tbAskHero !== '1') {
      img.dataset.tbAskHero = '1';
      img.src = 'assets/thunder-cool-fab.png';
      img.removeAttribute('srcset');
      img.setAttribute('width', '200');
      img.setAttribute('height', '348');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 400);
  setTimeout(tick, 1200);
  askHero();
  setTimeout(askHero, 400);
})();
