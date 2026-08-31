/* 20260830-more-raffle — More card reads Home's gathering clock. No second date engine. */
(function () {
  if (window.__tbMoreRaffle) return;
  window.__tbMoreRaffle = true;

  function seated() {
    try {
      if (document.body.classList.contains('tb-seated')) return true;
      if (localStorage.getItem('tb_seat_locked')) return true;
    } catch (e) {}
    return false;
  }

  function phase() {
    var el = document.getElementById('meeting-phase-label');
    return String((el && el.textContent) || '').toUpperCase();
  }

  function count() {
    var el = document.getElementById('meeting-countdown');
    return String((el && el.textContent) || '').toUpperCase();
  }

  function tonight() {
    var p = phase();
    return p.indexOf('TONIGHT') !== -1 || p.indexOf('THUNDER TONIGHT') !== -1;
  }

  function closed() {
    var p = phase();
    return p.indexOf('GOOD NIGHT') !== -1 || count() === 'SHOWED UP';
  }

  function key() {
    var d = new Date();
    return 'tb_raffle_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function inHat() {
    try { return localStorage.getItem(key()) === '1'; } catch (e) { return false; }
  }

  function mark() {
    try { localStorage.setItem(key(), '1'); } catch (e) {}
  }

  function card() {
    var tools = document.querySelector('#view-about .more-tools');
    if (!tools) return null;
    var el = document.getElementById('tb-more-raffle');
    if (el) return el;
    el = document.createElement('button');
    el.type = 'button';
    el.id = 'tb-more-raffle';
    tools.insertBefore(el, tools.firstChild);
    el.addEventListener('click', function () {
      if (closed() || !tonight()) return;
      if (!seated()) {
        var chair = document.getElementById('brother-open-chair') || document.getElementById('auth-entry-btn');
        var nav = document.querySelector('[data-view="brothers"], #nav-brothers');
        if (nav) nav.click();
        if (chair) setTimeout(function () { chair.click(); }, 80);
        return;
      }
      mark();
      paint();
    });
    return el;
  }

  function paint() {
    var el = card();
    if (!el) return;
    el.classList.remove('is-live', 'is-in', 'is-sleep');
    if (closed()) {
      el.className = 'is-sleep';
      el.textContent = inHat() ? 'YOU WERE IN THE HAT' : 'DRAW IS CLOSED';
      el.disabled = true;
      return;
    }
    if (tonight()) {
      if (inHat()) {
        el.className = 'is-in';
        el.textContent = "YOU'RE IN THE HAT";
        el.disabled = true;
      } else {
        el.className = 'is-live';
        el.textContent = "ENTER TONIGHT'S DRAW";
        el.disabled = false;
      }
      return;
    }
    el.className = 'is-sleep';
    el.disabled = true;
    var c = count() || 'GATHERING NIGHT';
    el.textContent = 'RAFFLE OPENS · ' + c;
  }

  function onMore() {
    var v = document.getElementById('view-about');
    return !!(v && v.classList.contains('active'));
  }

  document.addEventListener('pointerdown', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-view], .nav-item, #nav-about');
    if (!t) return;
    var id = t.getAttribute('data-view') || t.id || '';
    if (id === 'about' || id === 'nav-about') setTimeout(paint, 40);
  }, true);

  var about = document.getElementById('view-about');
  if (about && window.MutationObserver) {
    new MutationObserver(function () { if (onMore()) paint(); }).observe(about, { attributes: true, attributeFilter: ['class'] });
  }
  ['meeting-countdown', 'meeting-phase-label'].forEach(function (id) {
    var n = document.getElementById(id);
    if (n && window.MutationObserver) {
      new MutationObserver(function () { if (onMore()) paint(); }).observe(n, { childList: true, characterData: true, subtree: true });
    }
  });
  if (onMore()) paint();

  if (!document.querySelector('link[href*="more-raffle.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/more-raffle.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
