/* 20260823-gold1g: paint when open. Kill leftover inline flex when closed. Pin bubble to glass. */
(function () {
  function punchSplash() {
    var s = document.getElementById('splash');
    if (s) {
      s.classList.add('hidden', 'splash-done');
      s.style.setProperty('display', 'none', 'important');
    }
  }
  punchSplash();
  setTimeout(punchSplash, 0);
  setTimeout(punchSplash, 200);

  function pinBubble() {
    var root = document.getElementById('tb-tour');
    if (!root) return;
    root.style.setProperty('overflow-x', 'hidden', 'important');
    root.style.setProperty('width', '100%', 'important');
    root.style.setProperty('max-width', '100%', 'important');
    root.style.setProperty('left', '0', 'important');
    root.style.setProperty('right', '0', 'important');
    var stage = root.querySelector('.tb-tour-stage');
    if (stage) {
      stage.style.setProperty('max-width', '100%', 'important');
      stage.style.setProperty('width', '100%', 'important');
      stage.style.setProperty('overflow-x', 'hidden', 'important');
      stage.style.setProperty('left', '0', 'important');
      stage.style.setProperty('right', '0', 'important');
      stage.style.setProperty('margin', '0', 'important');
      stage.style.setProperty('box-sizing', 'border-box', 'important');
    }
    var hero = root.querySelector('.tb-tour-hero');
    if (hero) {
      hero.style.setProperty('width', '100%', 'important');
      hero.style.setProperty('max-width', '100%', 'important');
      hero.style.setProperty('overflow', 'visible', 'important');
      hero.style.setProperty('box-sizing', 'border-box', 'important');
      hero.style.setProperty('padding-left', '10px', 'important');
      hero.style.setProperty('padding-right', '10px', 'important');
    }
    var host = document.getElementById('tb-tour-host');
    if (host) {
      host.style.setProperty('width', '72px', 'important');
      host.style.setProperty('max-width', '72px', 'important');
      host.style.setProperty('flex', '0 0 72px', 'important');
    }
    var bubbles = root.querySelectorAll('.tb-guide-bubble');
    var i;
    for (i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.style.setProperty('position', 'relative', 'important');
      b.style.setProperty('left', 'auto', 'important');
      b.style.setProperty('right', 'auto', 'important');
      b.style.setProperty('width', 'auto', 'important');
      b.style.setProperty('max-width', 'none', 'important');
      b.style.setProperty('flex', '1 1 auto', 'important');
      b.style.setProperty('min-width', '0', 'important');
      b.style.setProperty('transform', 'none', 'important');
      b.style.setProperty('box-sizing', 'border-box', 'important');
    }
  }

  function killTour() {
    if (document.body.classList.contains('tb-tour-open')) return;
    var root = document.getElementById('tb-tour');
    if (!root) return;
    root.classList.add('hidden');
    root.setAttribute('aria-hidden', 'true');
    root.style.setProperty('display', 'none', 'important');
    root.style.setProperty('pointer-events', 'none', 'important');
  }

  function paintTour() {
    var root = document.getElementById('tb-tour');
    if (!root) return;
    if (!document.body.classList.contains('tb-tour-open')) return;
    root.classList.remove('hidden', 'splash-done', 'splash-out');
    root.removeAttribute('hidden');
    root.setAttribute('aria-hidden', 'false');
    root.style.setProperty('display', 'flex', 'important');
    root.style.setProperty('visibility', 'visible', 'important');
    root.style.setProperty('opacity', '1', 'important');
    root.style.setProperty('z-index', '50000', 'important');
    root.style.removeProperty('pointer-events');
    var host = document.getElementById('tb-tour-host');
    if (host) {
      host.style.removeProperty('display');
      host.style.removeProperty('opacity');
    }
    pinBubble();
  }

  function sync() {
    if (document.body.classList.contains('tb-tour-open')) paintTour();
    else killTour();
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('#replay-tour-btn, #take-tour-btn, #tb-tour-skip, #tb-tour-close, #tb-tour-next');
    if (!el) return;
    if (el.id === 'tb-tour-skip' || el.id === 'tb-tour-close') {
      setTimeout(killTour, 0);
      setTimeout(killTour, 80);
      setTimeout(sync, 300);
      return;
    }
    setTimeout(paintTour, 0);
    setTimeout(paintTour, 50);
    setTimeout(paintTour, 250);
    setTimeout(paintTour, 900);
  }, true);

  function watch() {
    if (!document.body) return;
    var mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
