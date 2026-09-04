/* Witgoed Koning — categoriepagina met filters. */
(function (WK) {
  'use strict';
  const esc = WK.esc, euro = WK.euro, icon = WK.icon, P = WK.parts;

  const SORTS = [
    ['relevantie', 'Meest gekozen'],
    ['nieuwste', 'Nieuwste eerst'],
    ['price-asc', 'Prijs laag – hoog'],
    ['price-desc', 'Prijs hoog – laag'],
    ['korting', 'Hoogste korting']
  ];

  let state = null;

  function fresh(category, search) {
    return { category: category || null, search: search || '', brands: [], conds: [], minWarranty: 0, maxPrice: null, sort: 'relevantie' };
  }

  WK.views.plp = async function (params) {
    const cat = params.category || null;
    const search = params.search || '';
    /* Nieuwe categorie of nieuwe zoekterm betekent: filters terug naar nul. */
    if (!state || state.category !== cat || state.search !== search) state = fresh(cat, search);

    const meta = cat ? WK.CATEGORIES.find(c => c.slug === cat) : null;
    const scope = await WK.store.listProducts({ category: cat, search, limit: 200 });
    const facets = buildFacets(scope.items);

    const title = meta ? meta.label : (search ? 'Zoekresultaten voor “' + esc(search) + '”' : 'Hele assortiment');
    const blurb = meta ? meta.blurb : 'Alles wat er op dit moment gekeurd en wel in de werkplaats staat.';

    return '<div class="wrap">' +
      P.crumbs([{ label: 'Home', href: '#/' }, { label: title }]) +
      '<div class="plp">' +
        '<aside class="filters" aria-label="Filters">' + renderFilters(facets) + '</aside>' +
        '<div>' +
          '<div class="plp-head">' +
            '<div><h1>' + title + '</h1><p class="sub">' + blurb + '</p></div>' +
            '<div class="sortbar"><label class="sr" for="sortsel">Sorteren</label>' +
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
      maxPrice: Math.ceil(max / 50) * 50
    };
  }

  function renderFilters(f) {
    const brandOpts = f.brands.map(b =>
      '<label class="fopt"><input type="checkbox" data-f="brands" value="' + esc(b.v) + '"' +
      (state.brands.indexOf(b.v) > -1 ? ' checked' : '') + '>' + esc(b.v) +
      '<span class="cnt">' + b.n + '</span></label>').join('');

    const condOpts = f.conds.map(c =>
      '<label class="fopt"><input type="checkbox" data-f="conds" value="' + esc(c.v) + '"' +
      (state.conds.indexOf(c.v) > -1 ? ' checked' : '') + '>' + esc(c.v) +
      '<span class="cnt">' + c.n + '</span></label>').join('');

    const price = state.maxPrice == null ? f.maxPrice : state.maxPrice;

    return '<div class="fgroup"><b>Merk</b>' + brandOpts + '</div>' +
      '<div class="fgroup"><b>Staat</b>' + condOpts +
        '<p class="muted" style="font-size:12px;margin-top:8px">Refurbished B is technisch even goed, maar heeft zichtbare gebruikssporen. Die staan bij het product op de foto.</p>' +
      '</div>' +
      '<div class="fgroup"><b>Garantie</b>' +
        '<label class="fopt"><input type="checkbox" data-f="minWarranty" value="12"' +
        (state.minWarranty === 12 ? ' checked' : '') + '>Minimaal 12 maanden</label>' +
      '</div>' +
      '<div class="fgroup"><b>Prijs tot ' + euro(price) + '</b>' +
        '<input type="range" data-f="maxPrice" min="50" max="' + f.maxPrice + '" step="10" value="' + price +
        '" style="width:100%;accent-color:var(--copper);margin-top:6px">' +
        '<div class="row" style="justify-content:space-between;font-family:var(--f-mono);font-size:11px;color:var(--muted)">' +
          '<span>' + euro(50) + '</span><span>' + euro(f.maxPrice) + '</span></div>' +
      '</div>' +
      '<div class="fgroup" style="border-bottom:0">' +
        '<button class="btn btn-quiet" data-reset style="padding-left:0">Alle filters wissen</button></div>';
  }

  async function renderResults() {
    const { items } = await WK.store.listProducts(state);
    const chips = activeChips();
    if (!items.length) {
      return chips + '<div class="empty"><h3>Geen apparaten met deze combinatie</h3>' +
        '<p class="muted" style="margin:8px 0 16px">Ruim de filters op, of bel ons — de voorraad wisselt dagelijks en wij zoeken graag mee.</p>' +
        '<button class="btn btn-ghost" data-reset>Filters wissen</button></div>';
    }
    return chips +
      '<p class="muted" style="font-size:13.5px;margin-bottom:14px">' + items.length +
      ' apparaten · allemaal op voorraad in Deventer</p>' +
      '<div class="grid-products">' + items.map(P.card).join('') + '</div>';
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
    const rerender = async () => {
      results.innerHTML = await renderResults();
      bindChips();
    };

    root.addEventListener('change', async (e) => {
      const el = e.target.closest('[data-f]');
      if (!el) return;
      const key = el.dataset.f;
      if (el.type === 'checkbox') {
        if (key === 'minWarranty') state.minWarranty = el.checked ? 12 : 0;
        else {
          const arr = state[key];
          const i = arr.indexOf(el.value);
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
      root.querySelectorAll('[data-clear]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const k = btn.dataset.clear;
          if (k === 'maxPrice') state.maxPrice = null;
          else if (k === 'minWarranty') state.minWarranty = 0;
          else state[k] = state[k].filter(v => v !== btn.dataset.val);
          WK.rerender();
        });
      });
    }

    root.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => {
      state = fresh(state.category, state.search);
      WK.rerender();
    }));

    bindChips();
  };

})(window.WK);
