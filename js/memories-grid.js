/* Public Memories seed overlay. Does not wrap app.js internals. */
(function () {
  var painting = false;
  var viewerBound = false;

  function seedList() {
    var s = window.TB_MEMORY_SEED;
    if (!Array.isArray(s)) return [];
    /* Truncated live webp payloads: dwebp NOT_ENOUGH_DATA / naturalWidth 0 */
    var dead = {
      'seed-02-crooked-can': 1,
      'seed-07-sons-tv': 1,
      'seed-13-orlando-create': 1
    };
    return s.filter(function (item) {
      return item && item.src && !dead[item.id];
    });
  }

  function tileSrc(el) {
    if (!el) return '';
    var media = el.querySelector('img, video');
    return (media && media.getAttribute('src')) || '';
  }

  function isEmptyCta(feed) {
    if (!feed) return true;
    if (feed.querySelector('.mem-tile, .media-thumb')) return false;
    if (!feed.children.length) return true;
    return !!feed.querySelector('.empty-memories-cta, .empty-memories, .empty-state');
  }

  function closeViewer() {
    var viewer = document.getElementById('memory-viewer');
    var stage = document.getElementById('memory-viewer-stage');
    if (viewer) {
      viewer.classList.add('hidden');
      viewer.setAttribute('aria-hidden', 'true');
    }
    if (stage) stage.innerHTML = '';
  }

  function openLocalViewer(src) {
    var viewer = document.getElementById('memory-viewer');
    var stage = document.getElementById('memory-viewer-stage');
    if (!viewer || !stage || !src) return;
    stage.innerHTML = '';
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    stage.appendChild(img);
    viewer.classList.remove('hidden');
    viewer.setAttribute('aria-hidden', 'false');
    if (!viewerBound) {
      viewerBound = true;
      var closeBtn = document.getElementById('memory-viewer-close');
      if (closeBtn) closeBtn.addEventListener('click', closeViewer);
      stage.addEventListener('click', closeViewer);
    }
  }

  function onTileTap(src, btn) {
    if (typeof window.openMemoryViewer === 'function') {
      try {
        var media = window.media;
        if (media && media.length) {
          window.openMemoryViewer(0, btn);
          return;
        }
      } catch (e) {}
    }
    openLocalViewer(src);
  }

  function makeSeedTile(item) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mem-tile';
    btn.setAttribute('data-tb-mem-seed', '1');
    btn.setAttribute('data-mem-id', item.id || '');
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    function killDead() {
      try { if (btn && btn.parentNode) btn.parentNode.removeChild(btn); } catch (eKill) {}
    }
    img.addEventListener('error', killDead);
    img.addEventListener('load', function () {
      if (!img.naturalWidth) killDead();
    });
    img.src = item.src;
    var by = document.createElement('div');
    by.className = 'mem-byline';
    by.textContent = item.by || 'Obie';
    btn.appendChild(img);
    btn.appendChild(by);
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      onTileTap(item.src, btn);
    });
    return btn;
  }

  function enhanceLive(el) {
    if (!el || el.querySelector('.mem-byline')) return;
    var cap = el.querySelector('.media-thumb-cap');
    if (cap) {
      var who = (cap.textContent || '').split('·').pop().trim();
      if (who && !el.querySelector('.mem-byline')) {
        var line = document.createElement('div');
        line.className = 'mem-byline';
        line.textContent = who;
        el.appendChild(line);
      }
    }
  }

  function collectLive() {
    var out = [];
    var seen = {};
    function take(root) {
      if (!root) return;
      root.querySelectorAll('.media-thumb').forEach(function (el) {
        var src = tileSrc(el);
        var key = src || ('node-' + out.length);
        if (seen[key]) return;
        seen[key] = true;
        out.push(el);
      });
    }
    take(document.getElementById('media-hero'));
    take(document.getElementById('media-feed'));
    return out;
  }

  function paint() {
    if (painting) return;
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var seeds = seedList();
    if (!seeds.length) return;
    painting = true;
    try {
      var hero = document.getElementById('media-hero');
      if (hero) {
        hero.classList.add('hidden');
        hero.setAttribute('hidden', 'hidden');
      }

      var live = collectLive();
      var seedNodes = feed.querySelectorAll('.mem-tile[data-tb-mem-seed]');
      var empty = isEmptyCta(feed);

      if (!live.length && seedNodes.length === seeds.length && !empty) {
        feed.classList.add('mem-grid', 'mem-has-grid');
        return;
      }

      if (!live.length && (empty || seedNodes.length !== seeds.length)) {
        feed.innerHTML = '';
        seeds.forEach(function (item) {
          if (item && item.src) feed.appendChild(makeSeedTile(item));
        });
        feed.classList.add('mem-grid', 'mem-has-grid');
        return;
      }

      if (live.length) {
        var firstSeed = feed.querySelector('.mem-tile[data-tb-mem-seed]');
        var lastLiveInFeed = null;
        feed.querySelectorAll('.media-thumb').forEach(function (el) { lastLiveInFeed = el; });
        if (
          seedNodes.length === seeds.length &&
          !feed.querySelector('.empty-memories-cta, .empty-state') &&
          firstSeed &&
          lastLiveInFeed &&
          (lastLiveInFeed.compareDocumentPosition(firstSeed) & Node.DOCUMENT_POSITION_FOLLOWING)
        ) {
          live.forEach(enhanceLive);
          feed.classList.add('mem-grid', 'mem-has-grid');
          return;
        }

        var liveSrc = {};
        live.forEach(function (el) {
          var s = tileSrc(el);
          if (s) liveSrc[s] = true;
          enhanceLive(el);
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        feed.innerHTML = '';
        live.forEach(function (el) { feed.appendChild(el); });
        seeds.forEach(function (item) {
          if (!item || !item.src || liveSrc[item.src]) return;
          feed.appendChild(makeSeedTile(item));
        });
        feed.classList.add('mem-grid', 'mem-has-grid');
      }
    } finally {
      painting = false;
    }
  }

  function boot() {
    paint();
    var feed = document.getElementById('media-feed');
    if (feed && !feed._tbMemObs) {
      var obs = new MutationObserver(function () {
        if (painting) return;
        paint();
      });
      obs.observe(feed, { childList: true });
      var hero = document.getElementById('media-hero');
      if (hero) obs.observe(hero, { childList: true });
      feed._tbMemObs = obs;
    }
    setInterval(paint, 1600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
