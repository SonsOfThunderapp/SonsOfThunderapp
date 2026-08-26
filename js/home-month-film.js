/* Home month film. Inserts under .next-meeting.card. Never restyles I'M IN. Never leaves the board. */
(function () {
  if (window.__tbHomeMonthFilm) return;
  window.__tbHomeMonthFilm = 1;

  var POSTER = "assets/tour-memories/sot-night-patio.svg";
  var SRC = "assets/home-month/this-month.mp4";

  function boot() {
    var home = document.getElementById("view-home");
    var card = home && home.querySelector(".next-meeting.card");
    if (!card || document.getElementById("tb-month-film")) return;
    var tile = document.createElement("button");
    tile.id = "tb-month-film";
    tile.type = "button";
    tile.className = "tb-month-film";
    tile.setAttribute("aria-label", "This month");
    tile.innerHTML =
      '<span class="tb-month-film-pic" style="background-image:url(\'' + POSTER + '\')"></span>' +
      '<span class="tb-month-film-ring" aria-hidden="true"></span>' +
      '<span class="tb-month-film-label">THIS MONTH</span>';
    card.insertAdjacentElement("afterend", tile);
    tile.addEventListener("click", openPlayer);
  }

  var overlay = null;
  var video = null;
  var startY = 0;

  function openPlayer(ev) {
    if (ev) ev.preventDefault();
    if (overlay) {
      play();
      return;
    }
    overlay = document.createElement("div");
    overlay.id = "tb-month-player";
    overlay.innerHTML =
      '<button type="button" class="tb-month-x" aria-label="Close">\u00d7</button><video playsinline webkit-playsinline></video>';
    document.body.appendChild(overlay);
    video = overlay.querySelector("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
    video.poster = POSTER;
    video.src = SRC;
    video.addEventListener("error", function () {
      try { video.removeAttribute("src"); video.load(); } catch (e1) {}
      overlay.style.background = "#000 url(" + POSTER + ") center/cover no-repeat";
    });
    overlay.querySelector(".tb-month-x").addEventListener("click", function (e2) {
      e2.stopPropagation();
      closePlayer();
    });
    overlay.addEventListener("touchstart", onStart, { passive: false });
    overlay.addEventListener("touchmove", onMove, { passive: false });
    overlay.addEventListener("touchend", onEnd, { passive: false });
    document.body.classList.add("tb-month-lock");
    play();
  }

  function play() {
    if (!video) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }

  function closePlayer() {
    if (video) {
      try { video.pause(); } catch (e3) {}
    }
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    video = null;
    document.body.classList.remove("tb-month-lock");
  }

  function onStart(ev) {
    if (!ev.touches || !ev.touches[0]) return;
    startY = ev.touches[0].clientY;
    if (ev.cancelable) ev.preventDefault();
  }
  function onMove(ev) {
    if (ev.cancelable) ev.preventDefault();
  }
  function onEnd(ev) {
    var y = ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0].clientY : startY;
    if (y - startY > 160) closePlayer();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
