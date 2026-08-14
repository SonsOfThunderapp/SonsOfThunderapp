/**
 * Leadership-only: send one short push to all subscribed brothers.
 * Body: { pin, title, body }
 * Never puts announcement body details beyond a short public title.
 */
const webpush = require('web-push');
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  const leaderPin = process.env.LEADER_PIN || 'thunder';

  if (!publicKey || !privateKey) {
    return json(503, { error: 'VAPID keys not configured on server' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    if ((body.pin || '') !== leaderPin) {
      return json(403, { error: 'Unauthorized' });
    }

    const title = String(body.title || 'New announcement').slice(0, 80);
    const msgBody = String(body.body || 'Open Thunder Board').slice(0, 120);

    webpush.setVapidDetails(
      'mailto:thunder@sonsofthunder.local',
      publicKey,
      privateKey
    );

    const store = getStore('push-subs');
    const raw = (await store.get('list')) || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];

    const payload = JSON.stringify({
      title: 'Sons of Thunder',
      body: title + (msgBody ? ' — ' + msgBody : ''),
      url: '/',
      tag: 'thunder-announcement'
    });

    const kept = [];
    let sent = 0;
    let failed = 0;

    for (const sub of list) {
      if (!sub || !sub.endpoint) continue;
      try {
        await webpush.sendNotification(sub, payload);
        kept.push(sub);
        sent += 1;
      } catch (err) {
        failed += 1;
        // Drop gone subscriptions
        const code = err && (err.statusCode || err.status);
        if (code !== 404 && code !== 410) {
          kept.push(sub);
        }
      }
    }

    if (kept.length !== list.length) {
      await store.set('list', JSON.stringify(kept));
    }

    return json(200, { ok: true, sent, failed, remaining: kept.length });
  } catch (e) {
    console.error('push-broadcast', e);
    return json(500, { error: e.message || 'Broadcast failed' });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
