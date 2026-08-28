exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST' };
  var sid = process.env.TWILIO_ACCOUNT_SID || '';
  var token = process.env.TWILIO_AUTH_TOKEN || '';
  var from = process.env.TWILIO_FROM || '';
  if (!sid || !token || !from) return { statusCode: 204, body: '' };
  var phone = '';
  var name = '';
  try {
    var body = JSON.parse(event.body || '{}');
    phone = String(body.phone || '').replace(/[^\d+]/g, '');
    name = String(body.name || '').trim();
  } catch (e0) { return { statusCode: 400, body: 'bad json' }; }
  if (phone.length === 10) phone = '+1' + phone;
  if (phone.length === 11 && phone[0] === '1') phone = '+' + phone;
  if (!/^\+\d{11,15}$/.test(phone)) return { statusCode: 204, body: '' };
  var line = name
    ? ('SONS OF THUNDER. ' + name + ', seat locked. Open the icon.')
    : 'SONS OF THUNDER. Seat locked. Open the icon.';
  try {
    var auth = Buffer.from(sid + ':' + token).toString('base64');
    await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'To=' + encodeURIComponent(phone) + '&From=' + encodeURIComponent(from) + '&Body=' + encodeURIComponent(line)
    });
  } catch (e1) {}
  return { statusCode: 204, body: '' };
};
