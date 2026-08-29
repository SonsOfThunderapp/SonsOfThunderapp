(function () {
  if (window.__tbHomeFilmPoster) return;
  window.__tbHomeFilmPoster = true;

  var SRC = 'https://mnsempcgomukcpofgvlm.supabase.co/storage/v1/object/public/thunder-theater/theater/current.mp4';
  var POSTER = 'USE_FILE';
  var BOLT = '/assets/icon-official.png';

  function addTheater(done) {
    function ready() {
      if (window.ThunderTheater && typeof window.ThunderTheater.open === 'function') {
        done();
        return true;
      }
      return false;
    }
    if (ready()) return;
    if (!document.querySelector('link[href*="tb-theater.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/tb-theater.css';
      document.head.appendChild(l);
    }
    if (!document.querySelector('script[src*="tb-theater.js"]')) {
      var s = document.createElement('script');
      s.src = 'js/tb-theater.js';
      s.onload = function () { ready(); };
      document.body.appendChild(s);
    }
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (ready() || n > 40) clearInterval(t);
    }, 50);
  }

  function openSheet() {
    addTheater(function () {
      window.ThunderTheater.open({
        src: SRC,
        poster: POSTER,
        title: 'THIS MONTH'
      });
      var vid = document.getElementById('tb-theater-video') || document.querySelector('#tb-theater video');
      if (vid) {
        try { vid.preload = 'none'; } catch (e) {}
      }
    });
  }

  function mount() {
    if (document.getElementById('tb-home-film-tile')) return;
    var home = document.getElementById('view-home');
    if (!home) return;
    var card = home.querySelector('.next-meeting') || home.querySelector('.container');
    if (!card) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tb-home-film-tile';
    btn.setAttribute('aria-label', 'Play this month');
    btn.innerHTML = '<img alt="This Month" width="720" height="1280">';
    var img = btn.querySelector('img');
    img.src = POSTER;
    img.addEventListener('error', function () {
      img.src = BOLT;
      img.style.objectFit = 'contain';
      img.style.padding = '18%';
      img.style.background = '#000';
    });
    if (card.parentNode) {
      if (card.nextSibling) card.parentNode.insertBefore(btn, card.nextSibling);
      else card.parentNode.appendChild(btn);
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      btn.classList.add('tb-film-rise');
      openSheet();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
