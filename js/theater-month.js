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

  function parseStoredSession() {
    function consider(raw) {
      if (!raw) return null;
      try {
        var j = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!j || typeof j !== 'object') return null;
        var sess = j;
        if (j.currentSession && j.currentSession.access_token) sess = j.currentSession;
        else if (j.session && j.session.access_token) sess = j.session;
        var at = sess.access_token || j.access_token;
        var rt = sess.refresh_token || j.refresh_token;
        if (!at || !rt) return null;
        return { access_token: at, refresh_token: rt, user: sess.user || j.user || null };
      } catch (e) { return null; }
    }
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('sb-') !== 0) continue;
        var t = consider(localStorage.getItem(k));
        if (t) return t;
      }
    } catch (eL) {}
    return null;
  }

  async function attachStoredSession(client) {
    if (!client || !client.auth) return null;
    var user = await sessionUser(client);
    if (user && user.email) return user;
    var tok = parseStoredSession();
    if (!tok) return null;
    try {
      var out = await client.auth.setSession({
        access_token: tok.access_token,
        refresh_token: tok.refresh_token
      });
      return (out && out.data && out.data.session && out.data.session.user) || tok.user || await sessionUser(client);
    } catch (eS) {
      return tok.user || null;
    }
  }

  function sb() {
    if (typeof window.getSb === 'function') {
      try {
        var main = window.getSb();
        if (main) return main;
      } catch (eM) {}
    }
    if (window.__tbLastSb) return window.__tbLastSb;
    return window.__tbTheaterSb || null;
  }

  async function ensureSb() {
    try {
      if (window.__tbSbReady) await window.__tbSbReady;
    } catch (eReady) {}
    var existing = sb();
    if (existing) {
      await attachStoredSession(existing);
      return existing;
    }
    await restoreAuthFromIdb();
    existing = sb();
    if (existing) {
      await attachStoredSession(existing);
      return existing;
    }
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
    await attachStoredSession(window.__tbTheaterSb);
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

  function chairUiOpen() {
    function vis(el) {
      if (!el) return false;
      if (el.hidden) return false;
      if (el.classList && el.classList.contains('hidden')) return false;
      var d = '';
      try { d = (el.style && el.style.display) || ''; } catch (eD) {}
      if (d === 'none') return false;
      try {
        var cs = window.getComputedStyle(el);
        if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
      } catch (eC) {}
      return true;
    }
    try { if (vis(document.getElementById('leader-tools'))) return true; } catch (e1) {}
    try { if (vis(document.querySelector('.admin-zone'))) return true; } catch (e2) {}
    return false;
  }

  function chairFromApp() {
    try {
      if (sessionStorage.getItem('tb_chair_pin') === '1') return true;
    } catch (eP) {}
    try {
      if (window.__tbChairPin === 1) return true;
    } catch (eW) {}
    if (chairUiOpen()) return true;
    try {
      var cuFn = (typeof window.currentUser === 'function') ? window.currentUser : (typeof currentUser === 'function' ? currentUser : null);
      if (cuFn) {
        var cu = cuFn();
        if (cu && String(cu.email || '').trim().toLowerCase() === 'obietv@gmail.com') return true;
      }
    } catch (eC) {}
    return false;
  }

  function markChairSheet() {
    var s = document.getElementById('tb-month-sheet');
    if (s) s.classList.toggle('is-chair', chairFromApp());
    return chairFromApp();
  }

  async function sessionUser(client) {
    if (!client || !client.auth) return null;
    try {
      var sess = await client.auth.getSession();
      return (sess && sess.data && sess.data.session && sess.data.session.user) || null;
    } catch (e) { return null; }
  }

  function alreadyInRoom() {
    if (chairFromApp()) return true;
    try {
      if (typeof window.isSignedIn === 'function' && window.isSignedIn()) return true;
    } catch (e0) {}
    try {
      var bar = document.getElementById('auth-session-bar');
      if (bar && !bar.classList.contains('hidden')) return true;
    } catch (e1) {}
    try {
      var cuFn = (typeof window.currentUser === 'function') ? window.currentUser : (typeof currentUser === 'function' ? currentUser : null);
      var cu = cuFn ? cuFn() : null;
      if (cu && (cu.email || cu.id || cu.name)) return true;
    } catch (e2) {}
    try {
      if (localStorage.getItem('tb_myProfileId') || localStorage.getItem('myProfileId')) return true;
    } catch (e3) {}
    return false;
  }

  function showWritePass(on) {
    var box = document.getElementById('tb-month-signin');
    if (!box) return;
    box.style.display = on ? 'block' : 'none';
    try {
      var em = document.getElementById('tb-month-email');
      if (em && !em.value) em.value = 'obietv@gmail.com';
    } catch (e0) {}
  }

  function needSeat() {
    showWritePass(true);
    status(alreadyInRoom() ? 'Password for the write' : 'Sign in here');
    if (alreadyInRoom()) return;
    try {
      var em = document.getElementById('auth-email');
      if (em) em.value = 'obietv@gmail.com';
    } catch (e0) {}
    try {
      if (typeof window.startMemberSignIn === 'function') window.startMemberSignIn();
    } catch (e1) {}
  }

  async function isLeader() {
    if (chairFromApp()) return true;
    var client = await ensureSb();
    var user = await sessionUser(client);
    if (!user) return false;
    if (String(user.email || '').trim().toLowerCase() === 'obietv@gmail.com') return true;
    try {
      var rpc = await client.rpc('is_sot_leader');
      if (!rpc.error && rpc.data === true) return true;
    } catch (e0) {}
    try {
      var q = await client.from('app_members').select('role,active').eq('user_id', user.id).maybeSingle();
      if (!q.error && q.data) {
        var role = String(q.data.role || '').toLowerCase();
        var active = q.data.active !== false && q.data.active !== 0;
        if (active && (role === 'leader' || role === 'admin')) return true;
      }
    } catch (e1) {}
    return false;
  }

  async function refreshChairStatus() {
    var client = await ensureSb();
    var user = await sessionUser(client);
    if (user && user.email) {
      showWritePass(false);
      status('Chair ready');
    } else {
      showWritePass(true);
      status(alreadyInRoom() ? 'Password for the write' : 'Sign in here');
    }
    markChairSheet();
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
    markChairSheet();
  }

  function openSheet() {
    ensureSheet();
    var s = document.getElementById('tb-month-sheet');
    var t = document.getElementById('tb-month-title');
    if (t && !t.value) t.value = draftTitle();
    s.classList.add('is-open');
    markChairSheet();
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
    status('Working\u2026');
    var put = document.getElementById('tb-month-put');
    if (!picked) { status('Choose a clip first'); return; }
    if (picked.size > RAW_MAX) {
      status('Shoot HD 30 for 60 seconds, or export under 50 MB.');
      toast('Shoot HD 30 for 60 seconds.');
      return;
    }
    if (!picked.size) { status('Choose a clip first'); return; }
    if (put) put.disabled = true;
    var client = null;
    var user = null;
    try {
      if (window.__tbSbReady) await window.__tbSbReady;
    } catch (eReady) {}
    try {
      client = await ensureSb();
      if (client) user = await sessionUser(client);
    } catch (eS) {}
    if (!client || !user || !user.email) {
      var email = ((document.getElementById('tb-month-email') || {}).value || 'obietv@gmail.com').trim();
      var pass = (document.getElementById('tb-month-pass') || {}).value || '';
      if (client && email && pass) {
        status('Signing in\u2026');
        try {
          var signed = await client.auth.signInWithPassword({ email: email, password: pass });
          if (signed.error) throw new Error(signed.error.message || 'Sign in here');
          user = (signed.data && signed.data.user) || await sessionUser(client);
          try {
            var pe = document.getElementById('tb-month-pass');
            if (pe) pe.value = '';
          } catch (eClr) {}
          showWritePass(false);
        } catch (eIn) {
          showWritePass(true);
          status((eIn && eIn.message) || 'Sign in here');
          if (put) put.disabled = false;
          return;
        }
      } else {
        needSeat();
        if (put) put.disabled = false;
        return;
      }
    }
    if (!user || !user.email) {
      needSeat();
      if (put) put.disabled = false;
      return;
    }
    var title = ((document.getElementById('tb-month-title') || {}).value || '').trim() || 'Welcome!';
    status('Reading the clip\u2026');
    try {
      var buf = await picked.arrayBuffer();
      if (!buf || !buf.byteLength) {
        status('Choose a clip first');
        if (put) put.disabled = false;
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
        if (put) put.disabled = false;
        return;
      }
      if (plate.size > MAX) {
        status('Still over 50 MB. Shoot HD 30, not 4K.');
        if (put) put.disabled = false;
        return;
      }
      var probe = await probeClip(plate);
      if (probe.duration > 65) {
        status('Keep it to a minute.');
        if (put) put.disabled = false;
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
        var upP = await client.storage.from(bucket()).upload(PPATH, frame, {
          contentType: 'image/jpeg',
          upsert: true
        });
        if (upP.error) throw new Error(upP.error.message || 'poster failed');
      }
      var pubV = client.storage.from(bucket()).getPublicUrl(VPATH);
      var pubP = client.storage.from(bucket()).getPublicUrl(PPATH);
      saveDraft(title);
      var row = {
        id: 'current',
        url: (pubV && pubV.data && pubV.data.publicUrl) || '',
        poster: (pubP && pubP.data && pubP.data.publicUrl) || '',
        title: title,
        video_path: VPATH,
        poster_path: PPATH,
        updated_at: new Date().toISOString(),
        uploaded_by: user.id || null
      };
      var wr = await client.from('theater_current').upsert(row);
      if (wr.error) throw new Error(wr.error.message || 'row failed');
      status('On Home');
      if (window.tbRefreshMonthFilm) window.tbRefreshMonthFilm();
      toast('On Home');
    } catch (err) {
      status((err && err.message) || 'upload failed');
    }
    if (put) put.disabled = false;
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
    markChairSheet();
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
