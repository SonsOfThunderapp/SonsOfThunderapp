/* 20260831-attendance — I’m In + raffle hat = one gathering row. Local still works if table missing. */
(function () {
  if (window.__tbAttendance) return;
  window.__tbAttendance = true;

  function gid() {
    var d = document.getElementById('meeting-date');
    var raw = String((d && d.textContent) || '').replace(/\s+/g, ' ').trim();
    if (!raw || /calculat/i.test(raw)) {
      var n = new Date();
      raw = n.getFullYear() + '-' + (n.getMonth() + 1);
    }
    return 'g-' + raw.slice(0, 48);
  }

  async function userId() {
    var sb = window.getSb && window.getSb();
    if (!sb || !sb.auth) return null;
    try {
      var s = await sb.auth.getSession();
      return (s && s.data && s.data.session && s.data.session.user && s.data.session.user.id) || null;
    } catch (e) {
      return null;
    }
  }

  async function upsert(patch) {
    var sb = window.getSb && window.getSb();
    var uid = await userId();
    if (!sb || !uid) return false;
    var row = {
      gathering_id: gid(),
      user_id: uid,
      locked_in: !!patch.locked_in,
      in_hat: !!patch.in_hat,
      ping: !!patch.ping,
      updated_at: new Date().toISOString()
    };
    if (patch.locked_in === undefined) delete row.locked_in;
    if (patch.in_hat === undefined) delete row.in_hat;
    if (patch.ping === undefined) delete row.ping;
    try {
      var res = await sb.from('gathering_attendance').upsert(row, { onConflict: 'gathering_id,user_id' });
      if (res && res.error) return false;
      return true;
    } catch (e2) {
      return false;
    }
  }

  window.tbAttendance = {
    lock: function () { return upsert({ locked_in: true }); },
    hat: function () { return upsert({ locked_in: true, in_hat: true }); },
    ping: function () { return upsert({ ping: true }); }
  };

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#rsvp-btn');
    if (t) setTimeout(function () { window.tbAttendance.lock(); }, 200);
  }, true);

  var prevMark = null;
  function hookRaffle() {
    var btn = document.getElementById('tb-more-raffle');
    if (!btn || btn.dataset.tbAtt === '1') return;
    btn.dataset.tbAtt = '1';
    btn.addEventListener('click', function () {
      setTimeout(function () { window.tbAttendance.hat(); }, 200);
    });
  }
  hookRaffle();
  setTimeout(hookRaffle, 800);

  var ping = document.getElementById('tb-home-ping');
  if (ping && !ping.dataset.tbAtt) {
    ping.dataset.tbAtt = '1';
    ping.addEventListener('click', function () {
      setTimeout(function () { window.tbAttendance.ping(); }, 200);
    });
  }
})();
