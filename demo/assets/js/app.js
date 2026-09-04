/* Witgoed Koning — router en opstart. */
(function (WK) {
  'use strict';

  const app = document.getElementById('app');
  const top = document.getElementById('chrome-top');
  const bottom = document.getElementById('chrome-bottom');

  let current = null;          // { view, params, mount }
  let leaveFns = [];

  /* Views registreren opruimwerk (observers, timers) via WK.onLeave. */
  WK.onLeave = (fn) => leaveFns.push(fn);

  /* ---------------------------------------------------------------- routes */

  function parse(hash) {
    const raw = (hash || '#/').replace(/^#/, '');
    const [path, qs] = raw.split('?');
    const q = new URLSearchParams(qs || '');
    const seg = path.split('/').filter(Boolean);

    if (!seg.length) return { view: 'home', params: {} };
    if (seg[0] === 'c') return { view: 'plp', params: { category: seg[1] || null } };
    if (seg[0] === 'p') return { view: 'pdp', params: { slug: seg[1] } };
    if (seg[0] === 'zoeken') return { view: 'plp', params: { search: q.get('q') || '' } };
    if (seg[0] === 'winkelwagen') return { view: 'cart', params: {} };
    if (seg[0] === 'afrekenen') return { view: 'checkout', params: {} };
    if (seg[0] === 'showroom') return { view: 'showroom', params: {} };
    return { view: 'notFound', params: {} };
  }

  const TITLES = {
    home: 'Witgoed Koning — tweedehands witgoed van A-merken, bezorgd en aangesloten',
    plp: 'Assortiment — Witgoed Koning',
    pdp: 'Witgoed Koning',
    cart: 'Winkelwagen — Witgoed Koning',
    checkout: 'Afrekenen — Witgoed Koning',
    showroom: 'Showroom en service — Witgoed Koning',
    notFound: 'Niet gevonden — Witgoed Koning'
  };

  /* ----------------------------------------------------------------- render */

  async function render(route, keepScroll) {
    leaveFns.forEach(fn => { try { fn(); } catch (e) { /* opruimen mag nooit blokkeren */ } });
    leaveFns = [];
    current = route;

    const view = WK.views[route.view] || WK.views.notFound;
    app.setAttribute('aria-busy', 'true');
    try {
      app.innerHTML = await view(route.params);
    } catch (err) {
      console.error(err);
      app.innerHTML = '<div class="wrap"><div class="empty" style="margin:60px auto;max-width:560px">' +
        '<h2>De catalogus is even niet bereikbaar</h2>' +
        '<p class="muted" style="margin:10px 0 18px">Probeer het zo nog eens, of bel ons op ' +
        WK.SHOP.phone + '. Wij hebben alles ook gewoon op voorraad in Deventer.</p>' +
        '<button class="btn btn-ghost" onclick="location.reload()">Opnieuw proberen</button></div></div>';
    }
    app.removeAttribute('aria-busy');

    const mount = WK.mounts[route.view];
    if (mount) mount(app, route.params);

    document.title = TITLES[route.view] || TITLES.home;
    markNav(route);
    updateBadge();
    if (!keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }

  /* Opnieuw tekenen zonder te scrollen — voor filters, winkelwagen, checkout. */
  WK.rerender = () => render(current, true);

  function markNav(route) {
    const active = route.view === 'plp' ? route.params.category : null;
    top.querySelectorAll('.nav a').forEach(a => {
      a.classList.toggle('on', !!active && a.getAttribute('href') === '#/c/' + active);
    });
  }

  function updateBadge() {
    const n = WK.cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  /* -------------------------------------------------------------- opstarten */

  function boot() {
    top.innerHTML = WK.parts.topbar() + WK.parts.header();
    bottom.innerHTML = WK.parts.footer();

    const form = top.querySelector('[data-search]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.q.value.trim();
      location.hash = q ? '#/zoeken?q=' + encodeURIComponent(q) : '#/';
    });

    /* "In de winkelwagen" werkt overal, ook in de sticky balk. */
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const p = await WK.store.getProduct(btn.dataset.add);
      if (!p) return;
      WK.cart.add(p, 1);
      WK.toast(p.brand + ' ' + p.model + ' is toegevoegd');
      updateBadge();
    });

    WK.cart.onChange(updateBadge);
    window.addEventListener('hashchange', () => {
      if (location.hash !== '#/afrekenen') WK.resetCheckout();
      render(parse(location.hash));
    });

    render(parse(location.hash));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window.WK);
