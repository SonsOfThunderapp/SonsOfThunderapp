/* 20260827-more1: treat showView("more") as about. Do not redesign More. */
(function () {
  if (window.__tbMoreAlias) return;
  window.__tbMoreAlias = true;

  function goMore() {
    var about = document.getElementById('view-about');
    if (about && about.classList.contains('active')) return;
    var nav = document.querySelector('.nav-item[data-view="about"]');
    if (nav) {
      nav.click();
      return;
    }
    if (!about) return;
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active');
    });
    about.classList.add('active');
    try { document.body.classList.add('tb-view-about'); } catch (e0) {}
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.toggle('active', n.getAttribute('data-view') === 'about');
    });
  }

  var prev = window.showView;
  window.showView = function (name, opts) {
    if (name === 'more') {
      if (typeof prev === 'function') return prev('about', opts);
      goMore();
      return;
    }
    if (typeof prev === 'function') return prev(name, opts);
  };

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.thunder-action-btn');
    if (!b) return;
    var id = b.getAttribute('data-tb-action');
    if (id === 'code' || id === 'open_code' || id === 'install') {
      setTimeout(goMore, 0);
    }
  }, true);

  function wantsMore() {
    try {
      var path = (location.pathname || '').replace(/\/+$/, '') || '/';
      if (/^\/tap\/(more|code)$/i.test(path)) return true;
      var q = new URLSearchParams(location.search || '');
      var tap = String(q.get('tap') || '').toLowerCase();
      if (q.get('view') === 'more') return true;
      if (tap === 'more' || tap === 'code') return true;
    } catch (e1) {}
    return false;
  }
  if (wantsMore()) setTimeout(goMore, 480);
})();
