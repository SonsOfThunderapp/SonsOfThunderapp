/* 20260827-ann1: announcement delete must stay gone. */
(function () {
  var KEY = 'tb_announcements';
  var TOMB = 'tb_ann_gone';

  function gone() {
    try {
      var g = JSON.parse(localStorage.getItem(TOMB) || '[]');
      return Array.isArray(g) ? g : [];
    } catch (e) { return []; }
  }
  function addGone(id) {
    if (!id) return;
    var g = gone();
    if (g.indexOf(id) < 0) {
      g.push(String(id));
      try { localStorage.setItem(TOMB, JSON.stringify(g)); } catch (e1) {}
    }
  }
  function client() {
    try {
      if (typeof window.getSb === 'function') return window.getSb();
    } catch (e0) {}
    var c = window.TB_CONFIG || {};
    try {
      if (window.supabase && window.supabase.createClient && c.SUPABASE_URL && c.SUPABASE_ANON_KEY) {
        return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
      }
    } catch (e1) {}
    return null;
  }
  function killCloud(id) {
    var sb = client();
    if (!sb || !id) return;
    try { sb.from('announcements').delete().eq('id', id).then(function () {}); } catch (e) {}
  }
  function stripLocal() {
    var g = gone();
    if (!g.length) return false;
    try {
      var list = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(list)) return false;
      var next = list.filter(function (a) { return a && g.indexOf(String(a.id)) < 0; });
      if (next.length !== list.length) {
        localStorage.setItem(KEY, JSON.stringify(next));
        return true;
      }
    } catch (e) {}
    return false;
  }
  function hideDom() {
    var g = gone();
    if (!g.length) return;
    var list = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) {}
    document.querySelectorAll('#admin-ann-list .admin-ann-item').forEach(function (el) {
      var idx = parseInt(el.getAttribute('data-index'), 10);
      var a = list[idx];
      var title = ((el.querySelector('strong') || {}).textContent || '').trim();
      var hit = (a && g.indexOf(String(a.id)) >= 0);
      if (!hit) {
        /* title match against known gone titles stored as id if we only have ids */
      }
      if (hit) el.style.display = 'none';
    });
    document.querySelectorAll('#announcements .announcement-card').forEach(function (el) {
      var label = ((el.querySelector('.announcement-card-title, strong, h3') || el).textContent || '');
      /* hide if card title is not in remaining list */
      var remain = list.map(function (a) { return String(a.title || '').trim(); });
      var t = ((el.querySelector('strong, .announcement-title, h3') || {}).textContent || '').trim();
      if (t && remain.indexOf(t) < 0 && g.length) el.style.display = 'none';
    });
  }
  function apply() {
    stripLocal();
    hideDom();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('.admin-ann-delete');
    if (!btn) return;
    var idx = parseInt(btn.getAttribute('data-index'), 10);
    var id = '';
    try {
      var list = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (list[idx] && list[idx].id) id = String(list[idx].id);
    } catch (e2) {}
    if (id) {
      addGone(id);
      killCloud(id);
    }
    setTimeout(apply, 0);
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
  }, true);

  var n = 0;
  var iv = setInterval(function () {
    apply();
    n += 1;
    if (n > 30) clearInterval(iv);
  }, 400);
})();
