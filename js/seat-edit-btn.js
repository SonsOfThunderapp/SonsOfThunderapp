(function () {
  if (window.__tbSeatPencil) return;
  window.__tbSeatPencil = true;

  function loadTb(key) {
    try {
      var raw = localStorage.getItem('tb_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function sessionEmail() {
    try {
      var i, k, raw;
      for (i = 0; i < localStorage.length; i++) {
        k = localStorage.key(i) || '';
        raw = String(localStorage.getItem(k) || '').toLowerCase();
        var m = raw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
        if (k.indexOf('auth-token') !== -1 && m) return m[0];
      }
    } catch (e0) {}
    var who = document.getElementById('auth-who');
    var t = String(who && who.textContent || '').toLowerCase();
    var at = t.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    return at ? at[0] : '';
  }

  function cleanName(s) {
    return String(s || '').replace(/TODAY/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function meRow() {
    var list = loadTb('brothers');
    if (!Array.isArray(list)) list = [];
    var id = loadTb('myProfileId') || localStorage.getItem('tb_myProfileId') || localStorage.getItem('myProfileId');
    if (typeof id === 'string') {
      try { id = JSON.parse(id); } catch (e) {}
    }
    var i, b, em;
    em = sessionEmail();
    for (i = 0; i < list.length; i++) {
      b = list[i] || {};
      if (id && b.id === id) return b;
    }
    if (em) {
      for (i = 0; i < list.length; i++) {
        b = list[i] || {};
        if (String(b.email || '').trim().toLowerCase() === em) return b;
      }
    }
    return null;
  }

  function isOwnSheet() {
    var me = meRow();
    var nm = document.getElementById('brother-detail-name');
    if (me && nm && cleanName(nm.textContent) === cleanName(me.name)) return true;
    if (sessionEmail() === 'obietv@gmail.com' && nm && (cleanName(nm.textContent) === 'obie' || cleanName(nm.textContent) === 'obie diaz')) return true;
    return false;
  }

  function fire() {
    window.__tbSeatAllow = true;
    var title = document.getElementById('profile-modal-title');
    if (title) title.innerHTML = 'EDIT <span class="accent-yellow">PROFILE</span>';
    var ghost = document.getElementById('edit-profile-btn');
    if (!ghost) return;
    ghost.removeAttribute('hidden');
    ghost.classList.remove('hidden');
    ghost.style.display = '';
    ghost.click();
    ghost.classList.add('hidden');
    ghost.setAttribute('hidden', 'hidden');
    ghost.style.display = 'none';
    setTimeout(function () { window.__tbSeatAllow = false; }, 900);
  }

  function stamp() {
    var sheet = document.getElementById('brother-detail');
    if (!sheet || sheet.classList.contains('hidden')) {
      var old = document.getElementById('tb-sheet-edit');
      if (old) old.remove();
      return;
    }
    if (!isOwnSheet()) {
      var gone = document.getElementById('tb-sheet-edit');
      if (gone) gone.remove();
      return;
    }
    if (document.getElementById('tb-sheet-edit')) return;
    var share = document.getElementById('brother-share-contact');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tb-sheet-edit';
    btn.textContent = 'EDIT PROFILE';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      fire();
    });
    if (share && share.parentNode) share.parentNode.insertBefore(btn, share);
    else sheet.appendChild(btn);
  }

  setTimeout(stamp, 200);
  setTimeout(stamp, 800);
  var sheet = document.getElementById('brother-detail');
  if (sheet) {
    new MutationObserver(function () { stamp(); }).observe(sheet, {
      attributes: true, childList: true, subtree: true
    });
  }
  document.addEventListener('click', function () { setTimeout(stamp, 50); }, true);
})();
