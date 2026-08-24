/* hangout4: Brothers slide heads open unique nights. Official faces only. No painted stills. TAKE THE TOUR only. */
(function () {
  if (window.__tbHangoutTour8) return;
  window.__tbHangoutTour8 = true;

  var FACE = 'assets/tour-faces/';
  var SCENES = {
    smirk: {
      mood: 'patio',
      heads: ['thunder-smirk.png', 'thunder-hat.png'],
      talk: ["You coming Monday?", "That's the door."],
      feat: 'I\'M IN',
      door: 'I\'M IN'
    },
    cool: {
      mood: 'patio',
      heads: ['thunder-smirk.png', 'thunder-hat.png'],
      talk: ["You coming Monday?", "That's the door."],
      feat: 'I\'M IN',
      door: 'I\'M IN'
    },
    hat: {
      mood: 'camp',
      heads: ['thunder-hat.png', 'thunder-patrol.png'],
      talk: ["The room is the point.", "Find your seat."],
      feat: 'HOME',
      door: 'BACK TO THE GRID'
    },
    cigar: {
      mood: 'fire',
      heads: ['thunder-cigar.png', 'thunder-grin-eyes.png'],
      talk: ["Rough night?", "Say it here."],
      feat: 'ASK THUNDER',
      door: 'ASK'
    },
    tough: {
      mood: 'read',
      heads: ['thunder-beard-eyes.png', 'thunder-smirk.png'],
      talk: ["Quiet's fine.", "When it isn't, ask."],
      feat: 'THE WORD',
      door: 'BACK TO THE GRID'
    },
    dad: {
      mood: 'grill',
      heads: ['thunder-stache-eyes.png', 'thunder-grin-eyes.png'],
      talk: ["This night stays.", "Drop the pic."],
      feat: 'MEMORIES',
      door: 'DROP A PIC'
    },
    hippie: {
      mood: 'pickle',
      heads: ['thunder-bandana.png', 'thunder-smirk.png'],
      talk: ["You're not alone.", "Different faces. Same storm."],
      feat: 'BROTHERS',
      door: 'THE ROUND TABLE'
    },
    soldier: {
      mood: 'range',
      heads: ['thunder-patrol.png', 'thunder-beard-eyes.png'],
      talk: ["Nobody sits this one alone.", "Honor him. One text."],
      feat: 'TEXT A LEADER',
      door: 'TEXT A LEADER'
    },
    goof: {
      mood: 'bday',
      heads: ['thunder-grin-eyes.png', 'thunder-hat.png', 'thunder-smirk.png'],
      talk: ["Honor him.", "One text. Then Monday."],
      feat: 'TEXT A LEADER',
      door: 'BACK TO THE GRID'
    },
    laugh: {
      mood: 'lake',
      heads: ['thunder-laugh.png', 'thunder-bandana.png'],
      talk: ["Party's on the patio.", "Come as you are."],
      feat: 'MISSION',
      door: 'BACK TO THE GRID'
    }
  };

  function keyFrom(img) {
    var src = (img.getAttribute('src') || '').toLowerCase();
    var p = (img.getAttribute('data-persona') || '').toLowerCase();
    if (src.indexOf('laugh') >= 0) return 'laugh';
    if (src.indexOf('grin') >= 0) return 'goof';
    if (src.indexOf('patrol') >= 0) return 'soldier';
    if (src.indexOf('bandana') >= 0) return 'hippie';
    if (src.indexOf('stache') >= 0) return 'dad';
    if (src.indexOf('beard') >= 0) return 'tough';
    if (src.indexOf('cigar') >= 0) return 'cigar';
    if (src.indexOf('hat') >= 0) return 'hat';
    if (src.indexOf('smirk') >= 0) return 'smirk';
    if (SCENES[p]) return p;
    return 'smirk';
  }

  function sceneRoot() {
    var stage = document.querySelector('#tb-tour .tb-tour-stage');
    if (!stage) return null;
    var el = stage.querySelector('.tb-hang-scene');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'tb-hang-scene';
    el.innerHTML =
      '<button type="button" class="tb-hang-back">GRID</button>' +
      '<div class="tb-hang-heads"></div>' +
      '<p class="tb-hang-talk a"></p>' +
      '<p class="tb-hang-talk b"></p>' +
      '<p class="tb-hang-feat"></p>' +
      '<button type="button" class="tb-hang-door"></button>';
    stage.appendChild(el);
    function exit(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      closeScene();
    }
    el.querySelector('.tb-hang-back').addEventListener('click', exit, true);
    el.querySelector('.tb-hang-door').addEventListener('click', function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      var key = el.getAttribute('data-key') || 'smirk';
      goFeature(SCENES[key] || SCENES.smirk);
    }, true);
    el.addEventListener('click', function (e) {
      if (e.target === el) exit(e);
    }, true);
    return el;
  }

  function closeScene() {
    var el = document.querySelector('#tb-tour .tb-hang-scene');
    if (!el) return;
    el.classList.remove('on');
    el.removeAttribute('data-mood');
  }
  window.__tbHangClose = closeScene;

  function onBrothersSlide() {
    var stage = document.querySelector('#tb-tour .tb-tour-stage');
    if (stage && stage.getAttribute('data-board') === '2') return true;
    var on = document.querySelector('#tb-tour .tb-live-slide.is-on .tb-live-bros');
    if (on) return true;
    var h = document.getElementById('tb-tour-headline');
    return !!(h && /BROTHERS/i.test(h.textContent || ''));
  }

  function closeTour() {
    var b = document.getElementById('tb-tour-close') || document.getElementById('tb-tour-skip');
    if (b) b.click();
  }

  function goFeature(spec) {
    closeScene();
    var door = String((spec && spec.door) || '').toUpperCase();
    var feat = String((spec && spec.feat) || '').toUpperCase();
    if (door.indexOf('GRID') >= 0 || door.indexOf('ROUND TABLE') >= 0) return;
    closeTour();
    setTimeout(function () {
      if (feat.indexOf('ASK') >= 0 || door === 'ASK') {
        var fab = document.getElementById('thunder-fab');
        if (fab) fab.click();
        return;
      }
      if (feat.indexOf('MEMOR') >= 0 || door.indexOf('DROP') >= 0) {
        var ev = document.querySelector('.nav-item[data-view="events"]');
        if (ev) ev.click();
        return;
      }
      if (door.indexOf('TEXT') >= 0 || feat.indexOf('TEXT') >= 0) {
        var t = document.getElementById('text-leader-btn');
        if (t) t.click();
        return;
      }
      if (feat.indexOf("I'M IN") >= 0 || door.indexOf("I'M IN") >= 0) {
        var home = document.querySelector('.nav-item[data-view="home"]');
        if (home) home.click();
      }
    }, 120);
  }

  function openScene(key) {
    var spec = SCENES[key] || SCENES.smirk;
    var el = sceneRoot();
    if (!el) return;
    el.setAttribute('data-mood', spec.mood);
    var box = el.querySelector('.tb-hang-heads');
    box.innerHTML = spec.heads.map(function (f) {
      return '<img src="' + FACE + f + '" alt="" />';
    }).join('');
    el.querySelector('.tb-hang-talk.a').textContent = spec.talk[0] || '';
    el.querySelector('.tb-hang-talk.b').textContent = spec.talk[1] || '';
    el.querySelector('.tb-hang-feat').textContent = spec.feat || '';
    el.querySelector('.tb-hang-door').textContent = spec.door || 'BACK';
    el.setAttribute('data-key', key);
    el.classList.add('on');
  }

  function bind() {
    var tour = document.getElementById('tb-tour');
    if (!tour || tour.dataset.hang8 === '1') return;
    tour.dataset.hang8 = '1';
    tour.addEventListener('click', function (e) {
      var door = e.target && e.target.closest && e.target.closest('.tb-hang-door');
      if (door) {
        e.preventDefault();
        e.stopPropagation();
        var scene = document.querySelector('#tb-tour .tb-hang-scene.on');
        var key = scene && scene.getAttribute('data-key') || 'smirk';
        goFeature(SCENES[key] || SCENES.smirk);
        return;
      }
      var back = e.target && e.target.closest && e.target.closest('.tb-hang-back');
      if (back) {
        e.preventDefault();
        e.stopPropagation();
        closeScene();
        return;
      }
      var open = document.querySelector('#tb-tour .tb-hang-scene.on');
      if (open) return;
      var cell = e.target && e.target.closest && e.target.closest('#tb-tour .tb-live-bro, #tb-tour .tb-live-face');
      if (!cell) return;
      return;
    }, true);
  }

  document.addEventListener('click', function (e) {
    var n = e.target && e.target.closest && e.target.closest('#tb-tour-next, #tb-tour-back, #tb-tour-skip, #tb-tour-close');
    if (n) closeScene();
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
