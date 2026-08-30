/* 20260830-more-mark4
   Do not use class about-logo. styles.css FIX 1 hides that class.
   Repair an existing dead node. Wake on More tap. */
(function () {
  if (window.__tbMoreMark4) return;
  window.__tbMoreMark4 = true;

  var SRC = [
    '/assets/tb-bolt-mark.png',
    '/assets/bolt-only.png',
    '/assets/icon-official.png'
  ];

  function paint(img) {
    img.id = 'about-more-mark';
    img.className = 'about-more-mark';
    img.removeAttribute('hidden');
    img.style.display = 'block';
    img.style.visibility = 'visible';
    img.style.opacity = '1';
    img.style.width = '88px';
    img.style.height = '88px';
    img.alt = 'Sons of Thunder';
    img.width = 88;
    img.height = 88;
    img.decoding = 'async';
  }

  function bindSrc(img) {
    var i = 0;
    img.src = SRC[0];
    img.onerror = function () {
      i += 1;
      if (i < SRC.length) img.src = SRC[i];
      else if (img.parentNode) img.parentNode.removeChild(img);
    };
  }

  function fixBreak() {
    var b = document.querySelector('#view-about .about-bolt-glow');
    if (!b) return;
    b.src = SRC[0];
    b.setAttribute('data-tb-src', SRC[0]);
    b.onerror = function () {
      var wrap = b.closest('.about-bolt-break');
      if (wrap) wrap.style.display = 'none';
    };
  }

  function place() {
    fixBreak();
    var box = document.querySelector('#view-about .about-container');
    if (!box) return;
    var img = document.getElementById('about-more-mark');
    if (img) {
      paint(img);
      if ((img.getAttribute('src') || '').indexOf('tb-bolt-mark') === -1) bindSrc(img);
      return;
    }
    img = document.createElement('img');
    paint(img);
    bindSrc(img);
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
