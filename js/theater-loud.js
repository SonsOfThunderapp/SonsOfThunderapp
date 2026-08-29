(function () {
  if (window.__tbTheaterLoud) return;
  window.__tbTheaterLoud = true;

  function vid() { return document.getElementById('tb-theater-video'); }

  function loud() {
    var v = vid();
    if (!v) return;
    v.loop = false;
    v.muted = false;
    v.defaultMuted = false;
    v.volume = 1;
    v.removeAttribute('muted');
    v.removeAttribute('loop');
  }

  function playLoud() {
    var v = vid();
    if (!v) return;
    loud();
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-home-film-tile, #home-film, #tb-month-film, #tb-theater')) {
      setTimeout(playLoud, 0);
      setTimeout(playLoud, 120);
    }
  }, true);

  document.addEventListener('touchend', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-home-film-tile, #home-film, #tb-month-film, #tb-theater')) {
      setTimeout(playLoud, 0);
    }
  }, true);

  function watch() {
    var v = vid();
    if (!v || v.dataset.tbLoud === '1') return;
    v.dataset.tbLoud = '1';
    v.loop = false;
    v.addEventListener('play', loud);
    v.addEventListener('playing', loud);
    v.addEventListener('ended', function () {
      v.pause();
      v.loop = false;
    });
  }

  watch();
  setTimeout(watch, 400);
  setTimeout(watch, 1400);
  var box = document.getElementById('tb-theater');
  if (box && window.MutationObserver) {
    new MutationObserver(watch).observe(box, { attributes: true, childList: true, subtree: true });
  }
})();
