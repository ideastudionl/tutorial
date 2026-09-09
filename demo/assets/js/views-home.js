/* Witgoed Koning — homepage. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  WK.views.home = async function () {
    const all = (await WK.store.listProducts({ limit: 200 })).items;
    const counts = {};
    WK.CATEGORIES.forEach(c => {
      const list = all.filter(p => WK.inCategory(p, c.slug));
      counts[c.slug] = { n: list.length, min: list.length ? Math.min.apply(null, list.map(p => p.price)) : 0 };
    });

    const populair = all.filter(p => !p.outlet)
      .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews)).slice(0, 4);
    const outlet = all.filter(p => p.outlet).sort((a, b) => a.price - b.price).slice(0, 4);

    return P.uspbar() + hero() + cats(counts) +
      productSection('Meest gekozen deze maand',
        'Onze best beoordeelde wasmachines, drogers en vaatwassers.',
        'Hele assortiment', '#/c/wasmachines', populair) +
      productSection('Outlet — extra afgeprijsd',
        'Technisch helemaal in orde, maar met een deuk of een kras. Wat eraan mankeert staat erbij, met foto.',
        'Hele outlet', '#/c/outlet', outlet, true) +
      dossier() + how() + reviews() + P.showroomSection() + faq();
  };

  /* ------------------------------------------------------------------ hero */

  function hero() {
    const s = WK.SHOP;
    return '<section class="hero"><div class="wrap">' +
      '<div>' +
        '<h1>Tweedehands wasmachines, drogers en vaatwassers van A-merken</h1>' +
        '<p class="lead">Miele, Bosch, Siemens en AEG, gekeurd en hersteld in onze eigen werkplaats ' +
          'in Deventer. Een wasmachine vanaf ' + euro(229) + ', bij u thuis aangesloten en draaiend.</p>' +
        '<ul class="hero-points">' + [
          'Gratis bezorgd én aangesloten', 'Oud apparaat gratis mee',
          '6 tot 12 maanden garantie', 'Binnen 1 tot 5 werkdagen'
        ].map(t => '<li>' + icon('check', 15) + t + '</li>').join('') + '</ul>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary" href="#/c/wasmachines">Bekijk de wasmachines</a>' +
          '<a class="btn btn-ghost" href="#/c/outlet">Naar de outlet</a>' +
        '</div>' +
      '</div>' +
      '<div class="ratingbox">' +
        '<div><span class="big">' + s.rating.toString().replace('.', ',') + '<small>/10</small></span></div>' +
        WK.stars(Math.round(s.rating / 2), 17) +
        '<p>' + s.reviewCount.toLocaleString('nl-NL') + ' beoordelingen</p>' +
        '<p class="src">Onafhankelijk verzameld via Kiyoh. Wij plaatsen ook de lagere cijfers.</p>' +
      '</div>' +
    '</div></section>';
  }

  /* ---------------------------------------------------------- categorieën */

  function cats(counts) {
    return '<section class="section"><div class="wrap">' +
      '<div class="cats">' + WK.CATEGORIES.map(c => {
        const k = counts[c.slug];
        return '<a class="cat" href="#/c/' + c.slug + '">' +
          WK.appliance(c.kind, 66) +
          '<div><b>' + esc(c.label) + '</b>' +
          '<small>' + k.n + ' op voorraad</small>' +
          '<span class="from">vanaf ' + (k.n ? euro(k.min) : '—') + '</span></div></a>';
      }).join('') + '</div>' +
    '</div></section>';
  }

  /* --------------------------------------------------------- productblok */

  function productSection(title, sub, linkLabel, href, items, band) {
    if (!items.length) return '';
    return '<section class="section' + (band ? ' band' : '') + '"><div class="wrap">' +
      '<div class="section-head">' +
        '<div><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p></div>' +
        '<a href="' + href + '">' + esc(linkLabel) + ' →</a>' +
      '</div>' +
      '<div class="grid-products">' + items.map(P.card).join('') + '</div>' +
    '</div></section>';
  }

  /* ------------------------------------------------- het keuringsrapport */

  function dossier() {
    const demo = WK.PRODUCTS.find(p => (p.refurb || []).some(r => r.status === 'repl')) || WK.PRODUCTS[0];
    return '<section class="section"><div class="wrap"><div class="twocol">' +
      '<div>' +
        '<h2>Bij elk apparaat zit een keuringsrapport</h2>' +
        '<p class="muted" style="margin-top:10px;max-width:56ch">Tweedehands kopen is spannend omdat u niet ' +
          'weet wat u krijgt. Daarom krijgt elk toestel bij ons een eigen artikelnummer en een eigen rapport: ' +
          'welke onderdelen zijn gecontroleerd, welke zijn vervangen, hoeveel draaiuren erop staan en welke ' +
          'gebruikssporen erop zitten. Ook de sporen die u liever niet ziet.</p>' +
        '<ul class="nap">' +
          '<li>' + icon('wrench', 17) + '<div><b>Eigen werkplaats in Deventer</b>' +
            '<span>Onze monteurs herstellen zelf. Wij verkopen geen ongeziene partijen door.</span></div></li>' +
          '<li>' + icon('tag', 17) + '<div><b>Foto\'s van dít exemplaar</b>' +
            '<span>Geen stockfoto. U krijgt de machine die op de foto staat.</span></div></li>' +
          '<li>' + icon('shield', 17) + '<div><b>Garantie met monteur aan huis</b>' +
            '<span>6 tot 12 maanden. Storing? Wij komen langs of ruilen om.</span></div></li>' +
        '</ul>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><b>Keuringsrapport</b><span>' + esc(demo.sku) + '</span></div>' +
        '<ul class="check-list">' + demo.refurb.map(rowHtml).join('') + '</ul>' +
      '</div>' +
    '</div></div></section>';
  }

  function rowHtml(r) {
    return '<li><span class="ic' + (r.status === 'repl' ? ' repl' : '') + '">' +
      icon(r.status === 'repl' ? 'swap' : 'check', 15) + '</span>' +
      '<span>' + esc(r.item) + (r.note ? '<em>' + esc(r.note) + '</em>' : '') + '</span>' +
      '<span class="st' + (r.status === 'repl' ? ' repl' : '') + '">' +
      (r.status === 'repl' ? 'vervangen' : 'akkoord') + '</span></li>';
  }
  P.checkRow = rowHtml;

  /* --------------------------------------------------------- zo werkt het */

  function how() {
    const d = WK.formatDate(WK.deliveryDate(2));
    const items = [
      ['tag', 'U kiest een apparaat', 'Bij elk toestel staan de draaiuren, het bouwjaar en het keuringsrapport. Twijfelt u? Bel ons — wij verkopen u liever het goedkopere model dat past.'],
      ['calendar', 'U kiest dag en dagdeel', 'Wij bezorgen maandag tot en met zaterdag. Bestelt u vandaag vóór 16:00, dan kan het al op ' + d + '.'],
      ['wrench', 'Wij sluiten aan en testen', 'Onze monteurs plaatsen het apparaat, sluiten het aan, draaien een proefprogramma en nemen uw oude apparaat mee.']
    ];
    return '<section class="section band"><div class="wrap">' +
      '<div class="section-head"><div><h2>Zo werkt het</h2></div></div>' +
      '<div class="how">' + items.map(i =>
        '<div class="how-item"><span class="ic">' + icon(i[0], 19) + '</span>' +
        '<div><h3>' + i[1] + '</h3><p>' + i[2] + '</p></div></div>').join('') + '</div>' +
    '</div></section>';
  }

  /* ---------------------------------------------------------------- rest */

  function reviews() {
    const s = WK.SHOP;
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head"><div>' +
        '<h2>' + s.rating.toString().replace('.', ',') + ' uit 10 op ' +
          s.reviewCount.toLocaleString('nl-NL') + ' beoordelingen</h2>' +
        '<p>Onafhankelijk verzameld via Kiyoh. Ook de reviews van vier sterren en lager staan erbij.</p>' +
      '</div></div>' +
      '<div class="reviews">' + WK.REVIEWS.slice(0, 6).map(P.reviewCard).join('') + '</div>' +
    '</div></section>';
  }

  P.showroomSection = function () {
    const s = WK.SHOP;
    return '<section class="section band"><div class="wrap"><div class="twocol">' +
      '<div>' +
        '<h2>Kom langs in Deventer en bekijk het apparaat zelf</h2>' +
        '<p class="muted" style="margin-top:10px;max-width:54ch">In onze showroom aan de Staverenstraat staan ' +
          'doorgaans zo\'n 150 gekeurde wasmachines, drogers en vaatwassers. U kunt ze aanzetten, de trommel ' +
          'voelen en het keuringsrapport inzien voordat u koopt.</p>' +
        '<ul class="nap">' +
          '<li>' + icon('pin', 17) + '<div><b>' + esc(s.street) + '</b><span>' + esc(s.zip) + ' ' + esc(s.city) + '</span></div></li>' +
          '<li>' + icon('phone', 17) + '<div><b><a class="linkblue" href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a></b>' +
            '<span>Wij nemen zelf op, geen keuzemenu</span></div></li>' +
        '</ul>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><b>Openingstijden</b><span style="color:var(--green);font-weight:700">Nu geopend</span></div>' +
        '<ul class="hours">' + s.hours.map(h =>
          '<li><span class="day">' + h[0] + '</span><span>' + h[1] + '</span></li>').join('') + '</ul>' +
      '</div>' +
    '</div></div></section>';
  };

  function faq() {
    return '<section class="section"><div class="wrap">' +
      '<div class="section-head"><div><h2>Veelgestelde vragen</h2></div></div>' +
      P.faq(WK.FAQ) +
    '</div></section>';
  }
  P.faqSection = faq;

})(window.WK);
