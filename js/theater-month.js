/* THIS MONTH — leader upload only. Brothers never see this sheet. */
(function () {
  if (window.__tbTheaterMonth) return;
  window.__tbTheaterMonth = 1;

  var VPATH = 'theater/current.mp4';
  var PPATH = 'theater/current.jpg';
  var MAX = 50 * 1024 * 1024;
  var RAW_MAX = 80 * 1024 * 1024;
  var picked = null;

  function cfg() { return window.TB_CONFIG || {}; }
  function bucket() { return (cfg().THEATER_BUCKET || 'thunder-theater').trim(); }
  function sb() {
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase) return null;
    if (!window.__tbTheaterSb) {
      window.__tbTheaterSb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, detectSessionInUrl: false }
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

  async function isLeader() {
    var client = sb();
    if (!client) return false;
    try {
      var sess = await client.auth.getUser();
      var user = sess && sess.data && sess.data.user;
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

  function ensureSheet() {
    if (document.getElementById('tb-month-sheet')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tb-month-sheet';
    wrap.innerHTML =
      '<div class="tb-ms-card">' +
        '<button type="button" class="tb-ms-x" aria-label="Close">×</button>' +
        '<h2>THIS MONTH</h2>' +
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
  }
  function closeSheet() {
    var s = document.getElementById('tb-month-sheet');
    if (s) s.classList.remove('is-open');
  }
  function status(msg) {
    var el = document.getElementById('tb-month-status');
    if (el) el.textContent = msg || '';
  }

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
    var client = sb();
    var put = document.getElementById('tb-month-put');
    if (!client) { status('Sign in on Brothers'); return; }
    if (!picked) { status('Choose a clip first'); return; }
    if (picked.size > RAW_MAX) {
      status('Shoot HD 30 for 60 seconds, or export under 50 MB.');
      toast('Shoot HD 30 for 60 seconds.');
      return;
    }
    var ok = await isLeader();
    if (!ok) { status('Leaders only'); return; }
    var sess = await client.auth.getUser();
    var user = sess && sess.data && sess.data.user;
    put.disabled = true;
    status('Cooking the plate\u2026');
    try {
      if (window.tbCookTheaterPlate) {
        picked = await window.tbCookTheaterPlate(picked, status);
      }
      if (picked.size > MAX) {
        status('Still over 50 MB. Shoot HD 30, not 4K.');
        put.disabled = false;
        return;
      }
      var probe = await probeClip(picked);
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
      var upV = await client.storage.from(bucket()).upload(VPATH, picked, {
        contentType: picked.type || 'video/mp4',
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
      status(err && err.message ? err.message : 'Could not put it on Home');
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

  async function boot() {
    if (!(await isLeader())) return;
    injectBtn();
    ensureSheet();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 1800);
  document.addEventListener('click', function (e) {
    if (e.target && (e.target.id === 'leader-unlock-btn' || e.target.id === 'admin-room-btn')) {
      setTimeout(boot, 80);
    }
  });
})();
