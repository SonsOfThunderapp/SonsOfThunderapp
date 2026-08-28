(function () {
  function $(id) { return document.getElementById(id); }
  function hit() {
    var detail = $('brother-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    var wrap = $('brother-qr-wrap');
    if (wrap) { wrap.classList.remove('hidden'); wrap.style.display = 'block'; }
    try { if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e0) {}
    try { if (window.tbFeedback && window.tbFeedback.confirm) window.tbFeedback.confirm(); } catch (e1) {}
  }
  function openFields() {
    var name = $('profile-name');
    var bio = $('profile-bio');
    var job = $('profile-skills');
    if (name) name.setAttribute('maxlength', '40');
    if (bio) { bio.setAttribute('maxlength', '240'); bio.setAttribute('placeholder', 'Who you are'); }
    if (job) job.setAttribute('maxlength', '120');
  }
  function lineFor(b) {
    var d = String((b && b.birthday) || '').trim();
    var j = String((b && b.skills) || '').trim();
    if (d && j) return d + ' · ' + j;
    return d || j || '';
  }
  async function paintTiles() {
    var grid = $('brothers-grid');
    if (!grid) return;
    var rows = [];
    try {
      var sb = window.getSb && window.getSb();
      if (sb) {
        var res = await sb.from('brothers').select('name,birthday,skills');
        rows = (res && res.data) || [];
      }
    } catch (e2) {}
    grid.querySelectorAll('.brother-card[data-brother-index]').forEach(function (card) {
      var nameEl = card.querySelector('.brother-name');
      var info = card.querySelector('.brother-info');
      if (!nameEl || !info) return;
      var label = String(nameEl.textContent || '').replace(/TODAY/g, '').trim().toLowerCase();
      var row = null;
      rows.forEach(function (r) {
        if (String(r.name || '').trim().toLowerCase() === label) row = r;
      });
      var text = lineFor(row);
      var meta = card.querySelector('.tb-card-meta');
      if (!text) { if (meta) meta.remove(); return; }
      if (!meta) {
        meta = document.createElement('div');
        meta.className = 'tb-card-meta';
        var bio = card.querySelector('.brother-bio');
        if (bio) info.insertBefore(meta, bio);
        else info.appendChild(meta);
      }
      meta.textContent = text;
    });
  }
  function bind() {
    openFields();
    var detail = $('brother-detail');
    if (detail && detail.dataset.tbInspect !== '1') {
      detail.dataset.tbInspect = '1';
      new MutationObserver(function () {
        if (!detail.classList.contains('hidden')) setTimeout(hit, 80);
      }).observe(detail, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    }
    var grid = $('brothers-grid');
    if (grid && grid.dataset.tbMeta !== '1') {
      grid.dataset.tbMeta = '1';
      new MutationObserver(function () { setTimeout(paintTiles, 60); }).observe(grid, { childList: true, subtree: true });
    }
    paintTiles();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 600);
  setTimeout(paintTiles, 1400);
})();
