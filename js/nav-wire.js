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
