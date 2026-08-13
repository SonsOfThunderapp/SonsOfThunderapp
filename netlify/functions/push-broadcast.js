/**
 * Broadcast Gathering alert to all stored push subscriptions.
 * Leadership-gated via PIN (body.pin must match LEADER_PIN env or default).
 * Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 */

const webpush = require('web-push');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function json(status, body) {
  return { statusCode: status, headers: cors, body: JSON.stringify(body) };
}

function setupVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:sons@thunder.local';
  if (!pub || !priv) {
    throw new Error('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY required');
  }
  webpush.setVapidDetails(subject, pub, priv);
}

async function listFromSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/push_subs?select=endpoint,subscription`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  if (!res.ok) {
    console.error('supabase list failed', res.status);
    return null;
  }
  const rows = await res.json();
  return (rows || []).map((r) => r.subscription || r).filter((s) => s && s.endpoint);
}

async function deleteFromSupabase(endpoint) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !endpoint) return;
  await fetch(`${url}/rest/v1/push_subs?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: 'DELETE',
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  }).catch(() => {});
}

async function listFromBlobs() {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('push-subs');
    const listed = await store.list();
    const blobs = listed.blobs || [];
    const out = [];
    for (const b of blobs) {
      try {
        const sub = await store.get(b.key, { type: 'json' });
        if (sub && sub.endpoint) out.push(sub);
      } catch (e) {}
    }
    return out;
  } catch (e) {
    console.error('blobs list failed', e);
    return null;
  }
}

async function deleteFromBlobs(endpoint) {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('push-subs');
    const key = Buffer.from(endpoint).toString('base64url').slice(0, 180);
    await store.delete(key);
  } catch (e) {}
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'POST only' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Invalid JSON' });
  }

  const expectedPin = process.env.LEADER_PIN || 'thunder';
  if (String(body.pin || '') !== String(expectedPin)) {
    return json(401, { error: 'Unauthorized' });
  }

  const title = String(body.title || 'New announcement').slice(0, 80);
  const msgBody = String(body.body || 'Open Thunder Board').slice(0, 140);

  try {
    setupVapid();
  } catch (e) {
    return json(500, { error: e.message || 'VAPID not configured' });
  }

  let subs = await listFromSupabase();
  if (!subs) subs = await listFromBlobs();
  if (!subs) subs = [];

  const payload = JSON.stringify({
    title,
    body: msgBody,
    url: '/',
    tag: 'thunder-announcement'
  });

  let sent = 0;
  let removed = 0;
  const errors = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent += 1;
      } catch (err) {
        const status = err && err.statusCode;
        if (status === 404 || status === 410) {
          removed += 1;
          await deleteFromSupabase(sub.endpoint);
          await deleteFromBlobs(sub.endpoint);
        } else {
          errors.push(String((err && err.message) || status || 'send failed'));
        }
      }
    })
  );

  return json(200, {
    ok: true,
    total: subs.length,
    sent,
    removed,
    errors: errors.slice(0, 5)
  });
};
