/* 20260830-recon-90 — first minute + TEXT A LEADER on Memories. No interval. */
(function () {
  if (window.__tbRecon90) return;
  window.__tbRecon90 = true;

  function hideHomeJobs() {
    ['home-a2hs', 'home-member-cta'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('hidden');
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function buryFloat() {
    var g = document.getElementById('tb-text-leader-brothers');
    if (g) {
      try { g.remove(); } catch (e) {}
    }
  }

  function placeLeader() {
    buryFloat();
    var btn = document.getElementById('text-leader-btn');
    var box = document.querySelector('#view-events .container');
    if (!btn || !box) return;
    btn.textContent = 'TEXT A LEADER';
    var note = document.getElementById('events-note');
    if (note && note.parentNode === box) {
      if (btn.previousElementSibling !== note) note.insertAdjacentElement('afterend', btn);
    } else if (box.lastElementChild !== btn) {
      box.appendChild(btn);
    }
    var dup = document.getElementById('memories-text-leader');
    if (dup && dup !== btn) {
      try { dup.remove(); } catch (e2) {}
    }
  }

  hideHomeJobs();
  placeLeader();
  setTimeout(hideHomeJobs, 400);
  setTimeout(placeLeader, 400);

  if (!document.querySelector('script[src*="thunder-type.js"]')) {
    var t = document.createElement('script');
    t.src = 'js/thunder-type.js';
    t.defer = true;
    (document.body || document.documentElement).appendChild(t);
  }
  if (!document.querySelector('link[href*="recon-90.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/recon-90.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
