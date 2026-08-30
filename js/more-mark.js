/* 20260830-more-mark3
   More header stays hidden. Small official bolt above WHO WE ARE.
   Phone was stuck on more-mark.js?v=plate-gate. Real PNG, replace dead img. */
(function () {
  if (window.__tbMoreMark3) return;
  window.__tbMoreMark3 = true;

  var SRC = '/assets/icon-official.png';
  var FALLBACK = '/assets/bolt-only.png';

  function boxEl() {
    return document.querySelector('#view-about .about-container')
      || document.querySelector('#view-about .container')
      || document.getElementById('view-about');
  }

  function titleEl(box) {
    return document.getElementById('who-we-are-title')
      || (box && box.querySelector('.about-title'))
      || (box && box.querySelector('h1'));
  }

  function bindSrc(img) {
    img.onerror = function () {
      if (img.getAttribute('data-fb') === '1') return;
      img.setAttribute('data-fb', '1');
      img.src = FALLBACK;
    };
    if ((img.getAttribute('src') || '').indexOf('/assets/icon-official.png') === -1) {
      img.src = SRC;
    }
  }

  function place() {
    var box = boxEl();
    if (!box) return false;
    var existing = document.getElementById('about-more-mark');
    if (existing) {
      bindSrc(existing);
      return true;
    }
    var img = document.createElement('img');
    img.id = 'about-more-mark';
    img.className = 'about-logo about-more-mark';
    img.alt = 'Sons of Thunder';
    img.width = 52;
    img.height = 52;
    img.decoding = 'async';
    img.src = SRC;
    bindSrc(img);
    var title = titleEl(box);
    if (title && title.parentNode) title.parentNode.insertBefore(img, title);
    else box.insertBefore(img, box.firstChild);
    return true;
  }

  function isMore(t) {
    if (!t || !t.closest) return false;
    var n = t.closest('[data-view], .nav-item, #nav-about');
    if (!n) return false;
    var v = n.getAttribute('data-view') || n.id || '';
    return v === 'about' || v === 'nav-about';
  }

  function boot() {
    place();
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (place() || n > 40) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

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
