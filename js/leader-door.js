(function(){
  var NAMES=['home','brothers','events','about'];
  function show(name,btn){
    if(NAMES.indexOf(name)<0) return;
    ['home','brothers','events','about'].forEach(function(n){
      var p=document.getElementById('view-'+n);
      if(!p) return;
      var on=n===name;
      p.classList.toggle('active', on);
      p.style.setProperty('display', on?'block':'none', 'important');
      p.style.setProperty('visibility', on?'visible':'hidden', 'important');
    });
    document.querySelectorAll('nav.bottom-nav button, .nav-item').forEach(function(b){
      b.classList.toggle('active', b===btn || b.getAttribute('data-view')===name);
    });
  }
  function bind(){
    var btns=document.querySelectorAll('nav.bottom-nav button');
    btns.forEach(function(btn,i){
      if(btn.getAttribute('data-tb-nav')==='1') return;
      btn.setAttribute('data-tb-nav','1');
      var name=btn.getAttribute('data-view')||NAMES[i];
      function go(e){ if(e){ e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); } show(name,btn); }
      btn.addEventListener('pointerdown', go, true);
      btn.addEventListener('click', go, true);
      btn.onclick=go;
    });
  }
  bind();
  setTimeout(bind,500);
  setTimeout(bind,2000);
})();

