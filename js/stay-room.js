/* 20260830-all-rooms
   Last room is every page: Home, Brothers, Memories, More.
   Stamp the tab you tap. Restore that tab. No Home flash. */
(function () {
  var KEY = 'tbLastRoom';
  var ALLOW = { home: 1, brothers: 1, events: 1, about: 1 };

  function bootStamp() {
    try {
      var u = new URL(window.location.href);
      if (u.searchParams.get('imin') || u.searchParams.get('ask')) return;
      if (u.searchParams.get('view') === 'home') return;
      var last = localStorage.getItem(KEY) || '';
      var v = u.searchParams.get('view');
      if (v && ALLOW[v]) last = v;
      if (!last || last === 'home') return;
      document.documentElement.setAttribute('data-tb-last', last);
    } catch (eBoot) {}
  }
  bootStamp();

  if (window.__tbStayRoom) return;
  window.__tbStayRoom = true;

  function paintLast(room) {
    try {
      if (!room || room === 'home') document.documentElement.removeAttribute('data-tb-last');
      else document.documentElement.setAttribute('data-tb-last', room);
    } catch (eP) {}
  }

  function stamp(room) {
    if (!ALLOW[room]) return;
    try { localStorage.setItem(KEY, room); } catch (eS) {}
    paintLast(room);
  }

  function currentRoom() {
    var other = document.querySelector('#view-brothers.active, #view-events.active, #view-about.active, .view.active:not(#view-home)');
    if (other && other.id) {
      var id = other.id.replace('view-', '');
      if (ALLOW[id]) return id;
    }
    var nav = document.querySelector('.bottom-nav [data-view].active, .nav-item[data-view].active');
    if (nav) {
      var d = nav.getAttribute('data-view') || '';
      if (ALLOW[d]) return d;
    }
    var home = document.getElementById('view-home');
    if (home && home.classList.contains('active')) return 'home';
    return '';
  }

  function save() {
    var r = currentRoom();
    if (r) stamp(r);
  }

  function urlWants() {
    try {
      var u = new URL(window.location.href);
      if (u.searchParams.get('imin')) return 'home';
      if (u.searchParams.get('ask')) return '';
      if (u.searchParams.get('shared') || u.searchParams.get('add')) return 'events';
      var v = u.searchParams.get('view');
      if (v && ALLOW[v]) return v;
    } catch (e1) {}
    return null;
  }

  function go(room) {
    if (!ALLOW[room]) return;
    var btn = document.querySelector('.bottom-nav [data-view="' + room + '"], #nav-' + room + ', .nav-item[data-view="' + room + '"]');
    if (btn) btn.click();
  }

  function restore() {
    var want = urlWants();
    if (want === 'home') { paintLast('home'); return; }
    if (want === '') return;
    if (want) {
      paintLast(want);
      if (currentRoom() !== want) go(want);
      return;
    }
    var last = '';
    try { last = localStorage.getItem(KEY) || ''; } catch (e2) {}
    if (!ALLOW[last] || last === 'home') { paintLast('home'); return; }
    paintLast(last);
    var now = currentRoom();
    if (now === last) return;
    if (now && now !== 'home') return;
    go(last);
    requestAnimationFrame(function () {
      if (currentRoom() !== last) go(last);
    });
  }

  document.addEventListener('click', function (e) {
    var n = e.target && e.target.closest && e.target.closest('[data-view]');
    if (n) {
      var d = n.getAttribute('data-view') || '';
      if (ALLOW[d]) stamp(d);
    }
    setTimeout(save, 40);
  }, true);

  function watch() {
    var box = document.getElementById('views') || document.body;
    if (!box || !window.MutationObserver) return;
    new MutationObserver(save).observe(box, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { watch(); restore(); });
  } else {
    watch();
    restore();
  }
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) restore();
  });

  var startY = 0;
  var startX = 0;
  var armed = false;

  function otherView() {
    return document.querySelector('.view.active:not(#view-home)') ||
      document.querySelector('#view-brothers.active, #view-events.active, #view-about.active');
  }

  function navNotHome() {
    var a = document.querySelector('.bottom-nav [data-view].active, .nav-item[data-view].active');
    if (!a) return false;
    var v = a.getAttribute('data-view') || '';
    return v && v !== 'home';
  }

  function offHome() {
    if (document.body.classList.contains('tb-view-brothers') ||
        document.body.classList.contains('tb-view-events') ||
        document.body.classList.contains('tb-view-about')) return true;
    return !!otherView() || navNotHome();
  }

  function atTop() {
    var t = window.scrollY || window.pageYOffset || 0;
    var nodes = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById('app'),
      document.getElementById('views'),
      document.querySelector('.view.active'),
      document.getElementById('view-brothers'),
      document.getElementById('view-events'),
      document.getElementById('view-about')
    ];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] && typeof nodes[i].scrollTop === 'number' && nodes[i].scrollTop > t) t = nodes[i].scrollTop;
    }
    return t <= 0;
  }

  function inSheet(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(
      '.modal, #brother-detail, #info-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-modal, #thunder-panel, #axum-drop, #tb-tour, #auth-gate'
    );
  }

  document.addEventListener('touchstart', function (e) {
    armed = false;
    if (!e.touches || !e.touches[0]) return;
    if (!offHome() || inSheet(e.target)) return;
    startY = e.touches[0].clientY || 0;
    startX = e.touches[0].clientX || 0;
    armed = true;
  }, true);

  document.addEventListener('touchmove', function (e) {
    if (!armed || !e.touches || !e.touches[0]) return;
    if (!offHome() || inSheet(e.target)) { armed = false; return; }
    var y = e.touches[0].clientY || 0;
    var x = e.touches[0].clientX || 0;
    var dy = y - startY;
    var dx = x - startX;
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) { armed = false; return; }
    if (dy > 4 && atTop()) e.preventDefault();
  }, { capture: true, passive: false });

  document.addEventListener('touchend', function () { armed = false; }, true);
  document.addEventListener('touchcancel', function () { armed = false; }, true);
})();
