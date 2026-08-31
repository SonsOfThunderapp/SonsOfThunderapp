/* 20260831-founder-ping — Obie-only. I’m In + seat lock. Never a club blast. */
(function () {
  if (window.__tbFounderPing) return;
  window.__tbFounderPing = true;

  function who() {
    var name = '';
    var email = '';
    var phone = '';
    try {
      var n = document.getElementById('auth-name') || document.getElementById('profile-name');
      if (n && n.value) name = String(n.value).trim();
    } catch (e0) {}
    try {
      var em = document.getElementById('auth-email');
      if (em && em.value) email = String(em.value).trim().toLowerCase();
    } catch (e1) {}
    if (!email) {
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i) || '';
          if (k.indexOf('auth-token') === -1) continue;
          var raw = localStorage.getItem(k) || '';
          var m = raw.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
          if (m) { email = m[0]; break; }
        }
      } catch (e2) {}
    }
    try {
      var p = document.getElementById('auth-phone') || document.getElementById('profile-phone');
      if (p && p.value) phone = String(p.value).trim();
    } catch (e3) {}
    if (!name) {
      try {
        var list = JSON.parse(localStorage.getItem('brothers') || '[]') || [];
        var id = localStorage.getItem('myProfileId');
        var row = list.filter(function (b) { return b && (b.id === id || String(b.email || '').toLowerCase() === email); })[0];
        if (row && row.name) name = row.name;
      } catch (e4) {}
    }
    var g = '';
    var d = document.getElementById('meeting-date');
    if (d) g = String(d.textContent || '').replace(/\s+/g, ' ').trim();
    return { name: name, email: email, phone: phone, gathering: g };
  }

  var last = {};
  function send(kind) {
    var now = Date.now();
    if (last[kind] && now - last[kind] < 8000) return;
    last[kind] = now;
    var w = who();
    w.kind = kind;
    try {
      fetch('/.netlify/functions/founder-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(w)
      }).catch(function () {});
    } catch (e) {}
  }

  window.tbFounderPing = send;

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#rsvp-btn');
    if (t) setTimeout(function () { send('imin'); }, 280);
  }, true);

  var prev = window.stashSeatFromGate;
  window.stashSeatFromGate = function () {
    try { send('seat'); } catch (eS) {}
    if (typeof prev === 'function') return prev.apply(this, arguments);
  };
})();
