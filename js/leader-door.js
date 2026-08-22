/* More page: hide the Leadership button. Seven taps on the bolt
   above Gathering Alerts opens the same chair tools (PIN still asked). */
(function () {
  var NEED = 7;
  var GAP_MS = 1600;
  var taps = 0;
  var last = 0;
  var bound = false;

  function hideButton() {
    var btn = document.getElementById('leader-unlock-btn');
    if (!btn) return;
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
  }

  function openDoor() {
    var btn = document.getElementById('leader-unlock-btn');
    if (btn) {
      btn.hidden = false;
      btn.style.display = 'none';
      btn.click();
      btn.hidden = true;
    }
  }

  function onTap(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var now = Date.now();
    if (now - last > GAP_MS) taps = 0;
    last = now;
    taps += 1;
    if (taps < NEED) return;
    taps = 0;
    openDoor();
  }

  function bind() {
    hideButton();
    if (bound) return;
    var bolt = document.querySelector('#view-about .about-bolt-break') ||
      document.querySelector('.about-bolt-break');
    if (!bolt) return;
    bound = true;
    bolt.style.cursor = 'pointer';
    bolt.style.webkitUserSelect = 'none';
    bolt.style.userSelect = 'none';
    bolt.style.touchAction = 'manipulation';
    bolt.removeAttribute('aria-hidden');
    bolt.setAttribute('role', 'button');
    bolt.setAttribute('aria-label', 'Sons of Thunder');
    bolt.addEventListener('click', onTap, { passive: false });
  }

  function boot() {
    try { bind(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
})();
