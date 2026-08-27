/* Own-card edit. Every signed-in brother edits HIS seat only. Homepage frozen. */
(function () {
  if (window.__tbOwnCardEdit) return;
  window.__tbOwnCardEdit = 1;

  var BTN = 'tb-own-edit-btn';
  var lastIdx = -1;

  function $(id) { return document.getElementById(id); }

  function signedIn() {
    try { if (typeof window.isSignedIn === 'function') return !!window.isSignedIn(); } catch (e) {}
    var bar = $('auth-session-bar');
    return !!(bar && !bar.classList.contains('hidden'));
  }

  function myId() {
    try { return localStorage.getItem('myProfileId') || ''; } catch (e) { return ''; }
  }

  function brothers() {
    try {
      var raw = localStorage.getItem('brothers');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function uid() {
    try {
      if (typeof currentUser === 'function') {
        var u = currentUser();
        return (u && u.id) ? String(u.id) : '';
      }
    } catch (e) {}
    return '';
  }

  function isMe(b) {
    if (!b || !signedIn()) return false;
    var id = myId();
    if (id && b.id && String(b.id) === String(id)) return true;
    var owner = uid();
    if (owner && (String(b.owner_id || '') === owner || String(b.user_id || '') === owner)) return true;
    return false;
  }

  function currentBrother() {
    var list = brothers();
    if (lastIdx >= 0 && list[lastIdx]) return list[lastIdx];
    var name = (($('brother-detail-name') || {}).textContent || '').trim();
    if (!name) return null;
    var id = myId();
    if (id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] && String(list[i].id) === String(id) && String(list[i].name || '').trim() === name) return list[i];
      }
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

  function boot() {
    ensureStyle();
    stampBirthday();
    document.addEventListener('click', function (e) {
      var card = e.target && e.target.closest && e.target.closest('.brother-card[data-brother-index]');
      if (!card) return;
      lastIdx = parseInt(card.getAttribute('data-brother-index'), 10);
      setTimeout(paint, 40);
      setTimeout(paint, 180);
    }, true);
    var detail = $('brother-detail');
    if (detail && !detail.__tbOwnWatch) {
      detail.__tbOwnWatch = 1;
      try {
        new MutationObserver(paint).observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
      } catch (e2) {}
    }
    paint();
    stampBirthday();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1600);
})();
