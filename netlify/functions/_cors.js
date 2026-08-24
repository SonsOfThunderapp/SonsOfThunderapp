const ALLOWED = {
  'https://sonsofthunderboard.com': 1,
  'https://www.sonsofthunderboard.com': 1,
  'https://sonsofthunder.netlify.app': 1
};

function origin(event) {
  const o = String((event && event.headers && (event.headers.origin || event.headers.Origin)) || '');
  if (ALLOWED[o]) return o;
  return 'https://sonsofthunderboard.com';
}

function headers(event, extra) {
  return Object.assign({
    'Access-Control-Allow-Origin': origin(event),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  }, extra || {});
}

module.exports = { origin, headers };
