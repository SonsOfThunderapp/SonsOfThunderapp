/* Unsigned brother-detail only: faint official gold bolt + SIGN IN on the white QR box.
   Uses existing /assets/bolt-for-qr.png. No new mark. Signed-in QR / phone-unlock stays. */
(function () {
  var STYLE_ID = 'tb-guest-qr-style';
  var MARK = 'data-tb-guest-qr';
  var CARD = 'data-tb-guest-card';
  var BOLT_SRC = '/assets/bolt-for-qr.png';

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
      '#brother-detail[' + CARD + '="1"] #brother-qr-stage,' +
      '#brother-detail[' + CARD + '="1"] #brother-qr-target[' + MARK + '="1"]{cursor:pointer;z-index:3;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-signin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;height:100%;min-height:200px;margin:0;padding:16px 12px;border:0;background:#fff;cursor:pointer;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-bolt{width:86px;height:86px;display:block;opacity:.34;pointer-events:none;}' +
      '#brother-detail[' + CARD + '="1"] .tb-guest-qr-word{color:#E30600;font:inherit;font-size:15px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;line-height:1;}' +
      '#brother-detail[' + CARD + '="1"] .qr-bolt-pad{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] #brother-share-contact{display:none!important;}' +
      '#brother-detail[' + CARD + '="1"] .qr-empty-whisper{display:none!important;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function knockBlack(canvas, img) {
    var w = 172;
    var h = 172;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    try {
      var d = ctx.getImageData(0, 0, w, h);
      var p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        if ((p[i] + p[i + 1] + p[i + 2]) < 40) p[i + 3] = 0;
      }
      ctx.putImageData(d, 0, 0);
    } catch (e) {}
    canvas.setAttribute('data-ready', '1');
  }

  function paintBolt(btn) {
    if (!btn) return;
    var c = btn.querySelector('canvas.tb-guest-qr-bolt');
    if (c && c.getAttribute('data-ready') === '1') return;
    if (!c) {
      c = document.createElement('canvas');
      c.className = 'tb-guest-qr-bolt';
      c.setAttribute('aria-hidden', 'true');
      btn.insertBefore(c, btn.firstChild);
    }
    var img = new Image();
    img.onload = function () { knockBlack(c, img); };
    img.src = BOLT_SRC;
  }

  function bindBox(el) {
    if (!el || el.getAttribute('data-tb-guest-bound') === '1') return;
    el.setAttribute('data-tb-guest-bound', '1');
    el.addEventListener('click', openExistingSignIn);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') openExistingSignIn(e);
    });
  }

  function realQr(target) {
    if (!target) return false;
    if (target.querySelector('canvas:not(.tb-guest-qr-bolt)')) return true;
    if (target.querySelector('table')) return true;
    var img = target.querySelector('img');
    return !!(img && img.className.indexOf('tb-guest-qr') === -1);
  }

  function paintGuestBox() {
    var detail = document.getElementById('brother-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    var target = document.getElementById('brother-qr-target');
    var wrap = document.getElementById('brother-qr-wrap');
    var stage = document.getElementById('brother-qr-stage');
    if (!target || !wrap) return;
    if (realQr(target)) return;
    wrap.classList.remove('hidden');
    detail.setAttribute(CARD, '1');
    var btn = target.querySelector('.tb-guest-qr-signin');
    if (btn) {
      target.setAttribute(MARK, '1');
      bindBox(target);
      bindBox(stage);
      paintBolt(btn);
      return;
    }
    target.setAttribute(MARK, '1');
    target.setAttribute('role', 'button');
    target.setAttribute('tabindex', '0');
    target.setAttribute('aria-hidden', 'false');
    target.setAttribute('aria-label', 'SIGN IN');
    target.innerHTML =
      '<button type="button" class="tb-guest-qr-signin" aria-label="SIGN IN">' +
      '<span class="tb-guest-qr-word">SIGN IN</span>' +
      '</button>';
    btn = target.querySelector('.tb-guest-qr-signin');
    paintBolt(btn);
    bindBox(target);
    bindBox(stage);
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
