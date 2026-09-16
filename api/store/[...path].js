/* =============================================================
   Proxy naar de WooCommerce Store API.

   Waarom deze tussenstap: de winkelwagen van WooCommerce hangt aan een
   Cart-Token. Dat token hoort niet in de browser thuis, dus bewaren we het
   hier in een httpOnly-cookie en sturen het server-side mee. Same-origin
   betekent bovendien geen CORS-gedoe en geen nonce die kwijtraakt.
   ============================================================= */

const STORE = process.env.WOO_STORE_URL || 'https://www.soccer-games.nl/wp-json/wc/store/v1';
const TOKEN_COOKIE = 'cart-token';
const ALLOWED = /^(cart|checkout|products)(\/|$)/;

function readCookie(header, name) {
  return (header || '').split(';')
    .map((part) => part.trim().split('='))
    .filter((pair) => pair[0] === name)
    .map((pair) => decodeURIComponent(pair.slice(1).join('=')))[0];
}

module.exports = async function handler(req, res) {
  const segments = [].concat(req.query.path || []).filter((s) => s && s !== '..');
  const path = segments.join('/');

  if (!ALLOWED.test(path)) {
    res.status(404).json({ message: 'Onbekend pad' });
    return;
  }

  const query = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
  const token = readCookie(req.headers.cookie, TOKEN_COOKIE);

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Cart-Token'] = token;
  if (req.headers.nonce) headers.Nonce = req.headers.nonce;

  let upstream;
  try {
    upstream = await fetch(STORE + '/' + path + query, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined
        : JSON.stringify(req.body === undefined ? {} : req.body)
    });
  } catch (err) {
    res.status(502).json({ message: 'De winkel is niet bereikbaar: ' + err.message });
    return;
  }

  const fresh = upstream.headers.get('cart-token');
  if (fresh && fresh !== token) {
    res.setHeader('Set-Cookie',
      `${TOKEN_COOKIE}=${encodeURIComponent(fresh)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600`);
  }

  const nonce = upstream.headers.get('nonce');
  if (nonce) res.setHeader('Nonce', nonce);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(upstream.status).send(await upstream.text());
};
