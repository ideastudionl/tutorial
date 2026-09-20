/* Nagebouwde Store API voor het testen van de product- en afrekenpagina zonder
   de echte winkel. Houdt een winkelwagen bij per product-id, zodat we kunnen
   nagaan of de site de winkelwagen van de winkel goed gelijkzet. */
const http = require('node:http');

const unit = 2;
let shippingChosen = false;
let coupons = [];
let items = [];          /* { key, id, quantity } */
let nextKey = 1;

const discount = () => (coupons.length ? 250 : 0);

const CATALOGUS = {
  65: {
    id: 65, name: 'Soccer Memo', sku: 'SM-48', type: 'simple', permalink: 'https://www.soccer-games.nl/product/soccer-memo/',
    prices: { price: '1495', regular_price: '1995', currency_minor_unit: unit },
    images: [{ id: 1, src: 'https://www.soccer-games.nl/foto-memo.jpg', thumbnail: 'https://www.soccer-games.nl/foto-memo.jpg', alt: 'Soccer Memo' }],
    short_description: '<p>48 kaarten met 24 voetbalillustraties.</p>',
    description: '<p>Het voetbalmemoryspel van Soccer Games.</p>',
    stock_availability: { text: 'Op voorraad, nog 39 stuks' }, is_in_stock: true,
    review_count: 0, average_rating: '0'
  },
  101: {
    id: 101, name: 'Voetbalpuzzel stadions', sku: 'PZ-500', type: 'simple', permalink: 'https://www.soccer-games.nl/product/puzzel/',
    prices: { price: '2450', regular_price: '2450', currency_minor_unit: unit },
    images: [{ id: 2, src: 'https://www.soccer-games.nl/foto-puzzel.jpg', thumbnail: 'https://www.soccer-games.nl/foto-puzzel.jpg', alt: 'Puzzel' }],
    short_description: '<p>500 stukjes met de mooiste stadions.</p>',
    description: '<p>Een puzzel van 500 stukjes.</p><p>Geschikt vanaf 8 jaar.</p>',
    stock_availability: { text: 'Op voorraad, nog 7 stuks' }, is_in_stock: true,
    review_count: 0, average_rating: '0'
  },
  102: {
    id: 102, name: 'Voetbalshirt junior', sku: 'SH-01', type: 'variable', permalink: 'https://www.soccer-games.nl/product/shirt/',
    variations: [{ id: 1021 }, { id: 1022 }],
    prices: { price: '1995', regular_price: '2495', currency_minor_unit: unit, price_range: { min_amount: '1995', max_amount: '2495' } },
    images: [{ id: 3, src: 'https://www.soccer-games.nl/foto-shirt.jpg', thumbnail: 'https://www.soccer-games.nl/foto-shirt.jpg', alt: 'Shirt' }],
    short_description: '<p>In vier maten.</p>', description: '<p>Ademend sportshirt.</p>',
    stock_availability: { text: 'Op voorraad' }, is_in_stock: true, on_sale: true,
    review_count: 0, average_rating: '0'
  },
  103: {
    id: 103, name: 'Doelnet 3 meter', sku: 'DN-3', type: 'simple', permalink: 'https://www.soccer-games.nl/product/doelnet/',
    prices: { price: '3995', regular_price: '3995', currency_minor_unit: unit },
    images: [], short_description: '', description: '',
    stock_availability: { text: 'Uitverkocht' }, is_in_stock: false,
    review_count: 0, average_rating: '0'
  }
};

const lineTotals = (id, quantity) => {
  const price = parseInt(CATALOGUS[id].prices.price, 10);
  return {
    line_subtotal: String(price * quantity),
    line_total: String(price * quantity - (id === 65 ? discount() : 0)),
    currency_minor_unit: unit
  };
};

const cart = () => {
  const totalItems = items.reduce((s, i) => s + parseInt(CATALOGUS[i.id].prices.price, 10) * i.quantity, 0);
  return {
    items: items.map((i) => ({
      key: i.key, id: i.id, name: CATALOGUS[i.id].name, quantity: i.quantity,
      images: CATALOGUS[i.id].images,
      prices: CATALOGUS[i.id].prices,
      totals: lineTotals(i.id, i.quantity)
    })),
    needs_shipping: true,
    shipping_rates: [{
      package_id: 0,
      shipping_rates: [
        { rate_id: 'flat_rate:1', name: 'PostNL brievenbuspakket', price: '395', currency_minor_unit: unit, selected: false, delivery_time: 'morgen in huis' },
        { rate_id: 'free_shipping:2', name: 'Gratis verzending', price: '0', currency_minor_unit: unit, selected: false }
      ]
    }],
    coupons: coupons.map((code) => ({ code, totals: { total_discount: '250', currency_minor_unit: unit } })),
    payment_methods: ['cod', 'mollie_wc_gateway_ideal', 'bacs'],
    totals: {
      total_items: String(totalItems),
      total_shipping: shippingChosen ? '395' : '0',
      total_tax: String(Math.round(totalItems * 0.21 / 1.21)),
      total_discount: String(discount()),
      total_price: String(totalItems + (shippingChosen ? 395 : 0) - discount()),
      currency_minor_unit: unit
    }
  };
};

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

    if (path === '/products') {
      const slug = new URL(req.url, 'http://x').searchParams.get('slug');
      const alles = Object.values(CATALOGUS);
      /* de winkel geeft een slug mee; hier leiden we hem af van de naam */
      const bijSlug = (p) => p.name.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
      res.end(JSON.stringify(slug ? alles.filter((p) => bijSlug(p) === slug.split('-')[0]) : alles));
      return;
    }
    if (path.startsWith('/products/')) {
      const found = CATALOGUS[path.split('/')[2]];
      if (!found) { res.writeHead(404).end(JSON.stringify({ message: 'Onbekend product' })); return; }
      res.end(JSON.stringify(found));
      return;
    }
    if (path === '/reset') { items = []; coupons = []; shippingChosen = false; res.end('{}'); return; }

    if (path === '/cart/add-item') {
      const line = items.find((i) => i.id === data.id);
      if (line) line.quantity += data.quantity;
      else items.push({ key: 'k' + nextKey++, id: data.id, quantity: data.quantity });
    }
    if (path === '/cart/update-item') {
      const line = items.find((i) => i.key === data.key);
      if (line) line.quantity = data.quantity;
    }
    if (path === '/cart/remove-item') items = items.filter((i) => i.key !== data.key);
    if (path === '/cart/select-shipping-rate') shippingChosen = data.rate_id === 'flat_rate:1';
    if (path === '/cart/apply-coupon') {
      if (String(data.code).toUpperCase() !== 'TEAM10') {
        res.writeHead(400).end(JSON.stringify({ message: 'Kortingscode TEAM10 bestaat niet' }));
        return;
      }
      coupons = ['TEAM10'];
    }
    if (path === '/cart/remove-coupon') coupons = [];
    if (path === '/checkout') {
      console.log('BESTELLING:', JSON.stringify(data));
      res.end(JSON.stringify({ order_id: 4242, status: 'pending',
        payment_result: { payment_status: 'success', redirect_url: 'https://www.mollie.com/checkout/test' } }));
      return;
    }
    res.end(JSON.stringify(cart()));
  });
}).listen(4199, () => console.log('mock-store luistert op 4199'));
