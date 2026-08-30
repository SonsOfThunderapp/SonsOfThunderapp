/* 20260830-header-pull — GHOST PARKED.
   700ms hold-to-refresh on the wordmark is retired.
   Home pull lives in js/home-only-pull.js only. */
(function () {
  var mark = document.getElementById('header-logo') || document.querySelector('#main-header img');
  if (mark) mark.dataset.tbPull = '1';
})();
