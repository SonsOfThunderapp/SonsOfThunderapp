/* Home month film. Tile under .next-meeting.card. Player is ThunderTheater only. */
(function () {
  if (window.__tbHomeMonthFilm) return;
  window.__tbHomeMonthFilm = 1;

  var POSTER = "assets/tour-memories/sot-night-patio.svg";
  var SRC = "assets/home-month/this-month.mp4";
  window.__tbMonthLastPoster = window.__tbMonthLastPoster || POSTER;

  function film() {
    return {
      src: SRC,
      poster: window.__tbMonthLastPoster || POSTER,
      title: "THIS MONTH"
    };
  }

  function loadTheater(cb) {
    if (window.ThunderTheater) { cb(); return; }
    var b = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || "1";
    if (!document.querySelector('link[href*="tb-theater.css"]')) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "css/tb-theater.css?v=" + encodeURIComponent(b);
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
    var s = document.createElement("script");
    s.src = "js/tb-theater.js?v=" + encodeURIComponent(b);
    s.onload = cb;
    s.onerror = cb;
    (document.body || document.documentElement).appendChild(s);
  }

  function boot() {
    var home = document.getElementById("view-home");
    var card = home && home.querySelector(".next-meeting.card");
    if (!card) return;
    var tile = document.getElementById("tb-month-film");
    if (!tile) {
      tile = document.createElement("button");
      tile.id = "tb-month-film";
      tile.type = "button";
      tile.className = "tb-month-film";
      tile.setAttribute("aria-label", "This month");
      tile.innerHTML =
        '<span class="tb-month-film-pic" style="background-image:url(\'' + POSTER + '\')"></span>' +
        '<span class="tb-month-film-ring" aria-hidden="true"></span>' +
        '<span class="tb-month-film-label">THIS MONTH</span>';
      card.insertAdjacentElement("afterend", tile);
    }
    loadTheater(function () {
      if (window.ThunderTheater) {
        window.ThunderTheater.ensure();
        window.ThunderTheater.bindTile(tile, film);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
