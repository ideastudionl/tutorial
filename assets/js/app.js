/* =========================================================
   Clover — applicatielogica
   Router, filters, animaties, formulieren.
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const rustig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const app       = $('#app');
const laadbalk  = $('#laadbalk');
const overlay   = $('#overlay');
const modal     = $('#modal');
const toastEl   = $('#toast');

let laatsteFocus = null;

/* =========================================================
   Router
   ========================================================= */

const ROUTES = {
  '':           { titel: 'Clover Uitzendbureau — werk dat bij je past', nav: 'home',        view: viewHome },
  'vacatures':  { titel: 'Vacatures — Clover Uitzendbureau',            nav: 'vacatures',   view: viewVacatures },
  'sectoren':   { titel: 'Sectoren — Clover Uitzendbureau',             nav: 'sectoren',    view: viewSectoren },
  'werkgevers': { titel: 'Voor werkgevers — Clover Uitzendbureau',      nav: 'werkgevers',  view: viewWerkgevers },
  'over':       { titel: 'Over Clover — Clover Uitzendbureau',          nav: 'over',        view: viewOver },
  'contact':    { titel: 'Contact — Clover Uitzendbureau',              nav: 'contact',     view: viewContact },
  'privacy':    { titel: 'Privacyverklaring — Clover Uitzendbureau',    nav: '',            view: viewPrivacy }
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pad, query = ''] = raw.split('?');
  const delen = pad.split('/').filter(Boolean);
  return { pad: delen[0] || '', param: delen[1] || '', query: new URLSearchParams(query) };
}

function router() {
  const { pad, param, query } = parseHash();
  let html, titel, navId = '';

  if (pad === 'vacature' && param) {
    const v = VACATURES.find((x) => x.id === param);
    html = viewVacature(param);
    titel = v ? `${v.titel} in ${v.plaats} — Clover` : 'Vacature niet gevonden — Clover';
    navId = 'vacatures';
  } else if (ROUTES[pad]) {
    html = ROUTES[pad].view();
    titel = ROUTES[pad].titel;
    navId = ROUTES[pad].nav;
  } else {
    html = viewNietGevonden();
    titel = 'Pagina niet gevonden — Clover Uitzendbureau';
  }

  toonLaadbalk();
  document.title = titel;
  app.innerHTML = `<div class="view">${html}</div>`;

  $$('[data-nav]').forEach((a) => {
    a.toggleAttribute('aria-current', a.dataset.nav === navId);
    if (a.dataset.nav === navId) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  sluitMobielMenu();
  initReveal();
  initSplit();
  initTellers();
  initAccordeons();
  initTabs();
  initFormulieren();
  if (pad === 'vacatures') initVacaturebank(query);

  // scrollpositie: naar anker of naar boven
  const anker = location.hash.includes('#aanvraag') ? $('#aanvraag') : null;
  if (anker) anker.scrollIntoView({ behavior: rustig() ? 'auto' : 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'auto' });

  app.focus({ preventScroll: true });
}

function toonLaadbalk() {
  if (!laadbalk) return;
  laadbalk.style.opacity = '1';
  laadbalk.style.width = '35%';
  setTimeout(() => { laadbalk.style.width = '100%'; }, 120);
  setTimeout(() => { laadbalk.style.opacity = '0'; laadbalk.style.width = '0'; }, 420);
}

/* =========================================================
   Scroll-animaties
   ========================================================= */

let revealObs;
function initReveal() {
  const doelen = $$('[data-reveal]');
  if (rustig()) { doelen.forEach((d) => d.classList.add('is-zichtbaar')); return; }
  revealObs?.disconnect();
  revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-zichtbaar'); revealObs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  doelen.forEach((d) => revealObs.observe(d));
}

/* koppen woord voor woord laten binnenkomen */
function initSplit() {
  $$('[data-split]').forEach((el) => {
    if (el.dataset.klaar) return;
    el.dataset.klaar = '1';
    const stukken = [...el.childNodes];
    el.innerHTML = '';
    stukken.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((w) => {
          if (!w.trim()) { el.appendChild(document.createTextNode(w)); return; }
          const s = document.createElement('span');
          s.className = 'woord'; s.textContent = w;
          el.appendChild(s);
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(node);
      } else {
        node.classList?.add('woord');
        el.appendChild(node);
      }
    });
    $$('.woord', el).forEach((w, i) => { w.style.transitionDelay = `${i * 55}ms`; });
    if (rustig()) el.classList.add('is-zichtbaar');
    else new IntersectionObserver((entries, o) => {
      if (entries[0].isIntersecting) { el.classList.add('is-zichtbaar'); o.disconnect(); }
    }, { threshold: 0.2 }).observe(el);
  });
}

/* cijfers laten oplopen */
function initTellers() {
  $$('[data-tel]').forEach((el) => {
    const doel = parseFloat(el.dataset.tel);
    if (rustig()) { el.textContent = doel.toLocaleString('nl-NL'); return; }
    new IntersectionObserver((entries, o) => {
      if (!entries[0].isIntersecting) return;
      o.disconnect();
      const duur = 1400;
      const start = performance.now();
      const stap = (nu) => {
        const p = Math.min((nu - start) / duur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(doel * eased).toLocaleString('nl-NL');
        if (p < 1) requestAnimationFrame(stap);
      };
      requestAnimationFrame(stap);
    }, { threshold: 0.4 }).observe(el);
  });
}

/* =========================================================
   Accordeon & tabs
   ========================================================= */

function initAccordeons() {
  $$('[data-acc] .acc-knop').forEach((knop) => {
    knop.addEventListener('click', () => {
      const item = knop.closest('[data-acc]');
      const open = item.classList.toggle('is-open');
      knop.setAttribute('aria-expanded', String(open));
    });
  });
}

function initTabs() {
  const tabs = $$('[data-stappen]');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      const doel = $('#stappen-doel');
      doel.style.opacity = '0';
      setTimeout(() => {
        doel.innerHTML = stappenLijst(tab.dataset.stappen === 'werkgever' ? STAPPEN_WERKGEVER : STAPPEN_WERKZOEKEND);
        $$('[data-reveal]', doel).forEach((d) => d.classList.add('is-zichtbaar'));
        doel.style.opacity = '1';
      }, rustig() ? 0 : 160);
    });
  });
}

