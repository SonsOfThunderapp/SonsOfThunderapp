/* LOCK MY SEAT = phone + email + password. Forgot = SMS code in this sheet. No magic link. */
(function () {
  function $(id) { return document.getElementById(id); }
  function val(id) {
    var el = $(id);
    return el ? String(el.value || '').trim() : '';
  }
  function setErr(msg) {
    var el = $('auth-error');
    if (el) {
      el.textContent = msg || '';
      el.classList.toggle('hidden', !msg);
    }
  }
  function toast(msg) {
    try {
      if (typeof window.tbToast === 'function') window.tbToast(msg, 2200);
      else if (typeof window.showInstallToast === 'function') window.showInstallToast(msg);
    } catch (e0) {}
  }
  function sbApi() {
    try { return (window.getSb && window.getSb()) || null; } catch (e1) { return null; }
  }
  function niceErr(err) {
    var raw = String((err && err.message) || err || '');
    if (/confirm|verify|not allowed/i.test(raw)) return 'Ask a leader to turn off email confirm.';
    if (/already registered|already been registered|user already/i.test(raw)) {
      return 'Seat exists. Use that password — or FORGOT.';
    }
    if (/invalid login|invalid credentials|invalid email or password/i.test(raw)) {
      return 'Wrong password. Tap FORGOT.';
    }
    if (/invite/i.test(raw)) return 'Ask a leader for an invite.';
    return raw || 'Could not lock the seat.';
  }

  var resetTok = '';
  var resetExp = '';

  function ensureForgotUi() {
    var slot = $('auth-sms-slot');
    if (slot && !slot.querySelector('#auth-reset-code')) {
      slot.innerHTML = '<div id="auth-reset-wrap" class="hidden">Text code' +
        '<input id="auth-reset-code" maxlength="6" inputmode="numeric" autocomplete="one-time-code" /></div>';
    }
    var forgot = $('auth-forgot-btn');
    if (forgot) {
      forgot.classList.remove('hidden');
      forgot.removeAttribute('hidden');
      forgot.textContent = 'FORGOT';
      forgot.style.display = 'inline-block';
    }
  }

  function wireFields() {
    ensureForgotUi();
    var email = $('auth-email');
    var phone = $('auth-phone');
    var pass = $('auth-password');
    var magic = $('auth-magic-btn');
    var hint = $('auth-hint');
    if (email) {
      email.setAttribute('autocomplete', 'username');
      email.setAttribute('name', 'email');
      email.setAttribute('inputmode', 'email');
    }
    if (phone) {
      phone.setAttribute('autocomplete', 'tel');
      phone.setAttribute('name', 'tel');
      phone.setAttribute('inputmode', 'tel');
    }
    if (pass) {
      pass.classList.remove('hidden');
      pass.removeAttribute('hidden');
      pass.removeAttribute('aria-hidden');
      pass.removeAttribute('tabindex');
      pass.style.display = 'block';
      pass.setAttribute('autocomplete', resetTok ? 'new-password' : 'current-password');
      pass.setAttribute('name', 'password');
      if (!pass.getAttribute('placeholder')) pass.setAttribute('placeholder', resetTok ? 'New password' : 'Password');
    }
    if (magic) {
      magic.classList.add('hidden');
      magic.setAttribute('hidden', 'hidden');
      magic.style.display = 'none';
    }
    if (hint) hint.classList.add('hidden');
  }

  async function inviteOk(email) {
    var sb = sbApi();
    if (!sb) return true;
    try {
      var res = await sb.rpc('invite_ok', { e: email });
      if (res && res.error) return true;
      if (typeof res.data === 'boolean') return res.data;
      return true;
    } catch (e2) { return true; }
  }

  function pingSms(phone, name) {
    try {
      fetch('/.netlify/functions/seat-locked-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, name: name || '' })
      }).catch(function () {});
    } catch (e3) {}
  }

  function closeGate() {
    try { if (typeof window.closeAuthGate === 'function') window.closeAuthGate(); } catch (e4) {}
    var gate = $('auth-gate');
    if (gate) { gate.classList.add('hidden'); document.body.style.overflow = ''; }
  }

  async function sendForgot() {
    var email = val('auth-email').toLowerCase();
    var phone = val('auth-phone');
    if (!email || !phone) { setErr('Email and phone first.'); return; }
    setErr('');
    var forgot = $('auth-forgot-btn');
    if (forgot) forgot.disabled = true;
    try {
      var res = await fetch('/.netlify/functions/seat-forgot-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, phone: phone })
      });
      var j = {};
      try { j = await res.json(); } catch (e5) {}
      if (!j || !j.token) { setErr((j && j.error) || 'Could not text the code.'); return; }
      resetTok = j.token;
      resetExp = String(j.exp || '');
      var wrap = $('auth-reset-wrap');
      if (wrap) wrap.classList.remove('hidden');
      var pass = $('auth-password');
      if (pass) pass.setAttribute('placeholder', 'New password');
      var btn = $('auth-signin-btn');
      if (btn) btn.textContent = 'SET NEW PASSWORD';
      toast('CODE SENT');
      try { $('auth-reset-code').focus(); } catch (e6) {}
    } catch (e7) {
      setErr('Could not text the code.');
    } finally {
      if (forgot) forgot.disabled = false;
    }
  }

  async function setNewAndIn() {
    var email = val('auth-email').toLowerCase();
    var phone = val('auth-phone');
    var pass = val('auth-password');
    var code = val('auth-reset-code');
    if (!code || pass.length < 6) { setErr('Code and 6+ character password.'); return; }
    var res = await fetch('/.netlify/functions/seat-forgot-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email, phone: phone, code: code, token: resetTok, exp: resetExp, password: pass
      })
    });
    var j = {};
    try { j = await res.json(); } catch (e8) {}
    if (!j || !j.ok) throw new Error((j && j.error) || 'Could not set password.');
    var sb = sbApi();
    if (!sb) throw new Error('Could not lock the seat.');
    var inn = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (inn && inn.error) throw inn.error;
    resetTok = '';
    resetExp = '';
    toast('SEAT LOCKED');
    closeGate();
  }

  async function lockSeat(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    var email = val('auth-email').toLowerCase();
    var phone = val('auth-phone');
    var pass = val('auth-password');
    var name = val('auth-name');
    if (resetTok) {
      try { await setNewAndIn(); } catch (errR) { setErr(niceErr(errR)); }
      return;
    }
    if (!email || !pass) { setErr('Email and password.'); return; }
    if (!phone) { setErr('Phone.'); return; }
    if (pass.length < 6) { setErr('Password needs 6+ characters.'); return; }
    var sb = sbApi();
    if (!sb || !sb.auth) { setErr('Could not lock the seat.'); return; }
    setErr('');
    var btn = $('auth-signin-btn');
    if (btn) btn.disabled = true;
    try {
      var allowed = await inviteOk(email);
      if (!allowed) throw new Error('Ask a leader for an invite.');
      var inn = await sb.auth.signInWithPassword({ email: email, password: pass });
      if (inn && inn.error) {
        var raw = String((inn.error && inn.error.message) || '');
        if (/invalid login|invalid credentials|invalid email or password/i.test(raw)) {
          throw inn.error;
        }
        var up = await sb.auth.signUp({
          email: email,
          password: pass,
          options: { data: { full_name: name || '', phone: phone } }
        });
        if (up && up.error) throw up.error;
        if (up && up.data && !up.data.session) {
          inn = await sb.auth.signInWithPassword({ email: email, password: pass });
          if (inn && inn.error) throw inn.error;
        }
      }
      try { if (typeof window.stashSeatFromGate === 'function') window.stashSeatFromGate(); } catch (e5) {}
      toast('SEAT LOCKED');
      pingSms(phone, name);
      closeGate();
    } catch (err) {
      setErr(niceErr(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bind() {
    wireFields();
    var btn = $('auth-signin-btn');
    var form = $('auth-seat-form');
    var forgot = $('auth-forgot-btn');
    if (btn && btn.dataset.tbSeat !== '1') {
      btn.dataset.tbSeat = '1';
      btn.addEventListener('click', lockSeat, true);
    }
    if (form && form.dataset.tbSeat !== '1') {
      form.dataset.tbSeat = '1';
      form.addEventListener('submit', lockSeat, true);
    }
    if (forgot && forgot.dataset.tbSeat !== '1') {
      forgot.dataset.tbSeat = '1';
      forgot.addEventListener('click', function (e) {
        e.preventDefault();
        sendForgot();
      }, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 400);
  setTimeout(bind, 1200);
  setInterval(wireFields, 900);
})();
