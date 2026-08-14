/**
 * Save a browser push subscription (Gathering Alerts opt-in).
 * Body: { subscription: PushSubscriptionJSON }
 */
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const sub = body.subscription;
    if (!sub || !sub.endpoint) {
      return json(400, { error: 'Missing subscription' });
    }

    const store = getStore('push-subs');
    const raw = (await store.get('list')) || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];

    // Upsert by endpoint
    const idx = list.findIndex((s) => s && s.endpoint === sub.endpoint);
    if (idx >= 0) list[idx] = sub;
    else list.push(sub);

    // Cap at 500 for a private fraternity
    if (list.length > 500) list = list.slice(-500);

    await store.set('list', JSON.stringify(list));
    return json(200, { ok: true, count: list.length });
  } catch (e) {
    console.error('push-subscribe', e);
    return json(500, { error: e.message || 'Subscribe failed' });
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
