/* 20260831-own-edit-3 — EDIT your existing card. Never the open chair. Never a second Obie. */
(function () {
  if (window.__tbOwnEdit3) return;
  window.__tbOwnEdit3 = true;

  function list() {
    try {
      var raw = localStorage.getItem('brothers');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function clean(s) {
    return String(s || '').replace(/TODAY/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isObie(b) {
    var n = clean(b && b.name);
    var e = String((b && b.email) || '').toLowerCase();
    return n === 'obie' || n === 'obie diaz' || e === 'obietv@gmail.com';
  }

  function obieRow() {
    var rows = list().filter(isObie);
    if (!rows.length) return null;
    rows.sort(function (a, b) {
      var ap = a.photo ? 1 : 0;
      var bp = b.photo ? 1 : 0;
      if (bp !== ap) return bp - ap;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    return rows[0];
  }

  function pin(id) {
    if (!id) return;
    try {
      localStorage.setItem('myProfileId', JSON.stringify(id).indexOf('"') === 0 ? JSON.parse(JSON.stringify(id)) : id);
      localStorage.setItem('myProfileId', id);
      localStorage.setItem('tb_myProfileId', id);
    } catch (e) {}
  }

  function hideChair() {
    ['brother-slot-invite', 'empty-brothers-cta', 'brother-open-chair'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('hidden');
      el.setAttribute('hidden', 'hidden');
      el.style.display = 'none';
    });
  }

  function hideDetail() {
    var d = document.getElementById('brother-detail');
    if (!d) return;
    d.classList.add('hidden');
    d.setAttribute('aria-hidden', 'true');
  }

  function fill(row) {
    if (!row) return;
    var pn = document.getElementById('profile-name');
    var pb = document.getElementById('profile-bio');
    var pp = document.getElementById('profile-phone');
    if (pn) pn.value = row.name || 'Obie';
    if (pb) pb.value = row.bio || '';
    if (pp) pp.value = row.phone || '';
    var preview = document.getElementById('photo-preview');
    if (preview && row.photo) {
      preview.innerHTML = '<img alt="" src="' + String(row.photo).replace(/"/g, '') + '">';
      preview.classList.add('visible');
    }
  }

  function collapse() {
    var rows = list();
    var keep = obieRow();
    if (!keep) return;
    var next = rows.filter(function (b) { return !isObie(b) || b.id === keep.id; });
    try {
      localStorage.setItem('brothers', JSON.stringify(next));
      pin(keep.id);
    } catch (e) {}
  }

  function fire() {
    var row = obieRow();
    if (row) pin(row.id);
    window.__tbSeatAllow = true;
    hideChair();
    hideDetail();
    var title = document.getElementById('profile-modal-title');
    if (title) title.innerHTML = 'EDIT <span class="accent-yellow">PROFILE</span>';
    var modal = document.getElementById('profile-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      modal.style.zIndex = '80';
    }
    try { document.body.style.overflow = 'hidden'; } catch (e0) {}
    fill(row);
    setTimeout(function () { fill(row); }, 80);
    setTimeout(function () { window.__tbSeatAllow = false; }, 1500);
  }

  function fromChair(el) {
    return !!(el && el.closest && el.closest('#brother-open-chair, #brother-slot-invite, #empty-brothers-cta'));
  }

  function isEditTarget(el) {
    if (!el || !el.closest) return null;
    if (fromChair(el)) return null;
    return el.closest('.tb-own-edit-btn, #tb-sheet-edit, #tb-own-edit-btn');
  }

  document.addEventListener('click', function (e) {
    var btn = isEditTarget(e.target);
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    fire();
  }, true);

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest || !e.target.closest('#save-profile')) return;
    setTimeout(collapse, 400);
  }, true);

  function stamp() {
    var grid = document.getElementById('brothers-grid');
    if (!grid) return;
    var row = obieRow();
    if (row) {
      pin(row.id);
      hideChair();
    }
    var cards = grid.querySelectorAll('.brother-card');
    var i, card, name, label;
    for (i = 0; i < cards.length; i++) {
      card = cards[i];
      if (fromChair(card)) continue;
      name = card.querySelector('.brother-name');
      label = clean(name && name.textContent);
      if (label !== 'obie' && label !== 'obie diaz') continue;
      card.classList.add('tb-my-seat');
      if (!card.querySelector('.tb-own-edit-btn')) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tb-own-edit-btn';
        b.textContent = 'EDIT PROFILE';
        card.appendChild(b);
      }
    }
  }

  stamp();
  setTimeout(stamp, 400);
  setTimeout(stamp, 1200);

  if (!document.querySelector('link[href*="own-edit.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/own-edit.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
