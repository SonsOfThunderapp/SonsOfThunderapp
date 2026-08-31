/* 20260830-seat-welcome — copy + bolt on the lock sheet. No new door. */
(function () {
  if (window.__tbSeatWelcome) return;
  window.__tbSeatWelcome = true;

  function dress() {
    var gate = document.getElementById('auth-gate');
    var card = gate && gate.querySelector('.auth-card');
    if (!card) return;
    if (!card.querySelector('.tb-seat-mark')) {
      var img = document.createElement('img');
      img.className = 'tb-seat-mark';
      img.src = 'assets/logo-bolt-isolated.png';
      img.alt = '';
      var title = document.getElementById('auth-title');
      if (title) card.insertBefore(img, title);
      else card.insertBefore(img, card.firstChild);
    }
    var sub = document.getElementById('auth-sub');
    if (sub) {
      sub.classList.remove('hidden');
      sub.textContent = 'Welcome to the Brotherhood. Lock this seat so the room knows your name.';
    }
    var nameEl = document.getElementById('auth-name');
    if (nameEl && !String(nameEl.value || '').trim()) {
      try { nameEl.focus(); } catch (eF) {}
    }
    var pass = document.getElementById('auth-password');
    if (pass) {
      pass.classList.remove('hidden');
      pass.removeAttribute('hidden');
      pass.setAttribute('aria-hidden', 'false');
      pass.setAttribute('tabindex', '0');
      pass.setAttribute('autocomplete', 'current-password');
      pass.setAttribute('name', 'password');
      if (!pass.previousElementSibling || !pass.previousElementSibling.classList.contains('tb-pass-label')) {
        var lab = document.createElement('label');
        lab.className = 'tb-pass-label';
        lab.setAttribute('for', 'auth-password');
        lab.textContent = 'Password';
        pass.parentNode.insertBefore(lab, pass);
      }
    }
  }

  var gate = document.getElementById('auth-gate');
  if (gate && window.MutationObserver) {
    new MutationObserver(function () {
      if (!gate.classList.contains('hidden')) dress();
    }).observe(gate, { attributes: true, attributeFilter: ['class'] });
  }
  dress();

  if (!document.querySelector('link[href*="seat-welcome.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/seat-welcome.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
