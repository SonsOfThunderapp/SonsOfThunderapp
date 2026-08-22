(function(){
  function punchSplash(){
    var s=document.getElementById("splash");
    if(s){ s.classList.add("hidden","splash-done"); }
    var t=document.getElementById("tb-tour");
    if(t){ t.classList.add("hidden"); }
  }
  punchSplash();
  setTimeout(punchSplash,0);
  setTimeout(punchSplash,200);
  setTimeout(punchSplash,800);
})();
(function(){
  function hide(el){
    if(!el) return;
    el.classList.add("hidden","splash-done","splash-out");
    el.setAttribute("hidden","hidden");
    el.setAttribute("aria-hidden","true");
    el.style.setProperty("display","none","important");
    el.style.setProperty("visibility","hidden","important");
    el.style.setProperty("pointer-events","none","important");
  }
  function kill(){
    hide(document.getElementById("splash"));
    hide(document.getElementById("tb-tour"));
    try{ sessionStorage.setItem("tb_splash_done","1"); }catch(e){}
    try{ document.body.classList.remove("tb-tour-open","tb-tour-mandatory"); }catch(e2){}
  }
  function wrap(){
    if(typeof window.startTour==="function" && !window.startTour._tbKilled){
      var real=window.startTour;
      window.startTour=function(opts){ if(opts && (opts.force||opts.replay)) return real.apply(this,arguments); kill(); };
      window.startTour._tbKilled=true;
    }
  }
  kill();
  wrap();
  setTimeout(function(){ kill(); wrap(); }, 2500);
})();
