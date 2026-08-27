/* THIS MONTH — leader upload only. Brothers never see this sheet. */
(function () {
  if (window.__tbTheaterMonth) return;
  window.__tbTheaterMonth = 1;

  var VPATH = 'theater/current.mp4';
  var PPATH = 'theater/current.jpg';
  var MAX = 50 * 1024 * 1024;
  var RAW_MAX = 80 * 1024 * 1024;
  var picked = null;
  var AUTH_DB = 'tb-sot-auth';
  var AUTH_STORE = 'kv';
  var AUTH_RESTORED = false;

  function cfg() { return window.TB_CONFIG || {}; }
  function bucket() { return (cfg().THEATER_BUCKET || 'thunder-theater').trim(); }

  function isTbAuthKey(key) {
    var k = String(key || '');
    return k.indexOf('sb-') === 0 || /supabase/i.test(k);
  }

  function idbOpen() {
    return new Promise(function (resolve) {
      try {
        if (!window.indexedDB) { resolve(null); return; }
        var req = indexedDB.open(AUTH_DB, 1);
        req.onupgradeneeded = function () {
          try {
            if (!req.result.objectStoreNames.contains(AUTH_STORE)) req.result.createObjectStore(AUTH_STORE);
          } catch (e0) {}
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e1) { resolve(null); }
    });
  }
  function idbGet(key) {
    return idbOpen().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(AUTH_STORE, 'readonly');
          var r = tx.objectStore(AUTH_STORE).get(key);
          r.onsuccess = function () { resolve(r.result == null ? null : r.result); };
          r.onerror = function () { resolve(null); };
        } catch (e2) { resolve(null); }
      });
    });
  }
  function idbSet(key, val) {
    return idbOpen().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(AUTH_STORE, 'readwrite');
          tx.objectStore(AUTH_STORE).put(val, key);
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        } catch (e3) { resolve(); }
      });
    });
  }
  function idbDel(key) {
    return idbOpen().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(AUTH_STORE, 'readwrite');
          tx.objectStore(AUTH_STORE).delete(key);
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        } catch (e4) { resolve(); }
      });
    });
  }
  var tbAuthStorage = window.__tbAuthStorage || {
    getItem: function (key) {
      try { var v = localStorage.getItem(key); if (v != null) return v; } catch (e5) {}
      return idbGet(key);
    },
    setItem: function (key, value) {
      try { localStorage.setItem(key, value); } catch (e6) {}
      try { idbSet(key, value); } catch (e7) {}
    },
    removeItem: function (key) {
      try { localStorage.removeItem(key); } catch (e8) {}
      try { idbDel(key); } catch (e9) {}
    }
  };
  window.__tbAuthStorage = tbAuthStorage;

  async function restoreAuthFromIdb() {
    if (AUTH_RESTORED) return;
    AUTH_RESTORED = true;
    try {
      var hasLocal = false;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (isTbAuthKey(k) && localStorage.getItem(k)) { hasLocal = true; break; }
        }
      } catch (eH) {}
      if (hasLocal) return;
      var db = await idbOpen();
      if (!db) return;
      await new Promise(function (resolve) {
        try {
          var tx = db.transaction(AUTH_STORE, 'readonly');
          var req = tx.objectStore(AUTH_STORE).openCursor();
          req.onsuccess = function () {
            var c = req.result;
            if (!c) { resolve(); return; }
            try {
              if (isTbAuthKey(c.key) && c.value != null && !localStorage.getItem(c.key)) {
                localStorage.setItem(c.key, typeof c.value === 'string' ? c.value : String(c.value));
              }
            } catch (e2) {}
            c.continue();
          };
          req.onerror = function () { resolve(); };
        } catch (e3) { resolve(); }
      });
    } catch (eR) {}
  }

  function sb() {
    if (typeof window.getSb === 'function') {
      try {
        var main = window.getSb();
        if (main) return main;
      } catch (eM) {}
    }
    return window.__tbTheaterSb || null;
  }

  async function ensureSb() {
    var existing = sb();
    if (existing) return existing;
    await restoreAuthFromIdb();
    existing = sb();
    if (existing) return existing;
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
    if (!window.__tbTheaterSb) {
      window.__tbTheaterSb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: tbAuthStorage
        }
      });
    }
    return window.__tbTheaterSb;
  }

  function toast(msg) {
    try {
      if (typeof showInstallToast === 'function') showInstallToast(msg);
      else if (window.showInstallToast) window.showInstallToast(msg);
    } catch (e) {}
  }
  function draftTitle() {
    try { return localStorage.getItem('tb_month_title') || ''; } catch (e) { return ''; }
  }
  function saveDraft(v) {
    try { localStorage.setItem('tb_month_title', v || ''); } catch (e) {}
  }

  function chairFromApp() {
    try {
      if (sessionStorage.getItem('tb_chair_pin') === '1') return true;
    } catch (eP) {}
    try {
      var cuFn = (typeof window.currentUser === 'function') ? window.currentUser : (typeof currentUser === 'function' ? currentUser : null);
      if (cuFn) {
        var cu = cuFn();
        if (cu && String(cu.email || '').trim().toLowerCase() === 'obietv@gmail.com') return true;
      }
    } catch (eC) {}
    return false;
  }

  async function isLeader() {
    if (chairFromApp()) return true;
    var client = await ensureSb();
    if (!client) return false;
    try {
      var sess = await client.auth.getSession();
      var user = sess && sess.data && sess.data.session && sess.data.session.user;
      if (!user) return false;
      if (String(user.email || '').trim().toLowerCase() === 'obietv@gmail.com') return true;
      try {
        var rpc = await client.rpc('is_sot_leader');
        if (!rpc.error && rpc.data === true) return true;
      } catch (e0) {}
      var q = await client.from('app_members').select('role,active').eq('user_id', user.id).maybeSingle();
      if (!q.error && q.data) {
        var role = String(q.data.role || '').toLowerCase();
        var active = q.data.active !== false && q.data.active !== 0;
        if (active && (role === 'leader' || role === 'admin')) return true;
      }
    } catch (e1) {}
    return false;
  }

  async function chairWriteOk(client) {
    if (!client) return { ok: false, why: 'Sign in here' };
    var sess = await client.auth.getSession();
    var user = sess && sess.data && sess.data.session && sess.data.session.user;
    if (!user) return { ok: false, why: 'Sign in here' };
    try {
      var rpc = await client.rpc('is_sot_leader');
      if (!rpc.error && rpc.data === true) return { ok: true, user: user };
    } catch (eR) {}
    if (String(user.email || '').trim().toLowerCase() === 'obietv@gmail.com') {
      return { ok: true, user: user };
    }
    return { ok: false, why: 'Sign in here' };
  }

  async function sessionUser(client) {
    if (!client) return null;
    try {
      var sess = await client.auth.getSession();
      return (sess && sess.data && sess.data.session && sess.data.session.user) || null;
    } catch (e) { return null; }
  }

  function showSignIn(on) {
    var box = document.getElementById('tb-month-signin');
    if (box) box.style.display = on ? 'block' : 'none';
  }

  async function refreshChairStatus() {
    var client = await ensureSb();
    var user = await sessionUser(client);
    if (user) {
      showSignIn(false);
      status('Chair ready');
    } else {
      showSignIn(true);
      status('Sign in here');
    }
  }

  function ensureSheet() {
    if (document.getElementById('tb-month-sheet')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tb-month-sheet';
    wrap.innerHTML =
      '<div class="tb-ms-card">' +
        '<button type="button" class="tb-ms-x" aria-label="Close">×</button>' +
        '<h2>THIS MONTH</h2>' +
        '<div id="tb-month-signin">' +
          '<input id="tb-month-email" type="email" autocomplete="username" value="obietv@gmail.com">' +
          '<input id="tb-month-pass" type="password" autocomplete="current-password" placeholder="Password">' +
        '</div>' +
        '<label class="tb-ms-file">CHOOSE CLIP' +
          '<input id="tb-month-file" type="file" accept="video/*" hidden>' +
        '</label>' +
        '<input id="tb-month-title" type="text" maxlength="48" placeholder="Joel · AI Night">' +
        '<button type="button" class="tb-ms-put" id="tb-month-put">PUT IT ON HOME</button>' +
        '<p class="tb-ms-status" id="tb-month-status"></p>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('.tb-ms-x').addEventListener('click', closeSheet);
    var file = wrap.querySelector('#tb-month-file');
    var title = wrap.querySelector('#tb-month-title');
    title.value = draftTitle();
    title.addEventListener('input', function () { saveDraft(title.value); });
    file.addEventListener('change', function () {
      picked = (file.files && file.files[0]) || null;
      var lab = wrap.querySelector('.tb-ms-file');
      lab.childNodes[0].textContent = picked ? picked.name : 'CHOOSE CLIP';
      status(picked ? picked.name : '');
    });
    wrap.querySelector('#tb-month-put').addEventListener('click', putOnHome);
  }

  function openSheet() {
    ensureSheet();
    var s = document.getElementById('tb-month-sheet');
    var t = document.getElementById('tb-month-title');
    if (t && !t.value) t.value = draftTitle();
    s.classList.add('is-open');
    refreshChairStatus();
  }
  function closeSheet() {
    var s = document.getElementById('tb-month-sheet');
    if (s) s.classList.remove('is-open');
  }
  function status(msg) {
    var el = document.getElementById('tb-month-status');
    if (el) el.textContent = msg || '';
  }
  window.tbOpenMonthSheet = openSheet;

  function probeClip(file) {
    return new Promise(function (resolve) {
      var settled = false;
      var finish = function (out) {
        if (settled) return;
        settled = true;
        resolve(out);
      };
      try {
        var url = URL.createObjectURL(file);
        var v = document.createElement('video');
        v.muted = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.src = url;
        var done = function (blob, dur) {
          try { URL.revokeObjectURL(url); } catch (e) {}
          finish({ blob: blob || null, duration: dur || 0 });
        };
        v.addEventListener('loadeddata', function () {
          var dur = v.duration || 0;
          try {
            var c = document.createElement('canvas');
            c.width = 540;
            c.height = 960;
            var ctx = c.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(v, 0, 0, c.width, c.height);
            c.toBlob(function (b) { done(b, dur); }, 'image/jpeg', 0.82);
          } catch (e1) { done(null, dur); }
        });
        v.addEventListener('error', function () { done(null, 0); });
        setTimeout(function () { done(null, 0); }, 8000);
      } catch (e2) { finish({ blob: null, duration: 0 }); }
    });
  }

  async function putOnHome() {
    var client = await ensureSb();
    var put = document.getElementById('tb-month-put');
    if (!picked) { status('Choose a clip first'); return; }
    if (picked.size > RAW_MAX) {
      status('Shoot HD 30 for 60 seconds, or export under 50 MB.');
      toast('Shoot HD 30 for 60 seconds.');
      return;
    }
    if (!picked.size) { status('Choose a clip first'); return; }
    put.disabled = true;
    var user = await sessionUser(client);
    if (!client || !user) {
      if (!client) {
        status('Sign in here');
        put.disabled = false;
        return;
      }
      var email = ((document.getElementById('tb-month-email') || {}).value || '').trim();
      var pass = (document.getElementById('tb-month-pass') || {}).value || '';
      if (!email || !pass) {
        showSignIn(true);
        status('Sign in here');
        put.disabled = false;
        return;
      }
      status('Signing in\u2026');
      try {
        var signed = await client.auth.signInWithPassword({ email: email, password: pass });
        if (signed.error) throw new Error(signed.error.message || 'Sign in here');
        user = (signed.data && signed.data.user) || await sessionUser(client);
        try {
          var pe = document.getElementById('tb-month-pass');
          if (pe) pe.value = '';
        } catch (eClr) {}
        showSignIn(false);
      } catch (eIn) {
        status((eIn && eIn.message) || 'Sign in here');
        put.disabled = false;
        return;
      }
    }
    status('Checking the chair\u2026');
    var gate = await chairWriteOk(client);
    if (!gate.ok) {
      status(gate.why);
      put.disabled = false;
      return;
    }
    user = gate.user || user;
    status('Reading the clip\u2026');
    try {
      var buf = await picked.arrayBuffer();
      if (!buf || !buf.byteLength) {
        status('Choose a clip first');
        put.disabled = false;
        return;
      }
      var mime = String(picked.type || '').toLowerCase();
      var nm = String(picked.name || '').toLowerCase();
      if (!mime || mime === 'application/octet-stream') {
        mime = /\.mov$/.test(nm) ? 'video/quicktime' : 'video/mp4';
      }
      var plate = new File([buf], 'current.mp4', { type: mime });
      if (!plate.size) {
        status('Choose a clip first');
        put.disabled = false;
        return;
      }
      if (plate.size > MAX) {
        status('Still over 50 MB. Shoot HD 30, not 4K.');
        put.disabled = false;
        return;
      }
      var probe = await probeClip(plate);
      if (probe.duration > 65) {
        status('Keep it to a minute.');
        put.disabled = false;
        return;
      }
      var frame = probe.blob;
      var ym = new Date().toISOString().slice(0, 7);
      try {
        await client.storage.from(bucket()).copy(VPATH, 'theater/archive-' + ym + '.mp4');
      } catch (eA) {}
      status('Uploading\u2026');
      var upV = await client.storage.from(bucket()).upload(VPATH, plate, {
        contentType: mime,
        upsert: true
      });
      if (upV.error) throw new Error(upV.error.message || 'upload failed');
      if (frame) {
        await client.storage.from(bucket()).upload(PPATH, frame, {
          contentType: 'image/jpeg',
          upsert: true
        });
      }
      var pubV = client.storage.from(bucket()).getPublicUrl(VPATH);
      var pubP = client.storage.from(bucket()).getPublicUrl(PPATH);
      var title = ((document.getElementById('tb-month-title') || {}).value || '').trim();
      if (!title) title = 'Welcome!';
      saveDraft(title);
      var row = {
        id: 'current',
        url: (pubV && pubV.data && pubV.data.publicUrl) || '',
        poster: (pubP && pubP.data && pubP.data.publicUrl) || '',
        title: title,
        video_path: VPATH,
        poster_path: PPATH,
        updated_at: new Date().toISOString(),
        uploaded_by: user && user.id || null
      };
      var wr = await client.from('theater_current').upsert(row);
      if (wr.error) throw new Error(wr.error.message || 'row failed');
      status('On Home');
      if (window.tbRefreshMonthFilm) window.tbRefreshMonthFilm();
      toast('On Home');
    } catch (err) {
      var msg = err && err.message ? err.message : 'Could not put it on Home';
      if (/row-level security/i.test(msg)) msg = 'Sign in here';
      status(msg);
    }
    put.disabled = false;
  }

  function injectBtn() {
    var tools = document.getElementById('leader-tools');
    if (!tools || document.getElementById('tb-month-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'tb-month-btn';
    btn.type = 'button';
    btn.className = 'btn-rsvp';
    btn.textContent = 'THIS MONTH';
    btn.addEventListener('click', function () { openSheet(); });
    var after = document.getElementById('admin-room-btn');
    if (after && after.parentNode === tools) after.insertAdjacentElement('afterend', btn);
    else tools.insertBefore(btn, tools.firstChild);
  }

  function injectHomePut() {
    if (document.getElementById('tb-month-home-put')) return;
    var tile = document.getElementById('tb-month-film');
    if (!tile || !tile.parentNode) return;
    var btn = document.createElement('button');
    btn.id = 'tb-month-home-put';
    btn.type = 'button';
    btn.className = 'tb-month-home-put';
    btn.textContent = 'PUT CLIP ON HOME';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet();
    });
    var cap = document.getElementById('tb-month-film-title');
    (cap || tile).insertAdjacentElement('afterend', btn);
  }

  async function boot() {
    if (!(await isLeader())) return;
    injectBtn();
    injectHomePut();
    ensureSheet();
  }

  function watchAuth() {
    try {
      ensureSb().then(function (c0) {
        if (c0 && !window.__tbMonthAuth) {
          window.__tbMonthAuth = 1;
          c0.auth.onAuthStateChange(function () { boot(); });
        }
      });
    } catch (eA) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1800);
  setTimeout(boot, 4000);
  document.addEventListener('tb-chair-open', function () { boot(); });
  watchAuth();
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t) return;
    var id = t.id || '';
    var view = (t.closest && t.closest('[data-view]'));
    if (id === 'leader-unlock-btn' || id === 'admin-room-btn' || id === 'tb-month-film' || (view && view.getAttribute('data-view') === 'about')) {
      setTimeout(boot, 80);
    }
  });
})();
