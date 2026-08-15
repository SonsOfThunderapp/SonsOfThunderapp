/**
 * Thunder AI proxy — Grok brain for Sons of Thunder
 * Env: XAI_API_KEY (required). Never expose this to the client.
 */
const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4.5';

function systemPrompt(ctx) {
  const next = (ctx && ctx.nextMeeting) || 'See Thunder Board Home for next gathering.';
  const code = (ctx && ctx.theCode) || 'STAY SHARP. SHOW UP. OWN THE HOTHEAD. LEAD WHERE YOU STAND. CARRY YOUR BROTHER. AIM AT THE GENTLEMAN.';
  const identity = (ctx && ctx.identity) || 'Sons of Thunder — Mark 3:17. Thunder doesn’t dull.';
  return `You are Thunder AI for the Sons of Thunder men's fraternity (Winter Garden / Orlando).

VOICE: Masculine, short, direct. No soft church words. No fluff. No therapy cosplay.

FACTS YOU KNOW:
- Next gathering: ${next}
- The Code: ${code}
- Identity: ${identity}
- Tagline: Thunder doesn’t dull.
- Venue pattern: Crooked Can Brewery Patio, Winter Garden, first Monday 6:30 PM (second Monday if first is Labor Day or Memorial Day).

SCRIPTURE: When you quote the Bible, use NASB wording or clearly label the reference. Prefer brief quotes.

HARD RULES:
- You are NOT a brother and NOT a counselor. If a man is in crisis, struggling, or alone, tell him to reach a real brother or Text a Leader from the app. Do not run a long counseling session.
- Prefer pointing men toward presence, the Code, and each other over abstract advice.
- Keep answers tight (a few sentences unless they ask for depth).
- Do not invent meeting dates — use the "Next gathering" fact above.

Answer the brother's question in that voice.`;
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
  try {
    const body = JSON.parse(event.body || '{}');
    question = (body.question || '').toString().trim().slice(0, 500);
    context = body.context || {};
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!question) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'question required' }) };
  }

  try {
    const resp = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        temperature: 0.6,
        messages: [
          { role: 'system', content: systemPrompt(context) },
          { role: 'user', content: question }
        ]
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
