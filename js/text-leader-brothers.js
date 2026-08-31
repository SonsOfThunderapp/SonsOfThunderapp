/* TEXT A LEADER = last line on Brothers. Never a float. Never Home / More / Memories. */
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
    var box = document.querySelector('#view-brothers .container');
    if (!btn || !box) return;
    btn.textContent = 'TEXT A LEADER';
    btn.setAttribute('aria-label', 'Text a leader');
    if (btn.parentNode !== box || box.lastElementChild !== btn) {
      box.appendChild(btn);
    }
  }

  function boot() {
    place();
    setInterval(place, 1600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  if (!document.querySelector('script[src*="hq-card.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/hq-card.js';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
})();
