/* Unsigned brother-detail only: SIGN IN lives on the white QR box.
   Signed-in path (real QR / phone-unlocks share) is untouched. */
(function () {
  var STYLE_ID = 'tb-guest-qr-style';
  var MARK = 'data-tb-guest-qr';
  var CARD = 'data-tb-guest-card';

  function signedIn() {
    try {
      if (typeof window.isSignedIn === 'function') return !!window.isSignedIn();
    } catch (e) {}
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (k.indexOf('sb-') !== 0 && !/supabase/i.test(k)) continue;
        var v = localStorage.getItem(k) || '';
        if (v.indexOf('access_token') !== -1) return true;
      }
    } catch (e2) {}
    try {
      var bar = document.getElementById('auth-session-bar');
      if (bar && !bar.classList.contains('hidden')) return true;
    } catch (e3) {}
    return false;
  }

  function openExistingSignIn(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    try {
      if (typeof window.startMemberSignIn === 'function') {
        window.startMemberSignIn();
        return;
      }
    } catch (e) {}
    try {
      var entry = document.getElementById('auth-entry-btn') || document.getElementById('home-member-cta');
      if (entry) entry.click();
    } catch (e2) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#brother-detail[' + CARD + '="1"] #brother-qr-target[' + MARK + '="1"]{cursor:pointer;z-index:3;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-signin{display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:200px;margin:0;padding:0;border:0;background:#fff;color:#111;font:inherit;font-size:14px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;}' +
      '#brother-detail[' + CARD + '="1"] .qr-bolt-pad{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] #brother-share-contact{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] .qr-empty-whisper{display:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function bindBox(target) {
    if (!target || target.getAttribute('data-tb-guest-bound') === '1') return;
    target.setAttribute('data-tb-guest-bound', '1');
    target.addEventListener('click', openExistingSignIn);
    target.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') openExistingSignIn(e);
    });
  }

  function paintGuestBox() {
    var detail = document.getElementById('brother-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    var target = document.getElementById('brother-qr-target');
    var wrap = document.getElementById('brother-qr-wrap');
    if (!target || !wrap) return;
    if (target.querySelector('canvas, img, table')) return;
    wrap.classList.remove('hidden');
    detail.setAttribute(CARD, '1');
    if (target.querySelector('.tb-guest-qr-signin')) {
      target.setAttribute(MARK, '1');
      bindBox(target);
      return;
    }
    target.setAttribute(MARK, '1');
    target.setAttribute('role', 'button');
    target.setAttribute('tabindex', '0');
    target.setAttribute('aria-hidden', 'false');
    target.setAttribute('aria-label', 'SIGN IN');
    target.innerHTML = '<button type="button" class="tb-guest-qr-signin">SIGN IN</button>';
    bindBox(target);
    var btn = target.querySelector('.tb-guest-qr-signin');
    if (btn) btn.addEventListener('click', openExistingSignIn);
    var hint = wrap.querySelector('.brother-qr-hint');
    if (hint) hint.textContent = '';
  }

  function clearGuestMarks() {
    var detail = document.getElementById('brother-detail');
    if (detail) detail.removeAttribute(CARD);
    var target = document.getElementById('brother-qr-target');
    if (target) {
      target.removeAttribute(MARK);
      target.removeAttribute('role');
      target.removeAttribute('tabindex');
      target.removeAttribute('aria-label');
    }
  }

  var painting = false;

  function sync() {
    if (painting) return;
    painting = true;
    try {
    ensureStyle();
    var detail = document.getElementById('brother-detail');
    if (!detail || detail.classList.contains('hidden')) {
      clearGuestMarks();
      return;
    }
    if (signedIn()) {
      clearGuestMarks();
      return;
    }
    paintGuestBox();
    } finally {
      painting = false;
    }
  }

  function boot() {
    ensureStyle();
    sync();
    var detail = document.getElementById('brother-detail');
    if (detail && !detail._tbGuestQrObs) {
      var obs = new MutationObserver(sync);
      obs.observe(detail, { attributes: true, childList: true, subtree: true });
      detail._tbGuestQrObs = obs;
    }
    setInterval(sync, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
