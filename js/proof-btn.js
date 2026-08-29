(function () {
  if (window.__tbProofBtn) return;
  window.__tbProofBtn = true;
  function wire() {
    var line = document.querySelector('#view-events .events-hit-line');
    var add = document.getElementById('upload-media-btn');
    if (!line || !add || line.dataset.tbProof === '1') return;
    line.dataset.tbProof = '1';
    line.setAttribute('role', 'button');
    line.setAttribute('tabindex', '0');
    line.addEventListener('click', function (e) {
      e.preventDefault();
      add.click();
    });
  }
  wire();
  setTimeout(wire, 400);
  document.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('[data-view="events"], #nav-events')) {
      setTimeout(wire, 50);
    }
  }, true);
})();
