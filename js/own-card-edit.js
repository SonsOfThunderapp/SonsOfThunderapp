/* Own-card edit. Every signed-in brother edits HIS seat only. Homepage frozen. */
(function () {
  if (window.__tbOwnCardEdit) return;
  window.__tbOwnCardEdit = 1;

  var BTN = 'tb-own-edit-btn';
  var CHAIR = 'obietv@gmail.com';
  var lastIdx = -1;
  var sessUser = null;
  var clickBound = false;

  function $(id) { return document.getElementById(id); }

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function myId() {
    return lsGet('tb_myProfileId') || lsGet('myProfileId') || '';
  }

  function brothers() {
    try {
      var raw = lsGet('tb_brothers') || lsGet('brothers');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function userObj() {
    try {
      if (typeof currentUser === 'function') {
        var u = currentUser();
        if (u) return u;
      }
    } catch (e) {}
    return sessUser;
  }

  function uid() {
    var u = userObj();
    return (u && u.id) ? String(u.id) : '';
  }

  function sessionEmail() {
    var u = userObj();
    if (u && u.email) return String(u.email).toLowerCase().trim();
    return (($('auth-who') || {}).textContent || '').toLowerCase().trim();
  }

  function isChair() {
    var em = sessionEmail();
    return em === CHAIR || (em && em.indexOf(CHAIR) !== -1);
  }

  function myDisplayName() {
    var u = userObj();
    if (u) {
      var meta = u.user_metadata || {};
      var n = meta.full_name || meta.name || meta.display_name || '';
      if (n) return String(n).trim();
    }
    var who = (($('auth-who') || {}).textContent || '').trim();
    if (who && who.indexOf('@') === -1) return who;
    return '';
  }

  function hasSbSession() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('sb-') !== 0) continue;
        var v = localStorage.getItem(k) || '';
        if (v.indexOf('access_token') !== -1) return true;
      }
    } catch (e) {}
    return false;
  }

  function signedIn() {
    try { if (typeof window.isSignedIn === 'function' && window.isSignedIn()) return true; } catch (e) {}
    if (uid()) return true;
    var who = (($('auth-who') || {}).textContent || '').trim();
    if (who) return true;
    var bar = $('auth-session-bar');
    if (bar && !bar.classList.contains('hidden')) return true;
    if (hasSbSession()) return true;
    return false;
  }

  function isMe(b) {
    if (!b || !signedIn()) return false;
    var id = myId();
    if (id && b.id && String(b.id) === String(id)) return true;
    var owner = uid();
    if (owner && (String(b.owner_id || '') === owner || String(b.user_id || '') === owner)) return true;
    var mine = myDisplayName();
    var card = String(b.name || '').trim();
    if (mine && card && mine.toLowerCase() === card.toLowerCase()) return true;
    if (isChair() && (String(b.id || '') === 'founder-obie' || card.toLowerCase() === 'obie')) return true;
    return false;
  }

  function currentBrother() {
    var list = brothers();
    if (lastIdx >= 0 && list[lastIdx]) return list[lastIdx];
    var name = (($('brother-detail-name') || {}).textContent || '').trim();
    if (!name) return null;
    var id = myId();
    var i;
    if (id) {
      for (i = 0; i < list.length; i++) {
        if (list[i] && String(list[i].id) === String(id)) return list[i];
      }
    }
    for (i = 0; i < list.length; i++) {
      if (list[i] && String(list[i].name || '').trim() === name) return list[i];
    }
    var low = name.toLowerCase();
    for (i = 0; i < list.length; i++) {
      if (list[i] && String(list[i].name || '').trim().toLowerCase() === low) return list[i];
    }
    return null;
  }

  function openMine() {
    try {
      if (typeof closeBrotherDetail === 'function') closeBrotherDetail();
      else {
        var d = $('brother-detail');
        if (d) {
          d.classList.add('hidden');
          d.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      }
    } catch (e0) {}
    try {
      if (typeof window.startMemberSignIn === 'function') window.startMemberSignIn();
      else if (typeof openProfileEditor === 'function') openProfileEditor();
      else {
        var page = $('edit-profile-btn');
        if (page) page.click();
      }
    } catch (e1) {}
  }

  function ensureBtn() {
    if ($(BTN)) return $(BTN);
    var share = $('brother-share-contact');
    var panel = document.querySelector('#brother-detail .brother-detail-panel');
    if (!panel) return null;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = BTN;
    btn.className = 'btn-rsvp';
    btn.textContent = 'EDIT MY SEAT';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!isMe(currentBrother())) return;
      openMine();
    });
    if (share && share.parentNode === panel) panel.insertBefore(btn, share);
    else panel.appendChild(btn);
    return btn;
  }

  function paint() {
    var detail = $('brother-detail');
    var btn = ensureBtn();
    if (!detail || !btn) return;
    var open = !detail.classList.contains('hidden');
    var mine = open && isMe(currentBrother());
    btn.classList.toggle('is-on', !!mine);
    btn.hidden = !mine;
    btn.setAttribute('aria-hidden', mine ? 'false' : 'true');
  }

  function stampBirthday() {
    var row = document.querySelector('#profile-modal .profile-front-row');
    if (!row) return;
    row.classList.add('tb-bday-stack');
    var lab = document.querySelector('label[for="profile-birthday"]');
    if (lab) lab.textContent = 'BIRTHDAY';
    var inp = document.getElementById('profile-birthday');
    if (inp) inp.setAttribute('placeholder', 'MM-DD');
    if (!document.getElementById('tb-bday-hint')) {
      var h = document.createElement('p');
      h.id = 'tb-bday-hint';
      h.textContent = 'Honors hit your card that day.';
      row.insertAdjacentElement('afterend', h);
    }
  }

  function ensureStyle() {
    if ($('tb-own-edit-style')) return;
    var s = document.createElement('style');
    s.id = 'tb-own-edit-style';
    s.textContent =
      '#' + BTN + '{display:none;width:100%;margin:14px 0 8px;}' +
      '#' + BTN + '.is-on{display:block!important;}' +
      '#view-brothers #edit-profile-btn:not(.hidden){display:inline-flex!important;}' +
      '#profile-modal .profile-front-row.tb-bday-stack{grid-template-columns:1fr;}' +
      '#tb-bday-hint{margin:0 0 12px;color:#FEF105;font-size:11px;letter-spacing:.08em;opacity:.88;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function watch() {
    var detail = $('brother-detail');
    if (detail && !detail.__tbOwnWatch) {
      detail.__tbOwnWatch = 1;
      try {
        new MutationObserver(paint).observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
      } catch (e2) {}
    }
    var nameEl = $('brother-detail-name');
    if (nameEl && !nameEl.__tbOwnWatch) {
      nameEl.__tbOwnWatch = 1;
      try {
        new MutationObserver(paint).observe(nameEl, { characterData: true, childList: true, subtree: true });
      } catch (e3) {}
    }
  }

  function probeSession() {
    try {
      if (typeof getSb !== 'function') return;
      var sb = getSb();
      if (!sb || !sb.auth || typeof sb.auth.getSession !== 'function') return;
      sb.auth.getSession().then(function (res) {
        try {
          var u = res && res.data && res.data.session && res.data.session.user;
          if (u) {
            sessUser = u;
            paint();
          }
        } catch (e0) {}
      }).catch(function () {});
    } catch (e1) {}
  }

  function boot() {
    ensureStyle();
    stampBirthday();
    watch();
    probeSession();
    if (!clickBound) {
      clickBound = true;
      document.addEventListener('click', function (e) {
        var card = e.target && e.target.closest && e.target.closest('.brother-card[data-brother-index]');
        if (!card) return;
        lastIdx = parseInt(card.getAttribute('data-brother-index'), 10);
        setTimeout(paint, 40);
        setTimeout(paint, 180);
      }, true);
    }
    paint();
    stampBirthday();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1600);
})();
