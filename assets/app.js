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
  /* units zegt hoeveel stuks van welk WooCommerce-product er in één regel
     zitten. Een lege lijst betekent: bestaat nog niet in de winkel en gaat dus
     niet mee naar de kassa. */
  /* Bundelkorting in euro's. WooCommerce kent de bundels niet: daar liggen
     gewoon twee of drie losse spellen in de winkelwagen, tegen de volle prijs.
     Zolang dat zo is staat de korting hier op 0, zodat de site nooit een bedrag
     toont dat de kassa niet rekent. Bestaat de korting straks wel in de winkel,
     als bundelproduct of als kortingscode, zet hem dan hier en zeg het erbij,
     dan koppel ik hem aan de kassa. */
  var BUNDELKORTING = { duo: 0, trio: 0 };

  var CATALOG = {
    memo:   { name: 'Soccer MeMo', sub: '48 kaarten · 24 paren', price: 14.95, art: 'art-box', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Soccer-Memo.jpg', units: [{ id: 65, per: 1 }] },
    duo:    { name: 'Duo-pack',    sub: '2 spellen',             price: 29.90, art: 'art-fan', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Voetbal-Memory-Spel.png', units: [{ id: 65, per: 2 }] },
    trio:   { name: 'Trio-pack',   sub: '3 spellen',             price: 44.85, art: 'art-fan', photo: 'https://www.soccer-games.nl/wp-content/uploads/2022/07/Voetbal-Memory-Kopen.png', units: [{ id: 65, per: 3 }] },
    gift:   { name: 'Cadeauverpakking',       sub: 'Lint + kaartje',        price:  2.95, art: 'art-giftbox', units: [] },
    poster: { name: 'Poster "Elftal" A2',     sub: 'Dik papier',            price:  9.95, art: 'art-poster', units: [] }
  };
  var FREE_SHIPPING = 30;
  var cart = [];

  /* De winkel zelf. Alleen Soccer Memo (ID 65) bestaat daar vandaag; de bundels
     zijn een prijsvoorstel en de extra's zijn nog niet aangemaakt. */
  var SHOP = 'https://www.soccer-games.nl';
  var CHECKOUT_PATH = '/afrekenen/';   /* de winkel draait op Nederlandse slugs */
  var WOO_IDS = { memo: 65 };
  var MEMO_SLUG = 'soccer-memo';
  var SHOP_AAN = false;   /* shoppagina tijdelijk uit */

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
    return cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
  }

  /* Elke regel draagt zijn eigen naam, prijs en WooCommerce-eenheden, zodat een
     regel uit de catalogus en een regel uit de winkel hetzelfde werken. */
  function lineFromCatalog(key) {
    var c = CATALOG[key];
    if (!c) return null;
    return { key: key, name: c.name, sub: c.sub, price: c.price, photo: c.photo, art: c.art,
      units: (c.units || []).map(function (u) { return { id: u.id, per: u.per }; }), qty: 0 };
  }

  function lineFromProduct(p) {
    var unit = p.prices && p.prices.currency_minor_unit;
    var img = (p.images || [])[0];
    return { key: 'p' + p.id, name: p.name, sub: p.sku ? 'Artikelnummer ' + p.sku : 'Uit de winkel',
      price: fromMinor(p.prices.price, unit), photo: img && (img.thumbnail || img.src), art: 'art-box',
      units: [{ id: p.id, per: 1 }], qty: 0 };
  }

  function orderable(line) { return (line.units || []).length > 0; }

  /* De winkelwagen stond alleen in het geheugen: wie de pagina verversde, of
     terugkwam van een mislukte betaling, was zijn mandje kwijt. Nu blijft hij
     een dag staan in de browser van de bezoeker zelf. */
  var WAGEN = 'soccer-games-winkelwagen';
  var WAGEN_DAGEN = 1;

  function bewaarWagen() {
    try {
      localStorage.setItem(WAGEN, JSON.stringify({ tijd: Date.now(), regels: cart }));
    } catch (e) { /* privémodus: dan alleen deze sessie */ }
  }

  function laadWagen() {
    try {
      var ruw = localStorage.getItem(WAGEN);
      if (!ruw) return;
      var opslag = JSON.parse(ruw);
      var oud = Date.now() - (opslag.tijd || 0) > WAGEN_DAGEN * 86400000;
      if (oud || !Array.isArray(opslag.regels)) { localStorage.removeItem(WAGEN); return; }
      cart = opslag.regels.filter(function (l) { return l && l.key && l.qty > 0; });
    } catch (e) { /* onleesbaar: dan beginnen we leeg */ }
  }
  function renderCart() {
    bewaarWagen();
    var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    $('#cartCount').textContent = count;

    if (!cart.length) {
      body.innerHTML = '<div class="empty-cart"><p>Je winkelwagen is nog leeg.</p>' +
        '<button class="btn btn--sm btn--pitch" data-add="memo">Soccer MeMo toevoegen</button></div>';
    } else {
      body.innerHTML = cart.map(function (l) {
        return '<div class="line-item">' +
          '<span class="line-item__media">' + (l.photo
            ? '<img src="' + l.photo + '" alt="" loading="lazy">'
            : '<svg viewBox="0 0 400 400"><use href="#' + (l.art || 'art-box') + '"></use></svg>') + '</span>' +
          '<span><b>' + l.name + '</b><small>' + l.sub + ' · aantal ' + l.qty + '</small>' +
          '<button class="remove" data-remove="' + l.key + '">Verwijderen</button></span>' +
          '<span class="line-item__price">' + euro.format(l.price * l.qty) + '</span></div>';
      }).join('');
    }

    var note = $('#handoffNote');
    if (note) {
      var lines = [];
      var metKorting = cart.some(function (l) { return BUNDELKORTING[l.key] > 0; });
      if (metKorting) {
        lines.push('Het bundelvoordeel bestaat nog niet in WooCommerce. Bij de kassa reken je de losse spellen af.');
      }
      var extras = cart.filter(function (l) { return !orderable(l); })
        .map(function (l) { return l.name.toLowerCase(); });
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
  /* De eerste call naar de winkel is de traagste: de serverfunctie moet opstarten
     en WooCommerce moet een winkelwagen aanmaken. Dat doen we alvast zodra de
     bezoeker zijn eerste artikel in de mand legt, dan is de afrekenpagina
     straks meteen gevuld. */
  var warmGedraaid = false;
  function warmDraaien() {
    if (warmGedraaid) return;
    warmGedraaid = true;
    api('/cart').then(function (data) { rememberCart(data); }).catch(function () { warmGedraaid = false; });
  }

  function openCart() {
    warmDraaien();
    drawer.classList.add('is-on'); scrim.classList.add('is-on');
    drawer.setAttribute('aria-hidden', 'false');
    $('#drawerClose').focus();
  }
  function closeCart() {
    drawer.classList.remove('is-on'); scrim.classList.remove('is-on');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function addLine(fresh, qty, origin) {
    if (!fresh) return;
    qty = qty || 1;
    var line = cart.filter(function (l) { return l.key === fresh.key; })[0];
    if (line) { line.qty += qty; } else { fresh.qty = qty; cart.push(fresh); }
    renderCart();
    say(fresh.name + ' toegevoegd');
    if (origin) {
      var r = origin.getBoundingClientRect();
      pop(r.left + r.width / 2, r.top + r.height / 2);
    }
    openCart();
  }

  function add(key, qty, origin) { addLine(lineFromCatalog(key), qty, origin); }
  function addProduct(p, qty, origin) { addLine(lineFromProduct(p), qty, origin); }

  document.addEventListener('click', function (e) {
    var addBtn = e.target.closest('[data-add]');
    if (addBtn) { add(addBtn.getAttribute('data-add'), 1, addBtn); return; }

    var shopBtn = e.target.closest('[data-shop-add]');
    if (shopBtn) {
      var found = shopById[shopBtn.getAttribute('data-shop-add')];
      if (found) addProduct(found, 1, shopBtn);
      return;
    }

    var rm = e.target.closest('[data-remove]');
    if (rm) {
      var key = rm.getAttribute('data-remove');
      cart = cart.filter(function (l) { return l.key !== key; });
      renderCart(); return;
    }
    if (e.target.closest('#cartBtn')) { openCart(); return; }
    if (e.target.closest('#drawerClose') || e.target === scrim) { closeCart(); return; }
    if (e.target.closest('#checkoutBtn')) {
      if (!cart.length) { say('Leg eerst een spel in je winkelwagen'); return; }

      if (!cart.some(orderable)) { say('Deze artikelen staan nog niet in de winkel'); return; }

      closeCart();
      naar('/afrekenen', '');
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  /* ---------- Routing ----------
     Op de echte site staan er gewone adressen in de balk: /product/soccer-memo
     in plaats van #/product. Google kan dan elke pagina apart indexeren. De
     server stuurt die adressen naar index.html (zie vercel.json).

     In een voorbeeldweergave schrijft geen server mee. Daar valt alles terug op
     hash-adressen, en die blijven ook op de echte site werken: oude links
     komen gewoon uit waar ze horen. */
  var PADEN = Boolean(window.__PADEN__ && window.history && window.history.pushState);
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

  /* Van intern adres naar wat er in een href hoort te staan. */
  function adres(pad, anker) {
    if (PADEN) return pad + (anker ? '#' + anker : '');
    if (anker) return '#' + anker;
    return '#' + pad;
  }

  function naar(pad, anker) {
    if (PADEN) {
      window.history.pushState({}, '', adres(pad, anker));
      teken(pad, anker);
      return;
    }
    var doel = adres(pad, anker);
    if (location.hash === doel) teken(pad, anker); else location.hash = doel;
  }

  /* Wat staat er nu in de adresbalk? */
  function huidig() {
    if (PADEN) {
      var los = (location.hash || '').replace(/^#/, '');
      /* een oud hash-adres op de nieuwe site */
      if (los.charAt(0) === '/') return { pad: los.replace(/\/+$/, '') || '/', anker: '' };
      return { pad: location.pathname.replace(/\/+$/, '') || '/', anker: los };
    }
    var h = (location.hash || '#/').slice(1) || '/';
    if (h.charAt(0) !== '/') return { pad: '/', anker: h };
    return { pad: h.replace(/\/+$/, '') || '/', anker: '' };
  }

  function teken(pad, anker) {
    if (pad === '/' && !anker) return show('home');

    if (pad === '/product' || pad.indexOf('/product/') === 0) {
      var deel = pad.indexOf('/product/') === 0 ? pad.slice(9) : '';
      show('product');
      setTimeout(function () { loadProduct(deel || WOO_IDS.memo); }, 0);
      return;
    }
    if (pad === '/afrekenen') { show('afrekenen'); setTimeout(startCheckout, 0); return; }
    if (pad === '/bedankt') { show('bedankt'); setTimeout(toonBedankt, 0); return; }
    /* De shoppagina staat tijdelijk uit: wie het adres nog heeft, komt op de
       homepagina uit. Zet SHOP_AAN op true om hem terug te zetten. */
    if (pad === '/shop') {
      if (!SHOP_AAN) {
        if (PADEN) window.history.replaceState({}, '', '/'); else location.replace('#/');
        return show('home');
      }
      show('shop'); setTimeout(loadShop, 0); return;
    }

    /* Een anker: zoek het blok op en toon de pagina waar het op staat. */
    var el = anker && document.getElementById(anker);
    var host = el && el.closest('[data-route]');
    show(host ? host.getAttribute('data-route') : 'home', el ? anker : null);
  }

  function tekenHuidig() { var nu = huidig(); teken(nu.pad, nu.anker); }

  if (PADEN) {
    /* De links in de pagina zijn als #/product geschreven; op de echte site
       maken we er gewone adressen van, zodat ze te kopiëren en te delen zijn. */
    $$('a[data-link]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#/') === 0) a.setAttribute('href', href.slice(1));
    });

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[data-link]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      e.preventDefault();
      if (href.charAt(0) === '/') { naar(href.replace(/\/+$/, '') || '/', ''); return; }
      if (href.charAt(0) === '#') {
        var anker = href.slice(1);
        var el = document.getElementById(anker);
        var host = el && el.closest('[data-route]');
        var kaart = { home: '/', product: '/product', shop: '/shop', afrekenen: '/afrekenen' };
        naar(kaart[host ? host.getAttribute('data-route') : 'home'] || '/', anker);
      }
    });
    window.addEventListener('popstate', tekenHuidig);
  }

  window.addEventListener('hashchange', tekenHuidig);
  tekenHuidig();

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
  /* pdp.eigen is waar zolang Soccer MeMo op de pagina staat: dan gelden de
     bundels, de cadeauverpakking en de spelregels. Elk ander product uit de
     winkel gebruikt dezelfde pagina zonder die blokken. */
  var pdp = { id: WOO_IDS.memo, product: null, eigen: true, kanKopen: true };
  var bundle = 'memo', qty = 1;

  function currentPrice() {
    if (!pdp.eigen) return (pdp.product ? pdp.prijs : 0) * qty;
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
    if (!pdp.eigen) {
      if (!pdp.kanKopen || !pdp.product) { say('Dit product bestel je op soccer-games.nl'); return; }
      addProduct(pdp.product, qty, origin);
      return;
    }
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
    var href = own ? adres('/product') : adres('/product/' + (p.slug || p.id));
    var sale = p.on_sale && p.prices.regular_price !== p.prices.price;
    var unit = p.prices.currency_minor_unit;
    /* Varianten en uitverkochte artikelen gaan niet rechtstreeks in de mand:
       die hebben eerst een keuze of een leverdatum nodig. */
    var direct = p.is_in_stock && p.type !== 'variable' && !(p.variations && p.variations.length);

    return '<article class="pcard">' +
      '<a class="pcard__media" href="' + href + '" data-link aria-label="Bekijk ' + esc(p.name) + '">' +
        (!p.is_in_stock ? '<span class="pcard__flag pcard__flag--out">Uitverkocht</span>'
          : sale ? '<span class="pcard__flag">Aanbieding</span>' : '') +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '') +
      '</a>' +
      '<div class="pcard__body">' +
        '<h3><a href="' + href + '" data-link>' + esc(p.name) + '</a></h3>' +
        '<p class="pcard__meta">' + (own ? '48 kaarten · 24 paren · 4+' : (p.type === 'variable' ? 'Meerdere uitvoeringen' : '&nbsp;')) + '</p>' +
        '<div class="pcard__foot"><span class="pcard__price">' + productPrice(p) +
          (sale ? ' <s style="font-size:.8em;color:var(--muted)">' +
            euro.format(parseInt(p.prices.regular_price, 10) / Math.pow(10, unit)) + '</s>' : '') + '</span>' +
          (own ? '<button class="btn btn--sm btn--primary" data-add="memo">In mandje</button>'
            : direct ? '<button class="btn btn--sm btn--primary" data-shop-add="' + p.id + '">In mandje</button>'
            : '<a class="btn btn--sm btn--ghost" href="' + href + '" data-link>Bekijken</a>') +
        '</div>' +
      '</div></article>';
  }

  var shopById = {};

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
        list.forEach(function (p) { shopById[p.id] = p; });
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

  /* Houdt alles wat over de bundels gaat gelijk aan wat de kassa rekent: de
     prijzen op de losse kaarten, de "bespaar"-vlag en de labels. Zonder korting
     verdwijnen die claims, want dan valt er niets te besparen. */
  function toonBundelvoordeel() {
    $$('[data-prijs]').forEach(function (el) {
      var sleutel = el.getAttribute('data-prijs');
      if (CATALOG[sleutel]) el.textContent = euro.format(CATALOG[sleutel].price);
    });
    $$('[data-voordeel]').forEach(function (el) {
      var korting = BUNDELKORTING[el.getAttribute('data-voordeel')] || 0;
      el.hidden = korting <= 0;
      if (korting > 0) el.textContent = 'Bespaar ' + euro.format(korting);
    });
    $$('[data-label]').forEach(function (el) {
      el.hidden = (BUNDELKORTING[el.getAttribute('data-label')] || 0) <= 0;
    });
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

    /* De bundels zijn een aantal keer hetzelfde product, dus hun prijs volgt de
       echte prijs. De korting eraf gaat alleen als hij in de winkel bestaat. */
    CATALOG.memo.price = now;
    CATALOG.duo.price = Math.round((now * 2 - BUNDELKORTING.duo) * 100) / 100;
    CATALOG.trio.price = Math.round((now * 3 - BUNDELKORTING.trio) * 100) / 100;

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
    toonBundelvoordeel();

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
      /* Nul beoordelingen in de winkel: de regel met sterren en telling blijft
         staan zoals hij in de pagina staat, als voorbeeldwaarde. De notities
         bij de beoordelingen vertellen dat het om voorbeelden gaat. */
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

  /* ---------- Eén productpagina voor de hele winkel ----------
     De opmaak in de HTML hoort bij Soccer MeMo. We bewaren die stukken één keer,
     zodat terugkeren naar het eigen spel altijd de eigen tekst teruggeeft, ook
     als er ondertussen een ander product op de pagina heeft gestaan. */
  var MEMO_VELDEN = ['#pdpEyebrow', '#pdpTitle', '#pdpLead', '#pdpDesc', '#thumbs', '#galMainWrap',
    '#stockLine', '#crumbProduct', '#pdpPrice', '#stickyName'];
  var memoHTML = null;

  function bewaarMemo() {
    if (memoHTML) return;
    memoHTML = {};
    MEMO_VELDEN.forEach(function (sel) { if ($(sel)) memoHTML[sel] = $(sel).innerHTML; });
  }

  function herstelMemo() {
    if (!memoHTML) return;
    Object.keys(memoHTML).forEach(function (sel) { if ($(sel)) $(sel).innerHTML = memoHTML[sel]; });
  }

  /* Blokken die alleen over het memoryspel gaan */
  function toonEigenBlokken(aan) {
    $$('[data-memo]').forEach(function (el) { el.hidden = !aan; });
    if ($('#bundles')) $('#bundles').hidden = !aan;
    if ($('#giftRow')) $('#giftRow').hidden = !aan;
  }

  /* Het adres draagt een id (/product/101) of een slug (/product/soccer-memo).
     Een slug zoeken we op bij de winkel; alleen het eigen spel kennen we uit
     ons hoofd, zodat de eigen pagina ook zonder winkel opent. */
  function loadProduct(sleutel) {
    if (typeof sleutel === 'string' && !/^\d+$/.test(sleutel)) {
      if (sleutel === MEMO_SLUG) return toonProduct(WOO_IDS.memo);
      return storeGet('/products?slug=' + encodeURIComponent(sleutel))
        .then(function (lijst) {
          var p = lijst && lijst[0];
          if (!p) throw new Error('niet gevonden');
          toonProduct(p.id);
        })
        .catch(function () { toonProduct(WOO_IDS.memo); });
    }
    return toonProduct(sleutel);
  }

  function toonProduct(id) {
    id = parseInt(id, 10) || WOO_IDS.memo;
    bewaarMemo();

    pdp.id = id;
    pdp.eigen = id === WOO_IDS.memo;
    pdp.kanKopen = true;
    qty = 1;
    if (pdp.eigen) { bundle = 'memo'; herstelMemo(); }
    toonEigenBlokken(pdp.eigen);
    /* Schoon beginnen: een vorig product kan de koopregel verborgen hebben
       omdat het uitverkocht was of varianten had. */
    if ($('#buyRow')) $('#buyRow').hidden = false;
    if ($('#pdpVariant')) $('#pdpVariant').hidden = true;
    /* De voorbeeldbeoordeling hoort bij het eigen spel. Een ander product laat
       alleen zijn eigen beoordelingen zien, en anders geen regel. */
    if ($('#pdpRatingRow')) $('#pdpRatingRow').hidden = !pdp.eigen;
    paint();

    storeGet('/products/' + id)
      .then(function (p) {
        pdp.product = p;
        if (pdp.eigen) { applyProduct(p); return; }
        applyGeneric(p);
      })
      .catch(function (err) {
        console.info('Geen live winkeldata (' + err.message + '); de pagina toont de ingebouwde voorbeelddata.');
        if (!pdp.eigen) {
          coProductFout('Dit product kon niet worden opgehaald uit de winkel (' + err.message + ').');
        }
      });
  }

  function coProductFout(tekst) {
    var box = $('#pdpVariant');
    if (!box) return;
    box.textContent = tekst;
    box.hidden = false;
    pdp.kanKopen = false;
    if ($('#buyRow')) $('#buyRow').hidden = true;
  }

  /* Elk ander product uit de winkel in dezelfde opmaak */
  function applyGeneric(p) {
    var unit = p.prices && p.prices.currency_minor_unit;
    pdp.prijs = fromMinor(p.prices.price, unit);
    var was = fromMinor(p.prices.regular_price, unit);

    if ($('#pdpTitle')) $('#pdpTitle').textContent = p.name;
    if ($('#crumbProduct')) $('#crumbProduct').textContent = p.name;
    if ($('#stickyName')) $('#stickyName').textContent = p.name;
    if ($('#pdpEyebrow')) $('#pdpEyebrow').textContent = p.sku ? 'Artikelnummer ' + p.sku : 'Uit onze winkel';

    if ($('#pdpRatingRow')) {
      var heeft = p.review_count > 0;
      $('#pdpRatingRow').hidden = !heeft;
      if (heeft && $('#pdpRating')) {
        $('#pdpRating').innerHTML = '<b>' + String(p.average_rating).replace('.', ',') + '</b> · ' +
          p.review_count + ' beoordelingen';
      }
    }

    if ($('#pdpLead')) {
      var kort = cleanDescription(p.short_description || '');
      $('#pdpLead').innerHTML = kort || 'Bekijk de omschrijving hieronder voor alle details.';
    }
    if ($('#pdpDesc')) {
      $('#pdpDesc').innerHTML = cleanDescription(p.description || '') ||
        '<p>De winkel geeft voor dit product nog geen omschrijving.</p>';
    }

    if ($('#stockLine')) {
      var voorraad = p.stock_availability && p.stock_availability.text;
      var aantal = voorraad && (voorraad.match(/\d+/) || [])[0];
      $('#stockLine').innerHTML = '<span class="dot-live" aria-hidden="true"></span> ' +
        (!p.is_in_stock ? 'Tijdelijk uitverkocht'
          : aantal ? 'Op voorraad: nog ' + aantal + ' stuks' : 'Op voorraad');
    }

    toonFotos(p);

    if ($('#bundlePrice1')) setBundlePrice($('#bundlePrice1'), pdp.prijs, was);

    /* Producten met varianten hebben een maat- of kleurkeuze nodig; die weigert
       de Store API zonder gekozen variant. Die verwijzen we door naar de winkel. */
    var varianten = p.type === 'variable' || (p.variations && p.variations.length);
    if (varianten || !p.is_in_stock) {
      pdp.kanKopen = false;
      if ($('#buyRow')) $('#buyRow').hidden = true;
      if ($('#pdpVariant')) {
        $('#pdpVariant').innerHTML = (varianten
          ? 'Dit product heeft meerdere uitvoeringen. Kies je variant in de winkel: '
          : 'Dit product is tijdelijk uitverkocht. Bekijk het in de winkel: ') +
          '<a href="' + p.permalink + '" target="_blank" rel="noopener">' + esc(p.name) + '</a>.';
        $('#pdpVariant').hidden = false;
      }
    } else {
      pdp.kanKopen = true;
      if ($('#buyRow')) $('#buyRow').hidden = false;
    }
    paint();
  }

  function toonFotos(p) {
    if (!p.images || !p.images.length) return;
    var thumbs = $('#thumbs');
    if (thumbs) {
      thumbs.innerHTML = p.images.slice(0, 6).map(function (img, i) {
        var label = img.alt || img.name || ('Foto ' + (i + 1));
        return '<button class="thumb" data-src="' + img.src + '" aria-label="' + esc(label) + '"' +
          (i === 0 ? ' aria-current="true"' : '') + '><img src="' + (img.thumbnail || img.src) +
          '" alt="" loading="lazy"></button>';
      }).join('');
    }
    galWrap.innerHTML = '<img src="' + p.images[0].src + '" alt="' +
      esc(p.images[0].alt || p.images[0].name || p.name) + '">';
  }

  loadProduct(WOO_IDS.memo);

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

  /* Wat de winkelwagen van WooCommerce moet bevatten: per product-id het totaal
     aantal stuks, opgeteld over alle regels. */
  function wooWanted() {
    var want = {};
    cart.forEach(function (l) {
      (l.units || []).forEach(function (u) { want[u.id] = (want[u.id] || 0) + u.per * l.qty; });
    });
    return want;
  }

  function wooCount() {
    var want = wooWanted();
    return Object.keys(want).reduce(function (n, id) { return n + want[id]; }, 0);
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
    /* Is de winkelwagen al opgehaald, toon dan meteen iets terwijl we bijwerken. */
    if (co.cart) { renderSummary(); renderShipping(); renderPayment(); }
    /* Vast bedrag in de kop, zodat het overzicht ook dichtgeklapt iets zegt */
    if ($('#coSumTotal')) $('#coSumTotal').textContent = euro.format(cartTotal());
    api('/cart')
      .then(function (data) {
        /* De winkelwagen van de winkel gelijkzetten aan die van de site: regels
           bijwerken, weghalen wat er niet meer in hoort en de rest toevoegen.
           Dat gaat na elkaar, want elke call geeft een nieuw cart-token terug. */
        var want = wooWanted();

        /* Weet deze browser van geen enkel artikel, maar heeft de winkel er nog
           wel? Dan nemen we die over in plaats van hem leeg te gooien. Dat kan
           gebeuren na een herstart of vanaf een ander tabblad. */
        if (!cart.length && (data.items || []).length) {
          cart = data.items.map(function (i) {
            var unit = i.prices && i.prices.currency_minor_unit;
            var img = (i.images || [])[0];
            return { key: 'p' + i.id, name: i.name, sub: 'Uit je winkelwagen',
              price: fromMinor(i.prices.price, unit), photo: img && (img.thumbnail || img.src),
              art: 'art-box', units: [{ id: i.id, per: 1 }], qty: i.quantity };
          });
          renderCart();
          return data;
        }

        var steps = [];

        (data.items || []).forEach(function (item) {
          var target = want[item.id] || 0;
          delete want[item.id];
          if (!target) { steps.push(function () { return api('/cart/remove-item', 'POST', { key: item.key }); }); }
          else if (item.quantity !== target) {
            steps.push(function () { return api('/cart/update-item', 'POST', { key: item.key, quantity: target }); });
          }
        });
        Object.keys(want).forEach(function (id) {
          var n = want[id];
          if (n > 0) steps.push(function () { return api('/cart/add-item', 'POST', { id: parseInt(id, 10), quantity: n }); });
        });

        return steps.reduce(function (chain, step) { return chain.then(step); }, Promise.resolve(data));
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
          '&quantity=' + Math.max(1, wooCount()) + '">afrekenen op soccer-games.nl</a>', true);
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
        bewaarBestelling(order);
        var result = order.payment_result || {};
        if (result.redirect_url) { window.location.href = result.redirect_url; return; }
        /* Geen betaalpagina nodig (bijvoorbeeld bankoverschrijving): meteen bedanken. */
        naar('/bedankt', '');
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

  /* =============================================================
     Bedankpagina
     Na het betalen stuurt Mollie de klant terug naar /bedankt?order=..&key=..
     (zie de snippet in docs/livegang.md). De status komt uit WooCommerce zelf,
     want alleen die weet of het geld binnen is. Kan de winkel de bestelling
     niet teruggeven, dan tonen we wat we bij het afrekenen zelf opsloegen.
     ============================================================= */
  var BESTELLING = 'soccer-games-laatste-bestelling';

  function bewaarBestelling(order) {
    try {
      localStorage.setItem(BESTELLING, JSON.stringify({
        id: order.order_id,
        key: order.order_key || '',
        status: order.status || '',
        totaal: order.totals && order.totals.total_price,
        unit: order.totals && order.totals.currency_minor_unit,
        regels: (order.items || []).map(function (i) {
          return { naam: i.name, aantal: i.quantity, bedrag: i.totals && i.totals.line_total };
        }),
        tijd: Date.now()
      }));
    } catch (e) { /* privémodus: dan doen we het zonder */ }
  }

  function laatsteBestelling() {
    try {
      var ruw = localStorage.getItem(BESTELLING);
      return ruw ? JSON.parse(ruw) : null;
    } catch (e) { return null; }
  }

  var STATUSSEN = {
    processing: { toon: 'gelukt', icoon: 'ic-check', titel: 'Betaling ontvangen',
      tekst: 'Je bestelling staat klaar om ingepakt te worden. De bevestiging ligt zo in je mailbox.' },
    completed: { toon: 'gelukt', icoon: 'ic-truck', titel: 'Je bestelling is onderweg',
      tekst: 'Het pakket is verzonden. Volgens PostNL ligt het meestal de volgende dag op de mat.' },
    'on-hold': { toon: 'wacht', icoon: 'ic-clock', titel: 'We wachten op je overboeking',
      tekst: 'Zodra het bedrag binnen is, pakken we je bestelling in. Je krijgt daar bericht van.' },
    pending: { toon: 'wacht', icoon: 'ic-clock', titel: 'De betaling is nog niet afgerond',
      tekst: 'Je bestelling staat klaar, alleen het geld is nog niet binnen. Je kunt het opnieuw proberen.' },
    failed: { toon: 'mis', icoon: 'ic-close', titel: 'De betaling is niet gelukt',
      tekst: 'Er is niets afgeschreven. Je bestelling staat nog klaar, dus je kunt het gewoon opnieuw proberen.' },
    cancelled: { toon: 'mis', icoon: 'ic-close', titel: 'Je hebt de betaling afgebroken',
      tekst: 'Er is niets afgeschreven. Wil je toch bestellen, dan kun je de betaling hervatten.' },
    refunded: { toon: 'wacht', icoon: 'ic-clock', titel: 'Deze bestelling is terugbetaald',
      tekst: 'Het bedrag staat binnen een paar werkdagen op je rekening.' }
  };

  var GELUKT = { processing: 1, completed: 1, 'on-hold': 1 };

  function bedanktParams() {
    var q = {};
    (location.search || '').replace(/^\?/, '').split('&').forEach(function (deel) {
      if (!deel) return;
      var los = deel.split('=');
      q[decodeURIComponent(los[0])] = decodeURIComponent((los[1] || '').replace(/\+/g, ' '));
    });
    /* In hashmodus hangt de querystring achter het adres: #/bedankt?order=12 */
    var h = (location.hash || '').split('?')[1];
    if (h) {
      h.split('&').forEach(function (deel) {
        var los = deel.split('=');
        q[decodeURIComponent(los[0])] = decodeURIComponent((los[1] || '').replace(/\+/g, ' '));
      });
    }
    return q;
  }

  function bedanktZet(toon, icoon, titel, tekst) {
    var vak = $('[data-route="bedankt"] .bedankt');
    if (vak) vak.className = 'bedankt' + (toon ? ' bedankt--' + toon : '');
    var svg = $('#bedanktIcoon use');
    if (svg) svg.setAttribute('href', '#' + icoon);
    $('#bedanktTitel').textContent = titel;
    $('#bedanktTekst').textContent = tekst;
  }

  function bedanktOverzicht(order, opslag) {
    var vak = $('#bedanktOverzicht');
    if (!vak) return;
    var unit = (order && order.totals && order.totals.currency_minor_unit);
    var regels = (order && order.items) ? order.items.map(function (i) {
      return { naam: i.name, aantal: i.quantity, bedrag: i.totals && i.totals.line_total };
    }) : (opslag ? opslag.regels : []);
    var totaal = (order && order.totals && order.totals.total_price) || (opslag && opslag.totaal);
    if (unit == null && opslag) unit = opslag.unit;

    if (!regels || !regels.length) { vak.hidden = true; return; }
    vak.innerHTML = '<h2>Wat je besteld hebt</h2>' +
      regels.map(function (r) {
        return '<div class="co-line"><span>' + r.aantal + ' × ' + esc(r.naam) + '</span><span>' +
          (r.bedrag != null ? money(r.bedrag, unit) : '') + '</span></div>';
      }).join('') +
      (totaal != null ? '<div class="co-line co-line--total"><span>Totaal</span><span>' +
        money(totaal, unit) + '</span></div>' : '');
    vak.hidden = false;
  }

  function bedanktActies(order, id, sleutel, gelukt) {
    var vak = $('#bedanktActies');
    if (!vak) return;
    var knoppen = [];
    if (!gelukt && id && sleutel) {
      knoppen.push('<a class="btn btn--primary" href="' + SHOP + CHECKOUT_PATH + 'order-pay/' + id +
        '/?pay_for_order=true&key=' + encodeURIComponent(sleutel) + '">Betaling hervatten</a>');
    }
    knoppen.push('<a class="btn btn--ghost" href="' + adres('/') + '"' + (PADEN ? ' data-link' : ' data-link') +
      '>Verder winkelen</a>');
    vak.innerHTML = knoppen.join('');
  }

  var bedanktPogingen = 0;

  function toonBedankt() {
    var q = bedanktParams();
    var opslag = laatsteBestelling();
    var id = q.order || (opslag && opslag.id);
    var sleutel = q.key || (opslag && opslag.key);

    $('#bedanktNummer').textContent = id ? 'Bestelling #' + id : 'Je bestelling';
    $('#bedanktStappen').hidden = true;

    if (!id) {
      bedanktZet('', 'ic-check', 'Bedankt voor je bestelling',
        'We hebben hier geen bestelnummer, maar je bevestiging komt per mail. Staat er niets in je inbox? Kijk even in de spam.');
      bedanktActies(null, null, null, true);
      return;
    }

    /* Vlak na het betalen staat de bestelling soms nog even op "pending", omdat
       de melding van Mollie nog binnen moet komen. Daarom kijken we een paar
       keer opnieuw voordat we zeggen dat het misging. */
    storeGet('/order/' + id + (sleutel ? '?key=' + encodeURIComponent(sleutel) : ''))
      .then(function (order) {
        var status = (order && order.status) || 'pending';
        if (status === 'pending' && bedanktPogingen < 4) {
          bedanktPogingen++;
          setTimeout(toonBedankt, 2000);
          return;
        }
        var s = STATUSSEN[status] || STATUSSEN.pending;
        var gelukt = Boolean(GELUKT[status]);
        bedanktZet(s.toon, s.icoon, s.titel, s.tekst);
        bedanktOverzicht(order, opslag);
        $('#bedanktStappen').hidden = !gelukt;
        bedanktActies(order, id, sleutel, gelukt);
        if (gelukt) leegWinkelwagen();
      })
      .catch(function () {
        /* De winkel geeft de bestelling niet terug: oudere WooCommerce, of geen
           sleutel. Dan bedanken we op basis van wat we zelf opsloegen. */
        bedanktZet('', 'ic-check', 'Bedankt voor je bestelling',
          'We hebben je bestelling ontvangen. De bevestiging met alle details komt per mail.');
        bedanktOverzicht(null, opslag);
        $('#bedanktStappen').hidden = false;
        bedanktActies(null, id, sleutel, true);
        leegWinkelwagen();
      });
  }

  function leegWinkelwagen() {
    if (!cart.length) return;
    cart = [];
    renderCart();
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

  laadWagen();
  renderCart();
})();
