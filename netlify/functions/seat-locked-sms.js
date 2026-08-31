/* Receipt SMS after LOCK MY SEAT. Never a magic link. Missing Twilio = 204. */
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
  if (!sid || !token || !from) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  var phone = '';
  try {
    var body = JSON.parse(event.body || '{}');
    phone = String(body.phone || '').trim();
  } catch (e0) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (!/^\+1\d{10}$/.test(phone)) {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  var params = new URLSearchParams({
    To: phone,
    From: from,
    Body: '⚡ THUNDER HQ\nSeat locked. Open the icon.'
  });
  try {
    var res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(sid + ':' + token).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
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
