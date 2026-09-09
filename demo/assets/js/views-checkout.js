/* Witgoed Koning — winkelwagen, afrekenen, showroom. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  const SERVICE_WARRANTY = {
    id: 'svc-garantie', title: 'Garantie verlengen naar 24 maanden', sku: 'WK-SVC-G24',
    brand: 'Service', kind: 'wrench', price: 49, compareAt: 0, warranty: 24
  };

  /* ==================================================== winkelwagen ======= */

  WK.views.cart = async function () {
    const lines = WK.cart.lines();
    if (!lines.length) return emptyCart();

    const t = WK.cart.totals();
    const d = WK.formatDate(WK.deliveryDate(2));
    const hasWarranty = lines.some(l => l.id === SERVICE_WARRANTY.id);

    return '<div class="wrap">' +
      P.crumbs([{ label: 'Home', href: '#/' }, { label: 'Winkelwagen' }]) +
      '<div class="cartpage">' +
        '<div>' +
          '<h1 style="margin-bottom:4px">Uw winkelwagen</h1>' +
          '<p class="muted" style="margin-bottom:8px">' + WK.cart.count() +
            ' artikel' + (WK.cart.count() === 1 ? '' : 'en') + ' · bezorgen en aansluiten zit bij de prijs in</p>' +
          '<div>' + lines.map(lineItem).join('') + '</div>' +
          (hasWarranty ? '' : upsell()) +
        '</div>' +
        '<aside class="summary">' +
          '<h2 style="font-size:18px">Overzicht</h2>' +
          '<ul class="sum-rows">' +
            '<li><span>Artikelen</span><span class="num">' + euro(t.subtotal) + '</span></li>' +
            '<li><span>Bezorgen en aansluiten</span><span class="free">gratis</span></li>' +
            '<li><span>Oud apparaat meenemen</span><span class="free">gratis</span></li>' +
            (t.saving ? '<li><span>Uw voordeel t.o.v. nieuw</span><span class="free">− ' + euro(t.saving) + '</span></li>' : '') +
          '</ul>' +
          '<div class="sum-total"><b>Totaal</b><span class="price">' + euro(t.total) + '</span></div>' +
          '<p class="muted" style="font-size:12px;margin-top:-6px">Inclusief ' + euro(t.vat) + ' btw</p>' +
          '<a class="btn btn-primary btn-lg" href="#/afrekenen">Verder naar afrekenen' + icon('arrow', 17) + '</a>' +
          '<p class="muted" style="font-size:12.5px;text-align:center">' + icon('calendar', 13) +
            ' Kan bezorgd worden op ' + d + '</p>' +
          '<ul class="assurances" style="border-top:1px solid var(--line);padding-top:14px">' +
            '<li>' + icon('shield', 15) + '<span>6 tot 12 maanden garantie met monteur aan huis</span></li>' +
            '<li>' + icon('swap', 15) + '<span>14 dagen bedenktijd, wij halen kosteloos op</span></li>' +
            '<li>' + icon('lock', 15) + '<span>Veilig betalen met iDEAL, of pas bij levering met pin</span></li>' +
          '</ul>' +
          '<a class="btn btn-quiet" href="#/c/wasmachines" style="align-self:center">Verder winkelen</a>' +
        '</aside>' +
      '</div>' +
    '</div>';
  };

  function lineItem(l) {
    return '<div class="lineitem">' +
      '<div class="thumb">' + WK.appliance(l.kind === 'wrench' ? 'wasmachine' : l.kind, 80) + '</div>' +
      '<div class="li-meta">' +
        '<span class="prow-brand">' + esc(l.brand) + '</span>' +
        '<h3>' + (l.service ? esc(l.title) : '<a href="#/p/' + esc(l.slug) + '">' + esc(l.title) + '</a>') + '</h3>' +
        '<span class="deliver">' + icon('check', 14) + 'Op voorraad, ' + l.warranty + ' maanden garantie</span>' +
        '<span class="artnr">Artikelnummer ' + esc(l.sku) + '</span>' +
        (l.max === 1 && !l.service ? '<span class="muted" style="font-size:12.5px">Uniek exemplaar — er is er maar één van</span>' : '') +
      '</div>' +
      '<div class="li-right">' +
        '<span class="price" style="font-size:19px">' + euro(l.price * l.qty) + '</span>' +
        (l.max > 1 ? '<div class="qty">' +
          '<button data-qty="' + esc(l.id) + '" data-d="-1" aria-label="Eén minder">−</button>' +
          '<span>' + l.qty + '</span>' +
          '<button data-qty="' + esc(l.id) + '" data-d="1" aria-label="Eén meer">+</button></div>' : '') +
        '<button class="li-remove" data-remove="' + esc(l.id) + '">Verwijderen</button>' +
      '</div>' +
    '</div>';
  }

  function upsell() {
    return '<div class="upsell" style="margin-top:20px">' + icon('shield', 20) +
      '<div><b>Garantie verlengen naar 24 maanden — ' + euro(SERVICE_WARRANTY.price) + '</b>' +
      '<p>Dezelfde dekking, twee jaar lang: monteur aan huis, onderdelen en arbeid inbegrepen. ' +
        'Achteraf bijkopen kan niet.</p>' +
      '<button data-upsell>Toevoegen aan bestelling</button></div></div>';
  }

  function emptyCart() {
    return '<div class="wrap"><div class="empty" style="margin:60px auto;max-width:520px">' +
      icon('cart', 34) +
      '<h2 style="margin:14px 0 8px">Uw winkelwagen is leeg</h2>' +
      '<p class="muted" style="margin-bottom:20px">Bekijk wat er deze week gekeurd is — de voorraad wisselt dagelijks.</p>' +
      '<a class="btn btn-primary" href="#/c/wasmachines">Bekijk de wasmachines</a>' +
      '</div></div>';
  }

  WK.mounts.cart = function (root) {
    root.addEventListener('click', (e) => {
      const q = e.target.closest('[data-qty]');
      if (q) {
        const line = WK.cart.lines().find(l => l.id === q.dataset.qty);
        WK.cart.setQty(q.dataset.qty, line.qty + parseInt(q.dataset.d, 10));
        return WK.rerender();
      }
      const r = e.target.closest('[data-remove]');
      if (r) { WK.cart.remove(r.dataset.remove); return WK.rerender(); }
      if (e.target.closest('[data-upsell]')) {
        WK.cart.addService(SERVICE_WARRANTY);
        WK.toast('Garantie verlengd naar 24 maanden');
        return WK.rerender();
      }
    });
  };

  /* ====================================================== afrekenen ======= */

  const co = { step: 1, slot: 1, pay: 'ideal', done: false, orderNr: null };
  WK.resetCheckout = () => { co.step = 1; co.done = false; co.orderNr = null; };

  const STEPS = ['Uw gegevens', 'Bezorging', 'Betalen'];

  WK.views.checkout = async function () {
    if (co.done) return confirmation();
    const lines = WK.cart.lines();
    if (!lines.length) return emptyCart();

    return '<div class="wrap">' +
      P.crumbs([{ label: 'Winkelwagen', href: '#/winkelwagen' }, { label: 'Afrekenen' }]) +
      '<div class="checkout">' +
        '<div>' +
          '<div class="progress">' + STEPS.map((s, i) => {
            const n = i + 1;
            const cls = co.step === n ? ' on' : (co.step > n ? ' done' : '');
            return '<div class="pstep' + cls + '"><span class="n">' +
              (co.step > n ? '✓' : n) + '</span>' + s + '</div>';
          }).join('') + '</div>' +
          (co.step === 1 ? stepGegevens() : co.step === 2 ? stepBezorging() : stepBetalen()) +
        '</div>' +
        orderSummary(lines) +
      '</div>' +
    '</div>';
  };

  function stepGegevens() {
    return '<section><h1 style="font-size:24px;margin-bottom:6px">Waar mag het naartoe?</h1>' +
      '<p class="muted" style="margin-bottom:20px">U hoeft geen account aan te maken.</p>' +
      '<form class="formgrid" data-step="1">' +
        '<div class="field"><label for="vn">Voornaam</label><input id="vn" name="vn" autocomplete="given-name" required></div>' +
        '<div class="field"><label for="an">Achternaam</label><input id="an" name="an" autocomplete="family-name" required></div>' +
        '<div class="field"><label for="pc">Postcode</label><input id="pc" name="pc" placeholder="1234 AB" autocomplete="postal-code" required></div>' +
        '<div class="field"><label for="hn">Huisnummer + toevoeging</label><input id="hn" name="hn" autocomplete="address-line2" required></div>' +
        '<div class="field full"><label for="st">Straat en woonplaats</label><input id="st" name="st" autocomplete="street-address" placeholder="Wordt automatisch aangevuld"></div>' +
        '<div class="field"><label for="em">E-mailadres</label><input id="em" name="em" type="email" autocomplete="email" required>' +
          '<small>Hierop ontvangt u de bevestiging en het keuringsrapport.</small></div>' +
        '<div class="field"><label for="tl">Mobiel nummer</label><input id="tl" name="tl" type="tel" autocomplete="tel" required>' +
          '<small>De bezorger sms\'t u een half uur van tevoren.</small></div>' +
        '<div class="field full">' +
          '<label for="op">Waar komt het apparaat te staan?</label>' +
          '<select id="op" name="op">' +
            '<option>Begane grond</option><option>Eerste verdieping</option>' +
            '<option>Tweede verdieping of hoger</option><option>Kelder of souterrain</option>' +
          '</select>' +
          '<small>Wij dragen kosteloos naar boven. Goed om te weten voor de planning.</small>' +
        '</div>' +
      '</form>' +
      '<div class="checkout-actions">' +
        '<a class="btn btn-quiet" href="#/winkelwagen">Terug naar winkelwagen</a>' +
        '<button class="btn btn-primary" data-next>Verder naar bezorging' + icon('arrow', 16) + '</button>' +
      '</div></section>';
  }

  function stepBezorging() {
    const slots = [0, 1, 2].map(i => {
      const d = WK.deliveryDate(2 + i);
      return { d, label: WK.formatDate(d) };
    });
    const dayparts = ['08:00 – 12:00', '12:00 – 17:00', '17:00 – 21:00'];

    return '<section><h1 style="font-size:24px;margin-bottom:6px">Wanneer komt het uit?</h1>' +
      '<p class="muted" style="margin-bottom:20px">Wij bezorgen zelf, met eigen monteurs. Geen pakketdienst.</p>' +
      '<div class="slots" data-slots>' + slots.map((s, i) =>
        '<button class="slot' + (co.slot === i ? ' on' : '') + '" data-slot="' + i + '">' +
        '<b>' + s.label.charAt(0).toUpperCase() + s.label.slice(1) + '</b>' +
        '<small>' + dayparts[i] + '</small>' +
        '<span class="free">Gratis bezorgd en aangesloten</span></button>'
      ).join('') + '</div>' +
      '<div class="notice" style="margin-top:18px">' + icon('info', 16) +
        '<span>Onze monteurs sluiten het apparaat aan en draaien een proefprogramma voordat zij weggaan. ' +
        'Zorg dat de aansluiting bereikbaar is en dat uw oude apparaat leeg en losgekoppeld is.</span></div>' +
      '<div class="field full" style="margin-top:18px"><label for="notes">Opmerking voor de bezorger</label>' +
        '<textarea id="notes" rows="3" placeholder="Bijvoorbeeld: bel bij de buren als ik er niet ben"></textarea></div>' +
      '<div class="checkout-actions">' +
        '<button class="btn btn-quiet" data-back>Terug</button>' +
        '<button class="btn btn-primary" data-next>Verder naar betalen' + icon('arrow', 16) + '</button>' +
      '</div></section>';
  }

  function stepBetalen() {
    const t = WK.cart.totals();
    const opts = [
      ['ideal', 'iDEAL', 'Direct betalen via uw eigen bank', 'Meest gekozen'],
      ['pin', 'Pinnen bij levering', 'U betaalt pas als het apparaat draait', ''],
      ['klarna', 'Klarna — achteraf betalen', 'Binnen 14 dagen na levering, renteloos', ''],
      ['in3', 'in3 — in 3 termijnen', euro(Math.round(t.total / 3)) + ' per maand, renteloos', ''],
      ['overboeking', 'Bankoverschrijving', 'Wij plannen de bezorging zodra het bedrag binnen is', '']
    ];

    return '<section><h1 style="font-size:24px;margin-bottom:6px">Hoe wilt u betalen?</h1>' +
      '<p class="muted" style="margin-bottom:20px">Liever pas betalen als het apparaat draait? Kies pinnen bij levering.</p>' +
      '<div class="paylist" data-pay>' + opts.map(o =>
        '<label class="payopt' + (co.pay === o[0] ? ' on' : '') + '">' +
          '<input type="radio" name="pay" value="' + o[0] + '"' + (co.pay === o[0] ? ' checked' : '') + '>' +
          '<span><b>' + o[1] + '</b><small>' + o[2] + '</small></span>' +
          (o[3] ? '<span class="tag">' + o[3] + '</span>' : '<span></span>') +
        '</label>').join('') + '</div>' +
      '<div class="notice" style="margin-top:18px">' + icon('lock', 16) +
        '<span>Deze demo verwerkt geen echte betaling. Live neemt uw betaalprovider (Mollie of Shopify Payments) ' +
        'het hier over.</span></div>' +
      '<div class="checkout-actions">' +
        '<button class="btn btn-quiet" data-back>Terug</button>' +
        '<button class="btn btn-primary" data-place>Bestelling plaatsen · ' + euro(t.total) + '</button>' +
      '</div></section>';
  }

  function orderSummary(lines) {
    const t = WK.cart.totals();
    const d = WK.formatDate(WK.deliveryDate(2 + co.slot));
    return '<aside class="summary">' +
      '<h2 style="font-size:17px">Uw bestelling</h2>' +
      '<div>' + lines.map(l =>
        '<div class="lineitem" style="grid-template-columns:56px 1fr auto;padding:11px 0">' +
          '<div class="thumb">' + WK.appliance(l.kind === 'wrench' ? 'wasmachine' : l.kind, 44) + '</div>' +
          '<div class="li-meta"><h3 style="font-size:13.5px">' + esc(l.title) + '</h3>' +
            '<span class="artnr">' + esc(l.sku) + ' · ' + l.qty + '×</span></div>' +
          '<span class="num" style="font-size:14px">' + euro(l.price * l.qty) + '</span>' +
        '</div>').join('') + '</div>' +
      '<ul class="sum-rows">' +
        '<li><span>Artikelen</span><span class="num">' + euro(t.subtotal) + '</span></li>' +
        '<li><span>Bezorgen, aansluiten, afvoeren</span><span class="free">gratis</span></li>' +
      '</ul>' +
      '<div class="sum-total"><b>Totaal</b><span class="price">' + euro(t.total) + '</span></div>' +
      '<div class="deliverybox"><b>Gekozen bezorgmoment</b>' +
        '<p class="pc-result"><b>' + d.charAt(0).toUpperCase() + d.slice(1) + '</b></p></div>' +
      '<ul class="assurances" style="border-top:1px solid var(--line);padding-top:14px">' +
        '<li>' + icon('shield', 15) + '<span>Garantie met monteur aan huis</span></li>' +
        '<li>' + icon('swap', 15) + '<span>14 dagen bedenktijd</span></li>' +
        '<li>' + icon('phone', 15) + '<span>Vragen? Bel <a href="tel:' + WK.SHOP.phoneHref +
          '" style="text-decoration:underline">' + esc(WK.SHOP.phone) + '</a></span></li>' +
      '</ul>' +
    '</aside>';
  }

  function confirmation() {
    const d = WK.formatDate(WK.deliveryDate(2 + co.slot));
    return '<div class="wrap" style="max-width:760px"><div class="done-panel" style="margin:40px 0">' +
      '<div class="tick">' + icon('check', 26) + '</div>' +
      '<h1 style="font-size:28px">Bedankt, uw bestelling staat genoteerd</h1>' +
      '<p>Bestelnummer <b>' + esc(co.orderNr) + '</b>. U ontvangt binnen een paar minuten ' +
        'een bevestiging per e-mail, met het keuringsrapport van uw apparaat als bijlage.</p>' +
      '<div class="panel" style="margin-top:26px;text-align:left">' +
        '<div class="panel-head"><b>Wat er nu gebeurt</b></div>' +
        '<div class="panel-body"><ul class="check-list">' +
          '<li><span class="ic">' + icon('check', 16) + '</span><span>Bevestiging per e-mail<em>Met factuur en keuringsrapport</em></span><span class="st">nu</span></li>' +
          '<li><span class="ic">' + icon('check', 16) + '</span><span>Wij bellen om het tijdvak te bevestigen<em>Uiterlijk de dag voor de bezorging</em></span><span class="st">binnenkort</span></li>' +
          '<li><span class="ic">' + icon('check', 16) + '</span><span>Bezorgen, aansluiten en proefdraaien<em>' + esc(d) + '</em></span><span class="st">gepland</span></li>' +
        '</ul></div>' +
      '</div>' +
      '<div style="display:flex;gap:12px;justify-content:center;margin-top:26px;flex-wrap:wrap">' +
        '<a class="btn btn-ghost" href="#/">Terug naar de winkel</a>' +
        '<a class="btn btn-primary" href="tel:' + WK.SHOP.phoneHref + '">Bel ons: ' + esc(WK.SHOP.phone) + '</a>' +
      '</div>' +
    '</div></div>';
  }

  WK.mounts.checkout = function (root) {
    root.addEventListener('click', async (e) => {
      if (e.target.closest('[data-next]')) {
        const form = root.querySelector('form[data-step="1"]');
        if (co.step === 1 && form && !form.reportValidity()) return;
        co.step = Math.min(3, co.step + 1);
        return WK.rerender();
      }
      if (e.target.closest('[data-back]')) { co.step = Math.max(1, co.step - 1); return WK.rerender(); }

      const slot = e.target.closest('[data-slot]');
      if (slot) { co.slot = parseInt(slot.dataset.slot, 10); return WK.rerender(); }

      if (e.target.closest('[data-place]')) {
        /* Live gaat de bestelling hier naar Shopify of WooCommerce. */
        const res = await WK.store.createCheckout(WK.cart.lines());
        if (res && res.url) { window.location.href = res.url; return; }
        co.orderNr = 'WK' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        co.done = true;
        WK.cart.clear();
        return WK.rerender();
      }
    });

    root.addEventListener('change', (e) => {
      if (e.target.name === 'pay') { co.pay = e.target.value; WK.rerender(); }
    });
  };

  /* ======================================================== showroom ====== */

  WK.views.showroom = async function () {
    const s = WK.SHOP;
    return '<div class="wrap">' +
      P.crumbs([{ label: 'Home', href: '#/' }, { label: 'Showroom en service' }]) +
      '<section class="section" style="padding-bottom:8px">' +
        '<h1>Showroom, service en garantie</h1>' +
        '<p class="muted" style="max-width:64ch;margin-top:10px;font-size:16px">Wij zitten sinds ' + s.since +
          ' aan de Staverenstraat in Deventer. Alles wat u online ziet staat daar fysiek, en alles wordt ' +
          'in dezelfde werkplaats gekeurd.</p>' +
      '</section>' +
      P.showroomSection() +
      P.faqSection() +
    '</div>';
  };

  WK.views.notFound = function () {
    return '<div class="wrap"><div class="empty" style="margin:60px auto;max-width:520px">' +
      '<h2>Deze pagina bestaat niet meer</h2>' +
      '<p class="muted" style="margin:10px 0 20px">Mogelijk is het apparaat verkocht — elk toestel is uniek en ' +
        'weg is weg. Bekijk wat er nu op voorraad staat.</p>' +
      '<a class="btn btn-primary" href="#/">Naar de homepage</a></div></div>';
  };

})(window.WK);
