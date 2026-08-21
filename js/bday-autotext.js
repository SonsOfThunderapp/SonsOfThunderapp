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
  function stash() {
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
    try { if (lsLoad('tbBdaySmsSent') === '1') return { skipped: 'already' }; } catch (e) {}
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
  function waitLinkSent(thenFn) {
    var err = document.getElementById('auth-error');
    var start = Date.now();
    var t = setInterval(function () {
      var text = err ? String(err.textContent || '') : '';
      if (text === 'Link sent.') {
        clearInterval(t);
        thenFn(true);
        return;
      }
      if (Date.now() - start > 10000) {
        clearInterval(t);
        thenFn(false);
      }
    }, 160);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#auth-signin-btn');
    if (!btn) return;
    var seat = stash();
    if (seat.email) {
      waitLinkSent(function (ok) {
        if (ok) sendHonorSms(seat);
      });
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!seat.name || !validPhone(seat.phone)) {
      setErr('Name and phone.');
      return;
    }
    setErr('');
    btn.disabled = true;
    sendHonorSms(seat).finally(function () {
      btn.disabled = false;
      setTimeout(closeGate, 280);
    });
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyBdayLink);
  else applyBdayLink();
})();
