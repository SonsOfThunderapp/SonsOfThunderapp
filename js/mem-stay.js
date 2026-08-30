(function () {
  if (window.__tbMemStay) return;
  window.__tbMemStay = true;
  function close() {
    var el = document.getElementById('memory-viewer');
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
    var stage = document.getElementById('memory-viewer-stage');
    if (stage) stage.innerHTML = '';
  }
  document.querySelectorAll('.bottom-nav [data-view], .bottom-nav button').forEach(function (b) {
    b.addEventListener('click', close, true);
  });
  var home = document.getElementById('nav-home');
  if (home) home.addEventListener('click', close, true);
})();
