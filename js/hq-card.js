/* 20260830-hq-card — SAVE THUNDER HQ vCard. Does not retarget TEXT A LEADER. */
(function () {
  if (window.__tbHqCard) return;
  window.__tbHqCard = true;

  var HREF = 'assets/thunder-hq.vcf';

  function place() {
    var lead = document.getElementById('text-leader-btn');
    if (!lead || document.getElementById('tb-hq-save')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'tb-hq-save';
    b.textContent = 'SAVE THUNDER HQ';
    lead.insertAdjacentElement('afterend', b);
    b.addEventListener('click', save);
  }

  function save() {
    var a = document.createElement('a');
    a.href = HREF;
    a.download = 'Sons-of-Thunder-HQ.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  place();
  var grid = document.getElementById('brothers-grid');
  if (grid && window.MutationObserver) {
    new MutationObserver(place).observe(grid, { childList: true });
  }

  if (!document.querySelector('link[href*="hq-card.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/hq-card.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
