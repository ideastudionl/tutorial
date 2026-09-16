/* =============================================================
   Proxy naar de WooCommerce Store API.

   Geen dynamische route meer: het doelpad komt als querystring binnen
   (/api/store?path=cart/add-item). Vercel routeerde een tweede padsegment
   niet naar de functie, waardoor elke POST een 404 opleverde.

   Het Cart-Token blijft hier in een httpOnly-cookie en komt niet in de browser.
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
  const incoming = new URL(req.url, 'http://localhost');
  /* Het doelpad mag zijn eigen querystring meebrengen: products?per_page=100 */
  const raw = incoming.searchParams.get('path') || '';
  const cut = raw.indexOf('?');
  const path = (cut < 0 ? raw : raw.slice(0, cut))
    .split('/')
    .filter((part) => part && part !== '..')
    .join('/');
  const ownQuery = cut < 0 ? '' : raw.slice(cut + 1);

  res.setHeader('Cache-Control', 'no-store');

  if (!ALLOWED.test(path)) {
    res.status(404).json({ message: 'Onbekend pad: ' + path });
    return;
  }

  incoming.searchParams.delete('path');
  const rest = [ownQuery, incoming.searchParams.toString()].filter(Boolean).join('&');
  const token = readCookie(req.headers.cookie, TOKEN_COOKIE);

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Cart-Token'] = token;
  if (req.headers.nonce) headers.Nonce = req.headers.nonce;

  let upstream;
  try {
    upstream = await fetch(STORE + '/' + path + (rest ? '?' + rest : ''), {
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
      TOKEN_COOKIE + '=' + encodeURIComponent(fresh) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600');
  }

  const nonce = upstream.headers.get('nonce');
  if (nonce) res.setHeader('Nonce', nonce);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(upstream.status).send(await upstream.text());
};
