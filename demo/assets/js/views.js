/* Witgoed Koning — weergaven. Elke view geeft een HTML-string terug; app.js
   hangt hem in #app en roept de bijbehorende mount() aan voor gedrag. */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  const esc = WK.esc, euro = WK.euro, icon = WK.icon;
  const P = WK.parts = {};
  WK.views = {};
  WK.mounts = {};

  /* ====================================================== gedeelde delen == */

  P.topbar = function () {
    const s = WK.SHOP;
    return '<div class="topbar"><div class="wrap">' +
      '<ul class="topbar-usps">' +
        '<li>' + icon('truck', 15) + 'Gratis bezorgd én aangesloten in heel Nederland</li>' +
        '<li>' + icon('shield', 15) + '6 tot 12 maanden garantie</li>' +
        '<li>' + icon('recycle', 15) + 'Oud apparaat gratis mee</li>' +
      '</ul>' +
      '<div class="topbar-right">' +
        '<a class="hide-s" href="#/showroom">Showroom Deventer</a>' +
        '<a href="tel:' + s.phoneHref + '">' + icon('phone', 14) + ' ' + esc(s.phone) + '</a>' +
      '</div>' +
    '</div></div>';
  };

  P.header = function () {
    return '<header class="site-header"><div class="wrap">' +
      '<a class="logo" href="#/" aria-label="Witgoed Koning, naar de homepage">' +
        WK.logo(38) +
        '<span class="logo-word">Witgoed Koning<span>Deventer · sinds ' + WK.SHOP.since + '</span></span>' +
      '</a>' +
      '<form class="search" role="search" data-search>' +
        icon('search', 17) +
        '<input type="search" name="q" placeholder="Zoek op merk, model of artikelnummer" aria-label="Zoeken in het assortiment">' +
      '</form>' +
      '<div class="header-actions">' +
        '<a class="icon-btn hide-s" href="#/showroom">' + icon('pin', 19) + '</a>' +
        '<a class="icon-btn cart-btn" href="#/winkelwagen" aria-label="Winkelwagen">' +
          icon('cart', 20) + '<span class="cart-count" data-cart-count hidden>0</span>' +
        '</a>' +
      '</div>' +
    '</div></header>' + P.nav();
  };

  P.nav = function (active) {
    const links = WK.CATEGORIES.map(c =>
      '<a href="#/c/' + c.slug + '"' + (active === c.slug ? ' class="on"' : '') + '>' + esc(c.label) + '</a>'
    ).join('');
    return '<nav class="nav" aria-label="Assortiment"><div class="wrap">' + links +
      '<span class="nav-sep"></span>' +
      '<a class="nav-alt" href="#/showroom">Showroom &amp; service</a>' +
      '</div></nav>';
  };

  P.uspbar = function () {
    const items = [
      ['truck', 'Gratis bezorgd en aangesloten', 'In heel Nederland, ook op de eerste verdieping'],
      ['shield', '6 tot 12 maanden garantie', 'Storing? Wij komen langs of ruilen om'],
      ['recycle', 'Oud apparaat gratis mee', 'Wij voeren het af via een erkende recycler'],
      ['wrench', 'Elk apparaat een keuringsrapport', 'U ziet precies wat is gecontroleerd en vervangen']
    ];
    return '<div class="uspbar"><div class="wrap">' + items.map(i =>
      '<div class="usp">' + icon(i[0], 21) + '<div><b>' + i[1] + '</b><small>' + i[2] + '</small></div></div>'
    ).join('') + '</div></div>';
  };

  P.footer = function () {
    const s = WK.SHOP;
    const cats = WK.CATEGORIES.map(c => '<li><a href="#/c/' + c.slug + '">' + esc(c.label) + '</a></li>').join('');
    return '<footer class="site-footer"><div class="wrap">' +
      '<div class="foot-grid">' +
        '<div>' +
          '<div class="logo">' + WK.logo(36) +
            '<span class="logo-word">Witgoed Koning<span>Deventer · sinds ' + s.since + '</span></span></div>' +
          '<p class="foot-about">Sinds ' + s.since + ' geven wij witgoed van A-merken een tweede leven. ' +
            'Elk apparaat wordt in onze eigen werkplaats gekeurd, hersteld en getest voordat het de deur uit gaat.</p>' +
          '<div class="pay-icons" style="margin-top:16px">' +
            ['iDEAL','Bancontact','Klarna','in3','Overboeking','PIN bij levering']
              .map(p => '<span>' + p + '</span>').join('') +
          '</div>' +
        '</div>' +
        '<div><h4>Assortiment</h4><ul>' + cats + '</ul></div>' +
        '<div><h4>Service</h4><ul>' +
          '<li><a href="#/showroom">Showroom Deventer</a></li>' +
          '<li><a href="#/showroom">Bezorging en aansluiten</a></li>' +
          '<li><a href="#/showroom">Garantie en retour</a></li>' +
          '<li><a href="#/showroom">Veelgestelde vragen</a></li>' +
        '</ul></div>' +
        '<div><h4>Contact</h4><ul>' +
          '<li>' + esc(s.street) + '</li>' +
          '<li>' + esc(s.zip) + ' ' + esc(s.city) + '</li>' +
          '<li><a href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a></li>' +
          '<li><a href="mailto:' + s.email + '">' + esc(s.email) + '</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="foot-bottom">' +
        '<span>© ' + new Date().getFullYear() + ' ' + esc(s.name) + '. Prijzen inclusief btw.</span>' +
        '<span class="mono">KvK ' + esc(s.kvk) + ' · BTW ' + esc(s.btw) + '</span>' +
      '</div>' +
    '</div></footer>';
  };

  /* ------------------------------------------------------- productkaart -- */

  P.media = function (p, size) {
    if (p.images && p.images.length) {
      return '<img src="' + esc(p.images[0].url) + '" alt="' + esc(p.images[0].alt) +
             '" width="' + (size || 160) + '" loading="lazy">';
    }
    return WK.appliance(p.kind, size || 160);
  };

  P.card = function (p) {
    const save = WK.savingPct(p);
    const chips = Object.keys(p.specs).slice(0, 2)
      .map(k => '<span class="chip">' + esc(p.specs[k]) + '</span>').join('');
    return '<article class="card">' +
      '<div class="card-media">' +
        '<div class="badge-row">' +
          '<span class="badge badge-cond">' + esc(p.cond) + '</span>' +
          (save ? '<span class="badge badge-save">' + save + '% korting</span>' : '') +
        '</div>' +
        '<a href="#/p/' + esc(p.slug) + '" aria-label="' + esc(p.title) + '">' + P.media(p, 150) + '</a>' +
      '</div>' +
      '<div class="card-body">' +
        '<span class="card-brand">' + esc(p.brand) + '</span>' +
        '<h3><a href="#/p/' + esc(p.slug) + '">' + esc(p.title) + '</a></h3>' +
        '<div class="card-specs">' + chips +
          '<span class="chip">' + p.warranty + ' mnd garantie</span></div>' +
        '<div class="card-foot">' +
          '<div class="price-row"><span class="price">' + euro(p.price) + '</span>' +
            (p.compareAt ? '<span class="was">' + euro(p.compareAt) + '</span>' : '') + '</div>' +
          '<span class="stockline"><i class="dot"></i>' +
            (p.stock > 1 ? p.stock + ' op voorraad' : 'Op voorraad — uniek exemplaar') + '</span>' +
          '<span class="sku">' + esc(p.sku) + '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  };

  P.crumbs = function (trail) {
    return '<nav class="crumbs" aria-label="Kruimelpad">' +
      trail.map((t, i) => (i ? '<span aria-hidden="true">›</span>' : '') +
        (t.href ? '<a href="' + t.href + '">' + esc(t.label) + '</a>' : '<span>' + esc(t.label) + '</span>')
      ).join('') + '</nav>';
  };

  P.reviewCard = function (r) {
    return '<article class="review">' + WK.stars(r.rating, 14) +
      '<p>' + esc(r.text) + '</p>' +
      '<footer><b>' + esc(r.name) + '</b><span>·</span><span>' + esc(r.city) + '</span>' +
      '<span>·</span><span class="verified">' + icon('checkc', 13) + 'Geverifieerd</span></footer>' +
      '</article>';
  };

  P.faq = function (items) {
    return '<div class="faq">' + items.map((f, i) =>
      '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'
    ).join('') + '</div>';
  };

})(window.WK);
