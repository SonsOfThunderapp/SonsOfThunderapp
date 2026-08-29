(function () {
  if (window.__tbChairStack) return;
  window.__tbChairStack = true;

  function el(id) { return document.getElementById(id); }

  function stack(title, nodes) {
    var wrap = document.createElement('div');
    wrap.className = 'tb-chair-stack';
    var k = document.createElement('span');
    k.className = 'tb-chair-kicker';
    k.textContent = title;
    wrap.appendChild(k);
    nodes.forEach(function (n) {
      if (n) wrap.appendChild(n);
    });
    return wrap;
  }

  function run() {
    var root = el('leader-tools');
    if (!root || root.dataset.tbStack === '1') return;
    var room = el('admin-room-btn');
    var ann = el('admin-announcements-btn');
    var ev = el('admin-events-btn');
    var code = el('admin-code-btn');
    var push = el('admin-push-btn');
    var sms = el('admin-sms-club-btn');
    var lock = el('leader-lock-btn');
    var week = el('tb-week-box');
    if (!room || !ann || !ev || !code || !push || !sms || !lock) return;
    root.dataset.tbStack = '1';

    var hints = root.querySelectorAll('.leader-push-hint');
    var roomHint = hints[0] || null;
    var pushHint = hints[1] || null;
    var smsHint = hints[2] || null;

    var write = stack('WRITE THE BOARD', [ann, ev, code]);
    var night = stack('NIGHT OF — RAFFLE', [room, roomHint]);
    var send = stack('SEND', [push, pushHint, sms, smsHint]);
    var weekStack = stack('THIS WEEK', week ? [week] : []);
    var chair = stack('CHAIR', [lock]);

    root.innerHTML = '';
    root.appendChild(write);
    root.appendChild(night);
    root.appendChild(send);
    if (week) root.appendChild(weekStack);
    root.appendChild(chair);
  }

  run();
  setTimeout(run, 400);
  setTimeout(run, 1400);
  var tools = document.getElementById('leader-tools');
  if (tools && window.MutationObserver) {
    new MutationObserver(function () {
      if (tools.dataset.tbStack === '1' && tools.querySelector('.tb-chair-stack')) return;
      tools.dataset.tbStack = '';
      setTimeout(run, 40);
    }).observe(tools, { childList: true });
  }
})();
