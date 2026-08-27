/* Thunder Theater. One film. Entire phone. Then Home. */
(function (w) {
  if (w.ThunderTheater) return;
  var root, video, scrub, curEl, durEl, fadeT, startY, pushed, lastPoster;

  function q(sel) { return root.querySelector(sel); }

  function loadCss() {
    if (document.querySelector('link[href*="tb-theater.css"]')) return;
    var b = (w.TB_CONFIG && w.TB_CONFIG.APP_BUILD) || '1';
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/tb-theater.css?v=' + encodeURIComponent(b);
    (document.head || document.documentElement).appendChild(l);
  }

  function ensure() {
    loadCss();
    if (root) return root;
    root = document.createElement('div');
    root.id = 'tb-theater';
    root.setAttribute('aria-modal', 'true');
    root.innerHTML =
      '<button type="button" class="tb-th-done" aria-label="Done">DONE</button>' +
      '<video playsinline webkit-playsinline muted></video>' +
      '<div class="tb-th-chrome">' +
        '<div class="tb-th-time"><span class="tb-th-cur">0:00</span> / <span class="tb-th-dur">0:00</span></div>' +
        '<input class="tb-th-scrub" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek">' +
      '</div>';
    document.body.appendChild(root);
    video = q('video');
    scrub = q('.tb-th-scrub');
    curEl = q('.tb-th-cur');
    durEl = q('.tb-th-dur');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'auto');
    video.controls = false;
    video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback');
    try { video.disablePictureInPicture = true; } catch (e0) {}
    q('.tb-th-done').addEventListener('click', function (e) { e.stopPropagation(); close(); });
    video.addEventListener('click', onTap);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onTime);
    video.addEventListener('error', onErr);
    scrub.addEventListener('click', function (e) { e.stopPropagation(); });
    scrub.addEventListener('input', function () {
      if (!video.duration) return;
      video.currentTime = (Number(scrub.value) / 1000) * video.duration;
      wakeChrome();
    });
    root.addEventListener('touchstart', onStart, { passive: false });
    root.addEventListener('touchmove', onMove, { passive: false });
    root.addEventListener('touchend', onEnd, { passive: false });
    w.addEventListener('popstate', onPop);
    return root;
  }

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function onTime() {
    var d = video.duration || 0;
    var c = video.currentTime || 0;
    curEl.textContent = fmt(c);
    durEl.textContent = d ? fmt(d) : '0:00';
    if (d) scrub.value = String(Math.round((c / d) * 1000));
  }
  function onErr() {
    var src = '';
    try { src = video.currentSrc || video.src || ''; } catch (e0) {}
    if (/supabase\.co/i.test(src)) return;
    try { video.removeAttribute('src'); video.load(); } catch (e1) {}
    if (lastPoster) {
      w.__tbMonthLastPoster = lastPoster;
      root.style.background = '#000 url(' + lastPoster + ') center / contain no-repeat';
    }
  }
  function onTap(e) {
    e.stopPropagation();
    wakeChrome();
    try { video.muted = false; video.volume = 1; } catch (e2) {}
    if (video.paused) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.pause();
    }
  }
  function wakeChrome() {
    root.classList.remove('is-faded');
    clearTimeout(fadeT);
    fadeT = setTimeout(function () { if (root) root.classList.add('is-faded'); }, 2000);
  }
  function onStart(ev) {
    if (!ev.touches || !ev.touches[0]) return;
    startY = ev.touches[0].clientY;
  }
  function onMove(ev) { if (ev.cancelable) ev.preventDefault(); }
  function onEnd(ev) {
    var y = ev.changedTouches && ev.changedTouches[0] ? ev.changedTouches[0].clientY : startY;
    if (y - startY > 140) close();
  }
  function onPop() {
    if (root && root.classList.contains('is-open')) {
      pushed = false;
      close(true);
    }
  }

  function open(opts) {
    opts = opts || {};
    ensure();
    lastPoster = opts.poster || w.__tbMonthLastPoster || '';
    if (lastPoster) w.__tbMonthLastPoster = lastPoster;
    root.style.background = '#000';
    video.poster = lastPoster || '';
    if (opts.src) {
      video.src = opts.src;
    } else {
      try { video.removeAttribute('src'); video.load(); } catch (e3) {}
    }
    try { video.muted = true; } catch (e4) {}
    document.body.classList.add('tb-theater-open');
    root.classList.add('is-open');
    root.classList.remove('is-faded');
    if (!pushed) {
      try { history.pushState({ tbTheater: 1 }, '', location.href); pushed = true; } catch (e5) {}
    }
    wakeChrome();
    try { video.muted = false; } catch (e4b) {}
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        try { video.muted = true; } catch (e4c) {}
        var p2 = video.play();
        if (p2 && p2.catch) p2.catch(function () {});
      });
    }
  }

  function close(fromPop) {
    if (!root) return;
    try { video.pause(); } catch (e6) {}
    root.classList.remove('is-open');
    document.body.classList.remove('tb-theater-open');
    clearTimeout(fadeT);
    if (pushed && !fromPop) {
      pushed = false;
      try { history.back(); } catch (e7) {}
    }
    pushed = false;
  }

  function bindTile(el, getFilm) {
    if (!el || el.__tbTheaterBound) return;
    el.__tbTheaterBound = 1;
    ensure();
    el.addEventListener('click', function (ev) {
      ev.preventDefault();
      var film = typeof getFilm === 'function' ? getFilm() : getFilm;
      if (!film || (!film.src && !film.poster)) {
        open({ src: '', poster: '' });
        return;
      }
      open(film);
    });
  }

  w.ThunderTheater = { ensure: ensure, open: open, close: close, bindTile: bindTile };
})(window);
