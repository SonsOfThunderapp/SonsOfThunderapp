(function () {
  if (window.__tbTheaterSound) return;
  window.__tbTheaterSound = true;
  function loud() {
    var v = document.getElementById('tb-theater-video');
    if (!v) return;
    v.muted = false;
    v.defaultMuted = false;
    v.volume = 1;
    v.removeAttribute('muted');
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-home-film-tile, #home-film, #tb-month-film, #tb-theater')) loud();
  }, true);
  document.addEventListener('touchend', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-home-film-tile, #home-film, #tb-month-film, #tb-theater')) loud();
  }, true);
})();
