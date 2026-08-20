/**
 * Brother locked in → ping everyone on Gathering Alerts.
 * Once per brother per gathering. Signed-in only. Not a FOMO nag — a seat claimed.
 */
const webpush = require('web-push');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!publicKey || !privateKey || !sbUrl || !serviceKey) {
    return json(503, { error: 'Push not configured' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(body.access_token || '').trim();
    if (!token) return json(401, { error: 'Sign in required' });

    const userRes = await fetch(sbUrl + '/auth/v1/user', {
      headers: { Authorization: 'Bearer ' + token, apikey: anonKey || serviceKey }
    });
    if (!userRes.ok) return json(401, { error: 'Invalid session' });
    const user = await userRes.json();
    const userId = user && user.id;
    if (!userId) return json(401, { error: 'Invalid session user' });

    const meetingKey = String(body.meeting_key || '').slice(0, 32);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingKey)) {
      return json(400, { error: 'Bad meeting' });
    }

    const kind = 'imin-' + userId;
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
        return json(200, { ok: true, skipped: 'already' });
      }
    }

    let first = String(body.name || '').trim().split(/\s+/)[0].replace(/[^\w'-]/g, '');
    if (!first || first.length < 2) first = 'A brother';
    first = first.charAt(0).toUpperCase() + first.slice(1).slice(0, 24);

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:thunder@sonsofthunder.local',
      publicKey,
      privateKey
    );

    const listRes = await fetch(sbUrl + '/rest/v1/push_subscriptions?select=endpoint,subscription', {
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey }
    });
    if (!listRes.ok) return json(500, { error: 'Could not load subscriptions' });
    const subRows = await listRes.json();
    const payload = JSON.stringify({
      title: first + ' locked in',
      body: 'Next gathering. Seat claimed.',
      url: '/?view=home',
      tag: 'thunder-imin-' + kind
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

    return json(200, { ok: true, sent });
  } catch (e) {
    console.error('push-im-in', e);
    return json(500, { error: e.message || 'Failed' });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
function json(status, obj) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...cors() },
    body: JSON.stringify(obj)
  };
}
