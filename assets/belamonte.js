/* BelaMonte theme — global interactions */
(function () {
  'use strict';

  /* Scroll-reveal (fail-safe: only hides once JS is present) */
  document.documentElement.classList.add('bm-js');
  function initReveal() {
    var sel = '.section__head,.section__bar,.cat-grid,.prod-grid,.style-band,.editorial__text,.editorial__media,.look-grid,.gift,.review-grid,.newsletter';
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('bm-reveal', 'is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { el.classList.add('bm-reveal'); io.observe(el); });
  }
  if (document.readyState !== 'loading') initReveal();
  else document.addEventListener('DOMContentLoaded', initReveal);

  function toast(msg) {
    var t = document.getElementById('bm-toast');
    var tx = document.getElementById('bm-toast-text');
    if (!t || !tx) return;
    tx.textContent = msg;
    t.classList.add('show');
    clearTimeout(window.__bmToast);
    window.__bmToast = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* Mobile menu */
  document.addEventListener('click', function (e) {
    var burger = e.target.closest('[data-burger]');
    if (burger) {
      var panel = document.getElementById('bm-mobile-panel');
      if (panel) panel.classList.toggle('open');
    }
    var close = e.target.closest('[data-mobile-link]');
    if (close) {
      var p = document.getElementById('bm-mobile-panel');
      if (p) p.classList.remove('open');
    }
    var ft = e.target.closest('[data-filter-toggle]');
    if (ft) {
      var aside = ft.closest('[id^="coll-"]').querySelector('.coll-filters');
      if (aside) aside.classList.toggle('is-open');
    }
  });

  /* Update cart count badges */
  function refreshCart() {
    fetch(window.routes.cart_url + '.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.style.display = cart.item_count > 0 ? 'flex' : 'none';
        });
      })
      .catch(function () {});
  }
  refreshCart();

  /* Ajax add to cart on product cards */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form.bm-product-form');
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    var label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; }
    var data = new FormData(form);
    fetch(window.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    })
      .then(function (r) { return r.json(); })
      .then(function (item) {
        toast((item.product_title || item.title || 'Product') + ' \u00b7 ' + window.cartStrings.added);
        refreshCart();
      })
      .catch(function () { toast('Er ging iets mis, probeer opnieuw.'); })
      .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } });
  });

  /* Newsletter inline confirmation (contact form fallback handled by Shopify) */
  /* PDP thumbnail swap */
  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('[data-thumb]');
    if (!thumb) return;
    var main = document.querySelector('[data-pdp-main]');
    if (main) {
      main.src = thumb.getAttribute('data-full') || thumb.src;
      var z = thumb.getAttribute('data-zoom');
      if (z) main.setAttribute('data-zoom', z);
    }
    document.querySelectorAll('.bm-thumb').forEach(function (t) { t.classList.remove('is-active'); });
    thumb.classList.add('is-active');
  });

  /* PDP lightbox */
  function openLightbox(src) {
    var lb = document.getElementById('bm-lightbox');
    var img = document.getElementById('bm-lightbox-img');
    if (!lb || !img) return;
    img.src = src;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    var lb = document.getElementById('bm-lightbox');
    if (!lb) return;
    lb.hidden = true;
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var zoom = e.target.closest('[data-pdp-zoom]');
    if (zoom) {
      var main = zoom.querySelector('[data-pdp-main]') || document.querySelector('[data-pdp-main]');
      if (main) openLightbox(main.getAttribute('data-zoom') || main.src);
      return;
    }
    if (e.target.closest('[data-lightbox-close]') || e.target.id === 'bm-lightbox') {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
