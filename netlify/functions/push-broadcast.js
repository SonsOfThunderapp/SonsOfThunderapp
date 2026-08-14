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
  const leaderPin = process.env.LEADER_PIN || 'thunder';
  const sbUrl = process.env.SUPABASE_URL || '';
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!publicKey || !privateKey) {
    return json(503, { error: 'VAPID keys not configured on server' });
  }
  if (!sbUrl || !sbKey) {
    return json(503, { error: 'Supabase not configured for push' });
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

    const listRes = await fetch(
      `${sbUrl.replace(/\/$/, '')}/rest/v1/push_subscriptions?select=endpoint,subscription`,
      {
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`
        }
      }
    );
    if (!listRes.ok) {
      const text = await listRes.text();
      return json(500, { error: 'Could not load subscriptions', detail: text.slice(0, 200) });
    }

    const rows = await listRes.json();
    const payload = JSON.stringify({
      title: 'Sons of Thunder',
      body: title + (msgBody ? ' — ' + msgBody : ''),
      url: '/',
      tag: 'thunder-announcement'
    });

    let sent = 0;
    let failed = 0;

    for (const row of rows || []) {
      const sub = row.subscription || row;
      if (!sub || !sub.endpoint) continue;
      try {
        await webpush.sendNotification(sub, payload);
        sent += 1;
      } catch (err) {
        failed += 1;
        const code = err && (err.statusCode || err.status);
        if (code === 404 || code === 410) {
          try {
            await fetch(
              `${sbUrl.replace(/\/$/, '')}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,
              {
                method: 'DELETE',
                headers: {
                  apikey: sbKey,
                  Authorization: `Bearer ${sbKey}`
                }
              }
            );
          } catch (e) {}
        }
      }
    }

    return json(200, { ok: true, sent, failed });
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
