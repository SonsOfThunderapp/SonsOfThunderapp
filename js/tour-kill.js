(function(){
  function hide(){
    var t=document.getElementById('tb-tour');
    if(!t) return;
    t.style.setProperty('display','none','important');
    t.hidden=true;
    t.setAttribute('hidden','hidden');
    t.classList.add('hidden');
    try{ document.body.classList.remove('tb-tour-open','tb-tour-mandatory'); }catch(e){}
    try{ localStorage.setItem('tb_thunderTourV42','done'); }catch(e){}
  }
  function wrap(){
    if(typeof window.startTour==='function' && !window.startTour._tbKilled){
      var real=window.startTour;
      window.startTour=function(opts){
        if(opts && (opts.force||opts.replay)) return real.apply(this,arguments);
        hide();
      };
      window.startTour._tbKilled=true;
    }
  }
  hide(); wrap();
  setInterval(function(){ wrap(); hide(); }, 250);
})();

(function(){
  function splashKill(){
    var s=document.getElementById('splash');
    if(s){
      s.classList.add('splash-done','splash-out','hidden');
      s.style.setProperty('display','none','important');
      s.style.setProperty('visibility','hidden','important');
      s.style.setProperty('pointer-events','none','important');
    }
    try{ sessionStorage.setItem('tb_splash_done','1'); }catch(e){}
    var t=document.getElementById('tb-tour');
    if(t){
      t.classList.add('hidden');
      t.hidden=true;
      t.setAttribute('hidden','hidden');
      t.style.setProperty('display','none','important');
      t.style.setProperty('visibility','hidden','important');
      t.style.setProperty('pointer-events','none','important');
      t.style.setProperty('z-index','-1','important');
    }
    try{ document.body.classList.remove('tb-tour-open'); }catch(e){}
  }
  function arm(){
    splashKill();
    setInterval(splashKill, 300);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
})();
