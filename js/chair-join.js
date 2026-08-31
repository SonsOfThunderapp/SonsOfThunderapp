/* 20260831-chair-join — empty chair invites the man holding the phone. */
(function () {
  if (window.__tbChairJoin) return;
  window.__tbChairJoin = true;

  var TITLE = 'YOUR CHAIR';
  var SUB = 'This seat is yours.';

  function walk(root) {
    if (!root) return;
    root.setAttribute('aria-label', 'Take your seat');
    var title = root.querySelector('.brother-chair-title, .brother-slot-title, .empty-brothers-title, .brother-name');
    var sub = root.querySelector('.brother-slot-sub, .empty-brothers-sub, .brother-bio, .brother-chair-sub');
    if (title) title.textContent = TITLE;
    if (sub) {
      sub.textContent = SUB;
      sub.innerHTML = SUB;
    }
    var nodes = root.querySelectorAll('div, span, p, strong, em');
    for (var i = 0; i < nodes.length; i++) {
      var t = String(nodes[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (/^open chair$/i.test(t) || /^bring a brother$/i.test(t) || /^bring a brother\.?$/i.test(t)) {
        if (/open chair/i.test(t)) nodes[i].textContent = TITLE;
        else nodes[i].textContent = SUB;
      }
    }
  }

  function stamp() {
    walk(document.getElementById('brother-open-chair'));
    walk(document.getElementById('brother-slot-invite'));
    walk(document.getElementById('empty-brothers-cta'));
    var cards = document.querySelectorAll('#view-brothers .brother-card, #view-brothers .brother-chair, #brothers-grid button');
    for (var i = 0; i < cards.length; i++) {
      var raw = String(cards[i].textContent || '');
      if (/bring a brother/i.test(raw) || /open chair/i.test(raw)) walk(cards[i]);
    }
  }

  stamp();
  setTimeout(stamp, 400);
  setTimeout(stamp, 1400);

  var grid = document.getElementById('brothers-grid');
  if (grid && grid.dataset.tbChairJoin !== '1') {
    grid.dataset.tbChairJoin = '1';
    new MutationObserver(function () { stamp(); }).observe(grid, { childList: true, subtree: true });
  }

  if (!document.querySelector('link[href*="chair-join.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/chair-join.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
