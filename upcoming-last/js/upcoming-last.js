/* 20260831-upcoming-last — rack Upcoming + TEXT A LEADER after the wall. */
(function () {
  if (window.__tbUpcomingLast) return;
  window.__tbUpcomingLast = true;

  function rack() {
    var box = document.querySelector('#view-events .container');
    var mem = document.getElementById('memories-block');
    if (!box || !mem) return;
    var title = document.getElementById('events-section-title');
    var note = document.getElementById('events-note');
    var list = document.getElementById('upcoming-events');
    var btn = document.getElementById('text-leader-btn');
    var after = mem;
    [title, note, list, btn].forEach(function (el) {
      if (!el) return;
      if (el.parentNode !== box) box.appendChild(el);
      if (after.nextElementSibling !== el) after.insertAdjacentElement('afterend', el);
      after = el;
    });
    if (btn) btn.textContent = 'TEXT A LEADER';
    var dup = document.getElementById('memories-text-leader');
    if (dup && dup !== btn) {
      try { dup.remove(); } catch (e) {}
    }
  }

  rack();
  setTimeout(rack, 400);
  setTimeout(rack, 1400);

  if (!document.querySelector('link[href*="upcoming-last.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/upcoming-last.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
