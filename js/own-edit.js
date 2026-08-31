/* 20260831-own-edit-2 — card / sheet EDIT opens profile-modal on top. */
(function () {
  if (window.__tbOwnEdit2) return;
  window.__tbOwnEdit2 = true;

  function hideDetail() {
    var d = document.getElementById('brother-detail');
    if (!d) return;
    d.classList.add('hidden');
    d.setAttribute('aria-hidden', 'true');
  }

  function fillFromCard() {
    var nameEl = document.getElementById('brother-detail-name') || document.querySelector('.tb-my-seat .brother-name');
    var bioEl = document.querySelector('.tb-my-seat .brother-bio');
    var pn = document.getElementById('profile-name');
    var pb = document.getElementById('profile-bio');
    if (pn && nameEl && !pn.value) {
      pn.value = String(nameEl.textContent || '').replace(/TODAY/g, '').trim();
    }
    if (pb && bioEl && !pb.value) pb.value = String(bioEl.textContent || '').trim();
  }

  function fire() {
    window.__tbSeatAllow = true;
    hideDetail();
    var title = document.getElementById('profile-modal-title');
    if (title) title.innerHTML = 'EDIT <span class="accent-yellow">PROFILE</span>';
    fillFromCard();
    var modal = document.getElementById('profile-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      modal.style.zIndex = '80';
    }
    try { document.body.style.overflow = 'hidden'; } catch (e0) {}
    var ghost = document.getElementById('edit-profile-btn');
    if (ghost) {
      ghost.removeAttribute('hidden');
      ghost.classList.remove('hidden');
      try { ghost.click(); } catch (e1) {}
      ghost.classList.add('hidden');
      ghost.setAttribute('hidden', 'hidden');
    }
    setTimeout(function () { window.__tbSeatAllow = false; }, 1500);
  }

  function isEditTarget(el) {
    if (!el || !el.closest) return null;
    var btn = el.closest('.tb-own-edit-btn, #tb-sheet-edit, #tb-own-edit-btn');
    if (btn) return btn;
    var t = el.closest('button, a, .btn');
    if (!t) return null;
    var label = String(t.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
    if (label === 'EDIT' || label === 'EDIT PROFILE') return t;
    return null;
  }

  document.addEventListener('click', function (e) {
    var btn = isEditTarget(e.target);
    if (!btn) return;
    if (btn.id === 'edit-profile-btn' && !window.__tbSeatAllow) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    fire();
  }, true);

  function stampCard() {
    var grid = document.getElementById('brothers-grid');
    if (!grid) return;
    var mine = grid.querySelector('.brother-card.tb-my-seat, .brother-card[data-brother-index="0"]');
    if (!mine) return;
    if (mine.querySelector('.tb-own-edit-btn')) return;
    var seated = document.body.classList.contains('tb-seated') || localStorage.getItem('tb_seat_locked');
    if (!seated) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tb-own-edit-btn';
    b.textContent = 'EDIT PROFILE';
    mine.appendChild(b);
    mine.classList.add('tb-my-seat');
  }

  stampCard();
  setTimeout(stampCard, 400);

  if (!document.querySelector('link[href*="own-edit.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/own-edit.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
