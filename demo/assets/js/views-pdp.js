/* Witgoed Koning — productpagina. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  const SHOTS = [
    ['Vooraanzicht', 'Foto van dit exemplaar, artikelnummer %s'],
    ['Bedieningspaneel', 'Alle programma\'s getest, display zonder uitval'],
    ['Binnenzijde', 'Gereinigd en ontkalkt, geen kalkaanslag'],
    ['Gebruikssporen', 'Wij fotograferen elke beschadiging, hoe klein ook']
  ];

  WK.views.pdp = async function (params) {
    const p = await WK.store.getProduct(params.slug);
    if (!p) return WK.views.notFound();

    const cat = WK.CATEGORIES.find(c => c.slug === p.cat);
    const related = (await WK.store.listProducts({ category: p.cat, limit: 10 }))
      .items.filter(x => x.id !== p.id).slice(0, 3);

    return '<div class="wrap">' +
      P.crumbs([
        { label: 'Home', href: '#/' },
        cat ? { label: cat.label, href: '#/c/' + cat.slug } : { label: 'Assortiment' },
        { label: p.brand + ' ' + p.model }
      ]) +
      '<div style="padding:14px 0 4px">' +
        '<span class="prow-brand">' + esc(p.brand) + '</span>' +
        '<h1 style="margin:2px 0 6px">' + esc(p.title) + '</h1>' +
        '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">' + P.rating(p) +
          '<span class="artnr">Artikelnummer ' + esc(p.sku) + '</span>' +
          '<span class="badge badge-cond">' + esc(p.cond) + '</span>' +
          (p.outlet ? '<span class="badge badge-outlet">Outlet</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="pdp">' +
        '<div>' +
          '<div class="pdp-top">' + gallery(p) + why(p) + '</div>' +
          sections(p, related) +
        '</div>' +
        buybox(p) +
      '</div>' +
      '<div class="sticky-buy" data-sticky>' +
        '<div class="meta"><b>' + esc(p.brand) + ' ' + esc(p.model) + '</b>' +
          '<span class="price">' + euro(p.price) + '</span></div>' +
        '<button class="btn btn-primary" data-add="' + esc(p.slug) + '">In winkelwagen</button>' +
      '</div>' +
    '</div>';
  };

  function gallery(p) {
    return '<div>' +
      '<div class="gallery-main">' + P.media(p, 260) +
        '<span class="gallery-note" data-note>' + esc(SHOTS[0][1].replace('%s', p.sku)) + '</span></div>' +
      '<div class="gallery-thumbs">' + SHOTS.map((v, i) =>
        '<button class="gthumb' + (i === 0 ? ' on' : '') + '" data-shot="' + i + '" ' +
        'aria-label="' + esc(v[0]) + '">' + WK.appliance(p.kind, 46) + '</button>').join('') + '</div>' +
    '</div>';
  }

  function why(p) {
    return '<div>' +
      '<h2 style="font-size:18px">Waarom u dit apparaat wilt</h2>' +
      '<ul class="why">' + (p.highlights || []).map(h =>
        '<li>' + icon('check', 15) + '<span>' + esc(h) + '</span></li>').join('') +
        '<li>' + icon('check', 15) + '<span>' + p.warranty + ' maanden garantie, bij storing komt onze monteur bij u thuis</span></li>' +
      '</ul>' +
      (p.outlet && p.outletReason
        ? '<div class="notice" style="margin-top:14px">' + icon('info', 16) +
          '<span><b style="color:var(--text)">Outlet-apparaat.</b> ' + esc(p.outletReason) +
          ' Op de techniek en de garantie maakt dat niets uit — op de prijs wel.</span></div>'
        : '') +
      '<p class="muted" style="margin-top:14px;font-size:13.5px">Dit is één specifiek toestel met een eigen ' +
        'artikelnummer. Er is geen tweede exemplaar van.</p>' +
    '</div>';
  }

  function buybox(p) {
    const save = WK.savingPct(p);
    const dag = WK.formatDate(WK.deliveryDate(2));
    return '<aside class="buybox">' +
      '<div class="pricebox">' +
        '<div class="price-row"><span class="price">' + euro(p.price) + '</span>' +
          (p.compareAt ? '<span class="was">nieuwprijs ' + euro(p.compareAt) + '</span>' : '') + '</div>' +
        (save ? '<span class="saving">U bespaart ' + euro(p.compareAt - p.price) + ' (' + save + '%)</span>' : '') +
        '<span class="incl">Inclusief btw, bezorging, aansluiten en het meenemen van uw oude apparaat. ' +
          'Er komt niets meer bij.</span>' +
      '</div>' +

      '<ul class="assurances">' +
        '<li>' + icon('check', 15) + '<span><b>' + p.warranty + ' maanden garantie</b>, monteur aan huis</span></li>' +
        '<li>' + icon('check', 15) + '<span><b>Gratis bezorgd en aangesloten</b>, ook op de eerste verdieping</span></li>' +
        '<li>' + icon('check', 15) + '<span><b>Oud apparaat gratis mee</b>, ook als u het niet bij ons kocht</span></li>' +
        '<li>' + icon('check', 15) + '<span><b>14 dagen bedenktijd</b>, wij halen het kosteloos op</span></li>' +
      '</ul>' +

      '<div class="deliverybox">' +
        '<b>Wanneer is hij bij u?</b>' +
        '<form class="pc-form" data-pc>' +
          '<input name="pc" placeholder="1234 AB" maxlength="7" autocomplete="postal-code" aria-label="Postcode">' +
          '<button class="btn btn-ghost" type="submit">Bekijk</button>' +
        '</form>' +
        '<p class="pc-result" data-pc-result>Standaard bezorgd op <b>' + esc(dag) +
          '</b> als u vandaag vóór 16:00 bestelt.</p>' +
      '</div>' +

      '<button class="btn btn-primary btn-lg" data-add="' + esc(p.slug) + '">' +
        icon('cart', 18) + 'In winkelwagen</button>' +
      '<a class="btn btn-ghost" href="#/showroom" style="width:100%">Eerst bekijken in de showroom</a>' +

      '<div class="paystrip">' + ['iDEAL', 'Pinnen bij levering', 'Klarna', 'in3']
        .map(x => '<span>' + x + '</span>').join('') + '</div>' +

      '<p class="muted" style="font-size:13px">Twijfelt u over de maten of de aansluiting? Bel ' +
        '<a class="linkblue" href="tel:' + WK.SHOP.phoneHref + '">' + esc(WK.SHOP.phone) +
        '</a> — wij nemen zelf op.</p>' +
    '</aside>';
  }

  function sections(p, related) {
    const specRows = Object.keys(p.specs).map(k =>
      '<tr><th scope="row">' + esc(k) + '</th><td>' + esc(p.specs[k]) + '</td></tr>').join('');
    const replaced = (p.refurb || []).filter(r => r.status === 'repl').length;
    const opgemaakt = WK.formatDate(WK.deliveryDate(-0, Date.now() - 9 * 864e5), true);

    return '<div class="pdp-sections">' +

      '<section><h2>Keuringsrapport van dit exemplaar</h2>' +
        '<p class="muted" style="margin-bottom:12px;max-width:66ch">Opgemaakt door onze monteur op ' +
          esc(opgemaakt) + '. ' + (replaced ? replaced + ' onderde' + (replaced === 1 ? 'el' : 'len') +
          ' vervangen, ' : '') + 'alle overige punten gecontroleerd en akkoord bevonden.</p>' +
        '<div class="panel">' +
          '<div class="panel-head"><b>' + esc(p.brand) + ' ' + esc(p.model) + '</b><span>' + esc(p.sku) + '</span></div>' +
          '<ul class="check-list">' + (p.refurb || []).map(P.checkRow).join('') + '</ul>' +
        '</div></section>' +

      '<section><h2>Specificaties</h2>' +
        '<div class="table-scroll"><table class="spec-table"><tbody>' + specRows +
          '<tr><th scope="row">Artikelnummer</th><td>' + esc(p.sku) + '</td></tr>' +
          '<tr><th scope="row">Staat</th><td>' + esc(p.cond) + (p.outlet ? ' (outlet)' : '') + '</td></tr>' +
          '<tr><th scope="row">Garantie</th><td>' + p.warranty + ' maanden</td></tr>' +
        '</tbody></table></div></section>' +

      (related.length ? '<section><h2>Andere ' +
        esc(((WK.CATEGORIES.find(c => c.slug === p.cat) || {}).label || 'apparaten').toLowerCase()) +
        ' op voorraad</h2><div class="plist">' + related.map(P.row).join('') + '</div></section>' : '') +

      '<section><h2>Vragen over dit apparaat</h2>' + P.faq(WK.FAQ.slice(0, 5)) + '</section>' +
    '</div>';
  }

  WK.mounts.pdp = function (root, params) {
    const note = root.querySelector('[data-note]');
    const sku = (WK.bySlug(params.slug) || {}).sku || '';
    root.querySelectorAll('[data-shot]').forEach(btn => btn.addEventListener('click', () => {
      root.querySelectorAll('[data-shot]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      note.textContent = SHOTS[parseInt(btn.dataset.shot, 10)][1].replace('%s', sku);
    }));

    /* Bezorgbelofte op postcode. Overijssel en de Randstad rijden wij zelf,
       de rest gaat via een extra rit — dus dat duurt een dag langer. */
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
      const d4 = parseInt(val.slice(0, 4), 10);
      const snel = (d4 >= 7000 && d4 < 8300) || (d4 >= 1000 && d4 < 3600);
      out.className = 'pc-result';
      out.innerHTML = 'Bezorgd en aangesloten op <b>' + esc(WK.formatDate(WK.deliveryDate(snel ? 2 : 3))) +
        '</b>. U kiest zelf een dagdeel bij het afrekenen.' + (snel ? ' Uw regio rijden wij zelf.' : '');
    });

    const sticky = root.querySelector('[data-sticky]');
    const anchor = root.querySelector('.buybox .btn-primary');
    if (sticky && anchor && 'IntersectionObserver' in window) {
      document.body.classList.add('has-sticky');
      const io = new IntersectionObserver(([entry]) => sticky.classList.toggle('show', !entry.isIntersecting));
      io.observe(anchor);
      WK.onLeave(() => { io.disconnect(); document.body.classList.remove('has-sticky'); });
    }
  };

})(window.WK);
