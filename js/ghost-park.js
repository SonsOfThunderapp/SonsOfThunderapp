/* 20260830-ghost-park — bury named ghosts. No app.js. */
(function () {
  if (window.__tbGhostPark) return;
  window.__tbGhostPark = true;

  var KILL = [
    'last-fire',
    'tb-text-leader-brothers',
    'admin-lastfire-btn',
    'sharpen-section-title',
    'activity-tags',
    'activity-feed'
  ];

  function bury() {
    KILL.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'last-fire' || id.indexOf('activity') === 0 || id.indexOf('sharpen') === 0) {
        el.classList.add('hidden');
        el.style.setProperty('display', 'none', 'important');
      }
      if (id === 'tb-text-leader-brothers' || id === 'admin-lastfire-btn') {
        try { el.remove(); } catch (e) {}
      }
    });
    var homeMission = document.querySelector('#view-home #next-mission-card');
    if (homeMission) homeMission.style.setProperty('display', 'none', 'important');
  }

  bury();
  setTimeout(bury, 400);

  if (!document.querySelector('link[href*="ghost-park.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/ghost-park.css';
    (document.head || document.documentElement).appendChild(l);
  }
  if (!document.querySelector('link[href*="lastfire-gone.css"]')) {
    var l2 = document.createElement('link');
    l2.rel = 'stylesheet';
    l2.href = 'css/lastfire-gone.css';
    (document.head || document.documentElement).appendChild(l2);
  }
})();
