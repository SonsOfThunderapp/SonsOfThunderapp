/**
 * Pre-gallery polish. Original stays in Storage.
 * Sharp: EXIF rotate → cap long edge → mild sharpen → WebP display + card.
 * Never blocks Drop a Shot. No secrets in the client.
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST only' });

  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const bucket = (process.env.MEMORIES_BUCKET || 'Sons Of Thunder Memories').trim();

  if (!sbUrl || !serviceKey) {
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
      headers: { apikey: anonKey || serviceKey, Authorization: 'Bearer ' + token }
    });
    if (!userRes.ok) return json(401, { ok: false, error: 'auth', fallback: 'original' });
    const user = await userRes.json();
    const uid = user && user.id;
    if (!uid) return json(401, { ok: false, error: 'auth', fallback: 'original' });

    const rowRes = await fetch(
      sbUrl + '/rest/v1/memories?id=eq.' + encodeURIComponent(memoryId) + '&select=id,user_id,storage_path,original_path,display_path,card_path&limit=1',
      { headers: restHeaders(serviceKey) }
    );
    const rows = rowRes.ok ? await rowRes.json() : [];
    const row = Array.isArray(rows) && rows[0];
    if (!row || row.user_id !== uid) {
      return json(403, { ok: false, error: 'forbidden', fallback: 'original' });
    }

    const originalPath = row.original_path || row.storage_path;
    if (!originalPath) return json(400, { ok: false, error: 'no_original', fallback: 'original' });
    if (/\.(mp4|webm|mov)$/i.test(originalPath)) {
      return json(200, { ok: true, skipped: 'video', fallback: 'original' });
    }

    const signed = await storageSign(sbUrl, serviceKey, bucket, originalPath, 120);
    if (!signed) {
      await markFailed(sbUrl, serviceKey, memoryId, 'sign_original');
      return json(200, { ok: false, error: 'sign_original', fallback: 'original' });
    }
    const imgRes = await fetch(signed);
    if (!imgRes.ok) {
      await markFailed(sbUrl, serviceKey, memoryId, 'fetch_original');
      return json(200, { ok: false, error: 'fetch_original', fallback: 'original' });
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (!buf.length || buf.length > 18 * 1024 * 1024) {
      await markFailed(sbUrl, serviceKey, memoryId, 'size');
      return json(200, { ok: false, error: 'size', fallback: 'original' });
    }

    const displayBuf = await polish(buf, 1600, 80);
    const cardBuf = await polish(buf, 800, 72);
    const base = 'private/' + uid + '/' + memoryId + '/';
    const displayPath = base + 'display.webp';
    const cardPath = base + 'card.webp';

    const upDisplay = await storageUpload(sbUrl, serviceKey, bucket, displayPath, displayBuf, 'image/webp');
    const upCard = await storageUpload(sbUrl, serviceKey, bucket, cardPath, cardBuf, 'image/webp');
    if (!upDisplay) {
      await markFailed(sbUrl, serviceKey, memoryId, 'upload_display');
      return json(200, { ok: false, error: 'upload_display', fallback: 'original' });
    }

    const patch = {
      display_path: displayPath,
      card_path: upCard ? cardPath : null,
      enhance_status: 'ready',
      enhance_error: null
    };
    const upd = await fetch(sbUrl + '/rest/v1/memories?id=eq.' + encodeURIComponent(memoryId), {
      method: 'PATCH',
      headers: { ...restHeaders(serviceKey), Prefer: 'return=minimal' },
      body: JSON.stringify(patch)
    });
    if (!upd.ok) {
      await markFailed(sbUrl, serviceKey, memoryId, 'patch');
      return json(200, { ok: false, error: 'patch', fallback: 'original' });
    }
    return json(200, { ok: true, display_path: displayPath, card_path: upCard ? cardPath : null });
  } catch (e) {
    try { await markFailed(sbUrl, serviceKey, memoryId, 'throw'); } catch (e2) {}
    return json(200, { ok: false, error: 'enhance_failed', fallback: 'original' });
  }
};

function restHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: 'Bearer ' + serviceKey,
    'Content-Type': 'application/json'
  };
}

async function storageSign(sbUrl, key, bucket, path, expires) {
  const res = await fetch(
    sbUrl + '/storage/v1/object/sign/' + encodeURIComponent(bucket) + '/' + path,
    { method: 'POST', headers: restHeaders(key), body: JSON.stringify({ expiresIn: expires || 120 }) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const signed = data && (data.signedURL || data.signedUrl);
  if (!signed) return null;
  if (String(signed).startsWith('http')) return signed;
  return sbUrl + '/storage/v1' + (String(signed).startsWith('/') ? signed : '/' + signed);
}

async function storageUpload(sbUrl, key, bucket, path, body, contentType) {
  const res = await fetch(
    sbUrl + '/storage/v1/object/' + encodeURIComponent(bucket) + '/' + path,
    {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body
    }
  );
  return res.ok;
}

async function markFailed(sbUrl, key, id, reason) {
  if (!id || !sbUrl || !key) return;
  try {
    await fetch(sbUrl + '/rest/v1/memories?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { ...restHeaders(key), Prefer: 'return=minimal' },
      body: JSON.stringify({
        enhance_status: 'failed',
        enhance_error: String(reason || 'failed').slice(0, 40)
      })
    });
  } catch (e) {}
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
    .sharpen({ sigma: 0.7, m1: 0.8, m2: 0.4 })
    .webp({ quality: quality || 78, effort: 4, smartSubsample: true })
    .toBuffer();
}
