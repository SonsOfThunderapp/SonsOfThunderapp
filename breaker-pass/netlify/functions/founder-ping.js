/* Founder-only SMS. I’m In or new seat. Never texts the brotherhood. */
exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  var sid = process.env.TWILIO_ACCOUNT_SID || '';
  var token = process.env.TWILIO_AUTH_TOKEN || '';
  var from = process.env.TWILIO_FROM || '';
  var to = String(process.env.FOUNDER_SMS || process.env.TB_FOUNDER_PHONE || '+19314042031').replace(/[^\d+]/g, '');
  if (to.indexOf('+') !== 0 && to.length === 10) to = '+1' + to;
  if (!sid || !token || !from || !/^\+1\d{10}$/.test(to)) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  var kind = 'ping';
  var name = '';
  var email = '';
  var phone = '';
  var gathering = '';
  try {
    var body = JSON.parse(event.body || '{}');
    kind = String(body.kind || 'ping').toLowerCase();
    name = String(body.name || '').trim().slice(0, 40);
    email = String(body.email || '').trim().toLowerCase().slice(0, 80);
    phone = String(body.phone || '').trim().slice(0, 20);
    gathering = String(body.gathering || '').trim().slice(0, 48);
  } catch (e0) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  var line = kind === 'seat' ? 'NEW SEAT' : "I'M IN";
  var msg = '⚡ THUNDER HQ\n' + line;
  if (name) msg += ' — ' + name;
  if (email) msg += '\n' + email;
  if (phone) msg += '\n' + phone;
  if (gathering) msg += '\n' + gathering;
  try {
    var res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(sid + ':' + token).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: to, From: from, Body: msg }).toString()
    });
    if (!res.ok) return { statusCode: 204, headers: cors(), body: '' };
  } catch (e1) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  return { statusCode: 204, headers: cors(), body: '' };
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
