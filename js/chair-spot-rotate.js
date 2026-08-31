/* 20260831-chair-spot-rotate — ten patio-funny invites. New draw on each Brothers open. */
(function () {
  if (window.__tbChairSpotRotate) return;
  window.__tbChairSpotRotate = true;

  var LINES = [
    'This chair isn’t getting any warmer.',
    'Empty chairs can’t buy the next round.',
    'The ghost in this seat has terrible stories.',
    'Somebody sit down before Thunder starts talking.',
    'We’re one name short of a full table. Guess who.',
    'This seat has been judging you since you opened the app.',
    'Save a brother from sitting next to nobody.',
    'Thunder already saved you a plate. Sit down.',
    'The chair is doing cardio. Put it out of its misery.',
    'If this seat stays empty, we start assigning nicknames.'
  ];
  var LAST = 'tb_chair_spot_last';
  var chosen = null;
  var onBrothers = false;

  function pick() {
    var last = -1;
    try { last = parseInt(sessionStorage.getItem(LAST) || '-1', 10); } catch (e) {}
    if (isNaN(last)) last = -1;
    var i = Math.floor(Math.random() * LINES.length);
    if (LINES.length > 1 && i === last) i = (i + 1) % LINES.length;
    try { sessionStorage.setItem(LAST, String(i)); } catch (e2) {}
    chosen = LINES[i];
    return chosen;
  }

  function line() {
    if (!chosen) pick();
    return chosen;
  }

  function setSub(el) {
    if (!el) return;
    el.style.display = '';
    el.textContent = line();
  }

  function walk(root) {
    if (!root) return;
    root.setAttribute('aria-label', line());
    var sub = root.querySelector('.brother-slot-sub, .empty-brothers-sub, .brother-chair-sub');
    if (sub) setSub(sub);
  }

  function stamp() {
    walk(document.getElementById('brother-open-chair'));
    walk(document.getElementById('brother-slot-invite'));
    walk(document.getElementById('empty-brothers-cta'));
    var cards = document.querySelectorAll('#view-brothers .brother-card, #view-brothers .brother-chair, #brothers-grid button');
    for (var i = 0; i < cards.length; i++) {
      if (/open chair/i.test(cards[i].textContent || '') || /bring a brother/i.test(cards[i].textContent || '')) {
        walk(cards[i]);
      }
    }
  }

  function brothersOpen() {
    var v = document.getElementById('view-brothers');
    if (v && v.classList.contains('active')) return true;
    if (document.body.classList.contains('tb-view-brothers')) return true;
    return false;
  }

  function onOpen() {
    if (!brothersOpen()) {
      onBrothers = false;
      return;
    }
    if (onBrothers) {
      stamp();
      return;
    }
    onBrothers = true;
    pick();
    stamp();
  }

  onOpen();
  setTimeout(onOpen, 400);
  setTimeout(stamp, 900);

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-brothers');
    if (!n) return;
    var id = n.getAttribute('data-view') || n.id || '';
    if (id === 'brothers' || id === 'nav-brothers') {
      onBrothers = false;
      setTimeout(onOpen, 60);
    } else {
      onBrothers = false;
    }
  }, true);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && brothersOpen()) {
      onBrothers = false;
      onOpen();
    }
  });

  var grid = document.getElementById('brothers-grid');
  if (grid && grid.dataset.tbSpotRot !== '1') {
    grid.dataset.tbSpotRot = '1';
    new MutationObserver(function () { if (onBrothers) stamp(); }).observe(grid, { childList: true, subtree: true });
  }
})();
