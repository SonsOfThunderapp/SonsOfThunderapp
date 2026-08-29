(function () {
  if (window.__tbCardChips) return;
  window.__tbCardChips = true;
  function list() {
    try {
      var raw = localStorage.getItem('tb_brothers');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function stamp() {
    var brothers = list();
    document.querySelectorAll('.brother-card[data-brother-index]').forEach(function (card) {
      if (card.querySelector('.tb-card-chips')) return;
      var i = parseInt(card.getAttribute('data-brother-index'), 10);
      var b = brothers[i] || {};
      var job = String(b.occupation || b.job || b.work || '').trim();
      var day = String(b.birthday || b.bday || b.dob || '').trim();
      if (!job && !day) return;
      var row = document.createElement('div');
      row.className = 'tb-card-chips';
      if (job) {
        var a = document.createElement('span');
        a.className = 'tb-chip';
        a.textContent = job;
        row.appendChild(a);
      }
      if (day) {
        var c = document.createElement('span');
        c.className = 'tb-chip';
        c.textContent = day;
        row.appendChild(c);
      }
      var info = card.querySelector('.brother-info') || card;
      info.appendChild(row);
    });
  }
  setTimeout(stamp, 400);
  setTimeout(stamp, 1400);
  var grid = document.getElementById('brothers-grid');
  if (grid) new MutationObserver(function () { setTimeout(stamp, 40); }).observe(grid, { childList: true });
})();
