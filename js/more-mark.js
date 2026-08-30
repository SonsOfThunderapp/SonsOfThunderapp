/* 20260830-more-mark
   If More lost its mark, put the official bolt back.
   Does not un-hide #main-header. Does not touch app.js. */
(function () {
  if (window.__tbMoreMark) return;
  window.__tbMoreMark = true;

  function place() {
    var box = document.querySelector('#view-about .about-container');
    if (!box) return;
    if (document.getElementById('about-more-mark')) return;
    var img = document.createElement('img');
    img.id = 'about-more-mark';
    img.className = 'about-logo about-more-mark';
    img.src = '/assets/icon-official-180.png';
    img.alt = 'Sons of Thunder';
    img.width = 52;
    img.height = 52;
    img.decoding = 'async';
    var title = document.getElementById('who-we-are-title');
    if (title && title.parentNode === box) box.insertBefore(img, title);
    else box.insertBefore(img, box.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();
})();
