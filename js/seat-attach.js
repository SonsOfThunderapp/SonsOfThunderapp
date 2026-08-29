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
      if (window.TB && window.TB.session && window.TB.session.user) {
        return String(window.TB.session.user.email || '').trim().toLowerCase();
      }
    } catch (e0) {}
    try {
      var who = document.getElementById('auth-who');
      var t = String(who && who.textContent || '').trim().toLowerCase();
      if (t.indexOf('@') !== -1) return t.replace(/^.*\s/, '');
    } catch (e1) {}
    return '';
  }

  function isChair() {
    return sessionEmail() === CHAIR;
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

  function stampOwnEdit() {
    hideHeaderEdit();
    if (!isChair()) {
      document.querySelectorAll('.tb-own-edit-btn').forEach(function (b) { b.remove(); });
      return;
    }
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
        attach();
        var ghost = document.getElementById('edit-profile-btn');
        if (ghost) {
          ghost.removeAttribute('hidden');
          ghost.classList.remove('hidden');
          ghost.style.display = '';
          ghost.click();
          hideHeaderEdit();
        }
      });
      card.appendChild(btn);
      card.classList.add('tb-my-seat');
    });
  }

  function tick() {
    attach();
    hideInvite();
    stampOwnEdit();
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
})();
