/**
 * Store a Web Push subscription for Gathering alerts.
 * Persistence: Supabase push_subs if env set, else Netlify Blobs.
 * Never stores private VAPID key.
 */

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(status, body) {
  return { statusCode: status, headers: cors, body: JSON.stringify(body) };
}

async function storeWithSupabase(subscription) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  const endpoint = subscription.endpoint;
  const res = await fetch(`${url}/rest/v1/push_subs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      endpoint,
      subscription,
      updated_at: new Date().toISOString()
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('supabase push_subs upsert failed', res.status, text);
    throw new Error('Supabase store failed');
  }
  return true;
}

async function storeWithBlobs(subscription) {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('push-subs');
    // Key cannot contain raw URL characters freely — hash-ish encode
    const key = Buffer.from(subscription.endpoint).toString('base64url').slice(0, 180);
    await store.setJSON(key, subscription);
    return true;
  } catch (e) {
    console.error('blobs store failed', e);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'POST only' });
  }

  let subscription;
  try {
    const body = JSON.parse(event.body || '{}');
    subscription = body.subscription || body;
  } catch (e) {
    return json(400, { error: 'Invalid JSON' });
  }

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return json(400, { error: 'subscription with endpoint + keys required' });
  }

  try {
    let ok = false;
    try {
      ok = await storeWithSupabase(subscription);
    } catch (e) {
      ok = false;
    }
    if (!ok) {
      ok = await storeWithBlobs(subscription);
    }
    if (!ok) {
      return json(503, {
        error: 'No persistent store configured',
        hint: 'Set SUPABASE_URL + key and create push_subs, or enable Netlify Blobs'
      });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error('push-subscribe failed', e);
    return json(500, { error: 'Subscribe failed' });
  }
};
