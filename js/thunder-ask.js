(function(){
  var NAMES=['home','brothers','events','about'];
  function goTo(name){
    if (NAMES.indexOf(name)<0) return;
    if (typeof window.showView === 'function') { window.showView(name); return; }
    NAMES.forEach(function(n){
      var p=document.getElementById('view-'+n);
      if(!p) return;
      p.classList.toggle('active', n===name);
    });
    document.querySelectorAll('.nav-item').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-view')===name);
    });
  }
  function bind(){
    var btns=document.querySelectorAll('nav.bottom-nav button');
    btns.forEach(function(btn,i){
      if(btn.getAttribute('data-tb-nav')==='1') return;
      btn.setAttribute('data-tb-nav','1');
      var name=btn.getAttribute('data-view')||NAMES[i];
      btn.addEventListener('pointerdown', function(){ goTo(name); });
    });
  }
  bind();
})();
/* Backstage Thunder bubble: tour invite is gone. He says ask me ANYTHING!
   Tap Thunder still opens Ask. Bubble tap no longer starts the tour.
   20260822-chrome3: killChrome nav loop removed. */
(function () {
  var LINE = '';
  var OLD = /new here\?|show you the room|ask me ANYTHING/i;

  function disarmTourInvite(b) {
    if (!b) return;
    try { b.dataset.tourInvite = ''; } catch (e) {}
    try { window.__tbTourInvite = false; } catch (e) {}
  }

  function retarget(b) {
    if (!b) return;
    b.textContent = '';
    b.classList.add('hidden');
    b.classList.remove('is-on');
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
