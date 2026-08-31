/* 20260831-film-still — Home tile uses kitchen current.jpg. No video at boot. */
(function () {
  if (window.__tbFilmStill) return;
  window.__tbFilmStill = true;

  var POSTER = 'assets/current.jpg';

  function paint() {
    var pic = document.querySelector('#tb-month-film .tb-month-film-pic');
    if (pic && (!pic.style.backgroundImage || /bolt|icon-official|logo-bolt/i.test(pic.style.backgroundImage))) {
      pic.style.backgroundImage = "url('" + POSTER + "')";
    }
    document.querySelectorAll('#tb-home-film-tile img, #home-film img').forEach(function (img) {
      if (!img.getAttribute('src') || /bolt|icon-official|logo-bolt|data:image/i.test(img.getAttribute('src') || '')) {
        img.src = POSTER;
        img.style.objectFit = 'cover';
        img.style.padding = '0';
      }
    });
  }

  if (!document.querySelector('link[href*="film-still.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/film-still.css';
    (document.head || document.documentElement).appendChild(l);
  }

  paint();
  setTimeout(paint, 400);
  setTimeout(paint, 1400);
})();
