(function () {
  if (window.__tbGridLazy) return;
  window.__tbGridLazy = true;

  function lazy() {
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var tiles = feed.querySelectorAll('.mem-tile img, .media-thumb img');
    tiles.forEach(function (img, i) {
      img.setAttribute('decoding', 'async');
      if (i < 4) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'low');
      } else {
        img.setAttribute('loading', 'lazy');
        if (img.dataset.tbSrc) return;
        var src = img.getAttribute('src');
        if (!src || src.indexOf('data:') === 0) return;
        img.dataset.tbSrc = src;
        img.removeAttribute('src');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
      }
    });
  }

  function reveal() {
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var tiles = feed.querySelectorAll('img[data-tb-src]');
    tiles.forEach(function (img) {
      var r = img.getBoundingClientRect();
      if (r.top < window.innerHeight + 80) {
        img.src = img.dataset.tbSrc;
        img.removeAttribute('data-tb-src');
      }
    });
  }

  lazy();
  setTimeout(lazy, 400);
  var ev = document.getElementById('view-events');
  if (ev && window.MutationObserver) {
    new MutationObserver(function () {
      if (ev.classList.contains('active')) { lazy(); reveal(); }
    }).observe(ev, { attributes: true, attributeFilter: ['class'] });
  }
  var feed = document.getElementById('media-feed');
  if (feed) {
    feed.addEventListener('scroll', reveal, { passive: true });
    document.addEventListener('scroll', reveal, { passive: true });
  }
})();
