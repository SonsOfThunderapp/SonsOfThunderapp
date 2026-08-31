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
    if (seated()) return;
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
  var DEFAULT = 'Your chair is open. Fill it so a brother knows who is standing next to him.';
  var KEY = 'tb_chair_line';
  function copy() {
    try {
      var t = (localStorage.getItem(KEY) || '').trim();
      return t || DEFAULT;
    } catch (eR) {
      return DEFAULT;
    }
  }
  function line() {
    var head = document.querySelector('#view-brothers .section-header');
    if (!head || !head.parentNode) return;
    var el = document.getElementById('tb-chair-line');
    if (!el) {
      el = document.createElement('p');
      el.id = 'tb-chair-line';
      el.className = 'tb-chair-line';
      head.insertAdjacentElement('afterend', el);
    }
    el.textContent = copy();
  }
  window.__tbChairLinePaint = line;
  function parkSignout() {
    var src = document.getElementById('auth-signout-btn');
    var grid = document.getElementById('brothers-grid');
    if (!src || !grid || !seated()) return;
    var park = document.getElementById('tb-signout-park');
    if (!park) {
      park = document.createElement('button');
      park.id = 'tb-signout-park';
      park.type = 'button';
      park.textContent = 'Sign out';
      park.addEventListener('click', function () { src.click(); });
      var lead = document.getElementById('text-leader-btn');
      if (lead && lead.parentNode) lead.insertAdjacentElement('afterend', park);
      else grid.insertAdjacentElement('afterend', park);
    }
  }
  function bootLine() { line(); parkSignout(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLine);
  else bootLine();
  var bar = document.getElementById('auth-session-bar');
  if (bar && window.MutationObserver) {
    new MutationObserver(bootLine).observe(bar, { attributes: true, attributeFilter: ['class'] });
  }
})();

/* Leadership editor — More → Leadership → Edit Brothers Line */
(function () {
  if (window.__tbChairEdit) return;
  window.__tbChairEdit = true;
  var KEY = 'tb_chair_line';
  var DEFAULT = 'Your chair is open. Fill it so a brother knows who is standing next to him.';

  function placeBtn() {
    var box = document.getElementById('leader-tools');
    if (!box || document.getElementById('admin-chair-line-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'admin-chair-line-btn';
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.textContent = 'Edit Brothers Line';
    btn.style.cssText = 'width:100%;margin-top:10px;';
    var after = document.getElementById('admin-code-btn');
    if (after && after.parentNode === box) after.insertAdjacentElement('afterend', btn);
    else box.appendChild(btn);
    btn.addEventListener('click', open);
  }

  function sheet() {
    var m = document.getElementById('admin-chair-line-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'admin-chair-line-modal';
    m.className = 'modal hidden';
    m.innerHTML =
      '<div class="modal-card tb-chair-edit-card">' +
        '<button type="button" class="modal-close" id="tb-chair-line-x" aria-label="Close">×</button>' +
        '<h2 class="modal-title">EDIT <span class="accent-yellow">BROTHERS LINE</span></h2>' +
        '<p class="tb-chair-edit-hint">Under the Brothers title. Keep it one breath.</p>' +
        '<textarea id="tb-chair-line-input" rows="3" maxlength="140"></textarea>' +
        '<button type="button" id="tb-chair-line-save" class="btn-rsvp" style="width:100%;margin-top:12px;">SAVE LINE</button>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    var x = document.getElementById('tb-chair-line-x');
    if (x) x.addEventListener('click', close);
    var save = document.getElementById('tb-chair-line-save');
    if (save) save.addEventListener('click', persist);
    return m;
  }

  function open() {
    var box = document.getElementById('leader-tools');
    if (!box || box.classList.contains('hidden')) return;
    var m = sheet();
    var ta = document.getElementById('tb-chair-line-input');
    var cur = '';
    try { cur = (localStorage.getItem(KEY) || '').trim(); } catch (eR) {}
    if (ta) ta.value = cur || DEFAULT;
    m.classList.remove('hidden');
  }

  function close() {
    var m = document.getElementById('admin-chair-line-modal');
    if (m) m.classList.add('hidden');
  }

  function persist() {
    var ta = document.getElementById('tb-chair-line-input');
    var t = ta ? String(ta.value || '').trim() : '';
    if (t.length > 140) t = t.slice(0, 140);
    if (!t) t = DEFAULT;
    try { localStorage.setItem(KEY, t); } catch (eS) {}
    if (typeof window.__tbChairLinePaint === 'function') window.__tbChairLinePaint();
    close();
  }

  function boot() { placeBtn(); sheet(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  if (!document.getElementById('tb-chair-spot-css')) {
    var st = document.createElement('style');
    st.id = 'tb-chair-spot-css';
    st.textContent =
      '#brother-open-chair .brother-slot-sub,#view-brothers .brother-chair .brother-slot-sub{font-size:0!important;line-height:0!important;color:transparent!important}' +
      '#brother-open-chair .brother-slot-sub::after,#view-brothers .brother-chair .brother-slot-sub::after{content:"This chair isn’t getting any warmer.";font-size:15px;line-height:1.35;font-weight:600;color:#F2C94C;display:block;text-shadow:0 0 10px rgba(242,201,76,.28)}' +
      '#brother-open-chair .brother-slot-sub[data-tb-spot]::after,#view-brothers .brother-chair .brother-slot-sub[data-tb-spot]::after{content:attr(data-tb-spot)}';
    (document.head || document.documentElement).appendChild(st);
  }
  if (!document.querySelector('script[src*="chair-spot-rotate.js"]')) {
    var r = document.createElement('script');
    r.src = 'js/chair-spot-rotate.js';
    r.defer = true;
    (document.body || document.documentElement).appendChild(r);
  }
})();

