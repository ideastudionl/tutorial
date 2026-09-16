/* ============================================================
   LERMODE — demo interacties
   ============================================================ */
(function () {
  'use strict';

  /* ── Catalogus ───────────────────────────────────────────
     img / imgBack verwijzen naar assets/img/<naam>.jpg.
     Ontbreekt het bestand, dan blijft de editorial placeholder staan. */
  var PRODUCTS = [
    { id:'p1', name:'Zijden blouse Céleste', cat:'kleding', catLabel:'Blouses', price:189, img:'product-1', back:'product-1b',
      badge:'Nieuw', tones:['#EFE6DC','#2A2622','#B9A08C'], ph:['#efe5d9','#a08b76','#3a322a'] },
    { id:'p2', name:'Kasjmier trui Luna', cat:'knitwear', catLabel:'Knitwear', price:245, img:'product-2', back:'product-2b',
      tones:['#E4D8CB','#8C7A68','#3C3630'], ph:['#e7ddd1','#95836f','#38312a'] },
    { id:'p3', name:'Wollen blazer Vivienne', cat:'kleding', catLabel:'Blazers', price:329, was:449, img:'product-3', back:'product-3b',
      badge:'Sale', tones:['#26221E','#6E6257'], ph:['#ded4c9','#7f6d5c','#2f2922'] },
    { id:'p4', name:'Leren tas Margot', cat:'tassen', catLabel:'Tassen', price:279, img:'product-4', back:'product-4b',
      badge:'Bestseller', tones:['#8B5E3C','#26221E','#C9B39B'], ph:['#e3d3c1','#8d6a4c','#33271d'] },
    { id:'p5', name:'Plissé midi jurk Aurore', cat:'kleding', catLabel:'Jurken', price:265, img:'product-5', back:'product-5b',
      tones:['#3A3F44','#E8DED4'], ph:['#e9e2da','#8b8378','#333029'] },
    { id:'p6', name:'Ribgebreide cardigan Neve', cat:'knitwear', catLabel:'Knitwear', price:198, img:'product-6', back:'product-6b',
      tones:['#F0E7DD','#C2AD98'], ph:['#f1e8de','#a89380','#3d342c'] },
    { id:'p7', name:'Schoudertas Colette', cat:'tassen', catLabel:'Tassen', price:225, was:295, img:'product-7', back:'product-7b',
      badge:'Sale', tones:['#26221E','#A38B75'], ph:['#dcd0c3','#816c58','#2e271f'] },
    { id:'p8', name:'Tailored pantalon Sienne', cat:'kleding', catLabel:'Broeken', price:179, img:'product-8', back:'product-8b',
      tones:['#2B2724','#D8CBBC','#7E6E5E'], ph:['#e0d7cc','#8a7a68','#352e27'] }
  ];

  var BESTSELLERS = [
    { id:'b1', name:'Kasjmier sjaal Iris', cat:'accessoires', catLabel:'Accessoires', price:129, img:'best-1', back:'best-1b',
      badge:'Bestseller', tones:['#E7DACE','#6F6055'], ph:['#ece0d3','#9c8874','#3a3129'] },
    { id:'b2', name:'Trenchcoat Margaux', cat:'kleding', catLabel:'Jassen', price:389, img:'best-2', back:'best-2b',
      tones:['#CBB79E','#2A2622'], ph:['#e5d8c6','#a08d72','#39302a'] },
    { id:'b3', name:'Satijnen slipdress Elise', cat:'kleding', catLabel:'Jurken', price:219, img:'best-3', back:'best-3b',
      tones:['#B9A08C','#3A3F44'], ph:['#eadfd9','#a1897e','#3b322e'] },
    { id:'b4', name:'Gouden hanger Solène', cat:'accessoires', catLabel:'Sieraden', price:95, img:'best-4', back:'best-4b',
      tones:['#C8A560'], ph:['#f0e7dc','#b09a78','#3d352b'] },
    { id:'b5', name:'Merino coltrui Ondine', cat:'knitwear', catLabel:'Knitwear', price:159, img:'best-5', back:'best-5b',
      tones:['#26221E','#E8DED4','#8C7A68'], ph:['#e2d9d0','#8c8073','#332e28'] },
    { id:'b6', name:'Leren riem Adèle', cat:'accessoires', catLabel:'Accessoires', price:89, img:'best-6', back:'best-6b',
      tones:['#6B4A2F','#26221E'], ph:['#ded1c2','#87694c','#302620'] }
  ];

  var FREE_SHIP = 100;

  /* ── Helpers ─────────────────────────────────────────────── */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };

  /* Variatie per beeld, zodat placeholders niet identiek ogen */
  var phSeed = 0;
  function phStyle(ph, seed) {
    var k = (typeof seed === 'number' ? seed : phSeed++);
    var ang = 138 + (k * 23) % 72;
    var lx  = 36 + (k * 17) % 30;
    var ly  = 18 + (k * 11) % 20;
    return '--ph-a:' + ph[0] + ';--ph-b:' + ph[1] + ';--ph-c:' + ph[2] +
           ';--ph-ang:' + ang + 'deg;--ph-lx:' + lx + '%;--ph-ly:' + ly + '%' +
           ';--ph-mx:' + (100 - lx) + '%;--ph-my:' + (58 + (k % 5) * 6) + '%' +
           ';--ph-tex:' + (88 + (k % 6) * 9) + 'deg;--ph-ray:' + (98 + (k % 7) * 13) + 'deg';
  }

  function cardHTML(p) {
    var badge = p.badge
      ? '<span class="badge' + (p.badge === 'Sale' ? ' badge--sale' : '') + '">' + p.badge + '</span>' : '';
    var price = p.was
      ? '<s>' + euro(p.was) + '</s><span class="now">' + euro(p.price) + '</span>'
      : '<span>' + euro(p.price) + '</span>';
    var swatches = (p.tones || []).map(function (t) {
      return '<span class="swatch" style="background:' + t + '"></span>';
    }).join('');

    return '' +
      '<article class="card" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<a class="card__media" href="#" aria-label="' + p.name + '">' +
          badge +
          '<figure class="ph ph--front" data-img="' + p.img + '" data-label="' + p.catLabel + '" style="' + phStyle(p.ph) + '"></figure>' +
          '<figure class="ph ph--back" data-img="' + p.back + '" data-label="' + p.name + '" style="' + phStyle([p.ph[1], p.ph[2], p.ph[0]]) + '"></figure>' +
          '<button class="wish" data-wish aria-label="Aan verlanglijst toevoegen">' +
            '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/></svg>' +
          '</button>' +
          '<button class="card__add" data-add="' + p.id + '">In winkelmand</button>' +
        '</a>' +
        '<div class="card__body">' +
          '<span class="card__cat">' + p.catLabel + '</span>' +
          '<h3 class="card__name">' + p.name + '</h3>' +
          '<div class="card__price">' + price + '</div>' +
          (swatches ? '<div class="swatches">' + swatches + '</div>' : '') +
        '</div>' +
      '</article>';
  }

  /* ── Render ──────────────────────────────────────────────── */
  var grid = $('[data-products]');
  var rail = $('[data-bestsellers]');
  if (grid) grid.innerHTML = PRODUCTS.map(cardHTML).join('');
  if (rail) rail.innerHTML = BESTSELLERS.map(cardHTML).join('');

  var ALL = PRODUCTS.concat(BESTSELLERS);
  var byId = function (id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i];
    return null;
  };

  /* ── Echte foto's inladen zodra ze bestaan ───────────────── */
  function hydratePhotos(root) {
    $$('[data-img]', root || document).forEach(function (el) {
      if (el.dataset.hydrated) return;
      el.dataset.hydrated = '1';
      var name = el.dataset.img;
      var tries = ['assets/img/' + name + '.jpg', 'assets/img/' + name + '.webp', 'assets/img/' + name + '.png'];
      (function next(i) {
        if (i >= tries.length) return;
        var probe = new Image();
        probe.onload = function () {
          el.style.setProperty('--src', 'url("' + tries[i] + '")');
          el.classList.add('is-photo');
        };
        probe.onerror = function () { next(i + 1); };
        probe.src = tries[i];
      })(0);
    });
  }
  hydratePhotos();

  /* ── Scroll reveal ───────────────────────────────────────── */
  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: .12, rootMargin: '0px 0px -8% 0px' })
    : null;

  function observe(root) {
    $$('.reveal, .card, .service, .ig__item', root || document).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }
  observe();

  /* ── Product-kaarten: stagger ────────────────────────────── */
  $$('.grid--products .card').forEach(function (c, i) {
    c.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  /* ── Header sticky state ─────────────────────────────────── */
  var header = $('[data-header]');
  var onScroll = function () {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Announcement rotator ────────────────────────────────── */
  var items = $$('.announce__item');
  if (items.length > 1) {
    var ai = 0;
    setInterval(function () {
      items[ai].classList.remove('is-active');
      ai = (ai + 1) % items.length;
      items[ai].classList.add('is-active');
    }, 4200);
  }

  /* ── Hero slider ─────────────────────────────────────────── */
  var slides = $$('.hero__slide');
  var dots = $$('.hero__dots .dot');
  var hi = 0, heroTimer;
  function goSlide(n) {
    if (!slides.length) return;
    slides[hi].classList.remove('is-active');
    if (dots[hi]) dots[hi].classList.remove('is-active');
    hi = (n + slides.length) % slides.length;
    slides[hi].classList.add('is-active');
    if (dots[hi]) dots[hi].classList.add('is-active');
  }
  function autoHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(function () { goSlide(hi + 1); }, 6500);
  }
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { goSlide(i); autoHero(); });
  });
  if (slides.length > 1) autoHero();

  /* ── Reviews slider ──────────────────────────────────────── */
  var reviews = $$('.review');
  var rDots = $$('[data-review-dots] .dot');
  var ri = 0, rTimer;
  function goReview(n) {
    if (!reviews.length) return;
    reviews[ri].classList.remove('is-active');
    if (rDots[ri]) rDots[ri].classList.remove('is-active');
    ri = (n + reviews.length) % reviews.length;
    reviews[ri].classList.add('is-active');
    if (rDots[ri]) rDots[ri].classList.add('is-active');
  }
  function autoReview() {
    clearInterval(rTimer);
    rTimer = setInterval(function () { goReview(ri + 1); }, 6000);
  }
  rDots.forEach(function (d, i) {
    d.addEventListener('click', function () { goReview(i); autoReview(); });
  });
  if (reviews.length > 1) autoReview();

  /* ── Filters ─────────────────────────────────────────────── */
  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filter').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.dataset.filter;
      $$('.grid--products .card').forEach(function (card) {
        var show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
        if (show) { card.classList.remove('in'); requestAnimationFrame(function () { card.classList.add('in'); }); }
      });
    });
  });

  /* ── Bestseller-carousel ─────────────────────────────────── */
  var carousel = $('.carousel');
  $$('[data-carousel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!carousel) return;
      var step = carousel.querySelector('.card') ? carousel.querySelector('.card').offsetWidth + 24 : 300;
      carousel.scrollBy({ left: btn.dataset.carousel === 'next' ? step : -step, behavior: 'smooth' });
    });
  });

  /* ── Panels (nav / cart / search) ────────────────────────── */
  var scrim = $('[data-scrim]');
  function openPanel(name) {
    var el = $('[data-panel="' + name + '"]');
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    if (name !== 'search' && scrim) scrim.classList.add('is-on');
    document.body.classList.add('is-locked');
    if (name === 'search') { var q = $('#q'); if (q) setTimeout(function () { q.focus(); }, 320); }
  }
  function closePanels() {
    $$('[data-panel]').forEach(function (el) {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    });
    if (scrim) scrim.classList.remove('is-on');
    document.body.classList.remove('is-locked');
  }
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { openPanel(b.dataset.open); });
  });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closePanels); });
  if (scrim) scrim.addEventListener('click', closePanels);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanels(); });
  $$('.drawer__nav a').forEach(function (a) { a.addEventListener('click', closePanels); });

  /* ── Toast ───────────────────────────────────────────────── */
  var toastEl = $('[data-toast]'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ── Winkelmand ──────────────────────────────────────────── */
  var cart = [];
  var elItems = $('[data-cart-items]');
  var elTotal = $('[data-cart-total]');
  var elCount = $('[data-cart-count]');
  var elTitle = $('[data-cart-title]');
  var elShipTxt = $('[data-ship-text]');
  var elShipBar = $('[data-ship-bar]');

  function cartTotal() {
    return cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
  }

  function renderCart() {
    if (!elItems) return;
    var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    var total = cartTotal();

    if (!cart.length) {
      elItems.innerHTML = '<p class="cart__empty">Je winkelmand is nog leeg.<br><span>Ontdek de nieuwe collectie.</span></p>';
    } else {
      elItems.innerHTML = cart.map(function (l) {
        return '' +
          '<div class="cart-line" data-line="' + l.id + '">' +
            '<figure class="ph" data-img="' + l.img + '" data-label="" style="' + phStyle(l.ph) + '"></figure>' +
            '<div>' +
              '<div class="cart-line__name">' + l.name + '</div>' +
              '<div class="cart-line__meta">Maat M · ' + l.catLabel + '</div>' +
              '<div class="cart-line__qty">' +
                '<button data-qty="-1" aria-label="Minder">−</button>' +
                '<span>' + l.qty + '</span>' +
                '<button data-qty="1" aria-label="Meer">+</button>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div class="cart-line__price">' + euro(l.price * l.qty) + '</div>' +
              '<button class="cart-line__rm" data-rm>Verwijder</button>' +
            '</div>' +
          '</div>';
      }).join('');
      hydratePhotos(elItems);
    }

    if (elTotal) elTotal.textContent = euro(total);
    if (elTitle) elTitle.textContent = '(' + count + ')';
    if (elCount) { elCount.textContent = count; elCount.classList.toggle('is-on', count > 0); }

    var left = Math.max(0, FREE_SHIP - total);
    if (elShipTxt) elShipTxt.textContent = left > 0
      ? 'Nog ' + euro(left) + ' tot gratis verzending'
      : 'Gefeliciteerd — je verzending is gratis';
    if (elShipBar) elShipBar.style.width = Math.min(100, (total / FREE_SHIP) * 100) + '%';
  }

  function addToCart(id) {
    var p = byId(id);
    if (!p) return;
    var line = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) line = cart[i];
    if (line) line.qty++;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, ph: p.ph, catLabel: p.catLabel, qty: 1 });
    renderCart();
    toast(p.name + ' toegevoegd');
    openPanel('cart');
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }

    var wish = e.target.closest('[data-wish]');
    if (wish) {
      e.preventDefault();
      wish.classList.toggle('is-on');
      toast(wish.classList.contains('is-on') ? 'Toegevoegd aan verlanglijst' : 'Verwijderd van verlanglijst');
      return;
    }

    var qty = e.target.closest('[data-qty]');
    if (qty) {
      var lineEl = qty.closest('[data-line]');
      var id = lineEl.dataset.line;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
          cart[i].qty += parseInt(qty.dataset.qty, 10);
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        }
      }
      renderCart();
      return;
    }

    var rm = e.target.closest('[data-rm]');
    if (rm) {
      var rid = rm.closest('[data-line]').dataset.line;
      cart = cart.filter(function (l) { return l.id !== rid; });
      renderCart();
      toast('Verwijderd uit winkelmand');
      return;
    }

    var media = e.target.closest('.card__media');
    if (media) e.preventDefault();
  });

  renderCart();

  /* ── Nieuwsbrief ─────────────────────────────────────────── */
  var nlForm = $('[data-newsletter]');
  if (nlForm) {
    nlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nlForm.querySelector('input');
      if (!input.value || input.value.indexOf('@') < 0) { toast('Vul een geldig e-mailadres in'); input.focus(); return; }
      toast('Welkom bij de club — check je inbox');
      nlForm.reset();
    });
  }

  /* ── Zoek-chips ──────────────────────────────────────────── */
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      var q = $('#q');
      if (q) { q.value = c.textContent; q.focus(); }
    });
  });

  /* ── Lookbook parallax ───────────────────────────────────── */
  var look = $('.lookbook__bg');
  if (look && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = look.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          look.style.transform = 'translateY(' + (p * 8).toFixed(2) + '%)';
        }
        ticking = false;
      });
    }, { passive: true });
  }
})();
