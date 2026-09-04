/* Witgoed Koning — homepage. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  WK.views.home = async function () {
    const { items } = await WK.store.listProducts({ sort: 'nieuwste', limit: 12 });
    const featured = items.find(p => p.cond === 'Nieuwstaat') || items[0];
    const counts = {};
    const all = (await WK.store.listProducts({ limit: 200 })).items;
    all.forEach(p => {
      counts[p.cat] = counts[p.cat] || { n: 0, min: Infinity };
      counts[p.cat].n++;
      counts[p.cat].min = Math.min(counts[p.cat].min, p.price);
    });

    return P.hero(featured) + P.uspbar() +
      P.catSection(counts) +
      P.newArrivals(items.filter(p => p.id !== featured.id).slice(0, 8)) +
      P.dossierSection() +
      P.howSection() +
      P.reviewSection() +
      P.showroomSection() +
      P.faqSection();
  };

  /* ------------------------------------------------------------------ hero */

  P.hero = function (p) {
    const s = WK.SHOP;
    const rows = (p.refurb || []).slice(0, 4).map(r =>
      '<li><span>' + esc(r.item) + '</span>' +
      '<b' + (r.status === 'repl' ? ' class="repl"' : '') + '>' +
      (r.status === 'repl' ? 'vervangen' : 'gekeurd') + '</b></li>'
    ).join('');

    return '<section class="hero"><div class="wrap">' +
      '<div>' +
        '<h1>Een wasmachine van <em>Miele of Bosch</em> voor de prijs van een onbekend merk.</h1>' +
        '<p class="hero-lead">Wij kopen A-merken op, herstellen ze in onze eigen werkplaats in Deventer ' +
          'en leveren ze bij u thuis — bezorgd, aangesloten en met garantie. Uw oude apparaat nemen wij mee.</p>' +
        '<div class="hero-cta">' +
          '<a class="btn btn-primary" href="#/c/wasmachines">Bekijk de wasmachines' + icon('arrow', 17) + '</a>' +
          '<a class="btn btn-ghost" href="#/showroom">Kom langs in de showroom</a>' +
        '</div>' +
        '<div class="hero-proof">' +
          '<span class="score">' + s.rating.toString().replace('.', ',') + '<small>/10</small></span>' +
          '<div>' + WK.stars(Math.round(s.rating / 2), 15) +
            '<p>' + s.reviewCount.toLocaleString('nl-NL') + ' beoordelingen op Kiyoh</p></div>' +
          '<div style="border-left:1px solid rgba(255,255,255,.16);padding-left:18px">' +
            '<span class="score" style="font-size:22px">' + (new Date().getFullYear() - s.since) + ' jaar</span>' +
            '<p>eigen werkplaats in Deventer</p></div>' +
        '</div>' +
      '</div>' +
      '<div class="hero-card">' +
        '<div class="hero-card-top">' +
          '<div class="thumb">' + P.media(p, 120) + '</div>' +
          '<div>' +
            '<span class="card-brand">' + esc(p.brand) + ' · ' + esc(p.sku) + '</span>' +
            '<h3 style="margin:4px 0 8px">' + esc(p.title) + '</h3>' +
            '<span class="price">' + euro(p.price) + '</span>' +
            (p.compareAt ? '<span class="was">nieuw ' + euro(p.compareAt) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="dossier-strip">' +
          '<span class="eyebrow">' + icon('checkc', 14) + 'Keuringsrapport van dit exemplaar</span>' +
          '<ul class="dossier-rows">' + rows +
            '<li><span>en nog ' + Math.max(0, (p.refurb || []).length - 4) + ' controlepunten</span>' +
            '<b><a href="#/p/' + esc(p.slug) + '" style="text-decoration:underline">bekijken</a></b></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  };

  /* ----------------------------------------------------------- categorieën */

  P.catSection = function (counts) {
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head"><div>' +
        '<span class="eyebrow">Assortiment</span>' +
        '<h2 style="margin-top:8px">Waar bent u naar op zoek?</h2>' +
      '</div></div>' +
      '<div class="cats">' + WK.CATEGORIES.map(c => {
        const k = counts[c.slug] || { n: 0, min: 0 };
        return '<a class="cat" href="#/c/' + c.slug + '">' +
          WK.appliance(c.kind, 52) +
          '<div><b>' + esc(c.label) + '</b>' +
          '<small>' + k.n + ' apparaten · vanaf ' + (k.n ? euro(k.min) : '—') + '</small></div></a>';
      }).join('') + '</div>' +
    '</div></section>';
  };

  /* ------------------------------------------------------- nieuw binnen -- */

  P.newArrivals = function (items) {
    return '<section class="section section-alt"><div class="wrap">' +
      '<div class="section-head">' +
        '<div><span class="eyebrow">Deze week gekeurd</span>' +
        '<h2 style="margin-top:8px">Net binnengekomen</h2>' +
        '<p>Elk apparaat is uniek en heeft een eigen artikelnummer. Is hij weg, dan is hij weg.</p></div>' +
        '<a class="section-link" href="#/c/wasmachines">Hele assortiment' + icon('arrow', 15) + '</a>' +
      '</div>' +
      '<div class="grid-products">' + items.map(P.card).join('') + '</div>' +
    '</div></section>';
  };

  /* ---------------------------------------------- het dossier-idee, uitgelegd */

  P.dossierSection = function () {
    const demo = WK.PRODUCTS[1];
    return '<section class="section"><div class="wrap">' +
      '<div class="showroom">' +
        '<div>' +
          '<span class="eyebrow">Waarom u dit bij ons wél durft</span>' +
          '<h2 style="margin:10px 0 14px">Tweedehands kopen is eng omdat u niet weet wat u krijgt. ' +
            'Daarom laten wij het zien.</h2>' +
          '<p class="muted" style="max-width:56ch">Bij ieder apparaat hoort een keuringsrapport van dát toestel: ' +
            'welke onderdelen zijn gecontroleerd, welke zijn vervangen, hoeveel draaiuren erop staan en welke ' +
            'gebruikssporen erop zitten. Geen stockfoto, geen "in goede staat" — de exacte machine die bij u ' +
            'thuis wordt aangesloten.</p>' +
          '<ul class="nap" style="margin-top:22px">' +
            '<li>' + icon('wrench', 18) + '<div><b>Eigen werkplaats</b><span>Onze monteurs herstellen zelf. Geen doorverkoop van ongeziene partijen.</span></div></li>' +
            '<li>' + icon('tag', 18) + '<div><b>Eigen artikelnummer</b><span>Elk toestel is uniek geregistreerd, met eigen foto\'s en eigen rapport.</span></div></li>' +
            '<li>' + icon('shield', 18) + '<div><b>Garantie op papier</b><span>6 tot 12 maanden, met een monteur die bij u thuis komt.</span></div></li>' +
          '</ul>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head"><b>Keuringsrapport</b>' +
            '<span class="mono" style="font-size:11px;color:var(--muted)">' + esc(demo.sku) + '</span></div>' +
          '<div class="panel-body"><ul class="check-list">' +
            demo.refurb.map(r =>
              '<li><span class="ic' + (r.status === 'repl' ? ' repl' : '') + '">' +
                icon(r.status === 'repl' ? 'swap' : 'check', 16) + '</span>' +
              '<span>' + esc(r.item) + (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</span>' +
              '<span class="st' + (r.status === 'repl' ? ' repl' : '') + '">' +
                (r.status === 'repl' ? 'vervangen' : 'akkoord') + '</span></li>'
            ).join('') +
          '</ul></div>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  };

  /* ------------------------------------------------------------- 3 stappen */

  P.howSection = function () {
    const d = WK.formatDate(WK.deliveryDate(2));
    const steps = [
      ['Stap 1', 'U kiest een apparaat', 'Bij elk toestel staat het keuringsrapport, de draaiuren en foto\'s van dat exemplaar. Twijfelt u? Bel ons — wij verkopen u liever het goedkopere model dat past.'],
      ['Stap 2', 'U kiest dag en dagdeel', 'Bezorgen kan maandag tot en met zaterdag. Bestelt u vandaag vóór 16:00, dan kan het al op ' + d + '.'],
      ['Stap 3', 'Wij sluiten aan en testen', 'Onze monteurs plaatsen het apparaat, sluiten het aan, draaien een proefprogramma en nemen uw oude apparaat mee.']
    ];
    return '<section class="section section-alt"><div class="wrap">' +
      '<div class="section-head"><div><span class="eyebrow">Zo werkt het</span>' +
        '<h2 style="margin-top:8px">Van bestellen tot draaiende machine</h2></div></div>' +
      '<div class="steps">' + steps.map(s =>
        '<div class="step"><span class="n">' + s[0] + '</span><h3>' + s[1] + '</h3><p>' + s[2] + '</p></div>'
      ).join('') + '</div>' +
    '</div></section>';
  };

  /* ---------------------------------------------------------------- reviews */

  P.reviewSection = function () {
    const s = WK.SHOP;
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head">' +
        '<div><span class="eyebrow">Klantbeoordelingen</span>' +
        '<h2 style="margin-top:8px">' + s.rating.toString().replace('.', ',') + ' uit 10, op ' +
          s.reviewCount.toLocaleString('nl-NL') + ' beoordelingen</h2>' +
        '<p>Onafhankelijk verzameld via Kiyoh. Wij plaatsen ook de reviews van vier sterren en lager.</p></div>' +
      '</div>' +
      '<div class="reviews">' + WK.REVIEWS.slice(0, 6).map(P.reviewCard).join('') + '</div>' +
    '</div></section>';
  };

  /* --------------------------------------------------------------- showroom */

  P.showroomSection = function () {
    const s = WK.SHOP;
    return '<section class="section section-alt"><div class="wrap"><div class="showroom">' +
      '<div>' +
        '<span class="eyebrow">Geen postbusadres</span>' +
        '<h2 style="margin:10px 0 12px">Loop binnen in Deventer en bekijk het apparaat zelf</h2>' +
        '<p class="muted" style="max-width:52ch">In onze showroom aan de Staverenstraat staan doorgaans zo\'n ' +
          '200 gekeurde apparaten. U kunt ze aanzetten, de trommel voelen en het rapport inzien voordat u koopt.</p>' +
        '<ul class="nap">' +
          '<li>' + icon('pin', 18) + '<div><b>' + esc(s.street) + '</b><span>' + esc(s.zip) + ' ' + esc(s.city) + '</span></div></li>' +
          '<li>' + icon('phone', 18) + '<div><b><a href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a></b>' +
            '<span>Wij nemen zelf op, geen keuzemenu</span></div></li>' +
        '</ul>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><b>Openingstijden</b><span class="mono" style="font-size:11px;color:var(--ok)">Nu geopend</span></div>' +
        '<div class="panel-body"><ul class="hours" style="max-width:none;padding:8px 0">' +
          s.hours.map(h => '<li style="max-width:none"><span>' + h[0] + '</span><span>' + h[1] + '</span></li>').join('') +
        '</ul></div>' +
      '</div>' +
    '</div></div></section>';
  };

  /* -------------------------------------------------------------------- faq */

  P.faqSection = function () {
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head"><div><span class="eyebrow">Veelgestelde vragen</span>' +
        '<h2 style="margin-top:8px">Wat klanten ons het vaakst vragen</h2></div></div>' +
      P.faq(WK.FAQ) +
    '</div></section>';
  };

})(window.WK);
