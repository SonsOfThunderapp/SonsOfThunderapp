/* 20260831-breaker-pass
   Intelligence layer for the seven-space pour.
   No app.js. No Who's In. No charm pack. No video at boot. */
(function () {
  if (window.__tbBreakerPass) return;
  window.__tbBreakerPass = true;

  var POSTER = 'assets/current.jpg';

  function addCss(needle, href) {
    if (document.querySelector('link[href*="' + needle + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    (document.head || document.documentElement).appendChild(l);
  }
  function addJs(needle, src) {
    if (document.querySelector('script[src*="' + needle + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }

  addCss('breaker-pass.css', 'css/breaker-pass.css');

  /* Reliability siblings — no-ops if already injected. */
  addJs('tb-sb-one.js', 'js/tb-sb-one.js');
  addJs('attendance.js', 'js/attendance.js');
  addJs('members-one.js', 'js/members-one.js');
  addJs('founder-ping.js', 'js/founder-ping.js');

  function seated() {
    if (document.body && document.body.classList.contains('tb-seated')) return true;
    try {
      if (localStorage.getItem('tb-seated') === '1' || localStorage.getItem('tb_seated') === '1') return true;
    } catch (e0) {}
    try {
      if (localStorage.getItem('myProfileId') || localStorage.getItem('tb_myProfileId')) return true;
    } catch (e1) {}
    return false;
  }

  function hide(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.style.setProperty('display', 'none', 'important');
  }

  /* 1 Core UX — first minute. */
  function firstMinute() {
    hide('home-a2hs');
    hide('home-member-cta');
    hide('axum-chip');
    hide('last-fire');
    hide('admin-lastfire-btn');
    hide('tb-text-leader-brothers');
    document.querySelectorAll('.bottom-nav .nav-new-dot, .nav-item .nav-new-dot').forEach(function (d) {
      try { d.remove(); } catch (e) { d.style.display = 'none'; }
    });
  }

  /* 6 Visual — film tile uses the real still. */
  function paintFilm() {
    var pic = document.querySelector('#tb-month-film .tb-month-film-pic');
    if (pic && (!pic.style.backgroundImage || /bolt|icon-official|logo-bolt/i.test(pic.style.backgroundImage))) {
      pic.style.backgroundImage = "url('" + POSTER + "')";
    }
    document.querySelectorAll('#tb-home-film-tile img, #home-film img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (!src || /bolt|icon-official|logo-bolt|data:image/i.test(src)) {
        img.src = POSTER;
        img.style.objectFit = 'cover';
        img.style.padding = '0';
      }
    });
    var tile = document.getElementById('tb-month-film') ||
      document.getElementById('tb-home-film-tile') ||
      document.getElementById('home-film');
    if (tile && !tile.querySelector('.tb-film-play')) {
      var play = document.createElement('span');
      play.className = 'tb-film-play';
      play.setAttribute('aria-hidden', 'true');
      tile.appendChild(play);
    }
    if (tile && !document.getElementById('tb-film-cue')) {
      var cue = document.createElement('div');
      cue.id = 'tb-film-cue';
      cue.textContent = 'TAP TO WATCH';
      if (tile.parentNode) tile.parentNode.insertBefore(cue, tile.nextSibling);
    }
  }

  /* 4 Error — one note. Never a blank freeze. */
  function note(msg) {
    var el = document.getElementById('tb-breaker-note');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tb-breaker-note';
      el.setAttribute('role', 'status');
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(note._t);
    note._t = setTimeout(function () { el.classList.add('hidden'); }, 4200);
  }
  window.tbBreakerNote = note;

  /* 1 Honesty — guest mark is this phone. Seated mark is a row. Never N IN. */
  function dressRsvp() {
    var btn = document.getElementById('rsvp-btn');
    var status = document.getElementById('rsvp-status');
    if (!btn || !btn.classList.contains('confirmed')) return;
    if (!status) return;
    var text = seated()
      ? "⚡ YOU'RE IN"
      : "⚡ YOU'RE IN · this phone";
    if (status.textContent !== text) status.textContent = text;
    status.classList.remove('hidden');
  }

  /* 5 + 2 — seated write. Guest stays local. Double-tap uses attendance inflight. */
  var lastLock = 0;
  function afterLock() {
    var now = Date.now();
    if (now - lastLock < 900) return;
    lastLock = now;
    dressRsvp();
    placePing();
    if (!seated()) return;
    var att = window.tbAttendance;
    if (!att || typeof att.lock !== 'function') return;
    Promise.resolve(att.lock()).then(function (ok) {
      if (ok === false) {
        note("Couldn't reach the room. Your mark is still on this phone. Try again.");
      } else {
        dressRsvp();
      }
    }).catch(function () {
      note("Couldn't reach the room. Your mark is still on this phone. Try again.");
    });
  }

  /* 5 Return — GET THE PING under LOCKED IN. Same alerts toggle. Not default-on. */
  function placePing() {
    var card = document.querySelector('#view-home .next-meeting');
    var btn = document.getElementById('rsvp-btn');
    if (!card || !btn) return;
    var el = document.getElementById('tb-home-ping');
    if (!el) {
      el = document.createElement('button');
      el.type = 'button';
      el.id = 'tb-home-ping';
      var after = document.getElementById('rsvp-add-cal') || document.getElementById('rsvp-status');
      if (after && after.parentNode) after.parentNode.insertBefore(el, after.nextSibling);
      else card.appendChild(el);
      el.addEventListener('click', function () {
        if (el.classList.contains('is-on')) return;
        var tog = document.getElementById('gathering-alerts-toggle');
        if (tog) {
          tog.checked = true;
          tog.dispatchEvent(new Event('change', { bubbles: true }));
        }
        try { localStorage.setItem('tb_gatheringAlertsOn', 'true'); } catch (e) {}
        el.textContent = 'PING ON';
        el.classList.add('is-on');
      });
    }
    if (!btn.classList.contains('confirmed')) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    var on = false;
    try {
      on = localStorage.getItem('tb_gatheringAlertsOn') === 'true' ||
        localStorage.getItem('gatheringAlertsOn') === 'true';
    } catch (e2) {}
    if (on || el.classList.contains('is-on')) {
      el.textContent = 'PING ON';
      el.classList.add('is-on');
    } else {
      el.textContent = 'GET THE PING';
      el.classList.remove('is-on');
    }
  }

  /* 1 — TEXT A LEADER at the bottom of Memories. */
  function placeLeader() {
    var btn = document.getElementById('text-leader-btn');
    var box = document.querySelector('#view-events .container');
    if (!btn || !box) return;
    btn.textContent = 'TEXT A LEADER';
    var noteEl = document.getElementById('events-note');
    if (noteEl && noteEl.parentNode === box) {
      if (btn.previousElementSibling !== noteEl) noteEl.insertAdjacentElement('afterend', btn);
    } else if (box.lastElementChild !== btn) {
      box.appendChild(btn);
    }
  }

  /* 4 — empty chair ghost. One locked line. Not a rotator. */
  function chairLine() {
    var roots = [
      document.getElementById('brother-open-chair'),
      document.getElementById('brother-slot-invite'),
      document.getElementById('empty-brothers-cta')
    ];
    document.querySelectorAll('#brothers-grid .brother-card, #brothers-grid .brother-chair').forEach(function (n) {
      roots.push(n);
    });
    roots.forEach(function (root) {
      if (!root) return;
      var raw = String(root.textContent || '');
      if (!/bring a brother|open chair|this seat is yours|claim your spot/i.test(raw)) return;
      var nodes = root.querySelectorAll('div, span, p, strong, em');
      for (var i = 0; i < nodes.length; i++) {
        var t = String(nodes[i].textContent || '').replace(/\s+/g, ' ').trim();
        if (/^bring a brother\.?$/i.test(t) || /^this seat is yours\.?$/i.test(t)) {
          nodes[i].textContent = 'Claim your spot';
        }
      }
    });
  }

  /* 4 — empty Memories keeps the locked sentence. No charm wheel. */
  function memoriesEmpty() {
    var sub = document.querySelector('.empty-memories-sub');
    if (!sub) return;
    var t = String(sub.textContent || '').trim();
    if (!t) sub.textContent = 'The room gets real when somebody leaves proof.';
  }

  function boot() {
    firstMinute();
    paintFilm();
    dressRsvp();
    placePing();
    placeLeader();
    chairLine();
    memoriesEmpty();
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#rsvp-btn');
    if (t) setTimeout(afterLock, 240);
    var nav = e.target && e.target.closest && e.target.closest('.nav-item, .bottom-nav button');
    if (nav) {
      setTimeout(function () {
        firstMinute();
        placeLeader();
        chairLine();
        memoriesEmpty();
      }, 80);
    }
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
