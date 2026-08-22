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
