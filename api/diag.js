/* Diagnose: loopt dezelfde route af als de browser, maar dan server-side door
   de eigen proxy heen. Zo zien we of de POST-calls aankomen. */

module.exports = async function handler(req, res) {
  const base = 'https://' + req.headers.host + '/api/store?path=';
  const steps = [];
  let cookie = '';
  let nonce = '';

  async function call(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers.Cookie = cookie;
    if (nonce) headers.Nonce = nonce;
    try {
      const r = await fetch(base + encodeURIComponent(path.replace(/^\//, '')), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const text = await r.text();
      const setCookie = r.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
      nonce = r.headers.get('nonce') || nonce;
      steps.push({
        call: method + ' ' + path,
        status: r.status,
        type: r.headers.get('content-type'),
        body: text.slice(0, 220)
      });
    } catch (err) {
      steps.push({ call: method + ' ' + path, fout: err.message });
    }
  }

  await call('GET', '/cart');
  await call('POST', '/cart/add-item', { id: 65, quantity: 1 });
  await call('POST', '/cart/update-customer', {
    billing_address: { country: 'NL', postcode: '1502 EM', city: 'Zaandam' },
    shipping_address: { country: 'NL', postcode: '1502 EM', city: 'Zaandam' }
  });
  await call('GET', '/cart');

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ base, steps });
};
