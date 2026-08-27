/* Privacy / Terms sit at the very bottom of More. Do not hoist under the bolt. */
(function () {
  var HTML = '<a href="https://sonsofthunderboard.com/privacy">Privacy</a>'
    + ' <span aria-hidden="true"> · </span> '
    + '<a href="https://sonsofthunderboard.com/terms">Terms</a>'
    + ' <span aria-hidden="true"> · </span> '
    + 'sonsofthunderboard.com';

  function host() {
    return document.querySelector('#view-about .about-container')
      || document.getElementById('view-about');
  }

  function paint() {
    var box = host();
    if (!box) return;
    var row = document.getElementById('tb-legal-row');
    if (!row) {
      row = document.createElement('p');
      row.id = 'tb-legal-row';
      row.className = 'tb-legal-footer';
      row.setAttribute('data-tb-legal', '1');
      row.innerHTML = HTML;
    }
    if (row.parentNode !== box || box.lastElementChild !== row) {
      box.appendChild(row);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  setInterval(paint, 2000);
})();
