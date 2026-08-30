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
      ev.stopPropagation();
      try { window.tbOpenMem && window.tbOpenMem(src); } catch (e0) {}
    });
    return btn;
  }

  function album() {
    var list = [];
    var seen = {};
    var box = feed();
    if (!box) return list;
    box.querySelectorAll('.mem-tile img, .media-thumb img').forEach(function (img) {
      var s = img.getAttribute('src') || img.currentSrc || '';
      if (!s || seen[s]) return;
      seen[s] = true;
      list.push(s);
    });
    return list;
  }

  window.tbOpenMem = function (src) {
    var viewer = document.getElementById('memory-viewer');
    var stage = document.getElementById('memory-viewer-stage');
    var count = document.getElementById('memory-viewer-count');
    var cap = document.getElementById('memory-viewer-caption');
    if (!viewer || !stage || !src) return;
    var list = album();
    var idx = list.indexOf(src);
    if (idx < 0) { list.unshift(src); idx = 0; }
    stage.innerHTML = '';
    if (cap) cap.textContent = '';
    var img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.src = src;
    stage.appendChild(img);
    if (count) count.textContent = (idx + 1) + ' / ' + list.length;
    viewer.classList.remove('hidden');
    viewer.setAttribute('aria-hidden', 'false');
    viewer.dataset.tbMemSrc = src;
    try { document.body.style.overflow = 'hidden'; } catch (e1) {}
  };

  function closeMem() {
    var viewer = document.getElementById('memory-viewer');
    var stage = document.getElementById('memory-viewer-stage');
    if (viewer) {
      viewer.classList.add('hidden');
      viewer.setAttribute('aria-hidden', 'true');
    }
    if (stage) stage.innerHTML = '';
    try { document.body.style.overflow = ''; } catch (e2) {}
  }

  function stepMem(dir) {
    var viewer = document.getElementById('memory-viewer');
    if (!viewer || viewer.classList.contains('hidden')) return;
    var list = album();
    if (!list.length) return;
    var cur = viewer.dataset.tbMemSrc || '';
    var i = list.indexOf(cur);
    if (i < 0) i = 0;
    i = (i + dir + list.length) % list.length;
    window.tbOpenMem(list[i]);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#memory-viewer-close')) {
      e.preventDefault();
      closeMem();
      return;
    }
    var tile = t.closest('#media-feed .media-thumb, #media-feed .mem-tile, #media-hero .media-thumb');
    if (!tile) return;
    var img = tile.querySelector('img');
    var src = (img && (img.getAttribute('src') || img.currentSrc)) || '';
    if (!src) return;
    e.preventDefault();
    e.stopPropagation();
    window.tbOpenMem(src);
  }, true);

  document.addEventListener('keydown', function (e) {
    var viewer = document.getElementById('memory-viewer');
    if (!viewer || viewer.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeMem();
    if (e.key === 'ArrowRight') stepMem(1);
    if (e.key === 'ArrowLeft') stepMem(-1);
  });

  /* Viewer-only album swipe. Does not own Home pull or dock tabs.
     tab-hold already parks page-swipe when #memory-viewer is the target. */
  var swipe = { on: false, x: 0, y: 0 };
  function viewerOpen() {
    var v = document.getElementById('memory-viewer');
    return !!(v && !v.classList.contains('hidden'));
  }
  function inViewer(t) {
    return !!(t && t.closest && t.closest('#memory-viewer') && !t.closest('#memory-viewer-close'));
  }
  document.addEventListener('touchstart', function (e) {
    if (!viewerOpen() || !e.touches || !e.touches[0] || !inViewer(e.target)) {
      swipe.on = false;
      return;
    }
    swipe.on = true;
    swipe.x = e.touches[0].clientX;
    swipe.y = e.touches[0].clientY;
  }, true);
  document.addEventListener('touchmove', function (e) {
    if (!swipe.on || !e.touches || !e.touches[0]) return;
    var dx = e.touches[0].clientX - swipe.x;
    var dy = e.touches[0].clientY - swipe.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, { capture: true, passive: false });
  document.addEventListener('touchend', function (e) {
    if (!swipe.on) return;
    swipe.on = false;
    if (!viewerOpen()) return;
    var t = (e.changedTouches && e.changedTouches[0]) || null;
    if (!t) return;
    var dx = t.clientX - swipe.x;
    var dy = t.clientY - swipe.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    e.preventDefault();
    e.stopPropagation();
    stepMem(dx < 0 ? 1 : -1);
  }, true);


  function paint() {
    var box = feed();
    if (!box || wallReady()) return;
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
    stampCount();
  }

  function stampCount() {
    var box = feed();
    if (!box) return;
    var n = box.querySelectorAll('.mem-tile, .media-thumb').length;
    var el = document.getElementById('tb-mem-count');
    if (!el) {
      el = document.createElement('p');
      el.id = 'tb-mem-count';
      box.insertAdjacentElement('afterend', el);
    }
    if (n < 2) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = n + ' PROOF';
  }

  function wallReady() {
    var box = feed();
    if (!box) return false;
    return box.querySelectorAll('.mem-tile img, .media-thumb img').length >= WALL.length;
  }

  function requestPaint() {
    if (wallReady()) {
      stampCount();
      return;
    }
    if (ticking) return;
    ticking = true;
    setTimeout(function () {
      ticking = false;
      paint();
      stampCount();
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
    }).observe(box, { childList: true });
  }
  if (onEvents()) requestPaint();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (onEvents()) requestPaint();
    });
  }
  ['css/mem-pop.css', 'css/mem-count.css', 'css/was-there.css', 'css/mem-folder.css'].forEach(function (href) {
    if (document.querySelector('link[href*="' + href.split('/').pop() + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    (document.head || document.documentElement).appendChild(l);
  });
  ['js/was-there.js', 'js/mem-folder.js'].forEach(function (src) {
    if (document.querySelector('script[src*="' + src.split('/').pop() + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  });
})();
