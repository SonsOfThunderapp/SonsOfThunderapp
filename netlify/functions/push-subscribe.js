/**
 * Store a Web Push subscription.
 * Not a privileged leadership action — still rate-limited and origin-locked.
 * Service role is used only to upsert the subscription row.
 */
const rateBucket = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 30;
  let e = rateBucket.get(ip);
  if (!e || now - e.start > windowMs) {
    e = { start: now, n: 0 };
    rateBucket.set(ip, e);
  }
  e.n += 1;
  if (rateBucket.size > 5000) {
    for (const [k, v] of rateBucket) {
      if (now - v.start > windowMs * 2) rateBucket.delete(k);
    }
  }
  return e.n <= max;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const ip = (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    'unknown'
  )
    .toString()
    .split(',')[0]
    .trim();
  if (!rateLimit(ip)) {
    return json(429, { error: 'Too many requests' });
  }

  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    return json(503, { error: 'Supabase not configured for push' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const sub = body.subscription;
    if (!sub || typeof sub.endpoint !== 'string') {
      return json(400, { error: 'Missing subscription' });
    }
    if (sub.endpoint.length > 2048 || !/^https:\/\//i.test(sub.endpoint)) {
      return json(400, { error: 'Invalid subscription' });
    }

    const row = {
      endpoint: sub.endpoint,
      subscription: sub,
      updated_at: new Date().toISOString()
    };

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
      console.error('subscribe supabase', res.status, text.slice(0, 200));
      return json(500, { error: 'Could not save subscription' });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error('push-subscribe', e);
    return json(500, { error: 'Subscribe failed' });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': 'https://sonsofthunderboard.com',
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
