/* Unsigned brother-detail only: faint official gold bolt + SIGN IN on the white QR box.
   Existing assets only (/assets/bolt-for-qr.png, /assets/logo-bolt-mask-crop.png).
   Reuses startMemberSignIn. Signed-in QR / phone-unlock stays. */
(function () {
  var STYLE_ID = 'tb-guest-qr-style';
  var MARK = 'data-tb-guest-qr';
  var CARD = 'data-tb-guest-card';
  var painted = false;
  var obs = null;

  function signedIn() {
    try {
      if (typeof window.isSignedIn === 'function') return !!window.isSignedIn();
    } catch (e) {}
    try {
      var bar = document.getElementById('auth-session-bar');
      if (bar && !bar.classList.contains('hidden')) return true;
    } catch (e2) {}
    return false;
  }

  function openExistingSignIn(ev) {
    if (ev) {
      try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    }
    try {
      if (typeof window.startMemberSignIn === 'function') {
        window.startMemberSignIn();
        return;
      }
    } catch (e2) {}
    try {
      var entry = document.getElementById('auth-entry-btn');
      if (entry) entry.click();
    } catch (e3) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#brother-detail[' + CARD + '="1"] #brother-qr-stage,' +
      '#brother-detail[' + CARD + '="1"] #brother-qr-target[' + MARK + '="1"]{cursor:pointer;z-index:3;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-signin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;height:100%;min-height:200px;margin:0;padding:16px 12px;border:0;background:#fff;cursor:pointer;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-bolt{width:84px;height:84px;display:block;background-color:#FEF105;opacity:.28;pointer-events:none;' +
      '-webkit-mask:url(/assets/logo-bolt-mask-crop.png) center/contain no-repeat;mask:url(/assets/logo-bolt-mask-crop.png) center/contain no-repeat;' +
      '-webkit-mask-source-type:luminance;mask-mode:luminance;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-bolt-img{width:84px;height:84px;object-fit:contain;opacity:.3;pointer-events:none;display:none;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-word{color:#E30600;font:inherit;font-size:15px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;line-height:1;}' +
      '#brother-detail[' + CARD + '="1"] .qr-bolt-pad{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] #brother-share-contact{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] .qr-empty-whisper{display:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function realQr(target) {
    if (!target) return false;
    return !!(target.querySelector('canvas, table') && !target.querySelector('.tb-guest-qr-signin'));
  }

  function paintGuestBox() {
    var detail = document.getElementById('brother-detail');
    var target = document.getElementById('brother-qr-target');
    var wrap = document.getElementById('brother-qr-wrap');
    var stage = document.getElementById('brother-qr-stage');
    if (!detail || !target || !wrap) return;
    if (detail.classList.contains('hidden')) { painted = false; return; }
    if (signedIn() || realQr(target)) { painted = false; return; }
    if (target.querySelector('.tb-guest-qr-signin')) {
      if (detail.getAttribute(CARD) !== '1') detail.setAttribute(CARD, '1');
      if (target.getAttribute(MARK) !== '1') target.setAttribute(MARK, '1');
      painted = true;
      return;
    }
    wrap.classList.remove('hidden');
    detail.setAttribute(CARD, '1');
    target.setAttribute(MARK, '1');
    target.setAttribute('role', 'button');
    target.setAttribute('tabindex', '0');
    target.setAttribute('aria-hidden', 'false');
    target.setAttribute('aria-label', 'SIGN IN');
    target.innerHTML =
      '<button type="button" class="tb-guest-qr-signin" aria-label="SIGN IN">' +
      '<span class="tb-guest-qr-bolt" aria-hidden="true"></span>' +
      '<img class="tb-guest-qr-bolt-img" src="/assets/bolt-for-qr.png" alt="" width="84" height="84">' +
      '<span class="tb-guest-qr-word">SIGN IN</span>' +
      '</button>';
    var btn = target.querySelector('.tb-guest-qr-signin');
    if (btn && !btn.getAttribute('data-tb-bound')) {
      btn.setAttribute('data-tb-bound', '1');
      btn.addEventListener('click', openExistingSignIn);
    }
    if (target && !target.getAttribute('data-tb-bound')) {
      target.setAttribute('data-tb-bound', '1');
      target.addEventListener('click', openExistingSignIn);
    }
    if (stage && !stage.getAttribute('data-tb-bound')) {
      stage.setAttribute('data-tb-bound', '1');
      stage.addEventListener('click', openExistingSignIn);
    }
    var hint = wrap.querySelector('.brother-qr-hint');
    if (hint && hint.textContent) hint.textContent = '';
    painted = true;
  }

  function sync() {
    ensureStyle();
    var detail = document.getElementById('brother-detail');
    if (!detail || detail.classList.contains('hidden') || signedIn()) {
      painted = false;
      return;
    }
    if (painted && detail.getAttribute(CARD) === '1' && document.querySelector('.tb-guest-qr-signin')) return;
    if (obs) obs.disconnect();
    try { paintGuestBox(); } finally {
      if (obs && detail) obs.observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden', CARD], childList: true, subtree: false });
    }
  }

  function boot() {
    ensureStyle();
    var detail = document.getElementById('brother-detail');
    if (detail && !obs) {
      obs = new MutationObserver(function () { setTimeout(sync, 0); });
      obs.observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden'], childList: false, subtree: false });
    }
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
