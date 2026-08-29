(function () {
  if (window.__tbRoomShow) return;
  window.__tbRoomShow = true;

  function paint() {
    var box = document.getElementById('room-stats');
    if (!box) return;
    var shown = box.querySelectorAll('.room-person.is-showed');
    var n = shown.length;
    var el = document.getElementById('tb-here-count');
    if (!el) {
      el = document.createElement('span');
      el.id = 'tb-here-count';
      box.parentNode.insertBefore(el, box);
    }
    el.textContent = n ? ('HERE TONIGHT · ' + n) : 'HERE TONIGHT · 0';
  }

  paint();
  var box = document.getElementById('room-stats');
  if (box && window.MutationObserver) {
    new MutationObserver(paint).observe(box, { childList: true, subtree: true });
  }
  var btn = document.getElementById('admin-room-btn');
  if (btn) btn.addEventListener('click', function () { setTimeout(paint, 400); });
})();
