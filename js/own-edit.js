/* 20260830-own-edit — tile EDIT opens profile-modal (birthday, occupation, bio, photo). */
(function () {
  if (window.__tbOwnEdit) return;
  window.__tbOwnEdit = true;

  function fire() {
    window.__tbSeatAllow = true;
    var title = document.getElementById('profile-modal-title');
    if (title) title.innerHTML = 'EDIT <span class="accent-yellow">PROFILE</span>';
    var ghost = document.getElementById('edit-profile-btn');
    if (ghost) {
      ghost.removeAttribute('hidden');
      ghost.classList.remove('hidden');
      try { ghost.click(); } catch (e) {}
      ghost.classList.add('hidden');
      ghost.setAttribute('hidden', 'hidden');
    }
    var modal = document.getElementById('profile-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
    setTimeout(function () { window.__tbSeatAllow = false; }, 1200);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('.tb-own-edit-btn, #tb-sheet-edit, #tb-own-edit-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    fire();
  }, true);

  if (!document.querySelector('link[href*="own-edit.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/own-edit.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
