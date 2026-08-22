/* 20260822-chrome1 splash/tour kill */
(function(){
  function killChrome(){
    var s=document.getElementById("splash");
    if(s){ s.classList.add("splash-done","splash-out","hidden"); s.style.setProperty("display","none","important"); }
    try{ sessionStorage.setItem("tb_splash_done","1"); }catch(e){}
    var t=document.getElementById("tb-tour");
    if(t){ t.classList.add("hidden"); t.setAttribute("hidden","hidden"); t.setAttribute("aria-hidden","true"); t.style.setProperty("display","none","important"); t.style.setProperty("pointer-events","none","important"); }
    try{ document.body.classList.remove("tb-tour-open","tb-tour-mandatory"); }catch(e2){}
    try{ document.querySelectorAll(".tab-bar,.app-tabs,#tab-bar,.bottom-nav").forEach(function(n){ n.style.setProperty("display","flex","important"); n.style.setProperty("visibility","visible","important"); n.style.setProperty("opacity","1","important"); }); }catch(e3){}
  }
  function wrap(){
    if(typeof window.startTour==="function" && !window.startTour._tbKilled){
      var real=window.startTour;
      window.startTour=function(opts){ if(opts && (opts.force||opts.replay)) return real.apply(this,arguments); killChrome(); };
      window.startTour._tbKilled=true;
    }
  }
  setTimeout(function(){ killChrome(); wrap(); }, 2500);
  setInterval(function(){ killChrome(); wrap(); }, 300);
})();

/* Backstage Thunder bubble: tour invite is gone. He says ask me ANYTHING!
   Tap Thunder still opens Ask. Bubble tap no longer starts the tour. */
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
