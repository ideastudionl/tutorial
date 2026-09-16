/* =============================================================
   Soccer MeMo — prototype-gedrag
   Alles wat hier met vaste data werkt, komt in de echte winkel
   uit de WooCommerce Store API (zie docs/headless-woocommerce.md).
   ============================================================= */
(function () {
  'use strict';

  var euro = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Catalogus (stand-in voor /wc/store/v1/products) ---------- */
  var CATALOG = {
    memo:   { name: 'Soccer MeMo',            sub: '48 kaarten · 24 paren', price: 14.95, art: 'art-box' },
    duo:    { name: 'Duo-pack',               sub: '2 spellen',             price: 24.95, art: 'art-fan' },
    trio:   { name: 'Trio-pack',              sub: '3 spellen',             price: 34.95, art: 'art-fan' },
    gift:   { name: 'Cadeauverpakking',       sub: 'Lint + kaartje',        price:  2.95, art: 'art-giftbox' },
    poster: { name: 'Poster "Elftal" A2',     sub: 'Dik papier',            price:  9.95, art: 'art-poster' }
  };
  var FREE_SHIPPING = 30;
  var cart = [];

  /* De winkel zelf. Alleen Soccer Memo (ID 65) bestaat daar vandaag; de bundels
     zijn een prijsvoorstel en de extra's zijn nog niet aangemaakt. */
  var SHOP = 'https://www.soccer-games.nl';
  var CHECKOUT_PATH = '/afrekenen/';   /* de winkel draait op Nederlandse slugs */
  var WOO_IDS = { memo: 65 };
  var GAMES_PER_LINE = { memo: 1, duo: 2, trio: 3 };

  /* ---------- Toast ---------- */
  var toast = $('#toast'), toastMsg = $('#toastMsg'), toastTimer;
  function say(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
  }

  /* ---------- Confetti ---------- */
  var cv = $('#confetti'), ctx = cv.getContext('2d'), bits = [], raf = null;
  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
    cv.style.width = window.innerWidth + 'px'; cv.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  function pop(x, y) {
    if (reduced) return;
    var colors = ['#FF5A00', '#0B6B3A', '#FFC630', '#2F6BFF', '#FFFFFF'];
    for (var i = 0; i < 70; i++) {
      bits.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 11 - 3,
        g: 0.34 + Math.random() * 0.14,
        s: 5 + Math.random() * 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0],
        life: 90 + Math.random() * 40
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    bits = bits.filter(function (b) { return b.life-- > 0 && b.y < window.innerHeight + 60; });
    bits.forEach(function (b) {
      b.x += b.vx; b.y += b.vy; b.vy += b.g; b.r += b.vr;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.66);
      ctx.restore();
    });
    raf = bits.length ? requestAnimationFrame(tick) : (ctx.clearRect(0, 0, window.innerWidth, window.innerHeight), null);
  }

  /* ---------- Winkelwagen ---------- */
  var drawer = $('#drawer'), scrim = $('#scrim'), body = $('#drawerBody');

  function cartTotal() {
    return cart.reduce(function (s, l) { return s + CATALOG[l.id].price * l.qty; }, 0);
  }
  function renderCart() {
    var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    $('#cartCount').textContent = count;

    if (!cart.length) {
      body.innerHTML = '<div class="empty-cart"><p>Je winkelwagen is nog leeg.</p>' +
        '<button class="btn btn--sm btn--pitch" data-add="memo">Soccer MeMo toevoegen</button></div>';
    } else {
      body.innerHTML = cart.map(function (l) {
        var p = CATALOG[l.id];
        return '<div class="line-item">' +
          '<span class="line-item__media"><svg viewBox="0 0 400 400"><use href="#' + p.art + '"></use></svg></span>' +
          '<span><b>' + p.name + '</b><small>' + p.sub + ' · aantal ' + l.qty + '</small>' +
          '<button class="remove" data-remove="' + l.id + '">Verwijderen</button></span>' +
          '<span class="line-item__price">' + euro.format(p.price * l.qty) + '</span></div>';
      }).join('');
    }

    var note = $('#handoffNote');
    if (note) {
      var lines = [];
      if (cart.some(function (l) { return l.id === 'duo' || l.id === 'trio'; })) {
        lines.push('Het bundelvoordeel bestaat nog niet in WooCommerce — bij de kassa reken je de losse spellen af.');
      }
      var extras = cart.filter(function (l) { return !GAMES_PER_LINE[l.id]; })
        .map(function (l) { return CATALOG[l.id].name.toLowerCase(); });
      if (extras.length) {
        lines.push(extras.join(' en ') + ' staat nog niet in de winkel en gaat niet mee.');
      }
      note.innerHTML = lines.join('<br>');
      note.hidden = lines.length === 0;
    }

    var total = cartTotal();
    $('#cartTotal').textContent = euro.format(total);
    var left = Math.max(0, FREE_SHIPPING - total);
    $('#shipMsg').textContent = left > 0
      ? 'Nog ' + euro.format(left) + ' tot gratis verzending'
      : 'Gelukt — jouw bestelling wordt gratis verzonden';
    $('#shipFill').style.width = Math.min(100, (total / FREE_SHIPPING) * 100) + '%';
  }
  function openCart() {
    drawer.classList.add('is-on'); scrim.classList.add('is-on');
    drawer.setAttribute('aria-hidden', 'false');
    $('#drawerClose').focus();
  }
  function closeCart() {
    drawer.classList.remove('is-on'); scrim.classList.remove('is-on');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function add(id, qty, origin) {
    if (!CATALOG[id]) return;
    qty = qty || 1;
    var line = cart.filter(function (l) { return l.id === id; })[0];
    if (line) { line.qty += qty; } else { cart.push({ id: id, qty: qty }); }
    renderCart();
    say(CATALOG[id].name + ' toegevoegd');
    if (origin) {
      var r = origin.getBoundingClientRect();
      pop(r.left + r.width / 2, r.top + r.height / 2);
    }
    openCart();
  }

  document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('[data-add]');
    if (addBtn) { add(addBtn.getAttribute('data-add'), 1, addBtn); return; }

    var rm = e.target.closest('[data-remove]');
    if (rm) {
      var id = rm.getAttribute('data-remove');
      cart = cart.filter(function (l) { return l.id !== id; });
      renderCart(); return;
    }
    if (e.target.closest('#cartBtn')) { openCart(); return; }
    if (e.target.closest('#drawerClose') || e.target === scrim) { closeCart(); return; }
    if (e.target.closest('#checkoutBtn')) {
      if (!cart.length) { say('Leg eerst een spel in je winkelwagen'); return; }

      var games = cart.reduce(function (n, l) { return n + (GAMES_PER_LINE[l.id] || 0) * l.qty; }, 0);
      if (!games) { say('Deze artikelen staan nog niet in de winkel'); return; }

      closeCart();
      location.hash = '#/afrekenen';
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  /* ---------- Routing (#/ en #/product) ---------- */
  var routes = $$('[data-route]');
  function show(route, scrollTo) {
    routes.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-route') === route); });
    if (scrollTo) {
      var el = document.getElementById(scrollTo);
      if (el) { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    onScroll();
  }
  function routeFromHash() {
    var h = (location.hash || '#/').slice(1);
    if (h === '' || h === '/') return show('home');
    if (h === '/product') return show('product');
    if (h === '/afrekenen') { show('afrekenen'); setTimeout(startCheckout, 0); return; }
    var el = document.getElementById(h);
    var host = el && el.closest('[data-route]');
    show(host ? host.getAttribute('data-route') : 'home', el ? h : null);
  }
  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();

  /* ---------- Memory-demo ---------- */
  var ICONS = ['card-ball', 'card-trophy', 'card-team', 'card-goal', 'card-kit', 'card-bottle'];
  var boardEl = $('#board'), msgEl = $('#boardMsg');
  var lock = false, open = [], moves = 0, pairs = 0;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function newGame() {
    lock = false; open = []; moves = 0; pairs = 0;
    $('#mvCount').textContent = '0';
    $('#prCount').textContent = '0';
    msgEl.textContent = 'Draai twee kaarten om en zoek het paar.';
    msgEl.classList.remove('is-win');
    boardEl.innerHTML = shuffle(ICONS.concat(ICONS)).map(function (ic, i) {
      return '<button class="mcard" data-ic="' + ic + '" aria-label="Kaart ' + (i + 1) + ', gesloten">' +
        '<span class="mcard__inner">' +
          '<span class="mcard__face mcard__back"><svg viewBox="0 0 100 100"><use href="#card-back"></use></svg></span>' +
          '<span class="mcard__face mcard__front"><svg viewBox="0 0 100 100"><use href="#' + ic + '"></use></svg></span>' +
        '</span></button>';
    }).join('');
    if (!reduced) {
      $$('.mcard', boardEl).forEach(function (c, i) {
        c.classList.add('is-dealt');
        c.style.animationDelay = (i * 45) + 'ms';
      });
    }
  }
  boardEl.addEventListener('click', function (e) {
    var card = e.target.closest('.mcard');
    if (!card || lock || card.classList.contains('is-open') || card.classList.contains('is-done')) return;

    card.classList.add('is-open');
    card.setAttribute('aria-label', 'Kaart open');
    open.push(card);
    if (open.length < 2) return;

    moves++;
    $('#mvCount').textContent = moves;

    if (open[0].dataset.ic === open[1].dataset.ic) {
      open.forEach(function (c) { c.classList.remove('is-open'); c.classList.add('is-done'); c.disabled = true; });
      open = []; pairs++;
      $('#prCount').textContent = pairs;
      msgEl.textContent = pairs === 6 ? '' : 'Paar gevonden! Nog ' + (6 - pairs) + ' te gaan.';
      if (pairs === 6) {
        msgEl.textContent = 'Uitgespeeld in ' + moves + ' zetten. In het echte spel liggen er 48 kaarten.';
        msgEl.classList.add('is-win');
        var r = boardEl.getBoundingClientRect();
        pop(r.left + r.width / 2, r.top + r.height / 3);
      }
    } else {
      lock = true;
      msgEl.textContent = 'Net niet — onthoud waar ze lagen.';
      setTimeout(function () {
        open.forEach(function (c) { c.classList.remove('is-open'); c.setAttribute('aria-label', 'Kaart gesloten'); });
        open = []; lock = false;
      }, reduced ? 350 : 800);
    }
  });
  $('#boardReset').addEventListener('click', newGame);
  newGame();

  /* ---------- Productpagina: galerij ---------- */
  var galWrap = $('#galMainWrap');
  $('#thumbs').addEventListener('click', function (e) {
    var t = e.target.closest('.thumb');
    if (!t) return;
    $$('.thumb').forEach(function (b) { b.setAttribute('aria-current', String(b === t)); });

    var src = t.getAttribute('data-src');
    if (src) {
      galWrap.innerHTML = '<img src="' + src + '" alt="' + (t.getAttribute('aria-label') || '') + '">';
      return;
    }
    galWrap.innerHTML = '<svg id="galMain" viewBox="0 0 400 400" role="img" aria-label="' +
      t.getAttribute('aria-label') + '"><use href="#' + t.getAttribute('data-art') + '"></use></svg>';
  });

  /* ---------- Productpagina: bundels, aantal, prijs ---------- */
  var bundle = 'memo', qty = 1;
  function currentPrice() {
    return (CATALOG[bundle].price + ($('#giftWrap').checked ? CATALOG.gift.price : 0)) * qty;
  }
  function paint() {
    var t = euro.format(currentPrice());
    $('#pdpPrice').textContent = t;
    $('#stickyPrice').textContent = t;
    $('#qtyVal').textContent = qty;
  }
  $$('.bundle').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.bundle').forEach(function (o) { o.setAttribute('data-selected', String(o === b)); });
      $('input', b).checked = true;
      bundle = b.getAttribute('data-bundle');
      paint();
    });
  });
  $('#giftWrap').addEventListener('change', paint);
  $('#qtyPlus').addEventListener('click', function () { qty = Math.min(20, qty + 1); paint(); });
  $('#qtyMinus').addEventListener('click', function () { qty = Math.max(1, qty - 1); paint(); });

  function pdpAdd(origin) {
    add(bundle, qty, origin);
    if ($('#giftWrap').checked) { add('gift', qty); }
  }
  $('#pdpAdd').addEventListener('click', function (e) { pdpAdd(e.currentTarget); });
  $('#stickyAdd').addEventListener('click', function (e) { pdpAdd(e.currentTarget); });
  paint();

  /* ---------- Sticky koopbalk ---------- */
  var stickybar = $('#stickybar'), anchor = $('#pdpAdd');
  function onScroll() {
    if (!stickybar || !anchor) return;
    var onPdp = $('[data-route="product"]').classList.contains('is-active');
    var past = anchor.getBoundingClientRect().bottom < 0;
    stickybar.classList.toggle('is-on', onPdp && past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Verzendteller tot 22:00 ---------- */
  function cutdown() {
    var now = new Date(), end = new Date(now);
    end.setHours(22, 0, 0, 0);
    var el = $('#cutoff');
    if (now >= end) { el.textContent = 'morgen voor 22:00'; return; }
    var s = Math.floor((end - now) / 1000);
    el.textContent = Math.floor(s / 3600) + ' u ' + ('0' + Math.floor((s % 3600) / 60)).slice(-2) + ' m';
  }
  cutdown();
  setInterval(cutdown, 30000);

  /* ---------- Nieuwsbrief ---------- */
  $('#newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#newsEmail');
    if (!input.value || input.value.indexOf('@') < 0) { input.focus(); say('Vul een geldig e-mailadres in'); return; }
    say('Check je mail — de code staat onderweg');
    input.value = '';
  });

  /* ---------- Scroll-reveal (pas actief als JS draait) ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); }
      else { io.observe(el); }
    });
  }

  /* ---------- Rollende bal bij de sectie-overgangen ---------- */
  if ('IntersectionObserver' in window) {
    var rails = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-rolling'); rails.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$('.ball-rail').forEach(function (el) { rails.observe(el); });
  }

  /* ---------- Cijfers die oplopen ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var fmt = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduced) { el.textContent = fmt.format(target); return; }
    var t0 = null, dur = 900;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt.format(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var nums = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); nums.unobserve(en.target); }
      });
    }, { threshold: 0.9 });
    $$('.count').forEach(function (el) { nums.observe(el); });
  }

  /* =============================================================
     Live data uit WooCommerce (Store API)
     De pagina staat volledig gevuld in de HTML; lukt de call, dan
     worden prijs, voorraad, tekst en foto's vervangen door de echte.
     ============================================================= */
  var WOO = {
    base: window.__WOO_BASE__ || 'https://www.soccer-games.nl/wp-json/wc/store/v1',
    productId: 65
  };

  function fromMinor(value, unit) {
    return parseInt(value, 10) / Math.pow(10, unit == null ? 2 : unit);
  }

  function setBundlePrice(el, now, was) {
    if (!el) return;
    el.textContent = euro.format(now);
    if (was > now) { el.insertAdjacentHTML('beforeend', '<s>' + euro.format(was) + '</s>'); }
  }

  function cleanDescription(html) {
    var box = document.createElement('div');
    box.innerHTML = html;
    var parts = [];
    $$('h1, h2, h3, p, li', box).forEach(function (node) {
      var text = (node.textContent || '').trim();
      if (!text) return;
      var tag = node.tagName.toLowerCase();
      parts.push(tag === 'p' || tag === 'li' ? '<p></p>' : '<h3></h3>');
      parts[parts.length - 1] = parts[parts.length - 1].replace('><', '>' + text + '<');
    });
    return parts.join('');
  }

  function applyProduct(p) {
    var unit = p.prices && p.prices.currency_minor_unit;
    var now = fromMinor(p.prices.price, unit);
    var was = fromMinor(p.prices.regular_price, unit);

    /* Bundelkortingen blijven het voorstel; ze rekenen mee met de echte prijs. */
    CATALOG.memo.price = now;
    CATALOG.duo.price = Math.round((now * 2 - 4.95) * 100) / 100;
    CATALOG.trio.price = Math.round((now * 3 - 9.9) * 100) / 100;

    if ($('#heroPrice')) $('#heroPrice').textContent = euro.format(now);
    if ($('#cardPrice')) $('#cardPrice').textContent = euro.format(now);
    if ($('#giftPrice')) $('#giftPrice').textContent = euro.format(now + CATALOG.gift.price);
    setBundlePrice($('#bundlePrice1'), now, was);
    setBundlePrice($('#bundlePrice2'), CATALOG.duo.price, now * 2);
    setBundlePrice($('#bundlePrice3'), CATALOG.trio.price, now * 3);
    $$('.bundle').forEach(function (b) {
      var id = b.getAttribute('data-bundle');
      if (CATALOG[id]) b.setAttribute('data-price', CATALOG[id].price.toFixed(2));
    });

    if (p.name && $('#pdpTitle')) $('#pdpTitle').textContent = p.name;

    var stock = p.stock_availability && p.stock_availability.text;
    var amount = stock && (stock.match(/\d+/) || [])[0];
    if (stock) {
      if ($('#stockLine')) {
        $('#stockLine').innerHTML = '<span class="dot-live" aria-hidden="true"></span> ' +
          (!p.is_in_stock ? 'Tijdelijk uitverkocht'
            : amount ? 'Op voorraad — nog ' + amount + ' stuks' : 'Op voorraad');
      }
    }

    if (p.description && $('#pdpDesc')) {
      var body = cleanDescription(p.description);
      if (body) $('#pdpDesc').innerHTML = body;
    }

    if (p.images && p.images.length) {
      var thumbs = $('#thumbs');
      thumbs.innerHTML = p.images.slice(0, 6).map(function (img, i) {
        var label = img.alt || img.name || ('Foto ' + (i + 1));
        return '<button class="thumb" data-src="' + img.src + '" aria-label="' + label + '"' +
          (i === 0 ? ' aria-current="true"' : '') + '><img src="' + (img.thumbnail || img.src) +
          '" alt="" loading="lazy"></button>';
      }).join('');
      galWrap.innerHTML = '<img src="' + p.images[0].src + '" alt="' +
        (p.images[0].alt || p.images[0].name || p.name) + '">';
    }

    if (p.sku && $('#pdpEyebrow')) {
      $('#pdpEyebrow').textContent = 'Voetbal-memory · SKU ' + p.sku;
    }

    if (p.review_count > 0) {
      $$('.count[data-count="212"]').forEach(function (el) {
        el.setAttribute('data-count', String(p.review_count));
        el.textContent = String(p.review_count);
      });
      if ($('#pdpRating')) {
        $('#pdpRating').innerHTML = '<b>' + String(p.average_rating).replace('.', ',') + '</b> · ' +
          p.review_count + ' beoordelingen';
      }
    } else {
      if ($('#pdpRating')) $('#pdpRating').textContent = 'Nog geen beoordelingen';
      $$('#reviewNoteHome, #reviewNotePdp').forEach(function (el) {
        el.textContent = 'Voorbeeldbeoordelingen — WooCommerce heeft er nog geen';
      });
    }

    var chip = $('#dataChip');
    if (chip) {
      chip.textContent = 'Live uit WooCommerce';
      chip.title = 'Prijs, voorraad, tekst en foto\'s komen rechtstreeks uit de winkel';
      chip.style.borderStyle = 'solid';
      chip.style.borderColor = 'var(--brand)';
      chip.style.color = 'var(--pitch)';
    }

    renderCart();
    paint();
  }

  fetch(WOO.base + '/products/' + WOO.productId, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(applyProduct)
    .catch(function (err) {
      console.info('Geen live winkeldata (' + err.message + '); de pagina toont de ingebouwde voorbeelddata.');
    });

  /* =============================================================
     Eigen afrekenpagina op de Store API
     De winkelwagen van WooCommerce draait achter /api/store, zodat het
     cart-token in een httpOnly-cookie blijft en niet in de browser.
     ============================================================= */
  /* Lokaal testen praat rechtstreeks met een nagebouwde winkel; op Vercel gaat
     alles via één proxy-functie die het doelpad als querystring krijgt. */
  function storeUrl(path) {
    if (window.__STORE_PROXY__) return window.__STORE_PROXY__ + path;
    return '/api/store?path=' + encodeURIComponent(path.replace(/^\//, ''));
  }
  var co = { nonce: null, cart: null, rate: null, method: null, methods: [], busy: false, ready: false };

  var PAYMENT_LABELS = {
    ideal: 'iDEAL', mollie_wc_gateway_ideal: 'iDEAL', pay_gateway_ideal: 'iDEAL',
    mollie_wc_gateway_bancontact: 'Bancontact', mollie_wc_gateway_creditcard: 'Creditcard',
    mollie_wc_gateway_klarnapaylater: 'Klarna — achteraf betalen',
    stripe: 'Creditcard', 'stripe_cc': 'Creditcard', ppcp_gateway: 'PayPal', paypal: 'PayPal',
    bacs: 'Bankoverschrijving', cheque: 'Op rekening', cod: 'Betalen bij levering'
  };

  function money(minor, unit) {
    return euro.format(parseInt(minor, 10) / Math.pow(10, unit == null ? 2 : unit));
  }

  function api(path, method, body) {
    var headers = { 'Content-Type': 'application/json' };
    if (co.nonce) headers.Nonce = co.nonce;
    return fetch(storeUrl(path), {
      method: method || 'GET',
      headers: headers,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      var fresh = res.headers.get('Nonce');
      if (fresh) co.nonce = fresh;
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || ('HTTP ' + res.status));
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  function coAlert(message, html) {
    var box = $('#checkoutAlert');
    if (!box) return;
    if (!message) { box.hidden = true; box.innerHTML = ''; return; }
    box.innerHTML = html ? message : message.replace(/</g, '&lt;');
    box.hidden = false;
  }

  function gamesWanted() {
    return cart.reduce(function (n, l) { return n + (GAMES_PER_LINE[l.id] || 0) * l.qty; }, 0);
  }

  function renderSummary() {
    var box = $('#coSummary');
    if (!box || !co.cart) return;
    var unit = co.cart.totals.currency_minor_unit;
    var rows = (co.cart.items || []).map(function (i) {
      return '<div class="co-line"><span>' + i.quantity + ' × ' + i.name +
        '</span><span>' + money(i.totals.line_total, unit) + '</span></div>';
    }).join('');

    var t = co.cart.totals;
    rows += '<div class="co-line"><span>Subtotaal</span><span>' + money(t.total_items, unit) + '</span></div>';

    (co.cart.coupons || []).forEach(function (c) {
      rows += '<div class="co-line co-line--discount"><span class="co-coupon-tag">' + c.code +
        ' <button type="button" data-coupon="' + c.code + '" aria-label="Kortingscode verwijderen">×</button></span>' +
        '<span>− ' + money(c.totals.total_discount, unit) + '</span></div>';
    });
    rows += '<div class="co-line"><span>Verzending</span><span>' +
      (co.rate ? money(t.total_shipping, unit) : 'nog te bepalen') + '</span></div>';
    rows += '<div class="co-line co-line--total"><span>Totaal</span><span>' + money(t.total_price, unit) + '</span></div>';
    if (parseInt(t.total_tax, 10) > 0) {
      rows += '<p class="co-vat">Inclusief ' + money(t.total_tax, unit) + ' btw</p>';
    }
    box.innerHTML = rows;
    if ($('#coSubmitTotal')) $('#coSubmitTotal').textContent = money(t.total_price, unit);
  }

  function renderShipping() {
    var box = $('#coShipping');
    if (!box || !co.cart) return;
    if (!co.cart.needs_shipping) { box.innerHTML = '<p class="co-hint">Geen verzending nodig.</p>'; return; }

    var pack = (co.cart.shipping_rates || [])[0];
    var rates = pack ? pack.shipping_rates : [];
    if (!rates.length) {
      box.innerHTML = '<p class="co-hint">Vul je postcode in, dan tonen we de bezorgopties.</p>';
      return;
    }
    if (!co.rate) {
      var chosen = rates.filter(function (r) { return r.selected; })[0] || rates[0];
      co.rate = chosen.rate_id;
    }
    box.innerHTML = rates.map(function (r) {
      return '<label class="co-option" data-rate="' + r.rate_id + '" data-selected="' +
        (r.rate_id === co.rate) + '"><span class="bundle__dot" aria-hidden="true"></span>' +
        '<span><b>' + r.name + '</b>' + (r.delivery_time ? '<small>' + r.delivery_time + '</small>' : '') +
        '</span><span class="price">' + (parseInt(r.price, 10) === 0 ? 'gratis' : money(r.price, r.currency_minor_unit)) +
        '</span></label>';
    }).join('');
  }

  function rememberCart(data) {
    co.cart = data;
    if (data && data.payment_methods && data.payment_methods.length) {
      co.methods = data.payment_methods;
    }
    return data;
  }

  function renderPayment() {
    var box = $('#coPayment');
    if (!box) return;
    var methods = co.methods.slice();
    if (!methods.length) {
      box.innerHTML = '<p class="co-hint">De winkel geeft voor dit bedrag nog geen betaalmethode terug. ' +
        'Vul je postcode in; blijft dit staan, dan staat de betaalmethode in WooCommerce uit voor dit land of bedrag.</p>';
      return;
    }
    /* iDEAL hoort in Nederland bovenaan */
    methods.sort(function (a, b) {
      var ai = /ideal/i.test(a) ? 0 : 1, bi = /ideal/i.test(b) ? 0 : 1;
      return ai - bi;
    });
    if (!co.method || methods.indexOf(co.method) < 0) co.method = methods[0];

    box.innerHTML = methods.map(function (id) {
      var label = PAYMENT_LABELS[id] || id.replace(/_/g, ' ');
      return '<label class="co-option" data-method="' + id + '" data-selected="' + (id === co.method) + '">' +
        '<span class="bundle__dot" aria-hidden="true"></span><span><b>' + label + '</b></span><span></span></label>';
    }).join('');
  }

  var lookupKey = '';

  function hint(el, message, tone) {
    if (!el) return;
    el.className = 'co-hint' + (tone ? ' co-hint--' + tone : '');
    el.textContent = message || '';
    el.hidden = !message;
  }

  function lookupAddress() {
    var box = $('#coAddressHint');
    if ($('#coCountry').value !== 'NL') { hint(box, ''); return Promise.resolve(); }

    var zip = ($('#coZip').value || '').replace(/\s+/g, '').toUpperCase();
    var nr = ($('#coNumber').value || '').trim();
    if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(zip) || !nr) { hint(box, ''); return Promise.resolve(); }

    var key = zip + '-' + nr;
    if (key === lookupKey) return Promise.resolve();
    lookupKey = key;

    hint(box, 'Adres opzoeken…');
    var url = window.__POSTCODE_URL__ || ('/api/postcode?postcode=' + zip + '&number=' + encodeURIComponent(nr));

    return fetch(url)
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.message || 'niet gevonden'); return d; }); })
      .then(function (a) {
        $('#coStreet').value = a.street;
        $('#coCity').value = a.city;
        if (a.postcode) $('#coZip').value = a.postcode;
        $$('#coStreet, #coCity').forEach(function (el) { el.removeAttribute('aria-invalid'); });
        hint(box, a.full || (a.street + ' ' + nr + ', ' + a.city), 'ok');
      })
      .catch(function (err) {
        lookupKey = '';
        hint(box, 'We konden dit adres niet vinden (' + err.message + '). Vul straat en plaats zelf in.', 'bad');
      });
  }

  function addressFromForm() {
    var number = ($('#coNumber').value || '').trim() + ($('#coAddition').value || '').trim();
    return {
      first_name: ($('#coFirst').value || '').trim(),
      last_name: ($('#coLast').value || '').trim(),
      address_1: (($('#coStreet').value || '').trim() + ' ' + number).trim(),
      city: ($('#coCity').value || '').trim(),
      postcode: ($('#coZip').value || '').trim().toUpperCase(),
      country: $('#coCountry').value,
      email: ($('#coEmail').value || '').trim(),
      phone: ($('#coPhone').value || '').trim()
    };
  }

  function refreshCustomer() {
    var a = addressFromForm();
    if (!a.postcode || !a.country) return Promise.resolve();
    return api('/cart/update-customer', 'POST', { billing_address: a, shipping_address: a })
      .then(function (data) { rememberCart(data); co.rate = null; renderShipping(); renderPayment(); renderSummary(); })
      .catch(function () { /* stil: de klant is nog aan het typen */ });
  }

  function startCheckout() {
    if (co.busy) return;
    co.busy = true;
    coAlert('');
    api('/cart')
      .then(function (data) {
        var want = gamesWanted();
        var line = (data.items || []).filter(function (i) { return i.id === WOO_IDS.memo; })[0];
        if (!want) return data;
        if (!line) return api('/cart/add-item', 'POST', { id: WOO_IDS.memo, quantity: want });
        if (line.quantity !== want) return api('/cart/update-item', 'POST', { key: line.key, quantity: want });
        return data;
      })
      .then(function (data) {
        rememberCart(data);
        co.ready = true;
        renderSummary(); renderShipping(); renderPayment();
      })
      .catch(function (err) {
        co.ready = false;
        if (location.hostname.indexOf('vercel.app') < 0) {
          coAlert('Deze afrekenpagina heeft de winkelwagen-proxy nodig en draait alleen op ' +
            '<a href="https://soccer-memo-shop.vercel.app/#/afrekenen">soccer-memo-shop.vercel.app</a>. ' +
            'Op deze voorbeeldweergave is er geen server, dus komt er een 404 terug.', true);
          return;
        }
        coAlert('De winkelwagen van de winkel reageerde niet: <b>' + String(err.message).replace(/</g, '&lt;') +
          '</b><br><button type="button" class="linkish" id="coRetry">Opnieuw proberen</button> · ' +
          '<a href="' + SHOP + CHECKOUT_PATH + '?add-to-cart=' + WOO_IDS.memo +
          '&quantity=' + Math.max(1, gamesWanted()) + '">afrekenen op soccer-games.nl</a>', true);
      })
      .then(function () { co.busy = false; });
  }

  document.addEventListener('click', function (e) {
    var rate = e.target.closest('[data-rate]');
    if (rate) {
      co.rate = rate.getAttribute('data-rate');
      $$('[data-rate]').forEach(function (o) { o.setAttribute('data-selected', String(o === rate)); });
      api('/cart/select-shipping-rate', 'POST', { package_id: 0, rate_id: co.rate })
        .then(function (data) { rememberCart(data); renderPayment(); renderSummary(); })
        .catch(function (err) { coAlert('Verzendmethode kon niet worden gekozen: ' + err.message); });
      return;
    }
    if (e.target.closest('#coRetry')) { coAlert(''); startCheckout(); return; }

    var method = e.target.closest('[data-method]');
    if (method) {
      co.method = method.getAttribute('data-method');
      $$('[data-method]').forEach(function (o) { o.setAttribute('data-selected', String(o === method)); });
    }
  });

  ['#coZip', '#coNumber'].forEach(function (sel) {
    var el = $(sel);
    if (el) {
      el.addEventListener('change', function () { lookupAddress().then(refreshCustomer); });
      el.addEventListener('blur', function () { lookupAddress().then(refreshCustomer); });
    }
  });
  if ($('#coCountry')) {
    $('#coCountry').addEventListener('change', function () { lookupKey = ''; refreshCustomer(); });
  }

  function applyCoupon() {
    var input = $('#coCoupon');
    var msg = $('#coCouponMsg');
    var code = (input.value || '').trim();
    if (!code) { input.focus(); return; }

    hint(msg, 'Code controleren…');
    api('/cart/apply-coupon', 'POST', { code: code })
      .then(function (data) {
        rememberCart(data);
        renderSummary();
        input.value = '';
        hint(msg, 'Kortingscode ' + code.toUpperCase() + ' is toegepast.', 'ok');
      })
      .catch(function (err) { hint(msg, err.message, 'bad'); });
  }

  function removeCoupon(code) {
    api('/cart/remove-coupon', 'POST', { code: code })
      .then(function (data) { rememberCart(data); renderSummary(); hint($('#coCouponMsg'), ''); })
      .catch(function (err) { hint($('#coCouponMsg'), err.message, 'bad'); });
  }

  if ($('#coCouponApply')) $('#coCouponApply').addEventListener('click', applyCoupon);
  if ($('#coCoupon')) {
    $('#coCoupon').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });
  }
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-coupon]');
    if (rm) removeCoupon(rm.getAttribute('data-coupon'));
  });

  var form = $('#checkoutForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (co.busy) return;
      coAlert('');

      if (!co.ready) {
        coAlert('De winkelwagen was nog niet opgehaald — we proberen het nu opnieuw.');
        startCheckout();
        return;
      }
      var required = ['#coEmail', '#coFirst', '#coLast', '#coZip', '#coNumber', '#coStreet', '#coCity'];
      var missing = required.filter(function (sel) { return !$(sel).value.trim(); });
      $$('.co-field input').forEach(function (i) { i.removeAttribute('aria-invalid'); });
      if (missing.length) {
        missing.forEach(function (sel) { $(sel).setAttribute('aria-invalid', 'true'); });
        $(missing[0]).focus();
        coAlert('Vul de gemarkeerde velden nog even in.');
        return;
      }
      if (!$('#coTerms').checked) { coAlert('Vink de algemene voorwaarden aan om te bestellen.'); return; }
      if (!co.method) { coAlert('Kies een betaalmethode.'); return; }

      co.busy = true;
      $('#coSubmit').disabled = true;
      var address = addressFromForm();

      api('/checkout', 'POST', {
        billing_address: address,
        shipping_address: address,
        customer_note: ($('#coNote').value || '').trim(),
        payment_method: co.method,
        extensions: {}
      }).then(function (order) {
        var result = order.payment_result || {};
        if (result.redirect_url) { window.location.href = result.redirect_url; return; }
        coAlert('Bestelling ' + order.order_id + ' is aangemaakt, maar de betaalpagina gaf geen adres terug.');
      }).catch(function (err) {
        var data = err.data || {};
        if (data.data && data.data.params) {
          Object.keys(data.data.params).forEach(function (key) {
            var el = $('#co' + key.replace('billing_address_', ''));
            if (el) el.setAttribute('aria-invalid', 'true');
          });
        }
        coAlert('Bestellen lukte niet: ' + err.message);
      }).then(function () {
        co.busy = false;
        $('#coSubmit').disabled = false;
      });
    });
  }

  /* Laadt het logobestand niet, dan verschijnt het woordmerk als terugval. */
  $$('.logo__img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.hidden = true;
      var fallback = img.parentNode.querySelector('.logo__fallback');
      if (fallback) fallback.hidden = false;
    });
  });

  var payStrip = $('#payStrip');
  if (payStrip) {
    payStrip.addEventListener('error', function () { payStrip.hidden = true; });
  }

  renderCart();
})();
