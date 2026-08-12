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

  // ---------- DATA ----------
  const DEFAULT_BROTHERS = [];

  function buildUpcoming() {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const list = [];
    let d = new Date();
    for (let i = 0; i < 2; i++) {
      const next = getNextFirstMonday(d);
      list.push({
        month: months[next.getMonth()],
        day: String(next.getDate()).padStart(2, '0'),
        title: 'Monthly Gathering',
        detail: meetingTime() + ' • ' + venueName()
      });
      d = new Date(next.getFullYear(), next.getMonth(), next.getDate() + 1);
    }
    return list;
  }

  const DEFAULT_ANNOUNCEMENTS = [
    { title: 'Next Gathering', body: 'First Monday of the month. Check the date above. Bring a brother who needs it.' }
  ];

  let announcements = load('announcements') || DEFAULT_ANNOUNCEMENTS;

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
    localStorage.setItem('tb_' + key, JSON.stringify(val));
  }

  let brothers = load('brothers') || DEFAULT_BROTHERS;
  let media = load('media') || [];
  let rsvp = load('rsvp') || false;
  let myProfileId = load('myProfileId') || null;
  let pendingPhotoData = null;

  // ---------- SHARED RSVP (Supabase) ----------
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

  function getNextFirstMonday(fromDate = new Date()) {
    const d = new Date(fromDate);
    d.setHours(12, 0, 0, 0);

    let candidate = meetingMondayOf(d.getFullYear(), d.getMonth());

    // If this month's meeting has already passed, use next month
    if (candidate < d) {
      let y = d.getFullYear();
      let m = d.getMonth() + 1;
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
    const next = getNextFirstMonday();
    const days = daysUntil(next);
    const dateEl = document.getElementById('meeting-date');
    const countEl = document.getElementById('meeting-countdown');

    if (dateEl) dateEl.textContent = formatMeetingDate(next);
    const timeEl = document.getElementById('meeting-time');
    if (timeEl) timeEl.textContent = meetingTime();
    const locEl = document.getElementById('meeting-loc');
    if (locEl) locEl.textContent = venueName();

    if (countEl) {
      if (days === 0) {
        // Live hours countdown on meeting day
        const now = new Date();
        const meetingTonight = new Date(next);
        const _mt = parseMeetingHours(); meetingTonight.setHours(_mt.h, _mt.m, 0, 0);
        const hoursLeft = Math.max(0, Math.floor((meetingTonight - now) / 3600000));
        if (hoursLeft <= 0) {
          countEl.textContent = "STARTING SOON";
        } else {
          countEl.textContent = hoursLeft + "H LEFT";
        }
      } else if (days === 1) {
        countEl.textContent = "TOMORROW";
      } else if (days <= 7) {
        countEl.textContent = days + " DAYS OUT";
      } else {
        countEl.textContent = days + " DAYS";
      }
    }

    // Keep the live countdown fresh
    if (days <= 1) {
      setTimeout(updateMeetingCard, 15 * 60 * 1000); // refresh every 15 min when close
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
    const next = getNextFirstMonday();
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
        'Gathering is tomorrow at 6:30 PM — Crooked Can Brewery Patio, Winter Garden.',
        'thunder-1d'
      );
      markFired(NOTIFY_KEYS.d1);
    }

    // Morning of meeting (between 7am – 11am local)
    if (days === 0 && hour >= 7 && hour < 11 && !alreadyFired(NOTIFY_KEYS.morning)) {
      fireLocalNotification(
        '⚡ Tonight',
        'Sons of Thunder. 6:30 PM. Crooked Can Brewery Patio, Winter Garden. Be there.',
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
      "DESCRIPTION:Monthly gathering. Crooked Can Brewery Patio, Winter Garden. 6:30 PM.",
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
      const next = getNextFirstMonday();
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


  // ---------- RENDER ----------
  function renderAnnouncements() {
    const el = $('#announcements');
    if (!announcements.length) {
      el.innerHTML = '<div class="empty-state" style="padding:16px 0;color:#666;">No announcements yet.</div>';
      return;
    }
    el.innerHTML = announcements.map(a => `
      <div class="announcement-card">
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.body)}</p>
      </div>`).join('');
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
      el.textContent = eventsNote;
      el.classList.remove('hidden');
    } else {
      el.textContent = '';
      el.classList.add('hidden');
    }
  }

  function renderMission() {
    const t = $('#mission-title');
    const d = $('#mission-detail');
    if (t) t.textContent = mission.title || '';
    if (d) d.textContent = mission.detail || '';
  }

  function requireLeader() {
    if (leaderUnlocked) return true;
    const pin = (cfg().LEADER_PIN || 'thunder');
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

  function renderBrothers() {
    const grid = $('#brothers-grid');
    if (!brothers.length) {
      grid.innerHTML = `
        <div class="empty-state empty-brothers">
          <div class="empty-brothers-title">No brothers listed yet.</div>
          <div class="empty-brothers-sub">Be the first.<br>Add your profile.</div>
        </div>`;
      return;
    }
    grid.innerHTML = brothers.map(b => {
      const initials = (b.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
      const photoHtml = (b.photo && b.photo.startsWith('data:'))
        ? `<img class="brother-photo" src="${b.photo}" alt="${esc(b.name)}" />`
        : `<div class="brother-photo">${esc(initials)}</div>`;
      return `
        <div class="brother-card">
          ${photoHtml}
          <div class="brother-info">
            <div class="brother-name">${esc(b.name)}</div>
            <div class="brother-bio">${esc(b.bio || '')}</div>
          </div>
        </div>`;
    }).join('');
  }

  function renderUpcoming() {
    const el = $('#upcoming-events');
    const UPCOMING = buildUpcoming();
    el.innerHTML = UPCOMING.map(e => `
      <div class="event-item">
        <div class="event-date-box">
          <div class="event-month">${e.month}</div>
          <div class="event-day">${e.day}</div>
        </div>
        <div class="event-details">
          <h3>${e.title}</h3>
          <p>${e.detail}</p>
        </div>
      </div>`).join('');
  }

  function renderMedia() {
    const el = $('#media-feed');
    if (!media.length) {
      el.innerHTML = '<div class="empty-state">No memories yet.<br>Be the first to drop a photo.</div>';
      return;
    }
    el.innerHTML = media.map(m => `
      <div class="media-item">
        ${m.type === 'video' ? `<video src="${m.data}" controls></video>` : `<img src="${m.data}" alt="">`}
        ${m.caption ? `<p>${esc(m.caption)}</p>` : ''}
      </div>`).join('');
  }

  function renderRsvp() {
    const btn = $('#rsvp-btn');
    const status = $('#rsvp-status');
    const prompt = $('#rsvp-prompt');
    if (!btn) return;
    if (rsvp) {
      btn.classList.add('confirmed');
      btn.textContent = "⚡ LOCKED IN";
      if (status) {
        status.textContent = "⚡ Locked in. See you on the patio.";
        status.classList.remove('hidden');
      }
      if (prompt) prompt.classList.add('hidden');
    } else {
      btn.classList.remove('confirmed');
      btn.textContent = "I'M IN";
      if (status) status.classList.add('hidden');
      if (prompt) {
        prompt.textContent = "Your seat is open. Lock it in.";
        prompt.classList.remove('hidden');
      }
    }
  }

  function renderLastFire() {
    const el = $('#last-fire');
    if (!el) return;
    // Prefer latest image memory with optional caption
    const photos = (media || []).filter(m => m && m.type !== 'video' && m.data);
    if (!photos.length) {
      el.classList.add('hidden');
      el.innerHTML = '';
      return;
    }
    const latest = photos[0];
    const caption = latest.caption ? esc(latest.caption) : '';
    let when = '';
    if (latest.date) {
      try {
        when = new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {}
    }
    el.classList.remove('hidden');
    el.innerHTML = `
      <div class="card-label">LAST FIRE</div>
      <div class="last-fire-media">
        <img src="${latest.data}" alt="Last gathering" loading="lazy" />
      </div>
      ${when || caption ? `<div class="last-fire-meta">${when ? `<span>${esc(when)}</span>` : ''}${caption ? `<span class="last-fire-cap">${caption}</span>` : ''}</div>` : ''}
    `;
  }


  // ---------- NAV ----------
  function showView(name) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const view = $(`#view-${name}`);
    const nav = $(`.nav-item[data-view="${name}"]`);
    if (view) view.classList.add('active');
    if (nav) nav.classList.add('active');
    const header = $('#main-header');
    if (header) header.style.display = name === 'about' ? 'none' : 'block';
  }

  // ---------- MODALS ----------
  function openModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const el = $(`#${id}`);
    if (!el) return;
    el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ---------- THUNDER AI ----------
  function formatThunderHtml(text) {
    if (text == null) return '';
    let s = String(text);
    // **bold** → <strong>
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // remaining newlines → <br> (local answers may already use <br>)
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function addThunderMsg(text, role, source) {
    const box = $('#thunder-messages');
    const div = document.createElement('div');
    div.className = `thunder-msg ${role}`;
    const body = role === 'user' ? formatThunderHtml(text) : formatThunderHtml(text);
    div.innerHTML = body + (source ? `<div class="source">Source: <span>${source}</span></div>` : '');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  // Local instant answers; null = fall through to Grok
  function thunderRespondLocal(q) {
    const query = q.toLowerCase().trim();

    if (query.includes('next meeting') || query.includes('when is') || query.includes('next gathering') || query.includes('where') || query.includes('what time')) {
      const next = getNextFirstMonday();
      const dateStr = formatMeetingDate(next);
      return {
        text: `${dateStr} at ${meetingTime()} — ${venueName()}.`,
        source: 'Sons of Thunder Events'
      };
    }

    if (query.includes("who's in") || query.includes('who is going') || query.includes('rsvp') || query.includes("i'm in") || query.includes('im in')) {
      return {
        text: `Tap <strong>I'M IN</strong> on Home to lock in for the next gathering.`,
        source: 'Thunder Board'
      };
    }

    if (query.includes('code') || query.includes('what do we believe') || query.includes('the rules') || query.includes('how we roll')) {
      const lines = CODE.map(c => `<strong>${c.line}</strong><br>${c.sub}`).join('<br><br>');
      return { text: lines, source: 'Sons of Thunder — The Code' };
    }

    for (const key of Object.keys(SCRIPTURE)) {
      if (query.includes(key) || query.includes(key.replace(' ', ''))) {
        const s = SCRIPTURE[key];
        return {
          text: `<strong>${key.toUpperCase()}</strong><br>${s.text}<br><br><em>${s.note}</em>`,
          source: 'Scripture (NASB)'
        };
      }
    }
    if (query.includes('iron sharpens') || query.includes('sharpen')) {
      const s = SCRIPTURE['proverbs 27:17'];
      return {
        text: `<strong>PROVERBS 27:17</strong><br>${s.text}<br><br><em>${s.note}</em>`,
        source: 'Scripture (NASB)'
      };
    }
    if (query.includes('sons of thunder') || query.includes('boanerges') || query.includes('mark 3')) {
      const s = SCRIPTURE['mark 3:17'];
      return {
        text: `<strong>MARK 3:17</strong><br>${s.text}<br><br><em>${s.note}</em>`,
        source: 'Scripture (NASB)'
      };
    }

    if (query.includes('who we are') || query.includes('why sons of thunder') || query.includes('identity') || query.includes("thunder doesn't dull") || query.includes('thunder doesnt dull')) {
      return {
        text: `We are the same kind of men Jesus nicknamed James and John: intense, loyal, and built for more. Left alone we can go too far. Together we keep each other sane, sharp, and useful to our families, our community, and the Kingdom.<br><br><strong>Thunder doesn’t dull.</strong>`,
        source: 'Sons of Thunder — Who We Are'
      };
    }

    if (query.includes('rough night') || query.includes('struggling') || query.includes('need to talk') || query.includes('who can i call') || query.includes('alone') || query.includes('depressed') || query.includes('anxious')) {
      const available = brothers.filter(b => b.available).slice(0, 2);
      const names = available.length ? available.map(b => b.name).join(', ') : 'Your brothers';
      return {
        text: `You don’t have to handle tonight alone.<br><br>${names} — reach a real man.<br><br><strong>Text a Leader</strong> from Home if you need a direct line.`,
        source: 'Brother Availability'
      };
    }

    if (query.includes('who can help') || query.includes('need someone') || query.includes('who knows') || query.includes('hvac') || query.includes('electrical') || query.includes('construction')) {
      return {
        text: `Once brothers fill profiles, I can match skills. For now: ask in the room, or <strong>Text a Leader</strong> and we’ll point you to the right guy.`,
        source: 'Brother Profiles'
      };
    }

    return null; // fall through to Grok
  }

  function buildGrokContext() {
    const next = getNextFirstMonday();
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
    return {
      text: String(answer).replace(/\n/g, '<br>'),
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

    $('#rsvp-btn').addEventListener('click', () => {
      rsvp = !rsvp;
      save('rsvp', rsvp);
      renderRsvp();
      if (rsvp && typeof requestNotifyPermission === 'function') {
        requestNotifyPermission().then((perm) => {
          if (perm === 'granted') checkAndFireMeetingNotifications();
        });
      }
    });

    $('#edit-profile-btn').addEventListener('click', () => {
      // Prefill if this brother already has a profile
      const me = brothers.find(b => b.id === myProfileId);
      if (me) {
        $('#profile-name').value = me.name || '';
        $('#profile-bio').value = me.bio || '';
        if (me.photo) {
          pendingPhotoData = me.photo;
          const preview = $('#photo-preview');
          if (preview) {
            preview.innerHTML = `<img src="${me.photo}">`;
            preview.classList.add('visible');
          }
        }
      } else {
        $('#profile-name').value = '';
        $('#profile-bio').value = '';
        pendingPhotoData = null;
        const preview = $('#photo-preview');
        if (preview) { preview.innerHTML = ''; preview.classList.remove('visible'); }
      }
      openModal('profile-modal');
    });
    $('#upload-media-btn').addEventListener('click', () => openModal('media-modal'));

    $$('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

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

    $('#save-profile').addEventListener('click', () => {
      const name = $('#profile-name').value.trim();
      const bio = $('#profile-bio').value.trim();
      if (!name) return alert('Name required');
      const id = myProfileId || 'me_' + Date.now();
      const existing = brothers.findIndex(b => b.id === id);
      const entry = { id, name, bio, photo: pendingPhotoData || null, skills: '', available: true };
      if (existing >= 0) brothers[existing] = entry;
      else brothers.unshift(entry);
      myProfileId = id;
      save('brothers', brothers);
      save('myProfileId', myProfileId);
      renderBrothers();
      
      closeModal('profile-modal');
      pendingPhotoData = null;
    });

    // Media
    $('#save-media').addEventListener('click', () => {
      const file = $('#media-file').files[0];
      if (!file) return alert('Choose a file');

      // Size guard — localStorage is limited
      const maxBytes = 1.5 * 1024 * 1024; // 1.5 MB
      if (file.size > maxBytes && file.type.startsWith('video')) {
        return alert('Video is too large for this app (max ~1.5 MB). Try a short clip or a photo instead.');
      }
      if (file.size > 4 * 1024 * 1024) {
        return alert('File is too large (max 4 MB). Choose a smaller photo.');
      }

      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = ev.target.result;

        const finish = (dataUrl) => {
          try {
            media.unshift({
              data: dataUrl,
              type: isVideo ? 'video' : 'image',
              caption: ($('#media-caption').value || '').trim(),
              date: new Date().toISOString()
            });
            save('media', media);
            renderMedia();
            renderLastFire();
            closeModal('media-modal');
            $('#media-file').value = '';
            $('#media-caption').value = '';
          } catch (err) {
            alert('Storage full. Delete an old memory first, or use a smaller photo.');
          }
        };

        // Compress images down for storage
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
      reader.readAsDataURL(file);
    });

    // Thunder
    $('#thunder-fab').addEventListener('click', () => openModal('thunder-modal'));
    $('#thunder-send').addEventListener('click', handleThunderSend);
    const installShareBtn = $('#install-share-btn');
    const installBtn = $('#install-help-btn');

    function showInstallToast(msg) {
      const t = $('#install-toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.remove('hidden');
      clearTimeout(showInstallToast._timer);
      showInstallToast._timer = setTimeout(() => t.classList.add('hidden'), 4200);
    }

    async function shareToHomeScreen() {
      const url = window.location.origin + '/';
      const payload = {
        title: 'Thunder Board',
        text: 'Sons of Thunder — Thunder doesn’t dull.',
        url
      };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          showInstallToast('iPhone: in Share, tap Add to Home Screen');
          return;
        } catch (err) {
          // user cancelled share — silent
          if (err && err.name === 'AbortError') return;
          console.warn('Share failed', err);
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        showInstallToast('Link copied. Open in Safari/Chrome → Share → Add to Home Screen');
      } catch (e) {
        showInstallToast('Copy this link: ' + url);
      }
    }

    if (installShareBtn) {
      installShareBtn.addEventListener('click', () => { shareToHomeScreen(); });
    }
    if (installBtn) {
      installBtn.addEventListener('click', () => {
        openModal('install-modal');
        const v = $('#install-video');
        if (v) {
          v.muted = true;
          v.loop = true;
          try { v.currentTime = 0; } catch (e) {}
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
      });
    }
    const installVideo = $('#install-video');
    if (installVideo) {
      installVideo.addEventListener('click', () => {
        try {
          installVideo.currentTime = 0;
          installVideo.play();
        } catch (e) {}
      });
    }
    const installModal = $('#install-modal');
    if (installModal) {
      installModal.querySelectorAll('[data-close="install-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = $('#install-video');
          if (v) { try { v.pause(); } catch (e) {} }
          closeModal('install-modal');
        });
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

    const eventsBtn = $('#admin-events-btn');
    if (eventsBtn) {
      eventsBtn.addEventListener('click', () => {
        if (!requireLeader()) return;
        if ($('#admin-mission-title')) $('#admin-mission-title').value = mission.title || '';
        if ($('#admin-mission-detail')) $('#admin-mission-detail').value = mission.detail || '';
        if ($('#admin-events-note')) $('#admin-events-note').value = eventsNote || '';
        openModal('admin-events-modal');
      });
    }
    const eventsSave = $('#admin-events-save');
    if (eventsSave) {
      eventsSave.addEventListener('click', () => {
        mission = {
          title: ($('#admin-mission-title').value || '').trim() || DEFAULT_MISSION.title,
          detail: ($('#admin-mission-detail').value || '').trim() || DEFAULT_MISSION.detail
        };
        eventsNote = ($('#admin-events-note').value || '').trim();
        save('mission', mission);
        save('eventsNote', eventsNote);
        renderMission();
    renderEventsNote();
        alert('Saved');
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
        announcements.unshift({ title, body });
        save('announcements', announcements);
        renderAnnouncements();
        renderAdminAnnouncements();
        if ($('#admin-ann-title')) $('#admin-ann-title').value = '';
        if ($('#admin-ann-body')) $('#admin-ann-body').value = '';
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
    if (tlb) tlb.addEventListener('click', openLeaderSms);
    const tlb2 = $('#text-leader-btn-brothers');
    if (tlb2) tlb2.addEventListener('click', openLeaderSms);

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
    if (!el) return;
    try {
      if (sessionStorage.getItem('tb_splash_done') === '1') {
        el.classList.add('splash-done');
        return;
      }
    } catch (e) {}

    const finish = () => {
      el.classList.add('splash-out');
      const hide = () => {
        el.classList.add('splash-done');
        try { sessionStorage.setItem('tb_splash_done', '1'); } catch (e) {}
      };
      el.addEventListener('transitionend', hide, { once: true });
      setTimeout(hide, 600); // fail-open if transitionend misses
    };

    // Hold ~2s then zoom/fade out (total ~2.5–2.6s)
    setTimeout(finish, 2000);

    // Fail-open if mark never loads
    const img = el.querySelector('.splash-mark');
    if (img) {
      img.onerror = () => { img.style.display = 'none'; };
    }
  }

  // ---------- INIT ----------
  function init() {
    runSplash();
    updateMeetingCard();
    setupReminderButton();
    setupNotificationSystem();
    renderAnnouncements();
    renderBrothers();
    renderUpcoming();
    renderMedia();
    renderCode();
    renderMission();
    renderEventsNote();
    renderRsvp();
    bindEvents();
    showView('home');
    loadIronFeed();
  }

  init();
})();
