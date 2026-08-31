/* 20260831-plate-src — Home poster/player use Storage, not Netlify HTML. No video fetch at boot. */
(function () {
  if (window.__tbPlateSrc) return;
  window.__tbPlateSrc = true;

  function urls() {
    var c = window.TB_CONFIG || {};
    var base = String(c.SUPABASE_URL || '').replace(/\/$/, '');
    var bucket = String(c.THEATER_BUCKET || 'thunder-theater').trim();
    if (!base) {
      base = 'https://mnsempcgomukcpofgvlm.supabase.co';
    }
    var root = base + '/storage/v1/object/public/' + encodeURI(bucket) + '/theater/';
    return { src: root + 'current.mp4', poster: root + 'current.jpg' };
  }

  function paintPoster() {
    var u = urls();
    window.__tbPlate = u;
    ['home-film', 'tb-month-film', 'tb-home-film-tile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var img = el.querySelector('img');
      if (img && img.src.indexOf('current.jpg') !== -1 && img.src.indexOf('/storage/') === -1) {
        img.src = u.poster;
      }
      var pic = el.querySelector('.tb-month-film-pic');
      if (pic) pic.style.backgroundImage = 'url("' + u.poster + '")';
    });
    document.querySelectorAll('img[src*="assets/current.jpg"]').forEach(function (img) {
      img.src = u.poster;
    });
  }

  function bind() {
    var u = urls();
    if (window.ThunderTheater && typeof window.ThunderTheater.bindTile === 'function') {
      var tile = document.getElementById('home-film') || document.getElementById('tb-month-film');
      if (tile) {
        try {
          window.ThunderTheater.bindTile(tile, {
            src: u.src,
            poster: u.poster,
            title: 'THIS MONTH'
          });
        } catch (e) {}
      }
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#home-film, #tb-month-film, #tb-home-film-tile');
    if (!t) return;
    var u = urls();
    if (window.ThunderTheater && typeof window.ThunderTheater.open === 'function') {
      try {
        window.ThunderTheater.open({ src: u.src, poster: u.poster, title: 'THIS MONTH' });
      } catch (e2) {}
    }
  }, true);

  paintPoster();
  setTimeout(paintPoster, 400);
  setTimeout(bind, 800);
  if (!document.querySelector('script[src*="film-still.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/film-still.js';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
})();
