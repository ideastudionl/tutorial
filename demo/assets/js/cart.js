/* Witgoed Koning — winkelwagen.
   Losse module zodat de checkout-UI niets weet van opslag. In de Shopify-
   variant vervangt cartCreate deze regels; bij WooCommerce spiegelt hij de
   servercart. Daarom staat hier alleen wat de interface nodig heeft. */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  const KEY = 'wk.cart.v1';
  const listeners = [];

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];               // privémodus of geblokkeerde opslag
    }
  }

  function write(lines) {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* niet fataal */ }
    listeners.forEach(fn => fn(lines));
  }

  const Cart = {
    lines: () => read(),

    /* Elk toestel is uniek: maximaal de voorraad van dat artikelnummer. */
    add(product, qty) {
      const lines = read();
      const hit = lines.find(l => l.id === product.id);
      const max = Math.max(1, product.stock || 1);
      if (hit) hit.qty = Math.min(max, hit.qty + (qty || 1));
      else lines.push({
        id: product.id, variantId: product.variantId || product.id, slug: product.slug,
        title: product.title, brand: product.brand, sku: product.sku, kind: product.kind,
        price: product.price, compareAt: product.compareAt, warranty: product.warranty,
        qty: Math.min(max, qty || 1), max
      });
      write(lines);
      return lines;
    },

    setQty(id, qty) {
      const lines = read();
      const hit = lines.find(l => l.id === id);
      if (!hit) return lines;
      hit.qty = Math.max(1, Math.min(hit.max || 1, qty));
      write(lines);
      return lines;
    },

    remove(id) {
      write(read().filter(l => l.id !== id));
    },

    clear() { write([]); },

    /* Extra's die geen catalogusartikel zijn (verlengde garantie, montage). */
    addService(svc) {
      const lines = read();
      if (lines.some(l => l.id === svc.id)) return lines;
      lines.push(Object.assign({ qty: 1, max: 1, service: true }, svc));
      write(lines);
      return lines;
    },

    count() { return read().reduce((n, l) => n + l.qty, 0); },

    totals() {
      const lines = read();
      const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
      const wasTotal = lines.reduce((n, l) => n + (l.compareAt || l.price) * l.qty, 0);
      return {
        subtotal,
        saving: Math.max(0, wasTotal - subtotal),
        shipping: 0,                       // bezorgen en aansluiten is inbegrepen
        removal: 0,                        // oud apparaat meenemen is inbegrepen
        total: subtotal,
        vat: subtotal - subtotal / 1.21    // btw is in de prijs verwerkt
      };
    },

    onChange(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
  };

  WK.cart = Cart;

})(window.WK);
