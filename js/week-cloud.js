(function () {
  if (window.__tbWeekCloud) return;
  window.__tbWeekCloud = true;

  var ID = 'tb-week-line';

  function cfg() { return window.TB_CONFIG || {}; }
  function toast(msg) {
    try { if (window.tbToast) window.tbToast(msg, 1800); } catch (e) {}
  }
  function client() {
    try {
      if (!(window.supabase && window.supabase.createClient)) return null;
      return window.supabase.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_ANON_KEY);
    } catch (e) { return null; }
  }

  function paint(text) {
    if (!text) return;
    var card = document.querySelector('#view-home .next-meeting');
    var el = document.getElementById('tb-week-home');
    if (!el && card && card.parentNode) {
      el = document.createElement('div');
      el.id = 'tb-week-home';
      el.innerHTML = 'THIS WEEK';
      card.parentNode.insertBefore(el, card.nextSibling);
    }
    if (!el) return;
    var t = document.getElementById('tb-week-home-text');
    if (t) t.textContent = text;
    el.classList.add('is-on');
    el.style.display = 'block';
  }

  async function pull() {
    var sb = client();
    if (!sb) return;
    try {
      var res = await sb.from('announcements').select('body').eq('id', ID).maybeSingle();
      if (res && res.data && res.data.body) paint(res.data.body);
    } catch (e) {}
  }

  async function push(text) {
    var sb = client();
    if (!sb) { toast('SIGN IN ON THE CHAIR'); return false; }
    try {
      var res = await sb.from('announcements').upsert({
        id: ID,
        title: 'THIS WEEK',
        body: text,
        sort_order: 99
      }, { onConflict: 'id' });
      if (res && res.error) {
        toast('SIGN IN ON THE CHAIR');
        return false;
      }
      return true;
    } catch (e) {
      toast('SIGN IN ON THE CHAIR');
      return false;
    }
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('#tb-week-go');
    if (!btn) return;
    var ta = document.getElementById('tb-week-text');
    var text = (ta && ta.value ? ta.value : '').trim().slice(0, 180);
    if (!text) return;
    try {
      localStorage.setItem('tb_week_approve', JSON.stringify({ text: text, approved: true }));
    } catch (e0) {}
    paint(text);
    push(text).then(function (ok) {
      if (ok) toast('WEEK LINE LOCKED');
    });
  }, true);

  pull();
  setTimeout(pull, 1200);
})();
