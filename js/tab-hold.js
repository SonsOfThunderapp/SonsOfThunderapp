(function () {
  if (window.__tbTabHold) return;
  window.__tbTabHold = true;

  function inSheet(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('.modal, #brother-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-panel, #axum-drop, #tb-tour');
  }
  function sheetRoot(t) {
    if (!t || !t.closest) return null;
    return t.closest('.modal, #brother-detail, #profile-modal, #memory-viewer, #tb-theater, #thunder-panel, #axum-drop, #tb-tour');
  }
  function panelOf(root) {
    if (!root) return null;
    return root.querySelector('.modal-content, .brother-detail-panel, .thunder-panel, .tb-theater-stage') || root;
  }
  function closeSheet(root) {
    if (!root) return;
    var btn = root.querySelector('.brother-detail-close, .modal-close, [aria-label="Close"], #contact-swap-close, .tb-theater-close');
    if (btn) { btn.click(); return; }
    root.classList.add('hidden');
    root.setAttribute('aria-hidden', 'true');
  }

  var tab = { x: 0, y: 0, on: false };
  document.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    if (inSheet(e.target)) { tab.on = false; return; }
    tab.on = true;
    tab.x = e.touches[0].clientX;
    tab.y = e.touches[0].clientY;
  }, true);
  document.addEventListener('touchmove', function (e) {
    if (!tab.on || !e.touches || !e.touches[0]) return;
    if (inSheet(e.target)) return;
    var dx = e.touches[0].clientX - tab.x;
    var dy = e.touches[0].clientY - tab.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('touchend', function () { tab.on = false; }, true);
  document.addEventListener('touchcancel', function () { tab.on = false; }, true);

  var hold = { root: null, panel: null, y: 0, dy: 0, on: false };
  function resetPanel() {
    if (!hold.panel) return;
    hold.panel.classList.add('tb-sheet-snap');
    hold.panel.style.transform = '';
    hold.panel.style.opacity = '';
    var p = hold.panel;
    setTimeout(function () { if (p) p.classList.remove('tb-sheet-snap'); }, 220);
  }
  document.addEventListener('touchstart', function (e) {
    var root = sheetRoot(e.target);
    if (!root || !e.touches || !e.touches[0]) return;
    if (e.target.closest && e.target.closest('button, a, input, textarea, select')) return;
    hold.root = root;
    hold.panel = panelOf(root);
    hold.y = e.touches[0].clientY;
    hold.dy = 0;
    hold.on = true;
    if (hold.panel) {
      hold.panel.classList.remove('tb-sheet-snap');
      hold.panel.style.transition = 'none';
    }
  }, true);
  document.addEventListener('touchmove', function (e) {
    if (!hold.on || !hold.panel || !e.touches || !e.touches[0]) return;
    hold.dy = e.touches[0].clientY - hold.y;
    if (hold.dy < 0) hold.dy = 0;
    hold.panel.style.transform = 'translateY(' + hold.dy + 'px)';
    hold.panel.style.opacity = String(Math.max(0.45, 1 - hold.dy / 420));
    if (hold.dy > 8) {
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('touchend', function () {
    if (!hold.on) return;
    var root = hold.root;
    var dy = hold.dy;
    hold.on = false;
    if (dy >= 120) {
      closeSheet(root);
      resetPanel();
    } else {
      resetPanel();
    }
    hold.root = null;
    hold.panel = null;
    hold.dy = 0;
  }, true);
  document.addEventListener('touchcancel', function () {
    if (!hold.on) return;
    hold.on = false;
    resetPanel();
    hold.root = null;
    hold.panel = null;
    hold.dy = 0;
  }, true);
})();
