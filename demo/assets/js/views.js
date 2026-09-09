/* Witgoed Koning — gedeelde onderdelen. Elke view geeft HTML terug; app.js
   hangt hem in #app en roept de bijbehorende mount() aan voor gedrag. */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  const esc = WK.esc, euro = WK.euro, icon = WK.icon;
  const P = WK.parts = {};
  WK.views = {};
  WK.mounts = {};

  /* ================================================== kop en voet ======== */

  P.topstrip = function () {
    const s = WK.SHOP;
    return '<div class="topstrip"><div class="wrap">' +
      '<ul>' +
        '<li>' + icon('check', 14) + 'Gratis bezorgd, aangesloten en oud apparaat mee</li>' +
        '<li>' + icon('check', 14) + '6 tot 12 maanden garantie</li>' +
        '<li>' + icon('check', 14) + s.rating.toString().replace('.', ',') + '/10 op Kiyoh</li>' +
      '</ul>' +
      '<div class="right">' +
        '<a href="#/showroom">Showroom Deventer</a>' +
        '<a href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a>' +
      '</div>' +
    '</div></div>';
  };

  P.header = function () {
    return '<header class="site-header"><div class="wrap">' +
      '<a class="logo" href="#/" aria-label="Witgoed Koning, naar de homepage">' + WK.logo(36) +
        '<span class="logo-word">Witgoed Koning<span>Deventer, sinds ' + WK.SHOP.since + '</span></span></a>' +
      '<form class="search" role="search" data-search>' +
        '<input type="search" name="q" placeholder="Zoek op merk, model of artikelnummer" aria-label="Zoeken">' +
        '<button type="submit" aria-label="Zoeken">' + icon('search', 17) + '</button>' +
      '</form>' +
      '<div class="header-actions">' +
        '<a class="hbtn" href="tel:' + WK.SHOP.phoneHref + '">' + icon('phone', 19) +
          '<span class="lbl">Bel ons<small>' + esc(WK.SHOP.phone) + '</small></span></a>' +
        '<a class="hbtn cart-btn" href="#/winkelwagen">' + icon('cart', 20) +
          '<span class="cart-count" data-cart-count hidden>0</span>' +
          '<span class="lbl">Winkelwagen</span></a>' +
      '</div>' +
    '</div></header>' + P.nav();
  };

  P.nav = function () {
    return '<nav class="nav" aria-label="Assortiment"><div class="wrap">' +
      WK.CATEGORIES.map(c => '<a href="#/c/' + c.slug + '">' + esc(c.label) + '</a>').join('') +
      '<span class="sep"></span>' +
      '<a class="alt" href="#/showroom">Showroom, garantie en bezorging</a>' +
    '</div></nav>';
  };

  P.uspbar = function () {
    return '<div class="uspbar"><ul class="wrap">' + [
      'Gratis bezorgd én aangesloten in heel Nederland',
      'Oud apparaat gratis mee',
      '6 tot 12 maanden garantie',
      'Bij elk apparaat een keuringsrapport'
    ].map(t => '<li>' + icon('check', 15) + t + '</li>').join('') + '</ul></div>';
  };

  P.footer = function () {
    const s = WK.SHOP;
    return '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div>' +
        '<div class="logo">' + WK.logo(34) +
          '<span class="logo-word">Witgoed Koning<span>Deventer, sinds ' + s.since + '</span></span></div>' +
        '<p class="foot-about">Wij geven wasmachines, drogers en vaatwassers van A-merken een tweede leven. ' +
          'Alles wordt in onze eigen werkplaats in Deventer gekeurd, hersteld en getest.</p>' +
        '<div class="paystrip" style="margin-top:14px">' +
          ['iDEAL', 'Pinnen bij levering', 'Klarna', 'in3', 'Overboeking']
            .map(x => '<span>' + x + '</span>').join('') + '</div>' +
      '</div>' +
      '<div><h4>Assortiment</h4><ul>' +
        WK.CATEGORIES.map(c => '<li><a href="#/c/' + c.slug + '">' + esc(c.label) + '</a></li>').join('') +
      '</ul></div>' +
      '<div><h4>Service</h4><ul>' +
        '<li><a href="#/showroom">Showroom Deventer</a></li>' +
        '<li><a href="#/showroom">Bezorgen en aansluiten</a></li>' +
        '<li><a href="#/showroom">Garantie en retour</a></li>' +
        '<li><a href="#/showroom">Veelgestelde vragen</a></li>' +
      '</ul></div>' +
      '<div><h4>Contact</h4><ul>' +
        '<li>' + esc(s.street) + '</li><li>' + esc(s.zip) + ' ' + esc(s.city) + '</li>' +
        '<li><a href="tel:' + s.phoneHref + '">' + esc(s.phone) + '</a></li>' +
        '<li><a href="mailto:' + s.email + '">' + esc(s.email) + '</a></li>' +
      '</ul></div>' +
      '</div><div class="foot-bottom">' +
        '<span>© ' + new Date().getFullYear() + ' ' + esc(s.name) + '. Alle prijzen inclusief btw.</span>' +
        '<span>KvK ' + esc(s.kvk) + ' · BTW ' + esc(s.btw) + '</span>' +
      '</div></div></footer>';
  };

  /* ================================================ productweergave ====== */

  P.media = function (p, size) {
    if (p.images && p.images.length) {
      return '<img src="' + esc(p.images[0].url) + '" alt="' + esc(p.images[0].alt) +
             '" width="' + (size || 150) + '" loading="lazy">';
    }
    return WK.appliance(p.kind, size || 150);
  };

  P.badges = function (p, withCond) {
    const save = WK.savingPct(p);
    return '<div class="badges">' +
      (p.outlet ? '<span class="badge badge-outlet">Outlet</span>' : '') +
      (withCond ? '<span class="badge badge-cond">' + esc(p.cond) + '</span>' : '') +
      (save ? '<span class="badge badge-save">− ' + save + '%</span>' : '') +
    '</div>';
  };

  /* Opsommingstekens: eerst de harde cijfers, dan waarom je dit apparaat wilt. */
  P.bullets = function (p, n) {
    const keys = Object.keys(p.specs);
    const list = [keys.slice(0, 3).map(k => p.specs[k]).join(' · ')];
    if (p.outlet && p.outletReason) list.push('Outlet: ' + p.outletReason);
    (p.highlights || []).forEach(h => list.push(h));
    list.push(p.warranty + ' maanden garantie, monteur komt aan huis');
    return list.slice(0, n || 3);
  };

  P.rating = function (p) {
    return '<span class="rating-line">' + WK.stars(p.rating, 14) +
      '<b>' + p.rating.toString().replace('.', ',') + '</b>' +
      '<span>(' + p.reviews + ' beoordelingen)</span></span>';
  };

  /* Tegel — gebruikt op de homepage. */
  P.card = function (p) {
    return '<article class="card">' +
      '<div class="card-media">' + P.badges(p, true) +
        '<a href="#/p/' + esc(p.slug) + '" aria-label="' + esc(p.title) + '">' + P.media(p, 130) + '</a></div>' +
      '<div class="card-body">' +
        '<h3><a href="#/p/' + esc(p.slug) + '">' + esc(p.title) + '</a></h3>' +
        P.rating(p) +
        '<ul class="bul">' + P.bullets(p, 2).map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
        '<div class="card-foot">' +
          '<div class="price-row"><span class="price">' + euro(p.price) + '</span>' +
            (p.compareAt ? '<span class="was">' + euro(p.compareAt) + '</span>' : '') + '</div>' +
          '<span class="deliver">' + icon('check', 14) + 'Op voorraad, gratis bezorgd</span>' +
          '<button class="btn btn-primary" data-add="' + esc(p.slug) + '">In winkelwagen</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  };

  /* Rij — gebruikt op de categoriepagina, zoals in de meeste NL witgoedshops. */
  P.row = function (p) {
    const save = WK.savingPct(p);
    const dag = WK.shortDate(WK.deliveryDate(2));
    return '<article class="prow">' +
      '<div class="prow-media">' + P.badges(p) +
        '<a href="#/p/' + esc(p.slug) + '" aria-label="' + esc(p.title) + '">' + P.media(p, 132) + '</a></div>' +
      '<div class="prow-main">' +
        '<span class="prow-brand">' + esc(p.brand) +
          '<span class="badge badge-cond" style="margin-left:8px">' + esc(p.cond) + '</span></span>' +
        '<h3><a href="#/p/' + esc(p.slug) + '">' + esc(p.title) + '</a></h3>' +
        P.rating(p) +
        '<ul class="bul">' + P.bullets(p, 3).map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
        '<span class="artnr">Artikelnummer ' + esc(p.sku) + ' · ' +
          (p.stock > 1 ? p.stock + ' op voorraad' : 'uniek exemplaar, één op voorraad') + '</span>' +
      '</div>' +
      '<div class="prow-buy">' +
        '<span class="price">' + euro(p.price) + '</span>' +
        (p.compareAt ? '<div class="price-row"><span class="was">' + euro(p.compareAt) + '</span>' +
          '<span class="saving">u bespaart ' + euro(p.compareAt - p.price) + '</span></div>' : '') +
        '<span class="deliver">' + icon('truck', 15) + 'Bezorgd op ' + esc(dag) + '</span>' +
        '<button class="btn btn-primary" data-add="' + esc(p.slug) + '">In winkelwagen</button>' +
        '<a class="btn btn-ghost" href="#/p/' + esc(p.slug) + '" style="width:100%">Bekijken</a>' +
      '</div>' +
    '</article>';
  };

  /* ======================================================== overig ======== */

  P.crumbs = function (trail) {
    return '<nav class="crumbs" aria-label="Kruimelpad">' + trail.map((t, i) =>
      (i ? '<span aria-hidden="true">›</span>' : '') +
      (t.href ? '<a href="' + t.href + '">' + esc(t.label) + '</a>' : '<span>' + esc(t.label) + '</span>')
    ).join('') + '</nav>';
  };

  P.reviewCard = function (r) {
    return '<article class="review">' +
      '<header>' + WK.stars(r.rating, 15) + '<b>' + esc(r.name) + '</b></header>' +
      '<p>' + esc(r.text) + '</p>' +
      '<footer><span>' + esc(r.city) + '</span><span>·</span><span>' + esc(r.date) + '</span>' +
      '<span>·</span><span class="verified">' + icon('checkc', 13) + 'Geverifieerde koper</span></footer>' +
    '</article>';
  };

  P.faq = function (items) {
    return '<div class="faq">' + items.map((f, i) =>
      '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'
    ).join('') + '</div>';
  };

})(window.WK);
