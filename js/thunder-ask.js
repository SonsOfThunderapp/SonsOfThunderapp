/* Backstage Thunder bubble: tour invite is gone. He says ask me ANYTHING!
   Tap Thunder still opens Ask. Bubble tap no longer starts the tour.
   20260822-chrome3: killChrome nav loop removed. */
(function () {
  var LINE = 'ask me ANYTHING!';
  var OLD = /new here\?|show you the room/i;

  function disarmTourInvite(b) {
    if (!b) return;
    try { b.dataset.tourInvite = ''; } catch (e) {}
    try { window.__tbTourInvite = false; } catch (e) {}
  }

  function retarget(b) {
    if (!b) return;
    var t = String(b.textContent || '');
    if (!OLD.test(t)) return;
    b.textContent = LINE;
    disarmTourInvite(b);
  }

  function watch() {
    var b = document.getElementById('fab-bubble');
    if (!b || b.dataset.askBound === '1') {
      if (b) retarget(b);
      return;
    }
    b.dataset.askBound = '1';
    retarget(b);
    try {
      var mo = new MutationObserver(function () { retarget(b); });
      mo.observe(b, { characterData: true, childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    try { watch(); } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setTimeout(boot, 4000);
})();
