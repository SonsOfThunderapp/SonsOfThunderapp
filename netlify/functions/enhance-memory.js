/**
 * Conservative memory polish. Original stays in Storage.
 * JWT first (user signed URL + row patch). Optional env: SUPABASE_SERVICE_ROLE_KEY
 * Sharp: EXIF rotate → median denoise → cap long edge → mild sharpen → webp.
 */
const sharp = require('sharp');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(status, body) {
  return { statusCode: status, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function encBucket(bucket) {
  return encodeURIComponent(bucket);
}
function encPath(p) {
  return String(p || '').split('/').map(encodeURIComponent).join('/');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST only' });

  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const bucket = (process.env.MEMORIES_BUCKET || 'Sons Of Thunder Memories').trim();

  if (!sbUrl || !anonKey) {
    return json(503, { ok: false, error: 'enhance_unconfigured', fallback: 'original' });
  }

  let memoryId = '';
  try {
    const body = JSON.parse(event.body || '{}');
    memoryId = String(body.id || '').trim();
  } catch (e) {
    return json(400, { ok: false, error: 'bad_json', fallback: 'original' });
  }
  if (!/^[0-9a-f-]{36}$/i.test(memoryId)) {
    return json(400, { ok: false, error: 'bad_id', fallback: 'original' });
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return json(401, { ok: false, error: 'auth', fallback: 'original' });

  try {
    const userRes = await fetch(sbUrl + '/auth/v1/user', {
      headers: { apikey: anonKey, Authorization: 'Bearer ' + token }
    });
    if (!userRes.ok) return json(401, { ok: false, error: 'auth', fallback: 'original' });
    const user = await userRes.json();
    const uid = user && user.id;
    if (!uid) return json(401, { ok: false, error: 'auth', fallback: 'original' });

    const row = await loadRow(sbUrl, anonKey, token, serviceKey, memoryId);
    if (!row || row.user_id !== uid) {
      return json(403, { ok: false, error: 'forbidden', fallback: 'original' });
    }
    if (row.display_path && row.enhance_status === 'ready') {
      return json(200, { ok: true, skipped: 'already', display_path: row.display_path, card_path: row.card_path || null });
    }

    const originalPath = row.original_path || row.storage_path;
    if (!originalPath) return json(400, { ok: false, error: 'no_original', fallback: 'original' });
    if (/\.(mp4|webm|mov)$/i.test(originalPath)) {
      return json(200, { ok: true, skipped: 'video', fallback: 'original' });
    }

    const buf = await downloadOriginal(sbUrl, anonKey, token, serviceKey, bucket, originalPath);
    if (!buf) {
      await markFailed(sbUrl, anonKey, token, serviceKey, memoryId, 'fetch_original');
      return json(200, { ok: false, error: 'fetch_original', fallback: 'original' });
    }
    if (!buf.length || buf.length > 18 * 1024 * 1024) {
      await markFailed(sbUrl, anonKey, token, serviceKey, memoryId, 'size');
      return json(200, { ok: false, error: 'size', fallback: 'original' });
    }

    const displayBuf = await polish(buf, 1600, 80);
    const cardBuf = await polish(buf, 800, 72);
    const base = 'private/' + uid + '/' + memoryId + '/';
    const displayPath = base + 'display.webp';
    const cardPath = base + 'card.webp';

    const upDisplay = await storageUpload(sbUrl, anonKey, token, serviceKey, bucket, displayPath, displayBuf, 'image/webp');
    const upCard = await storageUpload(sbUrl, anonKey, token, serviceKey, bucket, cardPath, cardBuf, 'image/webp');
    if (!upDisplay) {
      await markFailed(sbUrl, anonKey, token, serviceKey, memoryId, 'upload_display');
      return json(200, { ok: false, error: 'upload_display', fallback: 'original' });
    }

    const patch = {
      display_path: displayPath,
      card_path: upCard ? cardPath : null,
      enhance_status: 'ready',
      enhance_error: null
    };
    const patched = await patchRow(sbUrl, anonKey, token, serviceKey, memoryId, patch);
    if (!patched) {
      await markFailed(sbUrl, anonKey, token, serviceKey, memoryId, 'patch');
      return json(200, { ok: false, error: 'patch', fallback: 'original' });
    }
    return json(200, { ok: true, display_path: displayPath, card_path: upCard ? cardPath : null });
  } catch (e) {
    try { await markFailed(sbUrl, anonKey, token, serviceKey, memoryId, 'throw'); } catch (e2) {}
    return json(200, { ok: false, error: 'enhance_failed', fallback: 'original' });
  }
};

function restHeaders(apikey, token) {
  return {
    apikey: apikey,
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
}

async function restGet(sbUrl, headers, qs) {
  const res = await fetch(sbUrl + '/rest/v1/memories?' + qs, { headers: headers });
  if (!res.ok) return [];
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

async function loadRow(sbUrl, anonKey, userToken, serviceKey, id) {
  const qs = 'id=eq.' + encodeURIComponent(id) + '&select=id,user_id,storage_path,original_path,display_path,card_path,enhance_status&limit=1';
  let rows = await restGet(sbUrl, restHeaders(anonKey, userToken), qs);
  if ((!rows || !rows[0]) && serviceKey) {
    rows = await restGet(sbUrl, restHeaders(serviceKey, serviceKey), qs);
  }
  return rows && rows[0];
}

async function patchRow(sbUrl, anonKey, userToken, serviceKey, id, body) {
  const url = sbUrl + '/rest/v1/memories?id=eq.' + encodeURIComponent(id);
  const tryPatch = async (key, tok) => {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...restHeaders(key, tok), Prefer: 'return=minimal' },
      body: JSON.stringify(body)
    });
    return res.ok;
  };
  if (await tryPatch(anonKey, userToken)) return true;
  if (serviceKey) return tryPatch(serviceKey, serviceKey);
  return false;
}

async function storageSign(sbUrl, apikey, token, bucket, path, expires) {
  const res = await fetch(
    sbUrl + '/storage/v1/object/sign/' + encBucket(bucket) + '/' + encPath(path),
    { method: 'POST', headers: restHeaders(apikey, token), body: JSON.stringify({ expiresIn: expires || 120 }) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const signed = data && (data.signedURL || data.signedUrl);
  if (!signed) return null;
  if (String(signed).startsWith('http')) return signed;
  return sbUrl + '/storage/v1' + (String(signed).startsWith('/') ? signed : '/' + signed);
}

async function downloadOriginal(sbUrl, anonKey, userToken, serviceKey, bucket, path) {
  let signed = await storageSign(sbUrl, anonKey, userToken, bucket, path, 120);
  if (!signed && serviceKey) signed = await storageSign(sbUrl, serviceKey, serviceKey, bucket, path, 120);
  if (!signed) return null;
  const imgRes = await fetch(signed);
  if (!imgRes.ok) return null;
  return Buffer.from(await imgRes.arrayBuffer());
}

async function storageUpload(sbUrl, anonKey, userToken, serviceKey, bucket, path, body, contentType) {
  const tryUp = async (key, tok) => {
    const res = await fetch(
      sbUrl + '/storage/v1/object/' + encBucket(bucket) + '/' + encPath(path),
      {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: 'Bearer ' + tok,
          'Content-Type': contentType,
          'x-upsert': 'true'
        },
        body
      }
    );
    return res.ok;
  };
  if (await tryUp(anonKey, userToken)) return true;
  if (serviceKey) return tryUp(serviceKey, serviceKey);
  return false;
}

async function markFailed(sbUrl, anonKey, userToken, serviceKey, id, reason) {
  if (!id || !sbUrl) return;
  await patchRow(sbUrl, anonKey, userToken, serviceKey, id, {
    enhance_status: 'failed',
    enhance_error: String(reason || 'failed').slice(0, 40)
  });
}

async function polish(buf, longEdge, quality) {
  let img = sharp(buf, { failOn: 'none', sequentialRead: true }).rotate();
  const meta = await img.metadata();
  const w = meta.width || longEdge;
  const h = meta.height || longEdge;
  const long = Math.max(w, h);
  if (long > longEdge) {
    img = img.resize({
      width: w >= h ? longEdge : null,
      height: h > w ? longEdge : null,
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  return img
    .median(3)
    .sharpen({ sigma: 0.7, m1: 0.8, m2: 0.4 })
    .webp({ quality: quality || 78, effort: 4, smartSubsample: true })
    .toBuffer();
}
