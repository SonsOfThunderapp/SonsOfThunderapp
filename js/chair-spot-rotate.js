/* 20260831-chair-spot-rotate — kill Bring a brother. Ten jokes on that gold line. */
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
  var GHOST = /^(bring a brother\.?|claim your spot\.?|this seat is yours\.?|tap to add your profile\.?)$/i;
  var chosen = null;
  var onBrothers = false;
  var writing = false;

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

  function ownText(el) {
    if (!el || !el.childNodes) return '';
    var s = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) s += el.childNodes[i].nodeValue;
    }
    return s.replace(/\s+/g, ' ').trim();
  }

  function skip(el) {
    if (!el || !el.closest) return true;
    if (el.id === 'tb-chair-line' || el.closest('#tb-chair-line')) return true;
    if (el.id === 'brothers-section-title') return true;
    return false;
  }

  function paint(el) {
    if (!el || skip(el)) return;
    writing = true;
    el.textContent = line();
    el.style.display = '';
    el.setAttribute('data-tb-spot', line());
    writing = false;
  }

  function stamp() {
    var chair = document.getElementById('brother-open-chair');
    if (chair) {
      var sub = chair.querySelector('.brother-slot-sub, .empty-brothers-sub, .brother-chair-sub');
      if (sub) paint(sub);
    }
    var root = document.getElementById('view-brothers');
    if (!root) return;
    var nodes = root.querySelectorAll('div, span, p, strong, em, button, h2, h3');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (skip(el)) continue;
      var own = ownText(el);
      if (GHOST.test(own)) {
        paint(el);
        continue;
      }
      if (/^open chair$/i.test(own)) continue;
      if (el.matches && el.matches('.brother-slot-sub, .empty-brothers-sub, .brother-chair-sub')) {
        var card = el.closest('.brother-card, .brother-chair, button, #brother-open-chair, #brother-slot-invite, #empty-brothers-cta');
        if (card && /open chair|bring a brother/i.test(card.textContent || '')) paint(el);
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
  setTimeout(onOpen, 200);
  setTimeout(stamp, 600);
  setTimeout(stamp, 1400);
  setTimeout(stamp, 2400);

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-brothers');
    if (!n) return;
    var id = n.getAttribute('data-view') || n.id || '';
    if (id === 'brothers' || id === 'nav-brothers') {
      onBrothers = false;
      setTimeout(onOpen, 40);
    } else {
      onBrothers = false;
    }
  }, true);

  var view = document.getElementById('view-brothers');
  if (view && view.dataset.tbSpotRot !== '1') {
    view.dataset.tbSpotRot = '1';
    new MutationObserver(function () {
      if (writing) return;
      if (onBrothers || brothersOpen()) stamp();
    }).observe(view, { childList: true, subtree: true, characterData: true });
  }
})();
