/**
 * Legacy stub — sharp-based memory enhance retired.
 * Keeps Netlify from failing if an old enhance-memory path is still referenced.
 * Do not require('sharp').
 */
exports.handler = async function () {
  return {
    statusCode: 410,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'enhance-memory retired', ok: false })
  };
};
