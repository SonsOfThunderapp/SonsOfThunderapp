/**
 * One-to-one birthday-honor text after LOCK YOUR SEAT + explicit opt-in.
 * Queues the send if Twilio/A2P is not ready. honor-sms-retry catches them up.
 * Never SELECT brothers.phone. Fail closed if Twilio missing.
 */
const crypto = require('crypto');

const HONOR_BODY =
  "You're in for Monday. Want the birthday honor? Tap this and add the day. That's it.\n" +
  'https://sonsofthunderboard.com/?bday=1';

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

  await queueHonor(hash, to);

  if (await alreadySent(sid, token, hash)) {
    return json(200, { ok: true, sent: false, skipped: 'already' });
  }

  const twilioOk = await sendHonor(sid, token, from, to);
  if (twilioOk) {
    await markSent(hash);
    await noteDispatch(hash);
    return json(200, { ok: true, sent: true });
  }
  return json(202, { ok: true, sent: false, queued: true });
};

async function queueHonor(hash, to) {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('honor-sms');
    const prev = await store.get(hash, { type: 'json' });
    if (prev && prev.sent) return;
    await store.setJSON(hash, { to: to, sent: false, at: Date.now() });
  } catch (e) {}
}

async function markSent(hash) {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('honor-sms');
    const prev = (await store.get(hash, { type: 'json' })) || {};
    await store.setJSON(hash, Object.assign({}, prev, { sent: true, sentAt: Date.now() }));
  } catch (e) {}
}

async function alreadySent(sid, token, hash) {
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!sbUrl || !serviceKey) return false;
  try {
    const already = await fetch(
      sbUrl + '/rest/v1/push_dispatch?kind=eq.' + encodeURIComponent('sms-bday-' + hash) +
        '&meeting_key=eq.honor-once&select=kind',
      { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
    );
    if (!already.ok) return false;
    const rows = await already.json();
    return !!(rows && rows.length);
  } catch (e) { return false; }
}

async function noteDispatch(hash) {
  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!sbUrl || !serviceKey) return;
  try {
    await fetch(sbUrl + '/rest/v1/push_dispatch', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ kind: 'sms-bday-' + hash, meeting_key: 'honor-once' })
    });
  } catch (e) {}
}

async function sendHonor(sid, token, from, to) {
  const auth = Buffer.from(sid + ':' + token).toString('base64');
  try {
    const res = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: to, From: from, Body: HONOR_BODY }).toString()
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

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
