/* 20260822-chrome2: splash/tour hide only — no click capture, no showView wrap */
(function(){
  function hideOverlay(el){
    if(!el) return;
    el.classList.add("hidden","splash-done","splash-out");
    el.setAttribute("hidden","hidden");
    el.setAttribute("aria-hidden","true");
    el.style.setProperty("display","none","important");
    el.style.setProperty("visibility","hidden","important");
    el.style.setProperty("pointer-events","none","important");
    el.style.setProperty("inset","auto","important");
    el.style.setProperty("height","0","important");
    el.style.setProperty("width","0","important");
    el.style.setProperty("overflow","hidden","important");
    el.style.setProperty("z-index","-1","important");
  }
  function killChrome(){
    hideOverlay(document.getElementById("splash"));
    hideOverlay(document.getElementById("tb-tour"));
    try{ sessionStorage.setItem("tb_splash_done","1"); }catch(e){}
    try{
      document.body.classList.remove("tb-tour-open","tb-tour-mandatory");
      document.body.style.pointerEvents="";
      document.body.style.overflow="";
    }catch(e2){}
    try{
      document.querySelectorAll(".tab-bar,.app-tabs,#tab-bar,nav.bottom-nav,.bottom-nav").forEach(function(n){
        n.style.setProperty("display","flex","important");
        n.style.setProperty("visibility","visible","important");
        n.style.setProperty("opacity","1","important");
        n.style.setProperty("pointer-events","auto","important");
        n.style.setProperty("z-index","50","important");
      });
      document.querySelectorAll(".nav-item,#nav-events,[data-view=events]").forEach(function(n){
        n.style.setProperty("pointer-events","auto","important");
        n.style.setProperty("z-index","50","important");
      });
    }catch(e3){}
  }
  function wrap(){
    if(typeof window.startTour==="function" && !window.startTour._tbKilled){
      var real=window.startTour;
      window.startTour=function(opts){ if(opts && (opts.force||opts.replay)) return real.apply(this,arguments); killChrome(); };
      window.startTour._tbKilled=true;
    }
  }
  setTimeout(function(){ killChrome(); wrap(); }, 0);
  setInterval(function(){ killChrome(); }, 300);
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
