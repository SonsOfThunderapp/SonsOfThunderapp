/* 20260831-raffle-charm — patio line under the sleeping raffle. Silent when live. */
(function () {
  if (window.__tbRaffleCharm) return;
  window.__tbRaffleCharm = true;

  var LINES = [
    'Hats stay in the box until we’re on the patio.',
    'Don’t shake the hat yet. Monday’s still cooking.',
    'The draw can wait. You can’t skip the gathering.',
    'Empty hat. Same as an empty chair. Show up first.',
    'Thunder does not raffle on a Tuesday.',
    'Cooler stays closed until 6:30.',
    'If you could enter now, nobody would come.',
    'Patience. The patio does the drawing.',
    'This button’s napping. Wake it on gathering night.',
    'Save the luck for when you’re actually there.'
  ];
  var LAST = 'tb_raffle_charm_last';
  var chosen = null;
  var onMore = false;

  function pick() {
    var last = -1;
    try { last = parseInt(sessionStorage.getItem(LAST) || '-1', 10); } catch (e) {}
    if (isNaN(last)) last = -1;
    var i = Math.floor(Math.random() * LINES.length);
    if (LINES.length > 1 && i === last) i = (i + 1) % LINES.length;
    try { sessionStorage.setItem(LAST, String(i)); } catch (e2) {}
    chosen = LINES[i];
    return chosen;
  }

  function line() {
    if (!chosen) pick();
    return chosen;
  }

  function moreOpen() {
    var v = document.getElementById('view-about');
    return !!(v && v.classList.contains('active'));
  }

  function sleeping() {
    var el = document.getElementById('tb-more-raffle');
    if (!el) return false;
    if (el.classList.contains('is-live') || el.classList.contains('is-in')) return false;
    var t = String(el.textContent || '').toUpperCase();
    if (t.indexOf("ENTER TONIGHT") !== -1) return false;
    if (t.indexOf('YOU\'RE IN THE HAT') !== -1 || t.indexOf('YOU WERE IN THE HAT') !== -1) return false;
    if (t.indexOf('DRAW IS CLOSED') !== -1) return false;
    return el.classList.contains('is-sleep') || t.indexOf('RAFFLE OPENS') !== -1;
  }

  function node() {
    var el = document.getElementById('tb-more-raffle');
    if (!el || !el.parentNode) return null;
    var n = document.getElementById('tb-raffle-charm');
    if (n) return n;
    n = document.createElement('p');
    n.id = 'tb-raffle-charm';
    n.setAttribute('aria-live', 'polite');
    el.insertAdjacentElement('afterend', n);
    return n;
  }

  function stamp() {
    var n = node();
    if (!n) return;
    if (!sleeping()) {
      n.textContent = '';
      n.style.display = 'none';
      return;
    }
    n.style.display = '';
    n.textContent = line();
  }

  function onOpen() {
    if (!moreOpen()) {
      onMore = false;
      return;
    }
    if (onMore) {
      stamp();
      return;
    }
    onMore = true;
    pick();
    stamp();
  }

  onOpen();
  setTimeout(onOpen, 400);
  setTimeout(stamp, 900);

  document.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var n = t.closest('[data-view], .nav-item, #nav-about');
    if (!n) return;
    var id = n.getAttribute('data-view') || n.id || '';
    if (id === 'about' || id === 'nav-about') {
      onMore = false;
      setTimeout(onOpen, 60);
    } else {
      onMore = false;
    }
  }, true);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && moreOpen()) {
      onMore = false;
      onOpen();
    }
  });

  if (!document.querySelector('link[href*="raffle-charm.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/raffle-charm.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
