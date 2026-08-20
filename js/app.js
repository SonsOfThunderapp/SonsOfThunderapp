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
  const DEFAULT_BROTHERS = [];
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
    const uid = 'thunder-gathering-' + start.getFullYear() + pad(start.getMonth() + 1) + pad(start.getDate()) + '@sonsofthunder.netlify.app';
    const title = 'Sons of Thunder — Next Gathering';
    const loc = venueName();
    const desc = [
      'Sons of Thunder monthly gathering. Show up.',
      'Check Thunder Board for the latest gathering details.',
      'https://sonsofthunder.netlify.app/'
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
      'URL:https://sonsofthunder.netlify.app/',
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
  /**
   * Open native calendar with next gathering prefilled.
   * PWA cannot silently write to Calendar — OS requires user Save/Add.
   * Strategy: data: ICS (iOS often hands to Calendar) → blob download → Google Calendar template.
   */
  function launchGatheringCalendar() {
    try {
      const next = getNextMeetingMonday();
      const ics = buildGatheringIcs(next);
      if (__calBlobUrl) {
        try { URL.revokeObjectURL(__calBlobUrl); } catch (e) {}
        __calBlobUrl = null;
      }
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      __calBlobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = __calBlobUrl;
      a.download = 'sons-of-thunder-gathering.ics';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try { a.remove(); } catch (e) {}
        try { URL.revokeObjectURL(__calBlobUrl); __calBlobUrl = null; } catch (e) {}
      }, 4000);
      return true;
    } catch (e) {
      console.warn('Calendar launch failed', e);
      return false;
    }
  }

  function openCalConfirmSheet() {
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

  function getSb() {
    if (!supabaseEnabled()) return null;
    if (sbClient) return sbClient;
    sbClient = window.supabase.createClient(cfg().SUPABASE_URL, cfg().SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
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
      sub.textContent = reason || 'Sign in for shared roster, memories, and leadership publish. Browse the rest without an account. New accounts are invite-only — ask a leader.';
    }
    setAuthError('');
    if (gate) {
      gate.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    // Focus email for fewer taps
    try {
      const em = $('#auth-email');
      if (em) setTimeout(() => em.focus(), 80);
    } catch (e) {}
  }

  function closeAuthGate() {
    const gate = $('#auth-gate');
    if (gate) gate.classList.add('hidden');
    setAuthError('');
    releaseFocusAndZoom();
    if (typeof unlockBodyIfClear === 'function') unlockBodyIfClear();
    else document.body.style.overflow = '';
  }

  function updateAuthSessionBar() {
    const bar = $('#auth-session-bar');
    const who = $('#auth-who');
    const entry = $('#auth-entry-btn');
    const homeCta = document.getElementById('home-member-cta');
    if (!supabaseEnabled()) {
      if (bar) bar.classList.add('hidden');
      if (entry) entry.classList.add('hidden');
      if (homeCta) homeCta.classList.add('hidden');
      return;
    }
    if (isSignedIn()) {
      const email = (currentUser().email || 'Brother').trim();
      if (who) who.textContent = email;
      if (bar) bar.classList.remove('hidden');
      if (entry) entry.classList.add('hidden');
      if (homeCta) homeCta.classList.add('hidden');
    } else {
      if (bar) bar.classList.add('hidden');
      if (entry) entry.classList.remove('hidden');
      if (homeCta) homeCta.classList.remove('hidden');
    }
  }

  function startMemberSignIn() {
    try { openAuthGate('Sign in for shared roster and memories. Everything else works without an account.'); } catch (e) {
      const gate = document.getElementById('auth-gate');
      if (gate) {
        gate.classList.remove('hidden');
        gate.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }
  }
  try { window.startMemberSignIn = startMemberSignIn; } catch (e) {}

  function bindHomeMemberCta() {
    if (document.documentElement.dataset.tbAuthEntryBound === '1') return;
    document.documentElement.dataset.tbAuthEntryBound = '1';
    document.addEventListener('click', function (e) {
      const t = e.target && e.target.closest && e.target.closest('#home-member-cta, #auth-entry-btn');
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

  function softRefreshApp(reason) {
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

  async function authSignIn(email, password) {
    const sb = getSb();
    if (!sb) throw new Error('Supabase is not configured.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sbSession = data.session;
    try { softRefreshApp('Signed in — refreshing Thunder Board…'); } catch (e) {}
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
      // Exact-scope heal: storage succeeded, DB insert failed → remove that one object.
      try { await sb.storage.from(memoriesBucket()).remove([storagePath]); } catch (e) {}
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
      const { data, error } = await sb
        .from('brothers')
        .select('id,name,bio,photo_url,phone,skills,available,updated_at')
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
          phone: row.phone || (local && local.phone) || '',
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
    /* CONSOLIDATED: same gathering ICS + VALARMs as I'm In (no second reminder engine) */
    const btn = document.getElementById('reminder-btn');
    const status = document.getElementById('reminder-status');
    if (!btn) return;

    if (load('reminderSet')) {
      btn.classList.add('set');
      btn.textContent = 'ON CALENDAR';
      if (status) {
        status.textContent = 'Opened calendar — hit Save in your calendar app.';
        status.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', () => {
      try { launchGatheringCalendar(); } catch (e) {}
      btn.classList.add('set');
      btn.textContent = 'ON CALENDAR';
      save('reminderSet', true);
      try { renderRsvp(); } catch (e) {}
      try { tbGlowHit(btn, 'yellow'); } catch (e) {}
      if (status) {
        status.textContent = 'Opened calendar — hit Save so 7-day / 1-day / 2-hour alerts can fire.';
        status.classList.remove('hidden');
      }
      requestNotifyPermission().then((perm) => {
        if (perm === 'granted') checkAndFireMeetingNotifications();
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
        // Optional-call safe: WebKit has no vibrate — never throw
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
    return {
      /** Splash-only. Strongest. Visual already owned by CSS; optional 40ms buzz. */
      thunderImpact: function () {
        if (debounced('thunderImpact')) return;
        if (reduced()) return; // no jolt/buzz under reduced motion
        const S = sensoryCfg();
        const ms = typeof S.thunderImpactMs === 'number' ? S.thunderImpactMs : 40;
        pulse(ms);
      },
      /** Signature wake: short THUD … crack-crack. Android only if vibrate exists. */
      thunderWake: function (level) {
        if (debounced('thunderWake')) return;
        if (reduced()) return;
        if (level === 'soft') {
          pulse([12, 40, 18]);
          return;
        }
        pulse([28, 55, 14, 40, 18]);
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
        pulse(typeof S.confirmMs === 'number' ? S.confirmMs : 25);
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
        /* Signature path — ONE animation on the button.
           Do NOT stack lock-pulse + commit-strike (both set `animation` → last wins, other dies).
           Do NOT tbGlowHit the same node (also sets `animation`).
           Clear tb-press first — its transform:!important kills scale keyframes. */
        try { tbFeedback.confirm(); } catch (e) {}
        if (el && !reduced()) {
          try {
            el.classList.remove('tb-press', 'lock-pulse', 'commit-strike', 'tfx-ios-boost', 'tb-glow-hit', 'tb-glow-hit-yellow');
            void el.offsetWidth;
          } catch (e) {}
          // Single signature motion only
          el.classList.add('commit-strike');
          try {
            if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
              el.classList.add('tfx-ios-boost');
            }
          } catch (e) {}
          setTimeout(() => {
            try { el.classList.remove('commit-strike', 'tfx-ios-boost'); } catch (e) {}
          }, 900);
        }
        if (card && !reduced()) {
          try {
            card.classList.remove('tb-glow-hit', 'tb-glow-hit-yellow');
            void card.offsetWidth;
          } catch (e) {}
          card.classList.add('commit-flash', 'commit-energized');
          // Glow on CARD only — not on the button fighting commit-strike
          visualGlow(card, 'yellow');
          setTimeout(() => { try { card.classList.remove('commit-flash'); } catch (e) {} }, 750);
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

    let sx = 0, sy = 0, st = 0, lx = 0, lt = 0, tracking = false, axis = null;

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
      tracking = true;
      axis = null;
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
      if (axis == null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) * 0.9 ? 'x' : 'y';
      }
      if (prefersReducedMotion()) return;
      const el = moveEl();
      if (!el) return;
      // Vertical dismiss preview when onDown is wired (sheet follows finger)
      if (opts.onDown && axis === 'y' && dy > 0) {
        el.classList.add('elastic-dragging');
        const ty = Math.min(160, dy * 0.72);
        const op = Math.max(0.35, 1 - ty / 220);
        el.style.transform = 'translate3d(0,' + ty + 'px,0)';
        el.style.opacity = String(op);
        // Foreground follows finger; underlay eases back slightly
        setUnderlayDepth(true, Math.min(1, ty / 140));
        return;
      }
      if (axis !== 'x') return;
      // live horizontal drag with resistance
      el.classList.add('elastic-dragging');
      let tx = dx;
      if (dx > 0 && !canPrev()) tx = Math.min(EDGE, dx * 0.28);
      else if (dx < 0 && !canNext()) tx = Math.max(-EDGE, dx * 0.28);
      else tx = Math.max(-MAX, Math.min(MAX, dx * 0.55));
      el.style.opacity = '';
      el.style.transform = 'translate3d(' + tx + 'px,0,0)';
    }, { passive: true });

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

      // vertical dismiss with momentum handoff
      if (opts.onDown && dy > 80 && absY > absX) {
        if (el && !prefersReducedMotion()) {
          el.classList.add('overlay-dismissing');
          el.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease';
          el.style.transform = 'translate3d(0, 24%, 0)';
          el.style.opacity = '0.3';
          setTimeout(() => { elasticClear(el); opts.onDown(); }, 190);
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
        try { tbFeedback.selection(); } catch (e) {}
        // brief finish bump then clear + action
        if (el && !prefersReducedMotion()) {
          el.style.transition = 'transform 0.14s ease-out';
          el.style.transform = 'translate3d(-28px,0,0)';
          setTimeout(() => { elasticClear(el); opts.onNext(); }, 130);
        } else {
          elasticClear(el);
          opts.onNext();
        }
        return;
      }
      if (dx > 0 && canPrev() && typeof opts.onPrev === 'function') {
        try { tbFeedback.selection(); } catch (e) {}
        if (el && !prefersReducedMotion()) {
          el.style.transition = 'transform 0.14s ease-out';
          el.style.transform = 'translate3d(28px,0,0)';
          setTimeout(() => { elasticClear(el); opts.onPrev(); }, 130);
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
      onDown: () => closeInfoDetail(),
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
      { id: 'cal-confirm-sheet', close: () => { try { closeCalConfirmSheet(); } catch (e) {} } }
    ];
    specs.forEach(({ id, close }) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.swipeClose === '1') return;
      el.dataset.swipeClose = '1';
      bindElasticSwipe(el, {
        onDown: close,
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

  function requireLeader() {
    if (leaderUnlocked) return true;
    const pin = (cfg().LEADER_PIN || '').trim();
    if (!pin) {
      alert('LEADER_PIN is not set in config.');
      return false;
    }
    const entered = window.prompt('Leadership PIN');
    if (entered == null) return false;
    if (String(entered) !== String(pin)) {
      alert('Wrong PIN');
      return false;
    }
    leaderUnlocked = true;
    const tools = $('#leader-tools');
    if (tools) tools.classList.remove('hidden');
    // One-shot honesty: shared vs this-phone edits
    if (!requireLeader._told) {
      requireLeader._told = true;
      if (typeof supabaseEnabled === 'function' && !supabaseEnabled()) {
        setTimeout(function () {
          alert('Leadership is unlocked on this phone.\n\nEdits save here first. Shared publish needs Supabase configured so every brother sees the same announcements and events.');
        }, 50);
      }
    }
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
    if (phone) lines.push('TEL;TYPE=CELL:' + phone);
    lines.push('ORG:Sons of Thunder');
    if (bio && !forQr) lines.push('NOTE:' + bio.replace(/,/g, '\\,'));
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
      alert('No phone on this profile yet.\n\nEdit My Profile and add a number to share.');
      return false;
    }
    const file = vcardFile(brother);
    const title = (brother.name || 'Brother') + ' — Sons of Thunder';
    const text = (brother.name || 'Brother') + (brother.phone ? ' · ' + formatPhoneDisplay(brother.phone) : '');
    // Prefer native Share sheet with the .vcf — on iPhone this surfaces AirDrop / Messages / Mail
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
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

  function paintLocalQr(target, vcard, dim) {
    if (typeof QRCode === 'undefined') return false;
    try {
      target.innerHTML = '';
      target.style.cssText = 'width:' + dim + 'px;height:' + dim + 'px;min-width:' + dim +
        'px;min-height:' + dim + 'px;background:#ffffff;display:block;margin:0 auto;position:relative;z-index:1;';
      qrcodeInstance = new QRCode(target, {
        text: vcard,
        width: dim,
        height: dim,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      const painted = target.querySelector('canvas, img, table');
      return !!painted;
    } catch (e) {
      console.warn('Local QR failed', e);
      return false;
    }
  }

  function renderBrotherQR(vcard, targetEl, size) {
    const target = targetEl || $('#qr-code-target') || $('#brother-qr-target');
    if (!target) return false;
    const dim = size || 200;

    // Cancel any prior load timer on this target
    const prev = qrLoadTimers.get(target);
    if (prev) clearTimeout(prev);

    target.innerHTML =
      '<div class="qr-loading" style="display:flex;align-items:center;justify-content:center;' +
      'width:100%;height:100%;min-height:' + dim + 'px;background:#fff;color:#666;font-size:12px;' +
      'letter-spacing:0.06em;text-transform:uppercase;">Building QR…</div>';
    target.style.cssText = 'width:' + dim + 'px;height:' + dim + 'px;min-width:' + dim +
      'px;min-height:' + dim + 'px;background:#ffffff;display:block;margin:0 auto;position:relative;z-index:1;';

    let settled = false;
    function settleOk() {
      settled = true;
      const t = qrLoadTimers.get(target);
      if (t) {
        clearTimeout(t);
        qrLoadTimers.delete(target);
      }
    }
    function settleFail() {
      if (settled) return;
      settled = true;
      const t = qrLoadTimers.get(target);
      if (t) {
        clearTimeout(t);
        qrLoadTimers.delete(target);
      }
      // Try local lib before giving up
      if (!paintLocalQr(target, vcard, dim)) {
        qrFailMessage(target);
      }
    }

    // Timeout: blank/hung network must not last forever
    const timer = setTimeout(settleFail, 5000);
    qrLoadTimers.set(target, timer);

    const img = document.createElement('img');
    img.width = dim;
    img.height = dim;
    img.alt = 'Contact QR';
    img.decoding = 'async';
    img.style.cssText = 'width:' + dim + 'px;height:' + dim + 'px;display:block;';
    img.onload = function () {
      if (settled) return;
      settleOk();
      target.innerHTML = '';
      target.appendChild(img);
    };
    img.onerror = function () {
      settleFail();
    };
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=' + dim + 'x' + dim +
      '&ecc=M&margin=1&color=000000&bgcolor=ffffff&data=' + encodeURIComponent(vcard);

    return true;
  }

  function showContactQR(brother) {
    if (!brother || !digitsOnly(brother.phone)) {
      alert('No phone on this profile yet.\n\nEdit My Profile and add a number first.');
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
        renderBrotherQR(vcard, target, 200);
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
      blocked: (t) => !!(t && t.closest && t.closest('.brother-detail-close, button, a, input, textarea'))
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
    // Next open slot — invites another brother to claim a seat
    const inviteHtml = `
      <button type="button" class="brother-card brother-slot-invite" id="brother-slot-invite" aria-label="Add your profile">
        <div class="brother-slot-plus" aria-hidden="true">+</div>
        <div class="brother-slot-copy">
          <div class="brother-slot-title">Your seat</div>
          <div class="brother-slot-sub">Tap to add your profile</div>
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
    const slot = $('#brother-slot-invite');
    if (slot) {
      slot.addEventListener('click', () => {
        if (typeof tbGlowHit === 'function') tbGlowHit(slot, 'yellow');
        try { tbFeedback.selection(); } catch (e) {}
        openProfileEditor();
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
      const src = String(m.data || '');
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
      blocked: (t) => !!(t && t.closest && t.closest('.memory-viewer-close, video, button'))
    });
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
    /* Auth lives on Brothers — no Sign In wall on Events / Past Gatherings */
    if (supabaseEnabled() && !isSignedIn()) {
      el.innerHTML = `
        <button type="button" class="empty-state empty-memories empty-memories-cta" id="empty-memories-cta" aria-label="Add a memory">
          <div class="empty-memories-plus" aria-hidden="true">+</div>
          <div class="empty-memories-title">No memories yet.</div>
          <div class="empty-memories-sub">Be the first to drop a photo.<br>Shared album: Sign In under Brothers.</div>
        </button>`;
      const cta = $('#empty-memories-cta');
      if (cta) {
        cta.addEventListener('click', () => {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          try { tbFeedback.selection(); } catch (e) {}
          const up = $('#upload-media-btn');
          if (up) up.click();
        });
      }
      updateAllNewBadges();
      return;
    }
    if (!media.length) {
      el.innerHTML = `
        <button type="button" class="empty-state empty-memories empty-memories-cta" id="empty-memories-cta" aria-label="Add a memory">
          <div class="empty-memories-plus" aria-hidden="true">+</div>
          <div class="empty-memories-title">No memories yet.</div>
          <div class="empty-memories-sub">Be the first to drop a photo.<br>Build the history.</div>
        </button>`;
      const cta = $('#empty-memories-cta');
      if (cta) {
        cta.addEventListener('click', () => {
          if (typeof tbGlowHit === 'function') tbGlowHit(cta, 'yellow');
          try { tbFeedback.selection(); } catch (e) {}
          const up = $('#upload-media-btn');
          if (up) up.click();
        });
      }
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
        openMemoryViewer(idx, btn);
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
    setTimeout(() => countEl.classList.remove('count-tick'), 520);
  }

  // Who's In UI removed (local-only roster looked like group presence). Stubs keep call sites safe.
  function renderWhosIn() { /* no-op */ }

  function renderRsvp() {
    try { updatePersonalHome(); } catch (e) {}
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
        prompt.textContent = "Your seat is open. Lock it in.";
        prompt.classList.remove('hidden');
      }
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

  function showView(name, opts) {
    if (!TAB_ORDER.includes(name)) return;
    const fromSwipe = opts && opts.fromSwipe;
    $$('.view').forEach(v => v.classList.remove('active', 'view-swipe-in', 'view-enter'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = $(`#view-${name}`);
    const nav = $(`.nav-item[data-view="${name}"]`);
    if (view) {
      view.classList.add('active');
      view.classList.remove('view-enter');
      if (fromSwipe) {
        view.classList.add('view-swipe-in');
        setTimeout(() => view.classList.remove('view-swipe-in'), 180);
      } else if (!(opts && opts.silent) && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        // Level 4: one-shot arrive on tab tap — not on swipe, not on silent
        void view.offsetWidth;
        view.classList.add('view-enter');
        setTimeout(() => view.classList.remove('view-enter'), 320);
      }
    }
    if (nav) {
      nav.classList.add('active');
      if (typeof tbGlowHit === 'function') tbGlowHit(nav, 'yellow');
    }
    currentViewName = name;
    const header = $('#main-header');
    if (header) header.style.display = 'block'; /* logo star on all 4 tabs */
    // NEW no longer auto-clears on Home visit — only when items are opened
    if (name === 'brothers') {
      // Roster NEW clears when the brothers tab is opened
      markBrothersSeen();
    }
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
    if (target.closest('button, a, input, textarea, select, label, video')) return true;
    return false;
  }

  function setupTabSwipe() {
    const root = $('#app') || document.body;
    if (!root || root.dataset.tabSwipeBound === '1') return;
    root.dataset.tabSwipeBound = '1';

    function activeViewEl() {
      return document.querySelector('.view.active') || $('#views') || root;
    }

    bindElasticSwipe(root, {
      getEl: activeViewEl,
      canPrev: () => TAB_ORDER.indexOf(currentViewName) > 0,
      canNext: () => {
        const i = TAB_ORDER.indexOf(currentViewName);
        return i >= 0 && i < TAB_ORDER.length - 1;
      },
      onPrev: () => {
        const i = TAB_ORDER.indexOf(currentViewName);
        if (i > 0) showView(TAB_ORDER[i - 1], { fromSwipe: true });
      },
      onNext: () => {
        const i = TAB_ORDER.indexOf(currentViewName);
        if (i >= 0 && i < TAB_ORDER.length - 1) showView(TAB_ORDER[i + 1], { fromSwipe: true });
      },
      blocked: (t) => isOverlayBlockingSwipe() || swipeStartBlocked(t)
    });
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
      btn.addEventListener('click', () => showView(btn.dataset.view));
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
          btn.classList.remove('confirmed', 'is-locking', 'commit-strike');
          btn.textContent = "I'M IN";
          btn.dataset.busy = '0';
        }
        try { tbFeedback.warningOrError(btn); } catch (e) {}
        alert("We couldn’t lock that in. Try again.");
        return;
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

      // Success path: ThunderFX.lockedIn → settle → calendar handoff
      renderRsvp();
      const meetCard = document.querySelector('.next-meeting');
      try {
        if (window.ThunderFX) ThunderFX.lockedIn(btn, meetCard);
        else {
          try { tbFeedback.confirm(); } catch (e) {}
        }
      } catch (e) {
        try { tbFeedback.confirm(); } catch (e2) {}
      }
      if (btn) {
        setTimeout(() => {
          try {
            btn.classList.remove('is-locking');
            btn.dataset.busy = '0';
          } catch (e) {}
        }, 900);
      }

      // Stay in the app. Calendar is optional — in-app sheet, never navigate away.
      try { openCalConfirmSheet(); } catch (e) {}

      if (typeof requestNotifyPermission === 'function') {
        requestNotifyPermission().then((perm) => {
          if (perm === 'granted') checkAndFireMeetingNotifications();
        });
      }
    });

    // Calendar confirm sheet
    (function bindCalSheet() {
      const add = document.getElementById('cal-confirm-add');
      const later = document.getElementById('cal-confirm-later');
      const sheet = document.getElementById('cal-confirm-sheet');
      const x = document.getElementById('cal-confirm-close');
      if (add && !add.dataset.tbBound) {
        add.dataset.tbBound = '1';
        add.addEventListener('click', () => {
          try { launchGatheringCalendar(); } catch (e) {}
          try { save('reminderSet', true); } catch (e) {}
          try { renderRsvp(); } catch (e) {}
          const rb = document.getElementById('reminder-btn');
          if (rb) { rb.classList.add('set'); rb.textContent = 'ON CALENDAR'; }
          closeCalConfirmSheet();
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
            try {
              const t = document.getElementById('install-toast');
              if (t) {
                t.textContent = 'Sign in to share your profile with the roster.';
                t.classList.remove('hidden');
                setTimeout(() => t.classList.add('hidden'), 3200);
              }
            } catch (e) {}
          }, 300);
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
    $('#save-media').addEventListener('click', () => {
      try { tbFeedback.press($('#save-media')); } catch (e) {}
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
            rewardSaveSuccess('memory');
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
    const authEntryBtn = $('#auth-entry-btn');
    if (authEntryBtn && authEntryBtn.dataset.tbBound !== '1') {
      authEntryBtn.dataset.tbBound = '1';
    }
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
            setAuthError('Account started. If nothing happens, check email — or ask leadership to turn off email confirm in Supabase Auth. Then Sign In.');
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
    // Enter in password field = Sign In (fewer taps)
    const authPw = $('#auth-password');
    if (authPw && authPw.dataset.bound !== '1') {
      authPw.dataset.bound = '1';
      authPw.addEventListener('keydown', (e) => {
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

    let __fabGlintTimer = null;
    let __fabFidgetTimer = null;
    let __fabSwayTimer = null;
    function stopThunderBackstageIdle() {
      [__fabGlintTimer, __fabFidgetTimer, __fabSwayTimer].forEach(function (t) {
        if (t) try { clearTimeout(t); } catch (e) {}
      });
      __fabGlintTimer = __fabFidgetTimer = __fabSwayTimer = null;
      const img = document.querySelector('#thunder-fab .thunder-fab-img');
      if (img) img.classList.remove('tb-host-alive', 'tb-host-arrive', 'tb-host-glint', 'tb-host-fidget', 'tb-host-sway');
    }
    function startThunderBackstageIdle() {
      stopThunderBackstageIdle();
      const img = document.querySelector('#thunder-fab .thunder-fab-img');
      if (!img) return;
      img.classList.add('tb-host-alive', 'tb-host-arrive');
      try {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      } catch (e) {}
      function glintTick() {
        if (document.body.classList.contains('tb-ask-open') || document.body.classList.contains('tb-tour-open')) {
          __fabGlintTimer = setTimeout(glintTick, 4000);
          return;
        }
        img.classList.add('tb-host-glint');
        setTimeout(function () { img.classList.remove('tb-host-glint'); }, 260);
        __fabGlintTimer = setTimeout(glintTick, 5200 + Math.random() * 7800);
      }
      __fabGlintTimer = setTimeout(glintTick, 2400 + Math.random() * 2200);
      function fidgetTick() {
        if (!document.body.classList.contains('tb-ask-open')) {
          img.classList.add('tb-host-fidget');
          setTimeout(function () { img.classList.remove('tb-host-fidget'); }, 520);
        }
        __fabFidgetTimer = setTimeout(fidgetTick, 7000 + Math.random() * 9000);
      }
      __fabFidgetTimer = setTimeout(fidgetTick, 3800 + Math.random() * 2400);
      function swayTick() {
        if (!document.body.classList.contains('tb-ask-open')) {
          img.classList.add('tb-host-sway');
          setTimeout(function () { img.classList.remove('tb-host-sway'); }, 1400);
        }
        __fabSwayTimer = setTimeout(swayTick, 9000 + Math.random() * 8000);
      }
      __fabSwayTimer = setTimeout(swayTick, 5600 + Math.random() * 3000);
    }
    try { startThunderBackstageIdle(); } catch (e) {}

    // Thunder FAB — THUNDER WAKE then open (full once/session, soft after)
    $('#thunder-fab').addEventListener('click', () => {
      const fab = $('#thunder-fab');
      const first = !window.__tbThunderWokeSession;
      window.__tbThunderWokeSession = true;
      try {
        if (window.ThunderFX && ThunderFX.thunderWake) ThunderFX.thunderWake(fab, first ? 'full' : 'soft');
        else {
          try { tbFeedback.press(fab); } catch (e) {}
          if (fab) {
            fab.classList.remove('fab-hit');
            void fab.offsetWidth;
            fab.classList.add('fab-hit');
            setTimeout(() => fab.classList.remove('fab-hit'), 480);
          }
        }
      } catch (e) {}
      try {
        if (window.ThunderVoice) ThunderVoice.openAsk({ voice: false });
        else openThunderVoiceMode();
      } catch (e) {
        openThunderVoiceMode();
      }
    });
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
          try { startThunderBackstageIdle(); } catch (e) {}
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
        // Installed: only "get a brother" — no install tutorial nag
        installCard.classList.remove('hidden');
        if (installShareBtn) installShareBtn.textContent = 'SHARE';
        if (title) title.textContent = 'GET A BROTHER ON THUNDER';
        if (sub) sub.textContent = 'Send the link · one tap';
        if (tip) tip.textContent = 'They open it → put Thunder on their phone.';
        if (howBtn) howBtn.classList.add('hidden');
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
        const url = 'https://sonsofthunder.netlify.app/';
        const payload = {
          title: 'Thunder Board',
          text: 'Sons of Thunder — Thunder doesn’t dull. Put this on your Home Screen.',
          url
        };
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
        const url = 'https://sonsofthunder.netlify.app/';
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

    // REFRESH APP — force fresh HTML/JS/CSS (More page, under Gathering Alerts)
    const refreshBtn = $('#refresh-app-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        forceRefreshApp();
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
      return `<a class="activity-card" href="${link}" target="_blank" rel="noopener noreferrer">
        <div class="activity-card-meta">${esc(source)}${date ? ' · ' + esc(date) : ''}</div>
        <div class="activity-card-title">${title}</div>
        <div class="activity-card-excerpt">${excerpt}</div>
      </a>`;
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
      // Allow swipe on story cards — only ignore other Events sections
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
        if (typeof isTourComplete === 'function' && !isTourComplete()) {
          startTour({ force: false });
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
          body: String(bodyText != null ? bodyText : 'Open Thunder Board').slice(0, 120)
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
  function reconcileOnWake() {
    try { refreshAlertsToggleUI(); } catch (e) {}
    try {
      const sb = getSb && getSb();
      if (sb && sb.auth && sb.auth.getSession) sb.auth.getSession().catch(function () {});
    } catch (e) {}
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
    setTimeout(function () { try { checkStaleBuild(); } catch (e) {} }, 5500);
  }

  async function checkStaleBuild() {
    try {
      if (sessionStorage.getItem('tb_stale_nudge') === '1') return;
      if (typeof __tourActive !== 'undefined' && __tourActive) return;
      const splash = document.getElementById('splash');
      if (splash && !splash.classList.contains('splash-done') && !splash.classList.contains('hidden')) return;
      const r = await fetch('build.json?_=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const live = String(j.APP_BUILD || '');
      const here = String((cfg() && cfg().APP_BUILD) || '');
      if (!live || !here || live === here) return;
      sessionStorage.setItem('tb_stale_nudge', '1');
      tbToast('New drop on the board. Tap to refresh.', 8000, forceRefreshApp);
    } catch (e) {}
  }

  async function forceRefreshApp() {
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
  const TB_TOUR_VERSION = 19;
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

  const TB_TOUR_STEPS = [
    {
      id: 'welcome',
      headline: 'MEET THUNDER',
      sub: 'YOUR GUIDE IN THE ROOM',
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
      sub: 'YOU\u2019RE NOT ALONE',
      body: 'These are your brothers. Different faces. Same storm.',
      nextLabel: 'NEXT'
    },
    {
      id: 'memories',
      headline: 'MEMORIES',
      sub: 'CAPTURE. SHARE. REMEMBER.',
      body: 'The nights we keep. Drop a photo. Build the history.',
      nextLabel: 'NEXT'
    },
    {
      id: 'code',
      headline: 'THE CODE',
      sub: 'LIVE IT. EVERY DAY.',
      body: 'This is how we show up \u2014 for ourselves and each other.',
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
      sub: 'HE\u2019S GOT YOUR BACK',
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
    const moods = ['arrive', 'lockin', 'brotherhood', 'watch', 'think', 'listen', 'appreciate'];
    const mood = moods[idx] || 'arrive';
    host.className = 'tb-guide-thunder tb-host-alive tb-host-' + mood;
    if (tourReducedMotion()) return;
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
    // ~28–32 chars/sec — speaks, not rushes
    const ms = 32;
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
    __tourTypeTimer = setTimeout(tick, 180);
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
    if (live && !tourReducedMotion()) {
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
    // Thunder speaking — type the body line
    typeTourBody(step.body || '', body);
    applyTourHostExpression(__tourIdx);
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
    renderTourSlide();
  }

  function hideTour() {
    stopTourTypewriter();
    stopTourHostMotion();
    const root = document.getElementById('tb-tour');
    if (root) {
      root.classList.add('hidden');
      root.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('tb-tour-open');
    __tourActive = false;
  }

  function skipTour() {
    setTourState({ done: true, skipped: true, at: Date.now() });
    hideTour();
  }

  function completeTour() {
    setTourState({ done: true, completed: true, at: Date.now() });
    hideTour();
  }

  function startTour(opts) {
    opts = opts || {};
    if (__tourActive && !opts.force) return;
    if (!opts.force && !opts.replay && isTourComplete()) return;
    __tourActive = true;
    __tourIdx = 0;
    showTour();
  }

  function tourNext() {
    if (!__tourActive) return;
    if (__tourIdx >= TB_TOUR_STEPS.length - 1) {
      completeTour();
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

  function maybeStartProductTour() {
    /* First-run is chained off splash finish. Only start here if splash
       already ran this session (so a refresh still gets the tour, with no delay). */
    try {
      if (isTourComplete() || __tourActive) return;
      var splashDone = false;
      try { splashDone = sessionStorage.getItem('tb_splash_done') === '1'; } catch (e) {}
      if (splashDone) startTour({ force: false });
    } catch (e) {}
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
    const replay = document.getElementById('replay-tour-btn') || document.getElementById('take-tour-btn');
    if (replay && !replay.dataset.tbBound) {
      replay.dataset.tbBound = '1';
      replay.addEventListener('click', function () { startTour({ force: true, replay: true }); });
    }
  }


  // ---------- INIT ----------
  async function init() {
    runSplash();
    try { bindTourControls(); } catch (e) {}
    try { maybeStartProductTour(); } catch (e) {}
    bootstrapSeenState();
    updateMeetingCard();
    setupReminderButton();
    setupNotificationSystem();
    setupGatheringAlerts();
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
    renderRsvp();
    bindEvents();
    bindHomeMemberCta();
    updateAllNewBadges();
    showView('home');
    /* loadIronFeed retired — RSS cut 2026-08-18 */
    bindActivityTags();
    try {
      await initAuth();
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

  init();
})();
