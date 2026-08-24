/* When Grok answers, shrink tuxedo Thunder so the reply is readable. */
(function () {
  function sync() {
    var modal = document.getElementById('thunder-modal');
    var box = document.getElementById('thunder-messages');
    if (!modal || !box) return;
    modal.classList.toggle('tb-ask-has-reply', !!box.querySelector('.thunder-msg.assistant'));
  }
  function boot() {
    var box = document.getElementById('thunder-messages');
    if (!box) return;
    sync();
    if (box.dataset.clearBound === '1') return;
    box.dataset.clearBound = '1';
    try {
      new MutationObserver(sync).observe(box, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 600);
  setTimeout(boot, 1800);
})();
