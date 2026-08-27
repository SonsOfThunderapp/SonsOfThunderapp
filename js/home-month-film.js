/* Home month film. Tile under .next-meeting.card. Player is ThunderTheater only. */
(function () {
  if (window.__tbHomeMonthFilm) return;
  window.__tbHomeMonthFilm = 1;

  var BLACK = '';
  var row = { url: '', poster: '', title: '' };

  function cfg() { return window.TB_CONFIG || {}; }
  function bucket() { return (cfg().THEATER_BUCKET || 'thunder-theater').trim(); }
  function sb() {
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
    if (!window.__tbTheaterSb) {
      window.__tbTheaterSb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, detectSessionInUrl: false }
      });
    }
    return window.__tbTheaterSb;
  }

  function film() {
    return {
      src: row.url || '',
      poster: row.poster || '',
      title: row.title || 'THIS MONTH'
    };
  }

  function paintTile() {
    var tile = document.getElementById('tb-month-film');
    if (!tile) return;
    var pic = tile.querySelector('.tb-month-film-pic');
    if (pic) {
      if (row.poster) pic.style.backgroundImage = "url('" + String(row.poster).replace(/'/g, "\\'") + "')";
      else pic.style.backgroundImage = 'none';
    }
    var t = String(row.title || '').trim();
    var cap = document.getElementById('tb-month-film-title');
    if (t && t.toUpperCase() !== 'THIS MONTH') {
      if (!cap) {
        cap = document.createElement('p');
        cap.id = 'tb-month-film-title';
        var putBtn = document.getElementById('tb-month-home-put');
        if (putBtn && putBtn.parentNode === tile.parentNode) tile.parentNode.insertBefore(cap, putBtn);
        else tile.insertAdjacentElement('afterend', cap);
      }
      cap.textContent = t;
      cap.hidden = false;
      tile.classList.add('is-titled');
    } else if (cap) {
      cap.textContent = '';
      cap.hidden = true;
      tile.classList.remove('is-titled');
    }
  }

  function publicUrl(path, bust) {
    var client = sb();
    if (!client || !path) return '';
    try {
      var out = client.storage.from(bucket()).getPublicUrl(path);
      var u = (out && out.data && out.data.publicUrl) || '';
      if (u && bust) u += (u.indexOf('?') >= 0 ? '&' : '?') + 't=' + encodeURIComponent(bust);
      return u;
    } catch (e) {
      return '';
    }
  }
  async function signed(path) {
    var client = sb();
    if (!client || !path) return '';
    try {
      var out = await client.storage.from(bucket()).createSignedUrl(path, 604800);
      return (out && out.data && out.data.signedUrl) || '';
    } catch (e) {
      return '';
    }
  }

  async function pullRow() {
    var client = sb();
    if (!client) { row = { url: '', poster: '', title: '' }; return; }
    try {
      var q = await client.from('theater_current').select('url,poster,title,video_path,poster_path,updated_at').eq('id', 'current').maybeSingle();
      if (q.error || !q.data) { row = { url: '', poster: '', title: '' }; return; }
      var d = q.data;
      var vPath = d.video_path || 'theater/current.mp4';
      var pPath = d.poster_path || 'theater/current.jpg';
      var bust = d.updated_at || '';
      var url = '';
      var poster = '';
      if (String(d.url || '').trim() || String(d.title || '').trim()) {
        url = publicUrl(vPath, bust) || (await signed(vPath)) || d.url || '';
        poster = publicUrl(pPath, bust) || (await signed(pPath)) || d.poster || '';
      }
      row = { url: url, poster: poster, title: d.title || '' };
    } catch (e1) {
      row = { url: '', poster: '', title: '' };
    }
  }

  function loadTheater(cb) {
    if (window.ThunderTheater) { cb(); return; }
    var b = cfg().APP_BUILD || '1';
    if (!document.querySelector('link[href*="tb-theater.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/tb-theater.css?v=' + encodeURIComponent(b);
      (document.head || document.documentElement).appendChild(l);
    }
    if (document.querySelector('script[src*="tb-theater.js"]')) {
      var n = 0;
      var t = setInterval(function () {
        n += 1;
        if (window.ThunderTheater || n > 40) { clearInterval(t); cb(); }
      }, 50);
      return;
    }
    var s = document.createElement('script');
    s.src = 'js/tb-theater.js?v=' + encodeURIComponent(b);
    s.onload = cb;
    s.onerror = cb;
    (document.body || document.documentElement).appendChild(s);
  }

  function ensureTile() {
    var home = document.getElementById('view-home');
    var card = home && home.querySelector('.next-meeting.card');
    if (!card) return null;
    var tile = document.getElementById('tb-month-film');
    if (!tile) {
      tile = document.createElement('button');
      tile.id = 'tb-month-film';
      tile.type = 'button';
      tile.className = 'tb-month-film';
      tile.setAttribute('aria-label', 'This month');
      tile.innerHTML =
        '<span class="tb-month-film-pic"></span>' +
        '<span class="tb-month-film-ring" aria-hidden="true"></span>' +
        '<span class="tb-month-film-label">THIS MONTH</span>';
      card.insertAdjacentElement('afterend', tile);
    }
    return tile;
  }

  async function boot() {
    var tile = ensureTile();
    if (!tile) return;
    await pullRow();
    paintTile();
    loadTheater(function () {
      if (window.ThunderTheater) {
        window.ThunderTheater.ensure();
        window.ThunderTheater.bindTile(tile, film);
      }
    });
  }

  window.tbRefreshMonthFilm = function () { boot(); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
