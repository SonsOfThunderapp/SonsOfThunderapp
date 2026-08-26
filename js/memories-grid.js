(function(){
  var NAMES=['home','brothers','events','about'];
  function show(name,btn){
    if(NAMES.indexOf(name)<0) return;
    ['home','brothers','events','about'].forEach(function(n){
      var p=document.getElementById('view-'+n);
      if(!p) return;
      var on=n===name;
      p.classList.toggle('active', on);
      p.style.setProperty('display', on?'block':'none', 'important');
      p.style.setProperty('visibility', on?'visible':'hidden', 'important');
    });
    document.querySelectorAll('nav.bottom-nav button, .nav-item').forEach(function(b){
      b.classList.toggle('active', b===btn || b.getAttribute('data-view')===name);
    });
  }
  function bind(){
    var btns=document.querySelectorAll('nav.bottom-nav button');
    btns.forEach(function(btn,i){
      if(btn.getAttribute('data-tb-nav')==='1') return;
      btn.setAttribute('data-tb-nav','1');
      var name=btn.getAttribute('data-view')||NAMES[i];
      function go(e){ if(e){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } show(name,btn); }
      btn.addEventListener('pointerdown', go, true);
      btn.addEventListener('click', go, true);
      btn.onclick=go;
    });
  }
  bind();
  setTimeout(bind,500);
  setTimeout(bind,2000);
})();

