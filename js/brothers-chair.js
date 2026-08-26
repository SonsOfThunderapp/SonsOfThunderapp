/* Brothers SIGN IN, own-card edit, chair tools on More. No second CMS. */
(function () {
  var CHAIR = 'obietv@gmail.com';
  var STYLE = 'tb-brothers-chair-style';

  function $(id) { return document.getElementById(id); }

  function signedIn() {
    try { if (typeof window.isSignedIn === 'function') return !!window.isSignedIn(); } catch (e) {}
    var bar = $('auth-session-bar');
    return !!(bar && !bar.classList.contains('hidden'));
  }

  function myId() {
    try { return localStorage.getItem('myProfileId') || localStorage.getItem('tb_myProfileId') || ''; } catch (e) { return ''; }
  }

  function brothers() {
    try {
      var raw = localStorage.getItem('brothers') || localStorage.getItem('tb_brothers');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function isOwnCard(card) {
    if (!card) return false;
    var idx = parseInt(card.getAttribute('data-brother-index'), 10);
    var list = brothers();
    var b = list[idx];
    if (!b) return false;
    var id = myId();
    if (id && b.id && String(b.id) === String(id)) return true;
    var name = String(b.name || '').trim().toLowerCase();
    try {
      var who = $('auth-who');
      var w = who ? String(who.textContent || '').trim().toLowerCase() : '';
      if (w && name && (name === w || name.indexOf(w) === 0 || w.indexOf(name) === 0)) return true;
    } catch (e) {}
    return !!(name && (name === 'obie' || name === 'obie diaz') && signedIn());
  }

  function ensureStyle() {
    if ($(STYLE)) return;
    var s = document.createElement('style');
    s.id = STYLE;
    s.textContent =
      '#view-brothers #auth-entry-btn:not([hidden]):not(.hidden){display:flex!important;visibility:visible!important;pointer-events:auto!important;}' +
      '#view-brothers #edit-profile-btn:not(.hidden){display:inline-flex!important;}' +
      'body.tb-chair #view-about .admin-zone{display:block!important;visibility:visible!important;pointer-events:auto!important;}' +
      'body.tb-chair #leader-tools{display:block!important;visibility:visible!important;pointer-events:auto!important;}' +
      'body.tb-chair #leader-unlock-btn{display:none!important;}' +
      '#tb-chair-more{margin:12px 0 18px;padding:12px 0 4px;}' +
      '#tb-chair-more .tb-chair-label{color:#FEF105;letter-spacing:.14em;font-size:12px;margin:0 0 8px;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function showBrothersSignIn() {
    var entry = $('auth-entry-btn');
    if (!entry) return;
    if (signedIn()) {
      entry.classList.add('hidden');
      entry.setAttribute('hidden', 'hidden');
      var edit = $('edit-profile-btn');
      if (edit) edit.classList.remove('hidden');
      return;
    }
    entry.classList.remove('hidden');
    entry.removeAttribute('hidden');
    entry.setAttribute('aria-hidden', 'false');
    entry.style.setProperty('display', 'flex', 'important');
  }

  function openOwnEdit(ev) {
    var card = ev.target && ev.target.closest && ev.target.closest('.brother-card[data-brother-index]');
    if (!card) return;
    if (!isOwnCard(card)) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    try {
      if (typeof window.startMemberSignIn === 'function') window.startMemberSignIn();
      else {
        var edit = $('edit-profile-btn');
        if (edit) edit.click();
      }
    } catch (e) {}
  }

  function showChairTools() {
    document.body.classList.add('tb-chair');
    var zone = document.querySelector('#view-about .admin-zone');
    var tools = $('leader-tools');
    var wrap = document.querySelector('#view-about .container');
    if (zone) {
      zone.classList.remove('hidden');
      zone.hidden = false;
    }
    if (tools) {
      tools.classList.remove('hidden');
      tools.hidden = false;
      tools.setAttribute('aria-hidden', 'false');
    }
    if (wrap && zone && wrap.firstElementChild !== zone) {
      var host = $('tb-chair-more');
      if (!host) {
        host = document.createElement('div');
        host.id = 'tb-chair-more';
        var lab = document.createElement('div');
        lab.className = 'tb-chair-label';
        lab.textContent = 'THE BOARD';
        host.appendChild(lab);
        wrap.insertBefore(host, wrap.firstChild);
      }
      if (zone.parentNode !== host) host.appendChild(zone);
    }
    var unlock = $('leader-unlock-btn');
    if (unlock) {
      unlock.hidden = true;
      unlock.style.display = 'none';
    }
  }

  function hideChairTools() {
    document.body.classList.remove('tb-chair');
  }

  function sessionEmail(cb) {
    try {
      var c = window.TB_CONFIG || {};
      if (!window.supabase || !window.supabase.createClient || !c.SUPABASE_URL) { cb(''); return; }
      var sb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false }
      });
      sb.auth.getSession().then(function (res) {
        var em = '';
        try { em = String(res.data.session.user.email || '').trim().toLowerCase(); } catch (e) {}
        cb(em);
      }).catch(function () { cb(''); });
    } catch (e2) { cb(''); }
  }

  function apply() {
    ensureStyle();
    showBrothersSignIn();
    sessionEmail(function (em) {
      if (em === CHAIR) showChairTools();
      else hideChairTools();
    });
  }

  function boot() {
    ensureStyle();
    document.addEventListener('click', openOwnEdit, true);
    apply();
    setInterval(apply, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
