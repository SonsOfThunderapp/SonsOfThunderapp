exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  const gate = await requireLeader(event);
  if (gate.error) return gate.error;
  const { sbUrl, serviceKey } = gate;
  const key = meetingKey(new Date());
  const headers = { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey };

  const [broRes, rsvpRes, subRes] = await Promise.all([
    fetch(sbUrl + '/rest/v1/brothers?select=id,name,phone,birthday', { headers }),
    fetch(sbUrl + '/rest/v1/rsvps?meeting_key=eq.' + encodeURIComponent(key) + '&select=brother_id', { headers }),
    fetch(sbUrl + '/rest/v1/push_subscriptions?select=endpoint', { headers })
  ]);

  const brothers = broRes.ok ? await broRes.json() : [];
  const rsvps = rsvpRes.ok ? await rsvpRes.json() : [];
  const subs = subRes.ok ? await subRes.json() : [];
  const inIds = {};
  (rsvps || []).forEach(function (r) { if (r.brother_id) inIds[r.brother_id] = true; });
  const inNames = [];
  let phones = 0;
  const bdays = [];
  const today = mmdd(new Date());
  (brothers || []).forEach(function (b) {
    if (inIds[b.id] && b.name) inNames.push(b.name);
    const d = String(b.phone || '').replace(/\D/g, '');
    if (d.length >= 10) phones += 1;
    const bd = String(b.birthday || '').trim();
    if (bd && birthdaySoon(bd, today)) bdays.push({ name: b.name || 'Brother', birthday: bd });
  });

  return json(200, {
    meeting_key: key,
    roster: (brothers || []).length,
    lockedIn: (rsvps || []).length,
    inNames: inNames.slice(0, 40),
    alerts: (subs || []).length,
    phones: phones,
    birthdays: bdays.slice(0, 12)
  });
};

function json(status, body) {
  return { statusCode: status, headers: cors(), body: JSON.stringify(body) };
}
function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
}
async function requireLeader(event) {
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  if (!sbUrl || !serviceKey) return { error: json(503, { error: 'Supabase not configured' }) };
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return { error: json(401, { error: 'Sign in required' }) };
  const userRes = await fetch(sbUrl + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + token, apikey: anonKey || serviceKey }
  });
  if (!userRes.ok) return { error: json(401, { error: 'Invalid session' }) };
  const user = await userRes.json();
  if (!user || !user.id) return { error: json(401, { error: 'Invalid session' }) };
  const memRes = await fetch(
    sbUrl + '/rest/v1/app_members?user_id=eq.' + encodeURIComponent(user.id) + '&active=eq.true&select=role',
    { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
  );
  if (!memRes.ok) return { error: json(500, { error: 'Could not verify leadership' }) };
  const rows = await memRes.json();
  const role = rows && rows[0] && rows[0].role;
  if (role !== 'leader' && role !== 'admin') return { error: json(403, { error: 'Leaders only' }) };
  return { sbUrl, serviceKey, user };
}
function pad(n) { return String(n).padStart(2, '0'); }
function mmdd(d) { return pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function birthdaySoon(bd, today) {
  const m = String(bd).match(/^(\d{2})-(\d{2})$/);
  if (!m) return false;
  if (bd === today) return true;
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const x = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (mmdd(x) === bd) return true;
  }
  return false;
}
function firstMonday(year, month) {
  const d = new Date(year, month, 1, 12, 0, 0);
  d.setDate(1 + ((8 - d.getDay()) % 7));
  return d;
}
function isLaborDay(date) {
  return date.getMonth() === 8 && date.getDate() === firstMonday(date.getFullYear(), 8).getDate();
}
function isMemorialDay(date) {
  if (date.getMonth() !== 4) return false;
  const last = new Date(date.getFullYear(), 4, 31, 12, 0, 0);
  last.setDate(31 - ((last.getDay() + 6) % 7));
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
function meetingKey(from) {
  const now = new Date(from);
  let y = now.getFullYear();
  let m = now.getMonth();
  let candidate = meetingMondayOf(y, m);
  const moment = new Date(candidate);
  moment.setHours(18, 30, 0, 0);
  if (now >= moment) {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    candidate = meetingMondayOf(y, m);
  }
  return candidate.getFullYear() + '-' + pad(candidate.getMonth() + 1) + '-' + pad(candidate.getDate());
}
