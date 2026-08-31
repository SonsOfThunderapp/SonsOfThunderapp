/* Open chair = YOU take the seat. Not bring-a-buddy. Survives renderBrothers. */
(function () {
  if (window.__tbChairYours) return;
  window.__tbChairYours = true;

  var TITLE = 'YOUR CHAIR';
  var SUB = 'This seat is yours.<br>Lock a profile. Be in the room.';

  function setText(el, html, text) {
    if (!el) return;
    if (html) el.innerHTML = html;
    else el.textContent = text;
  }

  function stampOne(root) {
    if (!root) return;
    root.setAttribute('aria-label', 'Lock your profile');
    var title = root.querySelector('.brother-chair-title, .brother-slot-title, .empty-brothers-title');
    var sub = root.querySelector('.brother-slot-sub, .empty-brothers-sub');
    if (title) title.textContent = TITLE;
    if (sub) sub.innerHTML = SUB;
    var raw = String(root.textContent || '');
    if (/bring a brother/i.test(raw) && title) title.textContent = TITLE;
  }

  function stamp() {
    stampOne(document.getElementById('brother-open-chair'));
    stampOne(document.getElementById('brother-slot-invite'));
    stampOne(document.getElementById('empty-brothers-cta'));
    document.querySelectorAll('#view-brothers .brother-card, #view-brothers .empty-brothers-cta').forEach(function (card) {
      if (/bring a brother/i.test(card.textContent || '')) stampOne(card);
    });
  }

  function bind() {
    stamp();
    var grid = document.getElementById('brothers-grid');
    if (grid && grid.dataset.tbChairYours !== '1') {
      grid.dataset.tbChairYours = '1';
      new MutationObserver(stamp).observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 400);
  setTimeout(stamp, 1200);

  if (!document.querySelector('script[src*="chair-join.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/chair-join.js';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
})();
