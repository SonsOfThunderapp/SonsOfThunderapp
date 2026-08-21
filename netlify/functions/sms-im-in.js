/**
 * One-to-one birthday-honor text after LOCK YOUR SEAT + explicit opt-in.
 * Not TEXT THE CLUB. Never SELECT brothers.phone. Fail closed if Twilio missing.
 */
const crypto = require('crypto');

const HONOR_BODY =
  "You're in for Monday. Want the birthday honor? Tap this and add the day. That's it.\n" +
  'https://sonsofthunder.netlify.app/?bday=1';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(), body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed', sent: false });

  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  const from = process.env.TWILIO_FROM || '';
  if (!sid || !token || !from) {
    return json(503, { error: 'twilio_missing', sent: false });
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  if (body.opt_in !== true) return json(403, { error: 'opt_in_required', sent: false });

  let d = String(body.phone || '').replace(/\D/g, '');
  if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
  if (d.length !== 10) return json(400, { error: 'bad_phone', sent: false });
  const to = '+1' + d;
  const hash = crypto.createHash('sha256').update('1' + d).digest('hex').slice(0, 24);
  const kind = 'sms-bday-' + hash;
  const meetingKey = 'honor-once';

  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (sbUrl && serviceKey) {
    try {
      const already = await fetch(
        sbUrl +
          '/rest/v1/push_dispatch?kind=eq.' +
          encodeURIComponent(kind) +
          '&meeting_key=eq.' +
          encodeURIComponent(meetingKey) +
          '&select=kind',
        { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
      );
      if (already.ok) {
        const rows = await already.json();
        if (rows && rows.length) return json(200, { ok: true, sent: false, skipped: 'already' });
      }
    } catch (e) {}
  }

  const auth = Buffer.from(sid + ':' + token).toString('base64');
  let twilioOk = false;
  try {
    const res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: to, From: from, Body: HONOR_BODY }).toString()
    });
    twilioOk = res.ok;
  } catch (e) {
    return json(502, { error: 'twilio_failed', sent: false });
  }
  if (!twilioOk) return json(502, { error: 'twilio_failed', sent: false });

  if (sbUrl && serviceKey) {
    try {
      await fetch(sbUrl + '/rest/v1/push_dispatch', {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: 'Bearer ' + serviceKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ kind: kind, meeting_key: meetingKey })
      });
    } catch (e) {}
  }

  return json(200, { ok: true, sent: true });
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
