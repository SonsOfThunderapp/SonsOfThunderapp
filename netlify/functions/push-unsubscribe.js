/**
 * Remove a push subscription (opt-out).
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

async function deleteSupabase(endpoint) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: 'DELETE',
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  return res.ok;
}

async function deleteBlobs(endpoint) {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('push-subs');
    const key = Buffer.from(endpoint).toString('base64url').slice(0, 180);
    await store.delete(key);
    return true;
  } catch (e) {
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

  let endpoint = '';
  try {
    const body = JSON.parse(event.body || '{}');
    endpoint = (body.endpoint || (body.subscription && body.subscription.endpoint) || '').toString();
  } catch (e) {
    return json(400, { error: 'Invalid JSON' });
  }
  if (!endpoint) return json(400, { error: 'endpoint required' });

  await deleteSupabase(endpoint);
  await deleteBlobs(endpoint);
  return json(200, { ok: true });
};
