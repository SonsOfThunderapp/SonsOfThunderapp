(function () {
  function $(id) { return document.getElementById(id); }
  function textLeader() {
    try {
      if (typeof window.openLeaderSms === 'function') window.openLeaderSms();
      else if ($('text-leader-btn')) $('text-leader-btn').click();
    } catch (e0) {}
  }
  function rack() {
    var view = $('view-events');
    if (!view) return null;
    var box = $('memories-bottom');
    if (!box) {
      box = document.createElement('div');
      box.id = 'memories-bottom';
      var wrap = view.querySelector('.container');
      if (wrap) wrap.appendChild(box);
    }
    if (!$('memories-bottom-label')) {
      var lab = document.createElement('div');
      lab.id = 'memories-bottom-label';
      lab.textContent = 'THE WORD';
      box.appendChild(lab);
    }
    if (!$('memories-bottom-ann')) {
      var ann = document.createElement('div');
      ann.id = 'memories-bottom-ann';
      ann.className = 'feed';
      box.appendChild(ann);
    }
    if (!$('memories-text-leader')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'memories-text-leader';
      btn.textContent = 'TEXT A LEADER';
      btn.addEventListener('click', function (e) { e.preventDefault(); textLeader(); });
      box.appendChild(btn);
    }
    return box;
  }
  function fillAnn() {
    var dest = $('memories-bottom-ann');
    var src = $('announcements');
    if (!dest) return;
    if (src && String(src.innerHTML || '').trim()) dest.innerHTML = src.innerHTML;
  }
  function killRss() {
    ['sharpen-section-title', 'activity-tags', 'activity-feed'].forEach(function (id) {
      var el = $(id);
      if (el && el.closest('#view-events')) {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });
  }
  function tick() { rack(); fillAnn(); killRss(); }
  function bind() {
    tick();
    var view = $('view-events');
    if (view && view.dataset.tbMemBottom !== '1') {
      view.dataset.tbMemBottom = '1';
      new MutationObserver(function () { tick(); }).observe(view, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 500);
  setTimeout(tick, 1400);
})();
