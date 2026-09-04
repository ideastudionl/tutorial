/* Witgoed Koning — productpagina. Het zwaartepunt van de conversie. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  const VIEWS = [
    { key: 'geheel', label: 'Vooraanzicht', note: 'Foto van dit exemplaar — artikelnummer %s' },
    { key: 'paneel', label: 'Bedieningspaneel', note: 'Alle programma\'s getest, display zonder uitval' },
    { key: 'trommel', label: 'Binnenzijde', note: 'Gereinigd en ontkalkt, geen kalkaanslag' },
    { key: 'sporen', label: 'Gebruikssporen', note: 'Wij fotograferen elke beschadiging, hoe klein ook' }
  ];

  WK.views.pdp = async function (params) {
    const p = await WK.store.getProduct(params.slug);
    if (!p) return WK.views.notFound();

    const cat = WK.CATEGORIES.find(c => c.slug === p.cat);
    const save = WK.savingPct(p);
    const related = (await WK.store.listProducts({ category: p.cat, limit: 10 }))
      .items.filter(x => x.id !== p.id).slice(0, 4);

    return '<div class="wrap">' +
      P.crumbs([
        { label: 'Home', href: '#/' },
        cat ? { label: cat.label, href: '#/c/' + cat.slug } : { label: 'Assortiment' },
        { label: p.brand + ' ' + p.model }
      ]) +
      '<div class="pdp">' +
        '<div>' + gallery(p) + sections(p, related) + '</div>' +
        buybox(p, save) +
      '</div>' +
      stickyBar(p) +
    '</div>';
  };

  /* ------------------------------------------------------------- galerij -- */

  function gallery(p) {
    const thumbs = VIEWS.map((v, i) =>
      '<button class="gthumb' + (i === 0 ? ' on' : '') + '" data-view="' + i + '" ' +
      'aria-label="' + esc(v.label) + '">' + WK.appliance(p.kind, 54) + '</button>'
    ).join('');

    return '<div class="gallery">' +
      '<div class="gallery-main">' + P.media(p, 300) +
        '<span class="gallery-note" data-note>' + esc(VIEWS[0].note.replace('%s', p.sku)) + '</span>' +
      '</div>' +
      '<div class="gallery-thumbs">' + thumbs + '</div>' +
      '<p class="muted" style="font-size:12.5px">' + icon('info', 13) +
        ' Dit is één specifiek toestel met een eigen artikelnummer. Er is geen tweede exemplaar van.</p>' +
    '</div>';
  }

  /* -------------------------------------------------------------- buybox -- */

  function buybox(p, save) {
    const dLevering = WK.formatDate(WK.deliveryDate(2));

    return '<aside class="buybox">' +
      '<div class="pdp-brandline">' +
        '<span class="card-brand">' + esc(p.brand) + '</span>' +
        '<span class="badge badge-cond">' + esc(p.cond) + '</span>' +
        '<span class="mono" style="font-size:11px;color:var(--muted-2)">' + esc(p.sku) + '</span>' +
      '</div>' +
      '<h1>' + esc(p.title) + '</h1>' +
      '<div class="pdp-rating">' + WK.stars(p.rating, 14) +
        '<span>' + p.rating.toString().replace('.', ',') + ' · ' + p.reviews + ' beoordelingen</span></div>' +

      '<div class="price-block">' +
        '<div class="price-row"><span class="price">' + euro(p.price) + '</span>' +
          (p.compareAt ? '<span class="was">nieuwprijs ' + euro(p.compareAt) + '</span>' : '') + '</div>' +
        (save ? '<span class="save">U bespaart ' + euro(p.compareAt - p.price) + ' (' + save + '%)</span>' : '') +
        '<span class="incl">Inclusief btw, bezorging, aansluiten en het meenemen van uw oude apparaat. ' +
          'Er komt niets meer bij.</span>' +
      '</div>' +

      '<ul class="assurances">' +
        '<li>' + icon('shield', 16) + '<span><b>' + p.warranty + ' maanden volledige garantie</b> — bij storing komt onze monteur bij u thuis</span></li>' +
        '<li>' + icon('truck', 16) + '<span><b>Gratis bezorgd en aangesloten</b> in heel Nederland, ook op de eerste verdieping</span></li>' +
        '<li>' + icon('recycle', 16) + '<span><b>Oud apparaat gratis mee</b>, ook als u het niet bij ons kocht</span></li>' +
        '<li>' + icon('swap', 16) + '<span><b>14 dagen bedenktijd</b> — wij halen het kosteloos op</span></li>' +
      '</ul>' +

      '<div class="deliverybox">' +
        '<span class="eyebrow">' + icon('calendar', 14) + 'Wanneer is hij bij u?</span>' +
        '<form class="pc-form" data-pc>' +
          '<input name="pc" placeholder="1234 AB" maxlength="7" autocomplete="postal-code" aria-label="Postcode">' +
          '<button class="btn btn-ghost" type="submit">Bekijk</button>' +
        '</form>' +
        '<p class="pc-result" data-pc-result>Standaard bezorgd op <b>' + dLevering +
          '</b> als u vandaag vóór 16:00 bestelt.</p>' +
      '</div>' +

      '<div class="buy-actions">' +
        '<button class="btn btn-primary btn-lg" data-add="' + esc(p.slug) + '">' +
          icon('cart', 18) + 'In de winkelwagen</button>' +
        '<a class="btn btn-ghost" href="#/showroom">Eerst bekijken in de showroom</a>' +
      '</div>' +

      '<div class="pay-icons">' +
        ['iDEAL', 'Bancontact', 'Klarna', 'in3', 'PIN bij levering'].map(x => '<span>' + x + '</span>').join('') +
      '</div>' +

      '<p class="muted" style="font-size:12.5px;display:flex;gap:8px;align-items:flex-start">' +
        icon('phone', 14) + '<span>Twijfelt u over de maten of de aansluiting? Bel ' +
        '<a href="tel:' + WK.SHOP.phoneHref + '" style="text-decoration:underline">' + esc(WK.SHOP.phone) +
        '</a> — wij nemen zelf op.</span></p>' +
    '</aside>';
  }

  /* ------------------------------------------------------------- secties -- */

  function sections(p, related) {
    const specRows = Object.keys(p.specs).map(k =>
      '<tr><th scope="row">' + esc(k) + '</th><td>' + esc(p.specs[k]) + '</td></tr>').join('');

    const refurbRows = (p.refurb || []).map(r =>
      '<li><span class="ic' + (r.status === 'repl' ? ' repl' : '') + '">' +
        icon(r.status === 'repl' ? 'swap' : 'check', 16) + '</span>' +
      '<span>' + esc(r.item) + (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</span>' +
      '<span class="st' + (r.status === 'repl' ? ' repl' : '') + '">' +
        (r.status === 'repl' ? 'vervangen' : 'akkoord') + '</span></li>').join('');

    const replaced = (p.refurb || []).filter(r => r.status === 'repl').length;

    return '<div class="pdp-sections">' +

      '<section><h2 style="font-size:22px;margin-bottom:14px">Waarom dit apparaat</h2>' +
        '<ul class="assurances">' + (p.highlights || []).map(h =>
          '<li>' + icon('check', 16) + '<span>' + esc(h) + '</span></li>').join('') + '</ul></section>' +

      '<section><h2 style="font-size:22px;margin-bottom:14px">Keuringsrapport van dit exemplaar</h2>' +
        '<p class="muted" style="margin-bottom:14px;max-width:64ch">Opgemaakt door onze monteur op ' +
          esc(WK.formatDate(WK.deliveryDate(-0, Date.now() - 9 * 864e5), true)) + '. ' +
          (replaced ? replaced + ' onderde' + (replaced === 1 ? 'el' : 'len') + ' vervangen, ' : '') +
          'alle overige punten gecontroleerd en akkoord bevonden.</p>' +
        '<div class="panel">' +
          '<div class="panel-head"><b>' + esc(p.brand) + ' ' + esc(p.model) + '</b>' +
            '<span class="mono" style="font-size:11px;color:var(--muted)">' + esc(p.sku) + '</span></div>' +
          '<div class="panel-body"><ul class="check-list">' + refurbRows + '</ul></div>' +
        '</div></section>' +

      '<section><h2 style="font-size:22px;margin-bottom:14px">Specificaties</h2>' +
        '<div class="table-scroll"><table class="spec-table">' +
          '<tbody>' + specRows +
          '<tr><th scope="row">Artikelnummer</th><td>' + esc(p.sku) + '</td></tr>' +
          '<tr><th scope="row">Staat</th><td>' + esc(p.cond) + '</td></tr>' +
          '<tr><th scope="row">Garantie</th><td>' + p.warranty + ' maanden</td></tr>' +
        '</tbody></table></div></section>' +

      (related.length ? '<section><h2 style="font-size:22px;margin-bottom:14px">Andere ' +
        esc((WK.CATEGORIES.find(c => c.slug === p.cat) || {}).label || 'apparaten').toLowerCase() + ' op voorraad</h2>' +
        '<div class="grid-products">' + related.map(P.card).join('') + '</div></section>' : '') +

      '<section><h2 style="font-size:22px;margin-bottom:14px">Vragen over dit apparaat</h2>' +
        P.faq(WK.FAQ.slice(0, 5)) + '</section>' +

    '</div>';
  }

  function stickyBar(p) {
    return '<div class="sticky-buy" data-sticky>' +
      '<div class="meta"><b>' + esc(p.brand) + ' ' + esc(p.model) + '</b>' +
        '<span class="price">' + euro(p.price) + '</span></div>' +
      '<button class="btn btn-primary" data-add="' + esc(p.slug) + '">In de winkelwagen</button>' +
    '</div>';
  }

  /* --------------------------------------------------------------- gedrag -- */

  WK.mounts.pdp = function (root, params) {
    /* Galerij-onderschriften wisselen. De illustratie blijft gelijk zolang er
       geen echte foto's uit de catalogus komen; het onderschrift laat zien
       welke opnames er per toestel horen. */
    const note = root.querySelector('[data-note]');
    root.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-view]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const v = VIEWS[parseInt(btn.dataset.view, 10)];
        note.textContent = v.note.replace('%s', params.slug ? (WK.bySlug(params.slug) || {}).sku || '' : '');
      });
    });

    /* Bezorgbelofte op postcode. Randstad en Overijssel sneller dan de rest —
       dat is de echte planning, dus zeg het ook. */
    const form = root.querySelector('[data-pc]');
    const out = root.querySelector('[data-pc-result]');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = form.pc.value.trim();
      if (!WK.validPostcode(val)) {
        out.className = 'pc-result err';
        out.textContent = 'Vul een Nederlandse postcode in, bijvoorbeeld 7418 CJ.';
        return;
      }
      const digits = parseInt(val.slice(0, 4), 10);
      const snel = (digits >= 7000 && digits < 8300) || (digits >= 1000 && digits < 3600);
      const d = WK.deliveryDate(snel ? 2 : 3);
      out.className = 'pc-result';
      out.innerHTML = 'Bezorgd en aangesloten op <b>' + esc(WK.formatDate(d)) + '</b>' +
        ' — u kiest zelf een dagdeel bij het afrekenen.' +
        (snel ? ' Uw regio rijden wij zelf.' : '');
    });

    /* Mobiele koopbalk zodra de knop uit beeld is. */
    const sticky = root.querySelector('[data-sticky]');
    const anchor = root.querySelector('.buy-actions');
    if (sticky && anchor && 'IntersectionObserver' in window) {
      document.body.classList.add('has-sticky');
      const io = new IntersectionObserver(([entry]) => {
        sticky.classList.toggle('show', !entry.isIntersecting);
      }, { rootMargin: '-80px 0px 0px 0px' });
      io.observe(anchor);
      WK.onLeave(() => { io.disconnect(); document.body.classList.remove('has-sticky'); });
    }
  };

})(window.WK);
