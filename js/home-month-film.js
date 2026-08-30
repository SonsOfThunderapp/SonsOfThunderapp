/* Home month film. Tile under .next-meeting.card. Player is ThunderTheater only. */
(function () {
  if (window.__tbHomeMonthFilm) return;
  window.__tbHomeMonthFilm = 1;

  var row = { url: '', poster: '', title: '' };

  function cfg() { return window.TB_CONFIG || {}; }
  function bucket() { return (cfg().THEATER_BUCKET || 'thunder-theater').trim(); }
  function sb() {
    if (typeof window.getSb === 'function') {
      try {
        var main = window.getSb();
        if (main) return main;
      } catch (e0) {}
    }
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
    if (!window.__tbTheaterSb) {
      window.__tbTheaterSb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: window.__tbAuthStorage || undefined
        }
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
    if (!path) return '';
    var c = cfg();
    var base = String(c.SUPABASE_URL || '').replace(/\/$/, '');
    if (!base) return '';
    var u = base + '/storage/v1/object/public/' + encodeURI(bucket()) + '/' + String(path).replace(/^\//, '');
    if (bust) u += (u.indexOf('?') >= 0 ? '&' : '?') + 't=' + encodeURIComponent(bust);
    return u;
  }

  async function pullRow() {
    var vPath = 'theater/current.mp4';
    var pPath = 'theater/current.jpg';
    var bust = '';
    var title = '';
    var has = false;
    var client = sb();
    if (client) {
      try {
        var q = await client.from('theater_current').select('url,poster,title,video_path,poster_path,updated_at').eq('id', 'current').maybeSingle();
        if (!q.error && q.data) {
          vPath = q.data.video_path || vPath;
          pPath = q.data.poster_path || pPath;
          bust = q.data.updated_at || '';
          title = q.data.title || '';
          has = !!(String(q.data.url || '').trim() || String(title || '').trim());
        }
      } catch (e1) {}
    }
    if (!has && !client) {
      try {
        var c = cfg();
        if (c.SUPABASE_URL && c.SUPABASE_ANON_KEY) {
          var res = await fetch(c.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/theater_current?id=eq.current&select=url,poster,title,video_path,poster_path,updated_at', {
            headers: { apikey: c.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + c.SUPABASE_ANON_KEY }
          });
          var arr = res.ok ? await res.json() : [];
          var d = arr && arr[0];
          if (d) {
            vPath = d.video_path || vPath;
            pPath = d.poster_path || pPath;
            bust = d.updated_at || '';
            title = d.title || '';
            has = !!(String(d.url || '').trim() || String(title || '').trim());
          }
        }
      } catch (e2) {}
    }
    if (!has) { row = { url: '', poster: '', title: '' }; return; }
    row = {
      url: publicUrl(vPath, bust),
      poster: publicUrl(pPath, bust),
      title: title
    };
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
    if (tile.dataset.tbFilmArm === '1') return;
    tile.dataset.tbFilmArm = '1';
    loadTheater(function () {
      if (window.ThunderTheater && window.ThunderTheater.ensure) {
        try { window.ThunderTheater.ensure(); } catch (eE) {}
      }
    });
    tile.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      function go() {
        if (!window.ThunderTheater) return;
        try { window.ThunderTheater.open(film()); } catch (eO) {}
      }
      if (window.ThunderTheater) go();
      else loadTheater(go);
    });
  }

  window.tbRefreshMonthFilm = function () { boot(); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
