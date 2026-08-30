/* 20260830-proof-18
   Memories must show the 18 crushed stills.
   app.js renderMedia can wipe the feed after the wall paints.
   This sidecar puts missing seeds back. No app.js. */
(function () {
  if (window.__tbProof18) return;
  window.__tbProof18 = true;

  var WALL = [
    '/assets/tour-memories/sot-tent-banner.jpg',
    '/assets/tour-memories/sot-topgolf-jacket.jpg',
    '/assets/tour-memories/sot-three-huddle.jpg',
    '/assets/tour-memories/sot-veteran-talk.jpg',
    '/assets/tour-memories/sot-night-line.jpg',
    '/assets/tour-memories/sot-night-patio.jpg',
    '/assets/tour-memories/sot-night-patio-2.jpg',
    '/assets/tour-memories/sot-topgolf-selfie.jpg',
    '/assets/tour-memories/sot-pizza.jpg',
    '/assets/tour-memories/sot-topgolf-eight.jpg',
    '/assets/tour-memories/sot-topgolf-five.jpg',
    '/assets/tour-memories/sot-night-selfie-four.jpg',
    '/assets/tour-memories/sot-roast-carve.jpg',
    '/assets/tour-memories/sot-patio-from-seat.jpg',
    '/assets/tour-memories/sot-daylight-patio.jpg',
    '/assets/tour-memories/real-tree.jpg',
    '/assets/tour-memories/real-patio.jpg',
    '/assets/tour-memories/real-bowl.jpg'
  ];

  var ticking = false;

  function fileOf(src) {
    if (!src) return '';
    var s = String(src).split('?')[0];
    var i = s.lastIndexOf('/');
    return (i >= 0 ? s.slice(i + 1) : s).toLowerCase();
  }

  function feed() {
    return document.getElementById('media-feed');
  }

  function have() {
    var box = feed();
    var out = {};
    if (!box) return out;
    box.querySelectorAll('img, video').forEach(function (el) {
      var key = fileOf(el.getAttribute('src') || el.currentSrc || el.getAttribute('data-tb-src') || '');
      if (key) out[key] = true;
    });
    return out;
  }

  function tile(src) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mem-tile';
    btn.setAttribute('data-tb-proof18', '1');
    btn.style.cssText = 'display:block;width:100%;aspect-ratio:1;min-height:160px;padding:0;border:0;background:#111;overflow:hidden;';
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    img.addEventListener('error', function () {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
    });
    btn.appendChild(img);
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      try {
        if (typeof window.openMemoryViewer === 'function') return;
      } catch (e0) {}
    });
    return btn;
  }

  function paint() {
    var box = feed();
    if (!box) return;
    box.querySelectorAll('.empty-memories-cta, .empty-memories, .empty-state').forEach(function (n) {
      n.setAttribute('hidden', 'hidden');
      n.style.display = 'none';
    });
    var seen = have();
    WALL.forEach(function (src) {
      var key = fileOf(src);
      if (!key || seen[key]) return;
      seen[key] = true;
      box.appendChild(tile(src));
    });
    box.classList.add('mem-grid', 'mem-has-grid');
  }

  function requestPaint() {
    if (ticking) return;
    ticking = true;
    setTimeout(function () {
      ticking = false;
      paint();
    }, 60);
  }

  function onEvents() {
    var ev = document.getElementById('view-events');
    return !!(ev && ev.classList.contains('active'));
  }

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-events');
    var v = n ? (n.getAttribute('data-view') || n.id || '') : '';
    if (v === 'events' || v === 'nav-events') requestPaint();
  }, true);

  var ev = document.getElementById('view-events');
  if (ev && window.MutationObserver) {
    new MutationObserver(function () {
      if (onEvents()) requestPaint();
    }).observe(ev, { attributes: true, attributeFilter: ['class'] });
  }

  var box = feed();
  if (box && window.MutationObserver) {
    new MutationObserver(function () {
      if (onEvents()) requestPaint();
    }).observe(box, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (onEvents()) requestPaint();
    });
  } else if (onEvents()) {
    requestPaint();
  }
  window.addEventListener('pageshow', function () {
    if (onEvents()) requestPaint();
  });
})();
