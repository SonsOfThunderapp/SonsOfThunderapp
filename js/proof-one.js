(function () {
  if (window.__tbProofOne) return;
  window.__tbProofOne = true;

  var close = document.getElementById('memory-viewer-close');
  var viewer = document.getElementById('memory-viewer');
  if (close && viewer && close.dataset.tbProofOne !== '1') {
    close.dataset.tbProofOne = '1';
    close.addEventListener('click', function (e) {
      e.preventDefault();
      viewer.classList.add('hidden');
      viewer.setAttribute('aria-hidden', 'true');
    });
  }
})();
