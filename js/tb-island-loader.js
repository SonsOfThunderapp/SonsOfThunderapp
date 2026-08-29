/* 20260829-door-own: coarse island loader. Assets-loaded only. No laterSidecars. */
(function () {
  if (window.__tbIslandLoader) return;
  window.__tbIslandLoader = 1;

  var BUILD = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
  var inflight = {};
  var loaded = {};

  var ISLANDS = {
    brothers: {
      css: ['css/brothers-seat.css', 'css/text-leader-brothers.css', 'css/profile-inspect.css'],
      js: ['js/guest-qr-signin.js', 'js/brothers-chair.js', 'js/own-card-edit.js', 'js/text-leader-brothers.js', 'js/profile-inspect.js', 'js/island-safe.js']
    },
    memories: {
      css: ['css/memories-latest.css', 'css/memories-page.css', 'css/memories-tight.css', 'css/memories-bottom.css', 'css/events-mission-stack.css', 'css/choice2-proof.css'],
      js: ['js/memories-grid.js', 'js/memories-lead.js', 'js/memories-bottom.js', 'js/choice2-proof.js', 'js/ann-keep.js']
    },
    more: {
      css: ['css/more-legal.css', 'css/code-tight.css', 'css/lump-wow.css'],
      js: ['js/more-alias.js', 'js/more-legal.js', 'js/code-tight.js', 'js/lump-wow.js']
    },
    tour: {
      css: ['css/hangout-tour.css', 'css/tour-roundtable.css'],
      js: ['js/hangout-tour.js', 'js/tour-kill.js']
    },
    chair: {
      css: ['css/chair-no-swipe.css', 'css/room-night.css'],
      js: ['js/leader-door.js', 'js/chair-no-swipe.js', 'js/room-night.js', 'js/chair-copy.js']
    },
    theater: {
      css: ['css/theater-month.css'],
      js: ['js/theater-month.js', 'js/theater-compress.js', 'js/tb-sb-bridge.js']
    },
    ask: {
      css: ['css/ask-clear.css'],
      js: ['js/thunder-ask.js', 'js/ask-clear.js']
    },
    axum: {
      css: ['css/axum-loot.css'],
      js: ['js/axum-wire.js']
    }
  };

  function needleOf(path) {
    var i = path.lastIndexOf('/');
    return path.slice(i + 1);
  }

  function bust(path) {
    return path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(BUILD);
  }

  function waitExisting(el, kind) {
    return new Promise(function (resolve, reject) {
      var done = false;
      function yes() { if (done) return; done = true; resolve(); }
      function no() { if (done) return; done = true; reject(new Error(kind)); }
      if (!el) { yes(); return; }
      if (el.readyState === 'complete' || el.readyState === 'loaded') { yes(); return; }
      try {
        var entries = performance.getEntriesByType('resource');
        for (var i = 0; i < entries.length; i++) {
          if (String(el.href || el.src || '').indexOf(entries[i].name) !== -1 && entries[i].responseEnd > 0) {
            yes();
            return;
          }
        }
      } catch (e0) {}
      el.addEventListener('load', yes);
      el.addEventListener('error', no);
    });
  }

  function loadCss(href) {
    var needle = needleOf(href);
    var existing = document.querySelector('link[href*="' + needle + '"]');
    if (existing) return waitExisting(existing, needle);
    return new Promise(function (resolve, reject) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = bust(href);
      l.onload = function () { resolve(); };
      l.onerror = function () { reject(new Error(needle)); };
      (document.head || document.documentElement).appendChild(l);
    });
  }

  function loadJs(src) {
    var needle = needleOf(src);
    var existing = document.querySelector('script[src*="' + needle + '"]');
    if (existing) return waitExisting(existing, needle);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = bust(src);
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error(needle)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function requestIsland(name) {
    if (loaded[name]) return Promise.resolve();
    if (inflight[name]) return inflight[name];
    var spec = ISLANDS[name];
    if (!spec) return Promise.resolve();
    var jobs = [];
    (spec.css || []).forEach(function (href) { jobs.push(loadCss(href)); });
    (spec.js || []).forEach(function (src) { jobs.push(loadJs(src)); });
    inflight[name] = Promise.all(jobs).then(function () {
      loaded[name] = true;
      inflight[name] = null;
    }, function (err) {
      inflight[name] = null;
      throw err;
    });
    return inflight[name];
  }

  function loadOneJs(src) {
    return loadJs(src).catch(function () {});
  }

  function waitScript(needle) {
    return new Promise(function (resolve) {
      var settled = false;
      function yes() { if (settled) return; settled = true; resolve(); }
      function attach(el) {
        waitExisting(el, needle).then(yes, yes);
      }
      var el = document.querySelector('script[src*="' + needle + '"]');
      if (el) { attach(el); return; }
      var n = 0;
      var t = setInterval(function () {
        var s = document.querySelector('script[src*="' + needle + '"]');
        if (s) { clearInterval(t); attach(s); return; }
        if (++n > 160) { clearInterval(t); yes(); }
      }, 50);
    });
  }

  function homeVisible() {
    if (document.getElementById('tb-home-visible')) return true;
    var v = document.getElementById('view-home');
    if (!v) return false;
    if (v.classList.contains('hidden')) return false;
    try {
      var st = window.getComputedStyle(v);
      return st.display !== 'none' && st.visibility !== 'hidden';
    } catch (e) {
      return true;
    }
  }

  function waitHome() {
    return new Promise(function (resolve) {
      if (homeVisible()) { resolve(); return; }
      var n = 0;
      var t = setInterval(function () {
        if (homeVisible() || ++n > 120) { clearInterval(t); resolve(); }
      }, 50);
    });
  }

  function isShown(el) {
    if (!el) return false;
    if (el.hidden) return false;
    if (el.classList && el.classList.contains('hidden')) return false;
    try {
      var st = window.getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden';
    } catch (e1) {
      return true;
    }
  }

  function observeUnhide(id, fn) {
    var el = document.getElementById(id);
    if (!el) {
      var n = 0;
      var t = setInterval(function () {
        el = document.getElementById(id);
        if (el || ++n > 80) {
          clearInterval(t);
          if (el) observeUnhide(id, fn);
        }
      }, 100);
      return;
    }
    if (isShown(el)) { fn(); }
    var mo = new MutationObserver(function () {
      if (isShown(el)) fn();
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  }

  function filmB() {
    Promise.all([waitScript('app.js'), waitScript('auth-seat.js'), waitHome()]).then(function () {
      return Promise.all([
        loadCss('css/home-month-film.css'),
        loadJs('js/home-month-film.js')
      ]);
    }).catch(function () {});
  }

  function onPointer(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var nav = t.closest('.nav-item[data-view]');
    if (nav) {
      var view = nav.getAttribute('data-view');
      if (view === 'brothers') requestIsland('brothers');
      else if (view === 'events') requestIsland('memories');
      else if (view === 'about') requestIsland('more');
      return;
    }
    if (t.closest('#replay-tour-btn, #take-tour-btn')) {
      requestIsland('tour');
      return;
    }
    if (t.closest('#leader-unlock-btn')) {
      requestIsland('chair');
      return;
    }
    if (t.closest('#thunder-fab, .thunder-fab')) {
      requestIsland('ask');
      return;
    }
    if (t.closest('#rsvp-btn')) {
      loadOneJs('js/commit-reward.js');
    }
  }

  document.addEventListener('pointerdown', onPointer, true);

})();
