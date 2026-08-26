/* Birthday-honor auto-text — companion to LOCK YOUR SEAT.
   Does not call sms-club / TEXT THE CLUB. Fail closed without opt-in or Twilio. */
(function () {
  function digits(raw) { return String(raw || '').replace(/\D/g, ''); }
  function validPhone(raw) {
    var d = digits(raw);
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    return d.length === 10;
  }
  function lsSave(key, val) {
    try { localStorage.setItem('tb_' + key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }
  function lsLoad(key) {
    try { return JSON.parse(localStorage.getItem('tb_' + key)); } catch (e) { return null; }
  }
  function setErr(msg) {
    var el = document.getElementById('auth-error');
    if (el) el.textContent = msg || '';
  }
  function injectSheet() {
    var name = document.getElementById('auth-name');
    var email = document.getElementById('auth-email');
    var phone = document.getElementById('auth-phone');
    var slot = document.getElementById('auth-sms-slot');
    var card = document.querySelector('#auth-gate .auth-card');
    if (!card || !name || !phone) return;
    if (email) email.placeholder = 'Email';
    if (!document.getElementById('auth-sms-opt')) {
      var label = document.createElement('label');
      label.className = 'auth-sms-opt';
      label.setAttribute('for', 'auth-sms-opt');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.id = 'auth-sms-opt';
      box.checked = false;
      box.removeAttribute('checked');
      box.setAttribute('autocomplete', 'off');
      var span = document.createElement('span');
      span.innerHTML = 'Text me about the next night. <a href="https://sonsofthunderboard.com/privacy">Details</a>';
      label.appendChild(box);
      label.appendChild(span);
      if (slot) slot.appendChild(label);
      else if (email && email.parentNode) email.parentNode.insertBefore(label, email.nextSibling);
      else card.appendChild(label);
    } else {
      var live = document.getElementById('auth-sms-opt');
      if (live && !live.getAttribute('data-tb-user')) live.checked = false;
    }
    if (!document.getElementById('tb-bday-sms-style')) {
      var st = document.createElement('style');
      st.id = 'tb-bday-sms-style';
      st.textContent =
        '#auth-gate .auth-card{overflow:auto;max-height:min(86vh,720px);-webkit-overflow-scrolling:touch;}' +
        '.auth-sms-opt{display:flex;align-items:flex-start;gap:10px;max-width:100%;box-sizing:border-box;text-align:left;color:#ccc;font-size:13px;line-height:1.35;margin:8px 0 12px;padding:2px 0;cursor:pointer;font-family:Inter,system-ui,sans-serif}' +
        '.auth-sms-opt span{flex:1;min-width:0;white-space:normal;overflow-wrap:anywhere}' +
        '.auth-sms-opt a{color:#FEF105;text-decoration:underline}' +
        '.auth-sms-opt input[type=checkbox]{-webkit-appearance:none;appearance:none;width:18px;height:18px;min-width:18px;margin:2px 0 0;flex:0 0 18px;border:2px solid #FEF105;border-radius:3px;background:#111;accent-color:#FEF105}' +
        '.auth-sms-opt input[type=checkbox]:checked{background:#FEF105}' +
        '.auth-sms-opt input[type=checkbox]:checked::after{content:"";display:block;width:5px;height:9px;margin:1px 0 0 5px;border:solid #111;border-width:0 2px 2px 0;transform:rotate(45deg)}' +
        '#auth-consent,label.tb-seat-consent{display:none!important}';
      document.head.appendChild(st);
    }
  }
  function stash() {
    injectSheet();
    var name = ((document.getElementById('auth-name') && document.getElementById('auth-name').value) || '').trim();
    var email = ((document.getElementById('auth-email') && document.getElementById('auth-email').value) || '').trim();
    var phone = ((document.getElementById('auth-phone') && document.getElementById('auth-phone').value) || '').trim();
    var opt = !!(document.getElementById('auth-sms-opt') && document.getElementById('auth-sms-opt').checked);
    var seat = { name: name, email: email, phone: phone, smsOptIn: opt, at: Date.now(), key: '' };
    lsSave('pendingSeat', seat);
    lsSave('smsHonorOptIn', opt ? '1' : '0');
    return seat;
  }
  async function sendHonorSms(seat) {
    if (!seat || !seat.smsOptIn) return { skipped: 'no_opt_in' };
    if (!validPhone(seat.phone)) return { skipped: 'bad_phone' };
    try {
      var res = await fetch('/.netlify/functions/sms-im-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opt_in: true, phone: seat.phone })
      });
      var data = {};
      try { data = await res.json(); } catch (e) {}
      if (res.ok && data && data.ok && data.sent) {
        lsSave('tbBdaySmsSent', '1');
        return { sent: true };
      }
      return { sent: false, error: (data && data.error) || 'not_sent' };
    } catch (e) {
      return { sent: false, error: 'not_sent' };
    }
  }
  function closeGate() {
    var gate = document.getElementById('auth-gate');
    if (gate) {
      gate.classList.add('hidden');
      gate.classList.remove('auth-gate-imin');
    }
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#auth-signin-btn');
    if (!btn) return;
    var seat = stash();
    if (seat.smsOptIn && validPhone(seat.phone)) {
      sendHonorSms(seat);
    }
    if (seat.email) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!seat.name || !validPhone(seat.phone)) {
      setErr('Name and phone.');
      return;
    }
    setErr('');
    btn.disabled = true;
    setTimeout(function () {
      btn.disabled = false;
      closeGate();
    }, 280);
  }, true);

  function openBirthdayField() {
    var nav = document.querySelector('.nav-item[data-view="brothers"]');
    if (nav) {
      try { nav.click(); } catch (e) {}
    }
    setTimeout(function () {
      var edit = document.getElementById('edit-profile-btn');
      if (edit && !edit.classList.contains('hidden')) {
        try { edit.click(); } catch (e) {}
      } else {
        var modal = document.getElementById('profile-modal');
        if (modal) modal.classList.remove('hidden');
      }
      setTimeout(function () {
        var el = document.getElementById('profile-birthday');
        if (!el) return;
        try { el.scrollIntoView({ block: 'center' }); } catch (e2) {}
        try { el.focus(); } catch (e2) {}
      }, 220);
    }, 360);
  }

  function applyBdayLink() {
    try {
      var u = new URL(location.href);
      if (u.searchParams.get('bday') === '1' || (u.hash && u.hash.replace('#', '') === 'bday')) {
        setTimeout(openBirthdayField, 700);
      }
    } catch (e) {}
  }

  function boot() {
    injectSheet();
    applyBdayLink();
    var opt = document.getElementById('auth-sms-opt');
    if (opt && !opt.getAttribute('data-tb-bound')) {
      opt.setAttribute('data-tb-bound', '1');
      opt.addEventListener('change', function () { opt.setAttribute('data-tb-user', '1'); });
    }
    var gate = document.getElementById('auth-gate');
    if (gate && !gate.dataset.tbBdayObs) {
      gate.dataset.tbBdayObs = '1';
      var obs = new MutationObserver(function () { injectSheet(); });
      obs.observe(gate, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
