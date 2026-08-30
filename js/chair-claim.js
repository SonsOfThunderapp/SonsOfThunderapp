(function () {
  if (window.__tbChairClaim) return;
  window.__tbChairClaim = true;
  function claim(e) {
    var t = e.target && e.target.closest && e.target.closest('#brother-open-chair');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    t.setAttribute('aria-label', 'Claim your seat');
    if (typeof window.startMemberSignIn === 'function') {
      try { window.startMemberSignIn(); } catch (err) {}
      return;
    }
    var edit = document.getElementById('edit-profile-btn');
    if (edit && !edit.classList.contains('hidden')) {
      edit.click();
      return;
    }
    var btn = document.getElementById('auth-entry-btn') || document.getElementById('home-member-cta');
    if (btn) btn.click();
  }
  document.addEventListener('click', claim, true);

  function seated() {
    if (document.body.classList.contains('tb-seated')) return true;
    var bar = document.getElementById('auth-session-bar');
    if (bar && !bar.classList.contains('hidden')) return true;
    try {
      if (localStorage.getItem('tb_seat_locked')) return true;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (k.indexOf('auth-token') !== -1) {
          var v = localStorage.getItem(k) || '';
          if (v.indexOf('access_token') !== -1) return true;
        }
      }
    } catch (eC) {}
    return false;
  }
  function line() {
    var el = document.getElementById('tb-chair-line');
    if (seated()) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    if (el) return;
    var head = document.querySelector('#view-brothers .section-header');
    if (!head || !head.parentNode) return;
    var p = document.createElement('p');
    p.id = 'tb-chair-line';
    p.className = 'tb-chair-line';
    p.textContent = 'Your chair is open. Fill it so a brother knows who is standing next to him.';
    head.insertAdjacentElement('afterend', p);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', line);
  else line();
  var bar = document.getElementById('auth-session-bar');
  if (bar && window.MutationObserver) {
    new MutationObserver(line).observe(bar, { attributes: true, attributeFilter: ['class'] });
  }
})();
