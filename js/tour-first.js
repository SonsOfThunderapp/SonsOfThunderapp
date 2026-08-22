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

/* 20260822-chrome3: splash/tour hide only — no nav style loop */
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
