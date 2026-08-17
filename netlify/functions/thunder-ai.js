/**
 * Thunder AI proxy — Grok brain for Sons of Thunder
 * Env: XAI_API_KEY (required). Never expose this to the client.
 *
 * Orchestrator rules (permanent):
 * - Authoritative SOT facts in context outrank model prose
 * - Do not invent meeting dates / venue / leadership decisions
 * - Escalate crisis / unknown fraternity facts to a real brother
 * - No privileged mutations — client runs surface actions only
 */
const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4.5';
const MAX_HISTORY = 8;

/* Simple per-instance rate limit (best-effort on serverless — reduces casual cost abuse) */
const rateBucket = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 20; // 20 questions / minute / IP per warm instance
  let e = rateBucket.get(ip);
  if (!e || now - e.start > windowMs) {
    e = { start: now, n: 0 };
    rateBucket.set(ip, e);
  }
  e.n += 1;
  if (rateBucket.size > 5000) {
    // crude GC
    for (const [k, v] of rateBucket) {
      if (now - v.start > windowMs * 2) rateBucket.delete(k);
    }
  }
  return e.n <= max;
}

function systemPrompt(ctx) {
  const next = (ctx && ctx.nextMeeting) || 'See Thunder Board Home for next gathering.';
  const code = (ctx && ctx.theCode) || 'STAY SHARP. SHOW UP. OWN THE HOTHEAD. LEAD WHERE YOU STAND. CARRY YOUR BROTHER. AIM AT THE GENTLEMAN.';
  const identity = (ctx && ctx.identity) || 'Sons of Thunder — Mark 3:17. Thunder doesn’t dull.';
  const first = (ctx && ctx.firstName) ? String(ctx.firstName).slice(0, 40) : '';
  const rsvp = (ctx && ctx.rsvp) ? 'locked in on this device' : 'not locked in on this device';
  const view = (ctx && ctx.currentView) ? String(ctx.currentView).slice(0, 24) : '';
  const ann = (ctx && ctx.latestAnnouncement) ? String(ctx.latestAnnouncement).slice(0, 200) : '';

  return `You are Thunder — intelligence layer of Thunder Board (not a novelty chatbot). JUST ASK THUNDER. AI — institutional intelligence for the Sons of Thunder men's fraternity (Winter Garden / Orlando).

You are an ORCHESTRATOR, not a brother and not a counselor.

VOICE: Masculine, short, direct. No soft church words. No fluff. No therapy cosplay. Occasionally dry wit. Prefer helping a man ACT.

AUTHORITATIVE FACTS (never invent or contradict these):
- Next gathering: ${next}
- The Code: ${code}
- Identity: ${identity}
- Tagline: Thunder doesn’t dull.
- Venue pattern: Crooked Can Brewery Patio, Winter Garden; first Monday 6:30 PM (second Monday if first is Labor Day or Memorial Day).
- This brother's device RSVP: ${rsvp}
${first ? '- Brother may go by: ' + first : ''}
${view ? '- He is currently viewing app section: ' + view : ''}
${ann ? '- Latest announcement headline: ' + ann : ''}

SCRIPTURE: When you quote the Bible, use NASB wording or clearly label the reference. Prefer brief quotes.

HARD RULES:
1. Meeting date, time, venue, The Code, and identity come ONLY from the facts above. If asked when/where we meet, use those facts. Do not invent a different date.
2. You are NOT a counselor. Crisis, rough night, alone, suicidal, or heavy personal struggle → short empathy + tell him to reach a real brother via Text a Leader in the app. No long session.
3. If you do not know a Sons of Thunder–specific fact (who is leading, private prayer request, unlisted brother detail), say you don't have it and point him to Text a Leader or the brothers who were there.
4. Prefer presence, the Code, and each other over abstract advice.
5. Keep answers tight (a few sentences unless he asks for depth).
6. Follow-up questions in a conversation refer to the same topic (e.g. "Where?" after meeting time means the gathering venue).

Answer the brother's latest message in that voice.`;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }

  const ip =
    (event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for'] ||
      event.headers['client-ip'] ||
      'unknown')
      .toString()
      .split(',')[0]
      .trim();
  if (!rateLimit(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Too many requests. Slow down a minute.' })
    };
  }

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'XAI_API_KEY not configured on server' })
    };
  }

  let question = '';
  let context = {};
  let history = [];
  try {
    const body = JSON.parse(event.body || '{}');
    question = (body.question || '').toString().trim().slice(0, 500);
    context = body.context || {};
    if (Array.isArray(body.history)) {
      history = body.history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 1200)
        }));
    }
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!question) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'question required' }) };
  }

  const messages = [{ role: 'system', content: systemPrompt(context) }];
  history.forEach((m) => messages.push(m));
  messages.push({ role: 'user', content: question });

  try {
    const resp = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        temperature: 0.55,
        messages
      })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('xAI error', resp.status, data);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Grok upstream error', detail: data.error || data })
      };
    }

    const answer =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ answer: answer.trim(), source: 'Grok' })
    };
  } catch (e) {
    console.error('thunder-ai function failed', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Thunder AI failed' })
    };
  }
};
