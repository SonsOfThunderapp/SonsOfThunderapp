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

/* 20260822-chrome4: dock tabs in files old config already injects */
(function () {
  var OK = { home: 1, brothers: 1, events: 1, about: 1 };
  function show(name, btn) {
    if (!OK[name]) return;
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active');
      v.style.setProperty('display', 'none', 'important');
      v.style.setProperty('visibility', 'hidden', 'important');
    });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var pane = document.getElementById('view-' + name);
    if (pane) {
      pane.classList.add('active');
      pane.style.setProperty('display', 'block', 'important');
      pane.style.setProperty('visibility', 'visible', 'important');
    }
    if (btn) btn.classList.add('active');
  }
  function onNav(e) {
    var btn = e.target && e.target.closest && e.target.closest('.nav-item[data-view]');
    if (!btn) return;
    show(btn.getAttribute('data-view'), btn);
  }
  document.addEventListener('pointerdown', onNav, true);
  document.addEventListener('click', onNav, true);
})();

/* Backstage Thunder bubble: tour invite is gone. He says ask me ANYTHING!
   Tap Thunder still opens Ask. Bubble tap no longer starts the tour.
   20260822-chrome3: killChrome nav loop removed. */
(function () {
  var LINE = 'ask me ANYTHING!';
  var OLD = /new here\?|show you the room/i;

  function disarmTourInvite(b) {
    if (!b) return;
    try { b.dataset.tourInvite = ''; } catch (e) {}
    try { window.__tbTourInvite = false; } catch (e) {}
  }

  function retarget(b) {
    if (!b) return;
    var t = String(b.textContent || '');
    if (!OLD.test(t)) return;
    b.textContent = LINE;
    disarmTourInvite(b);
  }

  function watch() {
    var b = document.getElementById('fab-bubble');
    if (!b || b.dataset.askBound === '1') {
      if (b) retarget(b);
      return;
    }
    b.dataset.askBound = '1';
    retarget(b);
    try {
      var mo = new MutationObserver(function () { retarget(b); });
      mo.observe(b, { characterData: true, childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    try { watch(); } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setTimeout(boot, 4000);
})();
