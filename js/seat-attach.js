/* 20260829-seat-press — TAKE YOUR SEAT only from a good press on the empty chair. */
(function () {
  if (window.__tbSeatAttach) return;
  window.__tbSeatAttach = true;

  var CHAIR = 'obietv@gmail.com';
  window.__tbSeatAllow = false;
  var press = { t: 0, x: 0, y: 0, id: '' };

  function loadBrothers() {
    try {
      var raw = localStorage.getItem('brothers');
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function obieRow() {
    var list = loadBrothers();
    var i, b, n;
    for (i = 0; i < list.length; i++) {
      b = list[i] || {};
      n = String(b.name || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (n === 'obie' || n === 'obie diaz') return b;
    }
    return null;
  }

  function sessionEmail() {
    try {
      var who = document.getElementById('auth-who');
      var t = String(who && who.textContent || '').trim().toLowerCase();
      var at = t.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
      if (at) return at[0];
    } catch (e0) {}
    try {
      var i, k, raw, obj, em;
      for (i = 0; i < localStorage.length; i++) {
        k = localStorage.key(i) || '';
        if (k.indexOf('sb-') !== 0 || k.indexOf('auth-token') === -1) continue;
        raw = localStorage.getItem(k);
        obj = raw ? JSON.parse(raw) : null;
        em = obj && obj.user && obj.user.email;
        if (!em && obj && obj.currentSession && obj.currentSession.user) {
          em = obj.currentSession.user.email;
        }
        if (em) return String(em).trim().toLowerCase();
      }
    } catch (e1) {}
    return '';
  }

  function isChair() {
    if (sessionEmail() === CHAIR) return true;
    var bar = document.getElementById('auth-session-bar');
    return !!(bar && !bar.classList.contains('hidden'));
  }

  function seated() {
    return !!(isChair() && obieRow());
  }

  function attach() {
    var row = obieRow();
    if (!row || !row.id || !isChair()) return false;
    try {
      localStorage.setItem('myProfileId', row.id);
      localStorage.setItem('tb_myProfileId', row.id);
    } catch (e) {}
    return true;
  }

  function hideInviteIfSeated() {
    if (!seated()) return;
    ['brother-slot-invite', 'empty-brothers-cta', 'brother-open-chair'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('hidden');
      el.setAttribute('hidden', 'hidden');
      el.style.display = 'none';
    });
  }

  function hideHeaderEdit() {
    var header = document.getElementById('edit-profile-btn');
    if (!header) return;
    header.classList.add('hidden');
    header.setAttribute('hidden', 'hidden');
    header.style.display = 'none';
  }

  function closeSeatModal() {
    var modal = document.getElementById('profile-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function policeModal() {
    var modal = document.getElementById('profile-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (window.__tbSeatAllow) return;
    if (seated()) closeSeatModal();
  }

  function chairEl(t) {
    return t && t.closest && t.closest('#brother-slot-invite, #empty-brothers-cta, #brother-open-chair');
  }

  function goodPress(dt, dx, dy) {
    if (dt < 140) return false;
    if (dt > 420) return false;
    if ((dx * dx + dy * dy) > 256) return false;
    return true;
  }

  function fireEdit() {
    attach();
    window.__tbSeatAllow = true;
    var title = document.getElementById('profile-modal-title');
    if (title) title.innerHTML = 'EDIT <span class="accent-yellow">PROFILE</span>';
    var ghost = document.getElementById('edit-profile-btn');
    if (ghost) {
      ghost.removeAttribute('hidden');
      ghost.classList.remove('hidden');
      ghost.style.display = '';
      ghost.click();
      hideHeaderEdit();
    }
    setTimeout(function () { window.__tbSeatAllow = false; }, 900);
  }

  function stampGrid() {
    if (!seated()) return;
    var grid = document.getElementById('brothers-grid');
    if (!grid) return;
    grid.querySelectorAll('.brother-card[data-brother-index]').forEach(function (card) {
      var name = card.querySelector('.brother-name');
      var label = String(name && name.textContent || '').replace(/TODAY/g, '').trim().toLowerCase();
      if (label !== 'obie' && label !== 'obie diaz') return;
      if (card.querySelector('.tb-own-edit-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tb-own-edit-btn';
      btn.textContent = 'EDIT';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fireEdit();
      });
      card.appendChild(btn);
      card.classList.add('tb-my-seat');
    });
  }

  function stampSheet() {
    if (!seated()) return;
    var sheet = document.getElementById('brother-detail');
    if (!sheet || sheet.classList.contains('hidden')) return;
    var nm = document.getElementById('brother-detail-name');
    var label = String(nm && nm.textContent || '').replace(/TODAY/g, '').trim().toLowerCase();
    if (label !== 'obie' && label !== 'obie diaz') {
      var old = document.getElementById('tb-sheet-edit');
      if (old) old.remove();
      return;
    }
    if (document.getElementById('tb-sheet-edit')) return;
    var share = document.getElementById('brother-share-contact');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tb-sheet-edit';
    btn.className = 'tb-own-edit-btn';
    btn.textContent = 'EDIT PROFILE';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fireEdit();
    });
    if (share && share.parentNode) share.parentNode.insertBefore(btn, share);
    else sheet.appendChild(btn);
  }

  document.addEventListener('pointerdown', function (e) {
    var el = chairEl(e.target);
    if (!el) return;
    press.t = Date.now();
    press.x = e.clientX || 0;
    press.y = e.clientY || 0;
    press.id = el.id;
    el.classList.add('tb-chair-press');
  }, true);

  document.addEventListener('pointerup', function (e) {
    var el = chairEl(e.target);
    var node = el || document.getElementById(press.id);
    if (node) node.classList.remove('tb-chair-press');
    if (!el || seated()) {
      press.t = 0;
      return;
    }
    var dt = Date.now() - press.t;
    var dx = (e.clientX || 0) - press.x;
    var dy = (e.clientY || 0) - press.y;
    press.t = 0;
    if (!goodPress(dt, dx, dy)) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      return;
    }
    window.__tbSeatAllow = true;
    setTimeout(function () { window.__tbSeatAllow = false; }, 900);
  }, true);

  document.addEventListener('pointercancel', function () {
    var node = document.getElementById(press.id);
    if (node) node.classList.remove('tb-chair-press');
    press.t = 0;
  }, true);

  document.addEventListener('click', function (e) {
    var invite = chairEl(e.target);
    if (invite) {
      if (seated() || !window.__tbSeatAllow) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        hideInviteIfSeated();
      }
      return;
    }
    var header = e.target && e.target.closest && e.target.closest('#edit-profile-btn');
    if (header && !window.__tbSeatAllow) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);

  function tick() {
    attach();
    hideHeaderEdit();
    hideInviteIfSeated();
    stampGrid();
    stampSheet();
    policeModal();
  }

  window.stashSeatFromGate = function () {
    try { document.body.classList.add('tb-seated'); } catch (eS) {}
    try { localStorage.setItem('tb_seat_locked', '1'); } catch (eL) {}
    tick();
    var nav = document.querySelector('.nav-item[data-view="brothers"]');
    if (nav) {
      try { nav.click(); } catch (eN) {}
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1400);
  var grid = document.getElementById('brothers-grid');
  if (grid && !grid.dataset.tbSeatAttach) {
    grid.dataset.tbSeatAttach = '1';
    new MutationObserver(function () { setTimeout(tick, 30); }).observe(grid, { childList: true });
  }
  if (!document.querySelector('script[src*="recon-90.js"]')) {
    var r = document.createElement('script');
    r.src = 'js/recon-90.js';
    r.defer = true;
    (document.body || document.documentElement).appendChild(r);
  }
  var detail = document.getElementById('brother-detail');
  if (detail && !detail.dataset.tbSeatAttach) {
    detail.dataset.tbSeatAttach = '1';
    new MutationObserver(function () { setTimeout(tick, 30); }).observe(detail, { attributes: true, childList: true, subtree: true });
  }
  var modal = document.getElementById('profile-modal');
  if (modal && !modal.dataset.tbSeatOnce) {
    modal.dataset.tbSeatOnce = '1';
    new MutationObserver(function () { policeModal(); }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
})();
