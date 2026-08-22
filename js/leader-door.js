/* More page: hide the Leadership button. Seven taps on the bolt
   above Gathering Alerts opens the existing chair tools panel.
   Live app.js is chair-account only (requireLeader / refreshChairMode).
   After 7 taps, keep #leader-tools / .admin-zone visible via session
   flag tb_leaderDoor=1, MutationObserver, and a short re-apply timer.
   20260822-lead7c */
(function () {
  var NEED = 7;
  var GAP_MS = 4000;
  var FLAG = 'tb_leaderDoor';
  var taps = 0;
  var last = 0;
  var lastEvent = 0;
  var bound = false;
  var keepIv = null;

  function doorOn() {
    try { return sessionStorage.getItem(FLAG) === '1'; } catch (e) {
      return window.__tbLeaderDoor === 1;
    }
  }

  function setDoor() {
    try { sessionStorage.setItem(FLAG, '1'); } catch (e) {
      window.__tbLeaderDoor = 1;
    }
  }

  function hideButton() {
    var btn = document.getElementById('leader-unlock-btn');
    if (!btn) return;
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
  }

  function showEl(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.hidden = false;
    el.setAttribute('aria-hidden', 'false');
    el.style.setProperty('display', 'block', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
  }

  function findPinField() {
    return document.querySelector(
      '#leader-pin, #leader-pin-input, #pin-input, input[name="leader-pin"], input[id*="leader-pin"]'
    );
  }

  function wireExistingPin(input) {
    if (!input || input.getAttribute('data-tb-pinwire') === '1') return;
    input.setAttribute('data-tb-pinwire', '1');
    function go() {
      var btn = document.getElementById('leader-unlock-btn');
      if (!btn) return;
      try {
        btn.hidden = false;
        btn.style.display = 'none';
        btn.click();
        btn.hidden = true;
      } catch (e) {}
    }
    var form = input.form || input.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        go();
      });
    }
    var nearby = input.parentNode && input.parentNode.querySelector('button');
    if (nearby) {
      nearby.addEventListener('click', function (e) {
        e.preventDefault();
        go();
      });
    }
  }

  function toolsHaveControls() {
    var tools = document.getElementById('leader-tools');
    return !!(tools && tools.querySelector('button, a, input'));
  }

  function ensureOverlay() {
    if (document.getElementById('tb-chair-door')) return;
    var box = document.createElement('div');
    box.id = 'tb-chair-door';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Chair tools');
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:88px;z-index:9999;background:#111;color:#f4f0e6;border:1px solid #c8a44e;padding:14px 16px;border-radius:10px;font:15px/1.4 system-ui,sans-serif;';
    var title = document.createElement('div');
    title.textContent = 'Chair tools';
    title.style.cssText = 'font-weight:700;margin-bottom:8px;';
    box.appendChild(title);
    var acts = document.createElement('div');
    box.appendChild(acts);
    function addIfExists(sel, label) {
      var src = document.querySelector(sel);
      if (!src) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = 'display:block;width:100%;margin:8px 0 0;padding:10px;background:#1a1a1a;color:#f4f0e6;border:1px solid #c8a44e;';
      b.addEventListener('click', function () { try { src.click(); } catch (e) {} });
      acts.appendChild(b);
    }
    addIfExists('#refresh-app-btn, #leader-refresh-btn, #admin-refresh-btn', 'REFRESH');
    addIfExists('#ping-btn, #leader-ping-btn, #admin-ping-btn', 'PING');
    document.body.appendChild(box);
  }

  function applyDoor() {
    if (!doorOn()) return;
    hideButton();
    showEl(document.querySelector('.admin-zone'));
    showEl(document.getElementById('leader-tools'));
    var pin = findPinField();
    if (pin) {
      showEl(pin);
      showEl(pin.closest('form, .modal, .admin-zone, div'));
      wireExistingPin(pin);
    }
    if (!toolsHaveControls()) ensureOverlay();
  }

  function startKeep() {
    if (!keepIv) keepIv = setInterval(applyDoor, 350);
    if (window.__tbLeaderDoorObs || !document.body) return;
    try {
      var obs = new MutationObserver(function () { applyDoor(); });
      obs.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'hidden', 'style', 'aria-hidden']
      });
      window.__tbLeaderDoorObs = obs;
    } catch (e) {}
  }

  function openDoor() {
    setDoor();
    applyDoor();
    startKeep();
    var tools = document.getElementById('leader-tools');
    if (tools && tools.scrollIntoView) {
      try { tools.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {
        try { tools.scrollIntoView(true); } catch (e2) {}
      }
    }
  }

  function onTap() {
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
    try {
      bind();
      if (doorOn()) openDoor();
    } catch (e) {}
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
