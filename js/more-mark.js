/* 20260830-more-mark2
   More header stays hidden. Small official bolt above WHO WE ARE.
   One-shot at boot missed the node. Wake on More tap too. */
(function () {
  if (window.__tbMoreMark2) return;
  window.__tbMoreMark2 = true;

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

  function isMore(t) {
    if (!t || !t.closest) return false;
    var n = t.closest('[data-view], .nav-item, #nav-about');
    if (!n) return false;
    var v = n.getAttribute('data-view') || n.id || '';
    return v === 'about' || v === 'nav-about';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();

  document.addEventListener('pointerdown', function (e) {
    if (isMore(e.target)) place();
  }, true);

  var about = document.getElementById('view-about');
  if (about && window.MutationObserver) {
    new MutationObserver(function () {
      if (about.classList.contains('active')) place();
    }).observe(about, { attributes: true, attributeFilter: ['class'] });
  }
})();
