/* Nagebouwde Store API voor het testen van de afrekenpagina zonder de echte winkel. */
const http = require('node:http');

const unit = 2;
let quantity = 0;
let shippingChosen = false;

const cart = () => ({
  items: quantity ? [{
    key: 'abc123', id: 65, name: 'Soccer Memo', quantity,
    prices: { price: '1495', regular_price: '1995', currency_minor_unit: unit },
    totals: { line_total: String(1495 * quantity), currency_minor_unit: unit }
  }] : [],
  needs_shipping: true,
  shipping_rates: [{
    package_id: 0,
    shipping_rates: [
      { rate_id: 'flat_rate:1', name: 'PostNL brievenbuspakket', price: '395', currency_minor_unit: unit, selected: false, delivery_time: 'morgen in huis' },
      { rate_id: 'free_shipping:2', name: 'Gratis verzending', price: '0', currency_minor_unit: unit, selected: false }
    ]
  }],
  payment_methods: ['cod', 'mollie_wc_gateway_ideal', 'bacs'],
  totals: {
    total_items: String(1495 * quantity),
    total_shipping: shippingChosen ? '395' : '0',
    total_tax: String(Math.round(1495 * quantity * 0.21 / 1.21)),
    total_price: String(1495 * quantity + (shippingChosen ? 395 : 0)),
    currency_minor_unit: unit
  }
});

http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    const data = body ? JSON.parse(body) : {};
    const path = req.url.split('?')[0];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Nonce');
    res.setHeader('Access-Control-Expose-Headers', 'Nonce');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Nonce', 'testnonce');
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }

    if (path === '/cart/add-item') quantity = data.quantity;
    if (path === '/cart/update-item') quantity = data.quantity;
    if (path === '/cart/select-shipping-rate') shippingChosen = data.rate_id === 'flat_rate:1';
    if (path === '/checkout') {
      console.log('BESTELLING:', JSON.stringify(data));
      res.end(JSON.stringify({ order_id: 4242, status: 'pending',
        payment_result: { payment_status: 'success', redirect_url: 'https://www.mollie.com/checkout/test' } }));
      return;
    }
    res.end(JSON.stringify(cart()));
  });
}).listen(4199, () => console.log('mock-store luistert op 4199'));
