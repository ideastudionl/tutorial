/* Witgoed Koning — UI primitives: iconen, apparaat-illustraties, formatters. */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  const euroFmt = new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  const euroFmt2 = new Intl.NumberFormat('nl-NL', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  WK.euro = (n) => (Number.isInteger(n) ? euroFmt : euroFmt2).format(n);
  WK.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* --------------------------------------------------------------- iconen -- */
  /* Monoline, 1.6px, currentColor. Bewust klein gehouden — alleen wat de
     interface echt gebruikt. */
  const P = {
    truck:   '<path d="M2 6h11v9H2zM13 9h4.2l2.8 3.2V15h-7z"/><circle cx="6" cy="17.5" r="1.9"/><circle cx="16" cy="17.5" r="1.9"/>',
    shield:  '<path d="M12 2.6 4.5 5.6v6c0 4.4 3 8.3 7.5 9.8 4.5-1.5 7.5-5.4 7.5-9.8v-6z"/><path d="m8.7 11.8 2.3 2.3 4.4-4.6"/>',
    recycle: '<path d="M7.6 4.5 4.2 10.3M16.4 4.5l3.4 5.8M4.6 14.4h6.6M12.8 14.4h6.6"/><path d="m3.2 12.2 1.4 2.2 2.3-1M20.8 12.2l-1.4 2.2-2.3-1M9.6 3.4l2.4-1 1.3 2.3"/>',
    clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/>',
    check:   '<path d="m4.5 12.4 4.8 4.8L19.5 7"/>',
    checkc:  '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.7L16.2 9.3"/>',
    swap:    '<path d="M4 8.4h13M13.6 5l3.4 3.4-3.4 3.4M20 15.6H7M10.4 12.2 7 15.6l3.4 3.4"/>',
    search:  '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4 4"/>',
    cart:    '<path d="M2.6 3.4h2.8l2.4 11.2h9.6l2-7.6H6.2"/><circle cx="9.4" cy="19.4" r="1.6"/><circle cx="16.8" cy="19.4" r="1.6"/>',
    phone:   '<path d="M5 3.4h3.4l1.7 4.2-2.1 1.6a12 12 0 0 0 5.8 5.8l1.6-2.1 4.2 1.7V18a2.6 2.6 0 0 1-2.8 2.6C9.2 20 4 14.8 3.4 6.2A2.6 2.6 0 0 1 5 3.4z"/>',
    pin:     '<path d="M12 21.4s7-6.2 7-11.2a7 7 0 1 0-14 0c0 5 7 11.2 7 11.2z"/><circle cx="12" cy="10" r="2.7"/>',
    star:    '<path d="m12 3.6 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z" fill="currentColor" stroke="none"/>',
    arrow:   '<path d="M4.5 12h15M13.6 6l6 6-6 6"/>',
    wrench:  '<path d="M20 5.4a5.4 5.4 0 0 1-7 7L5.6 19.8a2 2 0 0 1-2.8-2.8L10.2 9.6a5.4 5.4 0 0 1 7-7l-3.3 3.3.9 3.4 3.4.9z"/>',
    calendar:'<rect x="3.4" y="5" width="17.2" height="15.6" rx="2"/><path d="M3.4 10h17.2M8.2 3v4M15.8 3v4"/>',
    info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11.2V16.4M12 7.8v.6"/>',
    x:       '<path d="M6 6l12 12M18 6 6 18"/>',
    lock:    '<rect x="4.6" y="10.4" width="14.8" height="10.2" rx="2"/><path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8"/>',
    user:    '<circle cx="12" cy="8.2" r="3.9"/><path d="M4.4 20.4c.6-4 3.8-6.2 7.6-6.2s7 2.2 7.6 6.2"/>',
    tag:     '<path d="M11.4 3.4H20v8.6l-8.8 8.8a1.8 1.8 0 0 1-2.6 0l-6-6a1.8 1.8 0 0 1 0-2.6z"/><circle cx="16.2" cy="7.8" r="1.3"/>'
  };

  WK.icon = function (name, size, extra) {
    const d = P[name] || '';
    const s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"' + (extra ? ' ' + extra : '') + '>' + d + '</svg>';
  };

  WK.stars = function (rating, size) {
    const s = size || 13;
    let out = '<span class="stars" aria-label="' + rating + ' van 5 sterren">';
    for (let i = 0; i < 5; i++) {
      out += '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true" style="opacity:' +
        (i < Math.round(rating) ? 1 : .26) + '">' + P.star + '</svg>';
    }
    return out + '</span>';
  };

  /* ----------------------------------------------- apparaat-illustraties -- */
  /* Vervang deze door echte productfoto's zodra de catalogus gekoppeld is;
     de PDP verwacht per artikel foto's van dát exemplaar. */

  const BODY = 'fill="var(--bg)" stroke="var(--brand)" stroke-width="2.2"';
  const SOFT = 'stroke="var(--line)" stroke-width="1.6" fill="none"';
  const GLASS = 'fill="var(--band)" stroke="var(--brand)" stroke-width="2"';

  const SHAPES = {
    wasmachine:
      '<rect x="26" y="18" width="108" height="124" rx="9" ' + BODY + '/>' +
      '<path d="M26 44h108" ' + SOFT + '/>' +
      '<circle cx="80" cy="95" r="36" ' + GLASS + '/>' +
      '<circle cx="80" cy="95" r="25" ' + SOFT + '/>' +
      '<circle cx="118" cy="31" r="7" fill="none" stroke="var(--cta)" stroke-width="2.2"/>' +
      '<path d="M118 27v4" stroke="var(--cta)" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="40" y="27" width="34" height="8" rx="4" fill="var(--line-2)"/>',
    wasdroger:
      '<rect x="26" y="18" width="108" height="124" rx="9" ' + BODY + '/>' +
      '<path d="M26 44h108" ' + SOFT + '/>' +
      '<circle cx="80" cy="95" r="36" ' + GLASS + '/>' +
      '<path d="M69 88q5.5-7 11 0t11 0M69 102q5.5-7 11 0t11 0" stroke="var(--cta)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="118" cy="31" r="7" fill="none" stroke="var(--cta)" stroke-width="2.2"/>' +
      '<rect x="40" y="27" width="34" height="8" rx="4" fill="var(--line-2)"/>',
    vaatwasser:
      '<rect x="30" y="14" width="100" height="132" rx="8" ' + BODY + '/>' +
      '<path d="M30 40h100" ' + SOFT + '/>' +
      '<rect x="44" y="23" width="46" height="8" rx="4" fill="var(--line-2)"/>' +
      '<circle cx="112" cy="27" r="4.5" fill="var(--cta)"/>' +
      '<rect x="44" y="54" width="72" height="76" rx="5" ' + GLASS + '/>' +
      '<path d="M44 78h72M44 102h72" ' + SOFT + '/>' +
      '<path d="M58 66h14M58 90h20M58 114h11" stroke="var(--line)" stroke-width="2.4" stroke-linecap="round"/>'
  };

  WK.appliance = function (kind, size) {
    const s = size || 160;
    const shape = SHAPES[kind] || SHAPES.wasmachine;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 160 160" role="img" ' +
      'aria-label="Illustratie ' + WK.esc(kind) + '" style="max-width:100%;height:auto">' +
      shape + '</svg>';
  };

  /* ----------------------------------------------------------------- logo -- */
  /* Placeholder-merkteken: wasmachinedeur met kroon. Vervang het <svg> hier
     door het officiële logo — de rest van de site raakt het niet aan. */
  WK.logo = function (size) {
    const s = size || 36;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 40 40" fill="none" role="img" aria-label="Witgoed Koning">' +
      '<path d="M7 4.5 11 8.6 15.5 1.8 20 8.6 24.5 1.8 29 8.6 33 4.5V11H7z" fill="#E8A33D"/>' +
      '<rect x="4" y="12" width="32" height="25" rx="4" fill="#fff"/>' +
      '<circle cx="20" cy="24.5" r="8.4" fill="none" stroke="#123A63" stroke-width="2.4"/>' +
      '<circle cx="20" cy="24.5" r="3.4" fill="none" stroke="#123A63" stroke-width="1.3" opacity=".45"/>' +
      '<rect x="7.5" y="15" width="8" height="2.6" rx="1.3" fill="#123A63" opacity=".3"/>' +
      '</svg>';
  };

  /* ------------------------------------------------------------ leverdatum -- */
  /* Bezorgbelofte: eerstvolgende bezorgdag. Ma-za bezorgen, zondag niet.
     Voor 16:00 besteld telt vandaag mee als verwerkingsdag. */
  const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  const MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];

  WK.deliveryDate = function (offsetDays, from) {
    const d = new Date(from || Date.now());
    let added = 0;
    const want = offsetDays == null ? 2 : offsetDays;
    while (added < want) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++;
    }
    return d;
  };

  WK.formatDate = function (d, withYear) {
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + (withYear ? ' ' + d.getFullYear() : '');
  };

  const DAYS_S = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const MONTHS_S = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  WK.shortDate = (d) => DAYS_S[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS_S[d.getMonth()];

  WK.validPostcode = (v) => /^\s*[1-9][0-9]{3}\s?[a-zA-Z]{2}\s*$/.test(v || '');

  /* ---------------------------------------------------------------- toast -- */
  let toastEl, toastTimer;
  WK.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = WK.icon('checkc', 18) + '<span>' + WK.esc(msg) + '</span>';
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };

})(window.WK);
