(function () {
  if (window.__tbGridDedupe) return;
  window.__tbGridDedupe = true;

  function norm(src) {
    if (!src) return '';
    try {
      var u = String(src).split('?')[0];
      var i = u.lastIndexOf('/');
      return (i >= 0 ? u.slice(i + 1) : u).toLowerCase();
    } catch (e) { return String(src); }
  }

  function dedupe() {
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var seen = {};
    feed.querySelectorAll('.mem-tile, .media-thumb').forEach(function (tile) {
      var img = tile.querySelector('img, video');
      var src = img && (img.getAttribute('src') || img.currentSrc || img.getAttribute('data-tb-src') || '');
      var key = norm(src);
      if (!key) return;
      if (seen[key]) tile.parentNode.removeChild(tile);
      else seen[key] = true;
    });
  }

  dedupe();
  setTimeout(dedupe, 400);
  setTimeout(dedupe, 1400);
  var feed = document.getElementById('media-feed');
  if (feed && window.MutationObserver) {
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () { t = null; dedupe(); }, 80);
    }).observe(feed, { childList: true });
  }
})();
