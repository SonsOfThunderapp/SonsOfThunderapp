/* 20260830-was-there — stamp on the open still. Presence, not a like. Local only. */
(function () {
  if (window.__tbWasThere) return;
  window.__tbWasThere = true;

  var KEY = 'tb_was_there';
  var BTN = 'tb-was-btn';
  var STAMP = 'tb-was-stamp';

  function seated() {
    try {
      if (document.body.classList.contains('tb-seated')) return true;
      if (localStorage.getItem('tb_seat_locked')) return true;
    } catch (e) {}
    return false;
  }

  function book() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function save(map) {
    try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {}
  }

  function srcOf() {
    var v = document.getElementById('memory-viewer');
    return (v && v.dataset.tbMemSrc) || '';
  }

  function marked(src) {
    var map = book();
    return !!(src && map[src]);
  }

  function hit() {
    try {
      if (window.tbFeedback && window.tbFeedback.confirm) window.tbFeedback.confirm();
      else if (navigator.vibrate) navigator.vibrate(24);
    } catch (e) {}
  }

  function openSeat() {
    var entry = document.getElementById('auth-entry-btn');
    if (entry) { entry.click(); return; }
    var gate = document.getElementById('auth-gate');
    if (gate) {
      gate.classList.remove('hidden');
      gate.setAttribute('aria-hidden', 'false');
    }
  }

  function paint() {
    var viewer = document.getElementById('memory-viewer');
    if (!viewer || viewer.classList.contains('hidden')) return;
    var src = srcOf();
    var on = marked(src);
    var btn = document.getElementById(BTN);
    var stamp = document.getElementById(STAMP);
    if (btn) {
      btn.textContent = !seated() ? 'TAKE YOUR SEAT' : (on ? 'YOU WERE THERE' : 'I WAS THERE');
      btn.classList.toggle('is-locked', on && seated());
    }
    if (stamp) stamp.classList.toggle('is-on', on);
  }

  function mount() {
    var viewer = document.getElementById('memory-viewer');
    if (!viewer) return;
    if (!document.getElementById(STAMP)) {
      var s = document.createElement('div');
      s.id = STAMP;
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = '<img src="assets/logo-bolt-isolated.png" alt="">';
      var stage = document.getElementById('memory-viewer-stage') || viewer;
      stage.appendChild(s);
    }
    if (!document.getElementById(BTN)) {
      var b = document.createElement('button');
      b.type = 'button';
      b.id = BTN;
      b.textContent = 'I WAS THERE';
      viewer.appendChild(b);
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!seated()) { openSeat(); return; }
        var src = srcOf();
        if (!src) return;
        var map = book();
        if (map[src]) return;
        map[src] = 1;
        save(map);
        var stamp = document.getElementById(STAMP);
        if (stamp) {
          stamp.classList.remove('is-on');
          void stamp.offsetWidth;
          stamp.classList.add('is-on', 'is-slam');
        }
        hit();
        paint();
      });
    }
    paint();
  }

  var prev = window.tbOpenMem;
  window.tbOpenMem = function (src) {
    if (typeof prev === 'function') prev(src);
    mount();
    paint();
  };

  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('#memory-viewer-close')) {
      var stamp = document.getElementById(STAMP);
      if (stamp) stamp.classList.remove('is-slam');
    }
  }, true);

  if (!document.querySelector('link[href*="was-there.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/was-there.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
