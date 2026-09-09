/* Witgoed Koning — datalaag.
   ===========================================================================
   De hele interface praat uitsluitend met WK.store. Welke backend daaronder
   zit bepaalt WK.CONFIG.backend: 'mock' | 'shopify' | 'woocommerce'.
   Alle drie de adapters geven exact dezelfde productvorm terug, zodat het
   omzetten van demo naar live één regel configuratie is.

   Genormaliseerd product:
     id, slug, sku, title, brand, model, cat, kind, price, compareAt,
     cond, warranty, year, rating, reviews, stock, available,
     specs {label: waarde}, highlights [string], refurb [{item,status,note}],
     images [{url, alt}]                     (leeg = illustratie als fallback)
   =========================================================================== */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  WK.CONFIG = {
    backend: 'mock',

    shopify: {
      domain: 'witgoed-koning.myshopify.com',
      storefrontToken: '',            // Storefront API access token
      apiVersion: '2025-07',
      /* Metafields in de namespace 'wk' dragen wat Shopify zelf niet kent.
         Maak ze aan onder Instellingen -> Aangepaste gegevens -> Producten. */
      metafieldNamespace: 'wk'
    },

    woocommerce: {
      baseUrl: 'https://witgoed-koning.nl',
      /* De Store API is publiek en heeft geen sleutel nodig voor lezen.
         De wk_-velden moeten wel zichtbaar gemaakt worden — zie README. */
      apiRoot: '/wp-json/wc/store/v1'
    }
  };

  /* ------------------------------------------------------------- helpers -- */

  const norm = (s) => (s || '').toString().trim();
  const toNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

  function sortList(list, sort) {
    const a = list.slice();
    switch (sort) {
      case 'price-asc':  return a.sort((x, y) => x.price - y.price);
      case 'price-desc': return a.sort((x, y) => y.price - x.price);
      case 'nieuwste':   return a.sort((x, y) => x.addedDaysAgo - y.addedDaysAgo);
      case 'korting':    return a.sort((x, y) => savingPct(y) - savingPct(x));
      default:           return a.sort((x, y) => (y.rating * y.reviews) - (x.rating * x.reviews));
    }
  }
  function savingPct(p) {
    return p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  }
  WK.savingPct = savingPct;

  function applyFilters(list, f) {
    f = f || {};
    return list.filter(p => {
      if (f.category && !WK.inCategory(p, f.category)) return false;
      if (f.brands && f.brands.length && f.brands.indexOf(p.brand) === -1) return false;
      if (f.conds && f.conds.length && f.conds.indexOf(p.cond) === -1) return false;
      if (f.minWarranty && p.warranty < f.minWarranty) return false;
      if (f.maxPrice != null && p.price > f.maxPrice) return false;
      if (f.minPrice != null && p.price < f.minPrice) return false;
      if (f.search) {
        const hay = (p.title + ' ' + p.brand + ' ' + p.model + ' ' + p.sku).toLowerCase();
        if (hay.indexOf(f.search.toLowerCase()) === -1) return false;
      }
      return true;
    });
  }

  /* ---------------------------------------------------------- mockadapter -- */

  function MockAdapter() {
    return {
      name: 'mock',
      async listCategories() { return WK.CATEGORIES; },
      async listProducts(f) {
        const list = sortList(applyFilters(WK.PRODUCTS, f), f && f.sort);
        return { items: list, total: list.length, cursor: null };
      },
      async getProduct(slug) { return WK.bySlug(slug) || null; },
      async createCheckout() { return null; }   // demo rekent lokaal af
    };
  }

  /* ------------------------------------------------------- shopifyadapter -- */

  const SHOPIFY_PRODUCT_FIELDS = `
    id handle title vendor productType availableForSale description tags
    featuredImage { url altText }
    images(first: 8) { nodes { url altText } }
    priceRange { minVariantPrice { amount } }
    compareAtPriceRange { maxVariantPrice { amount } }
    variants(first: 1) { nodes { id sku quantityAvailable availableForSale } }
    conditie:   metafield(namespace: "wk", key: "conditie") { value }
    garantie:   metafield(namespace: "wk", key: "garantie_maanden") { value }
    bouwjaar:   metafield(namespace: "wk", key: "bouwjaar") { value }
    specs:      metafield(namespace: "wk", key: "specificaties") { value }
    highlights: metafield(namespace: "wk", key: "pluspunten") { value }
    keuring:    metafield(namespace: "wk", key: "keuringsrapport") { value }
  `;

  function ShopifyAdapter(cfg) {
    const endpoint = 'https://' + cfg.domain + '/api/' + cfg.apiVersion + '/graphql.json';

    async function gql(query, variables) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': cfg.storefrontToken
        },
        body: JSON.stringify({ query, variables })
      });
      if (!res.ok) throw new Error('Shopify gaf status ' + res.status);
      const json = await res.json();
      if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
      return json.data;
    }

    /* JSON-metafields kunnen leeg of ongeldig zijn; nooit de pagina laten vallen. */
    function parseJSON(mf, fallback) {
      if (!mf || !mf.value) return fallback;
      try { return JSON.parse(mf.value); } catch (e) { return fallback; }
    }

    function map(n) {
      const v = (n.variants.nodes && n.variants.nodes[0]) || {};
      const price = toNum(n.priceRange.minVariantPrice.amount);
      const compare = toNum(n.compareAtPriceRange.maxVariantPrice.amount);
      const images = (n.images.nodes || []).map(i => ({ url: i.url, alt: i.altText || n.title }));
      return {
        id: n.id,
        variantId: v.id,
        slug: n.handle,
        sku: norm(v.sku),
        title: n.title,
        brand: norm(n.vendor),
        model: '',
        cat: slugFromType(n.productType),
        kind: kindFromType(n.productType),
        /* Outlet is in Shopify een tag, niet een producttype. */
        outlet: (n.tags || []).indexOf('outlet') > -1,
        price,
        compareAt: compare > price ? compare : 0,
        cond: norm(n.conditie && n.conditie.value) || 'Refurbished A',
        warranty: parseInt((n.garantie && n.garantie.value) || '6', 10),
        year: parseInt((n.bouwjaar && n.bouwjaar.value) || '0', 10),
        rating: 4.6, reviews: 0,          // vul uit je reviewpartner (Kiyoh/Judge.me)
        stock: v.quantityAvailable != null ? v.quantityAvailable : (n.availableForSale ? 1 : 0),
        available: !!n.availableForSale,
        specs: parseJSON(n.specs, {}),
        highlights: parseJSON(n.highlights, []),
        refurb: parseJSON(n.keuring, []),
        images,
        addedDaysAgo: 0
      };
    }

    function slugFromType(t) {
      const hit = WK.CATEGORIES.find(c => c.label.toLowerCase() === norm(t).toLowerCase());
      return hit ? hit.slug : 'overig';
    }
    function kindFromType(t) {
      const hit = WK.CATEGORIES.find(c => c.label.toLowerCase() === norm(t).toLowerCase());
      return hit ? hit.kind : 'wasmachine';
    }

    const SORT = {
      'price-asc':  { sortKey: 'PRICE', reverse: false },
      'price-desc': { sortKey: 'PRICE', reverse: true },
      'nieuwste':   { sortKey: 'CREATED_AT', reverse: true },
      'korting':    { sortKey: 'BEST_SELLING', reverse: false },
      'relevantie': { sortKey: 'BEST_SELLING', reverse: false }
    };

    return {
      name: 'shopify',

      async listCategories() { return WK.CATEGORIES; },

      async listProducts(f) {
        f = f || {};
        const terms = [];
        if (f.category === 'outlet') {
          terms.push('tag:outlet');
        } else if (f.category) {
          const c = WK.CATEGORIES.find(x => x.slug === f.category);
          if (c) terms.push('product_type:"' + c.label + '"');
        }
        if (f.brands && f.brands.length) {
          terms.push('(' + f.brands.map(b => 'vendor:"' + b + '"').join(' OR ') + ')');
        }
        if (f.minPrice != null || f.maxPrice != null) {
          terms.push('variants.price:>=' + (f.minPrice || 0) +
                     (f.maxPrice != null ? ' variants.price:<=' + f.maxPrice : ''));
        }
        if (f.search) terms.push(f.search);

        const s = SORT[f.sort] || SORT.relevantie;
        const data = await gql(
          'query P($first:Int!,$q:String,$k:ProductSortKeys,$r:Boolean,$after:String){' +
          ' products(first:$first, query:$q, sortKey:$k, reverse:$r, after:$after){' +
          '  pageInfo{ hasNextPage endCursor } nodes{' + SHOPIFY_PRODUCT_FIELDS + '} } }',
          { first: f.limit || 48, q: terms.join(' ') || null, k: s.sortKey, r: s.reverse, after: f.cursor || null }
        );
        const items = data.products.nodes.map(map);
        return {
          items,
          total: items.length,
          cursor: data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
        };
      },

      async getProduct(handle) {
        const data = await gql(
          'query P($h:String!){ product(handle:$h){' + SHOPIFY_PRODUCT_FIELDS + '} }',
          { h: handle }
        );
        return data.product ? map(data.product) : null;
      },

      /* Levert de Shopify-checkout-URL op. De demo-checkout in deze build is
         alleen een ontwerp; live neemt Shopify het hier over. */
      async createCheckout(lines) {
        const data = await gql(
          'mutation C($lines:[CartLineInput!]!){ cartCreate(input:{lines:$lines}){' +
          ' cart{ checkoutUrl } userErrors{ message } } }',
          { lines: lines.map(l => ({ merchandiseId: l.variantId, quantity: l.qty })) }
        );
        const r = data.cartCreate;
        if (r.userErrors && r.userErrors.length) throw new Error(r.userErrors[0].message);
        return { url: r.cart.checkoutUrl };
      }
    };
  }

  /* --------------------------------------------------- woocommerceadapter -- */

  function WooAdapter(cfg) {
    const root = cfg.baseUrl.replace(/\/$/, '') + cfg.apiRoot;

    async function get(path, params) {
      const url = new URL(root + path);
      Object.keys(params || {}).forEach(k => {
        if (params[k] != null && params[k] !== '') url.searchParams.set(k, params[k]);
      });
      const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('WooCommerce gaf status ' + res.status);
      return { body: await res.json(), total: parseInt(res.headers.get('X-WP-Total') || '0', 10) };
    }

    /* De Store API geeft prijzen als string in de kleinste eenheid. */
    function money(prices, key) {
      if (!prices || !prices[key]) return 0;
      const minor = prices.currency_minor_unit == null ? 2 : prices.currency_minor_unit;
      return toNum(prices[key]) / Math.pow(10, minor);
    }

    /* wk_-velden komen mee via de extensions-sleutel. Zie README voor het
       mu-plugin snippet dat ze registreert; zonder dat blijft de fallback staan. */
    function ext(p) { return (p.extensions && p.extensions.wk) || {}; }

    function attr(p, name) {
      const a = (p.attributes || []).find(x => norm(x.name).toLowerCase() === name);
      return a && a.terms && a.terms.length ? a.terms.map(t => t.name).join(', ') : '';
    }

    function map(p) {
      const e = ext(p);
      const cat = (p.categories && p.categories[0]) || {};
      const price = money(p.prices, 'price');
      const regular = money(p.prices, 'regular_price');
      const known = WK.CATEGORIES.find(c => c.slug === cat.slug);
      return {
        id: p.id,
        variantId: p.id,
        slug: p.slug,
        sku: norm(p.sku),
        title: p.name,
        brand: e.merk || attr(p, 'merk') || '',
        model: e.model || attr(p, 'model') || '',
        cat: known ? known.slug : 'wasmachines',
        kind: known ? known.kind : 'wasmachine',
        /* In WooCommerce is outlet een extra productcategorie naast de hoofdcategorie. */
        outlet: (p.categories || []).some(c => c.slug === 'outlet'),
        price,
        compareAt: regular > price ? regular : 0,
        cond: e.conditie || attr(p, 'conditie') || 'Refurbished A',
        warranty: parseInt(e.garantie_maanden || attr(p, 'garantie') || '6', 10),
        year: parseInt(e.bouwjaar || '0', 10),
        rating: toNum(p.average_rating) || 4.6,
        reviews: p.review_count || 0,
        stock: p.stock_availability && p.is_in_stock === false ? 0 : (p.stock_quantity != null ? p.stock_quantity : 1),
        available: p.is_in_stock !== false,
        specs: e.specificaties || {},
        highlights: e.pluspunten || [],
        refurb: e.keuringsrapport || [],
        images: (p.images || []).map(i => ({ url: i.src, alt: i.alt || p.name })),
        addedDaysAgo: 0
      };
    }

    const ORDER = {
      'price-asc':  { orderby: 'price', order: 'asc' },
      'price-desc': { orderby: 'price', order: 'desc' },
      'nieuwste':   { orderby: 'date',  order: 'desc' },
      'korting':    { orderby: 'popularity', order: 'desc' },
      'relevantie': { orderby: 'popularity', order: 'desc' }
    };

    return {
      name: 'woocommerce',

      async listCategories() {
        const { body } = await get('/products/categories', { per_page: 50 });
        return body
          .filter(c => c.count > 0)
          .map(c => {
            const known = WK.CATEGORIES.find(x => x.slug === c.slug);
            return { slug: c.slug, label: c.name, kind: known ? known.kind : 'wasmachine', blurb: c.description || '' };
          });
      },

      async listProducts(f) {
        f = f || {};
        const o = ORDER[f.sort] || ORDER.relevantie;
        const { body, total } = await get('/products', {
          category: f.category || '',
          search: f.search || '',
          min_price: f.minPrice != null ? f.minPrice * 100 : '',
          max_price: f.maxPrice != null ? f.maxPrice * 100 : '',
          per_page: f.limit || 48,
          page: f.page || 1,
          orderby: o.orderby,
          order: o.order
        });
        let items = body.map(map);
        /* Merk en conditie zitten niet in de Store API-query, dus lokaal filteren. */
        if (f.brands && f.brands.length) items = items.filter(p => f.brands.indexOf(p.brand) > -1);
        if (f.conds && f.conds.length) items = items.filter(p => f.conds.indexOf(p.cond) > -1);
        if (f.minWarranty) items = items.filter(p => p.warranty >= f.minWarranty);
        return { items, total: total || items.length, cursor: null };
      },

      async getProduct(slug) {
        const { body } = await get('/products', { slug });
        return body && body.length ? map(body[0]) : null;
      },

      /* Woo rekent af op de eigen /checkout-pagina. We vullen de servercart
         en sturen door; de Nonce komt uit de cart-respons. */
      async createCheckout(lines) {
        const cartRes = await fetch(root + '/cart', { credentials: 'include' });
        const nonce = cartRes.headers.get('Nonce') || cartRes.headers.get('X-WC-Store-API-Nonce');
        for (const l of lines) {
          await fetch(root + '/cart/add-item', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Nonce: nonce },
            body: JSON.stringify({ id: l.variantId, quantity: l.qty })
          });
        }
        return { url: cfg.baseUrl.replace(/\/$/, '') + '/afrekenen/' };
      }
    };
  }

  /* --------------------------------------------------------------- fabriek -- */

  WK.createStore = function (cfg) {
    switch (cfg.backend) {
      case 'shopify':
        if (!cfg.shopify.storefrontToken) {
          console.warn('[WK] Geen Storefront-token ingesteld — terug naar demodata.');
          return MockAdapter();
        }
        return ShopifyAdapter(cfg.shopify);
      case 'woocommerce':
        return WooAdapter(cfg.woocommerce);
      default:
        return MockAdapter();
    }
  };

  WK.store = WK.createStore(WK.CONFIG);

})(window.WK);
