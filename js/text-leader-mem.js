/* 20260830-text-leader-mem — TEXT A LEADER under the hobby note on Memories. */
(function () {
  if (window.__tbTextLeaderMem) return;
  window.__tbTextLeaderMem = true;

  function place() {
    var btn = document.getElementById('text-leader-btn');
    var view = document.getElementById('view-events');
    var box = view && view.querySelector('.container');
    if (!btn || !box) return;
    btn.textContent = 'TEXT A LEADER';
    var note = document.getElementById('events-note');
    var bottom = document.getElementById('memories-bottom');
    var host = note || bottom;
    if (host && host.parentNode === box) {
      if (btn.previousElementSibling !== host) host.insertAdjacentElement('afterend', btn);
    } else if (box.lastElementChild !== btn) {
      box.appendChild(btn);
    }
    var dup = document.getElementById('memories-text-leader');
    if (dup && dup !== btn) {
      try { dup.remove(); } catch (e) {}
    }
  }

  place();
  setTimeout(place, 400);
  var view = document.getElementById('view-events');
  if (view && window.MutationObserver && view.dataset.tbLeadMem !== '1') {
    view.dataset.tbLeadMem = '1';
    new MutationObserver(place).observe(view, { childList: true, subtree: true });
  }

  if (!document.querySelector('link[href*="text-leader-mem.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/text-leader-mem.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
