const crypto = require('crypto');
function secret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.TWILIO_AUTH_TOKEN || '';
}
function tokenFor(email, phone, code, exp) {
  return crypto.createHmac('sha256', secret()).update(email + '|' + phone + '|' + code + '|' + exp).digest('hex');
}
function digits(phone) {
  var p = String(phone || '').replace(/[^\d+]/g, '');
  if (p.length === 10) p = '+1' + p;
  if (p.length === 11 && p[0] === '1') p = '+' + p;
  return p;
}
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST' };
  var email = '', phone = '', code = '', token = '', pass = '', exp = '';
  try {
    var body = JSON.parse(event.body || '{}');
    email = String(body.email || '').trim().toLowerCase();
    phone = digits(body.phone);
    code = String(body.code || '').replace(/\D/g, '');
    token = String(body.token || '');
    pass = String(body.password || '');
    exp = String(body.exp || '');
  } catch (e0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad json' }) };
  }
  if (!email || !code || !token || pass.length < 6) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Code and 6+ character password.' }) };
  }
  if (!secret()) return { statusCode: 500, body: JSON.stringify({ error: 'Ask a leader.' }) };
  if (Date.now() > Number(exp || 0)) return { statusCode: 400, body: JSON.stringify({ error: 'Code expired. Send again.' }) };
  if (tokenFor(email, phone, code, exp) !== token) return { statusCode: 400, body: JSON.stringify({ error: 'Wrong code.' }) };
  var url = (process.env.SUPABASE_URL || process.env.SB_URL || '').replace(/\/$/, '');
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return { statusCode: 500, body: JSON.stringify({ error: 'Ask a leader.' }) };
  try {
    var look = await fetch(url + '/auth/v1/admin/users?page=1&per_page=200', {
      headers: { apikey: key, Authorization: 'Bearer ' + key }
    });
    var pack = await look.json();
    var users = pack.users || pack || [];
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (String((users[i] && users[i].email) || '').toLowerCase() === email) { user = users[i]; break; }
    }
    if (!user || !user.id) return { statusCode: 400, body: JSON.stringify({ error: 'No seat for that email.' }) };
    var upd = await fetch(url + '/auth/v1/admin/users/' + user.id, {
      method: 'PUT',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    if (!upd.ok) return { statusCode: 400, body: JSON.stringify({ error: 'Could not set password.' }) };
  } catch (e1) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Ask a leader.' }) };
  }
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
};