/* =========================================================
   Vacaturebank: filteren, sorteren, deelbare URL
   ========================================================= */

const MEERVOUD = ['sector', 'dienstverband', 'contract', 'opleiding'];

/* wordt gevuld zodra de vacaturebank in beeld is; buiten die pagina null */
let bankActies = null;

function initVacaturebank(query) {
  const form = $('#filters');
  const uitvoer = $('#resultaten');
  if (!form || !uitvoer) return;

  /* ---- filters uit de URL zetten ---- */
  MEERVOUD.forEach((naam) => {
    const waarden = (query.get(naam) || '').split(',').filter(Boolean);
    $$(`input[name="${naam}"]`, form).forEach((i) => { i.checked = waarden.includes(i.value); });
  });
  ['term', 'plaats'].forEach((naam) => {
    const el = $(`input[name="${naam}"]`, form);
    if (el) el.value = query.get(naam) || '';
  });
  ['spoed', 'geenDiploma', 'zonderRijbewijs'].forEach((naam) => {
    const el = $(`input[name="${naam}"]`, form);
    if (el) el.checked = query.get(naam) === '1';
  });
  const loonEl = $('input[name="loon"]', form);
  if (loonEl) loonEl.value = query.get('loon') || 13;
  const sorteerEl = $('#sorteer');
  if (sorteerEl) sorteerEl.value = query.get('sorteer') || 'nieuw';

  function huidigeStaat() {
    const s = { term: '', plaats: '', loon: 13, spoed: false, geenDiploma: false, zonderRijbewijs: false, sorteer: 'nieuw' };
    MEERVOUD.forEach((n) => { s[n] = $$(`input[name="${n}"]:checked`, form).map((i) => i.value); });
    s.term = ($('input[name="term"]', form)?.value || '').trim();
    s.plaats = ($('input[name="plaats"]', form)?.value || '').trim();
    s.loon = parseFloat($('input[name="loon"]', form)?.value || 13);
    s.spoed = !!$('input[name="spoed"]', form)?.checked;
    s.geenDiploma = !!$('input[name="geenDiploma"]', form)?.checked;
    s.zonderRijbewijs = !!$('input[name="zonderRijbewijs"]', form)?.checked;
    s.sorteer = sorteerEl?.value || 'nieuw';
    return s;
  }

  function naarUrl(s) {
    const p = new URLSearchParams();
    MEERVOUD.forEach((n) => { if (s[n].length) p.set(n, s[n].join(',')); });
    if (s.term) p.set('term', s.term);
    if (s.plaats) p.set('plaats', s.plaats);
    if (s.loon > 13) p.set('loon', String(s.loon));
    if (s.spoed) p.set('spoed', '1');
    if (s.geenDiploma) p.set('geenDiploma', '1');
    if (s.zonderRijbewijs) p.set('zonderRijbewijs', '1');
    if (s.sorteer !== 'nieuw') p.set('sorteer', s.sorteer);
    const q = p.toString();
    history.replaceState(null, '', `#/vacatures${q ? '?' + q : ''}`);
  }

  function filter(s) {
    const t = s.term.toLowerCase();
    const pl = s.plaats.toLowerCase();
    let r = VACATURES.filter((v) => {
      if (s.sector.length && !s.sector.includes(v.sector)) return false;
      if (s.dienstverband.length && !s.dienstverband.includes(v.dienstverband)) return false;
      if (s.contract.length && !s.contract.includes(v.contract)) return false;
      if (s.opleiding.length && !s.opleiding.includes(v.opleiding)) return false;
      if (s.spoed && !v.spoed) return false;
      if (s.geenDiploma && v.opleiding !== 'Geen diploma nodig') return false;
      if (s.zonderRijbewijs && v.rijbewijs) return false;
      if (v.max < s.loon) return false;
      if (pl && !(`${v.plaats} ${v.provincie}`.toLowerCase().includes(pl))) return false;
      if (t) {
        const hooi = `${v.titel} ${sectorVan(v.sector).naam} ${v.bedrijf} ${v.intro} ${v.taken.join(' ')}`.toLowerCase();
        if (!t.split(/\s+/).every((woord) => hooi.includes(woord))) return false;
      }
      return true;
    });

    const sorteringen = {
      nieuw: (a, b) => a.dagen - b.dagen,
      loon:  (a, b) => b.max - a.max,
      uren:  (a, b) => b.uren - a.uren,
      az:    (a, b) => a.titel.localeCompare(b.titel, 'nl')
    };
    return r.sort(sorteringen[s.sorteer] || sorteringen.nieuw);
  }

  function chips(s) {
    const lijst = [];
    s.sector.forEach((v) => lijst.push({ n: 'sector', v, l: sectorVan(v).naam }));
    s.dienstverband.forEach((v) => lijst.push({ n: 'dienstverband', v, l: v }));
    s.contract.forEach((v) => lijst.push({ n: 'contract', v, l: v }));
    s.opleiding.forEach((v) => lijst.push({ n: 'opleiding', v, l: v }));
    if (s.term) lijst.push({ n: 'term', v: '', l: `“${s.term}”` });
    if (s.plaats) lijst.push({ n: 'plaats', v: '', l: s.plaats });
    if (s.loon > 13) lijst.push({ n: 'loon', v: '', l: `vanaf ${euro(s.loon)} p/u` });
    if (s.spoed) lijst.push({ n: 'spoed', v: '1', l: 'Spoed' });
    if (s.geenDiploma) lijst.push({ n: 'geenDiploma', v: '1', l: 'Geen diploma nodig' });
    if (s.zonderRijbewijs) lijst.push({ n: 'zonderRijbewijs', v: '1', l: 'Geen rijbewijs nodig' });

    const doel = $('#actieve-filters');
    doel.innerHTML = lijst.length
      ? lijst.map((c) => `<span class="chip">${esc(c.l)}
          <button type="button" data-chip-naam="${c.n}" data-chip-waarde="${esc(c.v)}"
                  aria-label="Filter ${esc(c.l)} verwijderen">${ICO.kruis({ w: 12 })}</button></span>`).join('')
        + `<button type="button" class="chip" style="background:var(--inkt);color:var(--papier);border-color:var(--inkt);padding-right:.8rem" data-wis-filters>Wis alles</button>`
      : '';
    $('#tel-filters').textContent = lijst.length ? `(${lijst.length})` : '';
  }

  function teken() {
    const s = huidigeStaat();
    const res = filter(s);
    naarUrl(s);
    chips(s);

    $('.resultaat-telling').innerHTML = res.length === 1
      ? '<b id="tel-resultaten">1</b> vacature gevonden'
      : `<b id="tel-resultaten">${res.length}</b> vacatures gevonden`;

    const loonUit = $('output[name="loon-uit"]', form);
    if (loonUit) loonUit.textContent = euro(s.loon);

    uitvoer.innerHTML = res.length
      ? res.map((v, i) => `<div style="animation-delay:${Math.min(i, 8) * 45}ms" class="vac-wrap">${vacKaart(v)}</div>`).join('')
      : `<div class="leeg-staat">
           <span class="sector-icoon" style="background:var(--geel)">${ICO.zoek({ w: 26 })}</span>
           <h3 style="font-size:var(--t-2xl)">Geen vacature gevonden met deze filters</h3>
           <p style="color:var(--inkt-70);max-width:44ch">Probeer een filter weg te halen, of laat ons zoeken: met een jobalert of open sollicitatie krijg je bericht zodra er iets binnenkomt.</p>
           <div class="rij" style="justify-content:center">
             <button class="knop" type="button" data-wis-filters>Wis alle filters</button>
             <button class="knop knop--leeg" type="button" data-open-sollicitatie="open">Open sollicitatie</button>
           </div>
         </div>`;

    $$('.vac-wrap .vac-kaart', uitvoer).forEach((k, i) => {
      k.style.animationDelay = `${Math.min(i, 8) * 45}ms`;
    });
  }

  /* ---- listeners ---- */
  let debounce;
  form.addEventListener('input', (e) => {
    if (e.target.type === 'search' || e.target.type === 'text') {
      clearTimeout(debounce);
      debounce = setTimeout(teken, 220);
    } else {
      teken();
    }
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  sorteerEl?.addEventListener('change', teken);

  /* de globale klikafhandeling (chips, wissen, mobiele lade) roept dit aan */
  bankActies = {
    verwijderChip(naam, waarde) {
      if (MEERVOUD.includes(naam)) {
        const inp = $$(`input[name="${naam}"]`, form).find((i) => i.value === waarde);
        if (inp) inp.checked = false;
      } else if (naam === 'loon') {
        $('input[name="loon"]', form).value = 13;
      } else if (['spoed', 'geenDiploma', 'zonderRijbewijs'].includes(naam)) {
        $(`input[name="${naam}"]`, form).checked = false;
      } else {
        $(`input[name="${naam}"]`, form).value = '';
      }
      teken();
    },
    wisAlles() {
      form.reset();
      $('input[name="loon"]', form).value = 13;
      if (sorteerEl) sorteerEl.value = 'nieuw';
      teken();
    },
    openLade() {
      form.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      $('input[name="term"]', form)?.focus({ preventScroll: true });
    },
    sluitLade() {
      form.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  };

  teken();
}

/* =========================================================
   Modal (sollicitatie)
   ========================================================= */

function openModal(inhoud) {
  laatsteFocus = document.activeElement;
  modal.innerHTML = inhoud;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  initFormulieren();
  const eerste = modal.querySelector('input, select, textarea, button');
  setTimeout(() => eerste?.focus(), 80);
}

function sluitModal() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { modal.innerHTML = ''; }, 320);
  laatsteFocus?.focus?.();
}

/* eenvoudige focus-val binnen de modal */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (overlay.classList.contains('is-open')) sluitModal();
    else if ($('#filters')?.classList.contains('is-open')) bankActies?.sluitLade();
    else sluitMobielMenu();
  }
  if (e.key !== 'Tab' || !overlay.classList.contains('is-open')) return;
  const focusbaar = $$('a[href], button:not([disabled]), input, select, textarea', modal)
    .filter((el) => el.offsetParent !== null);
  if (!focusbaar.length) return;
  const eerste = focusbaar[0], laatste = focusbaar[focusbaar.length - 1];
  if (e.shiftKey && document.activeElement === eerste) { e.preventDefault(); laatste.focus(); }
  else if (!e.shiftKey && document.activeElement === laatste) { e.preventDefault(); eerste.focus(); }
});

