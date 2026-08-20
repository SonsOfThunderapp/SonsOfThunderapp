exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    return json(503, { error: 'Supabase not configured for push' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const sub = body.subscription;
    if (!sub || !sub.endpoint) {
      return json(400, { error: 'Missing subscription' });
    }

    const row = {
      endpoint: sub.endpoint,
      subscription: sub,
      updated_at: new Date().toISOString()
    };
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const anonKey = process.env.SUPABASE_ANON_KEY || key;
    if (token) {
      try {
        const userRes = await fetch(url.replace(/\/$/, '') + '/auth/v1/user', {
          headers: { Authorization: 'Bearer ' + token, apikey: anonKey }
        });
        if (userRes.ok) {
          const user = await userRes.json();
          if (user && user.id) row.user_id = user.id;
        }
      } catch (e) {}
    }

    const res = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/push_subscriptions?on_conflict=endpoint`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(row)
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('subscribe supabase', res.status, text);
      return json(500, { error: 'Could not save subscription', detail: text.slice(0, 200) });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error('push-subscribe', e);
    return json(500, { error: e.message || 'Subscribe failed' });
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
