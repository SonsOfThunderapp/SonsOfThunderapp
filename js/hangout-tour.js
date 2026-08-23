/* hangout4: Brothers slide heads open unique nights. Official faces only. No painted stills. TAKE THE TOUR only. */
(function () {
  if (window.__tbHangoutTour4) return;
  window.__tbHangoutTour4 = true;

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
    el.querySelector('.tb-hang-back').addEventListener('click', closeScene);
    el.querySelector('.tb-hang-door').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeScene();
    });
    return el;
  }

  function closeScene() {
    var el = document.querySelector('#tb-tour .tb-hang-scene');
    if (el) el.classList.remove('on');
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
    el.classList.add('on');
  }

  function bind() {
    var tour = document.getElementById('tb-tour');
    if (!tour || tour.dataset.hang4 === '1') return;
    tour.dataset.hang4 = '1';
    tour.addEventListener('click', function (e) {
      var img = e.target && e.target.closest && e.target.closest('#tb-tour .tb-live-face');
      if (!img) return;
      var stage = document.querySelector('#tb-tour .tb-tour-stage');
      if (!stage || stage.getAttribute('data-board') !== '2') return;
      e.preventDefault();
      e.stopPropagation();
      openScene(keyFrom(img));
    }, true);
  }

  document.addEventListener('click', function (e) {
    var n = e.target && e.target.closest && e.target.closest('#tb-tour-next, #tb-tour-back, #tb-tour-skip, #tb-tour-close');
    if (n) closeScene();
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
