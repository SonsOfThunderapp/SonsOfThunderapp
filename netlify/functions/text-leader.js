const cors = require('./_cors');

exports.handler = async function (event) {
  const headers = cors.headers(event, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const raw = String(process.env.LEADER_SMS || '').replace(/\D/g, '');
  if (raw.length < 10) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'not configured' }) };
  }
  const tel = raw.length === 11 && raw.charAt(0) === '1' ? raw : '1' + raw;
  return { statusCode: 200, headers, body: JSON.stringify({ sms: 'sms:+' + tel }) };
};
