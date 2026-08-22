/* hangout tour extras — TAKE THE TOUR only, no auto-start */
(function(){
if (window.__tbHangoutTour) return; window.__tbHangoutTour=true;
var SRC=window.TB_HANG_SRC||[];
var TALK=[
  ["Quiet's fine.","When it isn't, ask."],
  ["You coming Monday?","That's the door. I'M IN."],
  ["You're not alone.","Different faces. Same storm."],
  ["This night stays.","Drop the pic."],
  ["Nobody sits this one alone.","Honor him. One text."],
  ["Rough night?","Say it here. We don't leave."]
];
var MOOD=['read','patio','pickle','grill','bday','fire'];
function board(){
  var st=document.querySelector('#tb-tour .tb-tour-stage');
  var n=st && st.getAttribute('data-board');
  n=parseInt(n,10); return isNaN(n)?0:n;
}
function paint(){
  var tour=document.getElementById('tb-tour');
  if(!tour || tour.classList.contains('hidden')) return;
  var i=board();
  var frame=document.getElementById('tb-tour-live');
  if(!frame) return;
  var layer=frame.querySelector('.tb-hang-layer');
  if(!layer){
    layer=document.createElement('div');
    layer.className='tb-hang-layer';
    layer.innerHTML='<img class="tb-hang-art" alt=""/><div class="tb-hang-talk a"></div><div class="tb-hang-talk b"></div>';
    frame.appendChild(layer);
  }
  layer.setAttribute('data-mood', MOOD[i]||'read');
  var img=layer.querySelector('.tb-hang-art');
  if(img && SRC[i] && img.getAttribute('data-i')!==String(i)){
    img.src=SRC[i];
    img.setAttribute('data-i', String(i));
  }
  var t=TALK[i]||['',''];
  var a=layer.querySelector('.tb-hang-talk.a');
  var b=layer.querySelector('.tb-hang-talk.b');
  if(a) a.textContent=t[0]||'';
  if(b) b.textContent=t[1]||'';
}
function watch(){
  var tour=document.getElementById('tb-tour');
  if(!tour) return;
  new MutationObserver(paint).observe(tour,{attributes:true,subtree:true,attributeFilter:['class','data-board']});
  paint();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch);
else watch();
})();
