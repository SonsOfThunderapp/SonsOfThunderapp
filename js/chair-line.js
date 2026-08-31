/* 20260830-chair-line
   Your chair is open. Fill it so a brother knows who is standing next to him.
   Hide once a seat is locked. Empty tile already invites. */
(function () {
  if (window.__tbChairLine) return;
  window.__tbChairLine = true;

  function seated() {
    var bar = document.getElementById('auth-session-bar');
    if (bar && !bar.classList.contains('hidden')) return true;
    try {
      if (window.localStorage && localStorage.getItem('tb_seat_locked')) return true;
    } catch (e) {}
    if (document.body.classList.contains('tb-seated') || document.body.classList.contains('tb-authed')) return true;
    return false;
  }

  function place() {
    var h = document.getElementById('brothers-section-title');
    if (!h) return;
    var p = document.getElementById('tb-chair-line');
    if (seated()) {
      if (p) p.style.display = 'none';
      return;
    }
    if (p) {
      p.style.display = '';
      return;
    }
    p = document.createElement('p');
    p.id = 'tb-chair-line';
    p.textContent = 'Your chair is open. Fill it so a brother knows who is standing next to him.';
    if (h.parentNode) h.parentNode.insertBefore(p, h.nextSibling);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-brothers');
    if (!n) return;
    var v = n.getAttribute('data-view') || n.id || '';
    if (v === 'brothers' || v === 'nav-brothers') place();
  }, true);

  if (!document.querySelector('script[src*="chair-rotate.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/chair-rotate.js';
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
  if (!document.querySelector('script[src*="chair-spot-rotate.js"]')) {
    var r = document.createElement('script');
    r.src = 'js/chair-spot-rotate.js';
    r.defer = true;
    (document.body || document.documentElement).appendChild(r);
  }
})();
