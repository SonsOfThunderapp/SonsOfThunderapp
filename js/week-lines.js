(function () {
  if (window.__tbWeekLines) return;
  window.__tbWeekLines = true;

  var LINES = [
    'Show up. The patio doesn’t fill itself.',
    'Somebody in this room needs the man you actually are this week.',
    'Thunder doesn’t dull. Neither do you — if you stay in the fire.',
    'Put a name on a brother this week. Don’t wait for the gathering.',
    'Lock in if you’re coming. A quiet yes is still a yes.',
    'Carry one brother. One text. That’s the whole assignment.',
    'Stay sharp. Rust is just unused iron.',
    'Lead where you stand — kitchen, jobsite, house, patio.',
    'The Code isn’t a poster. Pick one line and live it until Monday.',
    'Come hungry. Leave proof.'
  ];

  function isoWeek() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    var w1 = new Date(d.getFullYear(), 0, 4);
    var week = 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-W' + String(week).padStart(2, '0');
  }
  function read() {
    try { return JSON.parse(localStorage.getItem('tb_week_approve') || '{}'); } catch (e) { return {}; }
  }
  function write(obj) {
    try { localStorage.setItem('tb_week_approve', JSON.stringify(obj)); } catch (e) {}
  }
  function gatheringHot() {
    var card = document.querySelector('#view-home .next-meeting');
    if (!card) return false;
    return card.classList.contains('phase-soon') || card.classList.contains('phase-tonight');
  }
  function chairOpen() {
    var tools = document.getElementById('leader-tools');
    return !!(tools && !tools.classList.contains('hidden'));
  }

  function mountChair() {
    var tools = document.getElementById('leader-tools');
    if (!tools || document.getElementById('tb-week-box')) return;
    var box = document.createElement('div');
    box.id = 'tb-week-box';
    var opts = LINES.map(function (line, i) {
      return '<option value="' + i + '">' + line + '</option>';
    }).join('');
    box.innerHTML =
      '<label>THIS WEEK\'S LINE — YOU APPROVE BEFORE HOME SEES IT</label>' +
      '<select id="tb-week-pick">' + opts + '</select>' +
      '<textarea id="tb-week-text" maxlength="180"></textarea>' +
      '<div id="tb-week-row">' +
      '<button type="button" id="tb-week-shuffle">SHUFFLE</button>' +
      '<button type="button" id="tb-week-go">APPROVE</button>' +
      '</div>';
    tools.appendChild(box);

    var pick = document.getElementById('tb-week-pick');
    var ta = document.getElementById('tb-week-text');
    function use(i) {
      i = Math.max(0, Math.min(LINES.length - 1, parseInt(i, 10) || 0));
      pick.value = String(i);
      ta.value = LINES[i];
    }
    var cur = read();
    var start = 0;
    if (cur.text) {
      var found = LINES.indexOf(cur.text);
      start = found >= 0 ? found : 0;
      ta.value = cur.text;
      pick.value = String(start);
    } else {
      use(Math.floor(Math.random() * LINES.length));
    }
    pick.addEventListener('change', function () { use(pick.value); });
    document.getElementById('tb-week-shuffle').addEventListener('click', function () {
      use(Math.floor(Math.random() * LINES.length));
    });
    document.getElementById('tb-week-go').addEventListener('click', function () {
      var text = (ta.value || '').trim().slice(0, 180);
      if (!text) return;
      write({ week: isoWeek(), text: text, approved: true });
      paintHome();
      try { if (window.tbToast) window.tbToast('WEEK LINE LOCKED', 1600); } catch (e) {}
    });
  }

  function paintChair() {
    var box = document.getElementById('tb-week-box');
    if (!box) return;
    if (chairOpen()) box.classList.add('is-chair');
    else box.classList.remove('is-chair');
  }

  function paintHome() {
    var card = document.querySelector('#view-home .next-meeting');
    if (!card) return;
    var el = document.getElementById('tb-week-home');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tb-week-home';
      el.innerHTML = '<span id="tb-week-home-kicker">THIS WEEK</span><span id="tb-week-home-text"></span>';
      card.parentNode.insertBefore(el, card.nextSibling);
    }
    var cur = read();
    var ok = cur.approved === true && cur.week === isoWeek() && !!cur.text && !gatheringHot();
    var t = document.getElementById('tb-week-home-text');
    if (t) t.textContent = cur.text || '';
    if (ok) el.classList.add('is-on');
    else el.classList.remove('is-on');
  }

  function tick() {
    mountChair();
    paintChair();
    paintHome();
  }

  setTimeout(tick, 400);
  setTimeout(tick, 1400);
  var tools = document.getElementById('leader-tools');
  if (tools && window.MutationObserver) {
    new MutationObserver(tick).observe(tools, { attributes: true, attributeFilter: ['class'] });
  }
})();
