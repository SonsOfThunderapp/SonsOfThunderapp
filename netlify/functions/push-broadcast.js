// Broadcast push to subscribed brothers. Requires VAPID_PRIVATE_KEY + web-push at runtime.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'POST only' }) };
  }
  if (!process.env.VAPID_PRIVATE_KEY) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'VAPID_PRIVATE_KEY not set on Netlify' })
    };
  }
  // Full subscription store + web-push send lives in production env.
  // Acknowledge payload shape the client expects.
  try {
    const body = JSON.parse(event.body || '{}');
    const title = String(body.title || 'Sons of Thunder').slice(0, 80);
    const text = String(body.body || body.text || 'Open Thunder Board').slice(0, 180);
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, sent: 0, title, body: text, note: 'Deploy with subscription store + web-push for live sends' })
    };
  } catch (e) {
    return { statusCode: 500, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message || 'fail' }) };
  }
};
