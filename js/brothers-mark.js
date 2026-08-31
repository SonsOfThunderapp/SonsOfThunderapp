/* 20260831-brothers-mark — type only. */
(function () {
  if (window.__tbBrothersMark) return;
  window.__tbBrothersMark = true;
  if (document.querySelector('link[href*="brothers-mark.css"]')) return;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'css/brothers-mark.css';
  (document.head || document.documentElement).appendChild(l);
})();