/* Guest Memories wall: http image files only. SVG night stills + real jpg. No data: in img src. Upload stays sign-in. */
(function () {
  var painting = false;
  var viewerBound = false;
  var skipped = {};
  var feedObs = null;

  var GUEST_WALL = [
    { id: 'sot-tent-banner', src: '/assets/tour-memories/sot-tent-banner.svg' },
    { id: 'sot-topgolf-jacket', src: '/assets/tour-memories/sot-topgolf-jacket.svg' },
    { id: 'sot-three-huddle', src: '/assets/tour-memories/sot-three-huddle.svg' },
    { id: 'sot-veteran-talk', src: '/assets/tour-memories/sot-veteran-talk.svg' },
    { id: 'sot-night-line', src: '/assets/tour-memories/sot-night-line.svg' },
    { id: 'sot-night-patio', src: '/assets/tour-memories/sot-night-patio.svg' },
    { id: 'sot-night-patio-2', src: '/assets/tour-memories/sot-night-patio-2.svg' },
    { id: 'sot-topgolf-selfie', src: '/assets/tour-memories/sot-topgolf-selfie.svg' },
    { id: 'sot-pizza', src: '/assets/tour-memories/sot-pizza.svg' },
    { id: 'sot-topgolf-eight', src: '/assets/tour-memories/sot-topgolf-eight.svg' },
    { id: 'sot-topgolf-five', src: '/assets/tour-memories/sot-topgolf-five.svg' },
    { id: 'sot-night-selfie-four', src: '/assets/tour-memories/sot-night-selfie-four.svg' },
    { id: 'sot-roast-carve', src: '/assets/tour-memories/sot-roast-carve.svg' },
    { id: 'sot-patio-from-seat', src: '/assets/tour-memories/sot-patio-from-seat.svg' },
    { id: 'sot-daylight-patio', src: '/assets/tour-memories/sot-daylight-patio.svg' },
    { id: 'real-tree', src: '/assets/tour-memories/real-tree.jpg' },
    { id: 'real-patio', src: '/assets/tour-memories/real-patio.jpg' },
    { id: 'real-bowl', src: '/assets/tour-memories/real-bowl.jpg' }
  ];

  function signedIn() {
    try {
      return typeof window.isSignedIn === 'function' && !!window.isSignedIn();
    } catch (e) {
      return false;
    }
  }

  function noteSkip(id, reason) {
    var key = id || reason;
    if (skipped[key]) return;
    skipped[key] = reason;
    try { console.info('[memories] skip', id || '', reason); } catch (e) {}
  }

  function isHttpImagePath(src) {
    if (src == null) return false;
    src = String(src).trim();
    if (!src || src === 'undefined' || src === 'null' || src === 'about:blank') return false;
    if (src.indexOf('data:') === 0) return false;
    if (/^javascript:/i.test(src) || /^blob:/i.test(src)) return false;
    if (/^https?:\/\/$/i.test(src) || /^https?:\/\/#/i.test(src)) return false;
    if (/^https?:\/\//i.test(src)) {
      try {
        var u = new URL(src);
        if (!u.hostname) return false;
        return /\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i.test(u.pathname);
      } catch (eUrl) {
        return false;
      }
    }
    if (src.charAt(0) === '/' || src.indexOf('assets/') === 0 || src.indexOf('img/') === 0) {
      return /\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i.test(src);
    }
    return false;
  }

  function seedList() {
    return GUEST_WALL.filter(function (item) {
      if (!item || !item.src) return false;
      if (skipped[item.id]) return false;
      if (!isHttpImagePath(item.src)) {
        noteSkip(item.id || 'seed', 'not-http-image');
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

  function applyCover(img) {
    if (!img) return;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';
  }

  function applyContain(img) {
    if (!img) return;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    img.style.background = '#000';
  }

  function bindDecodeGuard(el, media, id) {
    if (!el || !media || media._tbMemGuard) return;
    media._tbMemGuard = true;
    function kill() { removeTile(el, id, 'decode-fail'); }
    function ok() {
      var w = media.naturalWidth || media.videoWidth || 0;
      if (!w) { kill(); return; }
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
    if (!media || src.indexOf('data:') === 0 || !src) {
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
    if (!viewer || !stage || !isHttpImagePath(src)) return;
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
    if (!isHttpImagePath(src)) return;
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
    if (!item || !isHttpImagePath(item.src)) {
      noteSkip(item && item.id, 'not-http-image');
      return null;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mem-tile';
    btn.setAttribute('data-tb-mem-seed', '1');
    btn.setAttribute('data-mem-id', item.id || '');
    btn.style.display = 'block';
    btn.style.width = '100%';
    btn.style.aspectRatio = '1';
    btn.style.minHeight = '160px';
    btn.style.padding = '0';
    btn.style.border = '0';
    btn.style.background = '#111';
    btn.style.overflow = 'hidden';
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    function killDead() {
      skipped[item.id || item.src] = 'decode-fail';
      removeTile(btn, item.id, 'decode-fail');
    }
    img.addEventListener('error', killDead);
    img.addEventListener('load', function () {
      if (!img.naturalWidth) killDead();
      else btn.classList.add('mem-decoded');
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

  function hideGuestEmpty(feed) {
    if (!feed) return;
    feed.querySelectorAll('.empty-memories-cta, .empty-memories, .empty-state').forEach(function (n) {
      n.setAttribute('hidden', 'hidden');
      n.style.display = 'none';
    });
  }

  function hasVisibleDecodedImg(feed) {
    if (!feed) return false;
    var imgs = feed.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i];
      if (!im) continue;
      var vis = true;
      try {
        var st = window.getComputedStyle(im);
        if (st && (st.display === 'none' || st.visibility === 'hidden')) vis = false;
      } catch (eSt) {}
      if (vis && im.naturalWidth > 0 && im.complete) return true;
    }
    return false;
  }

  function guestWallAlreadyForced(feed) {
    try {
      if (window.__tbGuestWallForced) return true;
      if (feed && feed.getAttribute && feed.getAttribute('data-tb-guest-wall') === '1') return true;
    } catch (eFlag) {}
    return false;
  }

  function markGuestWallForced(feed) {
    try {
      window.__tbGuestWallForced = true;
      if (feed && feed.setAttribute) feed.setAttribute('data-tb-guest-wall', '1');
    } catch (eMark) {}
  }

  function forceAppendGuestWall(feed) {
    if (!feed) return;
    if (guestWallAlreadyForced(feed)) return;
    markGuestWallForced(feed);
    GUEST_WALL.forEach(function (item) {
      if (!item || skipped[item.id] || skipped[item.src]) return;
      appendSeed(feed, item);
    });
    hideGuestEmpty(feed);
    feed.classList.add('mem-grid', 'mem-has-grid');
  }

  function paint() {
    if (painting) return;
    var feed = document.getElementById('media-feed');
    if (!feed) return;
    var seeds = seedList();
    if (!seeds.length) {
      return;
    }
    painting = true;
    if (feedObs) {
      try { feedObs.disconnect(); } catch (eDisc) {}
    }
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
        if (!media || src.indexOf('data:') === 0 || skipped[id] || !isHttpImagePath(src)) {
          removeTile(el, id, skipped[id] || 'invalid-src');
          return;
        }
        applyCover(media);
        bindDecodeGuard(el, media, id);
      });

      var live = collectLive();
      var seedNodes = feed.querySelectorAll('.mem-tile[data-tb-mem-seed]');
      var empty = isEmptyCta(feed);
      var guest = !signedIn();

      if (!live.length && seedNodes.length === seeds.length && !empty) {
        feed.classList.add('mem-grid', 'mem-has-grid');
        hideGuestEmpty(feed);
      } else if (!live.length && (empty || seedNodes.length !== seeds.length || guest)) {
        if (empty || seedNodes.length !== seeds.length) {
          if (empty) feed.innerHTML = '';
          var have = {};
          feed.querySelectorAll('.mem-tile[data-tb-mem-seed]').forEach(function (el) {
            have[el.getAttribute('data-mem-id') || ''] = true;
          });
          seeds.forEach(function (item) {
            if (item && item.id && have[item.id]) return;
            appendSeed(feed, item);
          });
        }
        hideGuestEmpty(feed);
        feed.classList.add('mem-grid', 'mem-has-grid');
      } else if (live.length) {
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
        } else {
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
      }

      if (!hasVisibleDecodedImg(feed)) {
        forceAppendGuestWall(feed);
      }
    } finally {
      painting = false;
      if (feedObs) {
        try {
          var liveFeed = document.getElementById('media-feed');
          if (liveFeed) feedObs.observe(liveFeed, { childList: true });
          var liveHero = document.getElementById('media-hero');
          if (liveHero) feedObs.observe(liveHero, { childList: true });
        } catch (eRe) {}
      }
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
      feedObs = obs;
    } else if (feed && feed._tbMemObs) {
      feedObs = feed._tbMemObs;
    }
    setInterval(function () {
      paint();
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
