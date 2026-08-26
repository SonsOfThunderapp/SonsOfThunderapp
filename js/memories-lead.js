/* Memories lead only. Title stays MEMORIES. Patio line becomes Obie's three beats. Homepage frozen. */
(function () {
  var COPY = 'Good times, Great People, Share it!';

  function paint() {
    var el = document.querySelector('#view-events .memories-lead, .memories-block .memories-lead, p.memories-lead');
    if (!el) return;
    if (el.getAttribute('data-tb-memlead') === '1' && el.textContent === COPY) return;
    el.textContent = COPY;
    el.setAttribute('data-tb-memlead', '1');
  }

  function boot() {
    paint();
    var block = document.getElementById('memories-block') || document.getElementById('view-events');
    if (block) {
      var obs = new MutationObserver(function () { paint(); });
      obs.observe(block, { childList: true, subtree: true, characterData: true });
    }
    document.addEventListener('click', function (ev) {
      var n = ev.target && ev.target.closest && ev.target.closest('.nav-item[data-view="events"]');
      if (n) setTimeout(paint, 0);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* homefilm1: load month film extra without rewriting config.js */
(function () {
  var b = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
  try {
    if (!document.querySelector('link[href*="home-month-film.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/home-month-film.css?v=' + encodeURIComponent(b);
      (document.head || document.documentElement).appendChild(l);
    }
    if (!document.querySelector('script[src*="home-month-film.js"]')) {
      var s = document.createElement('script');
      s.src = 'js/home-month-film.js?v=' + encodeURIComponent(b);
      s.defer = true;
      (document.body || document.documentElement).appendChild(s);
    }
  } catch (e) {}
})();
