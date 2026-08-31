/* 20260830-home-ping — GET THE PING under LOCKED IN. Same card. No extra Home job. */
(function () {
  if (window.__tbHomePing) return;
  window.__tbHomePing = true;

  function inNow() {
    var btn = document.getElementById('rsvp-btn');
    return !!(btn && btn.classList.contains('confirmed'));
  }

  function subscribed() {
    try { return localStorage.getItem('tb_gatheringAlertsOn') === 'true' || localStorage.getItem('gatheringAlertsOn') === 'true'; } catch (e) { return false; }
  }

  function place() {
    var card = document.querySelector('#view-home .next-meeting');
    if (!card) return;
    var el = document.getElementById('tb-home-ping');
    if (!el) {
      el = document.createElement('button');
      el.type = 'button';
      el.id = 'tb-home-ping';
      var after = document.getElementById('rsvp-add-cal') || document.getElementById('rsvp-status');
      if (after && after.parentNode) after.parentNode.insertBefore(el, after.nextSibling);
      else card.appendChild(el);
      el.addEventListener('click', function () {
        if (el.classList.contains('is-on')) return;
        var tog = document.getElementById('gathering-alerts-toggle');
        if (tog) {
          tog.checked = true;
          tog.dispatchEvent(new Event('change', { bubbles: true }));
        }
        el.textContent = 'PING ON';
        el.classList.add('is-on');
      });
    }
    if (!inNow()) {
      el.classList.add('hidden');
      return;
    }
    el.classList.remove('hidden');
    if (subscribed() || el.classList.contains('is-on')) {
      el.textContent = 'PING ON';
      el.classList.add('is-on');
    } else {
      el.textContent = 'GET THE PING';
      el.classList.remove('is-on');
    }
  }

  var btn = document.getElementById('rsvp-btn');
  if (btn && window.MutationObserver) {
    new MutationObserver(place).observe(btn, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'rsvp-btn') setTimeout(place, 80);
  }, true);
  place();

  if (!document.querySelector('link[href*="home-ping.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/home-ping.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
