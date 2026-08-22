/* More page: hide the Leadership button. Seven taps on the bolt
   above Gathering Alerts opens chair tools. Live app.js is chair-account
   only — btn.click() may no-op if not signed in. After 7 taps, reveal
   existing #leader-tools / .admin-zone if no modal appears.
   20260822-flowfix1: pointerdown+click on bolt and img; no preventDefault;
   retry bind until bolt exists. */
(function () {
  var NEED = 7;
  var GAP_MS = 1600;
  var taps = 0;
  var last = 0;
  var lastEvent = 0;
  var bound = false;

  function hideButton() {
    var btn = document.getElementById('leader-unlock-btn');
    if (!btn) return;
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
  }

  function toolsVisible() {
    var tools = document.getElementById('leader-tools');
    if (tools && !tools.classList.contains('hidden') && !tools.hidden) return true;
    var modal = document.querySelector('.modal:not(.hidden)');
    if (modal && /admin|leader/i.test(modal.id || '')) return true;
    return false;
  }

  function revealTools() {
    var zone = document.querySelector('.admin-zone');
    if (zone) {
      zone.classList.remove('hidden');
      zone.removeAttribute('hidden');
      zone.style.display = '';
    }
    var tools = document.getElementById('leader-tools');
    if (tools) {
      tools.classList.remove('hidden');
      tools.removeAttribute('hidden');
      tools.setAttribute('aria-hidden', 'false');
      tools.style.display = '';
    }
  }

  function openDoor() {
    var btn = document.getElementById('leader-unlock-btn');
    if (btn) {
      try {
        btn.hidden = false;
        btn.style.display = 'none';
        btn.click();
        btn.hidden = true;
      } catch (e) {}
    }
    setTimeout(function () {
      if (!toolsVisible()) revealTools();
    }, 60);
  }

  function onTap(e) {
    var now = Date.now();
    if (now - lastEvent < 280) return;
    lastEvent = now;
    if (now - last > GAP_MS) taps = 0;
    last = now;
    taps += 1;
    if (taps < NEED) return;
    taps = 0;
    openDoor();
  }

  function decorate(el) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.style.webkitUserSelect = 'none';
    el.style.userSelect = 'none';
    el.style.touchAction = 'manipulation';
    el.style.pointerEvents = 'auto';
    if (el.getAttribute('aria-hidden') === 'true') el.removeAttribute('aria-hidden');
  }

  function listen(el) {
    if (!el || el.getAttribute('data-tb-door') === '1') return;
    el.setAttribute('data-tb-door', '1');
    decorate(el);
    el.addEventListener('pointerdown', onTap);
    el.addEventListener('click', onTap);
    el.addEventListener('touchend', onTap, { passive: true });
  }

  function bind() {
    hideButton();
    var bolt = document.querySelector('#view-about .about-bolt-break') ||
      document.querySelector('.about-bolt-break');
    if (!bolt) return false;
    decorate(bolt);
    bolt.setAttribute('role', 'button');
    bolt.setAttribute('aria-label', 'Sons of Thunder');
    listen(bolt);
    var img = bolt.querySelector('img') || document.querySelector('#view-about .about-bolt-glow');
    if (img) listen(img);
    bound = true;
    return true;
  }

  function boot() {
    try { bind(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  var n = 0;
  var iv = setInterval(function () {
    n += 1;
    boot();
    if (bound && n > 8) clearInterval(iv);
    if (n > 40) clearInterval(iv);
  }, 500);
})();
