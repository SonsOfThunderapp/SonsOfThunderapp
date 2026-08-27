/**
 * THIS MONTH chair write. Service role stays on the server.
 * POST /.netlify/functions/theater-month-put
 * Auth: Bearer Supabase access_token, or chair PIN header.
 * action=sign  -> signed upload URLs (client PUTs the file, never the function)
 * action=commit -> upsert theater_current public URLs
 */
function cors(origin) {
  var allow = [
    'https://sonsofthunderboard.com',
    'https://www.sonsofthunderboard.com',
    'https://sonsofthunder.netlify.app'
  ];
  var o = String(origin || '');
  return {
    'Access-Control-Allow-Origin': allow.indexOf(o) >= 0 ? o : allow[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tb-chair-pin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}
function json(status, body, origin) {
  return { statusCode: status, headers: cors(origin), body: JSON.stringify(body) };
}

async function chairUser(sbUrl, anonKey, serviceKey, accessToken) {
  var userRes = await fetch(sbUrl + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + accessToken, apikey: anonKey || serviceKey }
  });
  if (!userRes.ok) return null;
  var user = await userRes.json();
  if (!user || !user.id) return null;
  var email = String(user.email || '').trim().toLowerCase();
  if (email === 'obietv@gmail.com') return user;
  var memRes = await fetch(
    sbUrl + '/rest/v1/app_members?user_id=eq.' + encodeURIComponent(user.id) + '&active=eq.true&select=role',
    { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
  );
  if (!memRes.ok) return null;
  var rows = await memRes.json();
  var role = rows && rows[0] && String(rows[0].role || '').toLowerCase();
  if (role === 'leader' || role === 'admin') return user;
  return null;
}

exports.handler = async function (event) {
  var origin = event.headers.origin || event.headers.Origin || '';
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors(origin), body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  var sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  var anonKey = process.env.SUPABASE_ANON_KEY || '';
  if (!sbUrl || !serviceKey) return json(503, { error: 'Could not put it on Home' }, origin);

  var authHeader = event.headers.authorization || event.headers.Authorization || '';
  var accessToken = authHeader.indexOf('Bearer ') === 0 ? authHeader.slice(7).trim() : '';
  var pin = String(event.headers['x-tb-chair-pin'] || event.headers['X-Tb-Chair-Pin'] || '').trim();
  var pinOk = pin === String(process.env.TB_CHAIR_PIN || '1121');
  var user = null;
  if (accessToken) user = await chairUser(sbUrl, anonKey, serviceKey, accessToken);
  if (!user && pinOk) user = { id: null };
  if (!user) return json(403, { error: 'Could not put it on Home' }, origin);

  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  var action = String(body.action || 'sign');
  var bucket = 'thunder-theater';
  var vpath = 'theater/current.mp4';
  var ppath = 'theater/current.jpg';

  if (action === 'sign') {
    var vRes = await fetch(sbUrl + '/storage/v1/object/upload/sign/' + bucket + '/' + vpath, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ upsert: true })
    });
    var vj = await vRes.json().catch(function () { return {}; });
    if (!vRes.ok || !vj.url) return json(500, { error: (vj.error || vj.message || 'upload failed') }, origin);
    var pRes = await fetch(sbUrl + '/storage/v1/object/upload/sign/' + bucket + '/' + ppath, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ upsert: true })
    });
    var pj = await pRes.json().catch(function () { return {}; });
    var abs = function (u) {
      if (!u) return '';
      if (u.indexOf('http') === 0) return u;
      return sbUrl + '/storage/v1' + (u.charAt(0) === '/' ? u : '/' + u);
    };
    return json(200, { videoUrl: abs(vj.url), posterUrl: abs(pj.url) }, origin);
  }

  if (action === 'commit') {
    var title = String(body.title || 'Welcome!').slice(0, 48);
    var pubV = sbUrl + '/storage/v1/object/public/' + bucket + '/' + vpath;
    var pubP = sbUrl + '/storage/v1/object/public/' + bucket + '/' + ppath;
    var row = [{
      id: 'current',
      url: pubV,
      poster: pubP,
      title: title,
      video_path: vpath,
      poster_path: ppath,
      updated_at: new Date().toISOString(),
      uploaded_by: user.id || null
    }];
    var wr = await fetch(sbUrl + '/rest/v1/theater_current?on_conflict=id', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(row)
    });
    if (!wr.ok) {
      var t = await wr.text();
      return json(500, { error: t.slice(0, 180) || 'row failed' }, origin);
    }
    return json(200, { ok: true, url: pubV, title: title }, origin);
  }

  return json(400, { error: 'Could not put it on Home' }, origin);
};
