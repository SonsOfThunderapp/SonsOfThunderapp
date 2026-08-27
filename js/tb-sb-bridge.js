/* Recover the Brothers Supabase client for THIS MONTH. Tiny. Do not replace app.js. */
(function () {
  if (window.__tbSbBridge) return;
  window.__tbSbBridge = 1;

  var AUTH_DB = 'tb-sot-auth';
  var AUTH_STORE = 'kv';
  var cachedUser = null;
  var readyResolve;
  window.__tbSbReady = new Promise(function (res) { readyResolve = res; });

  function cfg() { return window.TB_CONFIG || {}; }

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

  function tokensFromRaw(raw) {
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

  function tokensFromLocal() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('sb-') !== 0) continue;
        var t = tokensFromRaw(localStorage.getItem(k));
        if (t) return t;
      }
    } catch (eL) {}
    return null;
  }

  function expose(client) {
    if (client && typeof window.getSb !== 'function') {
      window.getSb = function () { return client; };
    }
    if (typeof window.currentUser !== 'function') {
      window.currentUser = function () {
        if (cachedUser) return cachedUser;
        var tok = tokensFromLocal();
        return (tok && tok.user) || null;
      };
    }
  }

  function hookCreate() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function' || window.supabase.__tbBridgeHook) return;
    var orig = window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient = function () {
      var c = orig.apply(window.supabase, arguments);
      window.__tbLastSb = c;
      if (typeof window.getSb !== 'function' && c) {
        window.getSb = function () { return c; };
      }
      return c;
    };
    window.supabase.__tbBridgeHook = 1;
  }

  function existingClient() {
    if (typeof window.getSb === 'function') {
      try { var g = window.getSb(); if (g) return g; } catch (eG) {}
    }
    if (window.__tbTheaterSb) return window.__tbTheaterSb;
    if (window.__tbLastSb) return window.__tbLastSb;
    return null;
  }

  async function copyIdbToLocal() {
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
            if (isTbAuthKey(c.key) && c.value != null) {
              var raw = typeof c.value === 'string' ? c.value : String(c.value);
              try { if (!localStorage.getItem(c.key)) localStorage.setItem(c.key, raw); } catch (eS) {}
            }
          } catch (e2) {}
          c.continue();
        };
        req.onerror = function () { resolve(); };
      } catch (e3) { resolve(); }
    });
  }

  async function makeClient() {
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
    return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: tbAuthStorage
      }
    });
  }

  async function attach(client) {
    if (!client || !client.auth) return null;
    try {
      var sess = await client.auth.getSession();
      var user = sess && sess.data && sess.data.session && sess.data.session.user;
      if (user) { cachedUser = user; return user; }
    } catch (e0) {}
    var tok = tokensFromLocal();
    if (!tok) return null;
    try {
      var out = await client.auth.setSession({
        access_token: tok.access_token,
        refresh_token: tok.refresh_token
      });
      var u = (out && out.data && out.data.session && out.data.session.user) || tok.user || null;
      if (u) cachedUser = u;
      return u;
    } catch (e1) { return tok.user || null; }
  }

  async function boot() {
    hookCreate();
    if (typeof window.getSb === 'function') {
      try {
        var already = window.getSb();
        expose(already);
        if (already) await attach(already);
      } catch (eA) {}
      if (readyResolve) readyResolve(true);
      return;
    }
    if (window.__tbTheaterSb) {
      expose(window.__tbTheaterSb);
    }
    try { await copyIdbToLocal(); } catch (eC) {}
    var client = existingClient();
    if (!client) {
      try { client = await makeClient(); } catch (eM) { client = null; }
    }
    expose(client);
    if (client) await attach(client);
    if (typeof window.getSb !== 'function' && client) {
      window.getSb = function () { return client; };
    }
    if (typeof window.currentUser !== 'function') {
      window.currentUser = function () { return cachedUser; };
    }
    if (readyResolve) readyResolve(true);
  }

  boot().catch(function () { if (readyResolve) readyResolve(false); });
})();
