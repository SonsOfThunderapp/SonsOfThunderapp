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
