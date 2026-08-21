/**
 * Catch-up: send queued birthday-honor texts once A2P can deliver.
 * Also retries Twilio honor texts that came back undelivered (30034).
 * Never logs or returns phone numbers.
 */
const crypto = require('crypto');

const HONOR_BODY =
  "You're in for Monday. Want the birthday honor? Tap this and add the day. That's it.\n" +
  'https://sonsofthunder.netlify.app/?bday=1';

exports.handler = async () => {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  const from = process.env.TWILIO_FROM || '';
  if (!sid || !token || !from) {
    return json(503, { error: 'twilio_missing', retried: 0, sent: 0 });
  }

  if (!(await a2pReady(sid, token))) {
    return json(200, { ok: true, skipped: 'a2p', sent: 0 });
  }

  const seen = {};
  let queued = 0;
  let fromTwilio = 0;
  let sent = 0;
  let stillBlocked = 0;

  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('honor-sms');
    const listed = await store.list();
    const blobs = (listed && listed.blobs) || [];
    for (const b of blobs.slice(0, 40)) {
      const row = await store.get(b.key, { type: 'json' });
      if (!row || row.sent || !row.to) continue;
      queued += 1;
      const key = String(row.to);
      if (seen[key]) continue;
      seen[key] = true;
      const result = await sendHonor(sid, token, from, row.to);
      if (result === 'sent') {
        sent += 1;
        await store.setJSON(b.key, Object.assign({}, row, { sent: true, sentAt: Date.now() }));
        await noteDispatch(hashOf(row.to));
      } else if (result === 'blocked') {
        stillBlocked += 1;
      }
    }
  } catch (e) {}

  try {
    const auth = Buffer.from(sid + ':' + token).toString('base64');
    const res = await fetch(
      'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json?PageSize=50',
      { headers: { Authorization: 'Basic ' + auth } }
    );
    if (res.ok) {
      const data = await res.json();
      const msgs = data.messages || [];
      for (const m of msgs) {
        const body = String(m.body || '');
        if (body.indexOf("You're in for Monday") !== 0) continue;
        const to = String(m.to || '');
        if (!to || seen[to]) continue;
        const err = String(m.error_code || '');
        const status = String(m.status || '');
        if (status === 'delivered' || status === 'sent') continue;
        if (status !== 'undelivered' && status !== 'failed' && err !== '30034') continue;
        seen[to] = true;
        fromTwilio += 1;
        const result = await sendHonor(sid, token, from, to);
        if (result === 'sent') {
          sent += 1;
          await noteDispatch(hashOf(to));
        } else if (result === 'blocked') {
          stillBlocked += 1;
        }
      }
    }
  } catch (e) {}

  return json(200, { ok: true, queued: queued, from_failed: fromTwilio, sent: sent, blocked: stillBlocked });
};

async function a2pReady(sid, token) {
  const auth = Buffer.from(sid + ':' + token).toString('base64');
  const headers = { Authorization: 'Basic ' + auth };
  try {
    const svc = await fetch('https://messaging.twilio.com/v1/Services?PageSize=20', { headers: headers });
    if (!svc.ok) return false;
    const data = await svc.json();
    for (const s of data.services || []) {
      const r = await fetch(
        'https://messaging.twilio.com/v1/Services/' + s.sid + '/Compliance/Usa2p?PageSize=20',
        { headers: headers }
      );
      if (!r.ok) continue;
      const j = await r.json();
      const list = j.compliance || j.contents || j.data || [];
      for (const c of list) {
        const st = String(c.campaign_status || c.campaignStatus || '').toUpperCase();
        if (st === 'APPROVED' || st === 'VERIFIED' || st === 'ACTIVE') return true;
      }
    }
  } catch (e) {}
  return false;
}

function hashOf(to) {
  const d = String(to || '').replace(/\D/g, '');
  return crypto.createHash('sha256').update(d).digest('hex').slice(0, 24);
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
    if (res.ok) return 'sent';
    let err = '';
    try { const j = await res.json(); err = String(j.code || j.message || ''); } catch (e) {}
    if (err.indexOf('30034') !== -1 || String(err).toLowerCase().indexOf('unregistered') !== -1) {
      return 'blocked';
    }
    return 'failed';
  } catch (e) {
    return 'failed';
  }
}

function json(status, obj) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
