/* First sign-in Axum cup. Issues once. Live app.js already redeems two-tap. */
(function () {
  var KEY = 'tb_axumCoffee';
  var ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function write(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e0) {}
    return c;
  }
  function mintName() {
    try {
      var u = window.currentUser && window.currentUser();
      var n = (u && (u.name || u.email)) || '';
      n = String(n).split('@')[0].trim();
      return n;
    } catch (e1) { return ''; }
  }
  function mintCode() {
    var s = '';
    for (var i = 0; i < 4; i++) s += ABC.charAt(Math.floor(Math.random() * ABC.length));
    var n = mintName();
    var initial = n ? n.charAt(0).toUpperCase() : 'T';
    return initial + '-' + s;
  }
  function user() {
    try { return (window.currentUser && window.currentUser()) || null; } catch (e2) { return null; }
  }

  function paintChip(c) {
    var chip = document.getElementById('axum-chip');
    if (!chip) return;
    if (c && c.code && !c.redeemedAt) {
      chip.classList.remove('hidden');
      chip.textContent = 'FREE AXUM COFFEE';
    } else {
      chip.classList.add('hidden');
    }
  }

  function openDrop(c) {
    var drop = document.getElementById('axum-drop');
    if (!drop || !c || !c.code || c.redeemedAt) return;
    drop.classList.remove('hidden');
    document.body.classList.add('tb-axum-open');
  }

  async function persistCloud(c) {
    try {
      var sb = window.getSb && window.getSb();
      var u = user();
      if (!sb || !u || !u.id) return;
      await sb.from('axum_coffee').insert({
        user_id: u.id,
        code: c.code,
        name: c.name || ''
      });
    } catch (e3) {}
  }

  async function pullCloud() {
    try {
      var sb = window.getSb && window.getSb();
      var u = user();
      if (!sb || !u || !u.id) return null;
      var res = await sb.from('axum_coffee').select('code,name,issued_at,redeemed_at').eq('user_id', u.id).maybeSingle();
      if (!res || !res.data) return null;
      return {
        code: res.data.code,
        name: res.data.name || '',
        userId: u.id,
        issuedAt: res.data.issued_at ? Date.parse(res.data.issued_at) : Date.now(),
        redeemedAt: res.data.redeemed_at ? Date.parse(res.data.redeemed_at) : null,
        shownDrop: true
      };
    } catch (e4) { return null; }
  }

  async function ensure() {
    var u = user();
    if (!u || !u.id) {
      paintChip(read());
      return;
    }
    var c = read();
    if (!c || !c.code) {
      var cloud = await pullCloud();
      if (cloud && cloud.code) {
        c = write(cloud);
      } else {
        c = write({
          code: mintCode(),
          name: mintName(),
          userId: u.id,
          issuedAt: Date.now(),
          redeemedAt: null,
          shownDrop: false
        });
        persistCloud(c);
      }
    }
    paintChip(c);
    if (c && c.code && !c.redeemedAt && !c.shownDrop) {
      c.shownDrop = true;
      write(c);
      openDrop(c);
    }
    try {
      if (typeof window.maybeShowAxumCoffee === 'function') window.maybeShowAxumCoffee();
    } catch (e5) {}
  }

  function bindHold() {
    var btn = document.getElementById('axum-redeem-btn');
    var card = document.getElementById('axum-card');
    if (!btn || btn.dataset.tbLoot === '1') return;
    btn.dataset.tbLoot = '1';
    var holdT = 0;
    function arm(on) {
      btn.classList.toggle('is-charging', !!on);
    }
    function cancel() {
      if (holdT) clearTimeout(holdT);
      holdT = 0;
      arm(false);
    }
    function finish() {
      holdT = 0;
      arm(false);
      if (card) card.classList.add('is-used');
      var c = read();
      if (c && !c.redeemedAt) {
        c.redeemedAt = Date.now();
        write(c);
      }
      paintChip(read());
      try { if (window.tbFeedback && window.tbFeedback.confirm) window.tbFeedback.confirm(); } catch (eH) {}
    }
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      arm(true);
      holdT = setTimeout(finish, 700);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      btn.addEventListener(ev, cancel);
    });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  function boot() {
    bindHold();
    ensure();
    setTimeout(ensure, 800);
    try {
      var sb = window.getSb && window.getSb();
      if (sb && sb.auth && sb.auth.onAuthStateChange) {
        sb.auth.onAuthStateChange(function (ev) {
          if (ev === 'SIGNED_IN') setTimeout(ensure, 200);
        });
      }
    } catch (e6) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
