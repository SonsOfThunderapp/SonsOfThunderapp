/* 20260831-members-one — one auth.uid() → one roster seat. No second insert on lock. */
(function () {
  if (window.__tbMembersOne) return;
  window.__tbMembersOne = true;

  function saveId(id) {
    if (!id) return;
    try {
      localStorage.setItem('myProfileId', id);
      localStorage.setItem('tb_myProfileId', id);
    } catch (e) {}
  }

  function localBrothers() {
    try { return JSON.parse(localStorage.getItem('brothers') || '[]') || []; } catch (e) { return []; }
  }

  function mineFromLocal(email) {
    var list = localBrothers();
    var em = String(email || '').toLowerCase();
    var hit = list.filter(function (b) {
      if (!b) return false;
      var n = String(b.name || '').toLowerCase();
      var p = String(b.phone || '');
      var be = String(b.email || '').toLowerCase();
      return n === 'obie' || n === 'obie diaz' || (em && be === em);
    });
    if (hit.length) return hit[0];
    return null;
  }

  async function bind() {
    var sb = window.getSb && window.getSb();
    if (!sb || !sb.auth) return;
    var uid = null;
    var email = '';
    try {
      var s = await sb.auth.getSession();
      var user = s && s.data && s.data.session && s.data.session.user;
      if (!user) return;
      uid = user.id;
      email = String(user.email || '').toLowerCase();
    } catch (e0) {
      return;
    }
    var local = mineFromLocal(email);
    var brotherId = (local && local.id) || uid;
    saveId(brotherId);
    try {
      await sb.from('app_members').upsert({
        user_id: uid,
        email: email,
        brother_id: brotherId,
        name: (local && local.name) || '',
        active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (e1) {}
  }

  function fields() {
    function v(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || '').trim() : '';
    }
    return {
      name: v('profile-name'),
      bio: v('profile-bio'),
      phone: v('profile-phone'),
      birthday: v('profile-birthday'),
      occupation: v('profile-skills')
    };
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#save-profile');
    if (!t) return;
    setTimeout(function () {
      var sb = window.getSb && window.getSb();
      if (!sb) return;
      sb.auth.getSession().then(function (s) {
        var user = s && s.data && s.data.session && s.data.session.user;
        if (!user) return;
        var f = fields();
        var bid = localStorage.getItem('myProfileId') || user.id;
        saveId(bid);
        return sb.from('app_members').upsert({
          user_id: user.id,
          email: user.email,
          brother_id: bid,
          name: f.name,
          bio: f.bio,
          phone: f.phone,
          birthday: f.birthday,
          occupation: f.occupation,
          active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }).catch(function () {});
    }, 300);
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 600);
})();
