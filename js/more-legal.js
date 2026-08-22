/* Discreet Privacy / Terms on More. Does not rewrite homepage HTML. */
(function () {
  function paint() {
    var tools = document.querySelector('#view-about .more-tools') || document.querySelector('.more-tools');
    if (!tools) return;
    if (document.getElementById('tb-legal-row')) return;
    var row = document.createElement('p');
    row.id = 'tb-legal-row';
    row.setAttribute('data-tb-legal', '1');
    row.style.cssText = 'text-align:center;margin:20px 0 10px;font-size:12px;letter-spacing:.06em;opacity:.65;';
    row.innerHTML = '<a href="privacy.html" style="color:inherit;text-decoration:underline;">Privacy</a>'
      + ' <span aria-hidden="true"> · </span> '
      + '<a href="terms.html" style="color:inherit;text-decoration:underline;">Terms</a>';
    tools.appendChild(row);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  setInterval(paint, 1600);
})();
