/* Witgoed Koning — categoriepagina. Lijstweergave met filters, zoals in de
   meeste Nederlandse witgoedwinkels. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  const SORTS = [
    ['relevantie', 'Meest gekozen'],
    ['price-asc', 'Prijs laag – hoog'],
    ['price-desc', 'Prijs hoog – laag'],
    ['nieuwste', 'Nieuwste eerst'],
    ['korting', 'Hoogste korting']
  ];

  let state = null;

  function fresh(category, search) {
    return { category: category || null, search: search || '', brands: [], conds: [], minWarranty: 0, maxPrice: null, sort: 'relevantie' };
  }

  WK.views.plp = async function (params) {
    const cat = params.category || null;
    const search = params.search || '';
    if (!state || state.category !== cat || state.search !== search) state = fresh(cat, search);

    const meta = cat ? WK.CATEGORIES.find(c => c.slug === cat) : null;
    const scope = await WK.store.listProducts({ category: cat, search, limit: 200 });
    const facets = buildFacets(scope.items);

    const title = meta ? meta.label : (search ? 'Zoekresultaten voor “' + esc(search) + '”' : 'Hele assortiment');
    const blurb = meta ? meta.blurb : 'Alles wat er op dit moment gekeurd en wel in Deventer staat.';

    return '<div class="wrap">' +
      P.crumbs([{ label: 'Home', href: '#/' }, { label: title }]) +
      '<div class="plp">' +
        '<aside class="filters" aria-label="Filters">' + renderFilters(facets) + '</aside>' +
        '<div>' +
          '<div class="plp-head">' +
            '<div><h1>' + title + '</h1><p>' + blurb + '</p></div>' +
            '<div class="sortbar"><label for="sortsel">Sorteren</label>' +
              '<select id="sortsel" data-sort>' + SORTS.map(s =>
                '<option value="' + s[0] + '"' + (state.sort === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'
              ).join('') + '</select></div>' +
          '</div>' +
          '<div data-results>' + await renderResults() + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  };

  function buildFacets(items) {
    const brands = {}, conds = {};
    let max = 0;
    items.forEach(p => {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
      conds[p.cond] = (conds[p.cond] || 0) + 1;
      max = Math.max(max, p.price);
    });
    return {
      brands: Object.keys(brands).sort().map(b => ({ v: b, n: brands[b] })),
      conds: ['Nieuwstaat', 'Refurbished A', 'Refurbished B'].filter(c => conds[c]).map(c => ({ v: c, n: conds[c] })),
      maxPrice: Math.max(100, Math.ceil(max / 50) * 50)
    };
  }

  function renderFilters(f) {
    const price = state.maxPrice == null ? f.maxPrice : state.maxPrice;
    const box = (key, list) => list.map(o =>
      '<label class="fopt"><input type="checkbox" data-f="' + key + '" value="' + esc(o.v) + '"' +
      (state[key].indexOf(o.v) > -1 ? ' checked' : '') + '>' + esc(o.v) +
      '<span class="cnt">' + o.n + '</span></label>').join('');

    return '<div class="fgroup"><b>Merk</b>' + box('brands', f.brands) + '</div>' +
      '<div class="fgroup"><b>Staat</b>' + box('conds', f.conds) +
        '<p class="fhint">Refurbished B is technisch net zo goed, maar heeft zichtbare gebruikssporen. ' +
        'Die staan bij het apparaat op de foto.</p></div>' +
      '<div class="fgroup"><b>Garantie</b>' +
        '<label class="fopt"><input type="checkbox" data-f="minWarranty" value="12"' +
        (state.minWarranty === 12 ? ' checked' : '') + '>Minimaal 12 maanden</label></div>' +
      '<div class="fgroup"><b>Prijs tot ' + euro(price) + '</b>' +
        '<input type="range" data-f="maxPrice" min="50" max="' + f.maxPrice + '" step="10" value="' + price +
        '" style="width:100%;accent-color:var(--cta);margin-top:4px" aria-label="Maximumprijs">' +
        '<div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--muted)">' +
          '<span>' + euro(50) + '</span><span>' + euro(f.maxPrice) + '</span></div></div>' +
      '<div class="fgroup" style="border-bottom:0">' +
        '<button class="btn btn-quiet" data-reset style="padding-left:0">Alle filters wissen</button></div>';
  }

  async function renderResults() {
    const { items } = await WK.store.listProducts(state);
    const chips = activeChips();
    if (!items.length) {
      return chips + '<div class="empty"><h2>Geen apparaten met deze combinatie</h2>' +
        '<p class="muted" style="margin:8px 0 14px">Wis een filter, of bel ons op ' + esc(WK.SHOP.phone) +
        ' — de voorraad wisselt dagelijks en wij zoeken graag mee.</p>' +
        '<button class="btn btn-ghost" data-reset>Filters wissen</button></div>';
    }
    return chips +
      '<p class="resultcount">' + items.length + ' apparaten gevonden, allemaal op voorraad in Deventer</p>' +
      '<div class="plist">' + items.map(P.row).join('') + '</div>';
  }

  function activeChips() {
    const chips = [];
    state.brands.forEach(b => chips.push(['brands', b, b]));
    state.conds.forEach(c => chips.push(['conds', c, c]));
    if (state.minWarranty) chips.push(['minWarranty', '12', 'Minimaal 12 maanden garantie']);
    if (state.maxPrice != null) chips.push(['maxPrice', '', 'Tot ' + euro(state.maxPrice)]);
    if (!chips.length) return '';
    return '<div class="chips-active">' + chips.map(c =>
      '<button class="chip-x" data-clear="' + c[0] + '" data-val="' + esc(c[1]) + '">' +
      esc(c[2]) + icon('x', 12) + '</button>').join('') + '</div>';
  }

  WK.mounts.plp = function (root) {
    const results = root.querySelector('[data-results]');
    const rerender = async () => { results.innerHTML = await renderResults(); bindChips(); };

    root.addEventListener('change', async (e) => {
      const el = e.target.closest('[data-f]');
      if (!el) return;
      const key = el.dataset.f;
      if (el.type === 'checkbox') {
        if (key === 'minWarranty') state.minWarranty = el.checked ? 12 : 0;
        else {
          const arr = state[key], i = arr.indexOf(el.value);
          if (el.checked && i === -1) arr.push(el.value);
          if (!el.checked && i > -1) arr.splice(i, 1);
        }
      } else if (el.type === 'range') {
        state.maxPrice = parseInt(el.value, 10);
        const label = el.closest('.fgroup').querySelector('b');
        if (label) label.textContent = 'Prijs tot ' + euro(state.maxPrice);
      }
      await rerender();
    });

    const sortSel = root.querySelector('[data-sort]');
    if (sortSel) sortSel.addEventListener('change', async () => { state.sort = sortSel.value; await rerender(); });

    function bindChips() {
      root.querySelectorAll('[data-clear]').forEach(btn => btn.addEventListener('click', () => {
        const k = btn.dataset.clear;
        if (k === 'maxPrice') state.maxPrice = null;
        else if (k === 'minWarranty') state.minWarranty = 0;
        else state[k] = state[k].filter(v => v !== btn.dataset.val);
        WK.rerender();
      }));
    }

    root.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => {
      state = fresh(state.category, state.search);
      WK.rerender();
    }));

    bindChips();
  };

})(window.WK);
