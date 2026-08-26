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

/* theater1: load Thunder Theater then month film without rewriting config extras */
(function () {
  var b = (window.TB_CONFIG && window.TB_CONFIG.APP_BUILD) || '1';
  function css(hrefPart, href) {
    if (document.querySelector('link[href*="' + hrefPart + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href + '?v=' + encodeURIComponent(b);
    (document.head || document.documentElement).appendChild(l);
  }
  function js(srcPart, src) {
    if (document.querySelector('script[src*="' + srcPart + '"]')) return;
    var s = document.createElement('script');
    s.src = src + '?v=' + encodeURIComponent(b);
    s.defer = true;
    (document.body || document.documentElement).appendChild(s);
  }
  try {
    css('tb-theater.css', 'css/tb-theater.css');
    css('home-month-film.css', 'css/home-month-film.css');
    js('tb-theater.js', 'js/tb-theater.js');
    js('home-month-film.js', 'js/home-month-film.js');
  } catch (e) {}
})();