/* More: the glowing O under The Code is the chair door. One tap, four boxes. */
(function () {
  var FLAG = 'tb_chair_pin';
  var CODE = '1121';
  var bound = false;

  function pinOn() {
    try { return sessionStorage.getItem(FLAG) === '1'; } catch (e) { return window.__tbChairPin === 1; }
  }
  function setPinOn() {
    try { sessionStorage.setItem(FLAG, '1'); } catch (e) {}
    try { window.__tbChairPin = 1; } catch (eW) {}
    try { document.dispatchEvent(new Event('tb-chair-open')); } catch (e2) {}
  }
  function setPinOff() {
    try { sessionStorage.removeItem(FLAG); } catch (e) {}
    try { window.__tbChairPin = 0; } catch (eW) {}
  }

  function hideButton() {
    var btn = document.getElementById('leader-unlock-btn');
    if (!btn) return;
    btn.hidden = true;
    btn.style.setProperty('display', 'none', 'important');
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
  }

  function openModal(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function showTools() {
    var zone = document.querySelector('.admin-zone');
    var tools = document.getElementById('leader-tools');
    if (zone) {
      zone.classList.remove('hidden');
      zone.hidden = false;
      zone.style.setProperty('display', 'block', 'important');
    }
    if (tools) {
      tools.classList.remove('hidden');
      tools.hidden = false;
      tools.style.setProperty('display', 'block', 'important');
    }
    hideButton();
    try { document.dispatchEvent(new Event('tb-chair-open')); } catch (e3) {}
  }

  function hideTools() {
    var tools = document.getElementById('leader-tools');
    if (tools) {
      tools.classList.add('hidden');
      tools.style.removeProperty('display');
    }
    hideButton();
  }

  function bindEditOpens() {
    if (window.__tbChairOpens) return;
    window.__tbChairOpens = 1;
    document.addEventListener('click', function (e) {
      if (!pinOn()) return;
      var t = e.target;
      if (!t) return;
      var id = t.id || '';
      if (!id && t.closest) {
        var b = t.closest('button');
        if (b) id = b.id || '';
      }
      var map = {
        'admin-announcements-btn': 'admin-ann-modal',
        'admin-events-btn': 'admin-events-modal',
        'admin-code-btn': 'admin-code-modal',
        'admin-room-btn': 'admin-room-modal'
      };
      if (!map[id]) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openModal(map[id]);
    }, true);
    document.addEventListener('click', function (e) {
      if (!pinOn()) return;
      var t = e.target;
      var id = t && t.id;
      if (id !== 'admin-lastfire-btn') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var current = '';
      try {
        var lf = JSON.parse(localStorage.getItem('tb_lastFire') || 'null');
        current = (lf && lf.caption) || '';
      } catch (err) {}
      var cap = window.prompt('LAST FIRE — one line worth remembering (empty clears):', current);
      if (cap === null) return;
      var trimmed = String(cap).trim();
      try {
        if (!trimmed) localStorage.removeItem('tb_lastFire');
        else localStorage.setItem('tb_lastFire', JSON.stringify({ caption: trimmed, updatedAt: Date.now() }));
      } catch (e2) {}
    }, true);
  }

  function ensureSheet() {
    if (document.getElementById('tb-chair-pin-sheet')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tb-chair-pin-sheet';
    wrap.innerHTML =
      '<style>' +
      '#tb-chair-pin-sheet{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.72);display:none;align-items:flex-end;justify-content:center}' +
      '#tb-chair-pin-sheet.is-open{display:flex}' +
      '#tb-chair-pin-sheet .tb-cp-card{width:100%;max-width:440px;background:#111;border-radius:22px 22px 0 0;padding:22px 18px calc(28px + env(safe-area-inset-bottom,0px));position:relative}' +
      '#tb-chair-pin-sheet .tb-cp-x{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;background:transparent;color:#FEF105;font-size:28px;line-height:44px}' +
      '#tb-chair-pin-sheet .tb-cp-boxes{display:flex;gap:10px;justify-content:center;margin:18px 0 8px}' +
      '#tb-chair-pin-sheet .tb-cp-box{width:56px;height:64px;border:1px solid #FEF105;border-radius:12px;background:#000;color:#FEF105;font-size:28px;font-weight:800;text-align:center;line-height:64px}' +
      '#tb-chair-pin-sheet.is-bad .tb-cp-box{border-color:#E30600;color:#E30600}' +
      '#tb-chair-pin-sheet input{position:absolute;left:12px;right:12px;bottom:12px;height:72px;opacity:0}' +
      '</style>' +
      '<div class="tb-cp-card">' +
        '<button type="button" class="tb-cp-x" aria-label="Close">×</button>' +
        '<div class="tb-cp-boxes" aria-hidden="true">' +
          '<div class="tb-cp-box"></div><div class="tb-cp-box"></div><div class="tb-cp-box"></div><div class="tb-cp-box"></div>' +
        '</div>' +
        '<input id="tb-chair-pin" type="tel" inputmode="numeric" autocomplete="one-time-code" maxlength="4">' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('.tb-cp-x').addEventListener('click', closeSheet);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) closeSheet(); });
    var inp = wrap.querySelector('#tb-chair-pin');
    inp.addEventListener('input', function () {
      var v = String(inp.value || '').replace(/\D/g, '').slice(0, 4);
      inp.value = v;
      paintBoxes(v);
      wrap.classList.remove('is-bad');
      if (v.length === 4) tryUnlock(v);
    });
  }

  function paintBoxes(v) {
    var boxes = document.querySelectorAll('#tb-chair-pin-sheet .tb-cp-box');
    for (var i = 0; i < boxes.length; i++) boxes[i].textContent = v[i] ? '•' : '';
  }

  function openSheet() {
    ensureSheet();
    var s = document.getElementById('tb-chair-pin-sheet');
    var inp = document.getElementById('tb-chair-pin');
    s.classList.remove('is-bad');
    inp.value = '';
    paintBoxes('');
    s.classList.add('is-open');
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 80);
  }
  function closeSheet() {
    var s = document.getElementById('tb-chair-pin-sheet');
    if (s) s.classList.remove('is-open');
  }

  function tryUnlock(v) {
    if (v === CODE) {
      setPinOn();
      closeSheet();
      showTools();
      return;
    }
    var s = document.getElementById('tb-chair-pin-sheet');
    if (s) s.classList.add('is-bad');
    var inp = document.getElementById('tb-chair-pin');
    inp.value = '';
    paintBoxes('');
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

  function bindBolt() {
    var bolt = document.querySelector('#view-about .about-bolt-break') ||
      document.querySelector('.about-bolt-break');
    if (!bolt) return false;
    if (bolt.getAttribute('data-tb-chair') === '1') { bound = true; return true; }
    bolt.setAttribute('data-tb-chair', '1');
    decorate(bolt);
    bolt.setAttribute('role', 'button');
    bolt.setAttribute('aria-label', 'Sons of Thunder');
    function go(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (pinOn()) { showTools(); return; }
      openSheet();
    }
    bolt.addEventListener('click', go);
    var img = bolt.querySelector('img') || document.querySelector('#view-about .about-bolt-glow');
    if (img) {
      decorate(img);
      img.addEventListener('click', go);
    }
    bound = true;
    return true;
  }

  function bindLock() {
    var lock = document.getElementById('leader-lock-btn');
    if (!lock || lock.getAttribute('data-tb-chairlock') === '1') return;
    lock.setAttribute('data-tb-chairlock', '1');
    lock.addEventListener('click', function () {
      setPinOff();
      hideTools();
    });
  }

  function boot() {
    hideButton();
    bindBolt();
    bindLock();
    bindEditOpens();
    if (pinOn()) showTools();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  var n = 0;
  var iv = setInterval(function () {
    n += 1;
    boot();
    if (bound && n > 8) clearInterval(iv);
    if (n > 40) clearInterval(iv);
  }, 500);
})();
