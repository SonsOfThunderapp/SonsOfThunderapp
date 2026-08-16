exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    return json(503, { error: 'Supabase not configured for push' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const endpoint = body.endpoint;
    if (!endpoint) return json(400, { error: 'Missing endpoint' });

    const res = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: 'return=minimal'
        }
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('unsubscribe supabase', res.status, text);
      return json(500, { error: 'Could not remove subscription' });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error('push-unsubscribe', e);
    return json(500, { error: e.message || 'Unsubscribe failed' });
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
