// Thunder Board — Thunder AI (Grok via xAI). Secret: XAI_API_KEY in Netlify env.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'POST only' }) };
  }

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'XAI_API_KEY not set on Netlify' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const question = String(body.question || body.q || '').trim();
  if (!question) {
    return { statusCode: 400, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'question required' }) };
  }

  const ctx = body.context || {};
  const system = [
    'You are Thunder AI for Sons of Thunder (Mark 3:17) — a private men\'s fraternity app.',
    'Voice: masculine, direct, no soft church-management tone. Scripture NASB only when quoting.',
    'Identity line: Thunder doesn\'t dull.',
    ctx.nextMeeting ? ('Next gathering: ' + ctx.nextMeeting) : '',
    ctx.theCode ? ('The Code: ' + ctx.theCode) : '',
    ctx.identity ? ('Identity: ' + ctx.identity) : '',
    'Keep answers tight and useful for brothers coordinating life, faith, and gatherings.'
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error || data || 'xAI error' })
      };
    }
    const answer =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      data.answer ||
      '';
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, text: answer })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: (e && e.message) || 'Thunder AI failed' })
    };
  }
};
