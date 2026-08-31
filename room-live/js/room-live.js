/* 20260831-room-live — one channel on gathering_attendance. Not the brothers/memories stampede. */
(function () {
  if (window.__tbRoomLive) return;
  window.__tbRoomLive = true;

  var ch = null;
  var ticking = false;

  function gid() {
    var d = document.getElementById('meeting-date');
    var raw = String((d && d.textContent) || '').replace(/\s+/g, ' ').trim();
    if (!raw || /calculat/i.test(raw)) {
      var n = new Date();
      raw = n.getFullYear() + '-' + (n.getMonth() + 1);
    }
    return 'g-' + raw.slice(0, 48);
  }

  function seated() {
    try {
      if (document.body.classList.contains('tb-seated')) return true;
      if (localStorage.getItem('tb_seat_locked')) return true;
    } catch (e) {}
    return false;
  }

  function paint(nIn, nHat) {
    var st = document.getElementById('rsvp-status');
    if (st && nIn > 0) {
      var base = String(st.textContent || '').replace(/\s*·\s*\d+\s+IN.*$/i, '').trim();
      st.textContent = (base ? base + ' · ' : '') + nIn + ' IN';
    }
    var hat = document.getElementById('tb-more-raffle');
    if (hat && nHat > 0 && /HAT|DRAW|ENTER/i.test(hat.textContent || '')) {
      if (!hat.dataset.tbHatBase) hat.dataset.tbHatBase = hat.textContent;
      if (/YOU'RE IN THE HAT|YOU WERE IN THE HAT/i.test(hat.textContent)) {
        hat.textContent = hat.dataset.tbHatBase.replace(/HAT.*/, 'HAT · ' + nHat);
      }
    }
  }

  async function count() {
    var sb = window.getSb && window.getSb();
    if (!sb) return;
    try {
      var res = await sb.from('gathering_attendance')
        .select('locked_in,in_hat')
        .eq('gathering_id', gid());
      var rows = (res && res.data) || [];
      var nIn = 0;
      var nHat = 0;
      rows.forEach(function (r) {
        if (r.locked_in) nIn += 1;
        if (r.in_hat) nHat += 1;
      });
      paint(nIn, nHat);
    } catch (e) {}
  }

  function requestCount() {
    if (ticking) return;
    ticking = true;
    setTimeout(function () {
      ticking = false;
      count();
    }, 350);
  }

  async function listen() {
    if (ch) return;
    if (!seated()) return;
    var sb = window.getSb && window.getSb();
    if (!sb || !sb.channel) return;
    try {
      ch = sb.channel('tb-attendance')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gathering_attendance' }, requestCount)
        .subscribe();
      requestCount();
    } catch (e2) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(listen, 800); });
  else setTimeout(listen, 800);
})();
