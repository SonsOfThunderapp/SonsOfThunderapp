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

/* Discreet Privacy / Terms on More. Does not rewrite homepage HTML. */
(function () {
  function paint() {
    var tools = document.querySelector('#view-about .more-tools') || document.querySelector('.more-tools');
    if (!tools) return;
    if (document.getElementById('tb-legal-row')) return;
    var row = document.createElement('p');
    row.id = 'tb-legal-row';
    row.setAttribute('data-tb-legal', '1');
    row.style.cssText = 'text-align:center;margin:20px 0 10px;font-size:12px;letter-spacing:.06em;opacity:.65;';
    row.innerHTML = '<a href="https://sonsofthunderboard.com/privacy" style="color:inherit;text-decoration:underline;">Privacy</a>'
      + ' <span aria-hidden="true"> · </span> '
      + '<a href="https://sonsofthunderboard.com/terms" style="color:inherit;text-decoration:underline;">Terms</a>';
    tools.appendChild(row);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  setInterval(paint, 1600);
})();
