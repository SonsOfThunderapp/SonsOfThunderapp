/* 20260827-proof1: Choice 2 Proof hero. Do not invent faces. */
(function () {
  function clickUpload() {
    var btn = document.getElementById('upload-media-btn');
    if (btn) btn.click();
  }
  function bindEmpty(el) {
    if (!el || el.dataset.proofBound === '1') return;
    el.dataset.proofBound = '1';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      clickUpload();
    });
    var t = el.querySelector('.empty-memories-title');
    if (t) t.textContent = 'Drop the first photo.';
  }
  function countThumbs() {
    var n = 0;
    var hero = document.getElementById('media-hero');
    var feed = document.getElementById('media-feed');
    if (hero) n += hero.querySelectorAll('.media-thumb').length;
    if (feed) n += feed.querySelectorAll('.media-thumb').length;
    return n;
  }
  function paint() {
    var card = document.getElementById('next-mission-card');
    if (card) card.classList.add('mission-strip', 'mission-mode');

    var hero = document.getElementById('media-hero');
    if (hero && hero.querySelector('.media-thumb')) hero.classList.remove('hidden');

    var feed = document.getElementById('media-feed');
    if (feed) {
      var first = feed.querySelector('.media-thumb');
      if (first && !(hero && hero.querySelector('.media-thumb'))) {
        first.classList.add('media-thumb-featured');
      }
      bindEmpty(feed.querySelector('#empty-memories-cta, #empty-memories-cta-static, .empty-memories-cta'));
    }
    bindEmpty(document.getElementById('empty-memories-cta-static'));

    var title = document.getElementById('memories-section-title');
    if (title) {
      var n = countThumbs();
      title.textContent = n > 0 ? ('Proof · ' + n) : 'Past Gatherings';
      try { if (typeof window.updateAllNewBadges === 'function') window.updateAllNewBadges(); } catch (e) {}
    }
  }

  function swipeBlock(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#media-feed, #upcoming-events, #next-mission-card, #upload-media-btn, .section-header, #media-hero')) {
      e.stopImmediatePropagation();
    }
  }
  document.addEventListener('touchstart', swipeBlock, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  var n = 0;
  var iv = setInterval(function () {
    paint();
    n += 1;
    if (n > 40) clearInterval(iv);
  }, 400);
})();
