/* Tijdelijke diagnose: loopt de winkelwagenketen server-side af en laat zien
   waar het misgaat. Maakt geen bestelling aan. */

const STORE = process.env.WOO_STORE_URL || 'https://www.soccer-games.nl/wp-json/wc/store/v1';

module.exports = async function handler(req, res) {
  const steps = [];
  let token = null;
  let nonce = null;

  async function call(name, path, method, body) {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) headers['Cart-Token'] = token;
    if (nonce) headers.Nonce = nonce;
    let out;
    try {
      const r = await fetch(STORE + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const text = await r.text();
      token = r.headers.get('cart-token') || token;
      nonce = r.headers.get('nonce') || nonce;
      out = {
        stap: name, status: r.status,
        nonce: r.headers.get('nonce') ? 'ja' : 'nee',
        cartToken: r.headers.get('cart-token') ? 'ja' : 'nee',
        antwoord: text.slice(0, 400)
      };
    } catch (err) {
      out = { stap: name, fout: err.message };
    }
    steps.push(out);
    return out;
  }

  await call('GET /cart', '/cart', 'GET');
  await call('POST /cart/add-item', '/cart/add-item', 'POST', { id: 65, quantity: 1 });
  await call('POST /cart/update-customer', '/cart/update-customer', 'POST', {
    billing_address: { country: 'NL', postcode: '1502 EM', city: 'Zaandam' },
    shipping_address: { country: 'NL', postcode: '1502 EM', city: 'Zaandam' }
  });

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ store: STORE, steps });
};
