/* ===== THUNDER BOARD ===== */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  function publicOrigin() {
    try {
      if (window.TB_CONFIG && window.TB_CONFIG.PUBLIC_ORIGIN) return String(window.TB_CONFIG.PUBLIC_ORIGIN).replace(/\/$/, '');
    } catch (e) {}
    try {
      if (location && location.origin && /^https?:/.test(location.origin)) return location.origin;
    } catch (e2) {}
    return 'https://sonsofthunderboard.com';
  }
  function publicUrl(path) {
    return publicOrigin() + (path || '/');
  }

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

  // Soft, non-blocking feedback (replaces some abrupt alerts)
  function tbToast(msg, ms, onTap) {
    let t = document.getElementById('install-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'install-toast';
      t.className = 'install-toast hidden';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg || '';
    t.classList.remove('hidden');
    t.onclick = typeof onTap === 'function' ? function () { onTap(); } : null;
    t.style.cursor = typeof onTap === 'function' ? 'pointer' : '';
    clearTimeout(tbToast._timer);
    tbToast._timer = setTimeout(() => t.classList.add('hidden'), ms || 3200);
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
  /* Locked founder seat — Obie's profile. Never wipe this seed on an empty roster.
     If Supabase/local already has an Obie row, we do not duplicate it. */
  const FOUNDER_OBIE = {
    id: 'founder-obie',
    name: 'OBIE',
    bio: 'Jesus follower, Radio ninja & Family circus ringmaster. Life isn’t occasion, and we MUST rise to it.',
    photo: '',
    phone: '',
    birthday: '',
    skills: '',
    available: true,
    updatedAt: 0
  };
  const DEFAULT_BROTHERS = [FOUNDER_OBIE];
  function hasObieSeat(list) {
    return (list || []).some(function (b) {
      return b && /^obie$/i.test(String(b.name || '').trim());
    });
  }
  function ensureFounderSeat() {
    if (!Array.isArray(brothers)) brothers = [];
    if (hasObieSeat(brothers)) return;
    brothers = [Object.assign({}, FOUNDER_OBIE)].concat(brothers);
    try { save('brothers', brothers); } catch (e) {}
  }
  function brotherScore(b) {
    if (!b) return -1;
    let s = 0;
    if (b.photo) s += 10;
    if (String(b.bio || '').trim()) s += 5;
    if (String(b.phone || '').trim()) s += 2;
    if (b.birthday) s += 1;
    if (b.updatedAt) s += 1;
    return s;
  }
  function collapseDuplicateBrothers() {
    if (!Array.isArray(brothers)) return;
    const out = [];
    const idxByName = {};
    brothers.forEach(function (b) {
      if (!b) return;
      const key = String(b.name || '').trim().toLowerCase();
      if (!key) { out.push(b); return; }
      if (idxByName[key] == null) {
        idxByName[key] = out.length;
        out.push(b);
        return;
      }
      const i = idxByName[key];
      if (brotherScore(b) > brotherScore(out[i])) out[i] = b;
    });
    brothers = out;
  }
function isTodayBirthday(bday) {
  if (!bday || typeof bday !== 'string') return false;
  const cleaned = bday.trim().replace(/[^0-9-]/g, '');
  if (!/^\d{2}-\d{2}$/.test(cleaned)) return false;
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return cleaned === (mm + '-' + dd);
}

function normalizeBirthday(val) {
  if (!val) return null;
  const cleaned = String(val).trim().replace(/[^0-9-]/g, '');
  if (/^\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  const parts = cleaned.split(/[-/]/);
  if (parts.length === 2) {
    const m = parts[0].padStart(2, '0');
    const d = parts[1].padStart(2, '0');
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return m + '-' + d;
  }
  return null;
}

const BIRTHDAY_THUNDER_LINE = "We're ALL celebrating you being born, my friend!";
const BIRTHDAY_SMS_PREFILL = "Grateful you’re in the room, bro";





  
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

  // Seed matches locked live content (also seeded in supabase-schema.sql)
  const DEFAULT_ANNOUNCEMENTS = [
    {
      id: 'ann-welcome',
      title: 'Welcome to the Thunderboard, Gentlemen!',
      body: "This is our private room. Next Gathering, I'm In, announcements, the Brothers directory, Events & Memories, and The Code. Everything you need, nothing you don't.",
      createdAt: 1
    },
    {
      id: 'ann-next-meeting',
      title: 'Next Meeting',
      body: 'Next Gathering is Monday, September 14. Labor Day falls on the first Monday, so we move to the second Monday of the month — same rule every time a holiday hits the first.',
      createdAt: 2
    },
    {
      id: 'ann-ai-night',
      title: 'Is AI going to kill us?! Maybe but not today',
      body: 'AI Night\nAt the next Gathering, Joel (our cyber security specialist) is breaking down AI — the good, the bad, and the ugly — and how we actually survive and use it without getting owned by it.',
      createdAt: 3
    }
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
    title: "PARTY'S ON THE PATIO / DOWNTOWN WINTER GARDEN",
    detail: "Gun Range, lake adventures, digging into the Word, or a Gym Giant — you'll find your tribe here!"
  };
  const DEFAULT_EVENTS_NOTE =
    "P.S. Got an interesting hobby that you think the fellas will like? Have a crazy story about your life that the guys could benefit from? This is your push to let us in on it and help grow the guys of the group!";
  let mission = load('mission') || DEFAULT_MISSION;
  let eventsNote = load('eventsNote') || DEFAULT_EVENTS_NOTE;
  const DEFAULT_GATHERING_BODY =
    'First Monday of the month (or second Monday if Labor Day / Memorial Day). Show up. Bring a brother who needs it.';
  let gatheringBody = load('gatheringBody') || DEFAULT_GATHERING_BODY;
  // Last Fire — one caption + optional photo; leadership updates when worth remembering
  let lastFire = load('lastFire') || null;
  let leaderUnlocked = false;
  let chairUnlocked = false;

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

  let brothers = load('brothers') || DEFAULT_BROTHERS.slice();
  try { if (!hasObieSeat(brothers)) ensureFounderSeat(); } catch (e) {}
  try {
    collapseDuplicateBrothers();
    save('brothers', brothers);
  } catch (e) {}
  // Shared memories live in Supabase when configured — not localStorage primary
  let media = [];
  let rsvp = load('rsvp') || false;
  let sharedRsvps = [];
  let prevRsvpIds = null;
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

  function icsEscape(text) {
    return String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /** Canonical next gathering ICS — same meeting engine as Home / Thunder AI.
   * VALARMs: 7 days, 1 day, 2 hours before (OS calendar must Save for alarms to exist).
   * PWA cannot prove calendar was saved — never claim CALENDAR SAVED. */
  function buildGatheringIcs(meetingDate) {
    const start = new Date(meetingDate);
    const mt = parseMeetingHours();
    start.setHours(mt.h, mt.m, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    function pad(n) { return String(n).padStart(2, '0'); }
    function localStamp(d) {
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' +
        pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    }
    const uid = 'thunder-gathering-' + start.getFullYear() + pad(start.getMonth() + 1) + pad(start.getDate()) + '@sonsofthunderboard.com';
    const title = 'Sons of Thunder — Next Gathering';
    const loc = venueName();
    const desc = [
      'Sons of Thunder monthly gathering. Show up.',
      'Check Thunder Board for the latest gathering details.',
      publicUrl('/')
    ].join('\\n');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sons of Thunder//Thunder Board//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + localStamp(new Date()) + 'Z',
      'DTSTART:' + localStamp(start),
      'DTEND:' + localStamp(end),
      'SUMMARY:' + icsEscape(title),
      'DESCRIPTION:' + icsEscape(desc),
      'LOCATION:' + icsEscape(loc),
      'URL:' + publicUrl('/'),
      // 7 days before
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:One week out. Sons of Thunder gathers next Monday.',
      'END:VALARM',
      // 1 day before
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Tomorrow — Sons of Thunder. Your seat is waiting.',
      'END:VALARM',
      // 2 hours before
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Two hours. See you at the gathering.',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  }

  let __calBlobUrl = null;

  function setCalAlarmsLine(msg) {
    const el = document.getElementById('tb-cal-alarms');
    if (el && msg) el.textContent = msg;
  }

  function lockInAppReminder() {
    try { save('reminderSet', true); } catch (e) {}
    try { save('reminderMeeting', meetingKey()); } catch (e) {}
    armGatheringPings();
    return true;
  }

  async function armGatheringPings() {
    try { save('reminderSet', true); } catch (e) {}
    try { save('reminderMeeting', meetingKey()); } catch (e) {}
    let perm = 'default';
    try { perm = await requestNotifyPermission(); } catch (e) {}
    if (perm !== 'granted') {
      setCalAlarmsLine('Allow alerts — that’s how the 7-day ping lands.');
      return false;
    }
    try { checkAndFireMeetingNotifications(); } catch (e) {}
    if (typeof isIos === 'function' && isIos() && typeof isStandalonePwa === 'function' && !isStandalonePwa()) {
      setCalAlarmsLine('Put the Board on your Home Screen so the 7-day ping can reach you.');
    }
    if (typeof enableGatheringAlerts === 'function') {
      try {
        const ok = await enableGatheringAlerts();
        try { if (typeof refreshAlertsToggleUI === 'function') refreshAlertsToggleUI(); } catch (e) {}
        if (ok) {
          setCalAlarmsLine('Locked. We’ll ping this phone: 7 days · 1 day · 2 hours.');
          return true;
        }
      } catch (e) {}
    }
    setCalAlarmsLine('Reminder on this phone. Gathering Alerts = ping even if the app is closed.');
    return false;
  }

  function paintInAppCalendar() {
    const next = getNextMeetingMonday();
    const monthEl = document.getElementById('tb-cal-month');
    const grid = document.getElementById('tb-cal-grid');
    const whenEl = document.getElementById('tb-cal-when');
    const locEl = document.getElementById('tb-cal-loc');
    if (!grid) return;
    const y = next.getFullYear();
    const m = next.getMonth();
    if (monthEl) {
      monthEl.textContent = next.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    }
    const startDow = new Date(y, m, 1).getDay();
    const daysIn = new Date(y, m + 1, 0).getDate();
    const meetD = next.getDate();
    let html = '';
    for (let i = 0; i < startDow; i++) html += '<span class="tb-cal-cell is-empty"></span>';
    for (let d = 1; d <= daysIn; d++) {
      html += '<span class="tb-cal-cell' + (d === meetD ? ' is-gathering' : '') + '">' + d + '</span>';
    }
    grid.innerHTML = html;
    if (whenEl) {
      whenEl.textContent = next.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric'
      }) + ' · ' + meetingTime();
    }
    if (locEl) locEl.textContent = venueName();
    try { paintCalA2hs(); } catch (e) {}
  }

  function offerCalendarNow() {
    lockInAppReminder();
    try { renderRsvp(); } catch (e) {}
    return true;
  }
  function addToNativeCalendar() {
    const host = location.host || 'sonsofthunderboard.com';
    const icsPath = '/.netlify/functions/gathering-ics';
    const httpsUrl = location.origin + icsPath;
    try {
      if (typeof isIos === 'function' && isIos()) {
        location.href = 'webcal://' + host + icsPath;
        return true;
      }
    } catch (e) {}
    try {
      const next = getNextMeetingMonday();
      const mt = parseMeetingHours();
      const start = new Date(next);
      start.setHours(mt.h, mt.m, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const title = encodeURIComponent('Sons of Thunder — Next Gathering');
      const loc = encodeURIComponent(venueName());
      location.href = 'intent://vnd.android.cursor.dir/event#Intent;action=android.intent.action.INSERT;S.title=' +
        title + ';S.eventLocation=' + loc + ';l.beginTime=' + start.getTime() +
        ';l.endTime=' + end.getTime() + ';end';
      return true;
    } catch (e) {}
    try { location.href = httpsUrl; } catch (e2) {}
    return true;
  }

  function openCalConfirmSheet() {
    if (roomCut()) return;
    try { document.body.classList.add('cal-sheet-open'); } catch (e) {}
    const el = document.getElementById('cal-confirm-sheet');
    if (!el) return;
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
  function closeCalConfirmSheet() {
    try { document.body.classList.remove('cal-sheet-open'); } catch (e) {}
    const el = document.getElementById('cal-confirm-sheet');
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }



  // ---------- SUPABASE AUTH + SHARED MEMORIES ----------
  function supabaseEnabled() {
    const c = cfg();
    return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient);
  }

  function memoriesBucket() {
    return (cfg().MEMORIES_BUCKET || 'Sons Of Thunder Memories').trim();
  }

  const TB_AUTH_DB = 'tb-sot-auth';
  const TB_AUTH_STORE = 'kv';
  let __tbAuthRestoreDone = false;

  function isTbAuthKey(key) {
    const k = String(key || '');
    return k.indexOf('sb-') === 0 || /supabase/i.test(k);
  }

  function tbIdbReq() {
    return new Promise(function (resolve) {
      try {
        if (!window.indexedDB) { resolve(null); return; }
        const req = indexedDB.open(TB_AUTH_DB, 1);
        req.onupgradeneeded = function () {
          try {
            if (!req.result.objectStoreNames.contains(TB_AUTH_STORE)) {
              req.result.createObjectStore(TB_AUTH_STORE);
            }
          } catch (e) {}
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  function tbIdbGet(key) {
    return tbIdbReq().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(TB_AUTH_STORE, 'readonly');
          const r = tx.objectStore(TB_AUTH_STORE).get(key);
          r.onsuccess = function () { resolve(r.result == null ? null : r.result); };
          r.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    });
  }

  function tbIdbSet(key, val) {
    return tbIdbReq().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(TB_AUTH_STORE, 'readwrite');
          tx.objectStore(TB_AUTH_STORE).put(val, key);
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        } catch (e) { resolve(); }
      });
    });
  }

  function tbIdbDel(key) {
    return tbIdbReq().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(TB_AUTH_STORE, 'readwrite');
          tx.objectStore(TB_AUTH_STORE).delete(key);
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        } catch (e) { resolve(); }
      });
    });
  }

  async function restoreAuthFromIdb() {
    if (__tbAuthRestoreDone) return;
    __tbAuthRestoreDone = true;
    try {
      let hasLocal = false;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (isTbAuthKey(k) && localStorage.getItem(k)) { hasLocal = true; break; }
        }
      } catch (e) {}
      if (hasLocal) return;
      const db = await tbIdbReq();
      if (!db) return;
      await new Promise(function (resolve) {
        try {
          const tx = db.transaction(TB_AUTH_STORE, 'readonly');
          const req = tx.objectStore(TB_AUTH_STORE).openCursor();
          req.onsuccess = function () {
            const c = req.result;
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
    } catch (e) {}
  }

  const tbAuthStorage = {
    getItem: function (key) {
      try {
        const v = window.localStorage.getItem(key);
        if (v != null) return v;
      } catch (e) {}
      return tbIdbGet(key);
    },
    setItem: function (key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) {}
      try { tbIdbSet(key, value); } catch (e) {}
    },
    removeItem: function (key) {
      try { window.localStorage.removeItem(key); } catch (e) {}
      try { tbIdbDel(key); } catch (e) {}
    }
  };

  function requestPersistentStorage() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(function () {});
      }
    } catch (e) {}
  }

  function noteInAppBrowserHome() {
    try {
      if (typeof isInAppBrowser === 'function' && isInAppBrowser()) {
        if (typeof isStandalonePwa === 'function' && isStandalonePwa()) return;
        if (sessionStorage.getItem('tb_inapp_stay_toast')) return;
        sessionStorage.setItem('tb_inapp_stay_toast', '1');
        const msg = 'Open Thunder from your Home Screen so you stay signed in.';
        if (typeof showInstallToast === 'function') showInstallToast(msg);
        else if (typeof tbToast === 'function') tbToast(msg, 4200);
      }
    } catch (e) {}
  }

  async function clearTbAuthIdb() {
    try {
      const db = await tbIdbReq();
      if (!db) return;
      await new Promise(function (resolve) {
        try {
          const tx = db.transaction(TB_AUTH_STORE, 'readwrite');
          tx.objectStore(TB_AUTH_STORE).clear();
          tx.oncomplete = function () { resolve(); };
          tx.onerror = function () { resolve(); };
        } catch (e) { resolve(); }
      });
    } catch (e) {}
  }

  function getSb() {
    if (!supabaseEnabled()) return null;
    if (sbClient) return sbClient;
    sbClient = window.supabase.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: tbAuthStorage
      },
      realtime: {
        params: { eventsPerSecond: 5 }
      }
    });
    return sbClient;
  }

  // ---------- SUPABASE REALTIME (live roster / board / memories) ----------
  let realtimeChannel = null;
  let realtimeDebounceTimer = null;
  let realtimeRetryTimer = null;
  let realtimeRetryCount = 0;
  let realtimeStatus = 'off'; // off | connecting | live | error | fallback
  const REALTIME_MAX_RETRIES = 4;
  const REALTIME_RETRY_MS = [2000, 5000, 12000, 30000];

  function scheduleRealtimeRefresh(kind) {
    clearTimeout(realtimeDebounceTimer);
    realtimeDebounceTimer = setTimeout(() => {
      runRealtimeRefresh(kind).catch((e) => {
        console.warn('Thunder realtime refresh', e && e.message ? e.message : e);
      });
    }, 350);
  }

  async function runRealtimeRefresh(kind) {
    if (!supabaseEnabled()) return;
    const tasks = [];
    try {
      if (!kind || kind === 'brothers' || kind === 'all') {
        tasks.push(
          pullBrothers()
            .then(() => {
              if (typeof renderBrothers === 'function') renderBrothers();
            })
            .catch((e) => console.warn('realtime brothers pull', e && e.message ? e.message : e))
        );
      }
      if (!kind || kind === 'announcements' || kind === 'all') {
        tasks.push(
          pullAnnouncements()
            .then(() => {
              if (typeof renderAnnouncements === 'function') renderAnnouncements();
              if (typeof renderAdminAnnouncements === 'function') renderAdminAnnouncements();
            })
            .catch((e) => console.warn('realtime announcements pull', e && e.message ? e.message : e))
        );
      }
      if (!kind || kind === 'events_board' || kind === 'all') {
        tasks.push(
          pullEventsBoard()
            .then(() => {
              if (typeof renderMission === 'function') renderMission();
              if (typeof renderHomeMission === 'function') renderHomeMission();
              if (typeof renderEventsNote === 'function') renderEventsNote();
            })
            .catch((e) => console.warn('realtime events_board pull', e && e.message ? e.message : e))
        );
      }
      if (!kind || kind === 'rsvps' || kind === 'all') {
        tasks.push(
          pullRsvps().catch((e) => console.warn('realtime rsvps pull', e && e.message ? e.message : e))
        );
      }
      if (!kind || kind === 'raffle' || kind === 'all') {
        tasks.push(
          pullRaffle().catch((e) => console.warn('realtime raffle pull', e && e.message ? e.message : e))
        );
      }
      if ((!kind || kind === 'memories' || kind === 'all') && typeof isSignedIn === 'function' && isSignedIn()) {
        tasks.push(
          pullMemories()
            .then(() => {
              if (typeof renderMedia === 'function') renderMedia();
              if (typeof renderLastFire === 'function') renderLastFire();
            })
            .catch((e) => console.warn('realtime memories pull', e && e.message ? e.message : e))
        );
      }
      await Promise.all(tasks);
      if (typeof updateAllNewBadges === 'function') {
        try { updateAllNewBadges(); } catch (e) {}
      }
    } catch (e) {
      console.warn('Thunder realtime refresh failed', e && e.message ? e.message : e);
    }
  }

  function teardownRealtime() {
    clearTimeout(realtimeRetryTimer);
    realtimeRetryTimer = null;
    try {
      const sb = sbClient || (supabaseEnabled() ? getSb() : null);
      if (sb && realtimeChannel) {
        sb.removeChannel(realtimeChannel);
      }
    } catch (e) {
      console.warn('Thunder realtime teardown', e && e.message ? e.message : e);
    }
    realtimeChannel = null;
  }

  function scheduleRealtimeRetry(reason) {
    if (realtimeRetryCount >= REALTIME_MAX_RETRIES) {
      realtimeStatus = 'fallback';
      console.warn(
        'Thunder realtime: giving up after',
        REALTIME_MAX_RETRIES,
        'tries (' + (reason || 'error') + '). App still syncs on open / refresh.'
      );
      return;
    }
    const delay = REALTIME_RETRY_MS[Math.min(realtimeRetryCount, REALTIME_RETRY_MS.length - 1)];
    realtimeRetryCount += 1;
    realtimeStatus = 'error';
    console.warn(
      'Thunder realtime: retry',
      realtimeRetryCount + '/' + REALTIME_MAX_RETRIES,
      'in',
      delay + 'ms',
      reason ? '(' + reason + ')' : ''
    );
    clearTimeout(realtimeRetryTimer);
    realtimeRetryTimer = setTimeout(() => {
      try {
        setupRealtime({ isRetry: true });
      } catch (e) {
        console.warn('Thunder realtime retry failed', e && e.message ? e.message : e);
        scheduleRealtimeRetry('retry_threw');
      }
    }, delay);
  }

  function setupRealtime(opts) {
    opts = opts || {};
    if (!supabaseEnabled()) {
      realtimeStatus = 'off';
      return;
    }
    let sb;
    try {
      sb = getSb();
    } catch (e) {
      console.warn('Thunder realtime: client unavailable', e && e.message ? e.message : e);
      realtimeStatus = 'fallback';
      return;
    }
    if (!sb) {
      realtimeStatus = 'off';
      return;
    }

    try {
      teardownRealtime();
    } catch (e) {}

    if (!opts.isRetry) realtimeRetryCount = 0;
    realtimeStatus = 'connecting';

    let ch;
    try {
      ch = sb.channel('thunder-shared-' + Date.now());
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brothers' },
        (payload) => {
          try {
            scheduleRealtimeRefresh('brothers');
          } catch (e) {
            console.warn('Thunder realtime brothers handler', e && e.message ? e.message : e);
          }
        }
      );
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          try { scheduleRealtimeRefresh('announcements'); }
          catch (e) { console.warn('Thunder realtime announcements handler', e && e.message ? e.message : e); }
        }
      );
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events_board' },
        () => {
          try { scheduleRealtimeRefresh('events_board'); }
          catch (e) { console.warn('Thunder realtime events_board handler', e && e.message ? e.message : e); }
        }
      );
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rsvps' },
        () => {
          try { scheduleRealtimeRefresh('rsvps'); }
          catch (e) { console.warn('Thunder realtime rsvps handler', e && e.message ? e.message : e); }
        }
      );
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'raffle_draws' },
        () => {
          try { scheduleRealtimeRefresh('raffle'); }
          catch (e) { console.warn('Thunder realtime raffle handler', e && e.message ? e.message : e); }
        }
      );
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories' },
        () => {
          try {
            if (isSignedIn()) scheduleRealtimeRefresh('memories');
          } catch (e) {
            console.warn('Thunder realtime memories handler', e && e.message ? e.message : e);
          }
        }
      );
    } catch (e) {
      console.warn('Thunder realtime: channel setup failed', e && e.message ? e.message : e);
      scheduleRealtimeRetry('channel_setup');
      return;
    }

    try {
      ch.subscribe((status, err) => {
        try {
          if (status === 'SUBSCRIBED') {
            realtimeStatus = 'live';
            realtimeRetryCount = 0;
            console.info('Thunder realtime: live');
            return;
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            const detail = (err && (err.message || err)) || status;
            console.warn('Thunder realtime:', status, detail);
            // CLOSED after intentional teardown — don't retry forever on page hide
            if (status === 'CLOSED' && !realtimeChannel) return;
            scheduleRealtimeRetry(String(status));
            return;
          }
        } catch (e) {
          console.warn('Thunder realtime subscribe callback', e && e.message ? e.message : e);
        }
      });
    } catch (e) {
      console.warn('Thunder realtime: subscribe threw', e && e.message ? e.message : e);
      scheduleRealtimeRetry('subscribe_threw');
      return;
    }

    realtimeChannel = ch;

    // Visibility resume: if we fell back, try once when app comes back
    if (!window.__thunderRealtimeVisBound) {
      window.__thunderRealtimeVisBound = true;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        if (realtimeStatus === 'live' || realtimeStatus === 'connecting') return;
        if (!supabaseEnabled()) return;
        realtimeRetryCount = 0;
        try {
          setupRealtime({ isRetry: true });
        } catch (e) {
          console.warn('Thunder realtime resume', e && e.message ? e.message : e);
        }
      });
    }
  }

  function roomCut() {
    try { return !!(window.TB_CONFIG && window.TB_CONFIG.ROOM_CUT); } catch (e) { return false; }
  }

  /* Screen Wake Lock (Safari 18.4+ / iOS Home Screen). Patio raffle, Axum QR, tour. */
  const __tbWakeReasons = new Set();
  let __tbWakeSentinel = null;
  async function tbKeepAwake(reason) {
    if (reason) __tbWakeReasons.add(reason);
    if (!__tbWakeReasons.size) return;
    try {
      if (!navigator.wakeLock || !navigator.wakeLock.request) return;
      if (__tbWakeSentinel && __tbWakeSentinel.released === false) return;
      __tbWakeSentinel = await navigator.wakeLock.request('screen');
      __tbWakeSentinel.addEventListener('release', function () { __tbWakeSentinel = null; });
    } catch (e) {}
  }
  function tbAllowSleep(reason) {
    if (reason) __tbWakeReasons.delete(reason);
    if (__tbWakeReasons.size) return;
    try { if (__tbWakeSentinel && __tbWakeSentinel.release) __tbWakeSentinel.release(); } catch (e) {}
    __tbWakeSentinel = null;
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && __tbWakeReasons.size) {
      tbKeepAwake();
    }
  });

  function currentUser() {
    return (sbSession && sbSession.user) || null;
  }

  function fireSignedInWelcome() {
    if (roomCut()) return;
    if (load('signedInWelcomeSent')) return;
    try { save('signedInWelcomeSent', 1); } catch (e) {}
    const title = 'You’re in the room.';
    const body = 'You’re in. Monday knows your name.';
    try { fireLocalNotification(title, body, 'thunder-signedin', '/?view=home'); } catch (e) {}
  }

  function axumCoffeeState() {
    return load('axumCoffee') || null;
  }

  function saveAxumCoffee(c) {
    save('axumCoffee', c);
    return c;
  }

  function makeAxumCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    let initial = 'T';
    try {
      const n = (typeof knownFirstName === 'function' && knownFirstName()) || '';
      if (n) initial = n.charAt(0).toUpperCase();
    } catch (e) {}
    return initial + '-' + s;
  }

  function issueAxumCoffee() {
    const existing = axumCoffeeState();
    if (existing && existing.code) return existing;
    const uid = currentUser() && currentUser().id;
    const name = (typeof knownFirstName === 'function' && knownFirstName()) || '';
    const row = {
      code: makeAxumCode(),
      name: name,
      userId: uid || '',
      issuedAt: Date.now(),
      redeemedAt: null,
      shownDrop: false
    };
    saveAxumCoffee(row);
    if (supabaseEnabled() && isSignedIn()) {
      const sb = getSb();
      if (sb) {
        sb.from('axum_coffee').insert({
          user_id: uid,
          code: row.code,
          name: row.name
        }).then(function (res) {
          if (res && res.error && String(res.error.message || '').indexOf('duplicate') === -1) {
            console.warn('axum issue', res.error);
          }
        }).catch(function () {});
      }
    }
    return row;
  }

  async function pullAxumCoffee() {
    if (!supabaseEnabled() || !isSignedIn()) return axumCoffeeState();
    const sb = getSb();
    const uid = currentUser() && currentUser().id;
    if (!sb || !uid) return axumCoffeeState();
    try {
      const { data, error } = await sb.from('axum_coffee').select('code,name,issued_at,redeemed_at').eq('user_id', uid).maybeSingle();
      if (error || !data) return axumCoffeeState();
      const local = axumCoffeeState() || {};
      const merged = {
        code: data.code || local.code,
        name: data.name || local.name || '',
        userId: uid,
        issuedAt: data.issued_at ? Date.parse(data.issued_at) : (local.issuedAt || Date.now()),
        redeemedAt: data.redeemed_at ? Date.parse(data.redeemed_at) : (local.redeemedAt || null),
        shownDrop: !!local.shownDrop
      };
      saveAxumCoffee(merged);
      return merged;
    } catch (e) {
      return axumCoffeeState();
    }
  }

  function paintAxumQr(code) {
    const target = document.getElementById('axum-qr');
    if (!target) return;
    target.innerHTML = '';
    if (!code) return;
    paintThunderQr(target, 'SOT-AXUM-' + String(code), 200);
  }

  function renderAxumChip() {
    const chip = document.getElementById('axum-chip');
    if (!chip) return;
    const c = axumCoffeeState();
    if (c && c.code && !c.redeemedAt) {
      chip.classList.remove('hidden');
      chip.textContent = 'FREE AXUM COFFEE';
    } else {
      chip.classList.add('hidden');
    }
  }

  function closeAxumDrop() {
    const el = document.getElementById('axum-drop');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('tb-axum-open');
    try { tbAllowSleep('axum'); } catch (e) {}
  }

  function closeAxumCard() {
    const el = document.getElementById('axum-card');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('tb-axum-open');
    renderAxumChip();
    try { tbAllowSleep('axum'); } catch (e) {}
  }

  function openAxumCard() {
    const c = axumCoffeeState();
    if (!c || !c.code) return;
    closeAxumDrop();
    const card = document.getElementById('axum-card');
    if (!card) return;
    const redeemed = !!c.redeemedAt;
    card.classList.toggle('is-used', redeemed);
    const kicker = document.getElementById('axum-card-kicker');
    const codeEl = document.getElementById('axum-code');
    const nameEl = document.getElementById('axum-name');
    const hint = document.getElementById('axum-hint');
    const btn = document.getElementById('axum-redeem-btn');
    if (kicker) kicker.textContent = redeemed ? 'USED' : 'FIRST SIGN-IN';
    if (codeEl) codeEl.textContent = c.code;
    if (nameEl) nameEl.textContent = (c.name || (typeof knownFirstName === 'function' && knownFirstName()) || '').toUpperCase();
    if (hint) {
      hint.textContent = redeemed
        ? ("You're in the room. Coffee's on us — once.")
        : 'Show this. Tap REDEEM in front of them.';
    }
    if (btn) {
      btn.classList.toggle('hidden', redeemed);
      btn.textContent = 'REDEEM AT AXUM';
      btn.dataset.armed = '0';
    }
    paintAxumQr(c.code);
    card.classList.remove('hidden');
    document.body.classList.add('tb-axum-open');
    try { tbKeepAwake('axum'); } catch (e) {}
  }

  function openAxumDrop() {
    const c = axumCoffeeState();
    if (!c || !c.code || c.redeemedAt) return;
    const drop = document.getElementById('axum-drop');
    if (!drop) return;
    drop.classList.remove('hidden');
    document.body.classList.add('tb-axum-open');
    try { tbKeepAwake('axum'); } catch (e) {}
  }

  function maybeShowAxumCoffee() {
    const c = axumCoffeeState();
    if (!c || !c.code) {
      renderAxumChip();
      return;
    }
    if (c.redeemedAt) {
      renderAxumChip();
      return;
    }
    if (!c.shownDrop) {
      c.shownDrop = true;
      saveAxumCoffee(c);
      openAxumDrop();
    }
    renderAxumChip();
  }

  async function redeemAxumCoffee() {
    const c = axumCoffeeState();
    if (!c || !c.code || c.redeemedAt) return false;
    c.redeemedAt = Date.now();
    saveAxumCoffee(c);
    if (supabaseEnabled() && isSignedIn()) {
      try {
        const sb = getSb();
        const uid = currentUser() && currentUser().id;
        if (sb && uid) {
          await sb.from('axum_coffee').update({ redeemed_at: new Date().toISOString() }).eq('user_id', uid).is('redeemed_at', null);
        }
      } catch (e) {}
    }
    openAxumCard();
    try { tbFeedback.confirm(); } catch (e) {}
    return true;
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

  function captureImInSignal() {
    const signal = {
      key: '',
      at: new Date().toISOString(),
      tz: '',
      hour: new Date().getHours(),
      standalone: false,
      platform: 'web',
      alerts: 'unknown',
      signed: false,
      name: '',
      lang: (navigator.language || '').slice(0, 12),
      persist: false
    };
    try { signal.key = meetingKey(); } catch (e) {}
    try { signal.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    try {
      signal.standalone = !!(window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
    } catch (e) {}
    const ua = navigator.userAgent || '';
    signal.platform = /iPhone|iPad|iPod/.test(ua) ? 'ios' : (/Android/.test(ua) ? 'android' : 'web');
    try { signal.alerts = Notification.permission; } catch (e) {}
    try { signal.signed = !!isSignedIn(); } catch (e) {}
    try { signal.name = (typeof knownFirstName === 'function' && knownFirstName()) || ''; } catch (e) {}
    try { save('lastImInSignal', signal); } catch (e) {}
    try {
      const log = load('imInSignalLog') || [];
      log.push(signal);
      save('imInSignalLog', log.slice(-24));
    } catch (e) {}
    return signal;
  }

  function stashSeatFromGate() {
    const name = (($('#auth-name') && $('#auth-name').value) || '').trim();
    const email = (($('#auth-email') && $('#auth-email').value) || '').trim();
    const phone = (($('#auth-phone') && $('#auth-phone').value) || '').trim();
    try {
      save('pendingSeat', {
        name: name,
        email: email,
        phone: phone,
        at: Date.now(),
        key: (typeof meetingKey === 'function' && meetingKey()) || ''
      });
    } catch (e) {}
    return { name: name, email: email, phone: phone };
  }

  async function flushPendingSeat() {
    const p = load('pendingSeat');
    if (!p || (!p.name && !p.phone && !p.email)) return;
    if (!isSignedIn()) return;
    try {
      const id = (typeof ensureBrotherId === 'function') ? ensureBrotherId() : myProfileId;
      if (!id) return;
      const entry = (brothers || []).find(function (b) { return b && b.id === id; }) || { id: id };
      if (p.name) entry.name = p.name;
      if (p.phone) entry.phone = p.phone;
      if (p.email && !entry.email) entry.email = p.email;
      const i = (brothers || []).findIndex(function (b) { return b && b.id === id; });
      if (i >= 0) brothers[i] = Object.assign({}, brothers[i], entry);
      else brothers.push(entry);
      try { save('brothers', brothers); } catch (e) {}
      if (typeof pushBrother === 'function') await pushBrother(entry);
      save('pendingSeat', null);
    } catch (e) {}
  }

  function openImInSignIn() {
    const gate = document.getElementById('auth-gate');
    const title = document.getElementById('auth-title');
    const sub = document.getElementById('auth-sub');
    const hint = document.getElementById('auth-hint');
    const signBtn = document.getElementById('auth-signin-btn');
    const magic = document.getElementById('auth-magic-btn');
    const invite = document.getElementById('auth-signup-btn');
    const pass = document.getElementById('auth-password');
    const forgot = document.getElementById('auth-forgot-btn');
    if (gate) gate.classList.add('auth-gate-imin');
    if (title) title.textContent = 'LOCK YOUR SEAT';
    if (sub) { sub.textContent = ''; sub.classList.add('hidden'); }
    if (hint) hint.classList.add('hidden');
    if (signBtn) {
      signBtn.classList.remove('hidden');
      signBtn.textContent = 'LOCK MY SEAT';
    }
    if (magic) {
      magic.classList.add('hidden');
      magic.setAttribute('hidden', 'hidden');
      magic.setAttribute('aria-hidden', 'true');
    }
    if (invite) invite.classList.add('hidden');
    if (pass) pass.classList.add('hidden');
    if (forgot) forgot.classList.add('hidden');
    try {
      const nm = document.getElementById('auth-name');
      const em = document.getElementById('auth-email');
      const ph = document.getElementById('auth-phone');
      const me = (brothers || []).find(function (b) { return b && b.id === myProfileId; });
      if (nm && me && me.name && !nm.value) nm.value = me.name;
      if (em && me && me.email && !em.value) em.value = me.email;
      if (ph && me && me.phone && !ph.value) ph.value = me.phone;
    } catch (e) {}
    openAuthGate('');
    if (sub) { sub.textContent = ''; sub.classList.add('hidden'); }
    return true;
  }

  async function authMagicLink(email) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const ok = await inviteAllowed(email);
    if (!ok) throw new Error('Ask a leader for an invite.');
    const redirectTo = (window.location && window.location.origin) ? (window.location.origin + '/') : '/';
    const { error } = await sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
  }

  function openAuthGate(reason) {
    const gate = $('#auth-gate');
    if (gate) gate.classList.add('auth-gate-imin');
    const sub = $('#auth-sub');
    if (sub) { sub.textContent = ''; sub.classList.add('hidden'); }
    const pass = document.getElementById('auth-password');
    const forgot = document.getElementById('auth-forgot-btn');
    const invite = document.getElementById('auth-signup-btn');
    if (pass) { pass.classList.add('hidden'); pass.value = ''; }
    if (forgot) forgot.classList.add('hidden');
    if (invite) invite.classList.add('hidden');
    setAuthError('');
    if (gate) {
      gate.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (gate.dataset.backdropBound !== '1') {
        gate.dataset.backdropBound = '1';
        gate.addEventListener('click', function (e) {
          if (e.target === gate) closeAuthGate();
        });
      }
    }
    try {
      const em = $('#auth-email');
      if (em) setTimeout(() => em.focus(), 80);
    } catch (e) {}
  }

  function closeAuthGate() {
    const gate = $('#auth-gate');
    if (gate) {
      gate.classList.add('hidden');
      gate.classList.remove('auth-gate-imin');
    }
    const sub = document.getElementById('auth-sub');
    const hint = document.getElementById('auth-hint');
    const pass = document.getElementById('auth-password');
    const forgot = document.getElementById('auth-forgot-btn');
    const invite = document.getElementById('auth-signup-btn');
    const magic = document.getElementById('auth-magic-btn');
    if (sub) { sub.textContent = ''; sub.classList.add('hidden'); }
    if (hint) { hint.textContent = ''; hint.classList.add('hidden'); }
    if (pass) pass.classList.add('hidden');
    if (forgot) forgot.classList.add('hidden');
    if (invite) invite.classList.add('hidden');
    if (magic) magic.textContent = 'Email unlocks the whole experience';
    setAuthError('');
    releaseFocusAndZoom();
    if (typeof unlockBodyIfClear === 'function') unlockBodyIfClear();
    else document.body.style.overflow = '';
    if (window.__tbA2hsAfterAuth) {
      window.__tbA2hsAfterAuth = false;
      setTimeout(function () { try { maybeOfferImInA2hs(); } catch (e) {} }, 450);
    }
  }

  function syncBrothersSeatBtn() {
    const btn = document.getElementById('edit-profile-btn');
    const entry = document.getElementById('auth-entry-btn');
    const me = (brothers || []).find(function (b) { return b && b.id === myProfileId && (b.name || '').trim(); });
    if (!isSignedIn()) {
      if (btn) {
        btn.classList.add('hidden');
        btn.textContent = 'EDIT PROFILE';
      }
      if (entry) {
        entry.classList.remove('hidden');
        entry.removeAttribute('hidden');
        entry.setAttribute('aria-hidden', 'false');
      }
    } else {
      if (btn) {
        btn.classList.remove('hidden');
        btn.textContent = me ? 'EDIT PROFILE' : 'YOUR SEAT';
      }
      if (entry) {
        entry.classList.add('hidden');
        entry.setAttribute('hidden', 'hidden');
        entry.setAttribute('aria-hidden', 'true');
      }
    }
  }

  function updateAuthSessionBar() {
    try { syncDropShotAuth(); } catch (e) {}
    try { syncBrothersSeatBtn(); } catch (e) {}
    const bar = $('#auth-session-bar');
    const who = $('#auth-who');
    const entry = $('#auth-entry-btn');
    const homeCta = document.getElementById('home-member-cta');
    if (entry) {
      if (isSignedIn()) {
        entry.classList.add('hidden');
        entry.setAttribute('hidden', 'hidden');
      } else {
        entry.classList.remove('hidden');
        entry.removeAttribute('hidden');
      }
    }
    if (!supabaseEnabled()) {
      if (bar) bar.classList.add('hidden');
      if (homeCta) homeCta.classList.add('hidden');
      return;
    }
    if (isSignedIn()) {
      const email = (currentUser().email || 'Brother').trim();
      if (who) who.textContent = email;
      if (bar) bar.classList.remove('hidden');
      if (homeCta) homeCta.classList.add('hidden');
    } else {
      if (bar) bar.classList.add('hidden');
      if (homeCta) homeCta.classList.remove('hidden');
    }
  }

  function startMemberSignIn() {
    if (isSignedIn()) {
      try { openProfileEditor(); } catch (e) {}
      return;
    }
    openImInSignIn();
  }
  try { window.startMemberSignIn = startMemberSignIn; } catch (e) {}

  function bindHomeMemberCta() {
    if (document.documentElement.dataset.tbAuthEntryBound === '1') return;
    document.documentElement.dataset.tbAuthEntryBound = '1';
    document.addEventListener('click', function (e) {
      const t = e.target && e.target.closest && e.target.closest('#home-member-cta, #auth-entry-btn, #memories-signin-shot');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      try { tbFeedback.press(t); } catch (err) {}
      startMemberSignIn();
    }, true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindHomeMemberCta);
  } else {
    try { bindHomeMemberCta(); } catch (e) {}
  }

  async function initAuth() {
    if (!supabaseEnabled()) {
      authReady = true;
      updateAuthSessionBar();
      try { Promise.resolve(refreshChairMode()); } catch (eC) {}
      return;
    }
    try { await restoreAuthFromIdb(); } catch (eR) {}
    const sb = getSb();
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) console.warn('auth getSession', error);
      sbSession = (data && data.session) || null;
    } catch (e) {
      console.warn('auth session', e);
      sbSession = null;
    }
    if (sbSession) {
      try { requestPersistentStorage(); } catch (eP) {}
    }
    try { noteInAppBrowserHome(); } catch (eB) {}
    try { Promise.resolve(refreshChairMode()); } catch (eC) {}
    sb.auth.onAuthStateChange((event, session) => {
      sbSession = session;
      updateAuthSessionBar();
      try { Promise.resolve(refreshChairMode()); } catch (eC) {}
      if (session) {
        closeAuthGate();
        try { flushPendingRsvp(); } catch (e) {}
        try { flushPendingShot(); } catch (e) {}
        try { lockInAppReminder(); } catch (e) {}
        if (event === 'SIGNED_IN') {
          try { requestPersistentStorage(); } catch (eP) {}
          try { fireSignedInWelcome(); } catch (e) {}
          try {
            Promise.resolve(claimBrotherOnSignIn()).then(function () {
              try { flushPendingSeat(); } catch (e2) {}
            });
          } catch (e) {}
          try { markInviteUsed(); } catch (e) {}
          try {
            const me = (brothers || []).find(function (b) { return b && b.id === myProfileId && (b.name || '').trim(); });
            const coffee = axumCoffeeState();
            const showingCoffee = !!(coffee && coffee.code && !coffee.redeemedAt);
            const pending = load('pendingSeat') || {};
            const hasName = !!(me || (pending && String(pending.name || '').trim()));
            if (!hasName && !showingCoffee) {
              setTimeout(function () { try { openProfileEditor(); } catch (e2) {} }, 350);
            }
          } catch (e) {}
        }
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

  function softRefreshApp(reason) {
    // Cache/SW only. Never delete sb-* / supabase keys or IndexedDB auth.
    try {
      if (typeof showInstallToast === 'function') showInstallToast(reason || 'Updating… hang tight');
    } catch (e) {}
    setTimeout(function () {
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all((regs || []).map(function (r) { return r.unregister(); }));
          }).catch(function () {}).finally(function () {
            try {
              if (window.caches && caches.keys) {
                caches.keys().then(function (keys) {
                  return Promise.all((keys || []).map(function (k) { return caches.delete(k); }));
                }).catch(function () {}).finally(function () {
                  window.location.reload();
                });
              } else {
                window.location.reload();
              }
            } catch (e2) { window.location.reload(); }
          });
        } else {
          window.location.reload();
        }
      } catch (e) { window.location.reload(); }
    }, 400);
  }

  async function claimBrotherOnSignIn() {
    if (!supabaseEnabled() || !isSignedIn()) return;
    const uid = currentUser() && currentUser().id;
    if (!uid) return;
    const sb = getSb();
    if (!sb) return;
    try {
      const { data } = await sb.from('brothers').select('id,name').eq('owner_id', uid).limit(1);
      if (data && data[0] && data[0].id) {
        myProfileId = data[0].id;
        save('myProfileId', myProfileId);
        return;
      }
    } catch (e) {}
    try {
      const id = (typeof ensureBrotherId === 'function') ? ensureBrotherId() : myProfileId;
      if (!id) return;
      await sb.from('brothers').update({ owner_id: uid }).eq('id', id);
    } catch (e) {}
  }

  async function markInviteUsed() {
    if (!supabaseEnabled() || !isSignedIn()) return;
    const user = currentUser();
    const email = user && user.email;
    if (!email) return;
    try {
      await getSb().from('invites').update({
        used_at: new Date().toISOString(),
        used_by: user.id
      }).eq('email', email.toLowerCase().trim());
    } catch (e) {}
  }

  async function inviteAllowed(email) {
    if (!supabaseEnabled() || !email) return false;
    try {
      const { data, error } = await getSb().rpc('invite_ok', { e: String(email).trim() });
      if (error) return false;
      return !!data;
    } catch (e) {
      return false;
    }
  }

  async function authSignIn(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sbSession = data.session;
    try { requestPersistentStorage(); } catch (eP) {}
    try { softRefreshApp('Signed in — refreshing Thunder Board…'); } catch (e) {}
    return data;
  }

  async function authSignUp(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const ok = await inviteAllowed(email);
    if (!ok) throw new Error('Ask a leader for an invite.');
    const redirectTo = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? (window.location.origin + '/')
      : publicUrl('/');
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    // May require email confirmation depending on project settings
    if (data.session) {
      sbSession = data.session;
    } else {
      // No session yet = confirm-email is ON in Supabase (common friction for brothers)
      data.__tbNeedsEmailConfirm = true;
    }
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
    try { await clearTbAuthIdb(); } catch (eA) {}
    sbSession = null;
    media = [];
    updateAuthSessionBar();
    renderMedia();
    if (typeof renderLastFire === 'function') renderLastFire();
    try { await refreshChairMode(); } catch (eC) {}
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
    let rows = null;
    let error = null;
    {
      const full = await sb
        .from('memories')
        .select('id,user_id,storage_path,original_path,display_path,card_path,enhance_status,caption,uploader_name,created_at,meeting_key')
        .order('created_at', { ascending: false })
        .limit(60);
      rows = full.data;
      error = full.error;
    }
    if (error) {
      const legacy = await sb
        .from('memories')
        .select('id,user_id,storage_path,caption,uploader_name,created_at,meeting_key')
        .order('created_at', { ascending: false })
        .limit(60);
      rows = legacy.data;
      error = legacy.error;
    }
    if (error) throw new Error(error.message || 'Could not load memories.');
    if (!Array.isArray(rows)) {
      media = [];
      return false;
    }
    const mapped = [];
    for (const r of rows) {
      const original = r.original_path || r.storage_path;
      const display = r.display_path || original;
      const card = r.card_path || display;
      let url = null;
      let cardUrl = null;
      try { url = await signedUrlFor(display); } catch (e) {}
      if (!url && original && original !== display) {
        try { url = await signedUrlFor(original); } catch (e) {}
      }
      if (!url) continue;
      try { cardUrl = (card && card !== display) ? (await signedUrlFor(card)) : url; } catch (e) { cardUrl = url; }
      const lower = String(original || display || '').toLowerCase();
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(lower);
      mapped.push({
        id: r.id,
        data: cardUrl || url,
        full: url,
        original_path: original,
        display_path: r.display_path || '',
        storage_path: r.storage_path || original,
        type: isVideo ? 'video' : 'image',
        caption: r.caption || '',
        uploader_name: r.uploader_name || '',
        date: r.created_at || new Date().toISOString(),
        user_id: r.user_id || null,
        meeting_key: r.meeting_key || ''
      });
    }
    media = mapped;
    return true;
  }

  function memoryAccessToken() {
    try { return (sbSession && sbSession.access_token) || ''; } catch (e) { return ''; }
  }

  function kickMemoryEnhance(memoryId) {
    if (!memoryId) return;
    const token = memoryAccessToken();
    if (!token) return;
    fetch('/.netlify/functions/enhance-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ id: memoryId })
    }).then(function (res) {
      if (!res.ok) return;
      return res.json().catch(function () { return {}; });
    }).then(function (body) {
      if (!body || !body.ok) return;
      setTimeout(function () {
        Promise.resolve(pullMemories()).then(function () {
          try { renderMedia(); } catch (e) {}
          try { if (typeof renderLastFire === 'function') renderLastFire(); } catch (e) {}
        }).catch(function () {});
      }, 200);
    }).catch(function (e) {
      console.warn('enhance skip', e);
    });
  }

  function extFromMemoryFile(item) {
    const name = String((item && item.filename) || '');
    const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (m && /^(jpe?g|png|webp|heic|heif|gif|mp4|webm|mov)$/.test(m[1])) {
      return m[1] === 'jpeg' ? 'jpg' : m[1];
    }
    if (item && item.type === 'video') return 'mp4';
    const t = (item && item.blob && item.blob.type) || '';
    if (/png/i.test(t)) return 'png';
    if (/webp/i.test(t)) return 'webp';
    if (/heic|heif/i.test(t)) return 'heic';
    if (/mp4/i.test(t)) return 'mp4';
    return 'jpg';
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

    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : (Date.now().toString(16) + '-tbmem');
    const ext = extFromMemoryFile(item);
    const originalPath = 'private/' + user.id + '/' + id + '/original.' + ext;
    const contentType = isVideo
      ? (blob.type || 'video/mp4')
      : (blob.type || 'image/jpeg');

    const { error: upErr } = await sb.storage
      .from(memoriesBucket())
      .upload(originalPath, blob, {
        contentType: contentType,
        upsert: false
      });
    if (upErr) throw new Error('Upload failed: ' + (upErr.message || 'storage error'));

    const baseRow = {
      id: id,
      user_id: user.id,
      storage_path: originalPath,
      caption: item.caption || '',
      uploader_name: item.uploader_name || myDisplayName() || (user.email || '').split('@')[0] || '',
      meeting_key: (typeof meetingKey === 'function' ? meetingKey() : '')
    };
    const fullRow = Object.assign({}, baseRow, {
      original_path: originalPath,
      display_path: null,
      card_path: null,
      enhance_status: isVideo ? 'skipped' : 'pending'
    });

    let saved = null;
    let insErr = null;
    {
      const first = await sb.from('memories').insert(fullRow).select('id,user_id,storage_path,original_path,display_path,caption,uploader_name,created_at,meeting_key').single();
      saved = first.data;
      insErr = first.error;
    }
    if (insErr) {
      const second = await sb.from('memories').insert(baseRow).select('id,user_id,storage_path,caption,uploader_name,created_at,meeting_key').single();
      saved = second.data;
      insErr = second.error;
    }

    if (insErr) {
      try { await sb.storage.from(memoriesBucket()).remove([originalPath]); } catch (e) {}
      throw new Error('Photo uploaded but could not save the record: ' + (insErr.message || 'database error'));
    }

    let url = null;
    try { url = await signedUrlFor(originalPath); } catch (e) {}
    if (!isVideo) {
      try { kickMemoryEnhance((saved && saved.id) || id); } catch (e) {}
    }
    return {
      id: saved && saved.id,
      data: url || item.data,
      full: url || item.data,
      original_path: originalPath,
      storage_path: originalPath,
      type: isVideo ? 'video' : 'image',
      caption: (saved && saved.caption) || item.caption || '',
      uploader_name: (saved && saved.uploader_name) || baseRow.uploader_name,
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
    // Shared publish requires signed-in session (RLS). Leadership PIN is only a UI gate.
    if (!isSignedIn()) return { ok: false, reason: 'sign_in_required' };
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

  async function pullAnnouncements() {
    if (!supabaseEnabled()) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const { data, error } = await sb
        .from('announcements')
        .select('id,title,body,created_at,sort_order')
        .order('sort_order', { ascending: true });
      if (error) {
        console.warn('announcements pull', error);
        return false;
      }
      if (!data || !data.length) return false;
      announcements = data.map((row, i) => ({
        id: row.id || ('ann-' + i),
        title: row.title || '',
        body: row.body || '',
        createdAt: row.created_at ? new Date(row.created_at).getTime() : (i + 1)
      }));
      save('announcements', announcements);
      return true;
    } catch (e) {
      console.warn('announcements pull failed', e);
      return false;
    }
  }

  async function pushAnnouncements() {
    if (!supabaseEnabled()) return { ok: false, reason: 'no_supabase' };
    if (!isSignedIn()) return { ok: false, reason: 'sign_in_required' };
    const sb = getSb();
    if (!sb) return { ok: false, reason: 'no_client' };
    // Leadership PIN gates the UI; RLS requires authenticated session for writes
    try {
      // Replace set: delete all then insert current list (small fraternity lists)
      const { error: delErr } = await sb.from('announcements').delete().neq('id', '');
      if (delErr) {
        console.warn('announcements clear', delErr);
        return { ok: false, reason: delErr.message || 'clear_failed' };
      }
      if (!announcements.length) return { ok: true };
      const rows = announcements.map((a, i) => ({
        id: a.id || ('ann-' + Date.now() + '-' + i),
        title: a.title || '',
        body: a.body || '',
        created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        sort_order: i
      }));
      const { error } = await sb.from('announcements').upsert(rows, { onConflict: 'id' });
      if (error) {
        console.warn('announcements push', error);
        return { ok: false, reason: error.message || 'push_failed' };
      }
      return { ok: true };
    } catch (e) {
      console.warn('announcements push failed', e);
      return { ok: false, reason: (e && e.message) || 'push_failed' };
    }
  }

  async function pullBrothers() {
    if (!supabaseEnabled()) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const signed = !!(typeof isSignedIn === 'function' && isSignedIn());
      const cols = signed
        ? 'id,name,bio,photo_url,skills,available,updated_at,birthday,phone'
        : 'id,name,bio,photo_url,skills,available,updated_at,birthday';
      const { data, error } = await sb
        .from('brothers')
        .select(cols)
        .order('updated_at', { ascending: false });
      if (error) {
        console.warn('brothers pull', error);
        return false;
      }
      if (!data) return false;
      const localById = {};
      (brothers || []).forEach(b => { if (b && b.id) localById[b.id] = b; });
      const remote = data.map(row => {
        const local = localById[row.id];
        const remotePhoto = row.photo_url || null;
        // Keep local photo if remote has none (e.g. not pushed yet)
        const photo = remotePhoto || (local && local.photo) || null;
        return {
          id: row.id,
          name: row.name || (local && local.name) || '',
          bio: row.bio || (local && local.bio) || '',
          phone: signed ? (row.phone || (local && local.phone) || '') : '',
          birthday: row.birthday || (local && local.birthday) || '',
          photo,
          skills: row.skills || (local && local.skills) || '',
          available: row.available !== false,
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
        };
      });
      // Keep local-only rows not yet on server
      const remoteIds = new Set(remote.map(b => b.id));
      const localOnly = (brothers || []).filter(b => b && b.id && !remoteIds.has(b.id));
      brothers = remote.concat(localOnly);
      try { ensureFounderSeat(); } catch (e) {}
      try { collapseDuplicateBrothers(); } catch (e) {}
      save('brothers', brothers);
      return true;
    } catch (e) {
      console.warn('brothers pull failed', e);
      return false;
    }
  }

  async function syncSharedData() {
    if (!supabaseEnabled()) return;
    // Announcements + events board: readable without sign-in
    try {
      await pullAnnouncements();
      if (typeof renderAnnouncements === 'function') renderAnnouncements();
    } catch (e) {
      console.warn('Announcements sync failed', e);
    }
    try {
      await pullEventsBoard();
      if (typeof renderMission === 'function') renderMission();
      if (typeof renderEventsNote === 'function') renderEventsNote();
      if (typeof updateAllNewBadges === 'function') updateAllNewBadges();
    } catch (e) {
      console.warn('Events board sync failed', e);
    }
    try {
      await pullBrothers();
      if (typeof renderBrothers === 'function') renderBrothers();
    } catch (e) {
      console.warn('Brothers sync failed', e);
    }
    try {
      await pullRsvps();
    } catch (e) {
      console.warn('Rsvps sync failed', e);
    }
    if (!isSignedIn()) {
      media = [];
      if (typeof renderMedia === 'function') renderMedia();
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

  // Shared brother profile — name/bio/phone/photo_url in public.brothers
  async function pushBrother(entry) {
    if (!entry || !entry.id) return entry;
    if (!supabaseEnabled()) return entry;
    // Shared roster writes require a signed-in session (RLS: authenticated only)
    if (!isSignedIn()) {
      entry._sharedPush = 'sign_in_required';
      return entry;
    }
    const sb = getSb();
    if (!sb) return entry;
    try {
      let photoUrl = entry.photo || null;
      // Keep data-URL photos if modest size; skip huge blobs that would blow the row
      if (photoUrl && String(photoUrl).startsWith('data:image') && photoUrl.length > 400000) {
        try {
          photoUrl = await compressImageDataUrl(photoUrl, 720, 0.65);
        } catch (e) { /* keep original */ }
        if (photoUrl && photoUrl.length > 450000) photoUrl = null;
      }
      const uid = currentUser() && currentUser().id;
      const row = {
        id: entry.id,
        name: entry.name || '',
        bio: entry.bio || '',
        phone: entry.phone || '',
        photo_url: photoUrl,
        skills: entry.skills || '',
        available: entry.available !== false,
        birthday: entry.birthday || null,
        updated_at: new Date().toISOString(),
        owner_id: uid || null
      };
      const { error } = await sb.from('brothers').upsert(row, { onConflict: 'id' });
      if (error) {
        console.warn('brothers push', error);
        entry._sharedPush = error.message || 'push_failed';
        return entry;
      }
      entry.photo = photoUrl || entry.photo;
      entry._sharedPush = 'ok';
      return entry;
    } catch (e) {
      console.warn('brothers push failed', e);
      entry._sharedPush = (e && e.message) || 'push_failed';
      return entry;
    }
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
  /** Permanent: never guess identity. Explicit profile name only. */
  function knownFirstName() {
    const full = myDisplayName();
    if (!full) return '';
    const first = full.split(/\s+/)[0].replace(/[^A-Za-z'’-]/g, '');
    if (!first || first.length < 2) return '';
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  function updatePersonalHome() {
    const el = document.getElementById('home-personal');
    if (!el) return;
    const first = knownFirstName();
    if (!first) {
      el.textContent = '';
      el.classList.add('hidden');
      return;
    }
    let line = first + '.';
    if (rsvp) line = first + ' — you\'re in.';
    else {
      try {
        const next = getNextMeetingMonday();
        const d = daysUntil(next);
        if (d === 0) line = first + ' — tonight.';
        else if (d === 1) line = first + ' — tomorrow.';
      } catch (e) {}
    }
    el.textContent = line;
    el.classList.remove('hidden');
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

  function parkFabByImin(force) {
    const fab = document.getElementById('thunder-fab');
    const btn = document.getElementById('rsvp-btn');
    if (!fab) return;
    const home = currentViewName === 'home';
    let week = false;
    try {
      const d = daysUntil(getNextMeetingMonday());
      week = d >= 0 && d <= 7;
    } catch (e) {}
    const busy = document.body.classList.contains('tb-ask-open') || document.body.classList.contains('tb-tour-open');
    if (!home || !week || !btn || busy || (!force && rsvp)) {
      fab.classList.remove('tb-fab-by-imin');
      fab.style.left = '';
      fab.style.top = '';
      fab.style.right = '';
      fab.style.bottom = '';
      return;
    }
    const r = btn.getBoundingClientRect();
    const w = 88;
    let left = r.right + 6;
    if (left + w > window.innerWidth - 8) left = Math.max(8, r.left - w - 6);
    fab.classList.add('tb-fab-by-imin');
    fab.style.left = left + 'px';
    fab.style.top = (r.top + (r.height / 2) - (w / 2)) + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
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
    // Living Home — gathering-day transform (canonical meeting engine only)
    let phase = 'NEXT GATHERING';
    let countText = days + ' DAYS';
    let phaseClass = 'phase-normal';
    const now = new Date();
    const _mt = parseMeetingHours();
    // Detect "today was meeting day, time has passed" even after next rolled
    const thisMeet = meetingMondayOf(now.getFullYear(), now.getMonth());
    const thisMoment = new Date(thisMeet);
    thisMoment.setHours(_mt.h, _mt.m, 0, 0);
    const todayIsThisMeet =
      thisMeet.getFullYear() === now.getFullYear() &&
      thisMeet.getMonth() === now.getMonth() &&
      thisMeet.getDate() === now.getDate();

    if (todayIsThisMeet && now >= thisMoment) {
      phase = 'GOOD NIGHT, BROTHERS';
      countText = 'SHOWED UP';
      phaseClass = 'phase-post';
    } else if (days === 0) {
      const meetingMoment = new Date(next);
      meetingMoment.setHours(_mt.h, _mt.m, 0, 0);
      const hoursLeft = Math.max(0, Math.floor((meetingMoment - now) / 3600000));
      const minsLeft = Math.max(0, Math.floor((meetingMoment - now) / 60000));
      if (minsLeft <= 90) {
        phase = '⚡ THUNDER TONIGHT';
        countText = hoursLeft === 0 ? 'STARTING SOON' : (hoursLeft + 'H LEFT');
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
      card.classList.remove('phase-normal', 'phase-week', 'phase-soon', 'phase-tonight', 'phase-live', 'phase-post');
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
    try { updatePersonalHome(); } catch (e) {}
  }

  // ---------- LOCAL NOTIFICATIONS (client-side) ----------
  // Fires when the brother opens the app (or keeps it open).
  // Key windows: 7 days, 3 days, 1 day, morning of meeting.
  // Local notifications when the PWA is awake.
  // Locked: 7 days, 1 day, optional 2 hours. No 3-day. No nags.
  const NOTIFY_KEYS = {
    d7: 'tb_notified_7d',
    d1: 'tb_notified_1d',
    h2: 'tb_notified_2h',
    morning: 'tb_notified_morning',
    bday: 'tb_notified_bday'
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

  function wantsGatheringPing() {
    return !!(load('reminderSet') || load('gatheringAlertsOn'));
  }

  function fireLocalNotification(title, body, tag, url) {
    if (!canNotify()) return;
    const target = url || '/?view=home';
    const opts = {
      body: body || '',
      icon: 'assets/icon-192-v3.png',
      badge: 'assets/icon-official.png',
      tag: tag || 'thunder-gathering',
      renotify: false,
      data: { url: target },
      actions: [
        { action: 'imin', title: "I'M IN" },
        { action: 'open', title: 'OPEN' }
      ]
    };
    const go = function () {
      try { applyDeepLink(target); } catch (e) {}
    };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (reg) {
          return reg.showNotification(title, opts);
        }).catch(function () {
          const n = new Notification(title, opts);
          n.onclick = function () { window.focus(); go(); n.close(); };
        });
        return;
      }
    } catch (e) {}
    try {
      const n = new Notification(title, opts);
      n.onclick = function () { window.focus(); go(); n.close(); };
    } catch (e2) {
      console.warn('Notification failed', e2);
    }
  }

  function applyDeepLink(raw) {
    try {
      const u = new URL(raw, location.origin);
      const view = u.searchParams.get('view');
      if (view && typeof showView === 'function' && ['home', 'brothers', 'events', 'about'].indexOf(view) !== -1) {
        showView(view, { silent: true });
      }
      if (u.searchParams.get('imin') === '1') {
        if (typeof isTourMandatory === 'function' && isTourMandatory()) return;
        if (typeof showView === 'function') showView('home', { silent: true });
        if (!rsvp) {
          setTimeout(function () {
            const btn = document.getElementById('rsvp-btn');
            if (btn && !rsvp) btn.click();
          }, 450);
        }
      }
      if (u.searchParams.get('add') === '1' || u.searchParams.get('shared') === '1') {
        if (typeof showView === 'function') showView('events', { silent: true });
        setTimeout(function () {
          try { openModal('media-modal'); } catch (e) {}
          if (u.searchParams.get('shared') === '1') consumeSharedMemory();
        }, 350);
      }
    } catch (e) {}
  }

  async function consumeSharedMemory() {
    try {
      const cache = await caches.open('tb-share');
      const res = await cache.match('/__shared_memory');
      if (!res) return;
      const blob = await res.blob();
      const name = (res.headers && res.headers.get('X-Filename')) || 'shared.jpg';
      const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
      const input = document.getElementById('media-file');
      if (input && typeof DataTransfer !== 'undefined') {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        try { input.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
      }
      await cache.delete('/__shared_memory');
    } catch (e) {}
  }

  function updateOsBadge() {
    try {
      if (!navigator.setAppBadge && !navigator.clearAppBadge) return;
      const d = daysUntil(getNextMeetingMonday());
      let n = 0;
      if ((d === 0 || d === 1) && !rsvp) n = 1;
      else if (typeof hasNewAnnouncements === 'function' && hasNewAnnouncements()) n = 1;
      else if (typeof hasNewLastFire === 'function' && hasNewLastFire()) n = 1;
      if (n && navigator.setAppBadge) navigator.setAppBadge(n);
      else if (navigator.clearAppBadge) navigator.clearAppBadge();
    } catch (e) {}
  }

  function checkAndFireMeetingNotifications() {
    if (!wantsGatheringPing()) return;
    const next = getNextMeetingMonday();
    const days = daysUntil(next);
    const now = new Date();
    const hour = now.getHours();
    const mt = parseMeetingHours();
    const meetingKey = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');

    function alreadyFired(key) {
      return load(key) === meetingKey;
    }
    function markFired(key) {
      save(key, meetingKey);
    }

    const when = meetingTime() + ' · ' + venueName();

    if (days === 7 && !alreadyFired(NOTIFY_KEYS.d7)) {
      fireLocalNotification('Gathering in 7 days', when + '. Lock it in.', 'thunder-7d', '/?view=home');
      markFired(NOTIFY_KEYS.d7);
    }
    if (days === 1 && !alreadyFired(NOTIFY_KEYS.d1)) {
      fireLocalNotification('Tomorrow night', when + '.', 'thunder-1d', '/?view=home');
      markFired(NOTIFY_KEYS.d1);
    }
    // ~2 hours before (meeting hour minus 2, one-hour window)
    if (days === 0 && hour === Math.max(0, (mt.h || 18) - 2) && !alreadyFired(NOTIFY_KEYS.h2)) {
      fireLocalNotification('Two hours', 'Sons of Thunder. ' + when + '.', 'thunder-2h', '/?view=home');
      markFired(NOTIFY_KEYS.h2);
    }
    if (days === 0 && hour >= 7 && hour < 11 && !alreadyFired(NOTIFY_KEYS.morning)) {
      fireLocalNotification('Tonight', when + '. See you there.', 'thunder-morning', '/?view=home');
      markFired(NOTIFY_KEYS.morning);
    }
  }

  function checkBirthdayHonorsNotify() {
    if (!leaderUnlocked) return;
    const hits = (brothers || []).filter(function (b) { return b && isTodayBirthday(b.birthday); });
    if (!hits.length) return;
    const today = new Date();
    const key = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    if (load(NOTIFY_KEYS.bday) === key) return;
    const names = hits.map(function (b) { return (b.name || 'A brother').split(' ')[0]; }).slice(0, 3).join(', ');
    fireLocalNotification('Birthday', names + (hits.length > 1 ? ' — honor them.' : ' — honor him.'), 'thunder-bday', '/?view=brothers');
    save(NOTIFY_KEYS.bday, key);
  }

  function setupNotificationSystem() {
    // Request permission once (non-blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      // We wait for the first user gesture (reminder button or RSVP) before asking
    }

    // Check immediately on load
    checkAndFireMeetingNotifications();
    try { checkBirthdayHonorsNotify(); } catch (e) {}

    // Re-check every 30 minutes while the app is open
    setInterval(checkAndFireMeetingNotifications, 30 * 60 * 1000);

    // Also re-check when the tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkAndFireMeetingNotifications();
        try { checkBirthdayHonorsNotify(); } catch (e) {}
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
    /* CONSOLIDATED: same gathering ICS + VALARMs as I'm In (no second reminder engine) */
    const btn = document.getElementById('reminder-btn');
    const status = document.getElementById('reminder-status');
    if (!btn) return;

    if (load('reminderSet')) {
      btn.classList.add('set');
      btn.textContent = 'REMINDER ON';
      if (status) {
        status.textContent = 'We’ll ping this phone.';
        status.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', () => {
      try { offerCalendarNow(); } catch (e) {}
      btn.classList.add('set');
      btn.textContent = 'REMINDER ON';
      try { renderRsvp(); } catch (e) {}
      try { tbGlowHit(btn, 'yellow'); } catch (e) {}
      if (status) {
        status.textContent = 'We’ll ping this phone before the gathering.';
        status.classList.remove('hidden');
      }
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
    try { updateOsBadge(); } catch (e) {}
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
    const title = $('#announcements-title');
    if (!announcements.length) {
      el.innerHTML = '';
      if (title) title.classList.add('hidden');
      updateAllNewBadges();
      return;
    }
    if (title) title.classList.remove('hidden');
    el.innerHTML = announcements.map((a, i) => {
      const isNew = isAnnouncementNew(a);
      return `
      <button type="button" class="announcement-card${isNew ? ' announcement-new' : ''}" data-ann-index="${i}" aria-label="Open announcement">
        ${isNew ? '<span class="new-badge new-badge-card">NEW</span>' : ''}
        <span class="announcement-card-label">ANNOUNCEMENT</span>
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
  
  async function inviteOpenChair() {
    const url = (window.location.origin || '') + '/';
    const payload = {
      title: 'Sons of Thunder',
      text: 'There’s an open chair at the table. Thunder doesn’t dull.',
      url: url
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        try { honorFirst('share'); } catch (e) {}
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showInstallToast('Link copied. Send it to a brother.');
      try { honorFirst('share'); } catch (e) {}
    } catch (e2) {
      showInstallToast('Share the app link with a brother.');
    }
  }

  function honorFirst(kind) {
    const key = 'tb_first_' + kind;
    try { if (localStorage.getItem(key)) return; } catch (e) { return; }
    const lines = {
      imin: 'First lock. The table knows your name.',
      share: 'First brother reached. That’s the round table.'
    };
    const line = lines[kind];
    if (!line) return;
    try { localStorage.setItem(key, '1'); } catch (e) {}
    setTimeout(function () {
      try {
        if (typeof window.tbFabSay === 'function') window.tbFabSay(line, 8000);
      } catch (e) {}
    }, 1400);
  }

  /* LOCKED: ~3s reward on profile / memory save — reads TB_CONFIG.SAVE_REWARD */
  function rewardSaveSuccess(kind) {
    try {
      const R = (window.TB_CONFIG && window.TB_CONFIG.SAVE_REWARD) || {};
      if (R.enabled === false) return;
      const hapticMs = typeof R.hapticMs === 'number' ? R.hapticMs : 18;
      const holdMs = Math.max(1200, (typeof R.durationMs === 'number' ? R.durationMs : 3000) - 320);
      const boltSrc = R.boltSrc || 'assets/bolt-only.png';
      try {
        if (window.ThunderFX) {
          if (kind === 'profile') {
            ThunderFX.profileComplete(document.getElementById('save-profile'));
          } else {
            ThunderFX.success(document.getElementById(kind === 'memory' ? 'save-media' : 'save-profile'));
          }
        } else {
          tbFeedback.confirm();
        }
      } catch (e) {
        try { tbFeedback.confirm(); } catch (e2) {}
      }
      let el = document.getElementById('tb-reward');
      if (!el) {
        el = document.createElement('div');
        el.id = 'tb-reward';
        el.className = 'tb-reward hidden';
        el.setAttribute('data-tb-lock', 'save-reward');
        el.setAttribute('aria-live', 'polite');
        el.innerHTML = [
          '<div class="tb-reward-card">',
          '  <img class="tb-reward-bolt" src="' + boltSrc.replace(/"/g, '') + '" alt="" width="56" height="56" />',
          '  <p class="tb-reward-title"></p>',
          '  <p class="tb-reward-sub"></p>',
          '</div>'
        ].join('');
        document.body.appendChild(el);
      }
      const img = el.querySelector('.tb-reward-bolt');
      if (img && boltSrc) img.setAttribute('src', boltSrc);
      const title = el.querySelector('.tb-reward-title');
      const sub = el.querySelector('.tb-reward-sub');
      if (kind === 'memory') {
        if (title) title.textContent = R.memoryTitle || 'MEMORY LOCKED IN';
        if (sub) sub.textContent = R.memorySub || 'Part of the brotherhood record.';
      } else {
        if (title) title.textContent = R.profileTitle || 'PROFILE LOCKED IN';
        if (sub) sub.textContent = R.profileSub || 'Your seat in the roster.';
      }
      el.classList.remove('hidden', 'tb-reward-out');
      void el.offsetWidth;
      el.classList.add('tb-reward-on');
      if (el._tbRewardTimer) clearTimeout(el._tbRewardTimer);
      el._tbRewardTimer = setTimeout(() => {
        el.classList.add('tb-reward-out');
        el.classList.remove('tb-reward-on');
        setTimeout(() => {
          el.classList.add('hidden');
          el.classList.remove('tb-reward-out');
        }, 320);
      }, holdMs);
    } catch (e) {}
  }

  /* LOCKED: Sensory life blood — visual first; vibrate is optional Android only.
     iPhone Safari/PWA: no Vibration API — perceived tactility via press/glow only.
     Never claim the phone vibrated on iOS. */
  const tbFeedback = (function () {
    const last = Object.create(null);
    let audioCtx = null;
    let audioReady = false;
    function sensoryCfg() {
      try { return (window.TB_CONFIG && window.TB_CONFIG.SENSORY) || {}; } catch (e) { return {}; }
    }
    function canVibrate() {
      const S = sensoryCfg();
      if (S.vibrateEnabled === false) return false;
      try {
        return !!(typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function');
      } catch (e) { return false; }
    }
    function debounced(key) {
      const S = sensoryCfg();
      const ms = typeof S.debounceMs === 'number' ? S.debounceMs : 100;
      const now = Date.now();
      if (last[key] && now - last[key] < ms) return true;
      last[key] = now;
      return false;
    }
    function pulse(pattern) {
      if (!canVibrate()) return;
      try {
        if (typeof navigator.vibrate === 'function') {
          navigator.vibrate(0);
          navigator.vibrate(pattern);
        }
      } catch (e) {}
    }
    function reduced() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }
    function getAudio() {
      const S = sensoryCfg();
      if (S.soundEnabled === false) return null;
      if (reduced()) return null;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(function () {});
        audioReady = true;
        return audioCtx;
      } catch (e) { return null; }
    }
    function tone(freq, dur, type, gain, slide) {
      const ctx = getAudio();
      if (!ctx) return;
      try {
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain || 0.07, t0 + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      } catch (e) {}
    }
    function noiseBurst(dur, gain) {
      const ctx = getAudio();
      if (!ctx) return;
      try {
        const n = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, n, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 180;
        bp.Q.value = 0.7;
        const g = ctx.createGain();
        const t0 = ctx.currentTime;
        g.gain.setValueAtTime(gain || 0.04, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(ctx.destination);
        src.start(t0);
        src.stop(t0 + dur + 0.02);
      } catch (e) {}
    }
    try {
      document.addEventListener('touchstart', function () { getAudio(); }, { once: true, passive: true });
      document.addEventListener('click', function () { getAudio(); }, { once: true });
    } catch (e) {}
    return {
      /** Splash-only. Strongest. Visual already owned by CSS; optional 40ms buzz. */
      thunderImpact: function () {
        if (debounced('thunderImpact')) return;
        if (reduced()) return;
        const S = sensoryCfg();
        const ms = typeof S.thunderImpactMs === 'number' ? S.thunderImpactMs : 40;
        pulse([ms, 50, 18]);
        tone(52, 0.12, 'sine', 0.08, 36);
        setTimeout(function () { noiseBurst(0.05, 0.035); }, 40);
      },
      /** Signature wake: short THUD … crack-crack. Android only if vibrate exists. */
      thunderWake: function (level) {
        if (debounced('thunderWake')) return;
        if (reduced()) return;
        if (level === 'soft') {
          pulse([12, 40, 18]);
          tone(62, 0.07, 'sine', 0.05, 40);
          return;
        }
        pulse([28, 55, 14, 40, 18]);
        tone(48, 0.14, 'sine', 0.09, 32);
        setTimeout(function () { noiseBurst(0.06, 0.04); }, 55);
      },
      /** Primary CTAs: I'm In, Save, Add Memory, Share, Text a Leader */
      press: function (el) {
        if (debounced('press')) return;
        if (el && el.classList && !reduced()) {
          el.classList.add('tb-press');
          setTimeout(() => { try { el.classList.remove('tb-press'); } catch (e) {} }, 140);
        }
        const S = sensoryCfg();
        pulse(typeof S.pressMs === 'number' ? S.pressMs : 10);
      },
      /** After real success only */
      confirm: function () {
        if (debounced('confirm')) return;
        const S = sensoryCfg();
        pulse([12, 36, 22]);
        tone(70, 0.09, 'sine', 0.07, 44);
        noiseBurst(0.04, 0.03);
      },
      /** Failed save / missing field / upload error */
      warningOrError: function (el) {
        if (debounced('warning')) return;
        if (el && el.classList && !reduced()) {
          el.classList.remove('tb-warn-shake');
          void el.offsetWidth;
          el.classList.add('tb-warn-shake');
          setTimeout(() => { try { el.classList.remove('tb-warn-shake'); } catch (e) {} }, 420);
        }
        const S = sensoryCfg();
        const pat = Array.isArray(S.warningPattern) ? S.warningPattern : [25, 60, 35];
        pulse(pat);
        tone(160, 0.11, 'triangle', 0.045, 90);
      },
      /** Discrete selects: chips, toggles, swipe commit */
      selection: function () {
        if (debounced('selection')) return;
        const S = sensoryCfg();
        pulse(typeof S.selectionMs === 'number' ? S.selectionMs : 8);
      },
      /** Back-compat shim — prefer semantic methods */
      raw: function (ms) {
        pulse(typeof ms === 'number' ? ms : 12);
      }
    };
  })();

  function haptic(ms) {
    /* deprecated scatter path — routes to soft press-scale pulse */
    try { tbFeedback.raw(ms); } catch (e) {}
  }

  /**
   * ThunderFX — cross-platform effect orchestrator
   * Principle: TOUCH → RESPONSE → ENERGY → STATE CHANGE → SETTLE
   * Android: motion + light + short vibrate (when API exists)
   * iPhone: motion + light + spring (NO vibrate hacks)
   * Effects NEVER determine success — only represent real state
   * STATE > EFFECT
   */

  /* ── HERO EFFECTS (scarce) ─────────────────────────────────────
     PROFILE FIREWORKS — only after authoritative profile save success
     APP IGNITION FEEL — cold splash only; laser streaks removed, haptic kept
     Never stack on ordinary success / resume / rerender
     ───────────────────────────────────────────────────────────── */
  function prefersReducedMotionHero() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  function runThunderFireworks() {
    try {
      if (document.getElementById('tb-fireworks')) return;
      const reduced = prefersReducedMotionHero();
      const layer = document.createElement('div');
      layer.id = 'tb-fireworks';
      layer.className = 'tb-hero-layer tb-fireworks-layer';
      layer.setAttribute('aria-hidden', 'true');
      if (reduced) {
        layer.classList.add('tb-hero-reduced');
        document.body.appendChild(layer);
        setTimeout(() => { try { layer.remove(); } catch (e) {} }, 700);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.className = 'tb-hero-canvas';
      layer.appendChild(canvas);
      document.body.appendChild(layer);
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, h = 0;
      function size() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      size();
      const bursts = [];
      const sparks = [];
      const origins = [
        [w * 0.28, h * 0.62],
        [w * 0.72, h * 0.55],
        [w * 0.50, h * 0.70],
        [w * 0.38, h * 0.48],
        [w * 0.62, h * 0.66]
      ];
      const colors = ['#FEF105', '#FFD54A', '#FFF8C4', '#E8B800', '#FFFFFF', '#E30600'];
      function spawnBurst(ox, oy, delay) {
        setTimeout(() => {
          const n = 14 + Math.floor(Math.random() * 10);
          for (let i = 0; i < n; i++) {
            const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.35;
            const spd = 2.2 + Math.random() * 3.8;
            sparks.push({
              x: ox, y: oy,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 0.8,
              life: 1,
              decay: 0.018 + Math.random() * 0.012,
              r: 1.2 + Math.random() * 2.2,
              c: colors[(Math.random() * 5) | 0]
            });
          }
          // rare red accent
          if (Math.random() < 0.35) {
            const ang = Math.random() * Math.PI * 2;
            sparks.push({
              x: ox, y: oy, vx: Math.cos(ang) * 4, vy: Math.sin(ang) * 4,
              life: 1, decay: 0.025, r: 2, c: '#E30600'
            });
          }
        }, delay);
      }
      origins.forEach((o, i) => spawnBurst(o[0], o[1], i * 90));
      const t0 = performance.now();
      let raf = 0;
      function frame(now) {
        const elapsed = now - t0;
        ctx.clearRect(0, 0, w, h);
        // slight dark veil
        ctx.fillStyle = 'rgba(0,0,0,' + (elapsed < 200 ? 0.18 : Math.max(0, 0.22 - (elapsed - 200) / 4000)) + ')';
        ctx.fillRect(0, 0, w, h);
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.06;
          s.vx *= 0.99;
          s.life -= s.decay;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
          ctx.fill();
          // trail
          ctx.globalAlpha = s.life * 0.35;
          ctx.beginPath();
          ctx.arc(s.x - s.vx * 2, s.y - s.vy * 2, s.r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (elapsed < 1100 || sparks.length) {
          raf = requestAnimationFrame(frame);
        } else {
          try { layer.remove(); } catch (e) {}
        }
      }
      raf = requestAnimationFrame(frame);
      setTimeout(() => {
        try { cancelAnimationFrame(raf); } catch (e) {}
        try { layer.remove(); } catch (e) {}
      }, 1400);
    } catch (e) {}
  }

  function runThunderLaserIgnition() {
    /* Lasers removed (20260816-LOCKED4). Keep ignition *feel* only:
       splash motion/CSS unchanged; thunderImpact + optional Android vibrate. */
    try {
      if (prefersReducedMotionHero()) {
        try { if (window.tbFeedback) tbFeedback.thunderImpact(); } catch (e) {}
        return;
      }
      try { if (window.tbFeedback) tbFeedback.thunderImpact(); } catch (e) {}
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          setTimeout(() => { try { navigator.vibrate(12); } catch (e) {} }, 180);
          setTimeout(() => { try { navigator.vibrate(12); } catch (e) {} }, 320);
          setTimeout(() => { try { navigator.vibrate(28); } catch (e) {} }, 520);
        }
      } catch (e) {}
    } catch (e) {}
  }


  const ThunderFX = (function () {
    const once = Object.create(null);
    function reduced() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }
    function onceKey(key) {
      if (once[key]) return true;
      once[key] = true;
      return false;
    }
    function visualPress(el) {
      if (!el || reduced()) return;
      try {
        el.classList.add('tb-press');
        setTimeout(() => { try { el.classList.remove('tb-press'); } catch (e) {} }, 140);
      } catch (e) {}
    }
    function visualGlow(el, tone) {
      try { if (typeof tbGlowHit === 'function') tbGlowHit(el, tone || 'yellow'); } catch (e) {}
    }
    return {
      capabilities: function () {
        let vibrate = false;
        try {
          vibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
        } catch (e) {}
        return {
          vibrate: vibrate,
          reducedMotion: reduced(),
          // iOS Safari/WebKit: vibrate NOT SUPPORTED (W3C/WebKit oppose). Android Chrome: SUPPORTED.
          platformNote: vibrate ? 'tactile+visual' : 'visual-parity-only'
        };
      },
      /** Level 1 — major control touch */
      tap: function (el) {
        try { tbFeedback.press(el); } catch (e) { visualPress(el); }
        visualGlow(el, 'yellow');
      },
      /** Level 2 — discrete selection */
      select: function (el) {
        try { tbFeedback.selection(); } catch (e) {}
        visualGlow(el, 'yellow');
      },
      /** Level 3 signature — I'm In lock (caller must confirm save succeeded first) */
      lockedIn: function (el, card) {
        /* Vault close — bolt through the button, then yellow. No card box-glow. */
        try { tbFeedback.confirm(); } catch (e) {}
        try { if (window.tbFeedback) tbFeedback.thunderImpact(); } catch (e) {}
        if (el && !reduced()) {
          try {
            el.classList.remove('tb-press', 'lock-pulse', 'commit-strike', 'tfx-ios-boost', 'tb-glow-hit', 'tb-glow-hit-yellow', 'imin-strike', 'imin-afterglow');
            void el.offsetWidth;
          } catch (e) {}
          el.classList.add('imin-strike');
          setTimeout(function () {
            try { el.classList.remove('imin-strike'); } catch (e) {}
          }, 480);
          setTimeout(function () {
            try {
              el.classList.add('imin-afterglow');
              setTimeout(function () { try { el.classList.remove('imin-afterglow'); } catch (e2) {} }, 1100);
            } catch (e) {}
          }, 400);
        }
        try { if (typeof window.tbFabImInLock === 'function') window.tbFabImInLock(); } catch (e) {}
        if (card && !reduced()) {
          try { card.classList.add('commit-energized'); } catch (e) {}
        }
      },
      /** Level 2/3 — real success only (memory, profile, alerts) */
      success: function (el) {
        try { tbFeedback.confirm(); } catch (e) {}
        visualGlow(el, 'yellow');
        if (el && !reduced()) {
          el.classList.remove('tfx-success-flash');
          void el.offsetWidth;
          el.classList.add('tfx-success-flash');
          setTimeout(() => { try { el.classList.remove('tfx-success-flash'); } catch (e) {} }, 500);
        }
      },
      /** Level 2 warning — recoverable */
      warning: function (el) {
        try { tbFeedback.warningOrError(el); } catch (e) {}
      },
      /** Level 3 — first real standalone install (once) */
      installComplete: function () {
        if (onceKey('installComplete')) return;
        try { tbFeedback.thunderImpact(); } catch (e) {}
      },
      /** Level 2 — tour finished this version (once per key) */
      tourComplete: function (versionKey) {
        const k = 'tour:' + (versionKey || 'default');
        if (onceKey(k)) return;
        try { tbFeedback.confirm(); } catch (e) {}
      },
      /** HERO — profile save only after authoritative success */
      profileComplete: function (el) {
        try { tbFeedback.confirm(); } catch (e) {}
        // Celebratory short pattern on Android only
        try {
          if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate([14, 40, 14, 40, 30]);
          }
        } catch (e) {}
        if (el && !reduced()) {
          try {
            el.classList.remove('tfx-success-flash');
            void el.offsetWidth;
            el.classList.add('tfx-success-flash');
            setTimeout(() => { try { el.classList.remove('tfx-success-flash'); } catch (e) {} }, 500);
          } catch (e) {}
        }
        runThunderFireworks();
      },
      /** HERO — cold launch only (caller must gate with splash session) */
      appIgnition: function () {
        if (onceKey('appIgnitionSession')) return;
        runThunderLaserIgnition();
      },
      /**
       * THUNDER WAKE — signature activation (not every keystroke).
       * full: first open this session; soft: reopen; none for follow-up sends.
       * Android: short pattern via tbFeedback. iPhone: visual only (honest).
       */
      thunderWake: function (el, level) {
        level = level || 'full';
        const reduced = (function () {
          try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
        })();
        try {
          if (window.tbFeedback && tbFeedback.thunderWake) tbFeedback.thunderWake(level === 'soft' ? 'soft' : 'full');
          else if (window.tbFeedback) tbFeedback.thunderImpact();
        } catch (e) {}
        if (!el) el = document.getElementById('thunder-fab');
        if (!el || reduced) return;
        try {
          el.classList.remove('tb-thunder-wake', 'tb-thunder-wake-soft');
          void el.offsetWidth;
          el.classList.add(level === 'soft' ? 'tb-thunder-wake-soft' : 'tb-thunder-wake');
          setTimeout(function () {
            try { el.classList.remove('tb-thunder-wake', 'tb-thunder-wake-soft'); } catch (e2) {}
          }, level === 'soft' ? 420 : 900);
        } catch (e) {}
        // Panel energy ring once on full wake
        if (level !== 'soft') {
          try {
            const panel = document.getElementById('thunder-modal') || document.querySelector('.thunder-panel');
            if (panel) {
              panel.classList.remove('tb-thunder-panel-wake');
              void panel.offsetWidth;
              panel.classList.add('tb-thunder-panel-wake');
              setTimeout(function () {
                try { panel.classList.remove('tb-thunder-panel-wake'); } catch (e3) {}
              }, 1000);
            }
          } catch (e) {}
        }
      }
    };
  })();
  try { window.ThunderFX = ThunderFX; } catch (e) {}



  // LOCKED: sensory delegation — primary CTAs share press (debounced inside tbFeedback)
  if (!window.__tbSensoryDelegation) {
    window.__tbSensoryDelegation = true;
    document.addEventListener('click', (ev) => {
      /* RSVP excluded on purpose: I'm In owns press → save → ThunderFX.lockedIn.
         Capture-phase press left tb-press transform:!important on the button and
         killed commit-strike scale keyframes mid-flight. */
      const t = ev.target && ev.target.closest && ev.target.closest(
        '.btn-text-leader, #save-profile, #save-media, .install-card-btn, #brother-share-contact, #thunder-fab'
      );
      if (!t) return;
      if (t.closest && t.closest('#rsvp-btn, .btn-rsvp')) return;
      try { tbFeedback.press(t); } catch (e) {}
    }, true);
  }


  // ---------- ELASTIC SWIPE (bump + snap-back, shared) ----------
  function prefersReducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  function elasticClear(el) {
    if (!el) return;
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
    el.classList.remove('elastic-dragging', 'elastic-settling', 'overlay-dismissing');
    setUnderlayDepth(false);
  }

  // Underlay depth while a sheet is dragged (gesture-linked parallax lite)
  function setUnderlayDepth(active, progress) {
    try {
      const app = document.getElementById('app') || document.querySelector('.app') || document.body;
      if (!app) return;
      if (prefersReducedMotion() || !active) {
        app.classList.remove('tb-underlay-depth');
        app.style.removeProperty('--tb-depth');
        return;
      }
      const p = Math.max(0, Math.min(1, progress == null ? 0.35 : progress));
      app.classList.add('tb-underlay-depth');
      app.style.setProperty('--tb-depth', String(p));
    } catch (e) {}
  }

  function elasticSnapHome(el) {
    try {
      document.querySelectorAll('.nav-item.nav-peek').forEach(function (n) { n.classList.remove('nav-peek'); });
    } catch (e) {}
    if (!el) return;
    el.classList.remove('elastic-dragging');
    el.classList.add('elastic-settling');
    // Springier settle: overshoot-ish curve, still short (Goldilocks)
    el.style.transition = 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.22s ease';
    el.style.transform = 'translate3d(0,0,0)';
    el.style.opacity = '';
    const done = () => elasticClear(el);
    el.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 320);
  }

  /**
   * Shared elastic horizontal swipe.
   * opts:
   *  getEl() -> element to move (defaults to root)
   *  canPrev / canNext -> bool or functions
   *  onPrev / onNext -> commit callbacks
   *  onDown -> optional vertical dismiss (dy)
   *  blocked(target) -> start blocked
   *  maxDrag -> px cap for drag preview (default 72)
   *  edgeMax -> px overshoot at ends (default 28)
   */
  function bindElasticSwipe(root, opts) {
    if (!root || root.dataset.elasticBound === '1') return;
    root.dataset.elasticBound = '1';
    opts = opts || {};
    const DIST = opts.dist != null ? opts.dist : 48;
    const RATIO = opts.ratio != null ? opts.ratio : 1.15;
    const VELOCITY = opts.velocity != null ? opts.velocity : 0.42;
    const MAX = opts.maxDrag != null ? opts.maxDrag : 72;
    const EDGE = opts.edgeMax != null ? opts.edgeMax : 28;
    const FOLLOW = opts.follow != null ? opts.follow : 0.55;
    const DOWN = opts.onDownDist != null ? opts.onDownDist : 64;

    let sx = 0, sy = 0, st = 0, lx = 0, lt = 0, tracking = false, axis = null, felt = false;

    function swallowClick() {
      const eat = function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest('.bottom-nav, .nav-item, #thunder-fab')) return;
        ev.preventDefault();
        ev.stopPropagation();
        document.removeEventListener('click', eat, true);
      };
      document.addEventListener('click', eat, true);
      setTimeout(function () { document.removeEventListener('click', eat, true); }, 480);
    }

    function moveEl() {
      return (typeof opts.getEl === 'function' ? opts.getEl() : null) || root;
    }
    function canPrev() {
      const v = typeof opts.canPrev === 'function' ? opts.canPrev() : opts.canPrev;
      return !!v;
    }
    function canNext() {
      const v = typeof opts.canNext === 'function' ? opts.canNext() : opts.canNext;
      return !!v;
    }

    root.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) { tracking = false; return; }
      if (typeof opts.blocked === 'function' && opts.blocked(e.target)) { tracking = false; return; }
      if (root.classList && root.classList.contains('is-zoomed')) { tracking = false; return; }
      const moving = (typeof opts.getEl === 'function' ? opts.getEl() : null) || root;
      if (moving && moving.classList && moving.classList.contains('is-zoomed')) { tracking = false; return; }
      tracking = true;
      axis = null;
      felt = false;
      sx = lx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = lt = Date.now();
      const el = moveEl();
      if (el) {
        el.classList.remove('elastic-settling');
        el.style.transition = 'none';
      }
    }, { passive: true });

    root.addEventListener('touchmove', (e) => {
      if (!tracking || !e.touches || !e.touches[0]) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      lx = x; lt = Date.now();
      const dx = x - sx;
      const dy = y - sy;
      if (axis == null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
      }
      if (axis === 'x' && Math.abs(dx) > 18 && e.cancelable) {
        try { e.preventDefault(); } catch (e2) {}
      }
      if (prefersReducedMotion()) return;
      const el = moveEl();
      if (!el) return;
      // Vertical dismiss preview when onDown is wired (sheet follows finger)
      if (opts.onDown && axis === 'y' && dy > 0) {
        if (typeof opts.canDown === 'function' && !opts.canDown()) return;
        el.classList.add('elastic-dragging');
        const ty = Math.min(240, dy * 0.88);
        const op = Math.max(0.28, 1 - ty / 280);
        el.style.transform = 'translate3d(0,' + ty + 'px,0)';
        el.style.opacity = String(op);
        setUnderlayDepth(true, Math.min(1, ty / 140));
        return;
      }
      if (axis !== 'x') return;
      // live horizontal drag with resistance
      el.classList.add('elastic-dragging');
      let tx = dx;
      if (dx > 0 && !canPrev()) tx = Math.min(EDGE, dx * 0.28);
      else if (dx < 0 && !canNext()) tx = Math.max(-EDGE, dx * 0.28);
      else tx = Math.max(-MAX, Math.min(MAX, dx * FOLLOW));
      el.style.opacity = '';
      el.style.transform = 'translate3d(' + tx + 'px,0,0)';
      if (!felt && Math.abs(dx) > 16) {
        felt = true;
        try { tbFeedback.selection(); } catch (e2) {}
      }
      if (typeof opts.onDrag === 'function') {
        try { opts.onDrag(tx, dx); } catch (e2) {}
      }
    }, { passive: false });

    root.addEventListener('touchcancel', () => {
      tracking = false;
      try { elasticSnapHome(moveEl()); } catch (e) {}
    });

    root.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches && e.changedTouches[0];
      const el = moveEl();
      if (!t) { elasticSnapHome(el); return; }
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const dt = Math.max(1, (lt || Date.now()) - st);
      const vx = absX / dt;

      const canDown = typeof opts.canDown === 'function' ? opts.canDown() : true;
      const vy = absY / dt;
      const flickDown = !!(opts.onDown && canDown && dy > 0 && vy >= 0.38 && absY > 24 && absY > absX * 0.85);
      const pullDown = !!(opts.onDown && canDown && dy >= DOWN && absY > absX);
      if (flickDown || pullDown) {
        try { tbFeedback.selection(); } catch (e) {}
        if (el && !prefersReducedMotion()) {
          el.classList.add('overlay-dismissing');
          el.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease';
          el.style.transform = 'translate3d(0, 32%, 0)';
          el.style.opacity = '0.15';
          setTimeout(() => { elasticClear(el); opts.onDown(); }, 200);
        } else {
          elasticClear(el);
          opts.onDown();
        }
        return;
      }

      if (axis === 'y') { elasticSnapHome(el); return; }

      const fast = vx >= VELOCITY && absX > 22;
      const committed = fast || absX >= DIST;
      if (!committed || absX < absY * RATIO) {
        elasticSnapHome(el);
        return;
      }

      if (dx < 0 && canNext() && typeof opts.onNext === 'function') {
        try { swallowClick(); } catch (e) {}
        try { tbFeedback.confirm(); } catch (e) {}
        if (el && !prefersReducedMotion()) {
          el.style.transition = 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.14s ease';
          el.style.transform = 'translate3d(-18%,0,0)';
          el.style.opacity = '0.35';
          setTimeout(() => { elasticClear(el); opts.onNext(); }, 140);
        } else {
          elasticClear(el);
          opts.onNext();
        }
        return;
      }
      if (dx > 0 && canPrev() && typeof opts.onPrev === 'function') {
        try { swallowClick(); } catch (e) {}
        try { tbFeedback.confirm(); } catch (e) {}
        if (el && !prefersReducedMotion()) {
          el.style.transition = 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.14s ease';
          el.style.transform = 'translate3d(18%,0,0)';
          el.style.opacity = '0.35';
          setTimeout(() => { elasticClear(el); opts.onPrev(); }, 140);
        } else {
          elasticClear(el);
          opts.onPrev();
        }
        return;
      }
      // edge bump — spring home
      elasticSnapHome(el);
    }, { passive: true });

    root.addEventListener('touchcancel', () => {
      tracking = false;
      elasticSnapHome(moveEl());
    }, { passive: true });
  }

  /**
   * Double-tap zoom on a photo. Second tap restores. Blocks swipe while live.
   */
  function bindDoubleTapZoom(root, getImg) {
    if (!root || root.dataset.dtZoom === '1') return;
    root.dataset.dtZoom = '1';
    let lastT = 0, lastX = 0, lastY = 0, zoomed = false;
    function imgEl() {
      return typeof getImg === 'function' ? getImg() : (root.querySelector && root.querySelector('img'));
    }
    function resetZoom() {
      zoomed = false;
      root.classList.remove('is-zoomed');
      const img = imgEl();
      if (img) {
        img.style.transition = 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)';
        img.style.transform = 'scale(1)';
        setTimeout(function () {
          if (!zoomed && img) {
            img.style.transition = '';
            img.style.transform = '';
            img.style.transformOrigin = '';
          }
        }, 220);
      }
    }
    root.__tbResetZoom = resetZoom;
    root.addEventListener('touchend', function (e) {
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      if (e.target && e.target.closest && e.target.closest('button, a, input, textarea, video, .memory-viewer-close')) return;
      const t = e.changedTouches[0];
      const now = Date.now();
      const dt = now - lastT;
      const dist = Math.hypot(t.clientX - lastX, t.clientY - lastY);
      lastT = now;
      lastX = t.clientX;
      lastY = t.clientY;
      if (!(dt > 40 && dt < 320 && dist < 40)) return;
      try { e.preventDefault(); } catch (err) {}
      const img = imgEl();
      if (!img || (img.tagName && img.tagName.toLowerCase() === 'video')) return;
      if (zoomed) {
        resetZoom();
        try { tbFeedback.selection(); } catch (err) {}
        return;
      }
      if (prefersReducedMotion()) return;
      const r = img.getBoundingClientRect();
      if (!r.width || !r.height) return;
      let px = ((t.clientX - r.left) / r.width) * 100;
      let py = ((t.clientY - r.top) / r.height) * 100;
      px = Math.max(8, Math.min(92, px));
      py = Math.max(8, Math.min(92, py));
      img.style.transformOrigin = px + '% ' + py + '%';
      img.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
      img.style.transform = 'scale(2.2)';
      zoomed = true;
      root.classList.add('is-zoomed');
      try { tbFeedback.selection(); } catch (err) {}
    }, { passive: false });
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
    try { tbFeedback.press(); } catch (e) {}
    bindInfoDetail();
  }

  function closeInfoDetail() {
    const detail = $('#info-detail');
    if (!detail || detail.classList.contains('hidden')) return;
    releaseFocusAndZoom();
    detail.classList.add('hidden');
    detail.setAttribute('aria-hidden', 'true');
    unlockBodyIfClear();
    try { tbFeedback.selection(); } catch (e) {}
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
    // Permanent: every window supports swipe-down dismiss (same elastic path as brother/memory)
    bindElasticSwipe(detail, {
      getEl: () => detail.querySelector('.info-detail-panel') || detail,
      onDown: () => closeInfoDetail(),
      onDownDist: 52,
      follow: 0.88,
      blocked: (t) => !!(t && t.closest && t.closest('.info-detail-close, button, a, input, textarea'))
    });
    document.addEventListener('keydown', (e) => {
      if (!detail.classList.contains('hidden') && e.key === 'Escape') closeInfoDetail();
    });
  }

  /**
   * Permanent UX law: every overlay "window" can be swipe-closed (down).
   * X + backdrop + Escape still work. Inputs/buttons block gesture start.
   * Tour tip is NOT a dismissible window — excluded.
   */
  function overlayPanel(el) {
    if (!el) return el;
    return el.querySelector(
      '.cal-confirm-panel, .brother-detail-panel, .info-detail-panel, .modal-content, .ios-install-panel, .auth-card, .auth-gate-card'
    ) || el.firstElementChild || el;
  }
  function bindSwipeCloseAllWindows() {
    const specs = [
      { id: 'install-modal', close: () => closeModal('install-modal') },
      { id: 'profile-modal', close: () => closeModal('profile-modal') },
      { id: 'qr-explainer-modal', close: () => closeModal('qr-explainer-modal') },
      { id: 'contact-qr-modal', close: () => closeModal('contact-qr-modal') },
      { id: 'media-modal', close: () => closeModal('media-modal') },
      { id: 'thunder-modal', close: () => closeModal('thunder-modal') },
      { id: 'admin-ann-modal', close: () => closeModal('admin-ann-modal') },
      { id: 'admin-events-modal', close: () => closeModal('admin-events-modal') },
      { id: 'admin-code-modal', close: () => closeModal('admin-code-modal') },
      { id: 'admin-push-modal', close: () => closeModal('admin-push-modal') },
      { id: 'admin-room-modal', close: () => closeModal('admin-room-modal') },
      { id: 'admin-sms-modal', close: () => closeModal('admin-sms-modal') },
      { id: 'admin-lastfire-modal', close: () => closeModal('admin-lastfire-modal') },
      { id: 'auth-gate', close: () => { try { closeAuthGate(); } catch (e) {} } },
      { id: 'ios-install-overlay', close: () => {
        const el = document.getElementById('ios-install-overlay');
        if (el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); unlockBodyIfClear(); }
      }},
      { id: 'inapp-install-overlay', close: () => {
        const el = document.getElementById('inapp-install-overlay');
        if (el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); unlockBodyIfClear(); }
      }},
      { id: 'cal-confirm-sheet', close: () => { try { closeCalConfirmSheet(); } catch (e) {} } },
      { id: 'imin-a2hs-sheet', close: () => { try { closeImInA2hsSheet(); } catch (e) {} } },
      { id: 'axum-drop', close: () => { try { closeAxumDrop(); } catch (e) {} } },
      { id: 'axum-card', close: () => { try { closeAxumCard(); } catch (e) {} } },
      { id: 'raffle-live', close: () => { try { closeRaffleLive(); } catch (e) {} } }
    ];
    specs.forEach(({ id, close }) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.swipeClose === '1') return;
      el.dataset.swipeClose = '1';
      bindElasticSwipe(el, {
        getEl: () => overlayPanel(el),
        onDown: close,
        onDownDist: 52,
        follow: 0.88,
        blocked: (t) => !!(t && t.closest && t.closest(
          'input, textarea, select, button, a, video, .modal-close, [data-close]'
        ))
      });
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

  function applyChairVisibility(on) {
    chairUnlocked = !!on;
    leaderUnlocked = !!on;
    const zone = document.querySelector('.admin-zone');
    const tools = document.getElementById('leader-tools');
    const unlockBtn = document.getElementById('leader-unlock-btn');
    if (on) {
      if (zone) zone.classList.remove('hidden');
      if (tools) tools.classList.remove('hidden');
      if (unlockBtn) unlockBtn.classList.add('hidden');
    } else {
      if (zone) zone.classList.add('hidden');
      if (tools) tools.classList.add('hidden');
      if (unlockBtn) unlockBtn.classList.add('hidden');
    }
  }

  async function refreshChairMode() {
    try {
      if (typeof isSignedIn !== 'function' || !isSignedIn()) {
        applyChairVisibility(false);
        return false;
      }
      const sb = typeof getSb === 'function' ? getSb() : null;
      const user = typeof currentUser === 'function' ? currentUser() : null;
      if (!sb || !user || !user.id) {
        applyChairVisibility(false);
        return false;
      }
      let ok = false;
      try {
        const rpc = await sb.rpc('is_sot_leader');
        if (!rpc.error && rpc.data === true) ok = true;
      } catch (e0) {}
      if (!ok) {
        try {
          const q = await sb.from('app_members').select('role,active').eq('user_id', user.id).maybeSingle();
          if (!q.error && q.data) {
            const role = String(q.data.role || '').toLowerCase();
            const active = q.data.active !== false && q.data.active !== 0;
            if (active && (role === 'leader' || role === 'admin')) ok = true;
          }
        } catch (e1) {}
      }
      applyChairVisibility(ok);
      return ok;
    } catch (e) {
      applyChairVisibility(false);
      return false;
    }
  }

  function requireLeader() {
    if (chairUnlocked) return true;
    try {
      if (typeof showInstallToast === 'function') showInstallToast('Sign in on Brothers');
    } catch (e) {}
    return false;
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


  // ---------- CONTACT SHARE (vCard + Share sheet + QR) ----------
  function digitsOnly(phone) {
    return String(phone || '').replace(/\D/g, '');
  }

  function formatPhoneDisplay(phone) {
    const d = digitsOnly(phone);
    if (d.length === 10) return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    if (d.length === 11 && d[0] === '1') return '+1 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7);
    return String(phone || '').trim();
  }

  function buildVCard(brother, opts) {
    const name = String((brother && brother.name) || 'Brother').trim() || 'Brother';
    const phone = digitsOnly(brother && brother.phone);
    const bio = String((brother && brother.bio) || '').replace(/[\r\n]+/g, ' ').trim();
    const forQr = !!(opts && opts.forQr);
    // vCard 3.0 — best compatibility for iPhone Camera + Android
    // QR uses a short payload so modules stay dense and scannable
    let lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + name,
      'N:;' + name + ';;;'
    ];
    if (phone) {
      let tel = phone;
      if (tel.length === 10) tel = '1' + tel;
      if (tel.charAt(0) !== '+') tel = '+' + tel;
      lines.push('TEL;TYPE=CELL:' + tel);
    }
    if (!forQr) {
      lines.push('ORG:Sons of Thunder');
      lines.push('URL:' + publicUrl('/'));
      if (bio) lines.push('NOTE:' + bio.replace(/,/g, '\\,'));
    }
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }

  function vcardFile(brother) {
    const vcf = buildVCard(brother);
    const safe = String((brother && brother.name) || 'brother').replace(/[^\w\-]+/g, '_').slice(0, 24) || 'brother';
    return new File([vcf], safe + '-sons-of-thunder.vcf', { type: 'text/vcard' });
  }

  function downloadVCard(brother) {
    const file = vcardFile(brother);
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 800);
  }

  async function shareContact(brother) {
    if (!brother || !digitsOnly(brother.phone)) {
      try { showInstallToast('Add a number, then share.'); } catch (e) {}
      try { openProfileEditor(); } catch (e) {}
      return false;
    }
    const file = vcardFile(brother);
    const title = (brother.name || 'Brother') + ' — Sons of Thunder';
    const text = (brother.name || 'Brother') + (brother.phone ? ' · ' + formatPhoneDisplay(brother.phone) : '');
    // Prefer native Share sheet with the .vcf — on iPhone this surfaces AirDrop / Messages / Mail
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        try { honorFirst('share'); } catch (e) {}
        return true;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      console.warn('share files failed', e);
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: text + '\n\nSons of Thunder contact'
        });
        return true;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return false;
      console.warn('share text failed', e);
    }
    // Fallback: download .vcf so they can AirDrop / Nearby Share from Files
    downloadVCard(brother);
    alert('Contact file saved. Open it or share from Files (AirDrop / Nearby Share).');
    return true;
  }

  // Contact QR: remote PNG first (reliable fingerprint), local lib fallback,
  // loading state + timeout so brothers never stare at a blank white square.
  let qrcodeInstance = null;
  const qrLoadTimers = new WeakMap();

  function clearQrTarget(el) {
    const target = el || $('#qr-code-target') || $('#brother-qr-target');
    if (target) {
      const t = qrLoadTimers.get(target);
      if (t) {
        clearTimeout(t);
        qrLoadTimers.delete(target);
      }
      target.innerHTML = '';
    }
    qrcodeInstance = null;
  }

  function qrFailMessage(target) {
    if (!target) return;
    target.innerHTML =
      '<div class="qr-fail-msg" style="padding:16px 12px;font-size:13px;line-height:1.4;color:#333;text-align:center;">' +
      'QR unavailable right now.<br><strong>Use SHARE CONTACT</strong> below.</div>';
  }

  /* QR LAW: the only painter. Profile, contact modal, Axum, anything future. */
  function paintThunderQr(target, text, dim) {
    if (!target || !text || typeof QRCode === 'undefined') return false;
    const hold = document.createElement('div');
    hold.style.cssText = 'position:absolute;left:-9999px;top:0;width:8px;height:8px;overflow:hidden;';
    document.body.appendChild(hold);
    try {
      const inst = new QRCode(hold, {
        text: String(text),
        width: 8,
        height: 8,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
      const matrix = inst._oQRCode;
      if (!matrix || typeof matrix.getModuleCount !== 'function') {
        hold.remove();
        return false;
      }
      const n = matrix.getModuleCount();
      const quiet = 4;
      const modules = n + quiet * 2;
      const px = Math.max(4, Math.floor((dim * (window.devicePixelRatio || 2)) / modules));
      const size = modules * px;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.style.cssText = 'width:' + dim + 'px;height:' + dim + 'px;display:block;image-rendering:pixelated;';
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#000000';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix.isDark(r, c)) {
            ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
          }
        }
      }
      target.innerHTML = '';
      target.style.cssText = 'width:' + dim + 'px;height:' + dim + 'px;background:#fff;display:block;margin:0 auto;position:relative;z-index:1;';
      target.appendChild(canvas);
      hold.remove();
      qrcodeInstance = inst;
      return true;
    } catch (e) {
      try { hold.remove(); } catch (e2) {}
      console.warn('Thunder QR failed', e);
      return false;
    }
  }
  try { window.paintThunderQr = paintThunderQr; } catch (e) {}

  function paintLocalQr(target, vcard, dim) {
    return paintThunderQr(target, vcard, dim);
  }

  function renderBrotherQR(vcard, targetEl, size) {
    const target = targetEl || $('#qr-code-target') || $('#brother-qr-target');
    if (!target) return false;
    const dim = size || 240;
    const prev = qrLoadTimers.get(target);
    if (prev) clearTimeout(prev);
    if (paintThunderQr(target, vcard, dim)) return true;
    qrFailMessage(target);
    return false;
  }

  function showContactQR(brother) {
    if (!brother || !digitsOnly(brother.phone)) {
      try { showInstallToast('Add a number, then share.'); } catch (e) {}
      try { openProfileEditor(); } catch (e) {}
      return;
    }
    const vcard = buildVCard(brother, { forQr: true });
    const title = $('#contact-qr-title');
    if (title) title.textContent = ((brother.name || 'BROTHER') + ' · QR').toUpperCase();
    const shareBtn = $('#contact-qr-share-btn');
    if (shareBtn) {
      shareBtn.onclick = () => shareContact(brother);
    }
    openModal('contact-qr-modal');
    // Render after modal is visible so layout size is correct
    requestAnimationFrame(() => {
      renderBrotherQR(vcard, $('#qr-code-target'), 260);
    });
  }

  function renderInlineProfileQR(brother) {
    const wrap = $('#brother-qr-wrap');
    const target = $('#brother-qr-target');
    if (!wrap || !target) return;
    if (!brother || !digitsOnly(brother.phone) || !(brother.name || '').trim()) {
      wrap.classList.add('hidden');
      clearQrTarget(target);
      return;
    }
    wrap.classList.remove('hidden');
    const vcard = buildVCard(brother, { forQr: true });
    // Wait until panel is laid out (was hidden) so canvas gets real dimensions
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        renderBrotherQR(vcard, target, 240);
      });
    });
  }

  function updateMyQrButtonVisibility() {
    const btn = $('#profile-my-qr');
    const unlock = $('#profile-qr-unlock');
    const me = (brothers || []).find(b => b.id === myProfileId);
    const savedWithPhone = !!(me && digitsOnly(me.phone) && me.name);
    if (btn) btn.classList.toggle('hidden', !savedWithPhone);
    if (unlock) unlock.classList.toggle('hidden', savedWithPhone);
  }

  let brotherDetailIndex = -1;

  function openBrotherDetail(index) {
    const list = brothers || [];
    if (!list.length || index < 0 || index >= list.length) return;
    const b = list[index];
    brotherDetailIndex = index;
    const detail = $('#brother-detail');
    if (!detail) return;
    const initials = (b.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
    const hasPhoto = b.photo && (b.photo.startsWith('data:') || b.photo.startsWith('http'));
    const photoEl = $('#brother-detail-photo');
    if (photoEl) {
      photoEl.style.cssText = 'width:88px!important;height:88px!important;max-width:88px!important;max-height:88px!important;min-width:88px!important;min-height:88px!important;overflow:hidden!important;margin:20px auto 0!important;border-radius:12px!important;';
      photoEl.innerHTML = hasPhoto
        ? `<img src="${esc(b.photo)}" alt="${esc(b.name || '')}" width="88" height="88" style="width:88px!important;height:88px!important;max-width:88px!important;max-height:88px!important;object-fit:cover!important;object-position:center top!important;display:block!important;border-radius:12px!important;" />`
        : esc(initials);
    }
    const nameEl = $('#brother-detail-name');
    if (nameEl) nameEl.textContent = b.name || '';
    const bioEl = $('#brother-detail-bio');
    if (bioEl) bioEl.textContent = b.bio || '';

  


     // Birthday Honors
    const isBday = isTodayBirthday(b.birthday);
    const bdayHeader = $('#brother-birthday-header');
    const textHimBtn = $('#brother-text-him');

    if (bdayHeader) {
      if (isBday) {
        bdayHeader.textContent = 'HAPPY BIRTHDAY';
        bdayHeader.classList.remove('hidden');
      } else {
        bdayHeader.textContent = '';
        bdayHeader.classList.add('hidden');
      }
    }

    if (textHimBtn) {
      if (isBday && digitsOnly(b.phone)) {
        textHimBtn.classList.remove('hidden');
        textHimBtn.onclick = () => {
          try { tbFeedback.press(textHimBtn); } catch (e) {}
          const body = encodeURIComponent(BIRTHDAY_SMS_PREFILL);
          window.location.href = `sms:${digitsOnly(b.phone)}?body=${body}`;
        };
      } else {
        textHimBtn.classList.add('hidden');
        textHimBtn.onclick = null;
      }
    }


    
    // Contact actions — phone is opt-in only (SHARE CONTACT + inline QR; no CALL/TEXT chips)
    const actions = $('#brother-contact-actions');
    const shareBtn = $('#brother-share-contact');
    if (shareBtn && !shareBtn.dataset.tbPress) {
      shareBtn.dataset.tbPress = '1';
      shareBtn.addEventListener('click', () => { try { tbFeedback.press(shareBtn); } catch (e) {} }, true);
    }
    const phone = digitsOnly(b.phone);
    if (actions) {
      if (phone) {
        actions.classList.remove('hidden');
        if (shareBtn) {
          shareBtn.onclick = () => shareContact(b);
        }
      } else {
        actions.classList.add('hidden');
      }
    }

    detail.classList.remove('hidden');
    detail.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    bindBrotherDetail(); // ensure X is wired
    // Inline Cash App–style QR with bolt center — ready as soon as profile opens
    renderInlineProfileQR(b);
  }

  function closeBrotherDetail() {
    const detail = $('#brother-detail');
    if (!detail) return;
    releaseFocusAndZoom();
    clearQrTarget($('#brother-qr-target'));
    const qrWrap = $('#brother-qr-wrap');
    if (qrWrap) qrWrap.classList.add('hidden');
    detail.classList.add('hidden');
    detail.setAttribute('aria-hidden', 'true');
    unlockBodyIfClear();
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
    const panel = detail.querySelector('.brother-detail-panel') || detail;
    bindElasticSwipe(detail, {
      getEl: () => panel,
      canPrev: () => brotherDetailIndex > 0,
      canNext: () => brotherDetailIndex < ((brothers || []).length - 1),
      onPrev: () => openBrotherDetail(brotherDetailIndex - 1),
      onNext: () => openBrotherDetail(brotherDetailIndex + 1),
      onDown: () => closeBrotherDetail(),
      onDownDist: 52,
      follow: 0.88,
      blocked: (t) => !!(t && t.closest && t.closest('.brother-detail-close, button, a, input, textarea'))
    });
    bindDoubleTapZoom(detail, function () {
      const p = document.getElementById('brother-detail-photo');
      return p ? p.querySelector('img') : null;
    });
    document.addEventListener('keydown', (e) => {
      if (!detail.classList.contains('hidden') && e.key === 'Escape') closeBrotherDetail();
    });
  }

  function openProfileEditor() {
    const me = brothers.find(b => b.id === myProfileId);
    const phoneEl = $('#profile-phone');
    if (me) {
      const nameEl = $('#profile-name');
      const bioEl = $('#profile-bio');
      if (nameEl) nameEl.value = me.name || '';
      if (bioEl) bioEl.value = me.bio || '';
      if (phoneEl) phoneEl.value = me.phone || '';

      const bdayEl = $('#profile-birthday');
      if (bdayEl) bdayEl.value = (me && me.birthday) ? me.birthday : '';



      
      if (me.photo) {
        pendingPhotoData = me.photo;
        const preview = $('#photo-preview');
        if (preview) {
          preview.innerHTML = `<img src="${esc(me.photo)}">`;
          preview.classList.add('visible');
        }
      } else {
        pendingPhotoData = null;
        const preview = $('#photo-preview');
        if (preview) { preview.innerHTML = ''; preview.classList.remove('visible'); }
      }
    } else {
      const nameEl = $('#profile-name');
      const bioEl = $('#profile-bio');
      if (nameEl) nameEl.value = '';
      if (bioEl) bioEl.value = '';
      if (phoneEl) phoneEl.value = '';

            const bdayEl = $('#profile-birthday');
      if (bdayEl) bdayEl.value = '';


      
      pendingPhotoData = null;
      const preview = $('#photo-preview');
      if (preview) { preview.innerHTML = ''; preview.classList.remove('visible'); }
    }
    updateMyQrButtonVisibility();
    openModal('profile-modal');
  }

  function renderBrothers() {
    const grid = $('#brothers-grid');
    if (!grid) return;
    try { collapseDuplicateBrothers(); } catch (e) {}
    if (!brothers.length) {
      grid.innerHTML = `
        <button type="button" class="empty-state empty-brothers empty-brothers-cta" id="empty-brothers-cta" aria-label="Add your profile">
          <div class="empty-brothers-plus" aria-hidden="true">+</div>
          <div class="empty-brothers-title">The room is waiting.</div>
          <div class="empty-brothers-sub">Add your name.<br>Take your seat.</div>
        </button>`;
      const cta = $('#empty-brothers-cta');
      if (cta) {
        cta.addEventListener('click', () => {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          try { tbFeedback.selection(); } catch (e) {}
          openProfileEditor();
        });
      }
      updateAllNewBadges();
      return;
    }
    const cardsHtml = brothers.map((b, i) => {
      const initials = (b.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
      const hasPhoto = b.photo && (b.photo.startsWith('data:') || b.photo.startsWith('http'));
      const photoHtml = hasPhoto
        ? `<img class="brother-photo" src="${esc(b.photo)}" alt="${esc(b.name)}" />`
        : `<div class="brother-photo">${esc(initials)}</div>`;
      const isNew = (typeof b.updatedAt === 'number' && b.updatedAt > (brothersSeenAt || 0));
      
      const isBday = isTodayBirthday(b.birthday);
      const nameClass = isBday ? 'brother-name birthday-today' : 'brother-name';
      const todayBadge = isBday ? '<span class="today-badge">TODAY</span>' : '';
      
      
      return `
        <button type="button" class="brother-card${isNew ? ' card-new' : ''}" data-brother-index="${i}" aria-label="View ${esc(b.name || 'brother')} profile">
          ${isNew ? '<span class="new-badge new-badge-overlay">NEW</span>' : ''}
          ${photoHtml}
          <div class="brother-info">
            <div class="${nameClass}">${esc(b.name || '')}${todayBadge}</div>
            <div class="brother-bio">${esc(b.bio || '')}</div>
          </div>
        </button>`;
    }).join('');
    const inviteHtml = `
      <button type="button" class="brother-card brother-chair" id="brother-open-chair" aria-label="Invite a brother">
        <div class="brother-chair-seat" aria-hidden="true"></div>
        <div class="brother-info">
          <div class="brother-chair-title">OPEN CHAIR</div>
          <div class="brother-slot-sub">Bring a brother</div>
        </div>
      </button>`;
    grid.innerHTML = cardsHtml + inviteHtml;
    grid.querySelectorAll('.brother-card[data-brother-index]').forEach(card => {
      card.addEventListener('click', () => {
        tbGlowHit(card, 'yellow');
        const idx = parseInt(card.getAttribute('data-brother-index'), 10) || 0;
        openBrotherDetail(idx);
      });
    });
    const chair = $('#brother-open-chair');
    if (chair) {
      chair.addEventListener('click', function () {
        if (typeof tbGlowHit === 'function') tbGlowHit(chair, 'yellow');
        try { tbFeedback.selection(); } catch (e) {}
        inviteOpenChair();
      });
    }
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

  let memoryFlipOrigin = null; // {left,top,width,height} of thumb for shared-element open

  function openMemoryViewer(index, originEl) {
    const list = viewableMemories();
    if (!list.length) return;
    memoryViewerIndex = Math.max(0, Math.min(index, list.length - 1));
    const viewer = $('#memory-viewer');
    if (!viewer) return;
    // Capture thumb rect for FLIP (photos only). Fail open if missing.
    memoryFlipOrigin = null;
    try {
      const m = list[memoryViewerIndex];
      if (originEl && m && m.type !== 'video' && !prefersReducedMotion()) {
        const thumb = originEl.querySelector ? (originEl.querySelector('img') || originEl) : originEl;
        if (thumb && thumb.getBoundingClientRect) {
          const r = thumb.getBoundingClientRect();
          if (r.width > 8 && r.height > 8) {
            memoryFlipOrigin = { left: r.left, top: r.top, width: r.width, height: r.height };
          }
        }
      }
    } catch (e) { memoryFlipOrigin = null; }
    viewer.classList.remove('hidden');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    bindMemoryViewer(); // ensure X is wired
    paintMemoryViewer();
    // Shared-element expand after paint
    requestAnimationFrame(() => {
      try { runMemoryFlipOpen(); } catch (e) { memoryFlipOrigin = null; }
    });
  }

  function runMemoryFlipOpen() {
    if (!memoryFlipOrigin || prefersReducedMotion()) return;
    const stage = $('#memory-viewer-stage');
    const img = stage && stage.querySelector('img');
    if (!img) { memoryFlipOrigin = null; return; }
    const end = img.getBoundingClientRect();
    if (!end.width || !end.height) { memoryFlipOrigin = null; return; }
    const o = memoryFlipOrigin;
    const sx = o.width / end.width;
    const sy = o.height / end.height;
    const dx = (o.left + o.width / 2) - (end.left + end.width / 2);
    const dy = (o.top + o.height / 2) - (end.top + end.height / 2);
    img.style.transformOrigin = 'center center';
    img.style.transition = 'none';
    img.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    img.style.borderRadius = '6px';
    // Force reflow then animate to rest
    void img.offsetWidth;
    img.style.transition = 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.34s ease';
    img.style.transform = 'translate(0,0) scale(1)';
    img.style.borderRadius = '4px';
    const clear = () => {
      img.style.transition = '';
      img.style.transform = '';
      img.style.borderRadius = '';
    };
    img.addEventListener('transitionend', clear, { once: true });
    setTimeout(clear, 400);
  }

  function closeMemoryViewer() {
    const viewer = $('#memory-viewer');
    if (!viewer) return;
    try { if (viewer.__tbResetZoom) viewer.__tbResetZoom(); } catch (e) {}
    releaseFocusAndZoom();
    setUnderlayDepth(false);
    memoryFlipOrigin = null;
    viewer.classList.add('hidden');
    viewer.setAttribute('aria-hidden', 'true');
    unlockBodyIfClear();
    const stage = $('#memory-viewer-stage');
    if (stage) {
      const v = stage.querySelector('video');
      if (v) { try { v.pause(); } catch (e) {} }
      stage.innerHTML = '';
    }
  }

  function paintMemoryViewer() {
    const viewer = $('#memory-viewer');
    try { if (viewer && viewer.__tbResetZoom) viewer.__tbResetZoom(); } catch (e) {}
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
      // Only allow data: or https: sources (never javascript: / arbitrary)
      const src = String(m.full || m.data || '');
      const safe = src.startsWith('data:') || src.startsWith('https://') || src.startsWith('http://');
      if (!safe) {
        stage.textContent = 'Could not display this memory.';
      } else if (m.type === 'video') {
        stage.innerHTML = '';
        const v = document.createElement('video');
        v.src = src;
        v.controls = true;
        v.playsInline = true;
        stage.appendChild(v);
      } else {
        stage.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        stage.appendChild(img);
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
    const stage = $('#memory-viewer-stage') || viewer;
    bindElasticSwipe(viewer, {
      getEl: () => stage,
      canPrev: () => memoryViewerIndex > 0,
      canNext: () => {
        const list = viewableMemories();
        return memoryViewerIndex < list.length - 1;
      },
      onPrev: () => memoryViewerStep(-1),
      onNext: () => memoryViewerStep(1),
      onDown: () => closeMemoryViewer(),
      onDownDist: 52,
      follow: 0.88,
      blocked: (t) => !!(t && t.closest && t.closest('.memory-viewer-close, video, button'))
    });
    bindDoubleTapZoom(viewer, function () {
      const s = document.getElementById('memory-viewer-stage');
      return s ? s.querySelector('img') : null;
    });
    document.addEventListener('keydown', (e) => {
      if (!$('#memory-viewer') || $('#memory-viewer').classList.contains('hidden')) return;
      if (e.key === 'Escape') closeMemoryViewer();
      if (e.key === 'ArrowLeft') memoryViewerStep(-1);
      if (e.key === 'ArrowRight') memoryViewerStep(1);
    });
  }

  function memoryThumbHtml(m, i, hero) {
    const isVideo = m.type === 'video';
    const src = m.data ? esc(m.data) : '';
    const mediaTag = isVideo
      ? '<video src="' + src + '" muted playsinline preload="metadata"></video><div class="media-thumb-play">▶</div>'
      : '<img src="' + src + '" alt="" loading="lazy" />';
    const who = m.uploader_name ? esc(m.uploader_name) : '';
    const capText = m.caption ? esc(m.caption) : '';
    const cap = (capText || who)
      ? '<div class="media-thumb-cap">' + capText + (who ? (capText ? ' · ' : '') + who : '') + '</div>'
      : '';
    const t = m.date ? Date.parse(m.date) : 0;
    const isNew = t > 0 && t > (mediaSeenAt || 0);
    return '<button type="button" class="media-thumb' + (hero ? ' media-thumb-hero' : '') + (isNew ? ' card-new' : '') + '" data-media-index="' + i + '" aria-label="View memory">' +
      (isNew ? '<span class="new-badge new-badge-overlay">NEW</span>' : '') + mediaTag + cap + '</button>';
  }

  function bindMediaThumbs(root) {
    if (!root) return;
    root.querySelectorAll('.media-thumb').forEach(function (btn, i) {
      btn.style.animationDelay = (Math.min(i, 8) * 0.04) + 's';
      btn.classList.add('media-enter');
      btn.addEventListener('click', function () {
        tbGlowHit(btn, 'yellow');
        const idx = parseInt(btn.getAttribute('data-media-index'), 10) || 0;
        openMemoryViewer(idx, btn);
        markMediaSeen();
      });
    });
  }

  function renderMedia() {
    const el = $('#media-feed');
    const hero = document.getElementById('media-hero');
    if (!el) return;
    updateAuthSessionBar();
    if (hero) { hero.innerHTML = ''; hero.classList.add('hidden'); }
    /* Auth lives on Brothers — no Sign In wall on Events / Past Gatherings */
    if (supabaseEnabled() && !isSignedIn()) {
      el.innerHTML =
        '<button type="button" class="empty-state empty-memories empty-memories-cta" id="empty-memories-cta" aria-label="Drop a pic">' +
        '<div class="empty-memories-plus" aria-hidden="true">+</div>' +
        '<div class="empty-memories-title">Drop a pic when the night starts.</div>' +
        '<div class="empty-memories-sub"></div>' +
        '</button>';
      const cta = $('#empty-memories-cta');
      if (cta) {
        cta.addEventListener('click', function () {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          try { tbFeedback.selection(); } catch (e) {}
          openDropShot();
        });
      }
      updateAllNewBadges();
      return;
    }
    if (!media.length) {
      el.innerHTML =
        '<button type="button" class="empty-state empty-memories empty-memories-cta" id="empty-memories-cta" aria-label="Drop a pic">' +
        '<div class="empty-memories-plus" aria-hidden="true">+</div>' +
        '<div class="empty-memories-title">Drop a pic when the night starts.</div>' +
        '<div class="empty-memories-sub"></div>' +
        '</button>';
      const cta = $('#empty-memories-cta');
      if (cta) {
        cta.addEventListener('click', function () {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          try { tbFeedback.selection(); } catch (e) {}
          openDropShot();
        });
      }
      updateAllNewBadges();
      return;
    }
    if (hero) {
      hero.innerHTML = memoryThumbHtml(media[0], 0, true);
      hero.classList.remove('hidden');
      bindMediaThumbs(hero);
    }
    el.innerHTML = media.slice(1).map(function (m, i) {
      return memoryThumbHtml(m, i + 1, false);
    }).join('');
    bindMediaThumbs(el);
    updateAllNewBadges();
    try { syncDropShotAuth(); } catch (e) {}
  }

  function meetingKey() {
    try {
      const d = getNextMeetingMonday();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    } catch (e) {
      return 'default';
    }
  }

  let raffleDraws = [];
  let patioOverride = null;

  function isGatheringDay() {
    try { return daysUntil(getNextMeetingMonday()) === 0; } catch (e) { return false; }
  }

  function isPatioLive() {
    if (patioOverride === true) return true;
    if (patioOverride === false) return false;
    return isGatheringDay();
  }

  function syncPatioToggle() {
    const btn = document.getElementById('patio-toggle-btn');
    const hint = document.getElementById('patio-toggle-hint');
    const live = isPatioLive();
    if (btn) btn.textContent = live ? 'CLOSE THE PATIO' : 'OPEN THE PATIO';
    if (hint) {
      hint.textContent = live
        ? 'Patio is live. Brothers tap I’M HERE on Home. Then DRAW BEER / DRAW HAT.'
        : 'Opens I’M HERE on Home. Men who check in are in the beer and hat raffle.';
    }
  }

  function iShowedUp() {
    const id = myProfileId || (currentUser() && currentUser().id);
    if (!id) return false;
    return (sharedRsvps || []).some(function (r) { return r && r.brother_id === id && r.showed_up; });
  }

  function renderHere() {
    const btn = document.getElementById('here-btn');
    const st = document.getElementById('here-status');
    const board = document.getElementById('raffle-board');
    const night = isPatioLive();
    try { syncPatioToggle(); } catch (e) {}
    try { if (night) startPatioWatch(); else stopPatioWatch(); } catch (e) {}
    if (btn) {
      if (night && !iShowedUp()) btn.classList.remove('hidden');
      else btn.classList.add('hidden');
    }
    if (st) {
      if (night && iShowedUp()) st.classList.remove('hidden');
      else st.classList.add('hidden');
    }
    if (board) {
      const lines = (raffleDraws || []).map(function (d) {
        const prize = 'WINNER';
        return prize + ' · ' + String(d.winner_name || 'Brother').toUpperCase();
      });
      if (lines.length) {
        board.textContent = lines.join('   ·   ');
        board.classList.remove('hidden');
      } else board.classList.add('hidden');
    }
    const drop = document.getElementById('drop-shot-btn');
    if (drop) {
      if (night && iShowedUp()) drop.classList.remove('hidden');
      else drop.classList.add('hidden');
    }
    try { syncDropShotAuth(); } catch (e) {}
  }

  function openLibraryShot() {
    if (!isSignedIn()) {
      try { startMemberSignIn(); } catch (e) {}
      return;
    }
    const lib = document.getElementById('memory-lib');
    if (!lib) return;
    try { lib.value = ''; } catch (e) {}
    lib.click();
  }

  function syncDropShotAuth() {
    const on = typeof isSignedIn === 'function' && isSignedIn();
    const lab = document.getElementById('memories-drop-btn');
    const sign = document.getElementById('memories-signin-shot');
    if (lab) lab.classList.toggle('hidden', !on);
    if (sign) sign.classList.toggle('hidden', on);
  }

  function openDropShot() {
    if (!isSignedIn()) {
      try { save('pendingShot', { at: Date.now() }); } catch (e) {}
      try { startMemberSignIn(); } catch (e) {}
      return;
    }
    const cam = document.getElementById('memory-cam') || document.getElementById('media-file-cam');
    if (!cam) return;
    try { cam.value = ''; } catch (e) {}
    cam.click();
  }

  function flushPendingShot() {
    let p = null;
    try { p = load('pendingShot'); } catch (e) {}
    if (!p) return;
    try { save('pendingShot', null); } catch (e) {}
    if (!isSignedIn()) return;
    try { showView('events'); } catch (e) {}
    try { showInstallToast('Tap DROP A PIC. Camera’s ready.'); } catch (e) {}
    const lab = document.getElementById('memories-drop-btn');
    if (lab) {
      try { lab.classList.remove('hidden'); } catch (e) {}
      try { if (typeof tbGlowHit === 'function') tbGlowHit(lab, 'red'); } catch (e) {}
    }
    try { syncDropShotAuth(); } catch (e) {}
  }

  async function ingestMemoryFile(file) {
    if (!file) return;
    if (supabaseEnabled() && !isSignedIn()) {
      try { startMemberSignIn(); } catch (e) {}
      return;
    }
    if (!String(file.type || '').startsWith('image')) {
      alert('Photo only from the camera.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert('File is too large. Try another shot.');
      return;
    }
    try { showInstallToast('Uploading…'); } catch (e) {}
    try {
      const item = {
        blob: file,
        filename: file.name || 'patio.jpg',
        type: 'image',
        caption: '',
        date: new Date().toISOString(),
        uploader_name: (typeof myDisplayName === 'function' && myDisplayName()) || ''
      };
      if (!supabaseEnabled()) throw new Error('Shared memories are not configured on this app yet.');
      try { showInstallToast('Polishing…'); } catch (e) {}
      const saved = await pushMemory(item);
      media.unshift(saved);
      renderMedia();
      renderLastFire();
      try { showView('events'); } catch (e) {}
      try { rewardSaveSuccess('memory'); } catch (e) {}
    } catch (err) {
      console.error(err);
      alert('Could not save memory. ' + ((err && err.message) || 'Try again.'));
    }
  }

  async function pullRaffle() {
    if (!supabaseEnabled()) return;
    try {
      const { data, error } = await getSb().from('raffle_draws').select('prize,winner_name,winner_id,meeting_key,drawn_at').eq('meeting_key', meetingKey());
      if (error) return;
      raffleDraws = Array.isArray(data) ? data : [];
      renderHere();
      try { maybePlayLiveRaffle(); } catch (e) {}
    } catch (e) {}
  }

  async function checkInHere() {
    if (!isPatioLive()) return;
    if (!isSignedIn()) {
      try { openImInSignIn(); } catch (e) { startMemberSignIn(); }
      return;
    }
    const id = (typeof ensureBrotherId === 'function' ? ensureBrotherId() : myProfileId) || (currentUser() && currentUser().id);
    if (!id) return;
    try { await pushRsvp(true); } catch (e) {}
    try {
      const sb = getSb();
      const { error } = await sb.from('rsvps').upsert({
        brother_id: id,
        meeting_key: meetingKey(),
        in_at: new Date().toISOString(),
        showed_up: true,
        showed_at: new Date().toISOString()
      }, { onConflict: 'brother_id,meeting_key' });
      if (error) throw error;
    } catch (e) {
      alert('Could not check you in. Sign in and try again.');
      return;
    }
    try { await pullRsvps(); } catch (e) {}
    renderHere();
    try { showInstallToast("YOU'RE IN THE RAFFLE. PIZZA'S ON.", { success: true }); } catch (e) {}
    try { tbFeedback.confirm(); } catch (e) {}
    setTimeout(function () {
      try { renderLastFire(); } catch (e) {}
    }, 400);
  }

  async function drawRaffle(prize) {
    if (!supabaseEnabled() || !isSignedIn()) {
      alert('Sign in as a leader to draw.');
      return;
    }
    const sb = getSb();
    const key = meetingKey();
    let pool = [];
    try {
      const { data: rows, error } = await sb.from('rsvps').select('brother_id').eq('meeting_key', key).eq('showed_up', true);
      if (error) throw error;
      const ids = (rows || []).map(function (r) { return r.brother_id; }).filter(Boolean);
      if (!ids.length) {
        alert('Nobody checked in yet.');
        return;
      }
      const { data: bros } = await sb.from('brothers').select('id,name');
      pool = ids.map(function (id) {
        const b = (bros || []).find(function (x) { return x.id === id; });
        const local = (brothers || []).find(function (x) { return x.id === id; });
        return { id: id, name: (b && b.name) || (local && local.name) || 'Brother' };
      });
    } catch (e) {
      alert('Could not load who showed.');
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    try {
      const sb = getSb();
      const { error } = await sb.from('raffle_draws').upsert({
        meeting_key: meetingKey(),
        prize: prize,
        winner_id: pick.id,
        winner_name: pick.name || 'Brother',
        drawn_at: new Date().toISOString()
      }, { onConflict: 'meeting_key,prize' });
      if (error) throw error;
    } catch (e) {
      alert('Could not lock the draw. Run the raffle SQL.');
      return;
    }
    try { await pullRaffle(); } catch (e) {}
    try { playRaffleLive(prize, pick.name || 'Brother'); } catch (e) {}
  }

  let raffleSeen = {};
  let raffleAnimTimer = null;
  let patioWatch = null;

  function patioPoolNames() {
    const ids = (sharedRsvps || []).filter(function (r) { return r && r.showed_up; }).map(function (r) { return r.brother_id; });
    const names = [];
    ids.forEach(function (id) {
      const b = (brothers || []).find(function (x) { return x && x.id === id; });
      const n = (b && b.name) || firstNameForId(id) || '';
      if (n) names.push(n);
    });
    if (names.length) return names;
    return (brothers || []).map(function (b) { return b && b.name; }).filter(Boolean);
  }

  function closeRaffleLive() {
    if (raffleAnimTimer) { clearTimeout(raffleAnimTimer); raffleAnimTimer = null; }
    const overlay = document.getElementById('raffle-live');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.classList.remove('is-landed');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('tb-raffle-live');
    try { tbAllowSleep('raffle'); } catch (e) {}
  }

  const RAFFLE_CAST = [
    { slot: 'hat', file: 'thunder-hat.png' },
    { slot: 'beard', file: 'thunder-beard.png' },
    { slot: 'laugh', file: 'thunder-laugh.png' },
    { slot: 'cigar', file: 'thunder-cigar.png' },
    { slot: 'grin', file: 'thunder-grin.png' },
    { slot: 'wink', file: 'thunder-wink.png' }
  ];

  function paintRaffleCast() {
    const wrap = document.getElementById('raffle-cast');
    if (!wrap || wrap.dataset.painted === '1') return;
    wrap.innerHTML = RAFFLE_CAST.map(function (c) {
      return '<img class="raffle-cast-face" data-slot="' + c.slot + '" src="assets/tour-faces/' + c.file + '" alt="" width="64" height="64" decoding="async" />';
    }).join('');
    wrap.dataset.painted = '1';
  }

  function playRaffleLive(prize, winner, names) {
    const overlay = document.getElementById('raffle-live');
    const nameEl = document.getElementById('raffle-live-name');
    const prizeEl = document.getElementById('raffle-live-prize');
    const sub = document.getElementById('raffle-live-sub');
    if (!overlay || !nameEl) return;
    if (raffleAnimTimer) { clearTimeout(raffleAnimTimer); raffleAnimTimer = null; }
    const win = String(winner || 'Brother').trim() || 'Brother';
    raffleSeen[prize] = win;
    const pool = (Array.isArray(names) && names.length ? names : patioPoolNames()).slice();
    if (pool.indexOf(win) === -1) pool.push(win);
    if (prizeEl) prizeEl.textContent = 'WINNER';
    const kicker = document.getElementById('raffle-live-kicker');
    if (kicker) kicker.textContent = 'THE WIN';
    if (sub) sub.textContent = 'Drawing…';
    try { paintRaffleCast(); } catch (e) {}
    overlay.classList.remove('hidden', 'is-landed');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tb-raffle-live');
    try { tbKeepAwake('raffle'); } catch (e) {}
    const host = document.getElementById('raffle-live-host');
    if (host) {
      host.style.animation = 'none';
      void host.offsetWidth;
      host.style.animation = '';
    }
    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function land() {
      nameEl.textContent = win.toUpperCase();
      overlay.classList.add('is-landed');
      if (sub) sub.textContent = "HE'S GOT IT";
      try { tbFeedback.confirm(); } catch (e) {}
    }
    if (reduce || pool.length < 2) {
      land();
      return;
    }
    let i = 0;
    const start = Date.now();
    function tick() {
      if (Date.now() - start < 2400) {
        nameEl.textContent = String(pool[i % pool.length] || 'Brother').toUpperCase();
        i += 1;
        raffleAnimTimer = setTimeout(tick, 75 + Math.floor(Math.random() * 45));
        if (i % 4 === 0) { try { tbFeedback.selection(); } catch (e) {} }
      } else {
        land();
      }
    }
    tick();
  }
  try { window.playRaffleLive = playRaffleLive; } catch (e) {}

  function maybePlayLiveRaffle() {
    (raffleDraws || []).forEach(function (d) {
      if (!d || !d.prize || !d.winner_name) return;
      const t = d.drawn_at ? Date.parse(d.drawn_at) : 0;
      if (t && (Date.now() - t) > 90000) {
        raffleSeen[d.prize] = d.winner_name;
        return;
      }
      if (raffleSeen[d.prize] === d.winner_name) return;
      playRaffleLive(d.prize, d.winner_name);
    });
  }

  function startPatioWatch() {
    if (patioWatch) return;
    patioWatch = setInterval(function () {
      if (!isPatioLive()) { stopPatioWatch(); return; }
      try { pullRaffle(); } catch (e) {}
      try { pullRsvps(); } catch (e) {}
    }, 1400);
  }
  function stopPatioWatch() {
    if (patioWatch) { clearInterval(patioWatch); patioWatch = null; }
  }

  function firstNameForId(id) {
    const b = (brothers || []).find(function (x) { return x && x.id === id; });
    const n = b && (b.name || b.displayName || b.display_name);
    if (!n) return '';
    return String(n).trim().split(/\s+/)[0];
  }

  function toastBrotherIn(first) {
    if (!first) return;
    try {
      showInstallToast(String(first).toUpperCase() + ' LOCKED IN', { success: true });
    } catch (e) {}
  }

  async function pullLastFire() {
    if (!supabaseEnabled()) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const { data, error } = await sb.from('last_fire').select('caption,photo,updated_at').eq('id', 'current').maybeSingle();
      if (error || !data) return false;
      if (!String(data.caption || '').trim() && !String(data.photo || '').trim()) return false;
      lastFire = {
        caption: data.caption || '',
        photo: data.photo || '',
        updatedAt: data.updated_at ? Date.parse(data.updated_at) : Date.now()
      };
      save('lastFire', lastFire);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function pushLastFire() {
    if (!supabaseEnabled() || !isSignedIn() || !lastFire) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const uid = currentUser() && currentUser().id;
      const { error } = await sb.from('last_fire').upsert({
        id: 'current',
        caption: lastFire.caption || '',
        photo: lastFire.photo || '',
        updated_at: new Date().toISOString(),
        updated_by: uid || null
      });
      return !error;
    } catch (e) {
      return false;
    }
  }

  async function pullRsvps() {
    if (!supabaseEnabled()) return false;
    const sb = getSb();
    if (!sb) return false;
    try {
      const { data, error } = await sb
        .from('rsvps')
        .select('brother_id,meeting_key,in_at,showed_up')
        .eq('meeting_key', meetingKey());
      if (error) {
        const retry = await sb.from('rsvps').select('brother_id,meeting_key,in_at').eq('meeting_key', meetingKey());
        if (retry.error) {
          console.warn('rsvps pull', retry.error);
          return false;
        }
        sharedRsvps = Array.isArray(retry.data) ? retry.data : [];
      } else {
        sharedRsvps = Array.isArray(data) ? data : [];
      }
      const nextIds = sharedRsvps.map(function (r) { return r && r.brother_id; }).filter(Boolean);
      try { renderInCount(); } catch (e) {}
      try { renderHere(); } catch (e) {}
      if (prevRsvpIds) {
        nextIds.forEach(function (id) {
          if (prevRsvpIds.indexOf(id) !== -1) return;
          if (id === myProfileId) return;
          const first = firstNameForId(id);
          if (first) toastBrotherIn(first);
        });
      }
      prevRsvpIds = nextIds;
      return true;
    } catch (e) {
      console.warn('rsvps pull failed', e);
      return false;
    }
  }

  function openDeviceSmsClub(message) {
    const nums = [];
    const seen = {};
    (brothers || []).forEach(function (b) {
      const d = digitsOnly(b && b.phone);
      const e164 = (d.length === 10) ? ('1' + d) : d;
      if (e164.length < 10 || seen[e164]) return;
      seen[e164] = true;
      nums.push(e164);
    });
    if (!nums.length) {
      alert('No phones on the roster yet.');
      return;
    }
    const body = encodeURIComponent(message || 'Sons of Thunder — ');
    const list = nums.join(',');
    try { navigator.clipboard && navigator.clipboard.writeText(nums.join('\n')); } catch (e) {}
    const ios = typeof isIos === 'function' && isIos();
    window.location.href = ios
      ? ('sms:/open?addresses=' + list + '&body=' + body)
      : ('sms:' + list + '?body=' + body);
  }

  async function loadFounderRoom() {
    const el = document.getElementById('room-stats');
    if (!el) return;
    el.innerHTML = 'Loading the room…';
    try {
      const sb = getSb && getSb();
      let accessToken = '';
      if (sb && sb.auth && sb.auth.getSession) {
        const { data } = await sb.auth.getSession();
        accessToken = (data && data.session && data.session.access_token) || '';
      }
      if (!accessToken) {
        el.textContent = 'Sign in on Brothers (leader account).';
        return;
      }
      const res = await fetch('/.netlify/functions/leader-room', {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        el.textContent = data.error || 'Couldn’t load the room.';
        return;
      }
      const bday = (data.birthdays || []).map(function (b) {
        return esc(b.name) + ' · ' + esc(b.birthday);
      }).join('<br>');
      function when(iso) {
        if (!iso) return '';
        try {
          return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        } catch (e) { return ''; }
      }
      window.__tbRoomPeople = data.people || [];
      const people = (data.people || []).map(function (p) {
        const bits = [];
        if (p.in) bits.push('LOCKED IN' + (p.inAt ? ' · ' + when(p.inAt) : ''));
        else bits.push('Not in');
        if (p.showed) bits.push('SHOWED');
        if (p.phone) bits.push('phone');
        if (p.birthday) bits.push(p.birthday);
        if (p.updatedAt && !p.in) bits.push(when(p.updatedAt));
        return '<div class="room-person' + (p.in ? ' is-in' : '') + (p.showed ? ' is-showed' : '') + '" data-bid="' + esc(p.id) + '">' +
          '<div class="room-person-name">' + esc(p.name) + '</div>' +
          '<div class="room-person-meta">' + esc(bits.join(' · ')) + '</div>' +
          (p.in && !p.showed ? '<button type="button" class="room-showed" data-showed="' + esc(p.id) + '">SHOWED UP</button>' : '') +
          '</div>';
      }).join('');
      const mems = (data.memories || []).map(function (m) {
        return '<div class="room-mem">' + esc(m.name) + (m.at ? ' · ' + when(m.at) : '') +
          (m.caption ? ' — ' + esc(m.caption) : '') + '</div>';
      }).join('');
      el.innerHTML =
        '<div class="room-grid">' +
          '<div class="room-stat"><b>' + (data.lockedIn || 0) + '</b><span>LOCKED IN</span></div>' +
          '<div class="room-stat"><b>' + (data.roster || 0) + '</b><span>ROSTER</span></div>' +
          '<div class="room-stat"><b>' + (data.alerts || 0) + '</b><span>ALERTS ON</span></div>' +
          '<div class="room-stat"><b>' + (data.phones || 0) + '</b><span>PHONES</span></div>' +
        '</div>' +
        '<p class="room-origin">' + esc(publicOrigin().replace(/^https?:\/\//, '')) + (data.meeting_key ? ' · ' + esc(data.meeting_key) : '') + '</p>' +
        (people ? '<div class="room-list">' + people + '</div>' : '<p class="room-in">Nobody on the roster yet.</p>') +
        (bday ? '<p class="room-bday"><span class="card-label">BIRTHDAYS</span><br>' + bday + '</p>' : '') +
        (mems ? '<p class="room-bday"><span class="card-label">MEMORIES</span></p><div class="room-mems">' + mems + '</div>' : '');
      el.querySelectorAll('[data-showed]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-showed');
          if (id) markShowedUp(id, btn);
        });
      });
    } catch (e) {
      el.textContent = 'Couldn’t load the room.';
    }
  }

  async function markShowedUp(brotherId, btn) {
    if (!supabaseEnabled() || !isSignedIn() || !brotherId) return;
    try {
      const sb = getSb();
      const { error } = await sb.from('rsvps').update({
        showed_up: true,
        showed_at: new Date().toISOString()
      }).eq('brother_id', brotherId).eq('meeting_key', meetingKey());
      if (error) throw error;
      if (btn) {
        btn.textContent = 'SHOWED';
        btn.disabled = true;
      }
      try { loadFounderRoom(); } catch (e) {}
    } catch (e) {
      alert('Could not mark showed up.');
    }
  }

  function utilizeImInBackground() {
    try { save('rsvpMeeting', meetingKey()); } catch (e) {}
    try { save('lastImInAt', Date.now()); } catch (e) {}
    try { lockInAppReminder(); } catch (e) {}
    try { captureImInSignal(); } catch (e) {}
    try {
      if (!isSignedIn()) save('pendingRsvp', { on: true, key: meetingKey(), at: Date.now() });
    } catch (e) {}
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(function (ok) {
          try {
            const s = load('lastImInSignal') || {};
            s.persist = !!ok;
            save('lastImInSignal', s);
          } catch (e) {}
        }).catch(function () {});
      }
    } catch (e) {}
    try {
      if (navigator.clearAppBadge) navigator.clearAppBadge();
    } catch (e) {}
    try { updateOsBadge(); } catch (e) {}
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.catch(function () {});
    } catch (e) {}
    try { fetch('/.netlify/functions/gathering-ics', { cache: 'reload' }).catch(function () {}); } catch (e) {}
    try { if (typeof pullRsvps === 'function') pullRsvps(); } catch (e) {}
    try { if (typeof pullAnnouncements === 'function') pullAnnouncements(); } catch (e) {}
    try { if (typeof syncSelfToRoster === 'function') syncSelfToRoster(true); } catch (e) {}
  }

  async function flushPendingRsvp() {
    try {
      const p = load('pendingRsvp');
      if (!p || !p.on) return;
      if (!supabaseEnabled() || !isSignedIn()) return;
      const ok = await pushRsvp(true);
      if (ok) save('pendingRsvp', null);
    } catch (e) {}
  }

  async function pushRsvp(inFlag) {
    if (!supabaseEnabled() || !isSignedIn()) return false;
    const id = myProfileId || (currentUser() && currentUser().id);
    if (!id) return false;
    const sb = getSb();
    if (!sb) return false;
    const key = meetingKey();
    try {
      if (inFlag) {
        const now = new Date().toISOString();
        const { data: existing, error: lookErr } = await sb
          .from('rsvps')
          .select('brother_id')
          .eq('brother_id', id)
          .eq('meeting_key', key)
          .maybeSingle();
        if (lookErr) { console.warn('rsvps lookup', lookErr); return false; }
        let error = null;
        if (existing) {
          const res = await sb.from('rsvps').update({ in_at: now }).eq('brother_id', id).eq('meeting_key', key);
          error = res.error;
        } else {
          const res = await sb.from('rsvps').insert({ brother_id: id, meeting_key: key, in_at: now });
          error = res.error;
        }
        if (error) { console.warn('rsvps push', error); return false; }
      } else {
        const { error } = await sb.from('rsvps').delete().eq('brother_id', id).eq('meeting_key', key);
        if (error) { console.warn('rsvps delete', error); return false; }
      }
      await pullRsvps();
      return true;
    } catch (e) {
      console.warn('rsvps push failed', e);
      return false;
    }
  }

  function lockedFirstNames() {
    const names = [];
    const seen = {};
    (sharedRsvps || []).forEach(function (r) {
      const f = firstNameForId(r && r.brother_id);
      if (!f) return;
      const key = f.toUpperCase();
      if (seen[key]) return;
      seen[key] = true;
      names.push(key);
    });
    return names;
  }

  function renderInCount() {
    const el = document.getElementById('in-count');
    if (!el) return;
    if (roomCut()) { el.classList.add('hidden'); return; }
    const n = (sharedRsvps || []).length;
    if (n < 1) {
      el.classList.add('hidden');
      return;
    }
    let days = null;
    try { days = daysUntil(getNextMeetingMonday()); } catch (e) {}
    const head = n === 1 ? '1 LOCKED IN' : (n + ' LOCKED IN');
    let clock = '';
    if (days === 0) clock = 'TONIGHT';
    else if (days === 1) clock = 'TOMORROW';
    else if (days > 1) clock = days + ' DAYS';
    const names = lockedFirstNames();
    let nameLine = '';
    if (names.length) {
      const show = names.slice(0, 4);
      nameLine = show.join(' · ');
      if (names.length > 4) nameLine += ' · +' + (names.length - 4);
    }
    const numEl = document.getElementById('in-count-num');
    const namesEl = document.getElementById('in-count-names');
    if (numEl) numEl.textContent = clock ? (clock + '  ·  ' + head) : head;
    else el.textContent = head;
    if (namesEl) {
      namesEl.textContent = nameLine;
      namesEl.classList.toggle('hidden', !nameLine);
    }
    el.classList.remove('hidden');
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
    setTimeout(() => countEl.classList.remove('count-tick'), 520);
  }

  // Who's In UI removed (local-only roster looked like group presence). Stubs keep call sites safe.
  function renderWhosIn() { /* no-op */ }

  function renderRsvp() {
    try { updatePersonalHome(); } catch (e) {}
    try { updateOsBadge(); } catch (e) {}
    try { parkFabByImin(); } catch (e) {}
    try { renderInCount(); } catch (e) {}
    try { renderHere(); } catch (e) {}
    const btn = $('#rsvp-btn');
    const status = $('#rsvp-status');
    const prompt = $('#rsvp-prompt');
    if (!btn) return;
    /* One calendar control only: #reminder-btn. Never inject a second ADD TO CALENDAR. */
    const ghostCal = document.getElementById('rsvp-add-cal');
    if (ghostCal) {
      try { ghostCal.remove(); } catch (e) { ghostCal.classList.add('hidden'); }
    }
    if (rsvp) {
      try { syncSelfToRoster(true); } catch (e) {}
      const calLocked = !!load('reminderSet');
      btn.classList.add('confirmed');
      btn.textContent = "YOU'RE LOCKED IN";
      if (status) {
        let meta = calLocked ? 'Reminder on · On this phone' : 'On this phone';
        status.textContent = meta;
        status.classList.remove('hidden');
      }
      const meetCard = document.querySelector('.next-meeting');
      if (meetCard) meetCard.classList.add('commit-energized');
      if (prompt) prompt.classList.add('hidden');
      const remBtn = document.getElementById('reminder-btn');
      if (remBtn && !calLocked) {
        remBtn.classList.remove('hidden');
        remBtn.classList.add('btn-reminder-emphasis');
      }
    } else {
      try { syncSelfToRoster(false); } catch (e) {}
      btn.classList.remove('confirmed');
      btn.textContent = "I'M IN";
      if (status) status.classList.add('hidden');
      const meetCardOff = document.querySelector('.next-meeting');
      if (meetCardOff) meetCardOff.classList.remove('commit-energized');
      if (prompt) {
        const nIn = (sharedRsvps || []).length;
        prompt.textContent = nIn >= 1
          ? (nIn === 1 ? '1 already in. Your seat is open.' : (nIn + ' already in. Your seat is open.'))
          : "Your seat is open. Lock it in.";
        prompt.classList.remove('hidden');
      }
    }
  }

  function nightShots(key) {
    const k = key || meetingKey();
    return (media || []).filter(function (m) {
      if (!m || m.type === 'video') return false;
      return String(m.meeting_key || '') === String(k);
    }).slice(0, 8);
  }

  function renderLastFire() {
    const el = $('#last-fire');
    if (!el) return;
    const mediaEl = $('#last-fire-media');
    const cap = $('#last-fire-cap');
    const label = document.getElementById('last-fire-label');
    const night = isGatheringDay();
    const shots = nightShots(meetingKey());
    let prevKey = '';
    if (!night && !(shots && shots.length)) {
      const keys = [];
      (media || []).forEach(function (m) {
        if (m && m.meeting_key && keys.indexOf(m.meeting_key) === -1) keys.push(m.meeting_key);
      });
      keys.sort();
      prevKey = keys.filter(function (k) { return k < meetingKey(); }).pop() || '';
    }
    const roll = (shots && shots.length) ? shots : nightShots(prevKey);
    if (label) label.textContent = night ? 'TONIGHT' : 'LAST FIRE';
    if (night && (!roll || !roll.length)) {
      if (mediaEl) mediaEl.innerHTML = '';
      if (cap) cap.textContent = iShowedUp() ? "Drop a pic. That's tonight." : 'Check in. Then drop a pic.';
      el.classList.remove('hidden');
      updateAllNewBadges();
      return;
    }
    if (roll && roll.length) {
      if (mediaEl) {
        mediaEl.innerHTML = roll.map(function (m) {
          return '<img src="' + esc(m.data) + '" alt="">';
        }).join('');
      }
      if (cap) cap.textContent = night ? (roll.length + ' from the patio') : 'Last Monday.';
      el.classList.remove('hidden');
      updateAllNewBadges();
      return;
    }
    const hasCap = lastFire && String(lastFire.caption || '').trim();
    const hasPhoto = lastFire && lastFire.photo;
    if (!hasCap && !hasPhoto) {
      el.classList.add('hidden');
      if (mediaEl) mediaEl.innerHTML = '';
      if (cap) cap.textContent = '';
      updateAllNewBadges();
      return;
    }
    if (mediaEl) mediaEl.innerHTML = hasPhoto ? '<img src="' + esc(lastFire.photo) + '" alt="">' : '';
    if (cap) cap.textContent = hasCap ? String(lastFire.caption).trim() : '';
    if (label) label.textContent = 'LAST FIRE';
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

  function showView(name, opts) {
    if (!TAB_ORDER.includes(name)) return;
    const fromSwipe = opts && opts.fromSwipe;
    $$('.view').forEach(function (v) {
      v.classList.remove('active', 'view-swipe-in', 'view-enter', 'view-swipe-in-prev', 'view-swipe-in-next', 'elastic-dragging', 'elastic-settling');
      v.style.transform = '';
      v.style.opacity = '';
      v.style.transition = '';
    });
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = $(`#view-${name}`);
    const nav = $(`.nav-item[data-view="${name}"]`);
    if (view) {
      view.classList.add('active');
      view.classList.remove('view-enter');
      if (fromSwipe) {
        const dir = (opts && opts.swipeDir) || 'next';
        view.classList.add(dir === 'prev' ? 'view-swipe-in-prev' : 'view-swipe-in-next');
        setTimeout(() => {
          view.classList.remove('view-swipe-in-prev', 'view-swipe-in-next', 'view-swipe-in');
        }, 240);
      } else if (!(opts && opts.silent) && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        // Level 4: one-shot arrive on tab tap — not on swipe, not on silent
        void view.offsetWidth;
        view.classList.add('view-enter');
        setTimeout(() => view.classList.remove('view-enter'), 320);
      }
    }
    if (nav) {
      nav.classList.add('active');
      $$('.nav-item').forEach(n => n.classList.remove('nav-peek'));
      if (typeof tbGlowHit === 'function') tbGlowHit(nav, 'yellow');
    }
    currentViewName = name;
    try {
      document.body.classList.toggle('tb-view-about', name === 'about');
    } catch (e) {}
    try {
      const app = document.getElementById('app');
      if (app) {
        app.classList.remove('tb-underlay-depth');
        app.style.removeProperty('--tb-depth');
      }
    } catch (e) {}
    const header = $('#main-header');
    if (header) {
      header.style.display = 'block';
      header.style.visibility = 'visible';
      header.style.opacity = '1';
      header.removeAttribute('hidden');
    }
    // NEW no longer auto-clears on Home visit — only when items are opened
    if (name === 'brothers') {
      // Roster NEW clears when the brothers tab is opened
      markBrothersSeen();
    }
    try { parkFabByImin(); } catch (e) {}
  }

  function isOverlayBlockingSwipe() {
    if ($('#memory-viewer') && !$('#memory-viewer').classList.contains('hidden')) return true;
    if ($('#auth-gate') && !$('#auth-gate').classList.contains('hidden')) return true;
    if ($('#ios-install-overlay') && !$('#ios-install-overlay').classList.contains('hidden')) return true;
    if ($('#inapp-install-overlay') && !$('#inapp-install-overlay').classList.contains('hidden')) return true;
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
    if (target.closest('input, textarea, select, video')) return true;
    return false;
  }

  function setupTabSwipe() {
    const root = $('#views') || document.body;
    if (!root || root.dataset.tabSwipeFlick === '1') return;
    root.dataset.tabSwipeFlick = '1';
    let sx = 0, sy = 0, tracking = false;
    root.addEventListener('touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) { tracking = false; return; }
      if (swipeStartBlocked(e.target)) { tracking = false; return; }
      tracking = true;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) < 72) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.6) return;
      const i = TAB_ORDER.indexOf(currentViewName);
      if (dx < 0 && i >= 0 && i < TAB_ORDER.length - 1) {
        showView(TAB_ORDER[i + 1], { fromSwipe: true, swipeDir: 'next' });
      } else if (dx > 0 && i > 0) {
        showView(TAB_ORDER[i - 1], { fromSwipe: true, swipeDir: 'prev' });
      }
    }, { passive: true });
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

  /** Unlock body scroll only when no overlay still claims it */
  function anyOverlayOpen() {
    if (document.querySelector('.modal:not(.hidden)')) return true;
    if ($('#brother-detail') && !$('#brother-detail').classList.contains('hidden')) return true;
    if ($('#info-detail') && !$('#info-detail').classList.contains('hidden')) return true;
    if ($('#memory-viewer') && !$('#memory-viewer').classList.contains('hidden')) return true;
    if ($('#auth-gate') && !$('#auth-gate').classList.contains('hidden')) return true;
    return false;
  }
  function unlockBodyIfClear() {
    if (!anyOverlayOpen()) {
      document.body.style.overflow = '';
    }
  }

  /* LOCKED: CapCut VO explainer — H.264+AAC, loop, no chrome, sound on HOW open */
  function bindInstallExplainerOnce(v) {
    if (!v || v.dataset.tbExplainerBound === '1') return;
    v.dataset.tbExplainerBound = '1';
    v.playsInline = true;
    v.loop = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('loop', '');
    v.removeAttribute('controls');
    v.addEventListener('ended', () => {
      try {
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    });
    v.addEventListener('stalled', () => {
      try {
        if (!v.paused) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
      } catch (e) {}
    });
  }
  function playInstallExplainerWithAudio(v) {
    if (!v) return;
    bindInstallExplainerOnce(v);
    const cfg = (window.TB_CONFIG && window.TB_CONFIG.INSTALL_EXPLAINER) || {};
    const wantAudio = cfg.keepAudio !== false;
    try {
      v.playsInline = true;
      v.loop = true;
      if (wantAudio) {
        v.muted = false;
        v.defaultMuted = false;
        try { v.volume = 1; } catch (e) {}
        v.removeAttribute('muted');
      }
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) {
        p.catch(() => {
          try {
            v.muted = true;
            v.play().then(() => {
              v.classList.add('needs-tap');
            }).catch(() => { v.classList.add('needs-tap'); });
          } catch (e2) {
            v.classList.add('needs-tap');
          }
        });
      } else {
        v.classList.remove('needs-tap');
      }
    } catch (e) {}
  }
  function stopInstallExplainer(v) {
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
      v.classList.remove('needs-tap');
    } catch (e) {}
  }

  function openModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (id === 'install-modal') {
      const v = $('#install-gif');
      if (v && v.tagName === 'VIDEO') {
        if (v.readyState >= 2) playInstallExplainerWithAudio(v);
        else {
          v.addEventListener('loadeddata', () => playInstallExplainerWithAudio(v), { once: true });
          try { v.load(); } catch (e) {}
          setTimeout(() => playInstallExplainerWithAudio(v), 250);
        }
      }
    }
  }
  function closeModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    releaseFocusAndZoom();
    el.classList.add('hidden');
    if (id === 'thunder-modal') {
      try { document.body.classList.remove('tb-ask-open'); } catch (e) {}
    }
    unlockBodyIfClear();
    if (id === 'install-modal') {
      stopInstallExplainer($('#install-gif'));
    }
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

  function addThunderMsg(text, role, source, actions) {
    const box = $('#thunder-messages');
    const div = document.createElement('div');
    div.className = `thunder-msg ${role}`;
    const body = formatThunderHtml(text);
    div.innerHTML = body + (source ? `<div class="source">Source: <span>${esc(source)}</span></div>` : '');
    if (role === 'assistant' && actions && actions.length) {
      const row = document.createElement('div');
      row.className = 'thunder-actions';
      actions.forEach((a) => {
        if (!a || !a.id || !a.label) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'thunder-action-btn';
        b.textContent = a.label;
        b.dataset.tbAction = a.id;
        b.addEventListener('click', () => {
          try { tbFeedback.selection(); } catch (e) {}
          runThunderAction(a.id);
        });
        row.appendChild(b);
      });
      div.appendChild(row);
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  /** Session-only Thunder history (not permanent personal memory). */
  let __thunderHistory = [];
  function pushThunderHistory(role, content) {
    const c = String(content || '').trim();
    if (!c) return;
    __thunderHistory.push({ role: role, content: c.slice(0, 1200) });
    if (__thunderHistory.length > 8) __thunderHistory = __thunderHistory.slice(-8);
  }

  /** Surface only — human taps. Never privileged mutations. */
  function runThunderAction(id) {
    if (id === 'calendar') {
      const rb = document.getElementById('reminder-btn');
      if (rb) rb.click();
      else try { closeModal('thunder-panel'); } catch (e) {}
      return;
    }
    if (id === 'text_leader') {
      const tb = document.getElementById('text-leader-btn');
      if (tb) tb.click();
      return;
    }
    if (id === 'brothers') {
      try { closeModal('thunder-panel'); } catch (e) {}
      try { showView('brothers'); } catch (e) {}
      return;
    }
    if (id === 'im_in') {
      try { closeModal('thunder-panel'); } catch (e) {}
      try { showView('home'); } catch (e) {}
      const btn = document.getElementById('rsvp-btn');
      if (btn && !rsvp) btn.click();
      return;
    }
    if (id === 'code' || id === 'open_code') {
      try { closeModal('thunder-panel'); } catch (e) {}
      try { showView('more'); } catch (e) {}
      setTimeout(function () {
        const el = document.getElementById('the-code') || document.querySelector('.code-title-glow, .code-block, #view-about');
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }
    if (id === 'events') {
      try { closeModal('thunder-panel'); } catch (e) {}
      try { showView('events'); } catch (e) {}
      return;
    }
    if (id === 'install') {
      try { openModal('install-modal'); } catch (e) {
        try { closeModal('thunder-panel'); showView('more'); } catch (e2) {}
      }
      return;
    }
  }

  /** Action chips for local AND Grok paths — allowlisted client execution only. */
  function thunderActionsForQuery(query, localResult) {
    const q = (query || '').toLowerCase();
    const actions = [];
    if (q.includes('next meeting') || q.includes('when is') || q.includes('next gathering') || q.includes('what time') || q.includes('where') || q.includes('crooked can') || q.includes('venue')) {
      actions.push({ id: 'calendar', label: 'ADD TO CALENDAR' });
    }
    if (q.includes("who's in") || q.includes('rsvp') || q.includes("i'm in") || q.includes('im in') || q.includes('lock in')) {
      if (!rsvp) actions.push({ id: 'im_in', label: "I'M IN" });
    }
    if (q.includes('rough night') || q.includes('struggling') || q.includes('need to talk') || q.includes('who can i call') || q.includes('alone') || q.includes('depressed') || q.includes('anxious') || q.includes('crisis') || q.includes('suicid') || q.includes('text a leader') || q.includes('message the leader')) {
      actions.push({ id: 'text_leader', label: 'TEXT A LEADER' });
    }
    if (q.includes('who can help') || q.includes('directory') || (q.includes('brother') && !q.includes('carry your brother'))) {
      actions.push({ id: 'brothers', label: 'VIEW BROTHERS' });
    }
    if (q.includes('the code') || q.includes('what do we believe') || q.includes('how we roll') || q.includes('our rules')) {
      actions.push({ id: 'code', label: 'OPEN THE CODE' });
    }
    if (q.includes('memory') || q.includes('memories') || q.includes('past gathering') || q.includes('events')) {
      actions.push({ id: 'events', label: 'OPEN EVENTS' });
    }
    if (q.includes('install') || q.includes('home screen') || q.includes('add to home')) {
      actions.push({ id: 'install', label: 'INSTALL HELP' });
    }
    // De-dupe by id
    const seen = {};
    return actions.filter(function (a) {
      if (!a || seen[a.id]) return false;
      seen[a.id] = true;
      return true;
    });
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
      const line = rsvp
        ? "You're **LOCKED IN** on this phone for the next gathering."
        : "You haven't locked in yet.";
      return {
        text: line + "\n\nTap **I'M IN** on Home to claim your seat. Shared group roster comes when we wire it for every brother.",
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
        text: "You don’t have to handle tonight alone.\n\n" + names + " — reach a real man.\n\n**Have a question? Text a Leader** from Home if you need a direct line.",
        source: 'Brother Availability'
      };
    }

    if (query.includes('who can help') || query.includes('need someone') || query.includes('who knows') || query.includes('hvac') || query.includes('electrical') || query.includes('construction')) {
      return {
        text: "Once brothers fill profiles, I can match skills. For now: ask in the room, or **Have a question? Text a Leader** and we’ll point you to the right guy.",
        source: 'Brother Profiles'
      };
    }

    return null; // fall through to Grok
  }

  function buildGrokContext() {
    const next = getNextMeetingMonday();
    const dateStr = formatMeetingDate(next);
    const codeLines = CODE.map(c => c.line + ' ' + c.sub).join(' | ');
    let firstName = '';
    try {
      const me = (typeof brothers !== 'undefined' && brothers && myProfileId)
        ? brothers.find(function (b) { return b && b.id === myProfileId; })
        : null;
      if (me && me.name) firstName = String(me.name).trim().split(/\s+/)[0].slice(0, 40);
    } catch (e) {}
    let latestAnnouncement = '';
    try {
      if (typeof announcements !== 'undefined' && announcements && announcements.length) {
        const a = announcements[0];
        latestAnnouncement = (a.title || a.body || '').toString().slice(0, 180);
      }
    } catch (e) {}
    let currentView = '';
    try {
      const active = document.querySelector('.nav-item.active, .view.active');
      if (active && active.dataset && active.dataset.view) currentView = active.dataset.view;
      else if (document.getElementById('view-home') && !document.getElementById('view-home').classList.contains('hidden')) currentView = 'home';
    } catch (e) {}
    return {
      nextMeeting: dateStr + ' at ' + meetingTime() + ' — ' + venueName(),
      theCode: codeLines,
      identity: 'Sons of Thunder (Mark 3:17 Boanerges). Thunder doesn’t dull. Intense, loyal, built for more. Lead in marriage, kids, work, friends, neighbors.',
      firstName: firstName,
      rsvp: !!rsvp,
      currentView: currentView,
      latestAnnouncement: latestAnnouncement
    };
  }

  async function thunderRespondGrok(q) {
    const ctx = buildGrokContext();
    let res;
    try {
      res = await fetch('/.netlify/functions/thunder-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: ctx,
          history: __thunderHistory.slice(-8)
        })
      });
    } catch (netErr) {
      console.warn('Thunder AI network error', netErr);
      throw new Error(navigator.onLine === false ? 'OFFLINE' : 'NETWORK');
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
    return {
      text: String(answer),
      source: (data && data.source) || 'Grok'
    };
  }

  async function handleThunderSend() {
    const input = $('#thunder-input');
    const sendBtn = $('#thunder-send');
    const q = input.value.trim().slice(0, 500);
    if (!q) return;
    // Stampede guard: ignore second send while one is in flight (double-tap / Enter+click)
    if (window.__tbThunderInFlight) return;
    window.__tbThunderInFlight = true;
    addThunderMsg(q, 'user');
    input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    pushThunderHistory('user', q);

    const local = thunderRespondLocal(q);
    if (local) {
      setTimeout(() => {
        pushThunderHistory('assistant', local.text);
        addThunderMsg(local.text, 'assistant', local.source, thunderActionsForQuery(q, local));
        if (sendBtn) sendBtn.disabled = false;
        window.__tbThunderInFlight = false;
      }, 300);
      return;
    }

    addThunderMsg('…', 'assistant', null);
    const box = $('#thunder-messages');
    const pending = box ? box.lastElementChild : null;

    try {
      const res = await thunderRespondGrok(q);
      if (pending) pending.remove();
      const ans = res.text || 'No answer returned.';
      pushThunderHistory('assistant', ans);
      addThunderMsg(ans, 'assistant', res.source, thunderActionsForQuery(q, null));
    } catch (e) {
      if (pending) pending.remove();
      const code = (e && e.message) || '';
      if (code === 'OFFLINE' || navigator.onLine === false) {
        if (pending) pending.remove();
        addThunderMsg('You’re offline. Reconnect and try again — or **Have a question? Text a Leader** from Home.', 'assistant', null);
        if (sendBtn) sendBtn.disabled = false;
        window.__tbThunderInFlight = false;
        return;
      }
      let msg = `Can’t reach Thunder right now. Try again in a minute, or <strong>Have a question? Text a Leader</strong> from Home.`;
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
      window.__tbThunderInFlight = false;
    }
  }

  // ---------- EVENTS ----------
  function bindEvents() {
    $$('.nav-item').forEach(btn => {
      if (btn.dataset.navBound === '1') return;
      btn.dataset.navBound = '1';
      const go = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        showView(btn.dataset.view);
      };
      btn.addEventListener('click', go);
    });
    setupTabSwipe();

    $('#rsvp-btn').addEventListener('click', () => {
      const btn = $('#rsvp-btn');
      if (btn && btn.dataset.busy === '1') return;
      if (btn) {
        btn.dataset.busy = '1';
        btn.classList.add('is-locking');
      }
      const wasIn = !!rsvp;
      const turningOn = !wasIn;

      /* I'm In = consent. Same tap as the OS alert prompt. No extra screen. */
      if (turningOn) {
        try {
          requestNotifyPermission().then(function (perm) {
            if (perm === 'granted') {
              try { checkAndFireMeetingNotifications(); } catch (e) {}
            }
          });
        } catch (e) {}
      }

      // Contact haptic only (no tb-press class on RSVP — that transform:!important
      // fights commit-strike). Use selection pulse + optional confirm later.
      try {
        if (turningOn) {
          if (window.tbFeedback) tbFeedback.selection();
        }
      } catch (e) {}

      if (turningOn && btn && !prefersReducedMotion()) {
        btn.textContent = 'LOCKING IT IN…';
      }

      // Local source of truth for I'm In (device-local by design)
      rsvp = !rsvp;
      const ok = save('rsvp', rsvp);
      if (!ok) {
        rsvp = wasIn;
        if (btn) {
          btn.classList.remove('confirmed', 'is-locking', 'commit-strike', 'imin-strike', 'imin-afterglow');
          btn.textContent = "I'M IN";
          btn.dataset.busy = '0';
        }
        try { tbFeedback.warningOrError(btn); } catch (e) {}
        alert("We couldn’t lock that in. Try again.");
        return;
      }
      try { pushRsvp(!!rsvp); } catch (e) {}
      if (rsvp) {
        quietPushSubscribe()
          .then(function () { return notifyImInBroadcast(); })
          .catch(function () {});
      }

      if (!rsvp) {
        // Calm un-commit — no reverse lightning
        renderRsvp();
        if (btn) {
          btn.classList.remove('is-locking', 'commit-strike');
          btn.dataset.busy = '0';
        }
        try {
          showInstallToast('RSVP updated. If it’s on your calendar, remove it there too.');
        } catch (e) {}
        return;
      }

      // Success path: strike on red → yellow vault → then the next sheet
      const meetCard = document.querySelector('.next-meeting');
      try {
        if (window.ThunderFX) ThunderFX.lockedIn(btn, meetCard);
        else {
          try { tbFeedback.confirm(); } catch (e) {}
        }
      } catch (e) {
        try { tbFeedback.confirm(); } catch (e2) {}
      }
      setTimeout(function () {
        try { renderRsvp(); } catch (e) {}
        if (btn) {
          try { btn.classList.add('imin-afterglow'); } catch (e) {}
        }
      }, prefersReducedMotion() ? 0 : 420);
      if (btn) {
        setTimeout(() => {
          try {
            btn.classList.remove('is-locking', 'imin-strike');
            btn.dataset.busy = '0';
          } catch (e) {}
        }, 900);
      }

      try { utilizeImInBackground(); } catch (e) {}
      try { honorFirst('imin'); } catch (e) {}
      if (!isSignedIn() && supabaseEnabled()) {
        window.__tbA2hsAfterAuth = true;
        setTimeout(function () {
          try { openImInSignIn(); } catch (e) {}
        }, prefersReducedMotion() ? 400 : 1650);
      } else {
        setTimeout(function () { try { maybeOfferImInA2hs(); } catch (e) {} }, prefersReducedMotion() ? 500 : 1650);
      }
    });

    // Calendar confirm sheet
    (function bindCalSheet() {
      const add = document.getElementById('cal-confirm-add');
      const later = document.getElementById('cal-confirm-later');
      const sheet = document.getElementById('cal-confirm-sheet');
      const x = document.getElementById('cal-confirm-close');
      const native = document.getElementById('cal-confirm-native');
      if (native && !native.dataset.tbBound) {
        native.dataset.tbBound = '1';
        native.addEventListener('click', () => {
          try { lockInAppReminder(); } catch (e) {}
          try { addToNativeCalendar(); } catch (e) {}
        });
      }
      const a2hsCal = document.getElementById('cal-confirm-a2hs');
      if (a2hsCal && !a2hsCal.dataset.tbBound) {
        a2hsCal.dataset.tbBound = '1';
        a2hsCal.addEventListener('click', () => {
          try { closeCalConfirmSheet(); } catch (e) {}
          try { launchAddToHomeScreen(); } catch (e) {}
        });
      }
      if (add && !add.dataset.tbBound) {
        add.dataset.tbBound = '1';
        add.addEventListener('click', () => {
          try { lockInAppReminder(); } catch (e) {}
          try { renderRsvp(); } catch (e) {}
          const rb = document.getElementById('reminder-btn');
          if (rb) { rb.classList.add('set'); rb.textContent = 'REMINDER ON'; }
          closeCalConfirmSheet();
          try {
            if (!isStandalonePwa()) showHomeA2hs();
          } catch (e) {}
        });
      }
      if (later && !later.dataset.tbBound) {
        later.dataset.tbBound = '1';
        later.addEventListener('click', () => closeCalConfirmSheet());
      }
      if (x && !x.dataset.tbBound) {
        x.dataset.tbBound = '1';
        x.addEventListener('click', () => closeCalConfirmSheet());
      }
      if (sheet && !sheet.dataset.tbBound) {
        sheet.dataset.tbBound = '1';
        sheet.addEventListener('click', (e) => {
          if (e.target === sheet) closeCalConfirmSheet();
        });
      }
    })();

        const myQrBtn = $('#profile-my-qr');
    if (myQrBtn) {
      myQrBtn.addEventListener('click', () => {
        const me = (brothers || []).find(b => b.id === myProfileId);
        if (!me || !digitsOnly(me.phone)) {
          alert('Save your profile with a phone number first.');
          updateMyQrButtonVisibility();
          return;
        }
        closeModal('profile-modal');
        showContactQR(me);
      });
    }

    const whyQr = $('#profile-qr-why');
    if (whyQr) {
      whyQr.addEventListener('click', () => {
        openModal('qr-explainer-modal');
      });
    }
    const qrExplainerDone = $('#qr-explainer-done');
    if (qrExplainerDone) {
      qrExplainerDone.addEventListener('click', () => {
        closeModal('qr-explainer-modal');
      });
    }

$('#edit-profile-btn').addEventListener('click', () => {
      if (typeof tbGlowHit === 'function') tbGlowHit($('#edit-profile-btn'), 'yellow');
      if (!isSignedIn()) startMemberSignIn();
      else openProfileEditor();
    });
    $('#upload-media-btn').addEventListener('click', () => {
      if (supabaseEnabled() && !isSignedIn()) {
        startMemberSignIn();
        return;
      }
      if (!supabaseEnabled()) {
        alert('Shared memories are not configured yet. Add Supabase URL and anon key.');
        return;
      }
      openDropShot();
    });

    $$('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    bindBrotherDetail();
    bindMemoryViewer();
    bindInfoDetail();
    bindSwipeCloseAllWindows();

    // Profile photo
    $('#profile-photo').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        pendingPhotoData = ev.target.result;
        const preview = $('#photo-preview');
        preview.innerHTML = `<img src="${esc(pendingPhotoData)}">`;
        preview.classList.add('visible');



        
      };
      reader.readAsDataURL(file);
    });

    $('#save-profile').addEventListener('click', async () => {
      try { tbFeedback.press($('#save-profile')); } catch (e) {}
      const name = $('#profile-name').value.trim();
      const bio = $('#profile-bio').value.trim();
      const phoneRaw = ($('#profile-phone') && $('#profile-phone').value) || '';
      const phone = digitsOnly(phoneRaw) ? phoneRaw.trim() : '';
      if (!name) { try { tbFeedback.warningOrError($('#profile-name') || $('#save-profile')); } catch (e) {} return alert('Name required'); }
      const id = ensureBrotherId();
      const existing = brothers.findIndex(b => b.id === id);


      const rawBday = ($('#profile-birthday') && $('#profile-birthday').value) || '';
      const birthday = normalizeBirthday(rawBday);
      
      let entry = {
        id,
        name,
        bio,
        phone,
        birthday: birthday || null,
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
        updateMyQrButtonVisibility();
        try { syncBrothersSeatBtn(); } catch (e) {}
        renderBrothers();
        closeModal('profile-modal');
        pendingPhotoData = null;
        rewardSaveSuccess('profile');
        try { updatePersonalHome(); } catch (e) {}
        if (!supabaseEnabled()) {
          /* soft toast already rewards; keep local-only note brief */
          setTimeout(() => {
            try {
              const t = document.getElementById('install-toast');
              if (t) {
                t.textContent = 'On this phone only until shared roster is on.';
                t.classList.remove('hidden');
                setTimeout(() => t.classList.add('hidden'), 3200);
              }
            } catch (e) {}
          }, 300);
        } else if (entry._sharedPush === 'sign_in_required') {
          setTimeout(() => {
            try { startMemberSignIn(); } catch (e) {}
          }, 400);
        } else if (entry._sharedPush && entry._sharedPush !== 'ok') {
          setTimeout(() => {
            try {
              const t = document.getElementById('install-toast');
              if (t) {
                t.textContent = 'Saved here. Shared roster update failed.';
                t.classList.remove('hidden');
                setTimeout(() => t.classList.add('hidden'), 3200);
              }
            } catch (e) {}
          }, 300);
        }
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
    const camInput = $('#media-file-cam');
    if (camInput && camInput.dataset.tbBound !== '1') {
      camInput.dataset.tbBound = '1';
      camInput.addEventListener('change', function () {
        const src = camInput.files && camInput.files[0];
        if (src) ingestMemoryFile(src);
        try { camInput.value = ''; } catch (e) {}
      });
    }
    const liveCam = document.getElementById('memory-cam');
    if (liveCam && liveCam.dataset.tbBound !== '1') {
      liveCam.dataset.tbBound = '1';
      liveCam.addEventListener('change', function () {
        const src = liveCam.files && liveCam.files[0];
        if (src) ingestMemoryFile(src);
        try { liveCam.value = ''; } catch (e) {}
      });
    }
    const liveLib = document.getElementById('memory-lib');
    if (liveLib && liveLib.dataset.tbBound !== '1') {
      liveLib.dataset.tbBound = '1';
      liveLib.addEventListener('change', function () {
        const src = liveLib.files && liveLib.files[0];
        if (src) ingestMemoryFile(src);
        try { liveLib.value = ''; } catch (e) {}
      });
    }
    $('#save-media').addEventListener('click', () => {
      try { tbFeedback.press($('#save-media')); } catch (e) {}
      const file = $('#media-file').files[0];
      if (!file) return alert('Choose a file');

      if (supabaseEnabled() && !isSignedIn()) {
        closeModal('media-modal');
        startMemberSignIn();
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
      if (btn) { btn.disabled = true; btn.textContent = isVideo ? 'Uploading…' : 'Polishing…'; }

      const item = {
        blob: file,
        filename: file.name,
        type: isVideo ? 'video' : 'image',
        caption: ($('#media-caption').value || '').trim(),
        date: new Date().toISOString(),
        uploader_name: myDisplayName() || ''
      };
      (async function () {
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
          rewardSaveSuccess('memory');
        } catch (err) {
          console.error(err);
          alert('Could not save memory. ' + (err.message || 'Try again.'));
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = 'Add to Memories'; }
        }
      })();
    });

    // Auth gate actions
    const authEntryBtn = $('#auth-entry-btn');
    if (authEntryBtn && authEntryBtn.dataset.tbBound !== '1') {
      authEntryBtn.dataset.tbBound = '1';
    }
    const authSignInBtn = $('#auth-signin-btn');
    const authSignUpBtn = $('#auth-signup-btn');
    const authForgotBtn = $('#auth-forgot-btn');
    const authMagicBtn = $('#auth-magic-btn');
    const authCancelBtn = $('#auth-cancel-btn');
    const authSignOutBtn = $('#auth-signout-btn');

    if (authSignInBtn && authSignInBtn.dataset.bound !== '1') {
      authSignInBtn.dataset.bound = '1';
      authSignInBtn.addEventListener('click', async () => {
        const seat = stashSeatFromGate();
        const email = seat.email;
        if (!seat.name || !email) return setAuthError('Name and email.');
        setAuthError('');
        authSignInBtn.disabled = true;
        try {
          await authMagicLink(email);
          setAuthError('Link sent.');
          setTimeout(function () { try { closeAuthGate(); } catch (e2) {} }, 900);
        } catch (e) {
          setAuthError((e && e.message) || 'Could not send the link.');
        } finally {
          authSignInBtn.disabled = false;
        }
      });
    }
    if (authSignUpBtn && authSignUpBtn.dataset.bound !== '1') {
      authSignUpBtn.dataset.bound = '1';
      authSignUpBtn.addEventListener('click', async () => {
        const seat = stashSeatFromGate();
        const email = seat.email;
        if (!seat.name || !email) return setAuthError('Name and email.');
        setAuthError('');
        authSignUpBtn.disabled = true;
        try {
          await authMagicLink(email);
          setAuthError('Link sent.');
          setTimeout(function () { try { closeAuthGate(); } catch (e2) {} }, 900);
        } catch (e) {
          setAuthError((e && e.message) || 'Could not send the link.');
        } finally {
          authSignUpBtn.disabled = false;
        }
      });
    }
    if (authMagicBtn && authMagicBtn.dataset.bound !== '1') {
      authMagicBtn.dataset.bound = '1';
      authMagicBtn.addEventListener('click', async () => {
        const seat = stashSeatFromGate();
        const email = seat.email;
        if (!seat.name || !email) return setAuthError('Name and email.');
        setAuthError('');
        authMagicBtn.disabled = true;
        try {
          await authMagicLink(email);
          setAuthError('Link sent.');
          setTimeout(function () { try { closeAuthGate(); } catch (e2) {} }, 900);
        } catch (e) {
          setAuthError((e && e.message) || 'Could not send the link.');
        } finally {
          authMagicBtn.disabled = false;
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
      authCancelBtn.addEventListener('click', () => {
        closeAuthGate();
      });
    }
    const authEmail = $('#auth-email');
    const authPhone = $('#auth-phone');
    const authName = $('#auth-name');
    if (authName && authName.dataset.enterBound !== '1') {
      authName.dataset.enterBound = '1';
      authName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && authSignInBtn) authSignInBtn.click();
      });
    }
    if (authPhone && authPhone.dataset.enterBound !== '1') {
      authPhone.dataset.enterBound = '1';
      authPhone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && authSignInBtn) authSignInBtn.click();
      });
    }
    if (authEmail && authEmail.dataset.enterBound !== '1') {
      authEmail.dataset.enterBound = '1';
      authEmail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && authSignInBtn) authSignInBtn.click();
      });
    }
    if (authSignOutBtn && authSignOutBtn.dataset.bound !== '1') {
      authSignOutBtn.dataset.bound = '1';
      authSignOutBtn.addEventListener('click', async () => {
        try { await authSignOut(); } catch (e) { console.warn(e); }
      });
    }

    // ---------- THUNDER VOICE MODE (Web Speech API) ----------
    let thunderRecognition = null;
    let thunderListening = false;
    let thunderVoiceMode = false;

    function thunderSpeechSupported() {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    function setThunderVoiceUI(state) {
      const btn = $('#thunder-voice-btn');
      const label = $('#thunder-voice-label');
      const hint = $('#thunder-voice-hint');
      const bar = $('#thunder-voice-bar');
      if (!btn) return;
      btn.classList.remove('is-listening', 'is-unsupported');
      if (state === 'listening') {
        thunderListening = true;
        btn.classList.add('is-listening');
        if (label) label.textContent = 'LISTENING…';
        if (hint) hint.textContent = 'Speak now — I’m listening';
      } else if (state === 'unsupported') {
        thunderListening = false;
        btn.classList.add('is-unsupported');
        if (label) label.textContent = 'TYPE BELOW';
        if (hint) hint.textContent = 'Voice not available on this browser — type your question';
      } else if (state === 'ready') {
        thunderListening = false;
        if (label) label.textContent = 'ASK THUNDER';
        if (hint) hint.textContent = 'Tap when you’re ready to speak';
      } else {
        thunderListening = false;
        if (label) label.textContent = 'ASK THUNDER';
        if (hint) hint.textContent = 'Tap when you’re ready to speak';
      }
    }

    function stopThunderVoice() {
      try {
        if (thunderRecognition) thunderRecognition.stop();
      } catch (e) {}
      thunderListening = false;
      setThunderVoiceUI('ready');
    }

    function startThunderVoice() {
      if (!thunderSpeechSupported()) {
        setThunderVoiceUI('unsupported');
        const input = $('#thunder-input');
        if (input) input.focus();
        return;
      }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        if (thunderRecognition) {
          try { thunderRecognition.stop(); } catch (e) {}
        }
        thunderRecognition = new SR();
        thunderRecognition.lang = 'en-US';
        thunderRecognition.interimResults = false;
        thunderRecognition.maxAlternatives = 1;
        thunderRecognition.continuous = false;

        thunderRecognition.onstart = () => setThunderVoiceUI('listening');
        thunderRecognition.onerror = (ev) => {
          console.warn('thunder voice', ev && ev.error);
          setThunderVoiceUI('ready');
          const hint = $('#thunder-voice-hint');
          const err = (ev && ev.error) || '';
          if (!hint) return;
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            hint.textContent = 'Mic blocked — allow microphone or type below';
          } else if (err === 'no-speech' || err === 'aborted') {
            hint.textContent = "Couldn't hear that. Tap the mic and try again.";
          } else if (err === 'network') {
            hint.textContent = "Voice isn't available right now. Type below.";
          } else {
            hint.textContent = "Couldn't hear that. Tap the mic and try again.";
          }
        };
        thunderRecognition.onend = () => {
          if (thunderListening) setThunderVoiceUI('ready');
        };
        thunderRecognition.onresult = (event) => {
          const result = event.results && event.results[0] && event.results[0][0];
          const transcript = result && result.transcript ? String(result.transcript).trim() : '';
          setThunderVoiceUI('ready');
          if (!transcript) return;
          const input = $('#thunder-input');
          if (input) input.value = transcript;
          try { tbFeedback.press(); } catch (e) {}
          handleThunderSend();
        };
        thunderRecognition.start();
        thunderListening = true;
      } catch (e) {
        console.warn('thunder voice start', e);
        setThunderVoiceUI('unsupported');
      }
    }

    function openThunderVoiceMode() {
      thunderVoiceMode = true;
      openModal('thunder-modal');
      try { document.body.classList.add('tb-ask-open'); } catch (e) {}
      setThunderVoiceUI(thunderSpeechSupported() ? 'ready' : 'unsupported');
    }



    // ---------- THUNDER VOICE ROUTER (permanent architecture) ----------
    // Tiers: (1) PWA mic + optional foreground wake  (2) OS shortcuts via ?ask=1&voice=1
    // (3) native shell = FUTURE only. No always-on background mic. No system-wide "Hey Thunder".
    const ThunderVoice = (function () {
      let wakeEnabled = false;
      let wakeRec = null;
      let wakeActive = false;
      let state = 'OFF'; // OFF|READY|WAKE_LISTENING|QUESTION_LISTENING|PROCESSING|ERROR

      function isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      }

      function setState(s) {
        state = s;
        try { window.__tbVoiceState = s; } catch (e) {}
      }

      function isHeyThunder(text) {
        const t = String(text || '')
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (!t) return false;
        // Require hey/hi + thunder as a phrase — avoid lone "thunder"
        if (/\b(hey|hi)\s+thunder\b/.test(t)) return true;
        if (t === 'hey thunder' || t === 'hi thunder') return true;
        return false;
      }

      function stopWake() {
        wakeActive = false;
        try { if (wakeRec) wakeRec.stop(); } catch (e) {}
        wakeRec = null;
        if (state === 'WAKE_LISTENING') setState(wakeEnabled ? 'READY' : 'OFF');
        const chip = document.getElementById('thunder-wake-chip');
        if (chip) {
          chip.classList.toggle('is-on', !!wakeEnabled);
          chip.classList.remove('is-listening');
          const lab = chip.querySelector('.thunder-wake-lab');
          if (lab) lab.textContent = '';
        }
      }

      function startWakeLoop() {
        /* RETIRED: Hey Thunder continuous listen — no-op */
        return;
        if (!wakeEnabled || !isSupported()) return;
        if (document.hidden) return;
        if (thunderListening) return; // question capture owns mic
        const modalOpen = $('#thunder-modal') && !$('#thunder-modal').classList.contains('hidden');
        // Wake only while app is open and Ask Thunder is NOT already open
        if (modalOpen) return;
        try {
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (wakeRec) { try { wakeRec.stop(); } catch (e) {} }
          wakeRec = new SR();
          wakeRec.lang = 'en-US';
          wakeRec.interimResults = false;
          wakeRec.maxAlternatives = 1;
          wakeRec.continuous = true;
          wakeActive = true;
          setState('WAKE_LISTENING');
          const chip = document.getElementById('thunder-wake-chip');
          if (chip) {
            chip.classList.add('is-on', 'is-listening');
            const lab = chip.querySelector('.thunder-wake-lab');
            if (lab) lab.textContent = '';
          }
          wakeRec.onresult = (event) => {
            try {
              const res = event.results && event.results[event.results.length - 1];
              if (!res || !res.isFinal) return;
              const transcript = res[0] && res[0].transcript ? String(res[0].transcript).trim() : '';
              if (!isHeyThunder(transcript)) return;
              stopWake();
              try {
                if (window.ThunderFX && ThunderFX.select) ThunderFX.select($('#thunder-fab'));
                else tbFeedback.selection();
              } catch (e) {}
              openThunderVoiceMode();
            } catch (e) {}
          };
          wakeRec.onerror = () => {
            // Don't loop aggressively on error
            wakeActive = false;
            setState(wakeEnabled ? 'READY' : 'OFF');
          };
          wakeRec.onend = () => {
            wakeActive = false;
            // Restart only if still enabled, visible, and modal closed
            if (wakeEnabled && !document.hidden) {
              const open = $('#thunder-modal') && !$('#thunder-modal').classList.contains('hidden');
              if (!open && !thunderListening) {
                setTimeout(() => { try { startWakeLoop(); } catch (e) {} }, 600);
              }
            }
          };
          wakeRec.start();
        } catch (e) {
          wakeActive = false;
          setState('ERROR');
        }
      }

      function setWakeEnabled(on) {
        /* RETIRED 2026-08-17: continuous Hey Thunder wake — permanent off */
        wakeEnabled = false;
        try { localStorage.setItem('tb_hey_thunder', '0'); } catch (e) {}
        try { localStorage.removeItem('tb_hey_thunder'); } catch (e) {}
        const chip = document.getElementById('thunder-wake-chip');
        if (chip) {
          chip.classList.add('hidden');
          chip.setAttribute('hidden', 'hidden');
          chip.setAttribute('aria-hidden', 'true');
          chip.classList.remove('is-on', 'is-listening');
        }
        try { stopWake(); } catch (e) {}
        setState('OFF');
      }

      function openAsk(opts) {
        opts = opts || {};
        const modal = $('#thunder-modal');
        const alreadyOpen = modal && !modal.classList.contains('hidden');
        openModal('thunder-modal');
        try { document.body.classList.add('tb-ask-open'); } catch (e) {}
        thunderVoiceMode = true;
        try {
          const hero = document.querySelector('.thunder-ask-hero-img');
          if (hero && !alreadyOpen) {
            hero.classList.remove('tb-tux-in');
            void hero.offsetWidth;
            hero.classList.add('tb-tux-in');
          }
        } catch (e) {}
        if (alreadyOpen && thunderListening) return;
        // Never auto-listen. Brother taps ASK THUNDER to speak.
        if (opts.voice === true && isSupported()) {
          setTimeout(() => {
            if (thunderListening) return;
            startThunderVoice();
          }, opts.delay != null ? opts.delay : 280);
        } else {
          setThunderVoiceUI(isSupported() ? 'ready' : 'unsupported');
        }
      }

      function handleDeepLink() {
        try {
          // One deep-link owner per boot — Tap Thunder already claimed
          try { if (window.__tbRouteOwned === 'tap') return false; } catch (e) {}
          const q = new URLSearchParams(window.location.search || '');
          const ask = q.get('ask') === '1' || q.get('thunder') === '1';
          const voice = q.get('voice') === '1' || q.get('voice') === 'true';
          const view = q.get('view');
          if (view === 'home' || view === 'brothers' || view === 'events' || view === 'more') {
            try { if (typeof showView === 'function') showView(view); } catch (e) {}
          }
          if (!ask) return false;
          // Clean URL without reload
          try {
            const u = new URL(window.location.href);
            u.searchParams.delete('ask');
            u.searchParams.delete('voice');
            u.searchParams.delete('thunder');
            window.history.replaceState({}, '', u.pathname + (u.search || '') + (u.hash || ''));
          } catch (e) {}
          setTimeout(() => openAsk({ voice: voice, delay: 400 }), 500);
          return true;
        } catch (e) { return false; }
      }

      function init() {
        /* Hey Thunder retired — force off, hide chip, clear stored preference */
        wakeEnabled = false;
        try { localStorage.setItem('tb_hey_thunder', '0'); localStorage.removeItem('tb_hey_thunder'); } catch (e) {}
        const chip = document.getElementById('thunder-wake-chip');
        if (chip) {
          chip.classList.add('hidden');
          chip.setAttribute('hidden', 'hidden');
          chip.setAttribute('aria-hidden', 'true');
          chip.classList.remove('is-on', 'is-listening');
          /* no click handler — wake path dead */
        }
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            try { stopWake(); } catch (e) {}
            try { stopThunderVoice(); } catch (e) {}
          }
        });
        setState('OFF');
      }

      return {
        isSupported: isSupported,
        openAsk: openAsk,
        handleDeepLink: handleDeepLink,
        setWakeEnabled: setWakeEnabled,
        stopWake: stopWake,
        getState: function () { return state; },
        init: init
      };
    })();
    try { window.ThunderVoice = ThunderVoice; } catch (e) {}

    let __fabBeatTimer = null;
    let __fabMidTimer = null;
    let __fabSigTimer = null;
    let __fabHoldTimer = null;
    let __fabOpenedAt = 0;
    function fabJustOpened() {
      return __fabOpenedAt && (Date.now() - __fabOpenedAt < 12000);
    }
    function fabWaitingLong() {
      return !fabJustOpened() && (Date.now() - __fabQuietSince > 8000);
    }
    const FAB_DEFAULT = 'assets/thunder-cool-fab.png';
    const FAB_FRAMES = {
      watch: 'assets/thunder-idle-watch.png',
      salute: 'assets/thunder-idle-salute.png',
      bond: 'assets/thunder-idle-bond.png'
    };
    function fabImg() { return document.querySelector('#thunder-fab .thunder-fab-img'); }
    window.__tbFabFrames = { watch: false, salute: false, bond: false };
    function fabHasFrame(key) {
      return !!(FAB_FRAMES[key] && window.__tbFabFrames && window.__tbFabFrames[key]);
    }
    let __fabFrameTimer = null;
    function fabRestoreHead() {
      const img = fabImg();
      const fab = document.getElementById('thunder-fab');
      if (!img) return;
      img.setAttribute('src', FAB_DEFAULT + '?v=20260819-arms2');
      img.setAttribute('srcset', 'assets/thunder-cool-fab.png?v=20260819-arms2 256w, assets/thunder-cool-fab@2x.png?v=20260819-arms2 512w');
      img.classList.remove('tb-fab-act', 'tb-fab-inspect', 'tb-fab-look');
      if (fab) fab.classList.remove('tb-fab-acting');
    }
    function fabPlayFrame(key, ms) {
      const img = fabImg();
      const fab = document.getElementById('thunder-fab');
      if (!img || fabBusy()) return false;
      const src = FAB_FRAMES[key];
      if (!src || !fabHasFrame(key)) return false;
      if (__fabFrameTimer) try { clearTimeout(__fabFrameTimer); } catch (e) {}
      img.setAttribute('src', src + '?v=20260819-arms2');
      img.removeAttribute('srcset');
      if (fab) fab.classList.add('tb-fab-acting');
      img.classList.add('tb-fab-act');
      __fabFrameTimer = setTimeout(function () {
        fabRestoreHead();
        img.classList.add('tb-fab-alive');
      }, ms || 1800);
      return true;
    }
    function fabBusy() {
      return document.body.classList.contains('tb-ask-open') || document.body.classList.contains('tb-tour-open');
    }
    function fabBaseline() {
      const img = fabImg();
      if (!img) return;
      if (__fabFrameTimer) try { clearTimeout(__fabFrameTimer); } catch (e) {}
      __fabFrameTimer = null;
      img.style.setProperty('--fab-r', '0deg');
      img.style.setProperty('--fab-s', '1');
      img.style.setProperty('--fab-x', '0px');
      img.style.setProperty('--fab-y', '0px');
      fabRestoreHead();
      img.classList.add('tb-fab-alive');
    }
    function fabInspect() {
      const img = fabImg();
      if (!img || fabBusy()) return false;
      if (!fabPlayFrame('bond', 4500)) return false;
      img.classList.add('tb-fab-inspect');
      return true;
    }
    function stopThunderBackstageIdle() {
      [__fabBeatTimer, __fabMidTimer, __fabSigTimer, __fabHoldTimer, __fabLineTimer].forEach(function (t) {
        if (t) try { clearTimeout(t); } catch (e) {}
      });
      __fabBeatTimer = __fabMidTimer = __fabSigTimer = __fabHoldTimer = __fabLineTimer = null;
      fabHideBubble();
      fabStopMotion();
      const img = fabImg();
      if (img) img.classList.remove('tb-host-alive', 'tb-fab-alive', 'tb-fab-look');
    }
    let __fabLastMicro = '';
    /* FAB_BUBBLES — 90-day refresh: THUNDER-DECISIONS.md “BUBBLE REFRESH”. Locked 10 stay. */
    const FAB_ENCOURAGE = [
      'Hey, brother—you’re doing better than you think.',
      'Whatever today handed you, you’re strong enough to carry it.',
      'Keep going. I’ve seen your kind—you don’t quit.',
      'You’ve got this, brother. And your brothers have you.',
      'Bad day? Maybe. Bad life? Not even close.',
      'Just a reminder: you matter more than you realize.',
      'Take a breath, reset, and bring the thunder.',
      'Look at you—still showing up. That counts for something.',
      'You don’t have to have it all figured out today.',
      'Head up, brother. You were built for more than this moment.'
    ];
    const FEATURE_SELL = [
      /* I'm In */
      'Hit I’M IN. The room knows you’re coming.',
      'Seat’s a rumor till you lock it.',
      'I’M IN is the nod. One tap. Done.',
      'Lock the seat. Forget it till Monday.',
      'Your name on the patio starts with I’M IN.',
      'Don’t ghost the count. Lock in.',
      'Brothers watch that number climb. Be on it.',
      'The reminder rides I’M IN. That’s the trick.',
      'Open seat. Close it.',
      'Monday doesn’t guess. I’M IN tells it.',
      /* Calendar */
      'I’M IN puts a 7-day tap on your phone.',
      'Don’t trust your memory. Trust the lock.',
      'Calendar stays in the app. You don’t leave.',
      /* I'm Here / raffle */
      'Patio night: I’M HERE. That’s the beer ticket.',
      'Walk up. Check in. Pizza’s on. Hat’s in play.',
      'Showed up? Prove it. I’M HERE.',
      'Raffle’s for men who walked in. Not the maybe list.',
      /* Memories / DROP A PIC */
      'Drop a pic. That’s how Monday survives the week.',
      'The night only lives if someone shoots it.',
      'Camera. One frame. The boys keep it.',
      'Memories isn’t homework. It’s the proof.',
      'If it was worth laughing at, it’s on the roll.',
      'Patio pics don’t live in your camera roll. Drop them.',
      'Newest shot sits up top. Make it yours.',
      'History doesn’t write itself. DROP A PIC.',
      'One picture from tonight beats ten stories next month.',
      'The room remembers what you drop. Not what you meant to.',
      /* Brothers / round table */
      'Brothers page. Round table. Your seat’s a face.',
      'Names. Faces. A way to reach the man.',
      'You’re not a roster number. Open Brothers.',
      'Every man has a chair. That’s the round table.',
      'Find a brother. Share the contact. That’s the app.',
      'The storm has faces. They’re in Brothers.',
      'Don’t be a name they can’t text. Fill the card.',
      'Round table energy. No cheap seats.',
      /* Text a leader */
      'Rough week? Text a leader. It stays in the room.',
      'Idea for the patio? Don’t sit on it.',
      'Confidential. Always. That’s Text a Leader.',
      'Leaders aren’t mind readers. Hit the line.',
      'One text. No stage. No speech.',
      'Got a hobby the fellas would ride for? Tell a leader.',
      /* Ask Thunder */
      'Tap me when you’re ready. I don’t eavesdrop.',
      'Sports. Work. God. The weird one. I take it.',
      'I’m in the corner. Not in your pocket till you tap.',
      'World-sized question. Tiny tap.',
      'I don’t listen until you do. That’s the deal.',
      'Stuck? Ask. That’s why I’m here.',
      /* Sign-in */
      'Sign in. I’M IN actually counts.',
      'Unsigned, you’re a ghost. The patio doesn’t know.',
      'One sign-in. Then your name hits every phone.',
      'Memories follow you. Sign in. Don’t leave nights on one phone.',
      'Signed in is the backstage pass.',
      'Already a Member. That’s how you join the count.',
      /* Install / share */
      'Put it on the Home Screen. That’s when it becomes a room.',
      'Share Thunder with a brother. One link. He’s in.',
      'Icon on the phone. That’s how you don’t forget Monday.',
      /* The Code */
      'The Code isn’t wallpaper. It’s why you’re here.',
      'Read The Code once. Then live it on the patio.',
      /* Gathering night */
      'Patio’s lit. Drop a pic. That’s tonight.',
      'Pizza’s here. Phone out. One frame.',
      'If you showed, check in. Beer and a hat don’t guess.'
    ];
    const FAB_FACTS = [
      'Golf. On the moon. 1971. Six-iron.',
      'A baseball lasts seven pitches. Then it’s history.',
      'Olympic gold is mostly silver.',
      'Gretzky and his brother? Highest-scoring siblings in the NHL. Brent had four points.',
      'Jordan got cut. Sophomore year. Varsity.',
      'Hockey pucks go in the freezer first. Bounce less.',
      'The marathon is 26.2 because a queen wanted a better view. London, 1908.',
      'A golf ball’s dimples aren’t decoration. They’re the engine.',
      'Secretariat won Belmont by 31 lengths. They still run the tape.',
      'Football’s called pigskin. It’s cowhide.',
      'Tour de France yellow? A newspaper was yellow. That’s it.',
      'Ali’s rope-a-dope was a plan. Not panic.',
      'Dolly kept Jolene from Elvis. She kept the publishing.',
      'Bohemian Rhapsody. No chorus. Still won.',
      'That old Nokia ring? Classical guitar.',
      'Hendrix played a right-handed Strat upside down.',
      'Cash flipped the bird at San Quentin. That’s the album cover.',
      'Happy Birthday was under copyright until 2015. Wild.',
      'A piano has about 12,000 parts. For 88 keys.',
      'The Beatles’ last show. A roof. 42 minutes. Then the cops.',
      'Funk Brothers played on more Motown hits than the names on the label.',
      'Stallone wrote Rocky in three days. And kept the part.',
      'Bond was offered to Cary Grant. He passed.',
      'Harrison Ford was a carpenter on the Star Wars set. Then he was Han.',
      'Jaws’ shark barely worked. That’s why you almost never see it.',
      'Die Hard. Christmas movie. I’m not taking questions.',
      'John Wick. The whole movie is the puppy.',
      'Spielberg got rejected from film school. Twice.',
      'The Wilhelm scream is in hundreds of movies. Same yell.',
      'Terminator. First one. $6.4 million.',
      'The Great Pyramid held the height record for 3,800 years.',
      'Chrysler hid a 185-foot spire inside. Beat the rival overnight.',
      'Empire State. 410 days. 3,400 men.',
      'Roman concrete still laughs at seawater.',
      'A 2x4 is not 2 by 4. Hasn’t been in a long time.',
      'Phillips was designed to cam out at torque. On purpose.',
      'Drywall showed up in 1916. Called Sackett Board.',
      'World’s oldest wooden building is in Japan. 1,300 years standing.',
      'London Bridge is in Arizona. They bought it in ’68.',
      'About 200 hands touch a cigar before you do.',
      'Men have fished for 40,000 years. You’re in a long line.',
      'WD-40. Water Displacement, 40th formula.',
      'Velcro. Dog burrs. Swiss engineer. 1941.',
      'Duct tape started as duck tape. For boats.',
      'Bubble wrap was supposed to be wallpaper.',
      'Swiss Army knife. Original had two tools.',
      'A compass points to magnetic north. True north is a different argument.',
      'Cleopatra lived closer to us than to the pyramids.',
      'Horned Vikings? Opera did that. Not history.',
      'Napoleon wasn’t short. British cartoons were.',
      'Shortest war. Britain and Zanzibar. 38 minutes.',
      'The 300 at Thermopylae had thousands of friends. 300 sold better.',
      'Titanic had a sister. Olympic. She made it.',
      'SOS isn’t three letters. It’s a sound pattern.',
      'A day on Venus is longer than its year.',
      'Moon footprints. No wind. Still there.',
      'More trees on Earth than stars in the Milky Way.',
      'The first F-150 badge. 1975.',
      'Jeep was GP. General purpose. The name stuck.',
      'Ferrari’s horse was a WWI ace’s emblem.',
      'The first Corvette was a six. Not a V8.',
      'Checkered flag came from horse racing.',
      'Honey doesn’t spoil. They’ve opened 3,000-year-old jars.',
      'Worcestershire has anchovies. That’s the kick.',
      'Tabasco ages in barrels. Like whiskey.',
      'Ketchup was sold as medicine in the 1830s.',
      'An octopus has three hearts. Two stop when it swims.',
      'A shrimp’s heart is in its head.',
      'Crocodiles can’t stick out their tongues.',
      'Goats have rectangular pupils. Built-in perimeter scan.',
      'A blue whale’s heart is the size of a golf cart.',
      'Your knuckles don’t make that sound by breaking. Bubbles in the joint.',
      'Hot water can freeze faster than cold. Mpemba. Still argued.',
      'The Eiffel Tower grows about six inches in summer heat.',
      'Alaska is the eastest, westest, and northest U.S. state.',
      'Australia’s bigger than the moon’s face. Barely. But yes.',
      'A lightning bolt is five times hotter than the sun’s surface. I know.',
      'The average cloud weighs a million pounds. And it just sits there.',
      'There are more possible chess games than atoms in the known universe.',
      'The first product scanned at a grocery store. Wrigley’s gum. 1974.',
      'A group of flamingos is a flamboyance. You’re welcome.',
      'The inventor of the Pringles can is buried in one.',
      'One of the Apollo 11 computers had less power than a cheap calculator.',
      'The original London Stone. Nobody’s sure what it is. Still there.',
      'Samurai tested swords on corpses. Not a movie thing. A job.',
      'The Maginot Line worked. They went around it.',
      'Cowboys hats? The crease told the ranch. Quiet ID.',
      'A fathom is six feet. That’s why it’s a grave measure too.',
      'The word “deadline” was a Civil War prison line. Cross it, you’re done.'
    ];
    let __fabDeck = [];
    let __fabFeatureDeck = [];
    let __fabFactDeck = [];
    let __fabFeatureCount = 0;
    function fabShuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    function fabNextLine() {
      const longStay = !!(__fabOpenedAt && (Date.now() - __fabOpenedAt >= 8 * 60 * 1000));
      const opening = __fabFeatureCount < 4 && !longStay;
      if (opening) {
        if (!__fabFeatureDeck.length) __fabFeatureDeck = fabShuffle(FEATURE_SELL);
        __fabFeatureCount += 1;
        return __fabFeatureDeck.pop();
      }
      if (!__fabFactDeck.length) __fabFactDeck = fabShuffle([].concat(FAB_FACTS, FAB_ENCOURAGE));
      return __fabFactDeck.pop();
    }
    let __fabBubbleTimer = null;
    let __fabLineTimer = null;
    function fabHideBubble() {
      const b = document.getElementById('fab-bubble');
      if (b) {
        b.classList.remove('is-on');
        setTimeout(function () {
          if (!b.classList.contains('is-on')) {
            b.classList.add('hidden');
            b.textContent = '';
          }
        }, 380);
      }
      if (__fabBubbleTimer) try { clearTimeout(__fabBubbleTimer); } catch (e) {}
      __fabBubbleTimer = null;
    }
    function fabMuted() {
      try { return sessionStorage.getItem('tb_fab_mute') === '1'; } catch (e) { return !!window.__tbFabMuted; }
    }
    function fabMuteSession() {
      try { window.__tbFabMuted = true; } catch (e) {}
      try { sessionStorage.setItem('tb_fab_mute', '1'); } catch (e) {}
      fabHideBubble();
    }
    function fabSay(text, ms) {
      if (roomCut()) return;
      if (fabMuted()) return;
      const b = document.getElementById('fab-bubble');
      if (!b) return;
      b.textContent = text;
      b.classList.remove('hidden');
      b.classList.remove('is-on');
      void b.offsetWidth;
      b.classList.add('is-on');
      try { window.tbFabSay = fabSay; } catch (e) {}
      try { tbFeedback.selection(); } catch (e) {}
      try { fabGo(0, -6, 6, 1.02); } catch (e) {}
      fabAfter(1400, fabRestSmooth);
      if (__fabBubbleTimer) try { clearTimeout(__fabBubbleTimer); } catch (e) {}
      __fabBubbleTimer = setTimeout(fabHideBubble, ms || 8000);
    }
    window.tbFabSay = fabSay;
    (function bindFabMute() {
      const b = document.getElementById('fab-bubble');
      if (!b || b.dataset.muteBound === '1') return;
      b.dataset.muteBound = '1';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (b.dataset.tourInvite === '1' || window.__tbTourInvite) {
          b.dataset.tourInvite = '';
          window.__tbTourInvite = false;
          fabHideBubble();
          try { save('tb_tour_offered', 1); } catch (err) {}
          try {
            if (typeof startTour === 'function') startTour({ replay: true });
            else if (window.startTour) window.startTour({ replay: true });
          } catch (err) {}
          return;
        }
        fabMuteSession();
      });
    })();
    function fabTwirl() {
      const img = fabImg();
      if (!img) return;
      img.classList.remove('tb-fab-twirl');
      void img.offsetWidth;
      img.classList.add('tb-fab-twirl');
      setTimeout(function () { img.classList.remove('tb-fab-twirl'); }, 1500);
    }
    function parkFabByImin(force) {
      const fab = document.getElementById('thunder-fab');
      const btn = document.getElementById('rsvp-btn');
      if (!fab) return;
      const home = currentViewName === 'home';
      let week = false;
      try {
        const d = daysUntil(getNextMeetingMonday());
        week = d >= 0 && d <= 7;
      } catch (e) {}
      if (!home || !week || !btn || fabBusy() || (!force && rsvp)) {
        fab.classList.remove('tb-fab-by-imin');
        fab.style.left = '';
        fab.style.top = '';
        fab.style.right = '';
        fab.style.bottom = '';
        return;
      }
      const r = btn.getBoundingClientRect();
      const w = 88;
      let left = r.right + 6;
      if (left + w > window.innerWidth - 8) left = Math.max(8, r.left - w - 6);
      fab.classList.add('tb-fab-by-imin');
      fab.style.left = left + 'px';
      fab.style.top = (r.top + (r.height / 2) - (w / 2)) + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    }
    let __fabRaf = 0;
    let __fabT0 = Date.now();
    let __fabPose = { x: 0, y: 0, r: 0, s: 1 };
    let __fabTarget = { x: 0, y: 0, r: 0, s: 1 };
    function fabLerp(a, b, k) { return a + (b - a) * k; }
    function fabGo(x, y, r, s) {
      __fabTarget = { x: x || 0, y: y || 0, r: r || 0, s: (s == null ? 1 : s) };
    }
    function fabRestSmooth() { fabGo(0, 0, 0, 1); }
    function fabAfter(ms, fn) {
      if (__fabHoldTimer) try { clearTimeout(__fabHoldTimer); } catch (e) {}
      __fabHoldTimer = setTimeout(fn, ms);
    }
    function fabTick() {
      __fabRaf = requestAnimationFrame(fabTick);
      const img = fabImg();
      if (!img) return;
      if (fabBusy()) return;
      const k = 0.049;
      __fabPose.x = fabLerp(__fabPose.x, __fabTarget.x, k);
      __fabPose.y = fabLerp(__fabPose.y, __fabTarget.y, k);
      __fabPose.r = fabLerp(__fabPose.r, __fabTarget.r, k);
      __fabPose.s = fabLerp(__fabPose.s, __fabTarget.s, k);
      const t = (Date.now() - __fabT0) / 1000;
      const bx = Math.sin(t * 0.65) * 3.1 + Math.sin(t * 0.29) * 1.45;
      const by = Math.sin(t * 0.78 + 0.9) * -6.7 + Math.sin(t * 0.39) * -1.75;
      const br = Math.sin(t * 0.51 + 0.3) * 2.05;
      const bs = 1 + Math.sin(t * 0.72) * 0.022;
      img.style.animation = 'none';
      img.style.transformOrigin = '50% 82%';
      img.style.transform = 'translate(' + (__fabPose.x + bx).toFixed(2) + 'px,' +
        (__fabPose.y + by).toFixed(2) + 'px) rotate(' + (__fabPose.r + br).toFixed(2) +
        'deg) scale(' + (__fabPose.s * bs).toFixed(3) + ')';
    }
    function fabStartMotion() {
      if (__fabRaf) return;
      __fabT0 = Date.now();
      __fabPose = { x: 0, y: 0, r: 0, s: 1 };
      __fabTarget = { x: 0, y: 0, r: 0, s: 1 };
      __fabRaf = requestAnimationFrame(fabTick);
    }
    function fabStopMotion() {
      if (__fabRaf) cancelAnimationFrame(__fabRaf);
      __fabRaf = 0;
      const img = fabImg();
      if (img) img.style.transform = '';
    }
    function fabGlance() {
      if (fabBusy()) return;
      fabGo(0, -2.5, (Math.random() < 0.5 ? -1 : 1) * (7.5 + Math.random() * 2.6), 1);
      fabAfter(2700, fabRestSmooth);
    }
    function fabLookAround() {
      if (fabBusy()) return;
      fabGo(-1.5, -2.5, -7.8, 1);
      fabAfter(2300, function () {
        fabGo(1.5, -2.5, 7.8, 1);
        fabAfter(2300, fabRestSmooth);
      });
    }
    function fabShift() {
      if (fabBusy()) return;
      fabGo((Math.random() < 0.5 ? -1 : 1) * 6.5, -1.5, (Math.random() < 0.5 ? -1 : 1) * 5, 1);
      fabAfter(3100, fabRestSmooth);
    }
    function fabMicroNod() {
      if (fabBusy()) return;
      fabGo(0, 4, -8.5, 1.02);
      fabAfter(1550, function () {
        fabGo(0, -1.5, 1, 1);
        fabAfter(1300, fabRestSmooth);
      });
    }
    function fabDrift() {
      if (fabBusy()) return;
      fabGo((Math.random() < 0.5 ? -1 : 1) * 7, -5, 2.5, 1);
      fabAfter(3400, fabRestSmooth);
    }
    function fabBob() {
      if (fabBusy()) return;
      fabGo(0, -9, 0, 1.04);
      fabAfter(2800, fabRestSmooth);
    }
    function fabLean() {
      if (fabBusy()) return;
      const side = Math.random() < 0.5 ? -1 : 1;
      fabGo(side * 6, -2.5, side * 7.5, 1);
      fabAfter(3200, fabRestSmooth);
    }
    window.tbFabImInLock = function () {
      try { parkFabByImin(true); } catch (e) {}
      try { fabMicroNod(); } catch (e) {}
      setTimeout(function () { try { parkFabByImin(); } catch (e) {} }, 2400);
    };
    function fabBubbleBeat() {
      if (fabMuted()) return;
      fabSay(fabNextLine(), 8000);
    }
    function fabBeat() {
      if (fabBusy()) return;
      const pool = ['glance', 'nod', 'shift', 'drift', 'bob', 'lean', 'look'].filter(function (x) {
        return x !== __fabLastMicro;
      });
      const pick = pool[Math.floor(Math.random() * pool.length)];
      __fabLastMicro = pick;
      if (pick === 'glance') fabGlance();
      else if (pick === 'nod') fabMicroNod();
      else if (pick === 'shift') fabShift();
      else if (pick === 'drift') fabDrift();
      else if (pick === 'bob') fabBob();
      else if (pick === 'lean') fabLean();
      else fabLookAround();
    }
    function startThunderBackstageIdle() {
      stopThunderBackstageIdle();
      const img = fabImg();
      if (!img) return;
      fabHideBubble();
      fabBaseline();
      try { parkFabByImin(); } catch (e) {}
      img.classList.add('tb-fab-alive');
      fabStartMotion();
      if (!__fabOpenedAt) __fabOpenedAt = Date.now();
      function offerBackstageTour() {
        try {
          if (typeof isTourComplete === 'function' && isTourComplete()) return;
          if (load('tb_tour_offered')) return;
          if (fabBusy()) return;
        } catch (e) { return; }
        const b = document.getElementById('fab-bubble');
        if (!b) return;
        window.__tbTourInvite = true;
        b.dataset.tourInvite = '1';
        b.textContent = "New here? Tap me. I'll show you the room.";
        b.classList.remove('hidden');
        void b.offsetWidth;
        b.classList.add('is-on');
        try { tbFeedback.selection(); } catch (e) {}
        if (__fabBubbleTimer) try { clearTimeout(__fabBubbleTimer); } catch (e) {}
        __fabBubbleTimer = setTimeout(function () {
          try { save('tb_tour_offered', 1); } catch (e) {}
          window.__tbTourInvite = false;
          if (b) b.dataset.tourInvite = '';
          fabHideBubble();
        }, 10000);
      }
      setTimeout(function () { try { offerBackstageTour(); } catch (e) {} }, 3500);
      function lineTick() {
        if (roomCut()) return;
        if (!fabBusy()) fabBubbleBeat();
        __fabLineTimer = setTimeout(lineTick, 150000);
      }
      if (!roomCut()) {
        __fabLineTimer = setTimeout(lineTick, 40000);
      }
      function beatTick() {
        if (fabBusy()) {
          __fabBeatTimer = setTimeout(beatTick, 8000);
          return;
        }
        fabBeat();
        __fabBeatTimer = setTimeout(beatTick, 5300 + Math.floor(Math.random() * 4400));
      }
      __fabBeatTimer = setTimeout(beatTick, 1900);
    }
    try { startThunderBackstageIdle(); } catch (e) {}
    window.addEventListener('resize', function () { try { parkFabByImin(); } catch (e) {} });

    const fabBtn = document.getElementById('thunder-fab');
    if (fabBtn && fabBtn.dataset.tbTap !== '1') {
      fabBtn.dataset.tbTap = '1';
      fabBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (document.body.classList.contains('tb-ask-open')) return;
        if (window.__tbTourInvite) {
          window.__tbTourInvite = false;
          fabHideBubble();
          try { save('tb_tour_offered', 1); } catch (err) {}
          const b = document.getElementById('fab-bubble');
          if (b) b.dataset.tourInvite = '';
          try { tbFeedback.press(fabBtn); } catch (err) {}
          try {
            if (typeof startTour === 'function') startTour({ replay: true });
            else if (window.startTour) window.startTour({ replay: true });
          } catch (err) {}
          return;
        }
        fabHideBubble();
        try { tbFeedback.press(fabBtn); } catch (err) {}
        try {
          if (window.ThunderVoice) ThunderVoice.openAsk({ voice: false });
          else openThunderVoiceMode();
        } catch (err) {
          openThunderVoiceMode();
        }
      }, true);
    }
    $('#thunder-send').addEventListener('click', handleThunderSend);
    const voiceBtn = $('#thunder-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (thunderListening) stopThunderVoice();
        else startThunderVoice();
      });
    }
    // Stop mic when modal closes
    const thunderModal = $('#thunder-modal');
    if (thunderModal) {
      const obs = new MutationObserver(() => {
        if (thunderModal.classList.contains('hidden')) {
          stopThunderVoice();
          try { document.body.classList.remove('tb-ask-open'); } catch (e) {}
          try { fabHideBubble(); } catch (e) {}
          try { startThunderBackstageIdle(); } catch (e) {}
          try { parkFabByImin(); } catch (e) {}
        } else {
          try { stopThunderBackstageIdle(); } catch (e) {}
        }
      });
      obs.observe(thunderModal, { attributes: true, attributeFilter: ['class'] });
    }

    // ---------- TAP THUNDER (durable physical entry — permanent) ----------
    // Physical NFC/QR should encode HTTPS URLs under /tap/... only.
    // Tags outlive builds; the app decides behavior. NFC is NEVER authority.
    // iPhone: OS reads NDEF URL → notification → Safari/PWA.
    // Android: same URL open; Web NFC not required and not used.
    const ThunderTap = (function () {
      const VALID = {
        ask: { dest: 'ask', voice: true },
        thunder: { dest: 'ask', voice: true },
        voice: { dest: 'ask', voice: true },
        gathering: { dest: 'home' },
        home: { dest: 'home' },
        showup: { dest: 'home' },
        install: { dest: 'install' },
        welcome: { dest: 'install' },
        brothers: { dest: 'brothers' },
        connect: { dest: 'brothers' },
        events: { dest: 'events' },
        memory: { dest: 'events' },
        more: { dest: 'more' },
        code: { dest: 'more' }
      };

      function parseTap() {
        try {
          const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
          // /tap or /tap/ask or /tap/gathering-main
          const m = path.match(/^\/tap(?:\/([a-z0-9][a-z0-9_-]*))?$/i);
          if (m) {
            const raw = (m[1] || 'home').toLowerCase();
            // strip optional -suffix for object id (gathering-main → gathering)
            const base = raw.split('-')[0];
            const q = new URLSearchParams(window.location.search || '');
            return {
              hit: true,
              id: raw,
              base: base,
              src: q.get('src') || raw,
              voice: q.get('voice') === '1'
            };
          }
          // also honor ?tap=ask
          const q = new URLSearchParams(window.location.search || '');
          if (q.get('tap')) {
            const raw = String(q.get('tap')).toLowerCase();
            return { hit: true, id: raw, base: raw.split('-')[0], src: q.get('src') || raw, voice: q.get('voice') === '1' };
          }
        } catch (e) {}
        return { hit: false };
      }

      function cleanUrl() {
        try {
          const u = new URL(window.location.href);
          if (/^\/tap/i.test(u.pathname)) {
            u.pathname = '/';
          }
          u.searchParams.delete('tap');
          u.searchParams.delete('src');
          // keep ask/voice if present for ThunderVoice; else clear handled flags
          window.history.replaceState({}, '', u.pathname + (u.search || '') + (u.hash || ''));
        } catch (e) {}
      }

      function route(info) {
        if (!info || !info.hit) return false;
        try { window.__tbRouteOwned = 'tap'; } catch (e) {}
        const spec = VALID[info.base] || VALID.home;
        try { sessionStorage.setItem('tb_tap_src', info.src || info.id || ''); } catch (e) {}
        // Restrained acknowledgement — not full laser (splash may already run)
        try {
          if (window.ThunderFX && typeof ThunderFX.select === 'function') {
            ThunderFX.select(document.getElementById('thunder-fab'));
          }
        } catch (e) {}

        if (spec.dest === 'ask') {
          const useVoice = info.voice || spec.voice;
          setTimeout(() => {
            try {
              if (window.ThunderVoice) ThunderVoice.openAsk({ voice: false, delay: 350 });
              else if (typeof openThunderVoiceMode === 'function') openThunderVoiceMode();
            } catch (e) {}
          }, 450);
        } else if (spec.dest === 'install') {
          setTimeout(() => {
            try {
              if (typeof showView === 'function') showView('more');
              const card = document.getElementById('install-help-card');
              if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {}
          }, 400);
        } else if (spec.dest === 'home' || spec.dest === 'brothers' || spec.dest === 'events' || spec.dest === 'more') {
          setTimeout(() => {
            try { if (typeof showView === 'function') showView(spec.dest); } catch (e) {}
          }, 350);
        }
        cleanUrl();
        return true;
      }

      function handle() {
        const info = parseTap();
        if (!info.hit) return false;
        return route(info);
      }

      return { handle: handle, parseTap: parseTap, VALID: VALID };
    })();
    try { window.ThunderTap = ThunderTap; } catch (e) {}


    try { ThunderTap.handle(); } catch (e) {}
    try { ThunderVoice.init(); } catch (e) {}
    try { ThunderVoice.handleDeepLink(); } catch (e) {}


    const installShareBtn = $('#install-share-btn');
    const installBtn = $('#install-help-btn');
    const installCard = $('#install-help-card');
    let deferredInstallPrompt = null;

    function showInstallToast(msg, opts) {
      const t = $('#install-toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.remove('hidden');
      if (opts && opts.success) t.classList.add('toast-success');
      else t.classList.remove('toast-success');
      clearTimeout(showInstallToast._timer);
      const ms = (opts && opts.success) ? 3800 : 4200;
      showInstallToast._timer = setTimeout(() => {
        t.classList.add('hidden');
        t.classList.remove('toast-success');
      }, ms);
    }

        function refreshInstallCta() {
      if (!installCard) return;
      const title = $('#install-card-title');
      const sub = $('#install-card-sub');
      const tip = $('#install-share-tip');
      const howBtn = installBtn;
      const state = getInstallState();

      if (state === 'INSTALLED') {
        markInstalledSuccessOnce();
        /* Installed: invite card already shares. Don't paint a second SHARE. */
        installCard.classList.add('hidden');
        return;
      }

      installCard.classList.remove('hidden');
      if (howBtn) howBtn.classList.remove('hidden');

      if (state === 'IN_APP_BROWSER') {
        if (installShareBtn) installShareBtn.textContent = isAndroid() ? 'OPEN IN CHROME' : 'OPEN IN SAFARI';
        if (title) title.textContent = 'ONE MORE MOVE';
        if (sub) sub.textContent = 'Leave this app browser first';
        if (tip) tip.textContent = isAndroid()
          ? 'Open in Chrome → Install app'
          : 'Open in Safari → Share → Add to Home Screen';
      } else if (state === 'ANDROID_NATIVE' || deferredInstallPrompt) {
        if (installShareBtn) installShareBtn.textContent = 'INSTALL THUNDER BOARD';
        if (title) title.textContent = 'PUT THUNDER ON YOUR PHONE';
        if (sub) sub.textContent = 'Your phone will ask you to confirm.';
        if (tip) tip.textContent = 'Then open Thunder from your home screen.';
      } else if (state === 'IPHONE_SAFARI') {
        if (installShareBtn) installShareBtn.textContent = 'ADD TO HOME SCREEN';
        if (title) title.textContent = 'PUT THUNDER ON YOUR PHONE';
        if (sub) sub.textContent = 'Safari will ask next — add to Home Screen.';
        if (tip) tip.textContent = 'Share → Add to Home Screen → Add';
      } else {
        if (installShareBtn) installShareBtn.textContent = 'ADD TO HOME SCREEN';
        if (title) title.textContent = 'PUT THUNDER ON YOUR PHONE';
        if (sub) sub.textContent = 'Add this to your home screen';
        if (tip) tip.textContent = 'Use your browser menu · Add to Home Screen';
      }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      window.__tbDeferredInstall = e;
      refreshInstallCta();
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      window.__tbDeferredInstall = null;
      refreshInstallCta();
      markInstalledSuccessOnce();
    });

    async function runSmartInstall() {
      // Trapped in Instagram / Messenger / etc.
      if (isInAppBrowser()) {
        setInstallProgress('WRONG_BROWSER');
        openInAppInstallOverlay();
        return;
      }
      // Android Chrome native install when available
      if (deferredInstallPrompt) {
        try {
          deferredInstallPrompt.prompt();
          const choice = await deferredInstallPrompt.userChoice;
          deferredInstallPrompt = null;
          window.__tbDeferredInstall = null;
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
        setInstallProgress('READY_TO_INSTALL');
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

    // Facebook / IG: never interrupt splash or the product tour.
    try {
      if (getInstallState() === 'IN_APP_BROWSER') {
        setInstallProgress('WRONG_BROWSER');
        if (!sessionStorage.getItem('tb_inapp_gate')) {
          sessionStorage.setItem('tb_inapp_gate', '1');
          const launchInappGate = function () {
            try {
              if (__tourActive) return;
              const splash = document.getElementById('splash');
              if (splash && !splash.classList.contains('splash-done') && !splash.classList.contains('hidden')) return;
              if (typeof isTourComplete === 'function' && !isTourComplete()) return;
              openInAppInstallOverlay();
            } catch (e) {}
          };
          setTimeout(launchInappGate, 600);
        }
      } else if (getInstallState() !== 'INSTALLED') {
        const prog = getInstallProgress();
        if ((prog === 'INSTALL_ATTEMPTED' || prog === 'READY_TO_INSTALL') && !sessionStorage.getItem('tb_rescue_toast')) {
          sessionStorage.setItem('tb_rescue_toast', '1');
          setInstallProgress('RETURNED_NOT_INSTALLED');
          setTimeout(() => {
            try { showInstallToast('STILL WITH YOU. ⚡ One more move when ready.'); } catch (e) {}
          }, 900);
        }
      }
    } catch (e) {}

    if (installShareBtn) {
      installShareBtn.addEventListener('click', () => { runSmartInstall(); });
    }
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        openModal('install-modal');
      });
    }

    // Invite a brother — native Share sheet; copy-link fallback (not install tutorial)
    const inviteShareBtn = $('#invite-share-btn');
    if (inviteShareBtn && !inviteShareBtn.dataset.tbInviteBound) {
      inviteShareBtn.dataset.tbInviteBound = '1';
      inviteShareBtn.addEventListener('click', async () => {
        const url = publicUrl('/');
        const payload = {
          title: 'Thunder Board',
          text: 'Sons of Thunder — Thunder doesn’t dull. Put this on your Home Screen.',
          url
        };
        try {
          const qrRes = await fetch('assets/qr-board.png');
          const qrBlob = await qrRes.blob();
          const qrFile = new File([qrBlob], 'thunder-board.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [qrFile], url })) {
            await navigator.share({ files: [qrFile], title: payload.title, text: payload.text, url });
            showInstallToast('Shared with a brother.');
            return;
          }
          if (navigator.canShare && navigator.canShare({ files: [qrFile] })) {
            await navigator.share({ files: [qrFile], title: payload.title, text: payload.text + '\n' + url });
            showInstallToast('Shared with a brother.');
            return;
          }
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
        if (navigator.share) {
          try {
            await navigator.share(payload);
            showInstallToast('Shared with a brother.');
            return;
          } catch (err) {
            if (err && err.name === 'AbortError') return;
          }
        }
        try {
          await navigator.clipboard.writeText(url);
          showInstallToast('Link copied. Send it to a brother.');
        } catch (e) {
          showInstallToast(url);
        }
      });
    }
    const liveLink = $('#install-live-link');
    if (liveLink) {
      liveLink.addEventListener('click', () => {
        const url = publicUrl('/');
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
      const installVid = $('#install-gif');
      if (installVid && installVid.tagName === 'VIDEO' && !installVid.dataset.tbReplayBound) {
        installVid.dataset.tbReplayBound = '1';
        /* LOCKED: tap = unmute + replay from start (VO preserved) */
        installVid.addEventListener('click', () => {
          playInstallExplainerWithAudio(installVid);
        });
      }
    }

    // iOS overlay controls
    const iosClose = $('#ios-install-close');
    const iosGotit = $('#ios-install-gotit');
    const iosShare = $('#ios-install-share-btn');
    const iosNext = $('#ios-install-next');
    const iosAlt = $('#ios-install-alt');
    if (iosClose) iosClose.addEventListener('click', closeIosInstallOverlay);
    if (iosGotit) iosGotit.addEventListener('click', () => {
      setInstallProgress('INSTALL_ATTEMPTED');
      closeIosInstallOverlay();
    });
    if (iosShare) iosShare.addEventListener('click', () => {
      setInstallProgress('INSTALL_ATTEMPTED');
      shareFromIosOverlay();
    });
    if (iosNext && !iosNext.dataset.tbBound) {
      iosNext.dataset.tbBound = '1';
      iosNext.addEventListener('click', () => {
        if (__iosCoachStep < IOS_COACH.length - 1) {
          __iosCoachStep += 1;
          renderIosCoachStep();
        } else {
          setInstallProgress('INSTALL_ATTEMPTED');
          closeIosInstallOverlay();
          try { showInstallToast('Open Thunder from your Home Screen when ready'); } catch (e) {}
        }
      });
    }
    if (iosAlt && !iosAlt.dataset.tbBound) {
      iosAlt.dataset.tbBound = '1';
      iosAlt.addEventListener('click', () => {
        __iosCoachAlt = true;
        renderIosCoachStep();
      });
    }

    // In-app browser gate
    const inappClose = $('#inapp-install-close');
    const inappGotit = $('#inapp-install-gotit');
    const inappCopy = $('#inapp-copy-link');
    if (inappClose) inappClose.addEventListener('click', closeInAppInstallOverlay);
    if (inappGotit) inappGotit.addEventListener('click', closeInAppInstallOverlay);
    if (inappCopy) {
      inappCopy.addEventListener('click', async () => {
        const url = publicUrl('/');
        try {
          await navigator.clipboard.writeText(url);
          showInstallToast('Link copied — paste in Safari');
        } catch (e) {
          showInstallToast(url);
        }
      });
    }

    // Offline / online — one soft toast, no nag
    if (!window.__tbNetBound) {
      window.__tbNetBound = true;
      window.addEventListener('offline', () => {
        try { tbToast('You’re offline. Some features need a connection.'); } catch (e) {}
      });
      window.addEventListener('online', () => {
        try { tbToast('Back online.'); } catch (e) {}
      });
    }

    // Escape closes the topmost overlay; never leave body scroll locked
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if ($('#memory-viewer') && !$('#memory-viewer').classList.contains('hidden')) {
        if (typeof closeMemoryViewer === 'function') closeMemoryViewer();
        else { $('#memory-viewer').classList.add('hidden'); unlockBodyIfClear(); }
        return;
      }
      if ($('#brother-detail') && !$('#brother-detail').classList.contains('hidden')) {
        closeBrotherDetail();
        return;
      }
      if ($('#info-detail') && !$('#info-detail').classList.contains('hidden')) {
        if (typeof closeInfoDetail === 'function') closeInfoDetail();
        return;
      }
      if ($('#cal-confirm-sheet') && !$('#cal-confirm-sheet').classList.contains('hidden')) {
        try { closeCalConfirmSheet(); } catch (e) {}
        return;
      }
      const open = document.querySelector('.modal:not(.hidden)');
      if (open && open.id) closeModal(open.id);
    });
    // iOS back-forward cache / tab resume can leave overflow:hidden stuck
    window.addEventListener('pageshow', () => { unlockBodyIfClear(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') unlockBodyIfClear();
    });

    // Auto-wipe handles new deploys. No leader refresh button.

$('#thunder-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleThunderSend();
    });

    // Leadership (chair account only — no PIN)
    const unlockBtn = $('#leader-unlock-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        const tools = $('#leader-tools');
        if (tools) tools.classList.remove('hidden');
        unlockBtn.classList.add('hidden');
      });
    }
    const lockBtn = $('#leader-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        const tools = $('#leader-tools');
        if (tools) tools.classList.add('hidden');
        if (unlockBtn) {
          unlockBtn.textContent = 'Leadership';
          unlockBtn.classList.remove('hidden');
        }
      });
    }

    const adminRoomBtn = $('#admin-room-btn');
    if (adminRoomBtn) {
      adminRoomBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        openModal('admin-room-modal');
        loadFounderRoom();
        try { syncPatioToggle(); } catch (e) {}
      });
    }
    const patioToggle = document.getElementById('patio-toggle-btn');
    if (patioToggle && patioToggle.dataset.bound !== '1') {
      patioToggle.dataset.bound = '1';
      patioToggle.addEventListener('click', function () {
        if (!requireLeader()) return;
        patioOverride = isPatioLive() ? false : true;
        try { syncPatioToggle(); } catch (e) {}
        try { renderHere(); } catch (e) {}
      });
    }
    const adminSmsClub = $('#admin-sms-club-btn');
    if (adminSmsClub) {
      adminSmsClub.addEventListener('click', () => {
        if (!requireLeader()) return;
        const st = $('#admin-sms-status');
        if (st) st.textContent = '';
        openModal('admin-sms-modal');
      });
    }
    const adminSmsSend = $('#admin-sms-send');
    if (adminSmsSend) {
      adminSmsSend.addEventListener('click', () => {
        if (!requireLeader()) return;
        const message = (($('#admin-sms-body') && $('#admin-sms-body').value) || '').trim();
        const st = $('#admin-sms-status');
        if (!message) {
          if (st) st.textContent = 'Write the line first.';
          return;
        }
        if (st) st.textContent = 'Opening your Messages…';
        openDeviceSmsClub(message);
      });
    }
    const adminPushBtn = $('#admin-push-btn');
    if (adminPushBtn) {
      adminPushBtn.addEventListener('click', () => {
        const st = $('#admin-push-status');
        if (st) st.textContent = '';
        const titleEl = $('#admin-push-title');
        const bodyEl = $('#admin-push-body');
        if (titleEl) titleEl.value = '';
        if (bodyEl) bodyEl.value = '';
        openModal('admin-push-modal');
      });
    }
    const adminPushSend = $('#admin-push-send');
    if (adminPushSend) {
      adminPushSend.addEventListener('click', async () => {
        const title = (($('#admin-push-title') && $('#admin-push-title').value) || '').trim();
        const body = (($('#admin-push-body') && $('#admin-push-body').value) || '').trim() || 'Open Thunder Board';
        const st = $('#admin-push-status');
        if (!title) {
          if (st) st.textContent = 'Add a title first.';
          return;
        }
        if (!isSignedIn || !isSignedIn()) {
          if (st) st.textContent = 'Sign in on Brothers first (leader account).';
          return;
        }
        adminPushSend.disabled = true;
        if (st) st.textContent = 'Sending…';
        try {
          const result = await broadcastAnnouncementPush(title, body);
          if (result && result.ok) {
            const n = typeof result.sent === 'number' ? result.sent : null;
            if (st) st.textContent = n != null ? ('Sent to ' + n + ' phone' + (n === 1 ? '' : 's') + '.') : 'Sent.';
            if (typeof tbToast === 'function') tbToast(n != null ? ('Alert sent · ' + n) : 'Alert sent');
          } else if (result && result.reason === 'sign_in_required') {
            if (st) st.textContent = 'Sign in on Brothers (leader account), then try again.';
          } else if (result && result.status === 403) {
            if (st) st.textContent = 'Not authorized — your account needs leader role in app_members.';
          } else {
            if (st) st.textContent = (result && result.error && (result.error.error || result.error)) || 'Send failed. Check sign-in + VAPID.';
          }
        } finally {
          adminPushSend.disabled = false;
        }
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
          try {
            lastFire = { caption: '', photo: '', updatedAt: Date.now() };
            pushLastFire();
            lastFire = null;
          } catch (e) {}
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
            try { pushLastFire(); } catch (e) {}
            renderLastFire();
            updateAllNewBadges();
            alert('Last Fire saved for the room.');
          };
          input.click();
        } else {
          lastFire = {
            caption: trimmed,
            photo: (lastFire && lastFire.photo) || '',
            updatedAt: Date.now()
          };
          save('lastFire', lastFire);
          try { pushLastFire(); } catch (e) {}
          renderLastFire();
          updateAllNewBadges();
          alert('Last Fire saved for the room.');
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

        // Shared publish — Leadership PIN already unlocked this tool; no memories sign-in required
        if (supabaseEnabled()) {
          eventsSave.disabled = true;
          try {
            const res = await pushEventsBoard();
            if (res && res.ok) {
              alert('Saved for all brothers.');
            } else if (res && res.reason === 'sign_in_required') {
              alert('Saved on this phone. Sign in (Brothers → Sign In) so shared publish can reach every brother.');
            } else {
              alert('Saved on this phone. Shared publish failed' + (res && res.reason ? ' (' + res.reason + ')' : '') + '. Re-run supabase-schema.sql if tables/policies are missing.');
            }
          } catch (e) {
            console.warn(e);
            alert('Saved on this phone. Shared publish failed.');
          } finally {
            eventsSave.disabled = false;
          }
        } else {
          alert('Saved on this phone.');
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
        alert('Code saved on this phone. Other devices keep their own Code until shared Code is wired.');
      });
    }

    const annAdd = $('#admin-ann-add');
    if (annAdd) {
      annAdd.addEventListener('click', async () => {
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
        if (typeof broadcastAnnouncementPush === 'function') {
          broadcastAnnouncementPush(title);
        }
        // Publish for all brothers — Leadership PIN already required to open this tool
        if (supabaseEnabled()) {
          const res = await pushAnnouncements();
          if (res && res.ok) {
            alert('Announcement live for brothers.');
          } else if (res && res.reason === 'sign_in_required') {
            alert('Saved on this phone. Sign in as a listed leader (app_members) to publish to every brother.');
          } else {
            alert('Saved on this phone. Shared publish failed' + (res && res.reason ? ' (' + res.reason + ')' : '') + '. Re-run supabase-schema.sql if needed.');
          }
        } else {
          alert('Saved on this phone only. Turn on Supabase so every brother sees it.');
        }
      });
    }

    const annList = $('#admin-ann-list');
    if (annList) {
      annList.addEventListener('click', async (e) => {
        const btn = e.target.closest('.admin-ann-delete');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        if (isNaN(idx)) return;
        announcements.splice(idx, 1);
        save('announcements', announcements);
        renderAnnouncements();
        renderAdminAnnouncements();
        if (supabaseEnabled()) {
          await pushAnnouncements();
        }
      });
    }


    // Text the Leader — number never rendered in DOM
    const tlb = $('#text-leader-btn');
    if (tlb) tlb.addEventListener('click', () => { tbGlowHit(tlb); openLeaderSms(); });
    /* text-leader-btn-brothers removed — auth lives on Brothers */

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



  // ---------- ACTIVITY FEEDS (Range / Lake / Bible / Gym) ----------
  const ACTIVITY_FEEDS = {
    range: {
      label: 'RANGE',
      url: 'https://www.ammoland.com/feed/',
      source: 'AmmoLand'
    },
    lake: {
      label: 'LAKE',
      url: 'https://www.sportfishingmag.com/feed/',
      source: 'Sport Fishing'
    },
    bible: {
      label: 'BIBLE',
      url: 'https://crossexamined.org/feed/',
      source: 'CrossExamined'
    },
    gym: {
      label: 'GYM',
      url: 'https://www.menshealth.com/rss/all.xml',
      source: "Men's Health"
    }
  };
  let activeActivityFeed = null;
  const activityFeedCache = {};

  function setActivityTagState(key) {
    document.querySelectorAll('.activity-tag').forEach(btn => {
      const on = btn.dataset.feed === key;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function decodeFeedText(s) {
    const t = String(s || '');
    try {
      const d = document.createElement('textarea');
      d.innerHTML = t.replace(/<[^>]+>/g, ' ');
      return d.value.replace(/\s+/g, ' ').trim();
    } catch (e) {
      return t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  function collapseActivityFeed() {
    const el = $('#activity-feed');
    activeActivityFeed = null;
    setActivityTagState(null);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('is-open');
      el.innerHTML = '';
      el.setAttribute('aria-hidden', 'true');
    }
  }

  function paintActivityFeed(el, items, source, label) {
    if (!el) return;
    const stories = renderActivityItems(items, source);
    el.innerHTML =
      '<button type="button" class="activity-feed-close" id="activity-feed-close" aria-label="Close feed">' +
        '<span class="activity-feed-close-chevron" aria-hidden="true">▲</span>' +
        '<span class="activity-feed-close-label">CLOSE ' + esc(label || '') + '</span>' +
      '</button>' +
      stories;
    el.classList.remove('hidden');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    const closeBtn = el.querySelector('#activity-feed-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try { tbFeedback.selection(); } catch (e) {}
        collapseActivityFeed();
      });
    }
    el.querySelectorAll('.activity-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openInfoDetail({
          label: 'STORY',
          title: card.getAttribute('data-rss-title') || '',
          meta: card.getAttribute('data-rss-meta') || '',
          body: card.getAttribute('data-rss-body') || ''
        });
      });
    });
  }

  function renderActivityItems(items, source) {
    return items.map(item => {
      const title = esc(decodeFeedText(item.title || 'Untitled'));
      const link = esc(item.link || '#');
      let date = '';
      try {
        date = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {}
      let excerpt = decodeFeedText(item.description || '');
      if (excerpt.length > 120) excerpt = excerpt.slice(0, 117) + '…';
      excerpt = esc(excerpt);
      return `<button type="button" class="activity-card" data-rss-title="${title}" data-rss-body="${excerpt}" data-rss-meta="${esc(source)}${date ? ' · ' + esc(date) : ''}">
        <div class="activity-card-meta">${esc(source)}${date ? ' · ' + esc(date) : ''}</div>
        <div class="activity-card-title">${title}</div>
        <div class="activity-card-excerpt">${excerpt}</div>
      </button>`;
    }).join('');
  }

  async function loadActivityFeed(key) {
    const el = $('#activity-feed');
    if (!el) return;
    const conf = ACTIVITY_FEEDS[key];
    if (!conf) {
      collapseActivityFeed();
      return;
    }

    // Tap same active chip → retract
    if (activeActivityFeed === key) {
      collapseActivityFeed();
      return;
    }

    activeActivityFeed = key;
    setActivityTagState(key);
    el.classList.remove('hidden');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    el.innerHTML = '<div class="empty-state activity-loading">Loading ' + esc(conf.label) + '…</div>';

    if (activityFeedCache[key] && (Date.now() - activityFeedCache[key].at < 10 * 60 * 1000)) {
      paintActivityFeed(el, activityFeedCache[key].items, conf.source, conf.label);
      return;
    }

    const proxy = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(conf.url);
    try {
      const res = await fetch(proxy);
      if (!res.ok) throw new Error('feed ' + res.status);
      const data = await res.json();
      if (data.status && data.status !== 'ok' && !(data.items && data.items.length)) {
        throw new Error(data.message || 'feed error');
      }
      const items = (data.items || []).slice(0, 3);
      if (!items.length) {
        if (activeActivityFeed === key) {
          el.innerHTML =
            '<button type="button" class="activity-feed-close" id="activity-feed-close" aria-label="Close feed">' +
              '<span class="activity-feed-close-chevron" aria-hidden="true">▲</span>' +
              '<span class="activity-feed-close-label">CLOSE</span>' +
            '</button>' +
            '<div class="empty-state">No posts right now.</div>';
          const closeBtn = el.querySelector('#activity-feed-close');
          if (closeBtn) closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            collapseActivityFeed();
          });
        }
        return;
      }
      activityFeedCache[key] = { at: Date.now(), items };
      if (activeActivityFeed === key) {
        paintActivityFeed(el, items, conf.source, conf.label);
      }
    } catch (e) {
      console.warn('activity feed', key, e);
      if (activeActivityFeed === key) {
        el.innerHTML =
          '<button type="button" class="activity-feed-close" id="activity-feed-close" aria-label="Close feed">' +
            '<span class="activity-feed-close-chevron" aria-hidden="true">▲</span>' +
            '<span class="activity-feed-close-label">CLOSE</span>' +
          '</button>' +
          '<div class="empty-state">Couldn’t load ' + esc(conf.label) + ' feed. Try again later.</div>';
        const closeBtn = el.querySelector('#activity-feed-close');
        if (closeBtn) closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          collapseActivityFeed();
        });
      }
    }
  }

  const FEED_ORDER = ['range', 'lake', 'bible', 'gym'];

  function selectActivityFeed(key) {
    // Swipe path: always open/switch — never toggle closed
    if (!ACTIVITY_FEEDS[key]) return;
    if (activeActivityFeed === key) {
      const el = $('#activity-feed');
      const conf = ACTIVITY_FEEDS[key];
      if (el && conf && activityFeedCache[key]) {
        paintActivityFeed(el, activityFeedCache[key].items, conf.source, conf.label);
      }
      setActivityTagState(key);
      return;
    }
    // bypass toggle-off by clearing active first
    activeActivityFeed = null;
    loadActivityFeed(key);
  }

  function bindActivityTags() {
    const wrap = $('#activity-tags');
    if (!wrap || wrap.dataset.bound === '1') return;
    wrap.dataset.bound = '1';
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.activity-tag');
      if (!btn || !btn.dataset.feed) return;
      loadActivityFeed(btn.dataset.feed);
    });

    // Swipe left/right ONLY when a feed panel is open
    // RANGE → LAKE → BIBLE → GYM
    const feedEl = $('#activity-feed');
    // Prefer binding on the feed itself so collapsed state ignores swipe on page
    const swipeRoot = feedEl || wrap;
    if (swipeRoot.dataset.feedSwipe === '1') return;
    swipeRoot.dataset.feedSwipe = '1';

    let feedSwipeGuardUntil = 0;
    function feedIsOpen() {
      return !!(activeActivityFeed && feedEl && !feedEl.classList.contains('hidden'));
    }
    function feedIndex() {
      let i = FEED_ORDER.indexOf(activeActivityFeed);
      return i < 0 ? 0 : i;
    }
    function goPrevFeed() {
      if (!feedIsOpen()) return;
      const i = feedIndex();
      if (i > 0) {
        feedSwipeGuardUntil = Date.now() + 450;
        selectActivityFeed(FEED_ORDER[i - 1]);
      }
    }
    function goNextFeed() {
      if (!feedIsOpen()) return;
      const i = feedIndex();
      if (i < FEED_ORDER.length - 1) {
        feedSwipeGuardUntil = Date.now() + 450;
        selectActivityFeed(FEED_ORDER[i + 1]);
      }
    }

    // Swallow accidental link opens right after a horizontal feed swipe
    if (feedEl && feedEl.dataset.swipeClickGuard !== '1') {
      feedEl.dataset.swipeClickGuard = '1';
      feedEl.addEventListener('click', (e) => {
        if (Date.now() < feedSwipeGuardUntil) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }

    bindElasticSwipe(swipeRoot, {
      getEl: () => feedEl || wrap,
      dist: 40,
      canPrev: () => feedIsOpen() && feedIndex() > 0,
      canNext: () => feedIsOpen() && feedIndex() < FEED_ORDER.length - 1,
      onPrev: goPrevFeed,
      onNext: goNextFeed,
      onDown: () => { try { collapseActivityFeed(); } catch (e) {} },
      onDownDist: 56,
      blocked: (t) => !!(t && t.closest && (
        t.closest('#media-feed') ||
        t.closest('#upcoming-events') ||
        t.closest('#next-mission-card') ||
        t.closest('#upload-media-btn') ||
        t.closest('.section-header')
      ))
    });
  }

  // ---------- SHARPENING IRON (CUT 2026-08-18) ----------
  // Man in the Mirror RSS removed from product. Stub keeps any residual call sites safe.
  async function loadIronFeed() { /* no-op — section removed from Home */ }


  // Leadership contact — assembled only on tap, never rendered as text
  function openLeaderSms() {
    const parts = (cfg().LEADER_SMS_PARTS || []);
    const digits = parts.join('').replace(/\D/g, '');
    if (!digits) return;
    window.location.href = 'sms:' + digits;
  }


  // ---------- OPENING SPLASH (once per session) ----------
  // Door into the room: settle bolt → soft dissolve + light scale → cross-fade welcome
  
  /* LOCKED visual guard — welcome bolt must stay official asset */
  function assertWelcomeBoltLock() {
    try {
      const img = document.querySelector('.welcome-bolt-img');
      if (!img) return;
      const src = (img.getAttribute('src') || '');
      if (!src.includes('bolt-only')) {
        console.warn('[TB] VISUAL LOCK: welcome bolt must use assets/bolt-only.png, not emoji');
      }
    } catch (e) {}
  }

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

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      // Splash → tour with nothing in between (no home/welcome flash)
      try {
        if (typeof fromPatio === 'function' && fromPatio()) {
          try { offerHomeScreen('alerts'); } catch (e2) {}
        }
      } catch (e) {}
      el.classList.add('splash-out');
      setTimeout(() => {
        try { sessionStorage.setItem('tb_splash_done', '1'); } catch (e) {}
        runWelcome();
      }, 280);
      const hide = () => {
        el.classList.add('splash-done');
      };
      el.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 1400); // cover full dramatic zoom duration
    };

    // HERO: splash ignition feel (no laser streaks) on cold splash only
    try {
      if (window.ThunderFX) ThunderFX.appIgnition();
      else setTimeout(() => { try { tbFeedback.thunderImpact(); } catch (e) {} }, 300);
    } catch (e) {
      setTimeout(() => { try { tbFeedback.thunderImpact(); } catch (e2) {} }, 300);
    }
    // Hold for bolt settle, then dramatic zoom → welcome
    setTimeout(finish, 2200);

    const img = el.querySelector('.splash-mark');
    if (img) {
      img.onerror = () => { img.style.display = 'none'; };
    }
  }


  // ---------- FIRST-LOAD WELCOME (once per session; overlaps splash exit) ----------
  function runWelcome() {
    /* OLD welcome popup and retired product tour removed. No first-run tour auto-start. */
    const el = document.getElementById('welcome');
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('welcome-on');
      el.setAttribute('aria-hidden', 'true');
    }
    try { sessionStorage.setItem('tb_welcome_done', '1'); } catch (e) {}
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

  // Concierge: detect real install on launch
  try {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setTimeout(() => { try { markInstalledSuccessOnce(); } catch (e) {} }, 800);
    }
  } catch (e) {}

  function isStandalonePwa() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function markPatioFromUrl() {
    try {
      const q = new URLSearchParams(location.search || '');
      if (q.get('src') === 'qr' || q.get('src') === 'board' || q.get('qr') === '1') {
        sessionStorage.setItem('tb_patio', '1');
      }
      if (/^\/tap/i.test(location.pathname || '')) {
        sessionStorage.setItem('tb_patio', '1');
      }
    } catch (e) {}
  }
  function fromPatio() {
    try { return sessionStorage.getItem('tb_patio') === '1'; } catch (e) { return false; }
  }
  function runPatioAlive() {
    markPatioFromUrl();
    if (!fromPatio()) return;
    if (isStandalonePwa()) return;
    if (typeof isInAppBrowser === 'function' && isInAppBrowser()) {
      try { openInAppInstallOverlay(); } catch (e) {}
      return;
    }
    if (typeof isTourComplete === 'function' && isTourComplete()) {
      setTimeout(function () { try { offerHomeScreen('alerts'); } catch (e) {} }, 700);
    }
  }
  function a2hsHushed() {
    try { return Date.now() < Number(load('a2hsQuietUntil') || 0); } catch (e) { return false; }
  }
  function hushA2hs(days) {
    try { save('a2hsQuietUntil', Date.now() + (days || 7) * 86400000); } catch (e) {}
  }
  function hideHomeA2hs() {
    const el = document.getElementById('home-a2hs');
    if (el) el.classList.add('hidden');
  }
  function showHomeA2hs() {
    hideHomeA2hs();
  }
  function imInA2hsAsked() {
    try { return load('iminA2hsAsked') === '1' || load('iminA2hsAsked') === true; } catch (e) { return false; }
  }
  function markImInA2hsAsked() {
    try { save('iminA2hsAsked', '1'); } catch (e) {}
  }
  function closeImInA2hsSheet() {
    const el = document.getElementById('imin-a2hs-sheet');
    if (el) {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('tb-imin-a2hs-open');
    if (typeof unlockBodyIfClear === 'function') unlockBodyIfClear();
    else document.body.style.overflow = '';
  }
  function openImInA2hsSheet() {
    if (isStandalonePwa()) { hideHomeA2hs(); return false; }
    if (imInA2hsAsked()) return false;
    if (a2hsHushed()) return false;
    const el = document.getElementById('imin-a2hs-sheet');
    if (!el) return false;
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tb-imin-a2hs-open');
    document.body.style.overflow = 'hidden';
    return true;
  }
  function maybeOfferImInA2hs() {
    if (isStandalonePwa()) return false;
    if (imInA2hsAsked()) return false;
    if (a2hsHushed()) return false;
    if (document.body.classList.contains('tb-tour-open')) return false;
    const gate = document.getElementById('auth-gate');
    if (gate && !gate.classList.contains('hidden')) {
      window.__tbA2hsAfterAuth = true;
      return false;
    }
    return openImInA2hsSheet();
  }
  function bindImInA2hsSheet() {
    if (document.documentElement.dataset.tbImInA2hsBound === '1') return;
    document.documentElement.dataset.tbImInA2hsBound = '1';
    const put = document.getElementById('imin-a2hs-put');
    const later = document.getElementById('imin-a2hs-later');
    const x = document.getElementById('imin-a2hs-close');
    const backdrop = document.getElementById('imin-a2hs-backdrop');
    function doneHush() {
      markImInA2hsAsked();
      hushA2hs(7);
      closeImInA2hsSheet();
    }
    if (put) put.addEventListener('click', function () {
      markImInA2hsAsked();
      closeImInA2hsSheet();
      try { launchAddToHomeScreen(); } catch (e) {}
    });
    if (later) later.addEventListener('click', doneHush);
    if (x) x.addEventListener('click', doneHush);
    if (backdrop) backdrop.addEventListener('click', doneHush);
  }
  function paintCalA2hs() {
    const btn = document.getElementById('cal-confirm-a2hs');
    const hint = document.getElementById('cal-confirm-hint');
    const need = !isStandalonePwa();
    if (btn) btn.classList.toggle('hidden', !need);
    if (need && hint) hint.textContent = 'Home Screen = 7-day ping on a locked iPhone.';
  }
  function launchAddToHomeScreen() {
    if (isStandalonePwa()) return;
    if (typeof isInAppBrowser === 'function' && isInAppBrowser()) {
      try { openInAppInstallOverlay(); } catch (e) {}
      return;
    }
    const def = window.__tbDeferredInstall;
    if (def && typeof def.prompt === 'function') {
      try { def.prompt(); } catch (e) {}
      return;
    }
    if (isIos()) {
      try { openIosInstallOverlay(); } catch (e) {}
      return;
    }
    try { showView('about'); } catch (e) {}
    const card = document.getElementById('install-help-card');
    if (card) try { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  }
  function offerHomeScreen(reason) {
    if (roomCut()) return false;
    if (isStandalonePwa()) { hideHomeA2hs(); return false; }
    if (document.body.classList.contains('tb-tour-open')) return false;
    if (a2hsHushed() && reason !== 'alerts' && reason !== 'imin') return false;
    try {
      if (sessionStorage.getItem('tb_a2hs_shown') === '1' && reason !== 'alerts' && reason !== 'imin') return false;
    } catch (e) {}
    if (reason === 'imin') {
      paintCalA2hs();
      return true;
    }
    try { sessionStorage.setItem('tb_a2hs_shown', '1'); } catch (e) {}
    if (reason === 'visit' || reason === 'gathering') {
      showHomeA2hs();
      return true;
    }
    launchAddToHomeScreen();
    return true;
  }

  function isIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent || '');
  }

  /** Instagram / Facebook / Messenger / TikTok / LinkedIn in-app browsers */
  function isInAppBrowser() {
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line\/|LinkedInApp|Twitter|TikTok|Snapchat|MicroMessenger|Pinterest/i.test(ua)
      || (isIos() && !/Safari/i.test(ua) && /AppleWebKit/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua));
  }

  /**
   * Install Concierge — one source of truth (Goldilocks).
   * States: INSTALLED | IN_APP_BROWSER | ANDROID_NATIVE | IPHONE_SAFARI | GENERIC
   */
  function getInstallState() {
    if (isStandalonePwa()) return 'INSTALLED';
    if (isInAppBrowser()) return 'IN_APP_BROWSER';
    if (typeof window.__tbDeferredInstall !== 'undefined' && window.__tbDeferredInstall) return 'ANDROID_NATIVE';
    if (isIos()) return 'IPHONE_SAFARI';
    if (isAndroid()) return 'ANDROID_MANUAL';
    return 'GENERIC';
  }

  function markInstalledSuccessOnce() {
    try {
      if (load('installSuccessSeen')) return;
      save('installSuccessSeen', true);
      setInstallProgress('INSTALLED');
      try { if (typeof tbFeedback !== 'undefined') tbFeedback.confirm(); } catch (e) {}
      const t = document.getElementById('install-toast');
      if (t) {
        t.textContent = "⚡ YOU'RE IN. Thunder Board is on your phone.";
        t.classList.add('toast-success');
        t.classList.remove('hidden');
        setTimeout(() => {
          t.classList.add('hidden');
          t.classList.remove('toast-success');
        }, 3800);
      }
    } catch (e) {}
  }

  /** Rescue progress — never claim INSTALLED without standalone */
  function getInstallProgress() {
    try { return load('installProgress') || 'ARRIVED'; } catch (e) { return 'ARRIVED'; }
  }
  function setInstallProgress(stage) {
    try {
      const order = ['ARRIVED','WRONG_BROWSER','READY_TO_INSTALL','INSTALL_ATTEMPTED','RETURNED_NOT_INSTALLED','INSTALLED'];
      const cur = getInstallProgress();
      if (stage === 'INSTALLED' || order.indexOf(stage) >= order.indexOf(cur)) {
        save('installProgress', stage);
      }
    } catch (e) {}
  }

  let __iosCoachStep = 0;
  const IOS_COACH = [
    { line: 'TAP SHARE', hint: 'Box with ↑ — often bottom center, or via More (⋯) then Share' },
    { line: 'ADD TO HOME SCREEN', hint: 'Scroll the Share sheet if needed — look for the Home Screen option' },
    { line: 'TAP ADD', hint: 'Confirm in the top corner — then open the new Thunder icon' }
  ];
  const IOS_COACH_ALT = [
    { line: 'FIND SHARE', hint: 'Some Safari layouts: tap More (⋯) first, then Share' },
    { line: 'ADD TO HOME SCREEN', hint: 'May appear as “Add to Home Screen” or under Edit Actions' },
    { line: 'TAP ADD', hint: 'Then leave Safari and open Thunder Board from your Home Screen' }
  ];

  function renderIosCoachStep() {
    const line = document.getElementById('ios-coach-line');
    const hint = document.getElementById('ios-coach-hint');
    const next = document.getElementById('ios-install-next');
    const wrap = document.getElementById('ios-coach-step');
    const dots = document.getElementById('ios-coach-dots');
    const steps = (__iosCoachAlt ? IOS_COACH_ALT : IOS_COACH);
    const i = Math.max(0, Math.min(__iosCoachStep, steps.length - 1));
    const s = steps[i];
    const apply = () => {
      if (line) line.textContent = s.line;
      if (hint) hint.textContent = s.hint;
      if (next) next.textContent = i >= steps.length - 1 ? 'GOT IT' : 'NEXT';
      if (dots) {
        const spans = dots.querySelectorAll('span');
        spans.forEach((sp, idx) => {
          if (idx <= i) sp.classList.add('on');
          else sp.classList.remove('on');
        });
      }
      if (wrap) wrap.classList.remove('is-settling');
    };
    if (wrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wrap.classList.add('is-settling');
      setTimeout(apply, 140);
    } else {
      apply();
    }
  }

  let __iosCoachAlt = false;

  function openIosInstallOverlay() {
    const el = document.getElementById('ios-install-overlay');
    if (!el) return;
    setInstallProgress('READY_TO_INSTALL');
    __iosCoachStep = 0;
    __iosCoachAlt = false;
    renderIosCoachStep();
    const sub = document.getElementById('ios-install-sub');
    if (sub) {
      const prog = getInstallProgress();
      sub.textContent = (prog === 'RETURNED_NOT_INSTALLED' || prog === 'INSTALL_ATTEMPTED')
        ? 'STILL WITH YOU. ⚡ Pick up where you left off.'
        : 'Three quick taps.';
    }
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
    if (__tourActive) return;
    const splash = document.getElementById('splash');
    if (splash && !splash.classList.contains('splash-done') && splash.style.display !== 'none') {
      if (!splash.classList.contains('hidden')) return;
    }
    if (typeof isTourComplete === 'function' && !isTourComplete()) return;
    const title = document.getElementById('inapp-install-title');
    const sub = el.querySelector('.ios-install-sub');
    if (isAndroid()) {
      if (title) title.textContent = 'OPEN IN CHROME';
      if (sub) sub.innerHTML = 'Install only works in Chrome.<br>Leave this in-app browser first.';
    } else {
      if (title) title.textContent = 'OPEN IN SAFARI';
      if (sub) sub.innerHTML = 'Home Screen only works in Safari.<br>Leave this in-app browser first.';
    }
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
      const reg = await navigator.serviceWorker.register('/sw.js?v=' + encodeURIComponent((cfg().APP_BUILD || '1')), { scope: '/' });
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
    // Authoritative: live PushManager subscription — not localStorage alone
    toggle.checked = !!subscribed;
    if (subscribed) save('gatheringAlertsOn', true);
    else save('gatheringAlertsOn', false);
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
      try { offerHomeScreen('alerts'); } catch (e) {}
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
      headers: await (async function () {
        const h = { 'Content-Type': 'application/json' };
        try {
          const { data } = await getSb().auth.getSession();
          const t = data && data.session && data.session.access_token;
          if (t) h.Authorization = 'Bearer ' + t;
        } catch (e) {}
        return h;
      })(),
      body: JSON.stringify({ subscription: sub.toJSON() })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('push-subscribe failed', res.status, err);
      setAlertsHint(err.error || 'Could not save subscription. Try again after deploy.');
      return false;
    }

    save('gatheringAlertsOn', true);
    setAlertsHint('On. Gathering, leadership line. Nothing else.');
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

  async function quietPushSubscribe() {
    try {
      const vapid = (cfg().VAPID_PUBLIC_KEY || '').trim();
      if (!vapid || !('serviceWorker' in navigator) || !('PushManager' in window)) return null;
      if (!('Notification' in window) || Notification.permission === 'denied') return null;
      const perm = Notification.permission === 'granted'
        ? 'granted'
        : await requestNotifyPermission();
      if (perm !== 'granted') return null;
      const reg = await ensureServiceWorker();
      if (!reg) return null;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid)
        });
      }
      await fetch('/.netlify/functions/push-subscribe', {
        method: 'POST',
        headers: await (async function () {
          const h = { 'Content-Type': 'application/json' };
          try {
            const { data } = await getSb().auth.getSession();
            const t = data && data.session && data.session.access_token;
            if (t) h.Authorization = 'Bearer ' + t;
          } catch (e) {}
          return h;
        })(),
        body: JSON.stringify({ subscription: sub.toJSON() })
      });
      save('gatheringAlertsOn', true);
      try { window.__tbPushEndpoint = sub.endpoint; } catch (e) {}
      return sub;
    } catch (e) {
      return null;
    }
  }

  async function notifyImInBroadcast() {
    try {
      const first = (typeof knownFirstName === 'function' && knownFirstName()) || '';
      const headers = { 'Content-Type': 'application/json' };
      try {
        const sb = getSb && getSb();
        if (sb && sb.auth && sb.auth.getSession) {
          const { data } = await sb.auth.getSession();
          const accessToken = (data && data.session && data.session.access_token) || '';
          if (accessToken) headers.Authorization = 'Bearer ' + accessToken;
        }
      } catch (e) {}
      fetch('/.netlify/functions/push-im-in', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          name: first,
          meeting_key: meetingKey(),
          endpoint: window.__tbPushEndpoint || ''
        })
      }).catch(function () {});
    } catch (e) {
      console.warn('im-in push', e);
    }
  }

  let __tbBroadcastInFlight = false;
  async function broadcastAnnouncementPush(title, bodyText) {
    // Authority is Supabase session + app_members leader/admin — not LEADER_PIN.
    // Reaches only brothers who enabled Gathering Alerts (stored push subscriptions).
    if (__tbBroadcastInFlight) {
      console.warn('push-broadcast skipped: already in flight');
      return { ok: false, reason: 'in_flight' };
    }
    __tbBroadcastInFlight = true;
    try {
      const sb = getSb && getSb();
      let accessToken = '';
      if (sb && sb.auth && sb.auth.getSession) {
        const { data } = await sb.auth.getSession();
        accessToken = (data && data.session && data.session.access_token) || '';
      }
      if (!accessToken) {
        console.warn('push-broadcast skipped: not signed in');
        return { ok: false, reason: 'sign_in_required' };
      }
      const res = await fetch('/.netlify/functions/push-broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken
        },
        body: JSON.stringify({
          title: String(title || 'Sons of Thunder').slice(0, 80),
          body: String(bodyText != null ? bodyText : '').slice(0, 120),
          url: '/?view=home',
          tag: 'thunder-leader'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('push-broadcast', res.status, data);
        return { ok: false, status: res.status, error: data.error || data, data };
      }
      return { ok: true, sent: data.sent, failed: data.failed, data };
    } catch (e) {
      console.warn('push-broadcast network', e);
      return { ok: false, reason: 'network', error: e };
    } finally {
      __tbBroadcastInFlight = false;
    }
  }


  // Housekeeping: bounded, event-driven only — no polling, no auto-delete of user data
  function cacheClearBlocked() {
    try {
      if (typeof __tourActive !== 'undefined' && __tourActive) return true;
      if (document.body.classList.contains('tb-tour-open')) return true;
      if (document.body.classList.contains('tb-ask-open')) return true;
      if (document.body.classList.contains('tb-raffle-live')) return true;
      if (document.body.classList.contains('tb-axum-open')) return true;
      const gate = document.getElementById('auth-gate');
      if (gate && !gate.classList.contains('hidden')) return true;
      const splash = document.getElementById('splash');
      if (splash && !splash.classList.contains('splash-done') && !splash.classList.contains('hidden')) return true;
    } catch (e) {}
    return false;
  }

  function pingServiceWorkerUpdate() {
    try {
      if (!('serviceWorker' in navigator)) return;
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg && reg.update) reg.update().catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  function reconcileOnWake() {
    try { refreshAlertsToggleUI(); } catch (e) {}
    try {
      const sb = getSb && getSb();
      if (sb && sb.auth && sb.auth.getSession) sb.auth.getSession().catch(function () {});
    } catch (e) {}
    try { pingServiceWorkerUpdate(); } catch (e) {}
    try { checkStaleBuild(); } catch (e) {}
  }

  function runLaunchHousekeeping() {
    try {
      const build = (cfg().APP_BUILD || '').toString();
      if (build) sessionStorage.setItem('tb_app_build', build);
    } catch (e) {}
    try {
      const ghost = document.getElementById('rsvp-add-cal');
      if (ghost) ghost.remove();
    } catch (e) {}
    try { renderRsvp(); } catch (e) {}
  }

  function setupHousekeeping() {
    if (window.__tbHousekeepingBound) return;
    window.__tbHousekeepingBound = true;
    try { runLaunchHousekeeping(); } catch (e) {}
    const build = (cfg().APP_BUILD || '').toString();
    try {
      const prev = sessionStorage.getItem('tb_app_build');
      if (build && prev && prev !== build) {
        console.info('Thunder Board: new build', build, '(was', prev + ')');
      }
      if (build) sessionStorage.setItem('tb_app_build', build);
    } catch (e) {}
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      reconcileOnWake();
    });
    window.addEventListener('online', function () {
      reconcileOnWake();
    });
    window.addEventListener('pageshow', function () {
      reconcileOnWake();
    });
    window.addEventListener('focus', function () {
      try { checkStaleBuild(); } catch (e) {}
    });
    setTimeout(function () { try { checkStaleBuild(); } catch (e) {} }, 2500);
    if (!window.__tbBuildWatch) {
      window.__tbBuildWatch = setInterval(function () {
        if (document.visibilityState !== 'visible') return;
        try { pingServiceWorkerUpdate(); } catch (e) {}
        try { checkStaleBuild(); } catch (e) {}
      }, 45000);
    }
    try {
      if ('serviceWorker' in navigator && !window.__tbSwCtrlBound) {
        window.__tbSwCtrlBound = true;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          try { checkStaleBuild(); } catch (e) {}
        });
      }
    } catch (e) {}
  }

  async function checkStaleBuild() {
    try {
      if (cacheClearBlocked()) {
        if (!window.__tbStaleRetry) {
          window.__tbStaleRetry = setTimeout(function () {
            window.__tbStaleRetry = null;
            try { checkStaleBuild(); } catch (e) {}
          }, 8000);
        }
        return;
      }
      const r = await fetch('build.json?_=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const live = String(j.APP_BUILD || '');
      const here = String((cfg() && cfg().APP_BUILD) || '');
      if (!live || !here || live === here) return;
      if (sessionStorage.getItem('tb_reloading') === live) return;
      sessionStorage.setItem('tb_reloading', live);
      forceRefreshApp();
    } catch (e) {}
  }

  async function forceRefreshApp() {
    // Cache/SW only. Never delete sb-* / supabase keys or IndexedDB auth.
    try { tbToast('Updating… hang tight', 4000); } catch (e) {}
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {}
    try {
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) {}
    setTimeout(() => {
      try {
        const u = new URL(window.location.href);
        u.searchParams.set('_tb', String(Date.now()));
        window.location.replace(u.toString());
      } catch (e) {
        window.location.reload(true);
      }
    }, 280);
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


  // ---------- PRODUCT TOUR — 7-slide (restored 20260818) ----------
  const TB_TOUR_VERSION = 42;
  function tourStorageKey() { return 'thunderTourV' + TB_TOUR_VERSION; }
  function isTourComplete() {
    try {
      const s = load(tourStorageKey());
      return !!(s && s.done);
    } catch (e) { return false; }
  }
  function setTourState(patch) {
    try {
      const cur = load(tourStorageKey()) || {};
      save(tourStorageKey(), Object.assign({}, cur, patch, { v: TB_TOUR_VERSION }));
    } catch (e) {}
  }
  function getTourState() {
    try { return load(tourStorageKey()) || {}; } catch (e) { return {}; }
  }

  /* Tour copy/boards. Memories slide = DROP A PIC, no fake mini photos. */
  const TB_TOUR_STEPS = [
    {
      id: 'welcome',
      headline: 'FOLLOW ME',
      sub: 'I\u2019LL SHOW YOU THE ROOM',
      body: 'I\u2019m Thunder. I\u2019ve got your back. Let me show you around.',
      nextLabel: 'LET\u2019S GO'
    },
    {
      id: 'locked-in',
      headline: 'LOCKED IN',
      sub: 'NEVER MISS WHAT MATTERS',
      body: 'Tap I\u2019M IN. We save your seat and remind you so you don\u2019t miss it.',
      nextLabel: 'NEXT'
    },
    {
      id: 'brothers',
      headline: 'BROTHERS',
      sub: 'THE ROUND TABLE',
      body: 'This is where we stay connected. Names. Faces. A seat for every man — like knights at one table.',
      nextLabel: 'NEXT'
    },
    {
      id: 'memories',
      headline: 'MEMORIES',
      sub: 'DROP A PIC.',
      body: 'The nights we keep. Drop a photo. Build the history.',
      nextLabel: 'NEXT'
    },
    {
      id: 'text-leader',
      headline: 'TEXT A LEADER',
      sub: 'WHEN YOU NEED IT MOST',
      body: 'Rough day? Hard season? Text a leader. Confidential. Always.',
      nextLabel: 'NEXT'
    },
    {
      id: 'ask-thunder',
      headline: 'ASK THUNDER',
      sub: 'AT YOUR SERVICE',
      body: 'Questions? I\u2019m in the corner. Tap me when you\u2019re ready. You\u2019re set, brother.',
      nextLabel: 'LET\u2019S GO'
    }
  ];

  let __tourIdx = 0;
  let __tourActive = false;

  function tourReducedMotion() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  let __tourTypeTimer = null;
  let __tourTypeToken = 0;
  let __tourBubbleDelay = null;
  let __hostFidgetTimer = null;
  let __hostGlintTimer = null;
  let __hostSwayTimer = null;

  function stopTourHostMotion() {
    [__hostFidgetTimer, __hostGlintTimer, __hostSwayTimer].forEach(function (t) {
      if (t) try { clearTimeout(t); } catch (e) {}
    });
    __hostFidgetTimer = __hostGlintTimer = __hostSwayTimer = null;
    const host = document.getElementById('tb-tour-host');
    if (host) {
      host.classList.remove('tb-host-enter', 'tb-host-fidget', 'tb-host-glint', 'tb-host-sway');
    }
  }

  /* Tour host idle — host only. Irregular. Never a metronome. */
  function applyTourHostExpression(idx) {
    const host = document.getElementById('tb-tour-host');
    if (!host) return;
    stopTourHostMotion();
    const moods = ['arrive', 'lockin', 'brotherhood', 'watch', 'listen', 'appreciate'];
    const mood = moods[idx] || 'arrive';
    const bolt = 'assets/thunder-tour-host.png?v=20260819-bond2';
    const tux = 'assets/thunder-bond-hero.png?v=20260819-tux2';
    if (idx === 5) {
      host.className = 'tb-guide-thunder tb-host-alive tb-host-bond';
      host.src = tux;
      host.removeAttribute('srcset');
      if (!tourReducedMotion()) {
        void host.offsetWidth;
        host.classList.add('tb-host-bond-pop');
      }
    } else {
      host.className = 'tb-guide-thunder tb-host-alive tb-host-' + mood;
      if (host.getAttribute('src') !== bolt) {
        host.src = bolt;
        host.setAttribute('srcset', bolt + ' 400w, assets/thunder-tour-host@2x.png?v=20260819-s47 800w');
      }
    }
    if (tourReducedMotion()) return;
    /* CSS owns host motion per board. No fidget shake. */
    return;
    host.classList.add('tb-host-enter');
    __hostFidgetTimer = setTimeout(function () {
      host.classList.remove('tb-host-enter');
      host.classList.add('tb-host-fidget');
      setTimeout(function () { host.classList.remove('tb-host-fidget'); }, 520);
    }, 720 + Math.random() * 900);
    function glintTick() {
      if (!document.body.classList.contains('tb-tour-open')) return;
      host.classList.add('tb-host-glint');
      setTimeout(function () { host.classList.remove('tb-host-glint'); }, 260);
      __hostGlintTimer = setTimeout(glintTick, 4800 + Math.random() * 7200);
    }
    __hostGlintTimer = setTimeout(glintTick, 1800 + Math.random() * 2400);
    if (idx !== moods.length - 1) {
      __hostSwayTimer = setTimeout(function () {
        host.classList.add('tb-host-sway');
        setTimeout(function () { host.classList.remove('tb-host-sway'); }, 1400);
      }, 4200 + Math.random() * 2200);
    }
  }

  function stopTourTypewriter() {
    if (__tourTypeTimer) {
      try { clearTimeout(__tourTypeTimer); } catch (e) {}
      __tourTypeTimer = null;
    }
  }

  function typeTourBody(fullText, bodyEl) {
    stopTourTypewriter();
    if (!bodyEl) return;
    const text = fullText || '';
    const bubble = bodyEl.closest('.tb-guide-bubble');
    if (bubble && !tourReducedMotion()) {
      bubble.classList.remove('tb-speak-flash');
      void bubble.offsetWidth;
      bubble.classList.add('tb-speak-flash');
    }
    if (tourReducedMotion() || !text) {
      bodyEl.textContent = text;
      bodyEl.classList.remove('tb-tour-typing');
      return;
    }
    const token = ++__tourTypeToken;
    bodyEl.textContent = '';
    bodyEl.classList.add('tb-tour-typing');
    let i = 0;
    /* ~70 chars/sec — snappy, still a speak. Reduced-motion dumps full text above. */
    const ms = 24;
    try { tbFeedback.selection(); } catch (e) {}
    function tick() {
      if (token !== __tourTypeToken) return;
      i += 1;
      bodyEl.textContent = text.slice(0, i);
      if (i < text.length) {
        __tourTypeTimer = setTimeout(tick, ms);
      } else {
        bodyEl.classList.remove('tb-tour-typing');
        __tourTypeTimer = null;
      }
    }
    __tourTypeTimer = setTimeout(tick, 110);
  }

  /* Brothers grid — 5 mechanics, personality changes speed/amp/timing. No float. */
  const BRO_STYLE = {
    soldier: { amp: 0.65, speed: 0.8 },
    hippie:  { amp: 1.15, speed: 1.45 },
    dad:     { amp: 0.9,  speed: 1.05 },
    tough:   { amp: 0.75, speed: 0.9 },
    cool:    { amp: 0.7,  speed: 1.15 },
    goof:    { amp: 1.1,  speed: 0.75 }
  };
  let __broIdleTimers = [];
  function broSet(el, x, y, z, t, ms) {
    el.style.transitionDuration = (ms || 500) + 'ms';
    el.style.setProperty('--bro-x', (x || 0) + 'deg');
    el.style.setProperty('--bro-y', (y || 0) + 'deg');
    el.style.setProperty('--bro-z', (z || 0) + 'deg');
    el.style.setProperty('--bro-t', (t || 0) + 'px');
  }
  function broRest(el, ms) { broSet(el, 0, 0, 0, 0, ms); }
  function broAfter(ms, fn) {
    const t = setTimeout(fn, ms);
    __broIdleTimers.push(t);
    return t;
  }
  function stopBroPersonaIdle() {
    __broIdleTimers.forEach(function (t) { try { clearTimeout(t); } catch (e) {} });
    __broIdleTimers = [];
    document.querySelectorAll('.tb-live-bros-full .tb-live-face').forEach(function (el) {
      broRest(el, 300);
    });
  }
  function startBroPersonaIdle() {
    stopBroPersonaIdle();
    if (tourReducedMotion()) return;
    document.querySelectorAll('.tb-live-bros-full .tb-live-face').forEach(function (el, i) {
      const persona = el.getAttribute('data-persona') || 'dad';
      const st = BRO_STYLE[persona] || BRO_STYLE.dad;
      const A = st.amp;
      const S = st.speed;
      const born = Date.now();
      function mechLook() {
        if (persona === 'soldier') {
          broSet(el, 0, -10 * A, 0, 0, 380 * S);
          broAfter(420 * S, function () { broSet(el, 0, 10 * A, 0, 0, 480 * S); });
          broAfter(980 * S, function () { broRest(el, 360 * S); });
        } else if (persona === 'hippie') {
          broSet(el, 2 * A, -8 * A, 4 * A, 0, 900 * S);
          broAfter(1100 * S, function () { broSet(el, 0, 9 * A, -3 * A, 0, 1100 * S); });
          broAfter(2400 * S, function () { broRest(el, 800 * S); });
        } else if (persona === 'cool') {
          broSet(el, 7 * A, 0, 0, -1, 500 * S);
          broAfter(900 * S, function () { broRest(el, 500 * S); });
        } else if (persona === 'goof') {
          broSet(el, 0, -14 * A, 0, 0, 180);
          broAfter(260, function () { broRest(el, 140); });
          broAfter(480, function () { broSet(el, 0, -14 * A, 0, 0, 160); });
          broAfter(720, function () { broRest(el, 200); });
        } else if (persona === 'tough') {
          broSet(el, 3 * A, 4 * A, 0, 0, 400 * S);
          broAfter(700 * S, function () { broRest(el, 400 * S); });
        } else {
          broSet(el, 0, 9 * A, 0, 0, 220);
          broAfter(380, function () { broRest(el, 260); });
        }
      }
      function mechShift() {
        if (persona === 'soldier') broSet(el, 0, 0, 0, -1.5 * A, 180);
        else if (persona === 'hippie') broSet(el, 0, 0, 6 * A, 1 * A, 800 * S);
        else if (persona === 'cool' || persona === 'tough') broSet(el, -5 * A, 0, 0, 0, 400 * S);
        else broSet(el, 0, 0, 3 * A, 1 * A, 500);
        broAfter((persona === 'hippie' ? 1400 : 700) * S, function () { broRest(el, 400 * S); });
      }
      function mechReset() {
        if (persona === 'soldier') { broSet(el, 0, 0, 0, -2, 140); broAfter(220, function () { broRest(el, 160); }); }
        else if (persona === 'tough') { broSet(el, 0, 0, -8 * A, 0, 220); broAfter(480, function () { broRest(el, 220); }); }
        else if (persona === 'hippie') { broSet(el, 0, 0, 5 * A, 0, 700); broAfter(800, function () { broSet(el, 0, 0, -4 * A, 0, 700); }); broAfter(1600, function () { broRest(el, 700); }); }
        else { broSet(el, 0, 0, 7 * A, 0, 280); broAfter(400, function () { broSet(el, 0, 0, -5 * A, 0, 280); }); broAfter(760, function () { broRest(el, 280); }); }
      }
      function mechRare() {
        if (persona === 'cool') {
          broSet(el, 10 * A, 0, 0, -2, 600);
          broAfter(1400, function () { broRest(el, 500); });
        } else if (persona === 'soldier') {
          mechLook();
          broAfter(1200 * S, function () { broSet(el, 0, 0, 0, -2, 160); });
          broAfter(1500 * S, function () { broRest(el, 160); });
        } else if (persona === 'goof') mechLook();
        else if (persona === 'dad') {
          broSet(el, 0, 8 * A, 0, 0, 200);
          broAfter(600, function () { broSet(el, 0, 0, 4 * A, 0, 300); });
          broAfter(1100, function () { broRest(el, 300); });
        } else if (persona === 'tough') {
          broSet(el, 0, 0, -10 * A, 0, 200);
          broAfter(500, function () { broRest(el, 220); });
        } else {
          broSet(el, 4 * A, 0, 5 * A, 1, 900 * S);
          broAfter(1600 * S, function () { broRest(el, 800 * S); });
        }
      }
      function loop() {
        if (__tourIdx !== 2) return;
        const quiet = Date.now() - born;
        const r = Math.random();
        if (quiet > 8000 && r < 0.18) mechRare();
        else if (r < 0.28) mechLook();
        else if (r < 0.55) mechShift();
        else if (r < 0.78) mechReset();
        else mechLook();
        const gap = (2800 + Math.random() * 4200) * S + i * 180;
        broAfter(gap, loop);
      }
      broAfter(i * 28, function () {
        mechLook();
        broAfter(900 + Math.random() * 400, loop);
      });
    });
  }

  function renderTourSlide() {
    const step = TB_TOUR_STEPS[__tourIdx];
    if (!step) return;
    const img = document.getElementById('tb-tour-slide-img');
    const headline = document.getElementById('tb-tour-headline');
    const body = document.getElementById('tb-tour-body');
    const progress = document.getElementById('tb-tour-progress');
    const next = document.getElementById('tb-tour-next');
    const back = document.getElementById('tb-tour-back');
    const dots = document.getElementById('tb-tour-dots');

    document.querySelectorAll('.tb-live-slide').forEach(function (el) {
      const on = Number(el.getAttribute('data-slide')) === __tourIdx;
      el.classList.toggle('is-on', on);
    });
    const live = document.getElementById('tb-tour-live');
    if (live && !tourReducedMotion() && __tourIdx !== 5) {
      live.classList.remove('tb-tour-slide-in');
      void live.offsetWidth;
      live.classList.add('tb-tour-slide-in');
    }
    if (img) {
      img.src = step.slide;
      img.alt = step.headline || '';
    }
    const sub = document.getElementById('tb-tour-sub');
    const stage = document.querySelector('#tb-tour .tb-tour-stage');
    if (stage) stage.setAttribute('data-board', String(__tourIdx));
    if (headline) headline.textContent = step.headline || '';
    if (sub) {
      sub.textContent = step.sub || '';
      sub.classList.toggle('hidden', !step.sub);
    }
    applyTourHostExpression(__tourIdx);
    if (__tourBubbleDelay) {
      try { clearTimeout(__tourBubbleDelay); } catch (e) {}
      __tourBubbleDelay = null;
    }
    if (__tourIdx === 2) {
      startBroPersonaIdle();
      if (body) body.textContent = '';
      __tourBubbleDelay = setTimeout(function () {
        typeTourBody(step.body || '', body);
      }, 1100);
    } else if (__tourIdx === 5) {
      stopBroPersonaIdle();
      if (body) body.textContent = '';
      __tourBubbleDelay = setTimeout(function () {
        typeTourBody(step.body || '', body);
      }, 720);
    } else {
      stopBroPersonaIdle();
      typeTourBody(step.body || '', body);
    }
    if (progress) progress.textContent = (__tourIdx + 1) + ' OF ' + TB_TOUR_STEPS.length;
    if (next) next.textContent = step.nextLabel || (__tourIdx >= TB_TOUR_STEPS.length - 1 ? 'DONE' : 'NEXT');
    if (back) back.disabled = __tourIdx <= 0;
    if (dots) {
      dots.innerHTML = TB_TOUR_STEPS.map(function (_, i) {
        return '<span class="' + (i === __tourIdx ? 'on' : '') + '"></span>';
      }).join('');
    }
  }

  function showTour() {
    const root = document.getElementById('tb-tour');
    if (!root) return;
    try { closeInAppInstallOverlay(); } catch (e) {}
    try { closeIosInstallOverlay(); } catch (e) {}
    root.classList.remove('hidden');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tb-tour-open');
    try { tbKeepAwake('tour'); } catch (e) {}
    syncTourExitUI();
    renderTourSlide();
  }

  function hideTour() {
    stopTourTypewriter();
    if (__tourBubbleDelay) {
      try { clearTimeout(__tourBubbleDelay); } catch (e) {}
      __tourBubbleDelay = null;
    }
    stopTourHostMotion();
    stopBroPersonaIdle();
    const root = document.getElementById('tb-tour');
    if (root) {
      root.classList.add('hidden');
      root.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('tb-tour-open');
    document.body.classList.remove('tb-tour-mandatory');
    __tourActive = false;
    try { tbAllowSleep('tour'); } catch (e) {}
  }

  function isTourMandatory() {
    return false; // First-run is optional. Thunder invites once from backstage.
  }

  function syncTourExitUI() {
    const lock = !!(__tourActive && isTourMandatory());
    document.body.classList.toggle('tb-tour-mandatory', lock);
    const skip = document.getElementById('tb-tour-skip');
    const closeBtn = document.getElementById('tb-tour-close');
    if (skip) {
      skip.classList.toggle('hidden', lock);
      skip.setAttribute('aria-hidden', lock ? 'true' : 'false');
    }
    if (closeBtn) {
      closeBtn.classList.toggle('hidden', lock);
      closeBtn.setAttribute('aria-hidden', lock ? 'true' : 'false');
    }
  }

  function skipTour() {
    if (isTourMandatory()) return;
    setTourState({ done: true, skipped: true, at: Date.now() });
    hideTour();
  }

  function completeTour() {
    setTourState({ done: true, completed: true, at: Date.now() });
    hideTour();
    setTimeout(function () {
      try { offerHomeScreen('tour'); } catch (e) {}
    }, 900);
  }

  function startTour(opts) {
    opts = opts || {};
    if (__tourActive && !opts.force) return;
    if (!opts.force && !opts.replay && isTourComplete()) return;
    __tourActive = true;
    __tourIdx = 0;
    showTour();
  }
  try { window.startTour = startTour; } catch (e) {}

  function tourNext() {
    if (!__tourActive) return;
    if (__tourIdx >= TB_TOUR_STEPS.length - 1) {
      completeTour();
      return;
    }
    if (__tourIdx === 4 && !tourReducedMotion()) {
      const stage = document.querySelector('#tb-tour .tb-tour-stage');
      if (stage) stage.classList.add('tb-finale-leave');
      setTimeout(function () {
        if (stage) stage.classList.remove('tb-finale-leave');
        __tourIdx = 5;
        renderTourSlide();
      }, 360);
      return;
    }
    __tourIdx += 1;
    renderTourSlide();
  }

  function tourBack() {
    if (!__tourActive || __tourIdx <= 0) return;
    __tourIdx -= 1;
    renderTourSlide();
  }

  function presentationScrub() {
    try { closeCalConfirmSheet(); } catch (e) {}
    try { closeAxumDrop(); } catch (e) {}
    try { closeAxumCard(); } catch (e) {}
    ['ios-install-overlay', 'inapp-install-overlay', 'welcome', 'axum-drop', 'axum-card', 'cal-confirm-sheet'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
      }
    });
    try { document.body.classList.remove('cal-sheet-open', 'tb-axum-open'); } catch (e) {}
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  function bindLeaderGhost() {
    /* Leadership stays hidden until refreshChairMode confirms an active leader/admin. */
    const zone = document.querySelector('.admin-zone');
    if (zone) {
      zone.classList.add('hidden');
      zone.classList.remove('tb-leader-ghost');
    }
    const tools = document.getElementById('leader-tools');
    if (tools) tools.classList.add('hidden');
    const unlockBtn = document.getElementById('leader-unlock-btn');
    if (unlockBtn) unlockBtn.classList.add('hidden');
    chairUnlocked = false;
    leaderUnlocked = false;
  }

  function maybeStartProductTour() {
    if (typeof isTourComplete === 'function' && isTourComplete()) return;
    if (typeof startTour === 'function') startTour();
  }

  function bindTourControls() {
    const next = document.getElementById('tb-tour-next');
    const back = document.getElementById('tb-tour-back');
    const skip = document.getElementById('tb-tour-skip');
    const closeBtn = document.getElementById('tb-tour-close');
    if (next && !next.dataset.tbBound) {
      next.dataset.tbBound = '1';
      next.addEventListener('click', function () {
        try { if (window.tbFeedback) tbFeedback.press(next); } catch (e) {}
        tourNext();
      });
    }
    if (back && !back.dataset.tbBound) {
      back.dataset.tbBound = '1';
      back.addEventListener('click', function () { tourBack(); });
    }
    if (skip && !skip.dataset.tbBound) {
      skip.dataset.tbBound = '1';
      skip.addEventListener('click', function () { skipTour(); });
    }
    if (closeBtn && !closeBtn.dataset.tbBound) {
      closeBtn.dataset.tbBound = '1';
      closeBtn.addEventListener('click', function () { skipTour(); });
    }
    const tourRoot = document.getElementById('tb-tour');
    if (tourRoot && tourRoot.dataset.swipeClose !== '1') {
      tourRoot.dataset.swipeClose = '1';
      bindElasticSwipe(tourRoot, {
        getEl: function () { return tourRoot.querySelector('.tb-tour-stage') || tourRoot; },
        onDown: function () { skipTour(); },
        canDown: function () { return !isTourMandatory(); },
        onDownDist: 52,
        follow: 0.88,
        blocked: function (t) {
          return !!(t && t.closest && t.closest('button, a, input, textarea, video'));
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!document.body.classList.contains('tb-tour-open')) return;
      if (isTourMandatory()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      skipTour();
    }, true);
    const replay = document.getElementById('replay-tour-btn') || document.getElementById('take-tour-btn');
    if (replay) replay.textContent = 'TAKE THE TOUR';
    if (replay && !replay.dataset.tbBound) {
      replay.dataset.tbBound = '1';
      replay.addEventListener('click', function () { startTour({ force: true, replay: true }); });
    }
  }


  // ---------- INIT ----------
  async function init() {
    runSplash();
    try {
      const header = document.getElementById('main-header');
      if (header) {
        header.style.display = 'block';
        header.style.visibility = 'visible';
        header.removeAttribute('hidden');
      }
    } catch (eH) {}
    try { if (roomCut()) document.body.classList.add('tb-room-cut'); } catch (e) {}
    try { presentationScrub(); } catch (e) {}
    try { bindLeaderGhost(); } catch (e) {}
    try {
      const live = document.getElementById('install-live-link');
      if (live) live.textContent = publicOrigin().replace(/^https?:\/\//, '');
    } catch (e) {}
    try { markPatioFromUrl(); runPatioAlive(); } catch (e) {}
    try { bindTourControls(); } catch (e) {}
    try { maybeStartProductTour(); } catch (e) {}
    bootstrapSeenState();
    updateMeetingCard();
    setupReminderButton();
    setupNotificationSystem();
    setupGatheringAlerts();
    try { applyDeepLink(location.href); } catch (e) {}
    try {
      const n = Number(load('tbVisits') || 0) + 1;
      save('tbVisits', n);
      if (!isStandalonePwa() && isTourComplete()) {
        const d = daysUntil(getNextMeetingMonday());
        if (n >= 2 || d === 0 || d === 1) offerHomeScreen(d === 0 || d === 1 ? 'gathering' : 'visit');
      } else {
        hideHomeA2hs();
      }
    } catch (e) {}
    bindImInA2hsSheet();
    const a2hsPut = document.getElementById('home-a2hs-put');
    const a2hsLater = document.getElementById('home-a2hs-later');
    if (a2hsPut && !a2hsPut.dataset.tbBound) {
      a2hsPut.dataset.tbBound = '1';
      a2hsPut.addEventListener('click', function () { launchAddToHomeScreen(); });
    }
    if (a2hsLater && !a2hsLater.dataset.tbBound) {
      a2hsLater.dataset.tbBound = '1';
      a2hsLater.addEventListener('click', function () {
        hushA2hs(7);
        hideHomeA2hs();
      });
    }
    try {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', function (ev) {
          if (ev.data && ev.data.type === 'tb-open') applyDeepLink(ev.data.url || '/?view=home');
          if (ev.data && ev.data.type === 'tb-sw-updated') {
            try { checkStaleBuild(); } catch (e) {}
          }
        });
      }
    } catch (e) {}
    setupHousekeeping();
    renderAnnouncements();
    renderBrothers();
    renderUpcoming();
    renderMedia();
    // Static HTML empty-state CTA (before shared memories load) opens add flow
    (function bindStaticMemoryCta() {
      const s = document.getElementById('empty-memories-cta-static');
      if (s && !s.dataset.bound) {
        s.dataset.bound = '1';
        s.addEventListener('click', function () {
          const btn = document.getElementById('btn-add-memory');
          if (btn) btn.click();
          else if (typeof openMediaModal === 'function') openMediaModal();
        });
      }
    })();
    renderCode();
    renderMission();
    renderHomeMission();
    renderEventsNote();
    renderLastFire();
    bindInfoCardTargets();
    try { renderRsvp(); } catch (e) { console.warn('renderRsvp', e); }
    bindEvents();
    bindHomeMemberCta();
    updateAllNewBadges();
    showView('home');
    /* loadIronFeed retired — RSS cut 2026-08-18 */
    bindActivityTags();
    (function bindPatio() {
      const here = document.getElementById('here-btn');
      if (here && here.dataset.bound !== '1') {
        here.dataset.bound = '1';
        here.addEventListener('click', function () { checkInHere(); });
      }
      const beer = document.getElementById('draw-beer-btn');
      const hat = document.getElementById('draw-hat-btn');
      if (beer && beer.dataset.bound !== '1') {
        beer.dataset.bound = '1';
        beer.addEventListener('click', function () { drawRaffle('beer'); });
      }
      const memSign = document.getElementById('memories-signin-shot');
      if (memSign && memSign.dataset.bound !== '1') {
        memSign.dataset.bound = '1';
        memSign.addEventListener('click', function () { openDropShot(); });
      }
      const memLib = document.getElementById('memories-library-btn');
      if (memLib && memLib.dataset.bound !== '1') {
        memLib.dataset.bound = '1';
        memLib.addEventListener('click', function () { openLibraryShot(); });
      }
      if (hat && hat.dataset.bound !== '1') {
        hat.dataset.bound = '1';
        hat.addEventListener('click', function () { drawRaffle('hat'); });
      }
      const raffleLive = document.getElementById('raffle-live');
      if (raffleLive && raffleLive.dataset.bound !== '1') {
        raffleLive.dataset.bound = '1';
        raffleLive.addEventListener('click', function (e) {
          if (e.target && e.target.id === 'raffle-live-close') return;
          if (raffleLive.classList.contains('is-landed')) closeRaffleLive();
        });
      }
      const raffleClose = document.getElementById('raffle-live-close');
      if (raffleClose && raffleClose.dataset.bound !== '1') {
        raffleClose.dataset.bound = '1';
        raffleClose.addEventListener('click', function (e) {
          e.stopPropagation();
          closeRaffleLive();
        });
      }
    })();
    (function bindAxumCoffee() {
      const chip = document.getElementById('axum-chip');
      const showBtn = document.getElementById('axum-show-btn');
      const closeCard = document.getElementById('axum-card-close');
      const backdrop = document.getElementById('axum-drop-backdrop');
      const redeem = document.getElementById('axum-redeem-btn');
      if (chip && chip.dataset.bound !== '1') {
        chip.dataset.bound = '1';
        chip.addEventListener('click', function () { openAxumCard(); });
      }
      if (showBtn && showBtn.dataset.bound !== '1') {
        showBtn.dataset.bound = '1';
        showBtn.addEventListener('click', function () { openAxumCard(); });
      }
      if (closeCard && closeCard.dataset.bound !== '1') {
        closeCard.dataset.bound = '1';
        closeCard.addEventListener('click', closeAxumCard);
      }
      if (backdrop && backdrop.dataset.bound !== '1') {
        backdrop.dataset.bound = '1';
        backdrop.addEventListener('click', closeAxumDrop);
      }
      if (redeem && redeem.dataset.bound !== '1') {
        redeem.dataset.bound = '1';
        redeem.addEventListener('click', function () {
          if (redeem.dataset.armed !== '1') {
            redeem.dataset.armed = '1';
            redeem.textContent = 'CONFIRM — THIS DIES';
            return;
          }
          redeemAxumCoffee();
        });
      }
    })();
    try {
      await initAuth();
      try { await refreshChairMode(); } catch (eC) {}
      try { await pullRaffle(); } catch (e) {}
      try { renderHere(); } catch (e) {}
      try {
        if (/[?&]checkin=1/.test(location.search || '')) checkInHere();
      } catch (e) {}
      try { maybeShowAxumCoffee(); } catch (e) {}
      // Shared announcements + gathering board + brothers (read without sign-in)
      try {
        await pullAnnouncements();
        renderAnnouncements();
        if (typeof renderAdminAnnouncements === 'function') renderAdminAnnouncements();
      } catch (eA) {
        console.warn('announcements init', eA);
      }
      try {
        await pullEventsBoard();
        renderMission();
        renderEventsNote();
        updateAllNewBadges();
      } catch (e2) {
        console.warn('events board init', e2);
      }
      try {
        await pullBrothers();
        renderBrothers();
      } catch (eB) {
        console.warn('brothers init', eB);
      }
      try {
        await pullRsvps();
      } catch (eR) {
        console.warn('rsvps init', eR);
      }
      if (isSignedIn()) {
        await pullMemories();
        renderMedia();
        renderLastFire();
      }
      // Live updates: when another brother saves a profile (or leadership edits board), this device refreshes
      try {
        setupRealtime();
      } catch (eR) {
        console.warn('realtime init', eR);
      }
    } catch (e) {
      console.warn('Auth / memories init', e);
    }
  }

  try { init(); } catch (e) { console.error('Thunder Board init', e); }
})();
