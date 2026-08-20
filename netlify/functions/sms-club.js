exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  const from = process.env.TWILIO_FROM || '';
  if (!sid || !token || !from) {
    return json(503, { error: 'twilio_missing', fallback: true });
  }

  const gate = await requireLeader(event);
  if (gate.error) return gate.error;
  const { sbUrl, serviceKey } = gate;
  let message = '';
  try { message = String(JSON.parse(event.body || '{}').message || '').trim(); } catch (e) {}
  if (!message) return json(400, { error: 'Add a line first.' });
  message = message.slice(0, 160);

  const broRes = await fetch(sbUrl + '/rest/v1/brothers?select=phone,name', {
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey }
  });
  if (!broRes.ok) return json(500, { error: 'Could not load phones' });
  const brothers = await broRes.json();
  const seen = {};
  const nums = [];
  (brothers || []).forEach(function (b) {
    let d = String(b.phone || '').replace(/\D/g, '');
    if (d.length === 10) d = '1' + d;
    if (d.length < 11 || seen[d]) return;
    seen[d] = true;
    nums.push('+' + d);
  });
  if (!nums.length) return json(400, { error: 'No phones on the roster.' });

  const auth = Buffer.from(sid + ':' + token).toString('base64');
  let sent = 0;
  let failed = 0;
  for (const to of nums.slice(0, 60)) {
    try {
      const body = new URLSearchParams({ To: to, From: from, Body: message });
      const res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      if (res.ok) sent += 1;
      else failed += 1;
    } catch (e) {
      failed += 1;
    }
  }
  return json(200, { ok: true, sent, tried: Math.min(nums.length, 60), failed });
};

function json(status, body) {
  return { statusCode: status, headers: cors(), body: JSON.stringify(body) };
}
function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
}
async function requireLeader(event) {
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  if (!sbUrl || !serviceKey) return { error: json(503, { error: 'Supabase not configured' }) };
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return { error: json(401, { error: 'Sign in required' }) };
  const userRes = await fetch(sbUrl + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + token, apikey: anonKey || serviceKey }
  });
  if (!userRes.ok) return { error: json(401, { error: 'Invalid session' }) };
  const user = await userRes.json();
  if (!user || !user.id) return { error: json(401, { error: 'Invalid session' }) };
  const memRes = await fetch(
    sbUrl + '/rest/v1/app_members?user_id=eq.' + encodeURIComponent(user.id) + '&active=eq.true&select=role',
    { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
  );
  if (!memRes.ok) return { error: json(500, { error: 'Could not verify leadership' }) };
  const rows = await memRes.json();
  const role = rows && rows[0] && rows[0].role;
  if (role !== 'leader' && role !== 'admin') return { error: json(403, { error: 'Leaders only' }) };
  return { sbUrl, serviceKey, user };
}
