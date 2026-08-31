/* Forgot = 6-digit SMS. No email link. Token is HMAC so we need no table. */
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
  var email = '';
  var phone = '';
  try {
    var body = JSON.parse(event.body || '{}');
    email = String(body.email || '').trim().toLowerCase();
    phone = digits(body.phone);
  } catch (e0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad json' }) };
  }
  if (!email || !/^\+\d{11,15}$/.test(phone)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and phone.' }) };
  }
  if (!secret()) return { statusCode: 204, body: '' };

  var code = String(Math.floor(100000 + Math.random() * 900000));
  var exp = Date.now() + 10 * 60 * 1000;
  var token = tokenFor(email, phone, code, String(exp));

  var sid = process.env.TWILIO_ACCOUNT_SID || '';
  var tw = process.env.TWILIO_AUTH_TOKEN || '';
  var from = process.env.TWILIO_FROM || '';
  if (sid && tw && from) {
    try {
      var auth = Buffer.from(sid + ':' + tw).toString('base64');
      await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'To=' + encodeURIComponent(phone) +
          '&From=' + encodeURIComponent(from) +
          '&Body=' + encodeURIComponent('⚡ THUNDER HQ\nCode: ' + code)
      });
    } catch (e1) {}
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, token: token, exp: exp })
  };
};
