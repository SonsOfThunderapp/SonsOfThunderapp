(function () {
  if (window.__tbSeatAttach) return;
  window.__tbSeatAttach = true;

  var CHAIR = 'obietv@gmail.com';

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
    var em = sessionEmail();
    if (em === CHAIR) return true;
    var bar = document.getElementById('auth-session-bar');
    if (bar && !bar.classList.contains('hidden') && !em) {
      return true;
    }
    return false;
  }

  function attach() {
    if (!isChair()) return false;
    var row = obieRow();
    if (!row || !row.id) return false;
    try {
      localStorage.setItem('myProfileId', row.id);
      localStorage.setItem('tb_myProfileId', row.id);
    } catch (e) {}
    return true;
  }

  function hideInvite() {
    if (!isChair()) return;
    var slot = document.getElementById('brother-slot-invite');
    if (slot) {
      slot.classList.add('hidden');
      slot.setAttribute('hidden', 'hidden');
      slot.style.display = 'none';
    }
  }

  function hideHeaderEdit() {
    var header = document.getElementById('edit-profile-btn');
    if (header) {
      header.classList.add('hidden');
      header.setAttribute('hidden', 'hidden');
      header.style.display = 'none';
    }
  }

  function fireEdit() {
    attach();
    var ghost = document.getElementById('edit-profile-btn');
    if (!ghost) return;
    ghost.removeAttribute('hidden');
    ghost.classList.remove('hidden');
    ghost.style.display = '';
    ghost.click();
    hideHeaderEdit();
  }

  function stampGrid() {
    if (!isChair()) return;
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
    if (!isChair()) return;
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

  function tick() {
    attach();
    hideInvite();
    hideHeaderEdit();
    stampGrid();
    stampSheet();
  }

  window.stashSeatFromGate = function () { tick(); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1400);
  var grid = document.getElementById('brothers-grid');
  if (grid && !grid.dataset.tbSeatAttach) {
    grid.dataset.tbSeatAttach = '1';
    new MutationObserver(function () { setTimeout(tick, 30); }).observe(grid, { childList: true });
  }
  var detail = document.getElementById('brother-detail');
  if (detail && !detail.dataset.tbSeatAttach) {
    detail.dataset.tbSeatAttach = '1';
    new MutationObserver(function () { setTimeout(tick, 30); }).observe(detail, { attributes: true, childList: true, subtree: true });
  }
})();
