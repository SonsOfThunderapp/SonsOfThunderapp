/* ===== THUNDER BOARD ===== */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Escape user text before any innerHTML use
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Shared selection glow (red default, yellow optional)
  function tbGlowHit(el, tone) {
    if (!el) return;
    const cls = tone === 'yellow' ? 'tb-glow-hit-yellow' : 'tb-glow-hit';
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 400);
  }

  // ---------- DATA ----------
  const DEFAULT_BROTHERS = [];

  function buildUpcoming() {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const list = [];
    let d = new Date();
    for (let i = 0; i < 2; i++) {
      const next = getNextMeetingMonday(d);
      list.push({
        month: months[next.getMonth()],
        day: String(next.getDate()).padStart(2, '0'),
        title: 'Monthly Gathering',
        detail: meetingTime() + ' • ' + venueName(),
        fullDate: formatMeetingDate(next)
      });
      d = new Date(next.getFullYear(), next.getMonth(), next.getDate() + 1);
    }
    return list;
  }

  const DEFAULT_ANNOUNCEMENTS = [
    { id: 'default-1', title: 'Next Gathering', body: 'First Monday of the month. Check the date above. Bring a brother who needs it.', createdAt: 0 }
  ];

  let announcements = load('announcements') || DEFAULT_ANNOUNCEMENTS;
  // Backfill ids for older saved data
  announcements = announcements.map((a, i) => ({
    id: a.id || ('ann-' + i + '-' + (a.title || '').slice(0, 12)),
    title: a.title || '',
    body: a.body || '',
    createdAt: typeof a.createdAt === 'number' ? a.createdAt : 0
  }));
  // Per-item seen map — NEW clears only when that card is opened
  let seenAnnouncements = load('seenAnnouncements') || {};
  if (typeof seenAnnouncements !== 'object' || seenAnnouncements === null) seenAnnouncements = {};
  // Migrate old watermark: treat everything at/below it as seen once
  const legacyAnnSeenAt = load('announcementsSeenAt');
  if (typeof legacyAnnSeenAt === 'number' && legacyAnnSeenAt > 0) {
    announcements.forEach(a => {
      if ((a.createdAt || 0) > 0 && (a.createdAt || 0) <= legacyAnnSeenAt && a.id) {
        seenAnnouncements[a.id] = true;
      }
    });
    save('seenAnnouncements', seenAnnouncements);
    try { localStorage.removeItem('tb_announcementsSeenAt'); } catch (e) {}
  }
  let eventsUpdatedAt = load('eventsUpdatedAt') || 0;
  let eventsSeenAt = load('eventsSeenAt') || 0;
  let mediaSeenAt = load('mediaSeenAt') || 0;
  let brothersSeenAt = load('brothersSeenAt') || 0;
  let lastFireSeenAt = load('lastFireSeenAt') || 0;

  // Thunder knowledge (Source hierarchy demo)
  const DEFAULT_CODE = [
    { line: 'STAY SHARP.', sub: 'Mentorship, hard stories, and honest pushback. Iron on iron.' },
    { line: 'SHOW UP.', sub: 'Brewery patio. Range. Lake. Word. Gym. Presence is the point.' },
    { line: 'OWN THE HOTHEAD.', sub: 'James and John wanted fire from heaven. We still do. We take the lesson.' },
    { line: 'LEAD WHERE YOU STAND.', sub: 'Marriage. Kids. Work. Friends. Neighbors. Those are the field.' },
    { line: 'CARRY YOUR BROTHER.', sub: 'Alone we drift. Together we keep each other useful.' },
    { line: 'AIM AT THE GENTLEMAN.', sub: 'Not softer — stronger. More like Jesus, the ultimate standard.' }
  ];
  let CODE = load('code_v2') || DEFAULT_CODE;
  // migrate: drop old code key once
  try { localStorage.removeItem('tb_code'); } catch (e) {}

  const DEFAULT_MISSION = {
    title: 'Outside the Patio',
    detail: 'Range, lake, Word, or gym — details at the next gathering.'
  };
  let mission = load('mission') || DEFAULT_MISSION;
  let eventsNote = load('eventsNote') || '';
  const DEFAULT_GATHERING_BODY =
    'First Monday of the month (or second Monday if Labor Day / Memorial Day). Show up. Bring a brother who needs it.';
  let gatheringBody = load('gatheringBody') || DEFAULT_GATHERING_BODY;
  // Last Fire — one caption + optional photo; leadership updates when worth remembering
  let lastFire = load('lastFire') || null;
  let leaderUnlocked = false;

  const SCRIPTURE = {
    'mark 3:17': {
      text: 'And He appointed the twelve: … and James, the son of Zebedee, and John the brother of James (to them He gave the name Boanerges, which means, “Sons of Thunder”).',
      note: 'Jesus nicknamed James and John “Sons of Thunder.” That is our identity.'
    },
    'proverbs 27:17': {
      text: 'Iron sharpens iron, so one man sharpens another.',
      note: 'This is the heart of why we meet.'
    },
    'galatians 6:2': {
      text: 'Bear one another’s burdens, and thereby fulfill the law of Christ.',
      note: 'Carry your brother’s weight.'
    }
  };

  // ---------- STATE ----------
  function load(key) {
    try { return JSON.parse(localStorage.getItem('tb_' + key)); } catch { return null; }
  }
  function save(key, val) {
    try {
      localStorage.setItem('tb_' + key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.warn('localStorage save failed for', key, e);
      return false;
    }
  }

  // Compress image data URL for localStorage (M2)
  function compressImageDataUrl(dataUrl, maxW, quality) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            let w = img.width, h = img.height;
            const max = maxW || 1200;
            if (w > max || h > max) {
              if (w > h) { h = Math.round(h * max / w); w = max; }
              else { w = Math.round(w * max / h); h = max; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality || 0.72));
          } catch (e) { resolve(dataUrl); }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch (e) { resolve(dataUrl); }
    });
  }

  let brothers = load('brothers') || DEFAULT_BROTHERS;
  // Shared memories live in Supabase when configured — not localStorage primary
  let media = [];
  let rsvp = load('rsvp') || false;
  let myProfileId = load('myProfileId') || null;
  let pendingPhotoData = null;
  let sbClient = null;
  let sbSession = null;
  let authReady = false;

  // ---------- CONFIG / MEETING HELPERS ----------
  function cfg() { return window.TB_CONFIG || {}; }
  function meetingTime() { return (cfg().MEETING_TIME || '6:30 PM'); }
  function parseMeetingHours() {
    // Returns {h, m} 24h from strings like "6:30 PM"
    const raw = String(meetingTime()).trim();
    const m = raw.match(/(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)?/i);
    if (!m) return { h: 18, m: 30 };
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = (m[3] || '').toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    if (!ap && h <= 12 && h < 7) h += 12; // bare "6:30" -> evening guess
    return { h, m: min };
  }
  function venueName() { return (cfg().VENUE || 'Crooked Can Brewery Patio, Winter Garden'); }

  // ---------- SUPABASE AUTH + SHARED MEMORIES ----------
  function supabaseEnabled() {
    const c = cfg();
    return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient);
  }

  function memoriesBucket() {
    return (cfg().MEMORIES_BUCKET || 'Sons Of Thunder Memories').trim();
  }

  function getSb() {
    if (!supabaseEnabled()) return null;
    if (sbClient) return sbClient;
    sbClient = window.supabase.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return sbClient;
  }

  function currentUser() {
    return (sbSession && sbSession.user) || null;
  }

  function isSignedIn() {
    return !!(currentUser() && currentUser().id);
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
    const bin = atob(parts[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function safeFilename(name, isVideo) {
    const base = String(name || 'memory')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'memory';
    const ext = isVideo ? 'mp4' : 'jpg';
    return base + '.' + ext;
  }

  function setAuthError(msg) {
    const el = $('#auth-error');
    if (el) el.textContent = msg || '';
  }

  function openAuthGate(reason) {
    const gate = $('#auth-gate');
    const sub = $('#auth-sub');
    if (sub) {
      sub.textContent = reason || 'Sign in to view and add shared memories.';
    }
    setAuthError('');
    if (gate) gate.classList.remove('hidden');
  }

  function closeAuthGate() {
    const gate = $('#auth-gate');
    if (gate) gate.classList.add('hidden');
    setAuthError('');
  }

  function updateAuthSessionBar() {
    const bar = $('#auth-session-bar');
    const who = $('#auth-who');
    if (!bar) return;
    if (!supabaseEnabled()) {
      bar.classList.add('hidden');
      return;
    }
    if (isSignedIn()) {
      const email = (currentUser().email || 'Brother').trim();
      if (who) who.textContent = email;
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }

  async function initAuth() {
    if (!supabaseEnabled()) {
      authReady = true;
      updateAuthSessionBar();
      return;
    }
    const sb = getSb();
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) console.warn('auth getSession', error);
      sbSession = (data && data.session) || null;
    } catch (e) {
      console.warn('auth session', e);
      sbSession = null;
    }
    sb.auth.onAuthStateChange((_event, session) => {
      sbSession = session;
      updateAuthSessionBar();
      if (session) {
        closeAuthGate();
        pullMemories().then(() => {
          renderMedia();
          if (typeof renderLastFire === 'function') renderLastFire();
        }).catch((e) => console.warn('memories after auth', e));
      } else {
        media = [];
        renderMedia();
        if (typeof renderLastFire === 'function') renderLastFire();
      }
    });
    authReady = true;
    updateAuthSessionBar();
  }

  async function authSignIn(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sbSession = data.session;
    return data;
  }

  async function authSignUp(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const redirectTo = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? (window.location.origin + '/')
      : 'https://sonsofthunder.netlify.app/';
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    // May require email confirmation depending on project settings
    if (data.session) sbSession = data.session;
    return data;
  }

  async function authResetPassword(email) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/'
    });
    if (error) throw error;
  }

  async function authSignOut() {
    const sb = getSb();
    if (!sb) return;
    await sb.auth.signOut();
    sbSession = null;
    media = [];
    updateAuthSessionBar();
    renderMedia();
    if (typeof renderLastFire === 'function') renderLastFire();
  }

  async function signedUrlFor(path) {
    const sb = getSb();
    if (!sb || !path) return null;
    const { data, error } = await sb.storage
      .from(memoriesBucket())
      .createSignedUrl(path, 3600);
    if (error) {
      console.warn('signed URL failed', path, error);
      return null;
    }
    return (data && data.signedUrl) || null;
  }

  async function pullMemories() {
    if (!supabaseEnabled()) return false;
    if (!isSignedIn()) {
      media = [];
      return false;
    }
    const sb = getSb();
    const { data: rows, error } = await sb
      .from('memories')
      .select('id,user_id,storage_path,caption,uploader_name,created_at')
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message || 'Could not load memories.');
    if (!Array.isArray(rows)) {
      media = [];
      return false;
    }
    const mapped = [];
    for (const r of rows) {
      const path = r.storage_path;
      let url = null;
      try {
        url = await signedUrlFor(path);
      } catch (e) {
        console.warn('sign fail', e);
      }
      if (!url) continue;
      const lower = String(path || '').toLowerCase();
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(lower);
      mapped.push({
        id: r.id,
        data: url,
        storage_path: path,
        type: isVideo ? 'video' : 'image',
        caption: r.caption || '',
        uploader_name: r.uploader_name || '',
        date: r.created_at || new Date().toISOString(),
        user_id: r.user_id || null
      });
    }
    media = mapped;
    // Do not persist memory blobs to localStorage
    return true;
  }

  async function pushMemory(item) {
    if (!supabaseEnabled()) throw new Error('Shared memories are not configured.');
    if (!isSignedIn()) throw new Error('Sign in to add a memory.');
    const sb = getSb();
    const user = currentUser();
    const isVideo = item.type === 'video';
    let blob = item.blob || null;
    if (!blob && item.data && String(item.data).startsWith('data:')) {
      blob = dataUrlToBlob(item.data);
    }
    if (!blob) throw new Error('No image to upload.');

    const fname = safeFilename(item.filename || 'memory', isVideo);
    const storagePath = 'private/' + user.id + '/' + Date.now() + '-' + fname;

    const { error: upErr } = await sb.storage
      .from(memoriesBucket())
      .upload(storagePath, blob, {
        contentType: isVideo ? 'video/mp4' : 'image/jpeg',
        upsert: false
      });
    if (upErr) throw new Error('Upload failed: ' + (upErr.message || 'storage error'));

    const row = {
      user_id: user.id,
      storage_path: storagePath,
      caption: item.caption || '',
      uploader_name: item.uploader_name || myDisplayName() || (user.email || '').split('@')[0] || ''
    };

    const { data: saved, error: insErr } = await sb
      .from('memories')
      .insert(row)
      .select('id,user_id,storage_path,caption,uploader_name,created_at')
      .single();

    if (insErr) {
      // Storage object may remain; surface the DB failure clearly
      throw new Error('Photo uploaded but could not save the record: ' + (insErr.message || 'database error'));
    }

    let url = null;
    try { url = await signedUrlFor(storagePath); } catch (e) {}
    return {
      id: saved && saved.id,
      data: url || item.data,
      storage_path: storagePath,
      type: isVideo ? 'video' : 'image',
      caption: (saved && saved.caption) || item.caption || '',
      uploader_name: (saved && saved.uploader_name) || row.uploader_name,
      date: (saved && saved.created_at) || new Date().toISOString(),
      user_id: user.id
    };
  }

  async function pullEventsBoard() {
    if (!supabaseEnabled()) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const { data, error } = await sb
        .from('events_board')
        .select('events_note,mission_title,mission_detail,updated_at')
        .eq('id', 'default')
        .maybeSingle();
      if (error) {
        console.warn('events_board pull', error);
        return false;
      }
      if (!data) return false;
      if (typeof data.events_note === 'string') {
        eventsNote = data.events_note;
        save('eventsNote', eventsNote);
      }
      if (data.mission_title || data.mission_detail) {
        mission = {
          title: (data.mission_title || '').trim() || DEFAULT_MISSION.title,
          detail: (data.mission_detail || '').trim() || DEFAULT_MISSION.detail
        };
        save('mission', mission);
      }
      if (data.updated_at) {
        const t = Date.parse(data.updated_at);
        if (!isNaN(t)) {
          eventsUpdatedAt = t;
          save('eventsUpdatedAt', eventsUpdatedAt);
        }
      }
      return true;
    } catch (e) {
      console.warn('events_board pull failed', e);
      return false;
    }
  }

  async function pushEventsBoard() {
    if (!supabaseEnabled()) return { ok: false, reason: 'no_supabase' };
    if (!isSignedIn()) return { ok: false, reason: 'not_signed_in' };
    const sb = getSb();
    if (!sb) return { ok: false, reason: 'no_client' };
    const user = currentUser();
    const row = {
      id: 'default',
      events_note: eventsNote || '',
      mission_title: (mission && mission.title) || DEFAULT_MISSION.title,
      mission_detail: (mission && mission.detail) || DEFAULT_MISSION.detail,
      updated_at: new Date().toISOString(),
      updated_by: user ? user.id : null
    };
    const { error } = await sb.from('events_board').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('events_board push', error);
      return { ok: false, reason: error.message || 'push_failed' };
    }
    return { ok: true };
  }

  async function syncSharedData() {
    if (!supabaseEnabled()) return;
    // Events note + mission: readable without sign-in
    try {
      await pullEventsBoard();
      if (typeof renderMission === 'function') renderMission();
      if (typeof renderEventsNote === 'function') renderEventsNote();
      if (typeof updateAllNewBadges === 'function') updateAllNewBadges();
    } catch (e) {
      console.warn('Events board sync failed', e);
    }
    if (!isSignedIn()) {
      media = [];
      renderMedia();
      return;
    }
    try {
      await pullMemories();
      renderMedia();
      if (typeof renderLastFire === 'function') renderLastFire();
    } catch (e) {
      console.warn('Shared memories sync failed', e);
    }
  }

  // Brothers stay device-local (profiles). Shared memories only via auth + Supabase.
  async function pushBrother(entry) {
    return entry;
  }

  function ensureBrotherId() {
    if (myProfileId) return myProfileId;
    myProfileId = 'b_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    save('myProfileId', myProfileId);
    return myProfileId;
  }
  function myDisplayName() {
    const me = brothers.find(b => b.id === myProfileId);
    if (me && me.name) return me.name.trim();
    const stored = load('displayName');
    if (stored) return String(stored).trim();
    return '';
  }
  // First Monday of a given year/month (month is 0-based)
  function firstMondayOf(year, month) {
    const d = new Date(year, month, 1, 12, 0, 0);
    const day = d.getDay(); // 0=Sun … 1=Mon
    const add = (day === 1) ? 0 : (8 - day) % 7;
    d.setDate(1 + add);
    return d;
  }

  // US Labor Day = first Monday of September
  function isLaborDay(date) {
    return date.getMonth() === 8 && date.getDate() === firstMondayOf(date.getFullYear(), 8).getDate();
  }

  // US Memorial Day = last Monday of May
  function isMemorialDay(date) {
    if (date.getMonth() !== 4) return false;
    // last Monday: start from May 31 and walk back
    const last = new Date(date.getFullYear(), 4, 31, 12, 0, 0);
    const back = (last.getDay() + 6) % 7; // days since Monday
    last.setDate(31 - back);
    return date.getDate() === last.getDate();
  }

  // Meeting Monday for a month: first Monday, unless that day is Labor Day or Memorial Day → second Monday
  function meetingMondayOf(year, month) {
    const first = firstMondayOf(year, month);
    if (isLaborDay(first) || isMemorialDay(first)) {
      const second = new Date(first);
      second.setDate(first.getDate() + 7);
      return second;
    }
    return first;
  }

  // Next gathering Monday (holiday-aware). After meeting time on meeting day → next month.
  function getNextMeetingMonday(fromDate = new Date()) {
    const now = new Date(fromDate);
    let y = now.getFullYear();
    let m = now.getMonth();
    let candidate = meetingMondayOf(y, m);

    const mt = parseMeetingHours();
    const meetingMoment = new Date(candidate);
    meetingMoment.setHours(mt.h, mt.m, 0, 0);

    // If this month's gathering time has passed, roll to next month
    if (now >= meetingMoment) {
      m += 1;
      if (m > 11) { m = 0; y += 1; }
      candidate = meetingMondayOf(y, m);
    }
    return candidate;
  }

  function daysUntil(date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - now) / 86400000);
  }

  function formatMeetingDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function updateMeetingCard() {
    const next = getNextMeetingMonday();
    const days = daysUntil(next);
    const dateEl = document.getElementById('meeting-date');
    const countEl = document.getElementById('meeting-countdown');
    const phaseEl = document.getElementById('meeting-phase-label');
    const card = document.querySelector('.next-meeting');

    if (dateEl) dateEl.textContent = formatMeetingDate(next);
    const timeEl = document.getElementById('meeting-time');
    if (timeEl) timeEl.textContent = meetingTime();
    const locEl = document.getElementById('meeting-loc');
    if (locEl) locEl.textContent = venueName();
    const aboutMeet = document.getElementById('about-meeting-line');
    if (aboutMeet) {
      aboutMeet.textContent = '1st Monday (2nd if Labor Day / Memorial Day) • ' + meetingTime();
    }
    const aboutVenue = document.getElementById('about-venue-line');
    if (aboutVenue) aboutVenue.textContent = venueName();

    // Living Home — context-aware phase (local meeting clock only)
    let phase = 'NEXT GATHERING';
    let countText = days + ' DAYS';
    let phaseClass = 'phase-normal';
    const now = new Date();
    const meetingMoment = new Date(next);
    const _mt = parseMeetingHours();
    meetingMoment.setHours(_mt.h, _mt.m, 0, 0);

    if (days === 0) {
      const hoursLeft = Math.max(0, Math.floor((meetingMoment - now) / 3600000));
      const minsLeft = Math.max(0, Math.floor((meetingMoment - now) / 60000));
      if (now >= meetingMoment) {
        // Gathering window: meeting time has started (same calendar day still next until roll)
        phase = '⚡ THUNDER IS HAPPENING';
        countText = 'SHOW UP';
        phaseClass = 'phase-live';
      } else if (hoursLeft <= 0 || minsLeft <= 90) {
        phase = '⚡ THUNDER TONIGHT';
        countText = minsLeft <= 90 && hoursLeft === 0 ? 'STARTING SOON' : (hoursLeft + 'H LEFT');
        phaseClass = 'phase-tonight';
      } else {
        phase = '⚡ THUNDER TONIGHT';
        countText = hoursLeft + 'H LEFT';
        phaseClass = 'phase-tonight';
      }
    } else if (days === 1) {
      phase = '⚡ GATHERING TOMORROW';
      countText = 'TOMORROW';
      phaseClass = 'phase-soon';
    } else if (days === 2) {
      phase = '⚡ GATHERING IN 2 DAYS';
      countText = '2 DAYS';
      phaseClass = 'phase-soon';
    } else if (days <= 7) {
      phase = 'NEXT GATHERING';
      countText = days + ' DAYS OUT';
      phaseClass = 'phase-week';
    } else {
      phase = 'NEXT GATHERING';
      countText = days + ' DAYS';
      phaseClass = 'phase-normal';
    }

    if (phaseEl) phaseEl.textContent = phase;
    if (countEl) countEl.textContent = countText;
    if (card) {
      card.classList.remove('phase-normal', 'phase-week', 'phase-soon', 'phase-tonight', 'phase-live');
      card.classList.add(phaseClass);
    }

    // Prompt copy tracks phase when not locked in
    const prompt = $('#rsvp-prompt');
    if (prompt && !rsvp) {
      if (phaseClass === 'phase-live' || phaseClass === 'phase-tonight') {
        prompt.textContent = 'Your seat is open. Lock it in tonight.';
      } else if (phaseClass === 'phase-soon') {
        prompt.textContent = 'Brothers are locking in. Your seat is open.';
      } else {
        prompt.textContent = 'Your seat is open. Lock it in.';
      }
    }

    // Keep the live countdown fresh near gathering
    if (days <= 1) {
      setTimeout(updateMeetingCard, 15 * 60 * 1000);
    }
  }

  // ---------- LOCAL NOTIFICATIONS (client-side) ----------
  // Fires when the brother opens the app (or keeps it open).
  // Key windows: 7 days, 3 days, 1 day, morning of meeting.
  const NOTIFY_KEYS = {
    d7: 'tb_notified_7d',
    d3: 'tb_notified_3d',
    d1: 'tb_notified_1d',
    morning: 'tb_notified_morning'
  };

  function canNotify() {
    return ('Notification' in window) && Notification.permission === 'granted';
  }

  function requestNotifyPermission() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    if (Notification.permission === 'denied') return Promise.resolve('denied');
    return Notification.requestPermission();
  }

  function fireLocalNotification(title, body, tag) {
    if (!canNotify()) return;
    try {
      const n = new Notification(title, {
        body,
        icon: 'assets/icon-192.png',
        badge: 'assets/icon-192.png',
        tag: tag || 'thunder-meeting',
        requireInteraction: false
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('Notification failed', e);
    }
  }

  function checkAndFireMeetingNotifications() {
    const next = getNextMeetingMonday();
    const days = daysUntil(next);
    const now = new Date();
    const hour = now.getHours();

    // Only fire each window once per meeting cycle
    const meetingKey = next.toISOString().slice(0, 10); // YYYY-MM-DD of meeting

    function alreadyFired(key) {
      return load(key) === meetingKey;
    }
    function markFired(key) {
      save(key, meetingKey);
    }

    if (days === 7 && !alreadyFired(NOTIFY_KEYS.d7)) {
      fireLocalNotification(
        '⚡ 7 Days Out',
        'Sons of Thunder gathers in one week. Lock it in.',
        'thunder-7d'
      );
      markFired(NOTIFY_KEYS.d7);
    }

    if (days === 3 && !alreadyFired(NOTIFY_KEYS.d3)) {
      fireLocalNotification(
        '⚡ 3 Days Out',
        'Three days. Show up. Carry weight.',
        'thunder-3d'
      );
      markFired(NOTIFY_KEYS.d3);
    }

    if (days === 1 && !alreadyFired(NOTIFY_KEYS.d1)) {
      fireLocalNotification(
        '⚡ Tomorrow',
        'Gathering is tomorrow at ' + meetingTime() + ' — ' + venueName() + '.',
        'thunder-1d'
      );
      markFired(NOTIFY_KEYS.d1);
    }

    // Morning of meeting (between 7am – 11am local)
    if (days === 0 && hour >= 7 && hour < 11 && !alreadyFired(NOTIFY_KEYS.morning)) {
      fireLocalNotification(
        '⚡ Tonight',
        'Sons of Thunder. ' + meetingTime() + '. ' + venueName() + '. Be there.',
        'thunder-morning'
      );
      markFired(NOTIFY_KEYS.morning);
    }
  }

  function setupNotificationSystem() {
    // Request permission once (non-blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      // We wait for the first user gesture (reminder button or RSVP) before asking
    }

    // Check immediately on load
    checkAndFireMeetingNotifications();

    // Re-check every 30 minutes while the app is open
    setInterval(checkAndFireMeetingNotifications, 30 * 60 * 1000);

    // Also re-check when the tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndFireMeetingNotifications();
      }
    });
  }

  function buildCalendarLinks(meetingDate) {
    // Reminder fires 7 days before at 9:00 AM local
    const reminder = new Date(meetingDate);
    reminder.setDate(reminder.getDate() - 7);
    reminder.setHours(9, 0, 0, 0);

    const meetingStart = new Date(meetingDate);
    const _mt2 = parseMeetingHours(); meetingStart.setHours(_mt2.h, _mt2.m, 0, 0);
    const meetingEnd = new Date(meetingStart);
    meetingEnd.setTime(meetingStart.getTime() + 2 * 60 * 60 * 1000);

    function toICSDate(d) {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    // Google Calendar link for the reminder
    const gTitle = encodeURIComponent("Thunder Board — 7 Days Out");
    const gDetails = encodeURIComponent("Sons of Thunder gathering is in 7 days.\\nShow up. Carry weight.");
    const gStart = reminder.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gEnd = new Date(reminder.getTime() + 30*60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gTitle}&dates=${gStart}/${gEnd}&details=${gDetails}`;

    // Also create an .ics for the meeting itself + reminder
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sons of Thunder//Thunder Board//EN",
      "BEGIN:VEVENT",
      "UID:thunder-reminder-" + reminder.getTime() + "@sonsofthunder",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(reminder),
      "DTEND:" + toICSDate(new Date(reminder.getTime() + 30*60000)),
      "SUMMARY:Thunder Board — 7 Days Out",
      "DESCRIPTION:Sons of Thunder gathering is in 7 days. Show up. Carry weight.",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:thunder-meeting-" + meetingStart.getTime() + "@sonsofthunder",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(meetingStart),
      "DTEND:" + toICSDate(meetingEnd),
      "SUMMARY:Sons of Thunder Gathering",
      "DESCRIPTION:Monthly gathering. " + venueName() + ". " + meetingTime() + ".",
      "LOCATION:" + venueName(),
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\\r\\n");

    return { googleUrl, ics };
  }

  function setupReminderButton() {
    const btn = document.getElementById('reminder-btn');
    const status = document.getElementById('reminder-status');
    if (!btn) return;

    // Restore previous choice
    if (load('reminderSet')) {
      btn.classList.add('set');
      btn.textContent = "REMINDER SET";
      if (status) {
        status.textContent = "Calendar reminder locked in.";
        status.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', () => {
      const next = getNextMeetingMonday();
      const { googleUrl, ics } = buildCalendarLinks(next);

      // Prefer native calendar download + Google as fallback
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "sons-of-thunder-reminder.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Also open Google Calendar in a new tab for easy add
      setTimeout(() => window.open(googleUrl, '_blank'), 400);

      btn.classList.add('set');
      btn.textContent = "REMINDER SET";
      save('reminderSet', true);
      tbGlowHit(btn, 'yellow');

      if (status) {
        status.textContent = "7 days out. Be ready.";
        status.classList.remove('hidden');
      }

      // Request browser notification permission so local alerts can fire
      requestNotifyPermission().then((perm) => {
        if (perm === 'granted') {
          checkAndFireMeetingNotifications();
        }
      });
    });
  }


  // ---------- NEW indicators (open-to-clear) ----------
  function latestMediaAt() {
    let max = 0;
    (media || []).forEach(m => {
      if (!m) return;
      const t = m.date ? Date.parse(m.date) : 0;
      if (t > max) max = t;
    });
    return max;
  }

  function latestBrotherAt() {
    let max = 0;
    (brothers || []).forEach(b => {
      if (!b) return;
      const t = typeof b.updatedAt === 'number' ? b.updatedAt : 0;
      if (t > max) max = t;
    });
    return max;
  }

  function isAnnouncementNew(a) {
    if (!a || !(a.createdAt > 0) || !a.id) return false;
    return !seenAnnouncements[a.id];
  }

  function hasNewAnnouncements() {
    return (announcements || []).some(isAnnouncementNew);
  }

  function markAnnouncementSeen(id) {
    if (!id) return;
    if (seenAnnouncements[id]) return;
    seenAnnouncements[id] = true;
    save('seenAnnouncements', seenAnnouncements);
    renderAnnouncements();
    updateAllNewBadges();
  }

  function hasNewEvents() {
    return (eventsUpdatedAt || 0) > (eventsSeenAt || 0);
  }

  function markEventsSeen() {
    if ((eventsUpdatedAt || 0) > (eventsSeenAt || 0)) {
      eventsSeenAt = eventsUpdatedAt;
      save('eventsSeenAt', eventsSeenAt);
    }
    renderMission();
    renderEventsNote();
    updateAllNewBadges();
  }

  function hasNewMedia() {
    const latest = latestMediaAt();
    return latest > 0 && latest > (mediaSeenAt || 0);
  }

  function markMediaSeen() {
    const latest = latestMediaAt();
    if (latest > (mediaSeenAt || 0)) {
      mediaSeenAt = latest;
      save('mediaSeenAt', mediaSeenAt);
    }
    if (latest > (lastFireSeenAt || 0)) {
      lastFireSeenAt = latest;
      save('lastFireSeenAt', lastFireSeenAt);
    }
    renderMedia();
    renderLastFire();
    updateAllNewBadges();
  }

  function hasNewBrothers() {
    const latest = latestBrotherAt();
    return latest > 0 && latest > (brothersSeenAt || 0);
  }

  function markBrothersSeen() {
    const latest = latestBrotherAt();
    if (latest > (brothersSeenAt || 0)) {
      brothersSeenAt = latest;
      save('brothersSeenAt', brothersSeenAt);
    }
    renderBrothers();
    updateAllNewBadges();
  }

  function hasNewLastFire() {
    if (!lastFire) return false;
    const t = Number(lastFire.updatedAt) || 0;
    if (!t) return false;
    return t > (lastFireSeenAt || 0);
  }

  function markLastFireSeen() {
    const t = lastFire && lastFire.updatedAt ? Number(lastFire.updatedAt) : Date.now();
    if (t > (lastFireSeenAt || 0)) {
      lastFireSeenAt = t;
      save('lastFireSeenAt', lastFireSeenAt);
    }
    renderLastFire();
    updateAllNewBadges();
  }

  function setSectionNewBadge(el, show) {
    if (!el) return;
    let badge = el.querySelector(':scope > .new-badge');
    if (show) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'new-badge';
        badge.textContent = 'NEW';
        el.appendChild(badge);
      }
    } else if (badge) {
      badge.remove();
    }
  }

  function setNavDot(viewName, show) {
    const nav = $(`.nav-item[data-view="${viewName}"]`);
    if (!nav) return;
    let dot = nav.querySelector('.nav-new-dot');
    if (show) {
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'nav-new-dot';
        dot.setAttribute('aria-hidden', 'true');
        nav.appendChild(dot);
      }
    } else if (dot) {
      dot.remove();
    }
  }

  function updateAllNewBadges() {
    setSectionNewBadge($('#announcements-title'), hasNewAnnouncements());
    setSectionNewBadge($('#events-section-title'), hasNewEvents());
    setSectionNewBadge($('#memories-section-title'), hasNewMedia());
    setSectionNewBadge($('#brothers-section-title'), hasNewBrothers());
    // Nav dots: home = announcements or last fire; brothers; events = mission/note or memories
    setNavDot('home', hasNewAnnouncements() || hasNewLastFire());
    setNavDot('brothers', hasNewBrothers());
    setNavDot('events', hasNewEvents() || hasNewMedia());
  }

  // First install of this feature: don't mark all existing content NEW
  function bootstrapSeenState() {
    if (load('seenBootstrapped')) return;
    const now = Date.now();
    if (!(mediaSeenAt > 0)) {
      mediaSeenAt = latestMediaAt() || now;
      save('mediaSeenAt', mediaSeenAt);
    }
    if (!(brothersSeenAt > 0)) {
      brothersSeenAt = latestBrotherAt() || now;
      save('brothersSeenAt', brothersSeenAt);
    }
    if (!(eventsSeenAt > 0)) {
      eventsSeenAt = eventsUpdatedAt || now;
      save('eventsSeenAt', eventsSeenAt);
    }
    if (!(lastFireSeenAt > 0)) {
      lastFireSeenAt = mediaSeenAt || now;
      save('lastFireSeenAt', lastFireSeenAt);
    }
    save('seenBootstrapped', 1);
  }

  function renderAnnouncements() {
    const el = $('#announcements');
    if (!el) return;
    if (!announcements.length) {
      el.innerHTML = '<div class="empty-state" style="padding:16px 0;color:#666;">No announcements yet.</div>';
      updateAllNewBadges();
      return;
    }
    el.innerHTML = announcements.map((a, i) => {
      const isNew = isAnnouncementNew(a);
      return `
      <button type="button" class="announcement-card${isNew ? ' announcement-new' : ''}" data-ann-index="${i}" aria-label="Open announcement">
        ${isNew ? '<span class="new-badge new-badge-card">NEW</span>' : ''}
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.body)}</p>
      </button>`;
    }).join('');
    el.querySelectorAll('.announcement-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-ann-index'), 10) || 0;
        const a = announcements[idx];
        if (!a) return;
        markAnnouncementSeen(a.id);
        openInfoDetail({
          label: 'ANNOUNCEMENT',
          title: a.title || 'Announcement',
          meta: '',
          body: a.body || ''
        });
      });
    });
    updateAllNewBadges();
  }


  function renderCode() {
    const el = $('#code-list');
    if (!el) return;
    el.innerHTML = CODE.map(c => `
      <div class="code-item">
        <div class="code-line">${esc(c.line)}</div>
        <div class="code-sub">${esc(c.sub)}</div>
      </div>`).join('');
  }

  function renderEventsNote() {
    const el = $('#events-note');
    if (!el) return;
    if (eventsNote && String(eventsNote).trim()) {
      const isNew = hasNewEvents();
      el.innerHTML = (isNew ? '<span class="new-badge new-badge-card">NEW</span>' : '') + esc(eventsNote);
      el.classList.toggle('announcement-new', isNew);
      el.classList.remove('hidden');
    } else {
      el.textContent = '';
      el.classList.remove('announcement-new');
      el.classList.add('hidden');
    }
  }

  function renderMission() {
    const t = $('#mission-title');
    const d = $('#mission-detail');
    const card = $('#next-mission-card');
    if (t) t.textContent = mission.title || '';
    if (d) d.textContent = mission.detail || '';
    if (card) {
      const isNew = hasNewEvents();
      let badge = card.querySelector('.new-badge-card');
      if (isNew) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'new-badge new-badge-card';
          badge.textContent = 'NEW';
          const label = card.querySelector('.card-label');
          if (label) label.after(badge);
          else card.insertBefore(badge, card.firstChild);
        }
        card.classList.add('card-new');
      } else {
        if (badge) badge.remove();
        card.classList.remove('card-new');
      }
    }
    if (typeof renderHomeMission === 'function') renderHomeMission();
  }

  // ---------- INFO DETAIL (tap-to-expand cards) ----------
  function haptic(ms) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(ms || 12);
      }
    } catch (e) {}
  }

  function openInfoDetail(payload) {
    const detail = $('#info-detail');
    if (!detail) return;
    const label = $('#info-detail-label');
    const title = $('#info-detail-title');
    const meta = $('#info-detail-meta');
    const body = $('#info-detail-body');
    if (label) label.textContent = payload.label || '';
    if (title) title.textContent = payload.title || '';
    if (meta) meta.textContent = payload.meta || '';
    if (body) body.textContent = payload.body || '';
    detail.classList.remove('hidden');
    detail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    haptic(12);
    bindInfoDetail();
  }

  function closeInfoDetail() {
    const detail = $('#info-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    releaseFocusAndZoom();
    detail.classList.add('hidden');
    detail.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    haptic(8);
  }

  function bindInfoDetail() {
    const detail = $('#info-detail');
    if (!detail) return;
    const closeBtn = $('#info-detail-close');
    if (closeBtn && closeBtn.dataset.closeWired !== '1') {
      closeBtn.dataset.closeWired = '1';
      const dismiss = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeInfoDetail();
      };
      closeBtn.addEventListener('click', dismiss);
      closeBtn.addEventListener('touchend', dismiss, { passive: false });
    }
    if (detail.dataset.bound === '1') return;
    detail.dataset.bound = '1';
    detail.addEventListener('click', (e) => {
      if (e.target === detail) closeInfoDetail();
    });
    let startY = 0;
    detail.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) startY = e.touches[0].clientY;
    }, { passive: true });
    detail.addEventListener('touchend', (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      if (t.clientY - startY > 80) closeInfoDetail();
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (!detail.classList.contains('hidden') && e.key === 'Escape') closeInfoDetail();
    });
  }

  function bindInfoCardTargets() {
    const note = $('#events-note');
    if (note && note.dataset.infoBound !== '1') {
      note.dataset.infoBound = '1';
      const openNote = () => {
        if (note.classList.contains('hidden')) return;
        const text = (eventsNote || '').trim();
        if (!text) return;
        markEventsSeen();
        openInfoDetail({
          label: 'UPCOMING',
          title: 'Heads up',
          meta: '',
          body: text
        });
      };
      note.addEventListener('click', openNote);
      note.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNote(); }
      });
    }

    const openMission = () => {
      markEventsSeen();
      openInfoDetail({
        label: 'MISSION',
        title: (mission && mission.title) || 'Next Mission',
        meta: '',
        body: (mission && mission.detail) || ''
      });
    };

    const missionCard = $('#next-mission-card');
    if (missionCard && missionCard.dataset.infoBound !== '1') {
      missionCard.dataset.infoBound = '1';
      missionCard.addEventListener('click', openMission);
      missionCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMission(); }
      });
    }

    const homeMission = $('#home-mission');
    if (homeMission && homeMission.dataset.infoBound !== '1') {
      homeMission.dataset.infoBound = '1';
      homeMission.addEventListener('click', openMission);
      homeMission.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMission(); }
      });
    }

    const lf = $('#last-fire');
    if (lf && lf.dataset.infoBound !== '1') {
      lf.dataset.infoBound = '1';
      const openLf = () => {
        if (lf.classList.contains('hidden')) return;
        markLastFireSeen();
        openInfoDetail({
          label: 'LAST FIRE',
          title: 'What we did',
          meta: '',
          body: (lastFire && lastFire.caption) || ''
        });
      };
      lf.addEventListener('click', openLf);
      lf.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLf(); }
      });
    }
  }

  function requireLeader() {
    if (leaderUnlocked) return true;
    const pin = (cfg().LEADER_PIN || 'sot-lead');
    const entered = window.prompt('Leadership PIN');
    if (entered == null) return false;
    if (String(entered) !== String(pin)) {
      alert('Wrong PIN');
      return false;
    }
    leaderUnlocked = true;
    const tools = $('#leader-tools');
    if (tools) tools.classList.remove('hidden');
    return true;
  }

    function renderAdminAnnouncements() {
    const list = $('#admin-ann-list');
    if (!list) return;
    list.innerHTML = announcements.map((a, i) => `
      <div class="admin-ann-item" data-index="${i}">
        <div class="admin-ann-text">
          <strong>${esc(a.title)}</strong>
          <span>${esc(a.body)}</span>
        </div>
        <button class="admin-ann-delete" data-index="${i}" type="button">✕</button>
      </div>
    `).join('') || '<div class="empty-state">No announcements yet.</div>';
  }

  function openBrotherDetail(index) {
    const list = brothers || [];
    if (!list.length || index < 0 || index >= list.length) return;
    const b = list[index];
    const detail = $('#brother-detail');
    if (!detail) return;
    const initials = (b.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
    const hasPhoto = b.photo && (b.photo.startsWith('data:') || b.photo.startsWith('http'));
    const photoEl = $('#brother-detail-photo');
    if (photoEl) {
      photoEl.innerHTML = hasPhoto
        ? `<img src="${esc(b.photo)}" alt="${esc(b.name || '')}" />`
        : esc(initials);
    }
    const nameEl = $('#brother-detail-name');
    if (nameEl) nameEl.textContent = b.name || '';
    const bioEl = $('#brother-detail-bio');
    if (bioEl) bioEl.textContent = b.bio || '';
    detail.classList.remove('hidden');
    detail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    bindBrotherDetail(); // ensure X is wired
  }

  function closeBrotherDetail() {
    const detail = $('#brother-detail');
    if (!detail) return;
    releaseFocusAndZoom();
    detail.classList.add('hidden');
    detail.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function bindBrotherDetail() {
    const detail = $('#brother-detail');
    if (!detail) return;
    // Always (re)wire close — safe to call more than once
    const closeBtn = $('#brother-detail-close');
    if (closeBtn && closeBtn.dataset.closeWired !== '1') {
      closeBtn.dataset.closeWired = '1';
      const dismiss = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeBrotherDetail();
      };
      closeBtn.addEventListener('click', dismiss);
      closeBtn.addEventListener('touchend', dismiss, { passive: false });
    }
    if (detail.dataset.bound === '1') return;
    detail.dataset.bound = '1';
    detail.addEventListener('click', (e) => {
      if (e.target === detail) closeBrotherDetail();
    });
    let startY = 0;
    detail.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) startY = e.touches[0].clientY;
    }, { passive: true });
    detail.addEventListener('touchend', (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      // Ignore swipe-down that started on the close button
      if (t.clientY - startY > 80) closeBrotherDetail();
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (!detail.classList.contains('hidden') && e.key === 'Escape') closeBrotherDetail();
    });
  }

  function openProfileEditor() {
    const me = brothers.find(b => b.id === myProfileId);
    if (me) {
      const nameEl = $('#profile-name');
      const bioEl = $('#profile-bio');
      if (nameEl) nameEl.value = me.name || '';
      if (bioEl) bioEl.value = me.bio || '';
      if (me.photo) {
        pendingPhotoData = me.photo;
        const preview = $('#photo-preview');
        if (preview) {
          preview.innerHTML = `<img src="${me.photo}">`;
          preview.classList.add('visible');
        }
      }
    } else {
      const nameEl = $('#profile-name');
      const bioEl = $('#profile-bio');
      if (nameEl) nameEl.value = '';
      if (bioEl) bioEl.value = '';
      pendingPhotoData = null;
      const preview = $('#photo-preview');
      if (preview) { preview.innerHTML = ''; preview.classList.remove('visible'); }
    }
    openModal('profile-modal');
  }

  function renderBrothers() {
    const grid = $('#brothers-grid');
    if (!grid) return;
    if (!brothers.length) {
      grid.innerHTML = `
        <button type="button" class="empty-state empty-brothers empty-brothers-cta" id="empty-brothers-cta" aria-label="Add your profile">
          <div class="empty-brothers-plus" aria-hidden="true">+</div>
          <div class="empty-brothers-title">No brothers listed yet.</div>
          <div class="empty-brothers-sub">Be the first.<br>Add your profile.</div>
        </button>`;
      const cta = $('#empty-brothers-cta');
      if (cta) {
        cta.addEventListener('click', () => {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          if (typeof haptic === 'function') haptic(10);
          openProfileEditor();
        });
      }
      updateAllNewBadges();
      return;
    }
    grid.innerHTML = brothers.map((b, i) => {
      const initials = (b.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
      const hasPhoto = b.photo && (b.photo.startsWith('data:') || b.photo.startsWith('http'));
      const photoHtml = hasPhoto
        ? `<img class="brother-photo" src="${esc(b.photo)}" alt="${esc(b.name)}" />`
        : `<div class="brother-photo">${esc(initials)}</div>`;
      const isNew = (typeof b.updatedAt === 'number' && b.updatedAt > (brothersSeenAt || 0));
      return `
        <button type="button" class="brother-card${isNew ? ' card-new' : ''}" data-brother-index="${i}" aria-label="View ${esc(b.name || 'brother')} profile">
          ${isNew ? '<span class="new-badge new-badge-overlay">NEW</span>' : ''}
          ${photoHtml}
          <div class="brother-info">
            <div class="brother-name">${esc(b.name)}</div>
            <div class="brother-bio">${esc(b.bio || '')}</div>
          </div>
        </button>`;
    }).join('');
    grid.querySelectorAll('.brother-card').forEach(card => {
      card.addEventListener('click', () => {
        tbGlowHit(card, 'yellow');
        const idx = parseInt(card.getAttribute('data-brother-index'), 10) || 0;
        openBrotherDetail(idx);
      });
    });
    updateAllNewBadges();
  }

  function renderUpcoming() {
    const el = $('#upcoming-events');
    if (!el) return;
    const UPCOMING = buildUpcoming();
    el.innerHTML = UPCOMING.map((e, i) => `
      <button type="button" class="event-item" data-event-index="${i}" aria-label="Open ${esc(e.title)}">
        <div class="event-date-box">
          <div class="event-month">${esc(e.month)}</div>
          <div class="event-day">${esc(e.day)}</div>
        </div>
        <div class="event-details">
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.detail)}</p>
        </div>
      </button>`).join('');
    el.querySelectorAll('.event-item').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-event-index'), 10) || 0;
        const e = UPCOMING[idx];
        if (!e) return;
        openInfoDetail({
          label: 'GATHERING',
          title: e.title || 'Monthly Gathering',
          meta: (e.fullDate || ((e.month || '') + ' ' + (e.day || ''))) + (e.detail ? '\n' + e.detail : ''),
          body: (gatheringBody && String(gatheringBody).trim()) || DEFAULT_GATHERING_BODY
        });
      });
    });
  }

  // ---------- MEMORY VIEWER ----------
  let memoryViewerIndex = 0;
  let memorySwipeStartX = 0;
  let memorySwipeStartY = 0;
  let memorySwipeActive = false;

  function viewableMemories() {
    return (media || []).filter(m => m && m.data);
  }

  function openMemoryViewer(index) {
    const list = viewableMemories();
    if (!list.length) return;
    memoryViewerIndex = Math.max(0, Math.min(index, list.length - 1));
    const viewer = $('#memory-viewer');
    if (!viewer) return;
    viewer.classList.remove('hidden');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    bindMemoryViewer(); // ensure X is wired
    paintMemoryViewer();
  }

  function closeMemoryViewer() {
    const viewer = $('#memory-viewer');
    if (!viewer) return;
    releaseFocusAndZoom();
    viewer.classList.add('hidden');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const stage = $('#memory-viewer-stage');
    if (stage) {
      const v = stage.querySelector('video');
      if (v) { try { v.pause(); } catch (e) {} }
      stage.innerHTML = '';
    }
  }

  function paintMemoryViewer() {
    const list = viewableMemories();
    if (!list.length) { closeMemoryViewer(); return; }
    if (memoryViewerIndex < 0) memoryViewerIndex = 0;
    if (memoryViewerIndex >= list.length) memoryViewerIndex = list.length - 1;
    const m = list[memoryViewerIndex];
    const stage = $('#memory-viewer-stage');
    const cap = $('#memory-viewer-caption');
    const count = $('#memory-viewer-count');
    if (count) count.textContent = (memoryViewerIndex + 1) + ' / ' + list.length;
    if (cap) cap.textContent = m.caption || '';
    if (stage) {
      const prev = stage.querySelector('video');
      if (prev) { try { prev.pause(); } catch (e) {} }
      if (m.type === 'video') {
        stage.innerHTML = `<video src="${m.data}" controls playsinline></video>`;
      } else {
        stage.innerHTML = `<img src="${m.data}" alt="">`;
      }
    }
  }

  function memoryViewerStep(delta) {
    const list = viewableMemories();
    if (!list.length) return;
    const next = memoryViewerIndex + delta;
    if (next < 0 || next >= list.length) return; // stop at ends
    memoryViewerIndex = next;
    paintMemoryViewer();
  }

  function bindMemoryViewer() {
    const viewer = $('#memory-viewer');
    if (!viewer) return;
    const closeBtn = $('#memory-viewer-close');
    if (closeBtn && closeBtn.dataset.closeWired !== '1') {
      closeBtn.dataset.closeWired = '1';
      const dismiss = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeMemoryViewer();
      };
      closeBtn.addEventListener('click', dismiss);
      closeBtn.addEventListener('touchend', dismiss, { passive: false });
    }
    if (viewer.dataset.bound === '1') return;
    viewer.dataset.bound = '1';
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer || e.target.classList.contains('memory-viewer-top') || e.target.id === 'memory-viewer-count') {
        closeMemoryViewer();
      }
    });
    viewer.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      // Don't start swipe tracking from close control or video controls
      if (e.target.closest && (
        e.target.closest('.memory-viewer-close') ||
        e.target.closest('video')
      )) return;
      memorySwipeActive = true;
      memorySwipeStartX = e.touches[0].clientX;
      memorySwipeStartY = e.touches[0].clientY;
    }, { passive: true });
    viewer.addEventListener('touchend', (e) => {
      if (!memorySwipeActive) return;
      memorySwipeActive = false;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - memorySwipeStartX;
      const dy = t.clientY - memorySwipeStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      // Swipe down to dismiss (same feel as Brother profile)
      if (dy > 80 && absY > absX) {
        closeMemoryViewer();
        return;
      }
      // Horizontal swipe → prev/next memory
      if (absX < 50 || absX < absY) return;
      if (dx < 0) memoryViewerStep(1);
      else memoryViewerStep(-1);
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (!$('#memory-viewer') || $('#memory-viewer').classList.contains('hidden')) return;
      if (e.key === 'Escape') closeMemoryViewer();
      if (e.key === 'ArrowLeft') memoryViewerStep(-1);
      if (e.key === 'ArrowRight') memoryViewerStep(1);
    });
  }

  function renderMedia() {
    const el = $('#media-feed');
    if (!el) return;
    updateAuthSessionBar();
    if (supabaseEnabled() && !isSignedIn()) {
      el.innerHTML = '<div class="empty-state">Sign in to see shared memories.<br><button type="button" id="memories-signin-cta" class="btn-secondary" style="margin-top:12px;">Sign In</button></div>';
      const cta = $('#memories-signin-cta');
      if (cta && cta.dataset.bound !== '1') {
        cta.dataset.bound = '1';
        cta.addEventListener('click', () => openAuthGate('Sign in to view and add shared memories.'));
      }
      updateAllNewBadges();
      return;
    }
    if (!media.length) {
      el.innerHTML = '<div class="empty-state">No memories yet.<br>Be the first to drop a photo.</div>';
      updateAllNewBadges();
      return;
    }
    el.innerHTML = media.map((m, i) => {
      const isVideo = m.type === 'video';
      const src = m.data ? esc(m.data) : '';
      const mediaTag = isVideo
        ? `<video src="${src}" muted playsinline preload="metadata"></video><div class="media-thumb-play">▶</div>`
        : `<img src="${src}" alt="" loading="lazy" />`;
      const who = m.uploader_name ? esc(m.uploader_name) : '';
      const capText = m.caption ? esc(m.caption) : '';
      const cap = (capText || who)
        ? `<div class="media-thumb-cap">${capText}${who ? (capText ? ' · ' : '') + who : ''}</div>`
        : '';
      const t = m.date ? Date.parse(m.date) : 0;
      const isNew = t > 0 && t > (mediaSeenAt || 0);
      return `<button type="button" class="media-thumb${isNew ? ' card-new' : ''}" data-media-index="${i}" aria-label="View memory">${isNew ? '<span class="new-badge new-badge-overlay">NEW</span>' : ''}${mediaTag}${cap}</button>`;
    }).join('');
    el.querySelectorAll('.media-thumb').forEach((btn, i) => {
      btn.style.animationDelay = (Math.min(i, 8) * 0.04) + 's';
      btn.classList.add('media-enter');
      btn.addEventListener('click', () => {
        tbGlowHit(btn, 'yellow');
        const idx = parseInt(btn.getAttribute('data-media-index'), 10) || 0;
        openMemoryViewer(idx);
        markMediaSeen();
      });
    });
    updateAllNewBadges();
  }

  function meetingKey() {
    try {
      const d = getNextMeetingMonday();
      return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    } catch (e) {
      return 'default';
    }
  }

  function myInitials() {
    const me = (brothers || []).find(b => b.id === myProfileId);
    if (me && me.name) {
      const parts = String(me.name).trim().split(/\s+/).filter(Boolean);
      const a = (parts[0] && parts[0][0]) || '';
      const b = (parts[1] && parts[1][0]) || '';
      const ini = (a + b).toUpperCase();
      return ini || 'ME';
    }
    return 'ME';
  }

  function myPhoto() {
    const me = (brothers || []).find(b => b.id === myProfileId);
    return (me && (me.photo || me.photo_url)) || '';
  }

  function getRoster() {
    const all = load('rsvpRoster') || {};
    const list = all[meetingKey()];
    return Array.isArray(list) ? list : [];
  }

  function setRoster(list) {
    const all = load('rsvpRoster') || {};
    all[meetingKey()] = list;
    save('rsvpRoster', all);
  }

  function syncSelfToRoster(inFlag) {
    const id = myProfileId || 'local-self';
    let list = getRoster().filter(x => x && x.id !== id);
    if (inFlag) {
      list.push({ id: id, initials: myInitials(), photo: myPhoto() || '', me: true, at: Date.now() });
    }
    setRoster(list);
    return list;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function animateWhosInCount(fromN, toN, countEl) {
    if (!countEl) return;
    const labelFor = (n) => (n === 1 ? '1 BROTHER IS IN' : (n + ' BROTHERS ARE IN'));
    if (prefersReducedMotion() || fromN === toN) {
      countEl.textContent = labelFor(toN);
      return;
    }
    countEl.classList.remove('count-tick');
    void countEl.offsetWidth;
    countEl.textContent = labelFor(toN);
    countEl.classList.add('count-tick');
    setTimeout(() => countEl.classList.remove('count-tick'), 420);
  }

  function renderWhosIn(list, prevCount) {
    const wrap = $('#whos-in');
    const countEl = $('#whos-in-count');
    const row = $('#whos-in-row');
    if (!wrap || !countEl || !row) return;
    const roster = Array.isArray(list) ? list : getRoster();
    const n = roster.length;
    if (!n) {
      wrap.classList.add('hidden');
      row.innerHTML = '';
      countEl.textContent = '';
      return;
    }
    const prev = (typeof prevCount === 'number') ? prevCount : n;
    animateWhosInCount(prev, n, countEl);
    const maxChips = 12;
    const shown = roster.slice(0, maxChips);
    row.innerHTML = shown.map(p => {
      const isMe = !!(p.me || (myProfileId && p.id === myProfileId) || p.id === 'local-self');
      const chipClass = 'whos-chip' + (isMe ? ' me' : '') + (isMe ? ' chip-enter' : '');
      if (p.photo) {
        return `<div class="${chipClass}" title="${esc(p.initials || '')}"><img src="${esc(p.photo)}" alt=""></div>`;
      }
      return `<div class="${chipClass}">${esc(p.initials || '?')}</div>`;
    }).join('') + (roster.length > maxChips
      ? `<span class="whos-chip-more">+${roster.length - maxChips}</span>`
      : '');
    wrap.classList.remove('hidden');
  }

  function renderRsvp() {
    const btn = $('#rsvp-btn');
    const status = $('#rsvp-status');
    const prompt = $('#rsvp-prompt');
    if (!btn) return;
    if (rsvp) {
      const prevCount = getRoster().length;
      const list = syncSelfToRoster(true);
      btn.classList.add('confirmed');
      btn.textContent = "✓ YOU'RE LOCKED IN";
      if (status) {
        status.textContent = "✓ YOU'RE LOCKED IN";
        status.classList.remove('hidden');
      }
      if (prompt) prompt.classList.add('hidden');
      renderWhosIn(list, prevCount);
    } else {
      const prevCount = getRoster().length;
      const list = syncSelfToRoster(false);
      btn.classList.remove('confirmed');
      btn.textContent = "I'M IN";
      if (status) status.classList.add('hidden');
      if (prompt) {
        if (!prompt.textContent || prompt.textContent.indexOf('seat') === -1) {
          prompt.textContent = "Your seat is open. Lock it in.";
        }
        prompt.classList.remove('hidden');
      }
      renderWhosIn(list, prevCount);
    }
  }

  function renderLastFire() {
    const el = $('#last-fire');
    if (!el) return;
    const media = $('#last-fire-media');
    const cap = $('#last-fire-cap');
    const hasCap = lastFire && String(lastFire.caption || '').trim();
    const hasPhoto = lastFire && lastFire.photo;
    if (!hasCap && !hasPhoto) {
      el.classList.add('hidden');
      if (media) media.innerHTML = '';
      if (cap) cap.textContent = '';
      updateAllNewBadges();
      return;
    }
    if (media) {
      media.innerHTML = hasPhoto ? `<img src="${esc(lastFire.photo)}" alt="">` : '';
    }
    if (cap) cap.textContent = hasCap ? String(lastFire.caption).trim() : '';
    el.classList.remove('hidden');
    updateAllNewBadges();
  }

  function renderHomeMission() {
    const card = $('#home-mission');
    const t = $('#home-mission-title');
    const d = $('#home-mission-detail');
    if (!card) return;
    const title = (mission && mission.title) ? String(mission.title).trim() : '';
    const detail = (mission && mission.detail) ? String(mission.detail).trim() : '';
    if (!title && !detail) {
      card.classList.add('hidden');
      return;
    }
    if (t) t.textContent = title;
    if (d) d.textContent = detail;
    card.classList.remove('hidden');
  }


  // ---------- NAV ----------
  const TAB_ORDER = ['home', 'brothers', 'events', 'about'];
  let currentViewName = 'home';

  function showView(name) {
    if (!TAB_ORDER.includes(name)) return;
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = $(`#view-${name}`);
    const nav = $(`.nav-item[data-view="${name}"]`);
    if (view) view.classList.add('active');
    if (nav) {
      nav.classList.add('active');
      tbGlowHit(nav, 'yellow');
    }
    currentViewName = name;
    const header = $('#main-header');
    if (header) header.style.display = name === 'about' ? 'none' : 'block';
    // NEW no longer auto-clears on Home visit — only when items are opened
    if (name === 'brothers') {
      // Roster NEW clears when the brothers tab is opened
      markBrothersSeen();
    }
  }

  function isOverlayBlockingSwipe() {
    if ($('#memory-viewer') && !$('#memory-viewer').classList.contains('hidden')) return true;
    if ($('#auth-gate') && !$('#auth-gate').classList.contains('hidden')) return true;
    const openModal = document.querySelector('.modal:not(.hidden)');
    if (openModal) return true;
    return false;
  }

  function swipeStartBlocked(target) {
    if (!target || !target.closest) return true;
    if (target.closest('.bottom-nav')) return true;
    if (target.closest('#memory-viewer')) return true;
    if (target.closest('#auth-gate')) return true;
    if (target.closest('.modal')) return true;
    if (target.closest('#thunder-fab, .thunder-panel, .thunder-chat')) return true;
    if (target.closest('button, a, input, textarea, select, label, video')) return true;
    return false;
  }

  function setupTabSwipe() {
    const root = $('#app') || document.body;
    if (!root || root.dataset.tabSwipeBound === '1') return;
    root.dataset.tabSwipeBound = '1';

    let startX = 0;
    let startY = 0;
    let tracking = false;
    const THRESH = 56; // ~50–60px horizontal before page change
    const RATIO = 1.3; // horizontal must clearly dominate vertical scroll

    root.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) { tracking = false; return; }
      if (isOverlayBlockingSwipe()) { tracking = false; return; }
      if (swipeStartBlocked(e.target)) { tracking = false; return; }
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    root.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      if (isOverlayBlockingSwipe()) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < THRESH) return;
      if (absX < absY * RATIO) return; // vertical scroll wins

      const idx = TAB_ORDER.indexOf(currentViewName);
      if (idx < 0) return;
      // swipe left → next; swipe right → previous; no loop at ends
      if (dx < 0 && idx < TAB_ORDER.length - 1) {
        showView(TAB_ORDER[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        showView(TAB_ORDER[idx - 1]);
      }
    }, { passive: true });

    root.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
  }

  // ---------- MODALS ----------
  function releaseFocusAndZoom() {
    try {
      const ae = document.activeElement;
      if (ae && typeof ae.blur === 'function') ae.blur();
    } catch (e) {}
    // Nudge iOS to restore scale after input-focus zoom
    try {
      window.scrollTo(0, window.scrollY);
    } catch (e) {}
  }

  function openModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    releaseFocusAndZoom();
    el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ---------- THUNDER AI ----------
  // Escape first, then allow only **bold** and newlines → <br>
  function formatThunderHtml(text) {
    if (text == null) return '';
    let s = esc(String(text));
    // **bold** → <strong> (after escape, asterisks are safe)
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function addThunderMsg(text, role, source) {
    const box = $('#thunder-messages');
    const div = document.createElement('div');
    div.className = `thunder-msg ${role}`;
    const body = formatThunderHtml(text);
    div.innerHTML = body + (source ? `<div class="source">Source: <span>${esc(source)}</span></div>` : '');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  // Local instant answers (markdown only — formatThunderHtml escapes + **bold** / newlines)
  // null = fall through to Grok
  function thunderRespondLocal(q) {
    const query = q.toLowerCase().trim();

    if (query.includes('next meeting') || query.includes('when is') || query.includes('next gathering') || query.includes('where') || query.includes('what time')) {
      const next = getNextMeetingMonday();
      const dateStr = formatMeetingDate(next);
      return {
        text: dateStr + ' at ' + meetingTime() + ' — ' + venueName() + '.',
        source: 'Sons of Thunder Events'
      };
    }

    if (query.includes("who's in") || query.includes('who is going') || query.includes('rsvp') || query.includes("i'm in") || query.includes('im in')) {
      const n = getRoster().length;
      const line = n
        ? (n === 1 ? '**1 brother** is locked in on this phone’s roster.' : '**' + n + ' brothers** are locked in on this phone’s roster.')
        : 'Nobody locked in yet on this phone.';
      return {
        text: line + "\n\nTap **I'M IN** on Home to lock your seat.",
        source: 'Thunder Board'
      };
    }

    if (query.includes('code') || query.includes('what do we believe') || query.includes('the rules') || query.includes('how we roll')) {
      const lines = CODE.map(c => '**' + c.line + '**\n' + c.sub).join('\n\n');
      return { text: lines, source: 'Sons of Thunder — The Code' };
    }

    for (const key of Object.keys(SCRIPTURE)) {
      if (query.includes(key) || query.includes(key.replace(' ', ''))) {
        const s = SCRIPTURE[key];
        return {
          text: '**' + key.toUpperCase() + '**\n' + s.text + '\n\n' + s.note,
          source: 'Scripture (NASB)'
        };
      }
    }
    if (query.includes('iron sharpens') || query.includes('sharpen')) {
      const s = SCRIPTURE['proverbs 27:17'];
      return {
        text: '**PROVERBS 27:17**\n' + s.text + '\n\n' + s.note,
        source: 'Scripture (NASB)'
      };
    }
    if (query.includes('sons of thunder') || query.includes('boanerges') || query.includes('mark 3')) {
      const s = SCRIPTURE['mark 3:17'];
      return {
        text: '**MARK 3:17**\n' + s.text + '\n\n' + s.note,
        source: 'Scripture (NASB)'
      };
    }

    if (query.includes('who we are') || query.includes('why sons of thunder') || query.includes('identity') || query.includes("thunder doesn't dull") || query.includes('thunder doesnt dull')) {
      return {
        text: "We are the same kind of men Jesus nicknamed James and John: intense, loyal, and built for more. Left alone we can go too far. Together we keep each other sane, sharp, and useful to our families, our community, and the Kingdom.\n\n**Thunder doesn’t dull.**",
        source: 'Sons of Thunder — Who We Are'
      };
    }

    if (query.includes('rough night') || query.includes('struggling') || query.includes('need to talk') || query.includes('who can i call') || query.includes('alone') || query.includes('depressed') || query.includes('anxious')) {
      const available = brothers.filter(b => b.available).slice(0, 2);
      const names = available.length ? available.map(b => b.name).join(', ') : 'Your brothers';
      return {
        text: "You don’t have to handle tonight alone.\n\n" + names + " — reach a real man.\n\n**Text a Leader** from Home if you need a direct line.",
        source: 'Brother Availability'
      };
    }

    if (query.includes('who can help') || query.includes('need someone') || query.includes('who knows') || query.includes('hvac') || query.includes('electrical') || query.includes('construction')) {
      return {
        text: "Once brothers fill profiles, I can match skills. For now: ask in the room, or **Text a Leader** and we’ll point you to the right guy.",
        source: 'Brother Profiles'
      };
    }

    return null; // fall through to Grok
  }

  function buildGrokContext() {
    const next = getNextMeetingMonday();
    const dateStr = formatMeetingDate(next);
    const codeLines = CODE.map(c => `${c.line} ${c.sub}`).join(' | ');
    return {
      nextMeeting: `${dateStr} at ${meetingTime()} — ${venueName()}`,
      theCode: codeLines,
      identity: 'Sons of Thunder (Mark 3:17 Boanerges). Thunder doesn’t dull. Intense, loyal, built for more. Lead in marriage, kids, work, friends, neighbors.'
    };
  }

  async function thunderRespondGrok(q) {
    const ctx = buildGrokContext();
    let res;
    try {
      res = await fetch('/.netlify/functions/thunder-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, context: ctx })
      });
    } catch (netErr) {
      console.warn('Thunder AI network error', netErr);
      throw new Error('NETWORK');
    }
    const raw = await res.text().catch(() => '');
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (_) {}
    if (!res.ok) {
      console.warn('Thunder AI HTTP', res.status, raw);
      if (res.status === 500 && data && /XAI_API_KEY/i.test(JSON.stringify(data))) {
        throw new Error('NO_KEY');
      }
      if (res.status === 404) throw new Error('NO_FUNCTION');
      throw new Error('HTTP_' + res.status);
    }
    const answer = (data && data.answer) || '';
    // Plain text / markdown only — formatThunderHtml escapes + formats on render
    return {
      text: String(answer),
      source: (data && data.source) || 'Grok'
    };
  }

  async function handleThunderSend() {
    const input = $('#thunder-input');
    const sendBtn = $('#thunder-send');
    const q = input.value.trim();
    if (!q) return;
    addThunderMsg(q, 'user');
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    const local = thunderRespondLocal(q);
    if (local) {
      setTimeout(() => {
        addThunderMsg(local.text, 'assistant', local.source);
        if (sendBtn) sendBtn.disabled = false;
      }, 300);
      return;
    }

    addThunderMsg('…', 'assistant', null);
    const box = $('#thunder-messages');
    const pending = box ? box.lastElementChild : null;

    try {
      const res = await thunderRespondGrok(q);
      if (pending) pending.remove();
      addThunderMsg(res.text || 'No answer returned.', 'assistant', res.source);
    } catch (e) {
      if (pending) pending.remove();
      const code = (e && e.message) || '';
      let msg = `Can’t reach Thunder right now. Try again in a minute, or <strong>Text a Leader</strong> from Home.`;
      if (code === 'NO_KEY') {
        msg = `Thunder’s brain isn’t connected yet (API key). Leadership needs to set <strong>XAI_API_KEY</strong> on Netlify, then redeploy.`;
      } else if (code === 'NO_FUNCTION') {
        msg = `Thunder function not deployed. Redeploy the app with <strong>netlify/functions/thunder-ai.js</strong>.`;
      } else if (code === 'NETWORK') {
        msg = `No connection to Thunder. Check signal and try again.`;
      }
      addThunderMsg(msg, 'assistant', null);
      console.warn('Thunder AI error', e);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // ---------- EVENTS ----------
  function bindEvents() {
    $$('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => showView(btn.dataset.view));
    });
    setupTabSwipe();

    $('#rsvp-btn').addEventListener('click', () => {
      const btn = $('#rsvp-btn');
      const wasIn = !!rsvp;
      // Optimistic local confirm only — this is the source of truth for I'm In
      rsvp = !rsvp;
      try {
        save('rsvp', rsvp);
      } catch (err) {
        rsvp = wasIn;
        if (btn) {
          btn.classList.remove('confirmed');
          btn.textContent = "I'M IN";
        }
        return; // never show success if save failed
      }
      renderRsvp();
      if (btn && rsvp) {
        if (!prefersReducedMotion()) {
          btn.classList.remove('lock-pulse');
          void btn.offsetWidth;
          btn.classList.add('lock-pulse');
          setTimeout(() => btn.classList.remove('lock-pulse'), 360);
        }
        if (typeof tbGlowHit === 'function') tbGlowHit(btn, 'yellow');
        const meetCard = document.querySelector('.next-meeting');
        if (meetCard && typeof tbGlowHit === 'function') tbGlowHit(meetCard, 'yellow');
        if (typeof haptic === 'function') haptic(14);
      }
      if (rsvp && typeof requestNotifyPermission === 'function') {
        requestNotifyPermission().then((perm) => {
          if (perm === 'granted') checkAndFireMeetingNotifications();
        });
      }
    });

    $('#edit-profile-btn').addEventListener('click', () => {
      openProfileEditor();
    });
    $('#upload-media-btn').addEventListener('click', () => {
      if (supabaseEnabled() && !isSignedIn()) {
        openAuthGate('Sign in to add a memory the whole brotherhood can see.');
        return;
      }
      if (!supabaseEnabled()) {
        alert('Shared memories are not configured yet. Add Supabase URL and anon key.');
        return;
      }
      openModal('media-modal');
    });

    $$('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    bindBrotherDetail();
    bindMemoryViewer();

    // Profile photo
    $('#profile-photo').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        pendingPhotoData = ev.target.result;
        const preview = $('#photo-preview');
        preview.innerHTML = `<img src="${pendingPhotoData}">`;
        preview.classList.add('visible');
      };
      reader.readAsDataURL(file);
    });

    $('#save-profile').addEventListener('click', async () => {
      const name = $('#profile-name').value.trim();
      const bio = $('#profile-bio').value.trim();
      if (!name) return alert('Name required');
      const id = ensureBrotherId();
      const existing = brothers.findIndex(b => b.id === id);
      let entry = {
        id,
        name,
        bio,
        photo: pendingPhotoData || (existing >= 0 ? brothers[existing].photo : null),
        skills: '',
        available: true,
        updatedAt: Date.now()
      };
      const btn = $('#save-profile');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
      try {
        if (entry.photo && String(entry.photo).startsWith('data:image') && entry.photo.length > 180000) {
          entry.photo = await compressImageDataUrl(entry.photo, 900, 0.7);
        }
        if (supabaseEnabled()) {
          entry = await pushBrother(entry);
        }
        if (existing >= 0) brothers[existing] = entry;
        else brothers.unshift(entry);
        myProfileId = id;
        if (!save('brothers', brothers)) {
          // quota — try without photo
          const slim = { ...entry, photo: null };
          if (existing >= 0) brothers[existing] = slim;
          else brothers[0] = slim;
          if (!save('brothers', brothers)) {
            alert('This phone is out of storage for profiles. Photo skipped or not saved. Try a smaller image.');
          } else {
            alert('Photo was too large for this phone. Name and bio saved; add a smaller photo later.');
          }
        }
        save('myProfileId', myProfileId);
        // Don't show NEW on your own just-saved profile
        if (entry.updatedAt > (brothersSeenAt || 0)) {
          brothersSeenAt = entry.updatedAt;
          save('brothersSeenAt', brothersSeenAt);
        }
        renderBrothers();
        closeModal('profile-modal');
        pendingPhotoData = null;
      } catch (err) {
        console.error(err);
        alert('Could not save profile on this phone.\n' + (err.message || ''));
        if (existing >= 0) brothers[existing] = entry;
        else brothers.unshift(entry);
        save('brothers', brothers);
        save('myProfileId', id);
        if (entry.updatedAt > (brothersSeenAt || 0)) {
          brothersSeenAt = entry.updatedAt;
          save('brothersSeenAt', brothersSeenAt);
        }
        renderBrothers();
        closeModal('profile-modal');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
      }
    });

    // Media — shared Supabase when configured; requires signed-in session
    $('#save-media').addEventListener('click', () => {
      const file = $('#media-file').files[0];
      if (!file) return alert('Choose a file');

      if (supabaseEnabled() && !isSignedIn()) {
        closeModal('media-modal');
        openAuthGate('Sign in to add a memory the whole brotherhood can see.');
        return;
      }

      const maxBytes = 8 * 1024 * 1024; // 8 MB pre-compress
      if (file.size > maxBytes && file.type.startsWith('video')) {
        return alert('Video is too large (max ~8 MB). Try a short clip or a photo instead.');
      }
      if (file.size > 12 * 1024 * 1024) {
        return alert('File is too large. Choose a smaller photo.');
      }

      const isVideo = file.type.startsWith('video');
      const btn = $('#save-media');
      if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = ev.target.result;

        const finish = async (dataUrl) => {
          let payload = dataUrl;
          try {
            if (!isVideo && String(dataUrl).startsWith('data:image')) {
              payload = await compressImageDataUrl(dataUrl, 1200, 0.72);
            }
          } catch (ce) {
            if (btn) { btn.disabled = false; btn.textContent = 'Add to Memories'; }
            return alert('Could not process that photo. Try another.');
          }
          const item = {
            data: payload,
            blob: dataUrlToBlob(payload),
            filename: file.name,
            type: isVideo ? 'video' : 'image',
            caption: ($('#media-caption').value || '').trim(),
            date: new Date().toISOString(),
            uploader_name: myDisplayName() || ''
          };
          try {
            if (!supabaseEnabled()) {
              throw new Error('Shared memories are not configured on this app yet.');
            }
            const saved = await pushMemory(item);
            media.unshift(saved);
            renderMedia();
            renderLastFire();
            closeModal('media-modal');
            $('#media-file').value = '';
            $('#media-caption').value = '';
          } catch (err) {
            console.error(err);
            alert('Could not save memory. ' + (err.message || 'Try again.'));
          } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Add to Memories'; }
          }
        };

        if (!isVideo && raw.startsWith('data:image')) {
          const img = new Image();
          img.onload = () => {
            const maxW = 1200;
            let w = img.width, h = img.height;
            if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            finish(canvas.toDataURL('image/jpeg', 0.72));
          };
          img.onerror = () => finish(raw);
          img.src = raw;
        } else {
          finish(raw);
        }
      };
      reader.onerror = () => {
        if (btn) { btn.disabled = false; btn.textContent = 'Add to Memories'; }
        alert('Could not read that file.');
      };
      reader.readAsDataURL(file);
    });

    // Auth gate actions
    const authSignInBtn = $('#auth-signin-btn');
    const authSignUpBtn = $('#auth-signup-btn');
    const authForgotBtn = $('#auth-forgot-btn');
    const authCancelBtn = $('#auth-cancel-btn');
    const authSignOutBtn = $('#auth-signout-btn');

    if (authSignInBtn && authSignInBtn.dataset.bound !== '1') {
      authSignInBtn.dataset.bound = '1';
      authSignInBtn.addEventListener('click', async () => {
        const email = ($('#auth-email') && $('#auth-email').value || '').trim();
        const password = ($('#auth-password') && $('#auth-password').value || '');
        if (!email || !password) return setAuthError('Email and password required.');
        setAuthError('');
        authSignInBtn.disabled = true;
        try {
          await authSignIn(email, password);
          closeAuthGate();
          await pullMemories();
          renderMedia();
          renderLastFire();
        } catch (e) {
          setAuthError((e && e.message) || 'Sign in failed.');
        } finally {
          authSignInBtn.disabled = false;
        }
      });
    }
    if (authSignUpBtn && authSignUpBtn.dataset.bound !== '1') {
      authSignUpBtn.dataset.bound = '1';
      authSignUpBtn.addEventListener('click', async () => {
        const email = ($('#auth-email') && $('#auth-email').value || '').trim();
        const password = ($('#auth-password') && $('#auth-password').value || '');
        if (!email || !password) return setAuthError('Email and password required.');
        if (password.length < 6) return setAuthError('Password needs at least 6 characters.');
        setAuthError('');
        authSignUpBtn.disabled = true;
        try {
          const data = await authSignUp(email, password);
          if (data && data.session) {
            closeAuthGate();
            await pullMemories();
            renderMedia();
            renderLastFire();
          } else {
            setAuthError('Check your email to confirm, then sign in.');
          }
        } catch (e) {
          setAuthError((e && e.message) || 'Could not create account.');
        } finally {
          authSignUpBtn.disabled = false;
        }
      });
    }
    if (authForgotBtn && authForgotBtn.dataset.bound !== '1') {
      authForgotBtn.dataset.bound = '1';
      authForgotBtn.addEventListener('click', async () => {
        const email = ($('#auth-email') && $('#auth-email').value || '').trim();
        if (!email) return setAuthError('Enter your email first.');
        setAuthError('');
        try {
          await authResetPassword(email);
          setAuthError('Reset link sent — check your email.');
        } catch (e) {
          setAuthError((e && e.message) || 'Could not send reset.');
        }
      });
    }
    if (authCancelBtn && authCancelBtn.dataset.bound !== '1') {
      authCancelBtn.dataset.bound = '1';
      authCancelBtn.addEventListener('click', () => closeAuthGate());
    }
    if (authSignOutBtn && authSignOutBtn.dataset.bound !== '1') {
      authSignOutBtn.dataset.bound = '1';
      authSignOutBtn.addEventListener('click', async () => {
        try { await authSignOut(); } catch (e) { console.warn(e); }
      });
    }

    // Thunder FAB — yellow glow on every open
    $('#thunder-fab').addEventListener('click', () => {
      const fab = $('#thunder-fab');
      if (fab) {
        fab.classList.remove('fab-hit');
        void fab.offsetWidth;
        fab.classList.add('fab-hit');
        setTimeout(() => fab.classList.remove('fab-hit'), 420);
        if (typeof haptic === 'function') haptic(10);
      }
      openModal('thunder-modal');
    });
    $('#thunder-send').addEventListener('click', handleThunderSend);
    const installShareBtn = $('#install-share-btn');
    const installBtn = $('#install-help-btn');
    const installCard = $('#install-help-card');
    let deferredInstallPrompt = null;

    function showInstallToast(msg) {
      const t = $('#install-toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.remove('hidden');
      clearTimeout(showInstallToast._timer);
      showInstallToast._timer = setTimeout(() => t.classList.add('hidden'), 4200);
    }

    function refreshInstallCta() {
      if (!installCard) return;
      // Always show — brothers need the HOW path even after they install
      installCard.classList.remove('hidden');
      const title = $('#install-card-title');
      const sub = $('#install-card-sub');
      const tip = $('#install-share-tip');
      if (isStandalonePwa()) {
        // Already on home screen — reframe as share tool for other brothers
        if (installShareBtn) installShareBtn.textContent = 'SHARE';
        if (title) title.textContent = 'GET A BROTHER ON HOME SCREEN';
        if (sub) sub.textContent = 'Share the link · HOW shows the steps';
        if (tip) tip.textContent = 'iPhone: Safari → Share → Add to Home Screen · Android: Chrome → Install';
      } else if (isInAppBrowser()) {
        if (installShareBtn) installShareBtn.textContent = 'OPEN IN SAFARI';
        if (title) title.textContent = 'PUT THUNDER BOARD ON YOUR HOME SCREEN';
        if (sub) sub.textContent = 'Leave this in-app browser first';
        if (tip) tip.textContent = 'Then Safari → Share → Add to Home Screen';
      } else if (deferredInstallPrompt) {
        if (installShareBtn) installShareBtn.textContent = 'INSTALL';
        if (title) title.textContent = 'PUT THUNDER BOARD ON YOUR HOME SCREEN';
        if (sub) sub.textContent = 'Android · one confirm';
        if (tip) tip.textContent = 'Safari: Share → Add to Home Screen · Chrome: Install app';
      } else if (isIos()) {
        if (installShareBtn) installShareBtn.textContent = 'ADD TO HOME';
        if (title) title.textContent = 'PUT THUNDER BOARD ON YOUR HOME SCREEN';
        if (sub) sub.textContent = 'Safari · Share → Add to Home Screen';
        if (tip) tip.textContent = 'iPhone: Safari → Share → Add · Android: Chrome → Install';
      } else {
        if (installShareBtn) installShareBtn.textContent = 'INSTALL';
        if (title) title.textContent = 'PUT THUNDER BOARD ON YOUR HOME SCREEN';
        if (sub) sub.textContent = 'Safari or Chrome · Add to Home Screen';
        if (tip) tip.textContent = 'iPhone: Safari → Share → Add · Android: Chrome → Menu → Install';
      }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      refreshInstallCta();
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      refreshInstallCta();
      showInstallToast('Thunder Board is on your home screen');
    });

    async function runSmartInstall() {
      // Trapped in Instagram / Messenger / etc.
      if (isInAppBrowser()) {
        openInAppInstallOverlay();
        return;
      }
      // Android Chrome native install when available
      if (deferredInstallPrompt) {
        try {
          deferredInstallPrompt.prompt();
          const choice = await deferredInstallPrompt.userChoice;
          deferredInstallPrompt = null;
          if (choice && choice.outcome === 'accepted') {
            refreshInstallCta();
            showInstallToast('Installed. Open from your home screen.');
          } else {
            refreshInstallCta();
          }
        } catch (err) {
          console.warn('Install prompt failed', err);
          deferredInstallPrompt = null;
          refreshInstallCta();
        }
        return;
      }
      // iPhone Safari: clear 3-step overlay (Share still available inside)
      if (isIos()) {
        openIosInstallOverlay();
        return;
      }
      // Desktop / other: Share or copy
      const url = window.location.origin + '/';
      const payload = {
        title: 'Thunder Board',
        text: 'Sons of Thunder — Thunder doesn’t dull.',
        url
      };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          showInstallToast('Shared. Or use browser menu → Install app');
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
          console.warn('Share failed', err);
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showInstallToast('Link copied. Browser menu → Install / Add to Home Screen');
      } catch (e) {
        showInstallToast('Use browser menu → Install / Add to Home Screen');
      }
    }

    async function shareFromIosOverlay() {
      const url = window.location.origin + '/';
      const payload = {
        title: 'Thunder Board',
        text: 'Sons of Thunder — Thunder doesn’t dull.',
        url
      };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          showInstallToast('In Share, tap Add to Home Screen');
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showInstallToast('Link copied — then Share → Add to Home Screen');
      } catch (e) {
        showInstallToast('Tap Share in Safari → Add to Home Screen');
      }
    }

    refreshInstallCta();

    if (installShareBtn) {
      installShareBtn.addEventListener('click', () => { runSmartInstall(); });
    }
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        openModal('install-modal');
      });
    }
    const liveLink = $('#install-live-link');
    if (liveLink) {
      liveLink.addEventListener('click', () => {
        const url = 'https://sonsofthunder.netlify.app/';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(() => {});
          }
        } catch (err) {}
      });
    }
    const installModal = $('#install-modal');
    if (installModal) {
      installModal.querySelectorAll('[data-close="install-modal"]').forEach(btn => {
        btn.addEventListener('click', () => closeModal('install-modal'));
      });
    }

    // iOS overlay controls
    const iosClose = $('#ios-install-close');
    const iosGotit = $('#ios-install-gotit');
    const iosShare = $('#ios-install-share-btn');
    if (iosClose) iosClose.addEventListener('click', closeIosInstallOverlay);
    if (iosGotit) iosGotit.addEventListener('click', closeIosInstallOverlay);
    if (iosShare) iosShare.addEventListener('click', () => { shareFromIosOverlay(); });

    // In-app browser gate
    const inappClose = $('#inapp-install-close');
    const inappGotit = $('#inapp-install-gotit');
    const inappCopy = $('#inapp-copy-link');
    if (inappClose) inappClose.addEventListener('click', closeInAppInstallOverlay);
    if (inappGotit) inappGotit.addEventListener('click', closeInAppInstallOverlay);
    if (inappCopy) {
      inappCopy.addEventListener('click', async () => {
        const url = 'https://sonsofthunder.netlify.app/';
        try {
          await navigator.clipboard.writeText(url);
          showInstallToast('Link copied — paste in Safari');
        } catch (e) {
          showInstallToast(url);
        }
      });
    }

    // REFRESH APP — force fresh HTML/JS/CSS (More page, under Gathering Alerts)
    const refreshBtn = $('#refresh-app-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        showInstallToast('Updating… hang tight');
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
        } catch (e) {
          console.warn('SW unregister', e);
        }
        try {
          if (window.caches && caches.keys) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (e) {
          console.warn('cache clear', e);
        }
        setTimeout(() => {
          try {
            const u = new URL(window.location.href);
            u.searchParams.set('_tb', String(Date.now()));
            window.location.replace(u.toString());
          } catch (e) {
            window.location.reload(true);
          }
        }, 280);
      });
    }

