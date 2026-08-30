(function () {
  if (window.__tbSoundWin) return;
  window.__tbSoundWin = true;
  function v() { return document.getElementById('tb-theater-video');
  }
  function loud() {
    var el = v();
    if (!el) return;
    el.muted = false;
    el.defaultMuted = false;
    el.volume = 1;
    el.removeAttribute('muted');
    el.loop = false;
  }
  function play() {
    loud();
    var el = v();
    if (!el) return;
    var p = el.play();
    if (p && p.catch) p.catch(function () { loud(); el.play().catch(function () {}); });
  }
  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#tb-home-film-tile, #home-film, #tb-theater')) {
      setTimeout(play, 0);
      setTimeout(play, 80);
    }
  }, true);
  function bind() {
    var el = v();
    if (!el || el.dataset.tbSoundWin === '1') return;
    el.dataset.tbSoundWin = '1';
    el.addEventListener('play', loud);
    el.addEventListener('playing', loud);
    el.addEventListener('volumechange', function () {
      if (el.muted) loud();
    });
  }
  bind();
  setTimeout(bind, 400);
})();
