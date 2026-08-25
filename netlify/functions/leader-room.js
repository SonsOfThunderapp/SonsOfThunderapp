/**
 * Leader Room — RSVP / LOCKED IN pulse for Sons of Thunder leadership only.
 * GET /.netlify/functions/leader-room
 * Auth: Bearer access_token (Supabase session). Role must be leader|admin in app_members.
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
 * Never expose service role to the client.
 */
function cors() {
  return {
    'Access-Control-Allow-Origin': 'https://sonsofthunderboard.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
}
function json(status, body) {
  return { statusCode: status, headers: cors(), body: JSON.stringify(body) };
}

/** Same meeting-key shape the client uses: YYYY-MM for the next gathering month key is client-side;
 *  server returns all rsvps for recent keys and lets client filter, OR accepts ?meeting_key= */
function meetingKeyFromQuery(event) {
  const q = event.queryStringParameters || {};
  const k = String(q.meeting_key || q.key || '').trim();
  if (k && /^[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(k)) return k.slice(0, 32);
  if (k && /^[0-9]{4}-[0-9]{2}$/.test(k)) return k;
  return '';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const sbUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!sbUrl || !serviceKey) {
    return json(503, { error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required' });
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const accessToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';
    if (!accessToken) {
      return json(401, { error: 'Sign in required' });
    }

    const userRes = await fetch(sbUrl + '/auth/v1/user', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        apikey: anonKey || serviceKey
      }
    });
    if (!userRes.ok) {
      return json(401, { error: 'Invalid or expired session' });
    }
    const user = await userRes.json();
    const userId = user && user.id;
    if (!userId) {
      return json(401, { error: 'Invalid session user' });
    }

    const memRes = await fetch(
      sbUrl +
        '/rest/v1/app_members?user_id=eq.' +
        encodeURIComponent(userId) +
        '&active=eq.true&select=role',
      {
        headers: {
          apikey: serviceKey,
          Authorization: 'Bearer ' + serviceKey
        }
      }
    );
    if (!memRes.ok) {
      const t = await memRes.text();
      return json(500, { error: 'Could not verify membership', detail: t.slice(0, 200) });
    }
    const rows = await memRes.json();
    const role = rows && rows[0] && rows[0].role;
    if (role !== 'leader' && role !== 'admin') {
      return json(403, { error: 'Leaders only' });
    }

    const meetingKey = meetingKeyFromQuery(event);

    // Brothers roster
    const broRes = await fetch(
      sbUrl + '/rest/v1/brothers?select=id,name,phone,birthday,updated_at&order=name.asc',
      {
        headers: {
          apikey: serviceKey,
          Authorization: 'Bearer ' + serviceKey
        }
      }
    );
    const brothers = broRes.ok ? await broRes.json() : [];

    // RSVPs — filter by meeting_key when provided
    let rsvpUrl =
      sbUrl +
      '/rest/v1/rsvps?select=brother_id,meeting_key,in_at,showed_up,showed_at&order=in_at.desc';
    if (meetingKey) {
      rsvpUrl += '&meeting_key=eq.' + encodeURIComponent(meetingKey);
    } else {
      // last 90 days of activity if column is timestamptz-friendly; otherwise all rows (small fraternity)
      rsvpUrl += '&limit=500';
    }
    const rsvpRes = await fetch(rsvpUrl, {
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey
      }
    });
    const rsvps = rsvpRes.ok ? await rsvpRes.json() : [];

    const inByBrother = {};
    (rsvps || []).forEach(function (r) {
      if (!r || !r.brother_id) return;
      if (!meetingKey || r.meeting_key === meetingKey) {
        inByBrother[r.brother_id] = r;
      }
    });

    const people = (brothers || []).map(function (b) {
      const r = inByBrother[b.id];
      return {
        id: b.id,
        name: b.name || 'Brother',
        phone: !!(b.phone && String(b.phone).trim()),
        birthday: b.birthday || null,
        updatedAt: b.updated_at || null,
        in: !!r,
        inAt: (r && r.in_at) || null,
        showed: !!(r && r.showed_up),
        showedAt: (r && r.showed_at) || null
      };
    });

    // Sort: locked in first, then name
    people.sort(function (a, b) {
      if (a.in !== b.in) return a.in ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    });

    const lockedIn = people.filter(function (p) {
      return p.in;
    }).length;

    // Push alert subscriptions count
    let alerts = 0;
    try {
      const subRes = await fetch(
        sbUrl + '/rest/v1/push_subscriptions?select=endpoint',
        {
          headers: {
            apikey: serviceKey,
            Authorization: 'Bearer ' + serviceKey,
            Prefer: 'count=exact'
          }
        }
      );
      if (subRes.ok) {
        const range = subRes.headers.get('content-range') || '';
        const m = range.match(/\/(\d+)/);
        if (m) alerts = parseInt(m[1], 10) || 0;
        else {
          const arr = await subRes.json();
          alerts = Array.isArray(arr) ? arr.length : 0;
        }
      }
    } catch (e) {}

    const phones = people.filter(function (p) {
      return p.phone;
    }).length;

    // Recent memories (optional, light)
    let memories = [];
    try {
      const memRes2 = await fetch(
        sbUrl +
          '/rest/v1/memories?select=uploader_name,caption,created_at&order=created_at.desc&limit=8',
        {
          headers: {
            apikey: serviceKey,
            Authorization: 'Bearer ' + serviceKey
          }
        }
      );
      if (memRes2.ok) {
        const rows2 = await memRes2.json();
        memories = (rows2 || []).map(function (m) {
          return {
            name: m.uploader_name || 'Brother',
            caption: m.caption || '',
            at: m.created_at
          };
        });
      }
    } catch (e) {}

    // Birthdays this month (if column exists)
    const birthdays = [];
    (brothers || []).forEach(function (b) {
      if (b.birthday) birthdays.push({ name: b.name, birthday: b.birthday });
    });

    return json(200, {
      lockedIn: lockedIn,
      roster: people.length,
      alerts: alerts,
      phones: phones,
      people: people,
      birthdays: birthdays.slice(0, 12),
      memories: memories,
      meeting_key: meetingKey || null,
      asOf: new Date().toISOString()
    });
  } catch (e) {
    return json(500, { error: 'leader-room failed', detail: String(e && e.message ? e.message : e).slice(0, 200) });
  }
};
