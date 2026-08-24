/**
 * Gathering alerts broadcast.
 * Authority: Supabase access token + active leader/admin in app_members.
 * Client PIN is NOT trusted here.
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

  if (!publicKey || !privateKey) {
    return json(503, { error: 'VAPID keys not configured on server' });
  }
  if (!sbUrl || !serviceKey) {
    return json(503, { error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';
    const accessToken = tokenFromHeader || String(body.access_token || '').trim();

    if (!accessToken) {
      return json(401, { error: 'Sign in required' });
    }

    // Verify JWT via Supabase Auth
    const userRes = await fetch(sbUrl + '/auth/v1/user', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        apikey: anonKey || serviceKey
      }
    });
    if (!userRes.ok) {
      return json(401, { error: 'Invalid or expired session' });
    }
    const user = await userRes.json();
    const userId = user && user.id;
    if (!userId) {
      return json(401, { error: 'Invalid session user' });
    }

    // Leader check via service role (bypasses RLS)
    const memRes = await fetch(
      sbUrl +
        '/rest/v1/app_members?user_id=eq.' +
        encodeURIComponent(userId) +
        '&active=eq.true&select=role',
      {
        headers: {
          apikey: serviceKey,
          Authorization: 'Bearer ' + serviceKey
        }
      }
    );
    if (!memRes.ok) {
      const t = await memRes.text();
      return json(500, { error: 'Could not verify membership', detail: t.slice(0, 200) });
    }
    const rows = await memRes.json();
    const role = rows && rows[0] && rows[0].role;
    if (role !== 'leader' && role !== 'admin') {
      return json(403, { error: 'Leaders only' });
    }

    const title = String(body.title || 'New announcement').slice(0, 80);
    const msgBody = String(body.body || 'Open Thunder Board').slice(0, 120);

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:thunder@sonsofthunder.local',
      publicKey,
      privateKey
    );

    const listRes = await fetch(
      sbUrl + '/rest/v1/push_subscriptions?select=endpoint,subscription',
      {
        headers: {
          apikey: serviceKey,
          Authorization: 'Bearer ' + serviceKey
        }
      }
    );
    if (!listRes.ok) {
      const text = await listRes.text();
      return json(500, { error: 'Could not load subscriptions', detail: text.slice(0, 200) });
    }

    const subRows = await listRes.json();
    const payload = JSON.stringify({
      title: 'Sons of Thunder',
      body: title + (msgBody ? ' — ' + msgBody : ''),
      url: '/',
      tag: 'thunder-announcement'
    });

    let sent = 0;
    let failed = 0;

    for (const row of subRows || []) {
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
              sbUrl +
                '/rest/v1/push_subscriptions?endpoint=eq.' +
                encodeURIComponent(sub.endpoint),
              {
                method: 'DELETE',
                headers: {
                  apikey: serviceKey,
                  Authorization: 'Bearer ' + serviceKey
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
