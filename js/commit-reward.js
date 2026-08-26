/* 20260826-commit1 — shared commit snap. Not a game. Not sound. Not confetti. */
(function () {
  try {
    if (window.TB_CONFIG && window.TB_CONFIG.SENSORY) {
      window.TB_CONFIG.SENSORY.soundEnabled = false;
    }
  } catch (e0) {}

  var STYLE = [
    'html.tb-commit-hold #in-count{opacity:0;transition:opacity .28s ease;}',
    'html.tb-commit-breathe .next-meeting{animation:tb-commit-breathe .9s ease-in-out 1;}',
    '@keyframes tb-commit-breathe{0%{transform:scale(1)}40%{transform:scale(1.018)}100%{transform:scale(1)}}',
    '.tb-commit-line{font:700 15px/1.2 -apple-system,BlinkMacSystemFont,sans-serif;color:#FEF105;letter-spacing:.04em;text-align:center;margin:10px 0 0;}',
    '#rsvp-btn.confirmed{background:#FEF105;color:#000;}'
  ].join('');

  function injectCss() {
    if (document.getElementById('tb-commit-style')) return;
    var s = document.createElement('style');
    s.id = 'tb-commit-style';
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  function load(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, String(v)); } catch (e) {}
  }
  function meetKey() {
    try {
      var el = document.getElementById('next-meeting-date');
      if (el && el.textContent) return String(el.textContent).replace(/\s+/g, ' ').trim();
    } catch (e) {}
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1);
  }
  function press(el) {
    try { if (window.tbFeedback && window.tbFeedback.press) window.tbFeedback.press(el); } catch (e) {}
    if (el && el.classList) {
      el.classList.add('tb-press');
      setTimeout(function () { try { el.classList.remove('tb-press'); } catch (e2) {} }, 140);
    }
  }
  function confirm() {
    try { if (window.tbFeedback && window.tbFeedback.confirm) window.tbFeedback.confirm(); } catch (e) {}
  }
  function glow(el) {
    try { if (typeof window.tbGlowHit === 'function') window.tbGlowHit(el, 'yellow'); } catch (e) {}
  }

  function peakA() {
    if (load('tbCommitA')) return;
    save('tbCommitA', '1');
    confirm();
    var card = document.querySelector('.next-meeting');
    glow(card);
    var status = document.getElementById('rsvp-status');
    if (status) {
      status.textContent = "YOU'RE IN THE ROOM";
      status.classList.remove('hidden');
    }
    var line = document.getElementById('tb-commit-a-line');
    if (!line && card) {
      line = document.createElement('div');
      line.id = 'tb-commit-a-line';
      line.className = 'tb-commit-line';
      line.textContent = "YOU'RE IN THE ROOM";
      card.appendChild(line);
      setTimeout(function () {
        try { if (line && line.parentNode) line.parentNode.removeChild(line); } catch (e) {}
      }, 2800);
    }
  }
  window.tbCommitPeakA = peakA;

  function peakB(el, card, orig) {
    var key = 'tbCommitB:' + meetKey();
    if (load(key)) {
      if (typeof orig === 'function') orig(el, card);
      return;
    }
    save(key, '1');
    injectCss();
    document.documentElement.classList.add('tb-commit-hold', 'tb-commit-breathe');
    press(el);
    if (el) el.textContent = 'LOCKING IT IN…';
    setTimeout(function () {
      confirm();
      glow(el || card);
      if (typeof orig === 'function') orig(el, card);
    }, 280);
    setTimeout(function () {
      if (el) {
        el.classList.add('confirmed');
        el.textContent = "YOU'RE LOCKED IN";
      }
    }, 480);
    setTimeout(function () {
      document.documentElement.classList.remove('tb-commit-hold');
      glow(card);
      var names = document.getElementById('in-count-names');
      if (names) names.classList.add('count-tick');
    }, 780);
    setTimeout(function () {
      document.documentElement.classList.remove('tb-commit-breathe');
    }, 1800);
  }

  function wrapLockedIn() {
    var fx = window.ThunderFX;
    if (!fx || fx._tbCommitWrap) return false;
    var orig = fx.lockedIn && fx.lockedIn.bind(fx);
    fx.lockedIn = function (el, card) {
      peakB(el, card, orig);
    };
    fx._tbCommitWrap = true;
    return true;
  }

  function wrapReward() {
    var fn = window.rewardSaveSuccess;
    if (!fn || fn._tbCommitWrap) return false;
    window.rewardSaveSuccess = function (kind) {
      if (kind === 'profile' && load('tbCommitC')) {
        confirm();
        glow(document.getElementById('save-profile'));
        return;
      }
      if (kind === 'profile') save('tbCommitC', '1');
      return fn(kind);
    };
    window.rewardSaveSuccess._tbCommitWrap = true;
    return true;
  }

  function boot() {
    injectCss();
    wrapLockedIn();
    wrapReward();
    var n = 0;
    var t = setInterval(function () {
      wrapLockedIn();
      wrapReward();
      n += 1;
      if (n > 40) clearInterval(t);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
