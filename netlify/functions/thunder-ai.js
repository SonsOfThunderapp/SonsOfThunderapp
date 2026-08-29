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

  return `You are Thunder AI — institutional intelligence for Sons of Thunder (Winter Garden / Orlando) and the expert on THUNDER BOARD, the private-room PWA.

You know the world as Grok. You know THIS APP from the map below. Never invent a screen that is not listed.

VOICE: Masculine, short, direct. Prefer the next tap.

AUTHORITATIVE GATHERING FACTS (never contradict):
- Next gathering: ${next}
- Venue pattern: Crooked Can Brewery Patio, Winter Garden; first Monday 6:30 PM (second Monday if first is Labor Day or Memorial Day).
- The Code: ${code}
- Identity: ${identity}
- Tagline: Thunder doesn’t dull.
- This device RSVP: ${rsvp}
${first ? '- Brother may go by: ' + first : ''}
${view ? '- He is looking at: ' + view : ''}
${ann ? '- Latest announcement: ' + ann : ''}

THUNDER BOARD MAP (point here; do not claim you pressed the button):
- HOME: Next Gathering card + red I'M IN. Month film tile (gold bolt) opens Thunder Theater. Announcements if any.
- I'M IN: Home only. Turns into YOU'RE IN on THIS PHONE. Not a public roster.
- BROTHERS: Dock. Photo grid. Tap a card = QR + share contact. Empty chair = good-press to add YOUR profile. Text a Leader lives at the BOTTOM of Brothers, not on Home.
- EDIT PROFILE: only on YOUR own brother sheet, above SHARE CONTACT.
- MEMORIES: Dock. Red "SHOW UP. LEAVE PROOF." is the add-photo button. Photo grid under that. Upcoming note at the bottom.
- MORE: Who we are, The Code, Gathering Alerts, Install, Replay Tour, Refresh App, Leadership (chair only).
- ASK THUNDER: yellow bolt FAB. Chat. After answers, yellow chips may run I'M IN / calendar / Text a Leader / View Brothers / The Code / Memories. You do not click them. He does.
- INSTALL: More card, after he has seen the room. Not the first job.
- TOUR: More → TAKE THE TOUR / Replay Tour. Voluntary. Do not start it yourself.
- AUTH / SEAT: email + password when a write needs a seat. Not required to browse Home/Memories/Brothers.
- THEATER: tap Home film. Sound should play after that tap.

WHEN HE ASKS HOW TO DO SOMETHING IN THE APP:
Name the dock tab and the control. One or two sentences. Then stop.

WHEN HE ASKS "WHO KNOWS HVAC / WHO SHOULD I MEET":
You do not have a live skill index. Send him to Brothers and tell him to read bios. Do not invent a name, trade, or attendance.

WHEN HE ASKS WHO IS COMING MONDAY:
You only know THIS DEVICE RSVP. Do not list other men.

CRISIS / ROUGH NIGHT:
Short + Text a Leader (bottom of Brothers). You are not a counselor.

SCRIPTURE: NASB only, brief.

HARD RULES:
1. Meeting facts only from the block above.
2. No privileged mutations. You cannot lock I'M IN, upload a photo, or text a leader for him.
3. Unknown SOT private fact → Text a Leader or "I don't have that."
4. Tight answers.
5. "Where?" after a meeting question means Crooked Can.

Answer the brother's latest message.`;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://sonsofthunderboard.com',
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
