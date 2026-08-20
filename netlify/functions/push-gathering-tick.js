/**
 * Hourly gathering pings for brothers who enabled Gathering Alerts.
 * 7 days out (09:00 ET), 1 day out (09:00 ET), ~2 hours before (16:00 ET on gathering day).
 * Never I'm In / FOMO / verses.
 */
const webpush = require('web-push');

exports.config = { schedule: '@hourly' };

exports.handler = async () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!publicKey || !privateKey || !sbUrl || !serviceKey) {
    return { statusCode: 200, body: JSON.stringify({ skipped: 'config' }) };
  }

  const now = new Date();
  const etHour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now)
  );
  const next = nextGathering(now);
  const days = daysUntil(next, now);
  const meetingKey =
    next.getFullYear() +
    '-' +
    String(next.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(next.getDate()).padStart(2, '0');

  let kind = null;
  let title = '';
  let body = '';
  if (days === 7 && etHour === 9) {
    kind = 'd7';
    title = 'Gathering in 7 days';
    body = 'Monday · 6:30 PM · Crooked Can. Lock it in.';
  } else if (days === 1 && etHour === 9) {
    kind = 'd1';
    title = 'Tomorrow night';
    body = 'Sons of Thunder · 6:30 PM · Crooked Can.';
  } else if (days === 0 && etHour === 16) {
    kind = 'h2';
    title = 'Two hours';
    body = 'Sons of Thunder · 6:30 PM · Crooked Can.';
  }
  if (!kind) {
    return { statusCode: 200, body: JSON.stringify({ skipped: 'window', days, etHour }) };
  }

  const already = await fetch(
    sbUrl +
      '/rest/v1/push_dispatch?kind=eq.' +
      encodeURIComponent(kind) +
      '&meeting_key=eq.' +
      encodeURIComponent(meetingKey) +
      '&select=kind',
    { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
  );
  if (already.ok) {
    const rows = await already.json();
    if (rows && rows.length) {
      return { statusCode: 200, body: JSON.stringify({ skipped: 'already', kind, meetingKey }) };
    }
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:thunder@sonsofthunder.local',
    publicKey,
    privateKey
  );
  const listRes = await fetch(sbUrl + '/rest/v1/push_subscriptions?select=endpoint,subscription', {
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey }
  });
  if (!listRes.ok) {
    return { statusCode: 500, body: JSON.stringify({ error: 'subs' }) };
  }
  const subRows = await listRes.json();
  const payload = JSON.stringify({
    title,
    body,
    url: '/?view=home',
    tag: 'thunder-' + kind + '-' + meetingKey
  });
  let sent = 0;
  for (const row of subRows || []) {
    const sub = row.subscription || row;
    if (!sub || !sub.endpoint) continue;
    try {
      await webpush.sendNotification(sub, payload);
      sent += 1;
    } catch (e) {}
  }
  try {
    await fetch(sbUrl + '/rest/v1/push_dispatch', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ kind, meeting_key: meetingKey })
    });
  } catch (e) {}
  return { statusCode: 200, body: JSON.stringify({ ok: true, kind, meetingKey, sent }) };
};

function firstMonday(year, month) {
  const d = new Date(year, month, 1, 12, 0, 0);
  const add = (8 - d.getDay()) % 7;
  d.setDate(1 + add);
  return d;
}
function isLaborDay(date) {
  if (date.getMonth() !== 8) return false;
  return date.getDate() === firstMonday(date.getFullYear(), 8).getDate();
}
function isMemorialDay(date) {
  if (date.getMonth() !== 4) return false;
  const last = new Date(date.getFullYear(), 4, 31, 12, 0, 0);
  const back = (last.getDay() + 6) % 7;
  last.setDate(31 - back);
  return date.getDate() === last.getDate();
}
function meetingMondayOf(year, month) {
  const first = firstMonday(year, month);
  if (isLaborDay(first) || isMemorialDay(first)) {
    const second = new Date(first);
    second.setDate(first.getDate() + 7);
    return second;
  }
  return first;
}
function nextGathering(from) {
  const now = new Date(from);
  let y = now.getFullYear();
  let m = now.getMonth();
  let candidate = meetingMondayOf(y, m);
  const moment = new Date(candidate);
  moment.setHours(18, 30, 0, 0);
  if (now >= moment) {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    candidate = meetingMondayOf(y, m);
  }
  return candidate;
}
function daysUntil(date, from) {
  const now = new Date(from);
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}
