/* TEXT A LEADER = under the hobby note on Memories. Float stays dead. */
(function () {
  var FLOAT_ID = 'tb-text-leader-brothers';

  function buryFloat() {
    var ghost = document.getElementById(FLOAT_ID);
    if (!ghost) return;
    ghost.setAttribute('data-on', '0');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.setProperty('display', 'none', 'important');
    try { ghost.remove(); } catch (e0) {}
  }

  function place() {
    buryFloat();
    var btn = document.getElementById('text-leader-btn');
    var box = document.querySelector('#view-events .container');
    if (!btn || !box) return;
    btn.textContent = 'TEXT A LEADER';
    btn.setAttribute('aria-label', 'Text a leader');
    var note = document.getElementById('events-note');
    if (note && note.parentNode === box) {
      if (btn.previousElementSibling !== note) note.insertAdjacentElement('afterend', btn);
    } else if (box.lastElementChild !== btn) {
      box.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();
  setTimeout(place, 400);

  if (!document.querySelector('script[src*="text-leader-mem.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/text-leader-mem.js';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
})();
