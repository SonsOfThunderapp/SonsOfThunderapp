/* 20260831-chair-rotate — one of ten lines under BROTHERS per refresh. */
(function () {
  if (window.__tbChairRotate) return;
  window.__tbChairRotate = true;

  var LINES = [
    'Empty chairs don’t make a brotherhood. Fill yours.',
    'Name. Face. Seat. Then you’re in the room.',
    'Don’t make a brother guess who you are.',
    'Take your seat. The room should know your name.',
    'Stand where they can find you.',
    'Your chair is open. Let a brother see you.',
    'Be a name in the room, not a shadow in it.',
    'Sit down so the man next to you isn’t a stranger.',
    'The brotherhood starts when your chair is taken.',
    'Show your face. Carry your name. Take the seat.'
  ];
  var LAST = 'tb_chair_rotate_last';

  function seated() {
    if (document.body.classList.contains('tb-seated') || document.body.classList.contains('tb-authed')) return true;
    var bar = document.getElementById('auth-session-bar');
    if (bar && !bar.classList.contains('hidden')) return true;
    try {
      if (localStorage.getItem('tb_seat_locked')) return true;
    } catch (e) {}
    return false;
  }

  function pick() {
    var last = -1;
    try { last = parseInt(sessionStorage.getItem(LAST) || '-1', 10); } catch (e) {}
    if (isNaN(last)) last = -1;
    var i = Math.floor(Math.random() * LINES.length);
    if (LINES.length > 1 && i === last) i = (i + 1) % LINES.length;
    try { sessionStorage.setItem(LAST, String(i)); } catch (e2) {}
    return LINES[i];
  }

  var chosen = null;
  function line() {
    if (!chosen) chosen = pick();
    return chosen;
  }

  function paint() {
    var el = document.getElementById('tb-chair-line');
    var head = document.getElementById('brothers-section-title');
    if (seated()) {
      if (el) el.style.display = 'none';
      return;
    }
    if (!el && head && head.parentNode) {
      el = document.createElement('p');
      el.id = 'tb-chair-line';
      el.className = 'tb-chair-line';
      head.parentNode.insertBefore(el, head.nextSibling);
    }
    if (!el) return;
    el.style.display = '';
    el.textContent = line();
  }

  window.__tbChairLinePaint = paint;

  paint();
  setTimeout(paint, 400);
  setTimeout(paint, 1400);
})();
