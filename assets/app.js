/* =============================================================
   Soccer MeMo, prototype-gedrag
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
    memo:   { name: 'Soccer MeMo', sub: '48 kaarten · 24 paren', price: 14.95, art: 'art-box', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Soccer-Memo.jpg' },
    duo:    { name: 'Duo-pack',    sub: '2 spellen',             price: 24.95, art: 'art-fan', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Voetbal-Memory-Spel.png' },
    trio:   { name: 'Trio-pack',   sub: '3 spellen',             price: 34.95, art: 'art-fan', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Voetbal-Memory-Kopen.png' },
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
  var SHOP_AAN = false;   /* shoppagina tijdelijk uit */
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
          '<span class="line-item__media">' + (p.photo
            ? '<img src="' + p.photo + '" alt="" loading="lazy">'
            : '<svg viewBox="0 0 400 400"><use href="#' + p.art + '"></use></svg>') + '</span>' +
          '<span><b>' + p.name + '</b><small>' + p.sub + ' · aantal ' + l.qty + '</small>' +
          '<button class="remove" data-remove="' + l.id + '">Verwijderen</button></span>' +
          '<span class="line-item__price">' + euro.format(p.price * l.qty) + '</span></div>';
      }).join('');
    }

    var note = $('#handoffNote');
    if (note) {
      var lines = [];
      if (cart.some(function (l) { return l.id === 'duo' || l.id === 'trio'; })) {
        lines.push('Het bundelvoordeel bestaat nog niet in WooCommerce. Bij de kassa reken je de losse spellen af.');
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
      : 'Gelukt! Jouw bestelling wordt gratis verzonden';
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
    /* Op de kassa geen menu en geen USP-balk: minder afleiding, meer afgeronde bestellingen. */
    document.body.classList.toggle('is-checkout', route === 'afrekenen');
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
    /* De shoppagina staat tijdelijk uit: wie het adres nog heeft, komt op de
       homepagina uit. Zet SHOP_AAN op true om hem terug te zetten. */
    if (h === '/shop') {
      if (!SHOP_AAN) { location.replace('#/'); return show('home'); }
      show('shop'); setTimeout(loadShop, 0); return;
    }
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
      msgEl.textContent = 'Net niet. Onthoud waar ze lagen.';
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
    var head = document.getElementById('siteHeader');
    if (head) head.classList.toggle('is-stuck', window.scrollY > 6);
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
    say('Demo: hier komt straks de kortingscode per mail');
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
     Shop: alle producten uit de winkel
     ============================================================= */
  var shopLoaded = false;

  /* De winkel stuurt geen CORS-headers, dus lezen gaat bij voorkeur via de
     proxy. Draait die er niet (voorbeeldweergave), dan proberen we het alsnog
     rechtstreeks; dan werkt het in elk geval waar CORS wél is toegestaan. */
  function storeGet(path) {
    function grab(url) {
      return fetch(url, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }
    return grab(storeUrl(path)).catch(function () { return grab(WOO.base + path); });
  }

  function productPrice(p) {
    var unit = p.prices.currency_minor_unit;
    var range = p.prices.price_range;
    if (range && range.min_amount !== range.max_amount) {
      return 'vanaf ' + euro.format(parseInt(range.min_amount, 10) / Math.pow(10, unit));
    }
    return euro.format(parseInt(p.prices.price, 10) / Math.pow(10, unit));
  }

  function productCard(p) {
    var img = (p.images && p.images[0]) ? (p.images[0].thumbnail || p.images[0].src) : '';
    var own = p.id === WOO_IDS.memo;
    var href = own ? '#/product' : p.permalink;
    var sale = p.on_sale && p.prices.regular_price !== p.prices.price;
    var unit = p.prices.currency_minor_unit;

    return '<article class="pcard">' +
      '<a class="pcard__media" href="' + href + '"' + (own ? ' data-link' : ' target="_blank" rel="noopener"') +
        ' aria-label="Bekijk ' + p.name.replace(/"/g, '') + '">' +
        (!p.is_in_stock ? '<span class="pcard__flag pcard__flag--out">Uitverkocht</span>'
          : sale ? '<span class="pcard__flag">Aanbieding</span>' : '') +
        (img ? '<img src="' + img + '" alt="" loading="lazy">' : '') +
      '</a>' +
      '<div class="pcard__body">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="pcard__meta">' + (own ? '48 kaarten · 24 paren · 4+' : (p.type === 'variable' ? 'Meerdere varianten' : '&nbsp;')) + '</p>' +
        '<div class="pcard__foot"><span class="pcard__price">' + productPrice(p) +
          (sale ? ' <s style="font-size:.8em;color:var(--muted)">' +
            euro.format(parseInt(p.prices.regular_price, 10) / Math.pow(10, unit)) + '</s>' : '') + '</span>' +
          (own
            ? '<button class="btn btn--sm btn--primary" data-add="memo">In mandje</button>'
            : '<a class="btn btn--sm btn--ghost" href="' + p.permalink + '" target="_blank" rel="noopener">Bekijken</a>') +
        '</div>' +
      '</div></article>';
  }

  function loadShop() {
    if (shopLoaded) return;
    var grid = $('#shopGrid');
    if (!grid) return;

    storeGet('/products?per_page=100')
      .then(function (list) {
        if (!list.length) throw new Error('geen producten');
        /* Eigen spel bovenaan, daarna op prijs */
        list.sort(function (a, b) {
          if (a.id === WOO_IDS.memo) return -1;
          if (b.id === WOO_IDS.memo) return 1;
          return parseInt(a.prices.price, 10) - parseInt(b.prices.price, 10);
        });
        grid.innerHTML = list.map(productCard).join('');
        if ($('#shopCount')) $('#shopCount').textContent = list.length + ' producten';
        shopLoaded = true;
      })
      .catch(function (err) {
        grid.innerHTML = '<p class="co-hint">De winkel gaf geen producten terug (' + err.message +
          '). <a href="https://www.soccer-games.nl/winkel/" target="_blank" rel="noopener">Bekijk de winkel op soccer-games.nl</a>.</p>';
      });
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
            : amount ? 'Op voorraad: nog ' + amount + ' stuks' : 'Op voorraad');
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
      /* Nul beoordelingen in de winkel: dan laten we de beoordelingsregel weg
         in plaats van er 'nog geen beoordelingen' van te maken. Dat laatste
         praat een bezoeker juist uit de koop. */
      var ratingRow = $('#pdpRating') && $('#pdpRating').closest('.rating');
      if (ratingRow) ratingRow.hidden = true;
      $$('#reviewNoteHome, #reviewNotePdp').forEach(function (el) {
        el.textContent = 'Voorbeeldbeoordelingen, WooCommerce heeft er nog geen';
      });
    }

    var chip = $('#dataChip');
    if (chip) {
      chip.textContent = 'Live uit WooCommerce';
      chip.title = 'Prijs, voorraad, tekst en foto\'s komen rechtstreeks uit de winkel';
      chip.classList.add('is-live');
    }

    renderCart();
    paint();
  }

  storeGet('/products/' + WOO.productId)
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

  var IDEAL_LOGO = 'https://d1twnm33rljaon.cloudfront.net/iDEAL_Wero_Lockup_Yellow_Horizontal_RGB.png';
  var POSTNL_LOGO = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUUKsgpp-qaHW4ODGaZwQ-fqZGQm2nqjZBye6LhiedIQ&s=10';

  var PAYMENT_LABELS = {
    ideal: 'iDEAL', mollie_wc_gateway_ideal: 'iDEAL', pay_gateway_ideal: 'iDEAL',
    mollie_wc_gateway_bancontact: 'Bancontact', mollie_wc_gateway_creditcard: 'Creditcard',
    mollie_wc_gateway_klarnapaylater: 'Klarna achteraf betalen',
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

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Een regel uit de Store API draagt zijn eigen foto. Ontbreekt die, dan pakken
     we de catalogusfoto en anders de illustratie van de doos. */
  function lineMedia(item) {
    var img = (item.images || [])[0];
    var src = img && (img.thumbnail || img.src);
    if (!src) {
      Object.keys(WOO_IDS).forEach(function (k) {
        if (WOO_IDS[k] === item.id && CATALOG[k] && CATALOG[k].photo) src = CATALOG[k].photo;
      });
    }
    return src
      ? '<img src="' + esc(src) + '" alt="" loading="lazy">'
      : '<svg class="co-item__art" aria-hidden="true"><use href="#art-box"></use></svg>';
  }

  function lineSub(item) {
    var t = item.totals || {};
    if (t.line_subtotal != null) return parseInt(t.line_subtotal, 10);
    var reg = item.prices && item.prices.regular_price;
    if (reg) return parseInt(reg, 10) * item.quantity;
    return parseInt(t.line_total, 10);
  }

  function renderSummary() {
    var box = $('#coSummary');
    if (!box || !co.cart) return;
    var unit = co.cart.totals.currency_minor_unit;
    var codes = (co.cart.coupons || []).map(function (c) { return c.code; });
    var rows = (co.cart.items || []).map(function (i) {
      var total = parseInt(i.totals.line_total, 10);
      var was = Math.max(lineSub(i), (i.prices && i.prices.regular_price)
        ? parseInt(i.prices.regular_price, 10) * i.quantity : 0);
      var tags = total < lineSub(i)
        ? codes.map(function (c) { return '<span class="co-tag">' + esc(c) + '</span>'; }).join('')
        : '';
      return '<div class="co-item">' +
        '<span class="co-item__media">' + lineMedia(i) +
          '<span class="co-item__qty" aria-hidden="true">' + i.quantity + '</span>' +
          '<span class="sr-only">Aantal: ' + i.quantity + '</span></span>' +
        '<span class="co-item__info"><b class="co-item__name">' + esc(i.name) + '</b>' +
          (CATALOG.memo && WOO_IDS.memo === i.id ? '<small>' + esc(CATALOG.memo.sub) + '</small>' : '') +
          (tags ? '<span class="co-item__tags">' + tags + '</span>' : '') + '</span>' +
        '<span class="co-item__price">' +
          (was > total ? '<s>' + money(was, unit) + '</s>' : '') +
          '<b>' + money(total, unit) + '</b></span>' +
        '</div>';
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
    var total = money(t.total_price, unit);
    if ($('#coSubmitTotal')) $('#coSubmitTotal').textContent = total;
    if ($('#coSumTotal')) $('#coSumTotal').textContent = total;
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
      return '<label class="co-option co-option--ship" data-rate="' + r.rate_id + '" data-selected="' +
        (r.rate_id === co.rate) + '"><span class="bundle__dot" aria-hidden="true"></span>' +
        '<span><b>' + r.name + '</b>' + (r.delivery_time ? '<small>' + r.delivery_time + '</small>' : '') +
        '</span><span class="co-logo co-logo--sm"><img src="' + POSTNL_LOGO + '" alt="PostNL" loading="lazy"></span>' +
        '<span class="price">' + (parseInt(r.price, 10) === 0 ? 'gratis' : money(r.price, r.currency_minor_unit)) +
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
      var logo = /ideal/i.test(id)
        ? '<span class="co-logo"><img src="' + IDEAL_LOGO + '" alt="" loading="lazy"></span>'
        : '<span></span>';
      return '<label class="co-option" data-method="' + id + '" data-selected="' + (id === co.method) + '">' +
        '<span class="bundle__dot" aria-hidden="true"></span><span><b>' + label + '</b></span>' + logo + '</label>';
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
    /* Vast bedrag in de kop, zodat het overzicht ook dichtgeklapt iets zegt */
    if ($('#coSumTotal')) $('#coSumTotal').textContent = euro.format(cartTotal());
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
        if (!window.__STORE_PROXY__ && location.hostname.indexOf('vercel.app') < 0) {
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
        coAlert('De winkelwagen was nog niet opgehaald. We proberen het nu opnieuw.');
        startCheckout();
        return;
      }
      var required = ['#coEmail', '#coFirst', '#coLast', '#coZip', '#coNumber', '#coStreet', '#coCity'];
      var missing = required.filter(function (sel) { return !$(sel).value.trim(); });
      $$('.fld input').forEach(function (i) { i.removeAttribute('aria-invalid'); });
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

  /* ---------- Mobiel: overzicht dichtgeklapt, USP's schuiven voorbij ---------- */
  var small = window.matchMedia('(max-width: 900px)');
  var narrow = window.matchMedia('(max-width: 760px)');

  function foldSummary() {
    var box = $('#coSumBox');
    if (!box) return;
    if (small.matches) { box.removeAttribute('open'); } else { box.setAttribute('open', ''); }
  }
  foldSummary();
  if (small.addEventListener) small.addEventListener('change', foldSummary);

  /* De USP-balk schuift op elk scherm door. Daarvoor staat de rij twee keer
     zo breed als het venster en verspringt hij per halve lengte, zodat de
     lus naadloos is. De snelheid blijft gelijk: ongeveer 55 pixels per seconde. */
  var uspBase = null;
  function loopUsps() {
    var list = $('.usps ul');
    if (!list) return;
    if (!uspBase) uspBase = Array.prototype.slice.call(list.children);

    /* Meet één reeks door de kopieën eerst weg te halen: zo tellen de echte
       tussenruimtes mee, die per schermbreedte verschillen. */
    while (list.children.length > uspBase.length) list.removeChild(list.lastChild);
    var setWidth = list.scrollWidth;
    if (!setWidth) return;

    /* De rij verspringt per halve lengte. Die halve lengte moet minstens het
       venster vullen, anders valt er aan het eind van de lus een gat. */
    var sets = Math.max(2, Math.ceil((window.innerWidth * 2) / setWidth));
    if (sets % 2) sets++;

    for (var s = 1; s < sets; s++) {
      uspBase.forEach(function (li) {
        var copy = li.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        list.appendChild(copy);
      });
    }
    list.style.animationDuration = Math.round(setWidth * sets / 2 / 55) + 's';
  }
  loopUsps();
  window.addEventListener('resize', function () {
    clearTimeout(loopUsps.timer);
    loopUsps.timer = setTimeout(loopUsps, 180);
  });

  /* ---------- Header: menu op mobiel, schaduw zodra je scrollt ---------- */
  var siteHeader = $('#siteHeader'), navToggle = $('#navToggle');
  function closeNav() {
    if (!siteHeader) return;
    siteHeader.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = siteHeader.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  $$('.nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  narrow.addEventListener && narrow.addEventListener('change', closeNav);

  renderCart();
})();