/* =========================================================
   Formulieren (demo — er wordt niets verstuurd)
   ========================================================= */

function toonToast(tekst) {
  toastEl.innerHTML = `${ICO.vink({ w: 18 })}<span>${esc(tekst)}</span>`;
  toastEl.classList.add('is-open');
  clearTimeout(toonToast._t);
  toonToast._t = setTimeout(() => toastEl.classList.remove('is-open'), 4200);
}

function valideer(form) {
  let ok = true;
  $$('input, select, textarea', form).forEach((veld) => {
    const wrap = veld.closest('.invoer');
    if (!veld.required) return;
    const leeg = veld.type === 'checkbox' ? !veld.checked : !veld.value.trim();
    const mailFout = veld.type === 'email' && veld.value && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(veld.value);
    const telFout = veld.type === 'tel' && veld.value && veld.value.replace(/\D/g, '').length < 9;
    const fout = leeg || mailFout || telFout;
    if (wrap) wrap.classList.toggle('is-fout', fout);
    if (veld.type === 'checkbox') {
      const melding = form.querySelector('[data-fout-akkoord]');
      if (melding) melding.style.display = fout ? 'block' : 'none';
    }
    if (fout && ok) { veld.focus(); ok = false; }
  });
  return ok;
}

function initFormulieren() {
  $$('[data-form]').forEach((form) => {
    if (form.dataset.klaar) return;
    form.dataset.klaar = '1';

    $$('input, select, textarea', form).forEach((veld) => {
      veld.addEventListener('input', () => veld.closest('.invoer')?.classList.remove('is-fout'));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valideer(form)) return;

      const knop = $('button[type="submit"]', form);
      const oud = knop?.innerHTML;
      if (knop) { knop.disabled = true; knop.innerHTML = 'Even geduld…'; }

      // Demo: hier zou de POST naar het ATS / de mailservice komen.
      setTimeout(() => {
        const soort = form.dataset.form;
        if (soort === 'sollicitatie') {
          modal.innerHTML = sollicitatieSucces(form.dataset.vacature);
        } else {
          if (knop) { knop.disabled = false; knop.innerHTML = oud; }
          form.reset();
          $$('[data-dropzone]', form).forEach(resetDropzone);
          toonToast({
            jobalert: 'Je jobalert staat aan. (Demo — er wordt niets verstuurd.)',
            aanvraag: 'Aanvraag ontvangen. We bellen binnen 1 werkdag. (Demo.)',
            contact:  'Bericht verstuurd. Je hoort snel van ons. (Demo.)'
          }[soort] || 'Verstuurd. (Demo.)');
        }
      }, 700);
    });

    $$('[data-dropzone]', form).forEach(initDropzone);
  });
}

