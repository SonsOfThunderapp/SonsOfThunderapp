/* Memories polish hook. Uploader-only imagining/cleaning overlay. Not homepage. */
(function () {
  if (window.__tbMemEnhanceHook) return;
  window.__tbMemEnhanceHook = 1;

  var mine = {};
  var overlay = null;
  var previewUrl = null;
  var copyTimer = null;

  function sessionUserId() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('sb-') !== 0) continue;
        var raw = localStorage.getItem(k);
        if (!raw || raw.indexOf('access_token') === -1) continue;
        var j = JSON.parse(raw);
        var u = (j && j.user && j.user.id) || (j && j.currentSession && j.currentSession.user && j.currentSession.user.id);
        if (u) return u;
      }
    } catch (e) {}
    return '';
  }

  function accessToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('sb-') !== 0) continue;
        var raw = localStorage.getItem(k);
        if (!raw || raw.indexOf('access_token') === -1) continue;
        var j = JSON.parse(raw);
        var t = (j && j.access_token) || (j && j.currentSession && j.currentSession.access_token);
        if (t) return t;
      }
    } catch (e) {}
    return '';
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'tb-mem-polish';
    overlay.className = 'tb-mem-polish hidden';
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML =
      '<div class="tb-mem-polish-frame">' +
        '<img class="tb-mem-polish-img" alt="">' +
        '<div class="tb-mem-polish-grain" aria-hidden="true"></div>' +
        '<div class="tb-mem-polish-lift" aria-hidden="true"></div>' +
        '<div class="tb-mem-polish-copy">Imagining…</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function setCopy(text) {
    var el = overlay && overlay.querySelector('.tb-mem-polish-copy');
    if (el) el.textContent = text;
  }

  function showPolish(file) {
    var host = document.getElementById('view-events') || document.querySelector('[data-view="events"]') || document.body;
    if (!host) return;
    var box = ensureOverlay();
    var img = box.querySelector('.tb-mem-polish-img');
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch (e) {}
    }
    previewUrl = file ? URL.createObjectURL(file) : '';
    if (img && previewUrl) img.src = previewUrl;
    box.classList.remove('hidden', 'is-done', 'is-fail');
    box.classList.add('is-running');
    setCopy('Imagining…');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { setCopy('Cleaning…'); }, 900);
    try {
      var events = document.getElementById('view-events');
      if (events) events.appendChild(box);
    } catch (e2) {}
  }

  function finishPolish(ok) {
    var box = ensureOverlay();
    clearTimeout(copyTimer);
    box.classList.remove('is-running');
    box.classList.add(ok ? 'is-done' : 'is-fail');
    setCopy(ok ? 'Ready.' : 'Keeping the original.');
    setTimeout(function () {
      box.classList.add('hidden');
      box.classList.remove('is-done', 'is-fail');
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (e) {}
        previewUrl = null;
      }
    }, ok ? 420 : 700);
  }

  function kick(id) {
    if (!id) return Promise.resolve({ ok: false });
    var token = accessToken();
    if (!token) return Promise.resolve({ ok: false });
    return fetch('/.netlify/functions/enhance-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ id: id })
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false }; });
    }).then(function (body) {
      return body || { ok: false };
    }).catch(function () {
      return { ok: false };
    });
  }

  function refreshWall() {
    try {
      if (typeof window.pullMemories === 'function') {
        return Promise.resolve(window.pullMemories()).then(function () {
          try { if (typeof window.renderMedia === 'function') window.renderMedia(); } catch (e) {}
        });
      }
    } catch (e) {}
    return Promise.resolve();
  }

  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = '';
    try { url = typeof input === 'string' ? input : (input && input.url) || ''; } catch (e) {}
    var method = 'GET';
    try { method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase(); } catch (e2) {}
    var p = origFetch.apply(this, arguments);

    if (/\/rest\/v1\/memories/i.test(url) && method === 'GET') {
      return p.then(function (res) {
        if (!res || !res.ok) return res;
        return res.clone().json().then(function (rows) {
          if (!Array.isArray(rows)) return res;
          var uid = sessionUserId();
          var kept = rows.filter(function (r) {
            if (!r) return false;
            var pending = String(r.enhance_status || '') === 'pending';
            if (!pending) return true;
            return !!(r.user_id && uid && r.user_id === uid);
          });
          return new Response(JSON.stringify(kept), {
            status: res.status,
            statusText: res.statusText,
            headers: { 'Content-Type': 'application/json' }
          });
        }).catch(function () { return res; });
      });
    }

    if (/\/rest\/v1\/memories/i.test(url) && method === 'POST') {
      p.then(function (res) {
        if (!res || !res.ok) return;
        res.clone().json().then(function (body) {
          var row = Array.isArray(body) ? body[0] : body;
          if (!row || !row.id) return;
          if (/\.(mp4|webm|mov)$/i.test(String(row.storage_path || row.original_path || ''))) return;
          mine[row.id] = 1;
          kick(row.id).then(function (out) {
            finishPolish(!!(out && out.ok));
            setTimeout(function () { refreshWall(); }, 180);
          });
        }).catch(function () {});
      });
    }
    return p;
  };

  function bindChooser(el) {
    if (!el || el.dataset.tbPolishBound === '1') return;
    el.dataset.tbPolishBound = '1';
    el.addEventListener('change', function () {
      var f = el.files && el.files[0];
      if (!f || !String(f.type || '').startsWith('image')) return;
      showPolish(f);
      try {
        if (typeof window.showInstallToast === 'function') window.showInstallToast('Uploading…');
      } catch (e) {}
    });
  }

  function bindAll() {
    ['memory-cam', 'media-file-cam', 'memory-lib', 'media-file'].forEach(function (id) {
      bindChooser(document.getElementById(id));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }
  setTimeout(bindAll, 800);
})();
