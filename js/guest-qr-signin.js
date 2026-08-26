/* Seat form first. QR is the receipt. Never a blank white code. */
(function () {
  var DRAFT = 'tb_seatDraft';
  var STYLE_ID = 'tb-seat-first-style';

  function $(id) { return document.getElementById(id); }

  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  function loadList() {
    try {
      var raw = localStorage.getItem('brothers');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function myId() {
    try { return localStorage.getItem('myProfileId') || ''; } catch (e) { return ''; }
  }

  function me() {
    var id = myId();
    var list = loadList();
    if (id) {
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function hasSeat(b) {
    return !!(b && String(b.name || '').trim() && digits(b.phone).length >= 7);
  }

  function signedIn() {
    try { if (typeof window.isSignedIn === 'function') return !!window.isSignedIn(); } catch (e) {}
    var bar = $('auth-session-bar');
    return !!(bar && !bar.classList.contains('hidden'));
  }

  function viewedName() {
    var el = $('brother-detail-name');
    return el ? String(el.textContent || '').trim() : '';
  }

  function isOwnCard() {
    var m = me();
    var n = viewedName().toLowerCase();
    if (m && m.name && n && String(m.name).trim().toLowerCase() === n) return true;
    var list = loadList();
    var id = myId();
    if (!id || !n) return false;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id && String(list[i].name || '').trim().toLowerCase() === n) return true;
    }
    return false;
  }

  function viewedHasPhone() {
    var n = viewedName().toLowerCase();
    var list = loadList();
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b && String(b.name || '').trim().toLowerCase() === n && digits(b.phone).length >= 7) return true;
    }
    return hasSeat(me()) && isOwnCard();
  }

  function ensureStyle() {
    if ($(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#brother-detail[data-tb-no-qr="1"] #brother-qr-wrap,' +
      '#brother-detail[data-tb-no-qr="1"] #brother-qr-stage,' +
      '#brother-detail[data-tb-no-qr="1"] #brother-qr-target,' +
      '#brother-detail[data-tb-no-qr="1"] #brother-share-contact,' +
      '#brother-detail[data-tb-no-qr="1"] .qr-empty-whisper,' +
      '#brother-detail[data-tb-no-qr="1"] .tb-guest-qr-signin,' +
      '#brother-detail[data-tb-no-qr="1"] .qr-bolt-pad{display:none!important;}' +
      '#auth-gate[data-no-swipe-close="1"],#profile-modal[data-no-swipe-close="1"]{touch-action:pan-y;}' +
      '#auth-consent,label.tb-seat-consent{display:none!important;}' +
      '#auth-signin-btn.tb-form-signin{letter-spacing:.08em;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function hideFakeQr() {
    var detail = $('brother-detail');
    var wrap = $('brother-qr-wrap');
    var target = $('brother-qr-target');
    var share = $('brother-share-contact');
    if (!detail) return;
    var fake = target && target.querySelector('.tb-guest-qr-signin, .qr-empty-state');
    var real = target && target.querySelector('canvas, table');
    if (!viewedHasPhone() || fake) {
      detail.setAttribute('data-tb-no-qr', '1');
      if (wrap) wrap.classList.add('hidden');
      if (target) {
        target.innerHTML = '';
        target.removeAttribute('data-tb-guest-qr');
      }
      if (share) share.classList.add('hidden');
      detail.removeAttribute('data-tb-guest-card');
    } else if (real) {
      detail.removeAttribute('data-tb-no-qr');
    }
  }

  function injectFields() {
    var gate = $('auth-gate');
    var email = $('auth-email');
    if (!gate || !email) return;
    if (!$('auth-name')) {
      var nm = document.createElement('input');
      nm.type = 'text';
      nm.id = 'auth-name';
      nm.placeholder = 'Name';
      nm.autocomplete = 'name';
      nm.maxLength = 40;
      email.parentNode.insertBefore(nm, email);
    }
    if (!$('auth-phone')) {
      var ph = document.createElement('input');
      ph.type = 'tel';
      ph.id = 'auth-phone';
      ph.placeholder = 'Phone';
      ph.autocomplete = 'tel';
      ph.inputMode = 'tel';
      ph.maxLength = 20;
      email.parentNode.insertBefore(ph, email.nextSibling);
    }
    /* SMS box lives on #auth-sms-opt. Do not stack a second checkbox. */
    var sign = $('auth-signin-btn');
    if (sign && !sign.textContent) sign.textContent = 'SIGN IN';
  }

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT) || '{}'); } catch (e) { return {}; }
  }

  function writeDraft() {
    var d = {
      name: ($('auth-name') && $('auth-name').value) || '',
      phone: ($('auth-phone') && $('auth-phone').value) || '',
      email: ($('auth-email') && $('auth-email').value) || '',
      consent: !!( $('auth-consent') && $('auth-consent').checked )
    };
    try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch (e) {}
  }

  function applyDraft() {
    var d = readDraft();
    if ($('auth-name') && d.name && !$('auth-name').value) $('auth-name').value = d.name;
    if ($('auth-phone') && d.phone && !$('auth-phone').value) $('auth-phone').value = d.phone;
    if ($('auth-email') && d.email && !$('auth-email').value) $('auth-email').value = d.email;
    /* do not restore SMS consent — must be a fresh tap */
  }

  function fieldsTyped() {
    var n = ($('auth-name') && $('auth-name').value) || '';
    var p = ($('auth-phone') && $('auth-phone').value) || '';
    var e = ($('auth-email') && $('auth-email').value) || '';
    return !!(n.trim() || p.trim() || e.trim());
  }

  function openForm() {
    injectFields();
    applyDraft();
    stickForm($('auth-gate'));
    stickForm($('profile-modal'));
    try {
      if (typeof window.startMemberSignIn === 'function') window.startMemberSignIn();
    } catch (e) {}
    try {
      var entry = $('auth-entry-btn');
      var gate = $('auth-gate');
      if (gate && gate.classList.contains('hidden') && entry) entry.click();
    } catch (e2) {}
    var title = $('auth-title');
    if (title) title.textContent = 'LOCK YOUR SEAT';
    var sign = $('auth-signin-btn');
    if (sign) {
      sign.textContent = 'SIGN IN';
      sign.classList.add('tb-form-signin');
    }
  }

  function closeDetailHome() {
    var detail = $('brother-detail');
    if (!detail) return;
    detail.classList.add('hidden');
    detail.setAttribute('aria-hidden', 'true');
    var wrap = $('brother-qr-wrap');
    if (wrap) wrap.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function ownNeedsSeat() {
    return isOwnCard() && !hasSeat(me()) && !viewedHasPhone();
  }

  function onDetail() {
    var detail = $('brother-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    hideFakeQr();
    if (ownNeedsSeat()) {
      closeDetailHome();
      openForm();
    }
  }

  function interceptOwnCard(ev) {
    var card = ev.target && ev.target.closest && ev.target.closest('.brother-card[data-brother-index]');
    if (!card) return;
    var idx = parseInt(card.getAttribute('data-brother-index'), 10);
    var list = loadList();
    var b = list[idx];
    var mine = me();
    var own = !!(b && mine && b.id && mine.id && b.id === mine.id);
    if (!own && b && mine && mine.name && String(b.name || '').toLowerCase() === String(mine.name).toLowerCase()) own = true;
    if (!own && !signedIn() && mine && !hasSeat(mine) && b && mine.id && b.id === mine.id) own = true;
    if (!own) return;
    if (hasSeat(b) || hasSeat(mine)) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    openForm();
  }

  function stickForm(el) {
    if (!el || el.getAttribute('data-tb-sticky') === '1') return;
    el.setAttribute('data-tb-sticky', '1');
    el.setAttribute('data-no-swipe-close', '1');
    function blockSwipe(ev) {
      if (ev.target && ev.target.closest && ev.target.closest('input, textarea, select')) return;
      ev.stopPropagation();
    }
    el.addEventListener('touchstart', blockSwipe, true);
    el.addEventListener('touchmove', function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest('input, textarea, select')) return;
      ev.stopPropagation();
      if (ev.cancelable) ev.preventDefault();
    }, { capture: true, passive: false });
    el.addEventListener('touchend', blockSwipe, true);
    el.addEventListener('click', function (ev) {
      if (ev.target === el) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    }, true);
  }

  function bindDraft() {
    ['auth-name', 'auth-phone', 'auth-email', 'auth-consent'].forEach(function (id) {
      var el = $(id);
      if (!el || el.getAttribute('data-tb-draft') === '1') return;
      el.setAttribute('data-tb-draft', '1');
      el.addEventListener('input', writeDraft);
      el.addEventListener('change', writeDraft);
    });
    var cancel = $('auth-cancel-btn');
    if (cancel && cancel.getAttribute('data-tb-draft-x') !== '1') {
      cancel.setAttribute('data-tb-draft-x', '1');
      cancel.addEventListener('click', function () {
        if (fieldsTyped()) writeDraft();
      }, true);
    }
  }

  function interceptDetailX(ev) {
    var x = ev.target && ev.target.closest && ev.target.closest('#brother-detail-close');
    if (!x) return;
    hideFakeQr();
  }

  function boot() {
    ensureStyle();
    injectFields();
    applyDraft();
    bindDraft();
    stickForm($('auth-gate'));
    stickForm($('profile-modal'));
    document.addEventListener('click', interceptOwnCard, true);
    document.addEventListener('click', interceptDetailX, true);
    var detail = $('brother-detail');
    if (detail) {
      var obs = new MutationObserver(function () { setTimeout(onDetail, 0); });
      obs.observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden'], childList: true, subtree: true });
    }
    var gate = $('auth-gate');
    if (gate) {
      var gobs = new MutationObserver(function () {
        if (!gate.classList.contains('hidden')) {
          injectFields();
          applyDraft();
          bindDraft();
          stickForm(gate);
          var title = $('auth-title');
          if (title) title.textContent = 'LOCK YOUR SEAT';
        }
      });
      gobs.observe(gate, { attributes: true, attributeFilter: ['class'] });
    }
    hideFakeQr();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
