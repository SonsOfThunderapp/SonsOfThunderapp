/* Hide Home install + member CTA. Seat lives on the open chair. Install lives on More. */
(function () {
  if (window.__tbFirstMinute) return;
  window.__tbFirstMinute = true;
  ['home-a2hs', 'home-member-cta'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.setProperty('display', 'none', 'important');
    }
  });
  if (!document.querySelector('link[href*="first-minute.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/first-minute.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