function resetDropzone(zone) {
  zone.classList.remove('is-gevuld');
  $('[data-dz-titel]', zone).textContent = 'Sleep je cv hierheen of klik om te kiezen';
  $('[data-dz-sub]', zone).textContent = 'PDF, Word of een foto — max. 10 MB';
}

function initDropzone(zone) {
  const invoer = $('input[type="file"]', zone);
  const tonen = () => {
    const f = invoer.files[0];
    if (!f) return resetDropzone(zone);
    zone.classList.add('is-gevuld');
    $('[data-dz-titel]', zone).textContent = f.name;
    $('[data-dz-sub]', zone).textContent = `${(f.size / 1024 / 1024).toFixed(1)} MB — klik om te wijzigen`;
  };
  invoer.addEventListener('change', tonen);
  ['dragenter', 'dragover'].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-over'); }));
  zone.addEventListener('drop', (e) => {
    if (e.dataTransfer?.files?.length) { invoer.files = e.dataTransfer.files; tonen(); }
  });
}

/* =========================================================
   Header, mobiel menu, globale klikafhandeling
   ========================================================= */

function sluitMobielMenu() {
  $('#mobiel-menu')?.classList.remove('is-open');
  $('#hamburger')?.setAttribute('aria-expanded', 'false');
  if (!overlay.classList.contains('is-open')) document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  /* hamburger */
  if (e.target.closest('#hamburger')) {
    const knop = $('#hamburger'), menu = $('#mobiel-menu');
    const open = menu.classList.toggle('is-open');
    knop.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    return;
  }
  if (e.target.closest('#mobiel-menu a')) sluitMobielMenu();

  /* modal */
  const sollicitatie = e.target.closest('[data-open-sollicitatie]');
  if (sollicitatie) {
    openModal(sollicitatieFormulier(sollicitatie.dataset.openSollicitatie));
    return;
  }
  if (e.target.closest('[data-sluit-modal]') || e.target === overlay) { sluitModal(); return; }

  /* delen */
  const deel = e.target.closest('[data-deel]');
  if (deel) {
    const url = location.href;
    const v = VACATURES.find((x) => x.id === deel.dataset.deel);
    if (navigator.share) {
      navigator.share({ title: v ? v.titel : 'Vacature bij Clover', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(
        () => toonToast('Link gekopieerd naar je klembord'),
        () => toonToast('Kopiëren lukte niet — kopieer de link uit de adresbalk')
      );
    }
    return;
  }

  /* vacaturebank-acties */
  const chip = e.target.closest('[data-chip-naam]');
  if (chip) { bankActies?.verwijderChip(chip.dataset.chipNaam, chip.dataset.chipWaarde); return; }
  if (e.target.closest('[data-wis-filters]')) { bankActies?.wisAlles(); return; }
  if (e.target.closest('[data-open-filters]')) { bankActies?.openLade(); return; }
  if (e.target.closest('[data-sluit-filters]')) { bankActies?.sluitLade(); return; }
});

/* zoekformulier in de hero */
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'hero-zoek') return;
  e.preventDefault();
  const d = new FormData(e.target);
  const p = new URLSearchParams();
  if (d.get('term')) p.set('term', d.get('term'));
  if (d.get('sector')) p.set('sector', d.get('sector'));
  if (d.get('plaats')) p.set('plaats', d.get('plaats'));
  const q = p.toString();
  location.hash = `#/vacatures${q ? '?' + q : ''}`;
});

/* plakkende header */
window.addEventListener('scroll', () => {
  $('.site-header')?.classList.toggle('is-plakkend', window.scrollY > 12);
}, { passive: true });

/* =========================================================
   Start
   ========================================================= */

window.addEventListener('hashchange', () => {
  bankActies = null;
  if (overlay.classList.contains('is-open')) sluitModal();
  document.body.style.overflow = '';   // ook als de mobiele filterlade openstond
  router();
});

document.addEventListener('DOMContentLoaded', () => {
  /* plaatsenlijst voor de autocomplete-velden */
  const datalist = $('#plaatsen');
  if (datalist) {
    const plaatsen = [...new Set(VACATURES.map((v) => v.plaats))].sort((a, b) => a.localeCompare(b, 'nl'));
    datalist.innerHTML = plaatsen.concat(PROVINCIES).map((p) => `<option value="${esc(p)}"></option>`).join('');
  }
  $('#jaar').textContent = new Date().getFullYear();
  router();
});
