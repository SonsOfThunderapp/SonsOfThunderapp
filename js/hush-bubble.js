(function () {
  if (window.__tbHushBubble) return;
  window.__tbHushBubble = true;
  function hush() {
    if (window.__tbTourAllowed) return;
    var b = document.getElementById('fab-bubble');
    if (!b) return;
    if (b.dataset.tourInvite === '1' || /New here/i.test(b.textContent || '')) {
      b.classList.add('hidden');
      b.classList.remove('is-on');
      b.setAttribute('aria-hidden', 'true');
    }
  }
  var b = document.getElementById('fab-bubble');
  if (b && window.MutationObserver) {
    new MutationObserver(hush).observe(b, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'data-tour-invite']
    });
  }
  hush();
  setTimeout(hush, 400);
  setTimeout(hush, 1400);
})();
