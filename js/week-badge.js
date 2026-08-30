(function () {
  if (window.__tbWeekBadge) return;
  window.__tbWeekBadge = true;

  function easternNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }
  function isoWeek() {
    var d = easternNow();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    var w1 = new Date(d.getFullYear(), 0, 4);
    return d.getFullYear() + '-W' + String(1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)).padStart(2, '0');
  }
  function isChair() {
    var tools = document.getElementById('leader-tools');
    return !!(tools && !tools.classList.contains('hidden'));
  }
  function due() {
    var d = easternNow();
    return d.getDay() === 1 && d.getHours() >= 9;
  }
  function setBadge(n) {
    try {
      if (n) { if (navigator.setAppBadge) navigator.setAppBadge(n); }
      else { if (navigator.clearAppBadge) navigator.clearAppBadge(); }
    } catch (e) {}
  }

  function ping() {
    if (!isChair() || !due()) { setBadge(0); return; }
    var key = 'tb_week_badge_' + isoWeek();
    setBadge(1);
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    try { if (window.tbToast) window.tbToast('SEND THE WEEKLY LINE — TEXT THE CLUB', 3200); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#text-club-btn, #admin-text-club, #tb-week-nudge')) {
      setBadge(0);
    }
  }, true);

  setTimeout(ping, 900);
})();
