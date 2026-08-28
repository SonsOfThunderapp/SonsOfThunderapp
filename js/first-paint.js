(function () {
  if (window.__tbFirstPaint) return;
  window.__tbFirstPaint = 1;

  function oneLogo() {
    var header = document.getElementById('main-header');
    if (!header) return;
    header.querySelectorAll('.logo-bolt-life').forEach(function (img) {
      img.removeAttribute('src');
      img.removeAttribute('srcset');
    });
  }

  function tourOpen() {
    try { return document.body.classList.contains('tb-tour-open'); } catch (e0) { return false; }
  }

  function idleTour() {
    var tour = document.getElementById('tb-tour');
    if (!tour || tourOpen()) return;
    tour.querySelectorAll('img[src]').forEach(function (img) {
      if (!img.getAttribute('data-tb-src')) img.setAttribute('data-tb-src', img.getAttribute('src'));
      img.removeAttribute('src');
      img.removeAttribute('srcset');
    });
  }

  function posterOnly() {
    document.querySelectorAll('#tb-month-film video, #home-film video, video.tb-month-video, #install-gif').forEach(function (v) {
      v.setAttribute('preload', 'none');
      v.preload = 'none';
      v.removeAttribute('autoplay');
    });
    document.querySelectorAll('link[rel="preload"][as="image"]').forEach(function (l) {
      var href = l.getAttribute('href') || '';
      if (href.indexOf('logo@2x') !== -1 || href.indexOf('thunder-cool-fab@2x') !== -1) l.remove();
    });
  }

  function wakeTour() {
    var tour = document.getElementById('tb-tour');
    if (!tour || !tourOpen()) return;
    tour.querySelectorAll('img[data-tb-src]').forEach(function (img) {
      if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-tb-src'));
    });
  }

  function punchSplash() {
    var s = document.getElementById('splash');
    if (!s) return;
    s.classList.add('hidden', 'splash-done', 'splash-out');
    s.style.setProperty('display', 'none', 'important');
    s.style.setProperty('pointer-events', 'none', 'important');
    s.setAttribute('aria-hidden', 'true');
  }

  function tick() {
    oneLogo();
    idleTour();
    posterOnly();
    punchSplash();
    wakeTour();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  setTimeout(tick, 0);
  setTimeout(tick, 400);
  setTimeout(tick, 1600);
})();
