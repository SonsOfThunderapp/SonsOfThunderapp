/* 20260822-chrome1 splash/tour kill; startTour force/replay kept */
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
