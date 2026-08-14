/**
 * Remove a push subscription.
 * Body: { endpoint: string }
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
    const endpoint = body.endpoint;
    if (!endpoint) return json(400, { error: 'Missing endpoint' });

    const store = getStore('push-subs');
    const raw = (await store.get('list')) || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];

    const next = list.filter((s) => s && s.endpoint !== endpoint);
    await store.set('list', JSON.stringify(next));
    return json(200, { ok: true, count: next.length });
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
