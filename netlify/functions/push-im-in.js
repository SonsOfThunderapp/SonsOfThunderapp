/**
 * Brother locked in → ping everyone subscribed.
 * Sign-in optional: named if session, "A brother" if device opted in via I'm In.
 * Once per identity per gathering.
 */
const webpush = require('web-push');
const crypto = require('crypto');

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
    const meetingKey = String(body.meeting_key || '').slice(0, 32);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingKey)) {
      return json(400, { error: 'Bad meeting' });
    }

    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(body.access_token || '').trim();

    let kind = '';
    let first = 'A brother';

    if (token) {
      const userRes = await fetch(sbUrl + '/auth/v1/user', {
        headers: { Authorization: 'Bearer ' + token, apikey: anonKey || serviceKey }
      });
      if (!userRes.ok) return json(401, { error: 'Invalid session' });
      const user = await userRes.json();
      const userId = user && user.id;
      if (!userId) return json(401, { error: 'Invalid session user' });
      kind = 'imin-' + userId;
      let n = String(body.name || '').trim().split(/\s+/)[0].replace(/[^\w'-]/g, '');
      if (n && n.length >= 2) first = n.charAt(0).toUpperCase() + n.slice(1).slice(0, 24);
    } else {
      const endpoint = String(body.endpoint || '').slice(0, 800);
      if (!endpoint || endpoint.indexOf('http') !== 0) {
        return json(401, { error: 'Opt-in this phone first' });
      }
      const found = await fetch(
        sbUrl + '/rest/v1/push_subscriptions?endpoint=eq.' + encodeURIComponent(endpoint) + '&select=endpoint',
        { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
      );
      if (!found.ok) return json(500, { error: 'Could not verify seat' });
      const rows = await found.json();
      if (!rows || !rows.length) return json(401, { error: 'Phone not on alerts' });
      const hash = crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 24);
      kind = 'imin-dev-' + hash;
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
        return json(200, { ok: true, skipped: 'already' });
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
    if (!listRes.ok) return json(500, { error: 'Could not load subscriptions' });
    const subRows = await listRes.json();
    const payload = JSON.stringify({
      title: first + ' locked in',
      body: 'The patio is filling. See who’s in.',
      url: '/?view=home',
      tag: 'thunder-imin-' + meetingKey
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
    'Access-Control-Allow-Origin': 'https://sonsofthunderboard.com',
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
