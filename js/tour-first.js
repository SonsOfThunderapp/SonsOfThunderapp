/* First visit: walk the room. Returners who already finished stay quiet.
   More → TAKE THE TOUR still replays. Patio QR and magic-link sign-in skip. */
(function () {
  var started = false;

  function tourDone() {
    try {
      var raw = localStorage.getItem('tb_thunderTourV42');
      var s = raw ? JSON.parse(raw) : null;
      return !!(s && s.done);
    } catch (e) { return false; }
  }

  function fromPatio() {
    try { return sessionStorage.getItem('tb_patio') === '1'; } catch (e) { return false; }
  }

  function authLanding() {
    try {
      var h = String(location.hash || '');
      var s = String(location.search || '');
      return /access_token|refresh_token|type=magiclink|type=signup|type=recovery/i.test(h + s);
    } catch (e) { return false; }
  }

  function splashClear() {
    try {
      if (sessionStorage.getItem('tb_splash_done') === '1') return true;
    } catch (e) {}
    var el = document.getElementById('splash');
    if (!el) return true;
    return el.classList.contains('splash-done') || el.classList.contains('hidden') || el.classList.contains('splash-out');
  }

  function markOffered() {
    try { localStorage.setItem('tb_tb_tour_offered', '1'); } catch (e) {}
  }

  function go() {
    if (started) return;
    if (tourDone()) return;
    if (fromPatio()) return;
    if (authLanding()) return;
    if (document.body && document.body.classList.contains('tb-tour-open')) return;
    if (typeof window.startTour !== 'function') return;
    if (!splashClear()) return;
    started = true;
    markOffered();
    try { window.startTour(); } catch (e) { started = false; }
  }

  function tick() {
    try { go(); } catch (e) {}
    if (started || tourDone()) return;
    setTimeout(tick, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 800); });
  } else {
    setTimeout(tick, 800);
  }
  setTimeout(tick, 2600);
})();
