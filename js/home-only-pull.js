/* 20260830-home-pull
   Home only. Pull from the top of Home, not a 160px strip.
   Slow enough to be committed. Reload stays on Home. Seat / sb-* stay. */
(function () {
  if (window.__tbHomePull) return;
  window.__tbHomePull = true;

  var THRESH = 88;
  var DEEP = 128;
  var MAX_PULL = 176;
  var SLOW_MS = 180;
  var startY = 0;
  var startX = 0;
  var startT = 0;
  var armed = false;
  var pulling = false;
  var fired = false;

  function onHome() {
    if (document.querySelector('#view-brothers.active, #view-events.active, #view-about.active')) return false;
    if (document.querySelector('.view.active:not(#view-home)')) return false;
    var nav = document.querySelector('.bottom-nav [data-view].active, .nav-item[data-view].active');
    if (nav) {
      var dv = nav.getAttribute('data-view') || '';
      if (dv && dv !== 'home') return false;
    }
    if (document.body.classList.contains('tb-view-brothers') ||
        document.body.classList.contains('tb-view-events') ||
        document.body.classList.contains('tb-view-about')) return false;
    var home = document.getElementById('view-home');
    return !!(home && home.classList.contains('active'));
  }

  function atTop() {
    var t = 0;
    var nodes = [
      document.getElementById('view-home'),
      document.querySelector('#view-home .container'),
      document.getElementById('views'),
      document.getElementById('app'),
      document.scrollingElement,
      document.documentElement,
      document.body
    ];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] && typeof nodes[i].scrollTop === 'number' && nodes[i].scrollTop > t) t = nodes[i].scrollTop;
    }
    t = Math.max(t, window.scrollY || window.pageYOffset || 0);
    return t <= 2;
  }

  function inSheet(t) {
    if (!t || !t.closest) return false;
    return !!t.closest(
      '.modal, #brother-detail, #info-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-modal, #thunder-panel, #axum-drop, #tb-tour, #auth-gate'
    );
  }

  function hud() {
    var el = document.getElementById('tb-home-pull');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'tb-home-pull';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="tb-home-pull-track">' +
        '<span class="tb-home-pull-ring"></span>' +
        '<img class="tb-home-pull-bolt" src="assets/bolt-only.png" alt="">' +
      '</div>';
    (document.body || document.documentElement).appendChild(el);
    return el;
  }

  function place(el) {
    var h = document.getElementById('main-header');
    var top = 88;
    if (h) top = h.getBoundingClientRect().bottom;
    el.style.top = Math.round(top - 6) + 'px';
  }

  function rubber(dy) {
    var y = Math.max(0, Math.min(MAX_PULL, dy));
    var p = Math.max(0, Math.min(1, y / THRESH));
    var el = hud();
    place(el);
    el.style.setProperty('--tb-pull', String(p));
    el.style.setProperty('--tb-pull-y', Math.round(8 + y * 0.38) + 'px');
    el.classList.toggle('is-on', y > 8);
    el.classList.toggle('is-armed', y >= THRESH);
    el.classList.remove('is-snap', 'is-fire');
    document.body.classList.toggle('tb-home-pulling', y > 8);
    document.body.classList.toggle('tb-home-armed', y >= THRESH);
  }

  function snap() {
    var el = document.getElementById('tb-home-pull');
    document.body.classList.remove('tb-home-pulling', 'tb-home-armed');
    if (!el) return;
    el.classList.remove('is-armed', 'is-fire');
    el.classList.add('is-snap');
    el.style.setProperty('--tb-pull', '0');
    el.style.setProperty('--tb-pull-y', '0px');
    el.classList.remove('is-on');
    window.setTimeout(function () {
      el.classList.remove('is-snap');
    }, 320);
  }

  function latest() {
    if (fired) return;
    fired = true;
    var el = hud();
    el.classList.add('is-armed', 'is-fire', 'is-on');
    document.body.classList.remove('tb-home-pulling', 'tb-home-armed');
    try {
      if (typeof window.tbToast === 'function') window.tbToast('BOARD UPDATED', 1800);
    } catch (e0) {}
    var t = Date.now();
    var keep = 'tb-share';
    var bust = function (path) {
      return fetch(path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + t, { cache: 'reload', credentials: 'same-origin' }).catch(function () {});
    };
    var chain = Promise.all([
      bust('/sw.js'),
      bust('/build.json'),
      bust('/js/config.js'),
      bust('/js/home-only-pull.js'),
      bust('/css/home-only-pull.css')
    ]);
    chain = chain.then(function () {
      if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return;
      return navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all((regs || []).map(function (r) { return r.unregister(); }));
      });
    });
    chain = chain.then(function () {
      if (!window.caches || !caches.keys) return;
      return caches.keys().then(function (keys) {
        return Promise.all((keys || []).filter(function (k) { return k !== keep; }).map(function (k) {
          return caches.delete(k);
        }));
      });
    });
    chain.catch(function () {}).then(function () {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('view', 'home');
        u.searchParams.set('_tb', String(t));
        window.location.replace(u.pathname + u.search);
      } catch (e1) {
        window.location.href = '/?view=home&_tb=' + t;
      }
    });
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    pulling = false;
    if (!e.touches || !e.touches[0]) return;
    if (!onHome() || !atTop() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    startT = Date.now();
    armed = true;
    hud();
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (!armed || !e.touches || !e.touches[0]) return;
    if (!onHome() || inSheet(e.target)) {
      armed = false;
      snap();
      return;
    }
    var y = e.touches[0].clientY || 0;
    var x = e.touches[0].clientX || 0;
    var dy = y - startY;
    var dx = x - startX;
    if (Math.abs(dx) > 48 && dy < THRESH) {
      armed = false;
      snap();
      return;
    }
    if (dy > 10 && atTop()) {
      pulling = true;
      rubber(dy);
      e.preventDefault();
    }
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function (e) {
    if (!armed) return;
    armed = false;
    var t = (e.changedTouches && e.changedTouches[0]) || {};
    var dy = (t.clientY || 0) - startY;
    var dx = (t.clientX || 0) - startX;
    var held = (Date.now() - startT) >= SLOW_MS;
    var go = pulling && onHome() && !inSheet(e.target) && Math.abs(dx) <= 48 &&
      ((dy >= THRESH && held) || dy >= DEEP);
    pulling = false;
    if (go) latest();
    else snap();
  }, true);

  document.addEventListener('touchcancel', function () {
    armed = false;
    pulling = false;
    snap();
  }, true);
})();
