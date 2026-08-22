/* Public Memories seed overlay. Does not wrap app.js internals. */
(function () {
  var painting = false;
  var viewerBound = false;
  var skipped = {};

  function noteSkip(id, reason) {
    var key = id || reason;
    if (skipped[key]) return;
    skipped[key] = reason;
    try { console.info('[memories] skip', id || '', reason); } catch (e) {}
  }

  function isTinyOrInvalidSrc(src) {
    if (src == null) return true;
    src = String(src).trim();
    if (!src || src === 'undefined' || src === 'null' || src === 'about:blank') return true;
    if (src.indexOf('data:') === 0) {
      var comma = src.indexOf(',');
      if (comma < 0) return true;
      var payload = src.slice(comma + 1).replace(/\s+/g, '');
      if (payload.length < 800) return true;
      var head = src.slice(0, comma).toLowerCase();
      if (head.indexOf('image/') < 0 && head.indexOf('video/') < 0) return true;
      return false;
    }
    if (/^javascript:/i.test(src) || /^blob:$/i.test(src)) return true;
    if (/^https?:\/\/$/i.test(src) || /^https?:\/\/#/i.test(src)) return true;
    try {
      if (/^https?:\/\//i.test(src)) {
        var u = new URL(src);
        if (!u.hostname) return true;
      }
    } catch (eUrl) {
      return true;
    }
    return false;
  }

  function seedList() {
    var s = window.TB_MEMORY_SEED;
    if (!Array.isArray(s)) return [];
    var dead = {
      'seed-02-crooked-can': 1,
      'seed-07-sons-tv': 1,
      'seed-13-orlando-create': 1
    };
    return s.filter(function (item) {
      if (!item || !item.src) return false;
      if (dead[item.id] || skipped[item.id]) {
        noteSkip(item.id, dead[item.id] ? 'known-truncated-webp' : skipped[item.id]);
        return false;
      }
      if (isTinyOrInvalidSrc(item.src)) {
        noteSkip(item.id || 'seed', 'tiny-or-invalid-data-uri');
        return false;
      }
      return true;
    });
  }

  function tileSrc(el) {
    if (!el) return '';
    var media = el.querySelector('img, video');
    return (media && (media.getAttribute('src') || media.currentSrc || media.src)) || '';
  }

  function removeTile(el, id, reason) {
    noteSkip(id || (el && el.getAttribute && el.getAttribute('data-mem-id')) || 'tile', reason || 'decode-fail');
    try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch (eRm) {}
  }

  function bindDecodeGuard(el, media, id) {
    if (!el || !media || media._tbMemGuard) return;
    media._tbMemGuard = true;
    function kill() { removeTile(el, id, 'decode-fail'); }
    function ok() {
      var w = media.naturalWidth || media.videoWidth || 0;
      if (!w) { kill(); return; }
      el.style.display = '';
      el.classList.add('mem-decoded');
    }
    if (media.tagName === 'VIDEO') {
      if (media.readyState >= 1 && (media.videoWidth || 0) > 0) { ok(); return; }
      media.addEventListener('error', kill);
      media.addEventListener('loadeddata', ok);
      return;
    }
    if (media.complete) {
      if (media.naturalWidth > 0) ok();
      else kill();
      return;
    }
    el.style.display = 'none';
    media.addEventListener('error', kill);
    media.addEventListener('load', function () {
      if (media.naturalWidth > 0) ok();
      else kill();
    });
  }

  function sweepLiveTile(el) {
    if (!el) return false;
    var media = el.querySelector('img, video');
    var src = tileSrc(el);
    var id = (el.getAttribute && el.getAttribute('data-mem-id')) || src.slice(0, 48);
    if (!media || isTinyOrInvalidSrc(src)) {
      removeTile(el, id, 'invalid-src');
      return false;
    }
    bindDecodeGuard(el, media, id);
    return el.parentNode != null;
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
    if (!viewer || !stage || isTinyOrInvalidSrc(src)) return;
    stage.innerHTML = '';
    var img = document.createElement('img');
    img.alt = '';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    img.addEventListener('error', function () { closeViewer(); });
    img.addEventListener('load', function () {
      if (!img.naturalWidth) closeViewer();
    });
    img.src = src;
    stage.appendChild(img);
    viewer.classList.remove('hidden');
    viewer.setAttribute('aria-hidden', 'false');
    silenceLightbox();
    if (!viewerBound) {
      viewerBound = true;
      var closeBtn = document.getElementById('memory-viewer-close');
      if (closeBtn) closeBtn.addEventListener('click', closeViewer);
      stage.addEventListener('click', closeViewer);
    }
  }

  function onTileTap(src, btn) {
    if (isTinyOrInvalidSrc(src)) return;
    if (typeof window.openMemoryViewer === 'function') {
      try {
        var media = window.media;
        if (media && media.length) {
          window.openMemoryViewer(0, btn);
          setTimeout(silenceLightbox, 0);
          return;
        }
      } catch (e) {}
    }
    openLocalViewer(src);
  }

  function makeSeedTile(item) {
    if (!item || isTinyOrInvalidSrc(item.src)) {
      noteSkip(item && item.id, 'tiny-or-invalid-data-uri');
      return null;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mem-tile';
    btn.setAttribute('data-tb-mem-seed', '1');
    btn.setAttribute('data-mem-id', item.id || '');
    btn.style.display = 'none';
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    function killDead() {
      skipped[item.id || item.src] = 'decode-fail';
      removeTile(btn, item.id, 'decode-fail');
    }
    img.addEventListener('error', killDead);
    img.addEventListener('load', function () {
      if (!img.naturalWidth) killDead();
      else {
        btn.style.display = '';
        btn.classList.add('mem-decoded');
      }
    });
    try {
      img.src = item.src;
    } catch (eSrc) {
      noteSkip(item.id, 'ERR_INVALID_URL');
      return null;
    }
    btn.appendChild(img);
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      onTileTap(item.src, btn);
    });
    return btn;
  }

  function stripNames(root) {
    var scope = root || document;
    try {
      silenceLightbox();
      scope.querySelectorAll('.mem-byline, .media-thumb-cap, .uploader_name, .uploader-name, [data-uploader], .memory-viewer-by').forEach(function (n) {
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
    } catch (eStrip) {}
  }

  function collectLive() {
    var out = [];
    var seen = {};
    function take(root) {
      if (!root) return;
      root.querySelectorAll('.media-thumb').forEach(function (el) {
        if (!sweepLiveTile(el)) return;
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

  function appendSeed(feed, item) {
    var tile = makeSeedTile(item);
    if (tile) feed.appendChild(tile);
  }

  function paint() {
    if (painting) return;
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var seeds = seedList();
    if (!seeds.length) return;
    painting = true;
    try {
      stripNames(document);
      syncEventsFabClass();
      var hero = document.getElementById('media-hero');
      if (hero) {
        hero.classList.add('hidden');
        hero.setAttribute('hidden', 'hidden');
      }

      feed.querySelectorAll('.mem-tile[data-tb-mem-seed]').forEach(function (el) {
        var media = el.querySelector('img, video');
        var src = tileSrc(el);
        var id = el.getAttribute('data-mem-id') || '';
        if (!media || isTinyOrInvalidSrc(src) || skipped[id]) {
          removeTile(el, id, skipped[id] || 'invalid-src');
          return;
        }
        bindDecodeGuard(el, media, id);
      });

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
          appendSeed(feed, item);
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
          live.forEach(stripNames);
          feed.classList.add('mem-grid', 'mem-has-grid');
          return;
        }

        var liveSrc = {};
        live.forEach(function (el) {
          var s = tileSrc(el);
          if (s) liveSrc[s] = true;
          stripNames(el);
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        feed.innerHTML = '';
        live.forEach(function (el) { feed.appendChild(el); });
        seeds.forEach(function (item) {
          if (!item || !item.src || liveSrc[item.src]) return;
          appendSeed(feed, item);
        });
        feed.classList.add('mem-grid', 'mem-has-grid');
      }
    } finally {
      painting = false;
    }
  }

  function silenceLightbox() {
    var cap = document.getElementById('memory-viewer-caption');
    if (cap) {
      cap.textContent = '';
      cap.setAttribute('hidden', 'hidden');
      cap.style.display = 'none';
    }
  }

  function syncEventsFabClass() {
    try {
      var ev = document.getElementById('view-events');
      var on = !!(ev && ev.classList.contains('active'));
      document.body.classList.toggle('tb-view-events', on);
    } catch (eFab) {}
  }

  function boot() {
    paint();
    silenceLightbox();
    syncEventsFabClass();
    setInterval(syncEventsFabClass, 400);
    var viewer = document.getElementById('memory-viewer');
    if (viewer && !viewer._tbCapObs) {
      var vobs = new MutationObserver(silenceLightbox);
      vobs.observe(viewer, { childList: true, subtree: true, characterData: true });
      viewer._tbCapObs = vobs;
    }
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