$('#thunder-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleThunderSend();
    });

    // Leadership unlock
    const unlockBtn = $('#leader-unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        if (requireLeader()) {
          const tools = $('#leader-tools');
          if (tools) tools.classList.remove('hidden');
        }
      });
    }
    const lockBtn = $('#leader-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        leaderUnlocked = false;
        const tools = $('#leader-tools');
        if (tools) tools.classList.add('hidden');
      });
    }

    // Admin announcements
    const adminBtn = $('#admin-announcements-btn');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        renderAdminAnnouncements();
        openModal('admin-ann-modal');
      });
    }

    const lastFireBtn = $('#admin-lastfire-btn');
    if (lastFireBtn) {
      lastFireBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        const current = (lastFire && lastFire.caption) || '';
        const cap = window.prompt('LAST FIRE — one line worth remembering (empty clears):', current);
        if (cap === null) return;
        const trimmed = String(cap).trim();
        if (!trimmed) {
          lastFire = null;
          save('lastFire', null);
          renderLastFire();
          updateAllNewBadges();
          alert('Last Fire cleared.');
          return;
        }
        const wantPhoto = window.confirm('Add or replace a photo for Last Fire?\n\nOK = choose photo\nCancel = text only');
        if (wantPhoto) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async () => {
            const file = input.files && input.files[0];
            let photo = (lastFire && lastFire.photo) || '';
            if (file) {
              try {
                const reader = new FileReader();
                const dataUrl = await new Promise((resolve, reject) => {
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
                photo = await compressImageDataUrl(dataUrl, 900, 0.72);
              } catch (e) {
                console.warn('last fire photo', e);
              }
            }
            lastFire = { caption: trimmed, photo: photo || '', updatedAt: Date.now() };
            save('lastFire', lastFire);
            renderLastFire();
            updateAllNewBadges();
            alert('Last Fire saved on this phone.');
          };
          input.click();
        } else {
          lastFire = {
            caption: trimmed,
            photo: (lastFire && lastFire.photo) || '',
            updatedAt: Date.now()
          };
          save('lastFire', lastFire);
          renderLastFire();
          updateAllNewBadges();
          alert('Last Fire saved on this phone.');
        }
      });
    }

    const eventsBtn = $('#admin-events-btn');
    if (eventsBtn) {
      eventsBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        if ($('#admin-gathering-body')) $('#admin-gathering-body').value = gatheringBody || DEFAULT_GATHERING_BODY;
        if ($('#admin-mission-title')) $('#admin-mission-title').value = mission.title || '';
        if ($('#admin-mission-detail')) $('#admin-mission-detail').value = mission.detail || '';
        if ($('#admin-events-note')) $('#admin-events-note').value = eventsNote || '';
        openModal('admin-events-modal');
      });
    }
    const eventsSave = $('#admin-events-save');
    if (eventsSave) {
      eventsSave.addEventListener('click', async () => {
        mission = {
          title: ($('#admin-mission-title').value || '').trim() || DEFAULT_MISSION.title,
          detail: ($('#admin-mission-detail').value || '').trim() || DEFAULT_MISSION.detail
        };
        eventsNote = ($('#admin-events-note').value || '').trim();
        gatheringBody = ($('#admin-gathering-body').value || '').trim() || DEFAULT_GATHERING_BODY;
        eventsUpdatedAt = Date.now();
        save('mission', mission);
        save('eventsNote', eventsNote);
        save('gatheringBody', gatheringBody);
        save('eventsUpdatedAt', eventsUpdatedAt);
        renderMission();
        renderEventsNote();
        renderUpcoming();
        updateAllNewBadges();

        // Shared publish (all brothers) when Supabase + signed in
        if (supabaseEnabled()) {
          if (!isSignedIn()) {
            alert('Saved on this phone only.\n\nSign in (Events → memories account) then Save again to publish for every brother.');
            return;
          }
          eventsSave.disabled = true;
          try {
            const res = await pushEventsBoard();
            if (res && res.ok) {
              alert('Saved for all brothers.');
            } else {
              alert('Saved on this phone. Could not publish shared copy' + (res && res.reason ? ' (' + res.reason + ')' : '') + '. Check Supabase events_board table / sign-in.');
            }
          } catch (e) {
            console.warn(e);
            alert('Saved on this phone. Shared publish failed.');
          } finally {
            eventsSave.disabled = false;
          }
        } else {
          alert('Saved on this phone only (Supabase not configured).');
        }
      });
    }

    const codeBtn = $('#admin-code-btn');
    if (codeBtn) {
      codeBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        const raw = CODE.map(c => c.line + ' | ' + c.sub).join('\n');
        if ($('#admin-code-raw')) $('#admin-code-raw').value = raw;
        openModal('admin-code-modal');
      });
    }
    const codeSave = $('#admin-code-save');
    if (codeSave) {
      codeSave.addEventListener('click', () => {
        const raw = ($('#admin-code-raw').value || '').trim();
        if (!raw) return alert('Code cannot be empty');
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
        CODE = lines.map(l => {
          const parts = l.split('|');
          return {
            line: (parts[0] || '').trim(),
            sub: (parts[1] || '').trim()
          };
        }).filter(c => c.line);
        if (!CODE.length) return alert('No valid lines');
        save('code', CODE);
        renderCode();
        alert('Code saved');
      });
    }

    const annAdd = $('#admin-ann-add');
    if (annAdd) {
      annAdd.addEventListener('click', () => {
        const title = ($('#admin-ann-title') || {}).value?.trim() || '';
        const body = ($('#admin-ann-body') || {}).value?.trim() || '';
        if (!title || !body) return alert('Title and message required');
        announcements.unshift({
          id: 'ann-' + Date.now(),
          title,
          body,
          createdAt: Date.now()
        });
        save('announcements', announcements);
        renderAnnouncements();
        renderAdminAnnouncements();
        if ($('#admin-ann-title')) $('#admin-ann-title').value = '';
        if ($('#admin-ann-body')) $('#admin-ann-body').value = '';
        // Gathering alerts — one short push, no private body text
        if (typeof broadcastAnnouncementPush === 'function') {
          broadcastAnnouncementPush(title);
        }
      });
    }

    const annList = $('#admin-ann-list');
    if (annList) {
      annList.addEventListener('click', (e) => {
        const btn = e.target.closest('.admin-ann-delete');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (isNaN(idx)) return;
        announcements.splice(idx, 1);
        save('announcements', announcements);
        renderAnnouncements();
        renderAdminAnnouncements();
      });
    }


    // Text the Leader — number never rendered in DOM
    const tlb = $('#text-leader-btn');
    if (tlb) tlb.addEventListener('click', () => { tbGlowHit(tlb); openLeaderSms(); });
    const tlb2 = $('#text-leader-btn-brothers');
    if (tlb2) tlb2.addEventListener('click', () => { tbGlowHit(tlb2); openLeaderSms(); });

    const uploadMediaBtn = $('#upload-media-btn');
    if (uploadMediaBtn) {
      uploadMediaBtn.addEventListener('click', () => tbGlowHit(uploadMediaBtn, 'yellow'));
    }
    const editProfileBtnGlow = $('#edit-profile-btn');
    if (editProfileBtnGlow) {
      // glow only — existing open handler remains
      editProfileBtnGlow.addEventListener('click', () => tbGlowHit(editProfileBtnGlow, 'yellow'));
    }
    const installShareBtnGlow = $('#install-share-btn');
    if (installShareBtnGlow) {
      installShareBtnGlow.addEventListener('click', () => tbGlowHit(installShareBtnGlow));
    }
    const installHelpBtnGlow = $('#install-help-btn');
    if (installHelpBtnGlow) {
      installHelpBtnGlow.addEventListener('click', () => tbGlowHit(installHelpBtnGlow));
    }

    // Backdrop click closes any modal
    $$('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
      });
    });
  }


  // ---------- SHARPENING IRON (Man in the Mirror RSS) ----------
  async function loadIronFeed() {
    const el = $('#iron-feed');
    if (!el) return;
    const feedUrl = 'https://maninthemirror.org/feed/';
    const proxy = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    try {
      const res = await fetch(proxy);
      if (!res.ok) throw new Error('feed ' + res.status);
      const data = await res.json();
      const items = (data.items || []).slice(0, 2);
      if (!items.length) {
        el.innerHTML = '<div class="empty-state">No posts right now.</div>';
        return;
      }
      el.innerHTML = items.map(item => {
        const title = esc(item.title || 'Untitled');
        const link = esc(item.link || '#');
        let date = '';
        try {
          date = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {}
        let excerpt = (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (excerpt.length > 140) excerpt = excerpt.slice(0, 137) + '…';
        excerpt = esc(excerpt);
        return `<a class="iron-card" href="${link}" target="_blank" rel="noopener noreferrer">
          <div class="iron-date">${esc(date)}</div>
          <div class="iron-title">${title}</div>
          <div class="iron-excerpt">${excerpt}</div>
        </a>`;
      }).join('');
    } catch (e) {
      console.warn(e);
      el.innerHTML = '<div class="empty-state">Couldn’t load feed. Check back later.</div>';
    }
  }


  // Leadership contact — assembled only on tap, never rendered as text
  function openLeaderSms() {
    const parts = (cfg().LEADER_SMS_PARTS || []);
    const digits = parts.join('').replace(/\D/g, '');
    if (!digits) return;
    window.location.href = 'sms:' + digits;
  }


  // ---------- OPENING SPLASH (once per session) ----------
  function runSplash() {
    const el = document.getElementById('splash');
    if (!el) {
      runWelcome();
      return;
    }
    try {
      if (sessionStorage.getItem('tb_splash_done') === '1') {
        el.classList.add('splash-done');
        runWelcome();
        return;
      }
    } catch (e) {
      runWelcome();
      return;
    }

    const finish = () => {
      el.classList.add('splash-out');
      const hide = () => {
        el.classList.add('splash-done');
        try { sessionStorage.setItem('tb_splash_done', '1'); } catch (e) {}
        runWelcome();
      };
      el.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 600); // fail-open if transitionend misses
    };

    // Hold ~2.6s then zoom into viewer + fade (total ~3.2s)
    setTimeout(finish, 2600);

    // Fail-open if mark never loads
    const img = el.querySelector('.splash-mark');
    if (img) {
      img.onerror = () => { img.style.display = 'none'; };
    }
  }

  // ---------- FIRST-LOAD WELCOME (once per session, after splash) ----------
  function runWelcome() {
    const el = document.getElementById('welcome');
    if (!el) return;
    try {
      if (sessionStorage.getItem('tb_welcome_done') === '1') {
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
        return;
      }
    } catch (e) {}

    let dismissed = false;
    let timer = null;

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      if (timer) clearTimeout(timer);
      el.classList.add('welcome-out');
      el.classList.remove('welcome-on');
      const hide = () => {
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
        try { sessionStorage.setItem('tb_welcome_done', '1'); } catch (e) {}
      };
      el.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 400); // fail-open
    };

    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
    // Next frame so transition runs
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('welcome-on');
      });
    });

    timer = setTimeout(dismiss, 7000);

    const card = document.getElementById('welcome-card');
    const gotit = document.getElementById('welcome-gotit');
    if (card) card.addEventListener('click', dismiss, { once: true });
    if (gotit) {
      gotit.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      }, { once: true });
    }
    // Backdrop tap also dismisses
    el.addEventListener('click', (e) => {
      if (e.target === el) dismiss();
    }, { once: true });
  }

  // ---------- WEB PUSH (Gathering alerts) ----------
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function isStandalonePwa() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /** Instagram / Facebook / Messenger / TikTok / LinkedIn in-app browsers */
  function isInAppBrowser() {
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line\/|LinkedInApp|Twitter|TikTok|Snapchat|MicroMessenger|Pinterest/i.test(ua)
      || (isIos() && !/Safari/i.test(ua) && /AppleWebKit/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua));
  }

  function openIosInstallOverlay() {
    const el = document.getElementById('ios-install-overlay');
    if (!el) return;
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
  function closeIosInstallOverlay() {
    const el = document.getElementById('ios-install-overlay');
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }
  function openInAppInstallOverlay() {
    const el = document.getElementById('inapp-install-overlay');
    if (!el) return;
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
  function closeInAppInstallOverlay() {
    const el = document.getElementById('inapp-install-overlay');
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }

  async function ensureServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (e) {
      console.warn('SW register failed', e);
      return null;
    }
  }

  function setAlertsHint(msg) {
    const el = $('#gathering-alerts-hint');
    if (el) el.textContent = msg || '';
  }

  async function refreshAlertsToggleUI() {
    const toggle = $('#gathering-alerts-toggle');
    if (!toggle) return;
    let subscribed = false;
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          subscribed = !!sub;
        }
      }
    } catch (e) {}
    toggle.checked = subscribed || load('gatheringAlertsOn') === true;
    if (subscribed) save('gatheringAlertsOn', true);
  }

  async function enableGatheringAlerts() {
    const vapid = (cfg().VAPID_PUBLIC_KEY || '').trim();
    if (!vapid) {
      setAlertsHint('Alerts not configured yet (VAPID public key missing).');
      return false;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setAlertsHint('Push not supported in this browser.');
      return false;
    }
    if (isIos() && !isStandalonePwa()) {
      setAlertsHint('iPhone: Add to Home Screen first, then open from the icon and turn alerts on.');
      return false;
    }

    const perm = await requestNotifyPermission();
    if (perm !== 'granted') {
      setAlertsHint(perm === 'denied' ? 'Notifications blocked in system settings.' : 'Permission needed for alerts.');
      return false;
    }

    const reg = await ensureServiceWorker();
    if (!reg) {
      setAlertsHint('Could not start background worker.');
      return false;
    }

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid)
      });
    }

    const res = await fetch('/.netlify/functions/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('push-subscribe failed', res.status, err);
      setAlertsHint(err.error || 'Could not save subscription. Try again after deploy.');
      return false;
    }

    save('gatheringAlertsOn', true);
    setAlertsHint('On. You’ll get a ping when leadership posts an announcement.');
    return true;
  }

  async function disableGatheringAlerts() {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            const endpoint = sub.endpoint;
            try {
              await fetch('/.netlify/functions/push-unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint })
              });
            } catch (e) {}
            await sub.unsubscribe().catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('disable alerts', e);
    }
    save('gatheringAlertsOn', false);
    setAlertsHint('Alerts off.');
    return true;
  }

  async function broadcastAnnouncementPush(title) {
    const pin = cfg().LEADER_PIN || 'sot-lead';
    try {
      const res = await fetch('/.netlify/functions/push-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          title: (title || 'New announcement').slice(0, 80),
          body: 'Open Thunder Board'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('push-broadcast', res.status, err);
      }
    } catch (e) {
      console.warn('push-broadcast network', e);
    }
  }

  function setupGatheringAlerts() {
    ensureServiceWorker();
    refreshAlertsToggleUI();
    const toggle = $('#gathering-alerts-toggle');
    if (!toggle || toggle.dataset.bound === '1') return;
    toggle.dataset.bound = '1';
    toggle.addEventListener('change', async () => {
      toggle.disabled = true;
      try {
        if (toggle.checked) {
          const ok = await enableGatheringAlerts();
          if (!ok) toggle.checked = false;
        } else {
          await disableGatheringAlerts();
        }
      } finally {
        toggle.disabled = false;
        refreshAlertsToggleUI();
      }
    });
  }

  // ---------- INIT ----------
  async function init() {
    runSplash();
    bootstrapSeenState();
    updateMeetingCard();
    setupReminderButton();
    setupNotificationSystem();
    setupGatheringAlerts();
    renderAnnouncements();
    renderBrothers();
    renderUpcoming();
    renderMedia();
    renderCode();
    renderMission();
    renderHomeMission();
    renderEventsNote();
    renderLastFire();
    bindInfoCardTargets();
    renderRsvp();
    bindEvents();
    updateAllNewBadges();
    showView('home');
    loadIronFeed();
    try {
      await initAuth();
      // Shared gathering notice + mission (no sign-in required to read)
      try {
        await pullEventsBoard();
        renderMission();
        renderEventsNote();
        updateAllNewBadges();
      } catch (e2) {
        console.warn('events board init', e2);
      }
      if (isSignedIn()) {
        await pullMemories();
        renderMedia();
        renderLastFire();
      }
    } catch (e) {
      console.warn('Auth / memories init', e);
    }
  }

  init();
})();
