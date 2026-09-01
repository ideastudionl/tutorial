/* ==========================================================================
   ForeverC9 — theme runtime
   Vanilla JS, no dependencies, no framework. Everything degrades to working
   HTML when JS fails: forms submit, links navigate, details/summary opens.
   ========================================================================== */

(function () {
  'use strict';

  var config = window.themeConfig || {};
  var strings = window.themeStrings || {};

  /* --- Small helpers ------------------------------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function on(el, type, fn, opts) { if (el) el.addEventListener(type, fn, opts); }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function formatMoney(cents) {
    var format = config.moneyFormat || '€{{amount_with_comma_separator}}';
    var value = (cents / 100);

    function withComma(n, decimals) {
      var parts = n.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return parts.join(',');
    }
    function withPeriod(n, decimals) {
      var parts = n.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    return format.replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, name) {
      switch (name) {
        case 'amount': return withPeriod(value, 2);
        case 'amount_no_decimals': return withPeriod(value, 0);
        case 'amount_with_comma_separator': return withComma(value, 2);
        case 'amount_no_decimals_with_comma_separator': return withComma(value, 0);
        case 'amount_with_space_separator': return withComma(value, 2).replace(/\./g, ' ');
        case 'amount_no_decimals_with_space_separator': return withComma(value, 0).replace(/\./g, ' ');
        default: return '';
      }
    });
  }

  /* --- Focus management ---------------------------------------------------
     Shared by every overlay surface (drawers, search panel, modals). */

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, event) {
    var nodes = $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --- Overlay surface controller ----------------------------------------
     One implementation used by the cart drawer, the mobile menu and the
     search panel, so focus/escape/scroll-lock behaviour cannot drift apart. */

  var openSurfaces = [];

  function lockScroll() {
    if (openSurfaces.length === 1) document.body.classList.add('is-locked');
  }
  function unlockScroll() {
    if (!openSurfaces.length) document.body.classList.remove('is-locked');
  }

  function getOverlay() {
    var overlay = $('[data-overlay]');
    if (overlay) overlay.hidden = false;
    return overlay;
  }

  var Surface = {
    open: function (el, trigger) {
      if (!el || el.classList.contains('is-open')) return;
      el.__returnFocus = trigger || document.activeElement;
      el.classList.add('is-open');
      el.removeAttribute('aria-hidden');
      openSurfaces.push(el);
      lockScroll();

      var overlay = getOverlay();
      if (overlay) overlay.classList.add('is-open');

      if (trigger) trigger.setAttribute('aria-expanded', 'true');

      // Move focus in only after the transition starts, so screen readers and
      // sighted keyboard users land in the same place.
      requestAnimationFrame(function () {
        var target = el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE);
        if (target) target.focus();
      });

      document.dispatchEvent(new CustomEvent('surface:open', { detail: { surface: el } }));
    },

    close: function (el) {
      if (!el || !el.classList.contains('is-open')) return;
      el.classList.remove('is-open');
      openSurfaces = openSurfaces.filter(function (s) { return s !== el; });
      unlockScroll();

      var overlay = $('[data-overlay]');
      if (overlay && !openSurfaces.length) overlay.classList.remove('is-open');

      var trigger = el.__returnFocus;
      if (trigger && trigger.setAttribute) trigger.setAttribute('aria-expanded', 'false');
      if (trigger && trigger.focus) trigger.focus();
      el.__returnFocus = null;

      document.dispatchEvent(new CustomEvent('surface:close', { detail: { surface: el } }));
    },

    closeAll: function () {
      openSurfaces.slice().forEach(Surface.close);
    },

    toggle: function (el, trigger) {
      if (el && el.classList.contains('is-open')) Surface.close(el);
      else Surface.open(el, trigger);
    }
  };

  // Global wiring: [data-open="#id"], [data-close], overlay click, Escape, focus trap.
  on(document, 'click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      var target = $(opener.getAttribute('data-open'));
      Surface.toggle(target, opener);
      return;
    }

    var closer = e.target.closest('[data-close]');
    if (closer) {
      e.preventDefault();
      var surface = closer.closest('.drawer, .search-panel, [data-surface]');
      Surface.close(surface || openSurfaces[openSurfaces.length - 1]);
      return;
    }

    if (e.target.matches('[data-overlay]')) {
      Surface.close(openSurfaces[openSurfaces.length - 1]);
    }
  });

  on(document, 'keydown', function (e) {
    if (!openSurfaces.length) return;
    var current = openSurfaces[openSurfaces.length - 1];
    if (e.key === 'Escape') {
      e.preventDefault();
      Surface.close(current);
    } else if (e.key === 'Tab') {
      trapFocus(current, e);
    }
  });

  window.ThemeSurface = Surface;

  /* --- Sticky header ------------------------------------------------------ */

  (function stickyHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var last = 0;

    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-stuck', y > 8);
      last = y;
    }
    update();
    on(window, 'scroll', update, { passive: true });
  }());

  /* --- Announcement rotator ----------------------------------------------- */

  (function announcement() {
    $$('[data-announcement]').forEach(function (root) {
      var items = $$('.announcement__item', root);
      if (items.length < 2) return;

      var index = 0;
      var interval = parseInt(root.getAttribute('data-interval'), 10) || 5000;
      var timer = null;
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function show(i) {
        index = (i + items.length) % items.length;
        items.forEach(function (item, n) {
          item.classList.toggle('is-active', n === index);
        });
      }

      function start() {
        if (reduced) return;
        stop();
        timer = setInterval(function () { show(index + 1); }, interval);
      }
      function stop() { if (timer) clearInterval(timer); timer = null; }

      on($('[data-announcement-next]', root), 'click', function () { show(index + 1); start(); });
      on($('[data-announcement-prev]', root), 'click', function () { show(index - 1); start(); });

      on(root, 'mouseenter', stop);
      on(root, 'mouseleave', start);
      on(root, 'focusin', stop);
      on(root, 'focusout', start);

      show(0);
      start();
    });
  }());

  /* --- Desktop navigation / mega menu ------------------------------------- */

  (function primaryNav() {
    var nav = $('[data-nav]');
    if (!nav) return;

    var items = $$('.nav__item.has-panel', nav);
    var closeTimer;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var trigger = $('.nav__link', item);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var trigger = $('.nav__link', item);
      if (!trigger) return;

      function open() {
        clearTimeout(closeTimer);
        closeAll(item);
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
      function close() {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }

      on(item, 'mouseenter', open);
      on(item, 'mouseleave', function () {
        closeTimer = setTimeout(close, 120);
      });

      // Keyboard: the trigger is a link to the collection, so Enter should
      // navigate. The panel opens on focus and closes on focus leaving.
      on(item, 'focusin', open);
      on(item, 'focusout', function (e) {
        if (!item.contains(e.relatedTarget)) close();
      });

      on(trigger, 'keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          open();
          var first = item.querySelector('.mega a, .dropdown a');
          if (first) first.focus();
        }
      });
    });

    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }());

  /* --- Mobile navigation accordions --------------------------------------- */

  (function mobileNav() {
    on(document, 'click', function (e) {
      var toggle = e.target.closest('.mobile-nav__toggle');
      if (!toggle) return;
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(toggle.getAttribute('aria-controls'));
      toggle.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.classList.toggle('is-open', !expanded);
    });
  }());

  /* --- Predictive search --------------------------------------------------- */

  (function predictiveSearch() {
    $$('[data-search-panel]').forEach(function (panel) {
      var input = $('[data-search-input]', panel);
      var results = $('[data-search-results]', panel);
      var defaults = $('[data-search-default]', panel);
      var clear = $('[data-search-clear]', panel);
      var status = $('[data-search-status]', panel);
      if (!input || !results) return;

      var controller = null;

      function reset() {
        results.innerHTML = '';
        results.hidden = true;
        if (defaults) defaults.hidden = false;
        if (clear) clear.hidden = true;
        if (status) status.textContent = '';
      }

      var run = debounce(function () {
        var term = input.value.trim();
        if (clear) clear.hidden = term.length === 0;

        if (term.length < 2) { reset(); return; }

        if (controller) controller.abort();
        controller = new AbortController();

        var url = config.routes.predictiveSearch +
          '?q=' + encodeURIComponent(term) +
          '&resources[type]=product,collection,page,article' +
          '&resources[limit]=6' +
          '&section_id=predictive-search';

        fetch(url, { signal: controller.signal })
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.text();
          })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var fresh = doc.querySelector('[data-search-results-inner]');
            results.innerHTML = fresh ? fresh.innerHTML : '';
            results.hidden = false;
            if (defaults) defaults.hidden = true;

            if (status) {
              var count = results.querySelectorAll('[data-search-result]').length;
              status.textContent = (strings.resultsAnnouncement || '{{ count }} results')
                .replace('{{ count }}', count);
            }
          })
          .catch(function (err) {
            if (err.name === 'AbortError') return;
            // Network failure must not break the input — the form still
            // submits to the full search page on Enter.
            reset();
          });
      }, 250);

      on(input, 'input', run);

      on(clear, 'click', function () {
        input.value = '';
        reset();
        input.focus();
      });

      // Arrow keys move between results without leaving the input behind.
      on(panel, 'keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var links = $$('[data-search-result] a, a[data-search-result]', panel);
        if (!links.length) return;
        e.preventDefault();
        var idx = links.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') idx = idx < links.length - 1 ? idx + 1 : 0;
        else idx = idx > 0 ? idx - 1 : links.length - 1;
        links[idx].focus();
      });
    });
  }());

  /* --- Quantity inputs ----------------------------------------------------- */

  (function quantity() {
    on(document, 'click', function (e) {
      var btn = e.target.closest('[data-qty-change]');
      if (!btn) return;
      var wrap = btn.closest('[data-qty]');
      var input = $('input', wrap);
      if (!input) return;

      var step = parseInt(btn.getAttribute('data-qty-change'), 10);
      var min = parseInt(input.getAttribute('min'), 10);
      var max = parseInt(input.getAttribute('max'), 10);
      if (isNaN(min)) min = 1;

      var next = (parseInt(input.value, 10) || min) + step;
      if (next < min) next = min;
      if (!isNaN(max) && next > max) next = max;

      if (String(next) === input.value) return;
      input.value = next;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Keep the +/- buttons' disabled state honest.
    on(document, 'change', function (e) {
      var input = e.target.closest('[data-qty] input');
      if (!input) return;
      var wrap = input.closest('[data-qty]');
      var min = parseInt(input.getAttribute('min'), 10) || 1;
      var max = parseInt(input.getAttribute('max'), 10);
      var value = parseInt(input.value, 10) || min;
      if (value < min) { input.value = min; value = min; }

      var dec = $('[data-qty-change="-1"]', wrap);
      var inc = $('[data-qty-change="1"]', wrap);
      if (dec) dec.disabled = value <= min;
      if (inc) inc.disabled = !isNaN(max) && value >= max;
    });
  }());

  /* --- Cart ---------------------------------------------------------------
     All cart mutations go through here so the drawer, the header count and
     the cart page can never disagree about state. */

  var Cart = {
    sectionsToRender: function () {
      return $$('[data-cart-section]')
        .map(function (el) { return el.getAttribute('data-cart-section'); })
        .filter(Boolean)
        .join(',');
    },

    add: function (formData, button) {
      var sections = this.sectionsToRender();
      if (sections) formData.append('sections', sections);

      if (button) button.classList.add('btn--loading');

      return fetch(config.routes.cartAdd, {
        method: 'POST',
        headers: { Accept: 'application/javascript' },
        body: formData
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.status) {
            // Shopify returns {status, message, description} on error.
            Cart.showError(button, data.description || data.message);
            throw new Error(data.description || data.message);
          }
          Cart.renderSections(data.sections);
          Cart.announceAdded(button);
          document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data } }));

          if (config.cartType === 'drawer') {
            var drawer = $('[data-cart-drawer]');
            if (drawer) Surface.open(drawer, button);
          }
          return data;
        })
        .catch(function (err) {
          Cart.showError(button, strings.cartError);
          throw err;
        })
        .finally(function () {
          if (button) button.classList.remove('btn--loading');
        });
    },

    change: function (line, quantity) {
      var body = {
        line: line,
        quantity: quantity,
        sections: this.sectionsToRender()
      };

      return fetch(config.routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/javascript' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          Cart.renderSections(data.sections);
          document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data } }));
          return data;
        });
    },

    renderSections: function (sections) {
      if (!sections) return;
      Object.keys(sections).forEach(function (id) {
        var target = $('[data-cart-section="' + id + '"]');
        if (!target) return;
        var doc = new DOMParser().parseFromString(sections[id], 'text/html');
        var fresh = doc.querySelector('[data-cart-section="' + id + '"]');
        if (fresh) target.innerHTML = fresh.innerHTML;
      });
      Cart.syncCount();
    },

    syncCount: function () {
      var source = $('[data-cart-count-source]');
      if (!source) return;
      var count = parseInt(source.getAttribute('data-cart-count-source'), 10) || 0;
      $$('[data-cart-count]').forEach(function (el) {
        el.textContent = count;
        el.hidden = count === 0;
      });
    },

    announceAdded: function (button) {
      if (!button) return;
      var label = button.querySelector('[data-add-label]');
      if (!label) return;
      var original = label.textContent;
      label.textContent = strings.added || 'Added';
      setTimeout(function () { label.textContent = original; }, 1800);
    },

    showError: function (button, message) {
      if (!message) return;
      var host = button ? button.closest('[data-product-form], .card') : null;
      var slot = host ? host.querySelector('[data-cart-error]') : null;
      if (slot) {
        slot.textContent = message;
        slot.hidden = false;
        setTimeout(function () { slot.hidden = true; }, 6000);
      }
    }
  };

  window.ThemeCart = Cart;

  // Add-to-cart form submission (product forms and quick-add).
  on(document, 'submit', function (e) {
    var form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    var button = form.querySelector('[type="submit"]');
    Cart.add(new FormData(form), button).catch(function () { /* surfaced above */ });
  });

  // Cart line quantity + remove, delegated so re-rendered markup keeps working.
  on(document, 'change', function (e) {
    var input = e.target.closest('[data-cart-qty]');
    if (!input) return;
    Cart.change(input.getAttribute('data-line'), parseInt(input.value, 10) || 0);
  });

  on(document, 'click', function (e) {
    var remove = e.target.closest('[data-cart-remove]');
    if (!remove) return;
    e.preventDefault();
    Cart.change(remove.getAttribute('data-line'), 0);
  });

  /* --- Variant picker ------------------------------------------------------ */

  (function variants() {
    $$('[data-variant-picker]').forEach(function (picker) {
      var root = picker.closest('[data-product-root]');
      if (!root) return;

      var variants;
      try {
        variants = JSON.parse($('[data-variant-json]', root).textContent);
      } catch (err) { return; }

      function selectedOptions() {
        return $$('[data-option-index]', picker).map(function (group) {
          var checked = group.querySelector('input:checked');
          if (checked) return checked.value;
          var select = group.querySelector('select');
          return select ? select.value : null;
        });
      }

      function findVariant(options) {
        return variants.find(function (v) {
          return options.every(function (opt, i) { return v.options[i] === opt; });
        });
      }

      function update() {
        var variant = findVariant(selectedOptions());

        // Reflect the choice in the visible option labels.
        $$('[data-option-index]', picker).forEach(function (group) {
          var value = group.querySelector('input:checked');
          var out = group.querySelector('[data-option-value]');
          if (out && value) out.textContent = value.value;
        });

        var idInput = $('[data-variant-id]', root);
        var addBtn = $('[data-add-button]', root);
        var addLabel = addBtn ? addBtn.querySelector('[data-add-label]') : null;

        if (!variant) {
          if (addBtn) addBtn.disabled = true;
          if (addLabel) addLabel.textContent = strings.unavailable || 'Unavailable';
          return;
        }

        if (idInput) idInput.value = variant.id;

        if (addBtn) {
          addBtn.disabled = !variant.available;
          if (addLabel) {
            addLabel.textContent = variant.available
              ? (strings.addToCart || 'Add to cart')
              : (strings.soldOut || 'Sold out');
          }
        }

        // Price, stock state and sticky bar all re-render from one source.
        var priceHost = $('[data-price-host]', root);
        if (priceHost && variant.price_html) priceHost.innerHTML = variant.price_html;

        document.dispatchEvent(new CustomEvent('variant:change', {
          detail: { variant: variant, root: root }
        }));

        // Keep the URL shareable without adding a history entry per click.
        if (variant.id && window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url.toString());
        }

        // Move the gallery to the variant's image if it has one.
        if (variant.featured_media_id) {
          var slide = root.querySelector('[data-media-id="' + variant.featured_media_id + '"]');
          if (slide && slide.parentElement) {
            slide.parentElement.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
          }
        }
      }

      on(picker, 'change', update);
    });
  }());

  /* --- Product gallery ----------------------------------------------------- */

  (function gallery() {
    $$('[data-gallery]').forEach(function (root) {
      var track = $('[data-gallery-track]', root);
      var thumbs = $$('[data-gallery-thumb]', root);
      var counter = $('[data-gallery-counter]', root);
      var prev = $('[data-gallery-prev]', root);
      var next = $('[data-gallery-next]', root);
      if (!track) return;

      var slides = $$('[data-gallery-slide]', track);
      if (!slides.length) return;

      function currentIndex() {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var best = 0, bestDist = Infinity;
        slides.forEach(function (s, i) {
          var center = s.offsetLeft + s.clientWidth / 2;
          var d = Math.abs(center - mid);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        return best;
      }

      function sync() {
        var i = currentIndex();
        thumbs.forEach(function (t, n) {
          t.classList.toggle('is-active', n === i);
          t.setAttribute('aria-current', n === i ? 'true' : 'false');
        });
        if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === slides.length - 1;
      }

      function goTo(i) {
        var slide = slides[Math.max(0, Math.min(i, slides.length - 1))];
        if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      }

      thumbs.forEach(function (t, i) {
        on(t, 'click', function () { goTo(i); });
      });
      on(prev, 'click', function () { goTo(currentIndex() - 1); });
      on(next, 'click', function () { goTo(currentIndex() + 1); });

      on(track, 'scroll', debounce(sync, 80), { passive: true });
      sync();
    });
  }());

  /* --- Sticky add to cart --------------------------------------------------
     Appears only once the real CTA has scrolled out of view, so it never
     competes with the button it mirrors. */

  (function stickyAtc() {
    var bar = $('[data-sticky-atc]');
    var anchor = $('[data-atc-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
    }, { rootMargin: '0px 0px -100% 0px', threshold: 0 });

    observer.observe(anchor);

    // The sticky button just forwards to the real form, so there is one
    // source of truth for the selected variant and quantity.
    on($('[data-sticky-submit]', bar), 'click', function (e) {
      e.preventDefault();
      var form = $('[data-product-form]');
      if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
    });

    on(document, 'variant:change', function (e) {
      var priceSlot = $('[data-sticky-price]', bar);
      if (priceSlot && e.detail.variant.price_html) {
        priceSlot.innerHTML = e.detail.variant.price_html;
      }
    });
  }());

  /* --- Collection filters --------------------------------------------------
     Progressive enhancement over Shopify's native facet form: the form works
     without JS, and with JS we fetch and swap the grid instead of reloading. */

  (function facets() {
    var form = $('[data-facet-form]');
    if (!form) return;

    var grid = $('[data-collection-grid]');
    var busy = false;

    function apply(url, push) {
      if (busy) return;
      busy = true;
      if (grid) grid.setAttribute('aria-busy', 'true');

      fetch(url)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');

          ['[data-collection-grid]', '[data-facet-form]', '[data-active-facets]', '[data-product-count]']
            .forEach(function (sel) {
              var fresh = doc.querySelector(sel);
              var current = $(sel);
              if (fresh && current) current.innerHTML = fresh.innerHTML;
            });

          if (push) window.history.pushState({ url: url }, '', url);
          if (grid) grid.removeAttribute('aria-busy');
        })
        .catch(function () {
          // On failure, fall back to a normal navigation rather than leaving
          // the visitor with a stale grid.
          window.location.href = url;
        })
        .finally(function () { busy = false; });
    }

    function urlFromForm() {
      var params = new URLSearchParams(new FormData(form));
      // Drop empty values so the URL stays clean and cacheable.
      var clean = new URLSearchParams();
      params.forEach(function (value, key) {
        if (value !== '') clean.append(key, value);
      });
      var qs = clean.toString();
      return window.location.pathname + (qs ? '?' + qs : '');
    }

    on(form, 'change', function () { apply(urlFromForm(), true); });
    on(form, 'submit', function (e) { e.preventDefault(); apply(urlFromForm(), true); });

    on(document, 'click', function (e) {
      var link = e.target.closest('[data-facet-remove], [data-facet-clear], [data-pagination] a');
      if (!link) return;
      e.preventDefault();
      apply(link.getAttribute('href'), true);
      if (link.matches('[data-pagination] a') && grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    on(window, 'popstate', function () {
      apply(window.location.href, false);
    });
  }());

  /* --- Reveal on scroll ---------------------------------------------------- */

  (function reveal() {
    var els = $$('.reveal');
    if (!els.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!config.animations || reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    els.forEach(function (el) { observer.observe(el); });
  }());

  /* --- Recently viewed ----------------------------------------------------
     Stored locally only; never sent anywhere. */

  (function recentlyViewed() {
    var KEY = 'fc9:recently-viewed';
    var current = document.body.getAttribute('data-product-handle');

    function read() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch (e) { return []; }
    }
    function write(list) {
      try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8))); }
      catch (e) { /* private mode — not worth surfacing */ }
    }

    if (current) {
      var list = read().filter(function (h) { return h !== current; });
      list.unshift(current);
      write(list);
    }

    var host = $('[data-recently-viewed]');
    if (!host) return;
    var handles = read().filter(function (h) { return h !== current; }).slice(0, 4);
    if (!handles.length) return;

    var query = handles.map(function (h) { return 'handle:' + h; }).join(' OR ');
    fetch(config.routes.search + '?type=product&q=' + encodeURIComponent(query) + '&section_id=recently-viewed')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-recently-viewed-inner]');
        if (fresh && fresh.children.length) {
          host.innerHTML = fresh.innerHTML;
          host.hidden = false;
        }
      })
      .catch(function () { /* non-essential */ });
  }());

  /* --- Theme editor support ------------------------------------------------ */

  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function () {
      $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    });
    document.addEventListener('shopify:section:select', function (e) {
      var drawer = e.target.querySelector('[data-cart-drawer], .drawer');
      if (drawer) Surface.open(drawer);
    });
  }
}());
