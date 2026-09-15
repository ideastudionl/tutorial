/* =========================================================
   Clover — weergaven (templates)
   ========================================================= */

/* ---- hulpjes -------------------------------------------- */
const sectorVan = (id) => SECTOREN.find((s) => s.id === id) || SECTOREN[0];

const bedrag = (n) => n.toFixed(2).replace('.', ',');
const euro = (n) => '€ ' + bedrag(n);

const geplaatst = (d) =>
  d === 0 ? 'Vandaag geplaatst'
  : d === 1 ? 'Gisteren geplaatst'
  : d < 7 ? `${d} dagen geleden`
  : d < 14 ? '1 week geleden'
  : `${Math.floor(d / 7)} weken geleden`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const sterren = (n, w = 15) => sterRij(n, w);

/* compacte Google-badge: score, sterren, aantal reviews */
function googleBadge(compact = false) {
  return `
  <a class="google-badge" href="${GOOGLE.url}" target="_blank" rel="noopener"
     aria-label="${String(GOOGLE.score).replace('.', ',')} sterren uit ${GOOGLE.aantal} Google-reviews">
    ${googleG(compact ? 18 : 22)}
    <span class="g-cijfer">${String(GOOGLE.score).replace('.', ',')}</span>
    <span class="g-meta">
      ${sterRij(GOOGLE.score, 13)}
      <small>${GOOGLE.aantal} Google-reviews</small>
    </span>
  </a>`;
}

/* ---- herbruikbare onderdelen ---------------------------- */

function vacKaart(v, opt = {}) {
  const s = sectorVan(v.sector);
  return `
  <a class="vac-kaart" href="#/vacature/${v.id}" style="--sector-kleur:${s.kleur};--sector-zacht:${s.zacht}"
     aria-label="${esc(v.titel)} in ${esc(v.plaats)}">
    <div class="vac-top">
      <div style="display:grid;gap:.35rem">
        <span class="vac-sector">${esc(s.naam)}</span>
        <h3>${esc(v.titel)}</h3>
      </div>
      <span class="vac-logo" style="color:${s.kleur}">${ICO[s.icoon]({ w: 24 })}</span>
    </div>
    <div class="rij" style="gap:.4rem">
      ${v.spoed ? '<span class="label label--spoed">' + ICO.bliksem({ w: 13 }) + ' Spoed</span>' : ''}
      ${v.dagen <= 2 ? '<span class="label label--nieuw">Nieuw</span>' : ''}
      <span class="label label--rand">${esc(v.contract)}</span>
      <span class="label label--rand">${esc(v.dienstverband)}</span>
    </div>
    <ul class="vac-meta">
      <li>${ICO.pin({ w: 15 })} ${esc(v.plaats)}</li>
      <li>${ICO.klok({ w: 15 })} ${v.uren} uur p/w</li>
      <li>${ICO.document({ w: 15 })} ${esc(v.opleiding)}</li>
    </ul>
    ${opt.kort ? '' : `<p style="color:var(--inkt-75);font-size:.9375rem;margin:0">${esc(v.intro.slice(0, 118))}…</p>`}
    <div class="vac-voet">
      <span class="vac-salaris">${euro(v.min)} – ${euro(v.max)}<small>bruto per uur</small></span>
      <span class="link-pijl" style="font-size:.9375rem">Bekijk ${ICO.pijl({ w: 17 })}</span>
    </div>
  </a>`;
}

function sectorKaart(s, aantal) {
  return `
  <a class="sector-kaart" href="#/vacatures?sector=${s.id}" style="--sector-kleur:${s.kleur};--sector-zacht:${s.zacht}">
    <span class="sector-icoon">${ICO[s.icoon]({ w: 26 })}</span>
    <h3>${esc(s.naam)}</h3>
    <p style="color:var(--inkt-75);font-size:.9375rem;margin:0">${esc(s.pitch)}</p>
    <span class="telling-regel">${aantal} ${aantal === 1 ? 'vacature' : 'vacatures'} ${ICO.pijl({ w: 15 })}</span>
  </a>`;
}

function reviewKaart(r, i) {
  return `
  <figure class="review" data-reveal style="--vertraag:${i * 80}ms">
    <figcaption class="review-kop">
      ${monogram(r.naam, i)}
      <span style="flex:1;min-width:0">
        <b>${esc(r.naam)}</b>
        <small>${esc(r.rol)}</small>
      </span>
      ${googleG(18)}
    </figcaption>
    <div class="rij" style="gap:.5rem">
      ${sterRij(r.ster, 15)}
      <span class="review-bron">${esc(r.datum)}</span>
    </div>
    <blockquote>${esc(r.quote)}</blockquote>
  </figure>`;
}

/* scorepaneel met verdeling per sterwaardering */
function googlePaneel() {
  const totaal = GOOGLE.verdeling.reduce((a, b) => a + b, 0);
  return `
  <div class="google-paneel" data-reveal>
    <div class="rij" style="gap:.6rem">${googleG(24)}<b style="font-weight:600">Google-beoordelingen</b></div>
    <div class="google-score">
      <b>${String(GOOGLE.score).replace('.', ',')}</b>
      <span>/ 5</span>
    </div>
    ${sterRij(GOOGLE.score, 20)}
    <p style="font-size:var(--t-sm);color:var(--inkt-60);margin:0">Gebaseerd op ${GOOGLE.aantal} reviews van werkzoekenden en opdrachtgevers.</p>
    <div class="verdeling">
      ${GOOGLE.verdeling.map((n, i) => `
        <div class="verdeling-rij">
          <span>${5 - i} ★</span>
          <span class="verdeling-balk"><i data-balk="${Math.round((n / totaal) * 100)}"></i></span>
          <span>${n}</span>
        </div>`).join('')}
    </div>
    <a class="knop knop--leeg knop--breed" href="${GOOGLE.url}" target="_blank" rel="noopener">
      Alle reviews op Google ${ICO.pijlKlein({ w: 16 })}
    </a>
  </div>`;
}

function stappenLijst(stappen) {
  return `<ol class="stappen">${stappen.map((s, i) => `
    <li class="stap" data-reveal style="--vertraag:${i * 70}ms">
      <span class="stap-bol" aria-hidden="true"></span>
      <div>
        <h3>${esc(s.t)}</h3>
        <p style="color:var(--inkt-75);margin-top:.35rem">${esc(s.d)}</p>
      </div>
    </li>`).join('')}</ol>`;
}

function accordeon(items, naam) {
  return `<div class="accordeon">${items.map((f, i) => `
    <div class="acc-item" data-acc>
      <h3><button class="acc-knop" aria-expanded="false" aria-controls="${naam}-${i}">
        <span>${esc(f.v)}</span><span class="acc-teken" aria-hidden="true">${ICO.plus({ w: 15 })}</span>
      </button></h3>
      <div class="acc-paneel" id="${naam}-${i}" role="region"><div><p>${esc(f.a)}</p></div></div>
    </div>`).join('')}</div>`;
}

function keurmerkStrip() {
  return `<div class="keurmerken">${KEURMERKEN.map((k) => `
    <div class="keurmerk">${ICO.schild({ w: 22 })}<span>${esc(k.naam)}<small>${esc(k.sub)}</small></span></div>`).join('')}</div>`;
}

function band(items, klasse = '') {
  const groep = `<div class="band-groep">${items.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;
  return `<div class="band ${klasse}" aria-hidden="true"><div class="band-spoor">${groep}${groep}</div></div>`;
}

function ctaBlok() {
  return `
  <div class="cta-blok" data-reveal>
    <span class="cirkel" style="width:280px;height:280px;top:-120px;right:-60px"></span>
    <span class="cirkel" style="width:160px;height:160px;bottom:-70px;left:14%"></span>
    <div style="position:relative;display:grid;gap:1.5rem;max-width:44ch">
      <h2>Liever even iemand spreken?</h2>
      <p class="lead" style="color:var(--inkt-75)">Bel ons tussen ${esc(BEDRIJF.openingstijden)}. Je krijgt een intercedent aan de lijn die de werkvloer kent — geen keuzemenu.</p>
      <div class="rij">
        <a class="knop knop--inkt knop--groot" href="tel:${BEDRIJF.telRaw}">${ICO.telefoon({ w: 18 })} ${esc(BEDRIJF.tel)}</a>
        <a class="knop knop--wit knop--groot" href="#/contact">Stuur een bericht ${ICO.pijl({ w: 18 })}</a>
      </div>
    </div>
  </div>`;
}

/* =========================================================
   Pagina: home
   ========================================================= */

function viewHome() {
  const uitgelicht = [...VACATURES].sort((a, b) => a.dagen - b.dagen).slice(0, 6);
  const telPerSector = (id) => VACATURES.filter((v) => v.sector === id).length;

  return `
  <section class="hero">
    <div class="wrap">
      <div class="hero-raster">
        <div class="hero-tekst">
          <span class="oogje" data-reveal>Uitzenden · Detacheren · Werving &amp; selectie</span>
          <h1 data-split>Werk dat klopt.<br><span class="markeer">Mensen</span> die blijven.</h1>
          <p class="lead" data-reveal style="--vertraag:120ms">
            Clover bemiddelt vakmensen in acht sectoren. Eén vaste contactpersoon die de werkvloer kent,
            een voorselectie die klopt, en afspraken die we nakomen — bij de eerste plaatsing en bij de honderdste.
          </p>

          <form class="zoekbalk" id="hero-zoek" data-reveal style="--vertraag:200ms" role="search" aria-label="Zoek een vacature">
            <div class="veld">
              <label for="hz-term">Functie</label>
              <input id="hz-term" name="term" type="search" placeholder="monteur" autocomplete="off">
            </div>
            <div class="veld">
              <label for="hz-sector">Sector</label>
              <select id="hz-sector" name="sector">
                <option value="">Alle sectoren</option>
                ${SECTOREN.map((s) => `<option value="${s.id}">${esc(s.naam)}</option>`).join('')}
              </select>
            </div>
            <div class="veld">
              <label for="hz-plaats">Plaats</label>
              <input id="hz-plaats" name="plaats" type="text" placeholder="Almere" list="plaatsen" autocomplete="off">
            </div>
            <button class="knop knop--groot" type="submit">${ICO.zoek({ w: 18 })} Zoeken</button>
          </form>

          <div class="rij" data-reveal style="--vertraag:260ms;gap:1rem">
            ${googleBadge()}
            <ul class="hero-bewijs" style="gap:.35rem 1rem">
              <li>${ICO.vink({ w: 15 })} ${VACATURES.length} actuele vacatures</li>
              <li>${ICO.vink({ w: 15 })} Reactie binnen 1 werkdag</li>
              <li>${ICO.vink({ w: 15 })} SNA / NEN 4400-1 gecertificeerd</li>
            </ul>
          </div>
        </div>

        <div class="hero-beeld" data-reveal="schaal" style="--vertraag:180ms">
          <div class="toon-paneel">
            <div class="toon-balk">
              <span class="stip"></span><span class="stip"></span><span class="stip"></span>
              <span style="margin-left:.5rem">Vacaturebank · ${VACATURES.length} resultaten</span>
            </div>
            ${[...VACATURES].sort((a, b) => a.dagen - b.dagen).slice(0, 5).map((v, i) => {
              const s = sectorVan(v.sector);
              return `
              <div class="toon-rij ${i === 0 ? 'is-actief' : ''}" style="--sector-kleur:${s.kleur};--sector-zacht:${s.zacht}">
                <span class="merkje">${ICO[s.icoon]({ w: 17 })}</span>
                <span style="min-width:0">
                  <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(v.titel)}</b>
                  <small>${esc(v.plaats)} · ${v.uren} uur · ${esc(v.dienstverband)}</small>
                </span>
                <span class="loon">${euro(v.min)}</span>
              </div>`;
            }).join('')}
            <div class="toon-balk" style="border-bottom:0;border-top:1px solid var(--lijn);padding-top:.75rem;padding-bottom:0">
              <span style="color:var(--clover-700);font-weight:600">Filters: 8 sectoren · 6 provincies · uurloon</span>
            </div>
          </div>

          <div class="zweef-kaart zweef" style="top:-22px;right:-26px">
            <div style="display:grid;gap:.15rem">
              <b style="font-family:var(--font-display);font-size:1.5rem;line-height:1;font-variant-numeric:tabular-nums"><span data-tel="1250">0</span>+</b>
              <small style="font-size:var(--t-xs);color:var(--inkt-60)">plaatsingen per jaar</small>
            </div>
          </div>

          <div class="raster raster--2" style="gap:.75rem;margin-top:.75rem">
            <div class="kaart kaart--zacht" style="flex-direction:row;align-items:center;gap:.7rem;padding:.85rem 1rem">
              <span style="color:var(--clover-600);flex:none">${ICO.klok({ w: 20 })}</span>
              <span>
                <b style="font-family:var(--font-display);font-size:1rem;display:block;line-height:1.2">48 uur</b>
                <small style="font-size:var(--t-xs);color:var(--inkt-60)">tot de eerste kandidaat</small>
              </span>
            </div>
            <div class="kaart kaart--zacht" style="flex-direction:row;align-items:center;gap:.7rem;padding:.85rem 1rem">
              <span style="color:var(--clover-600);flex:none">${ICO.schild({ w: 20 })}</span>
              <span>
                <b style="font-family:var(--font-display);font-size:1rem;display:block;line-height:1.2">96%</b>
                <small style="font-size:var(--t-xs);color:var(--inkt-60)">maakt de opdracht af</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${band(SECTOREN.map((s) => s.naam).concat(['Altijd een vaste contactpersoon', 'Wekelijks uitbetaald']))}

  <!-- Twee paden -->
  <section class="sectie">
    <div class="wrap">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Waar sta jij?</span>
        <h2>Kies je route. De rest doen wij.</h2>
      </div>
      <div class="split">
        <a class="pad-kaart" href="#/vacatures" data-reveal="links">
          <span class="pad-nummer">01 — Werkzoekend</span>
          <h3 style="font-size:var(--t-2xl)">Ik zoek werk</h3>
          <p style="color:var(--inkt-75)">Filter op sector, plaats en uren. Solliciteer in één minuut, met of zonder cv.</p>
          <ul>
            <li>${ICO.vink({ w: 18 })} <span>${VACATURES.length} vacatures, dagelijks bijgewerkt</span></li>
            <li>${ICO.vink({ w: 18 })} <span>Solliciteren zonder cv of via WhatsApp</span></li>
            <li>${ICO.vink({ w: 18 })} <span>Wekelijkse uitbetaling, uren in de app</span></li>
          </ul>
          <span class="knop knop--groot" style="justify-self:start">Bekijk vacatures ${ICO.pijl({ w: 18 })}</span>
        </a>
        <a class="pad-kaart pad-kaart--werkgever" href="#/werkgevers" data-reveal="rechts">
          <span class="pad-nummer">02 — Opdrachtgever</span>
          <h3 style="font-size:var(--t-2xl)">Ik zoek personeel</h3>
          <p style="color:var(--inkt-75)">Vertel wat u nodig heeft. Wij komen langs, selecteren scherp en sturen maximaal drie kandidaten.</p>
          <ul>
            <li>${ICO.vink({ w: 18 })} <span>Eerste kandidaten binnen 48 uur</span></li>
            <li>${ICO.vink({ w: 18 })} <span>Transparante omrekenfactor, geen verrassingen</span></li>
            <li>${ICO.vink({ w: 18 })} <span>NEN 4400-1: uw aansprakelijkheid afgedekt</span></li>
          </ul>
          <span class="knop knop--blauw knop--groot" style="justify-self:start">Personeel aanvragen ${ICO.pijl({ w: 18 })}</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Uitgelichte vacatures -->
  <section class="sectie sectie--wit">
    <div class="wrap">
      <div class="sectie-kop sectie-kop--split" data-reveal>
        <div class="stapel">
          <span class="oogje">Vers binnen</span>
          <h2>Deze vacatures staan nu open</h2>
        </div>
        <a class="knop knop--leeg" href="#/vacatures">Alle ${VACATURES.length} vacatures ${ICO.pijl({ w: 18 })}</a>
      </div>
      <div class="raster raster--3">
        ${uitgelicht.map((v, i) => `<div data-reveal style="--vertraag:${i * 70}ms">${vacKaart(v)}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Sectoren -->
  <section class="sectie">
    <div class="wrap">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Acht sectoren</span>
        <h2>We zijn thuis op de werkvloer</h2>
        <p class="lead">Geen bureau dat alles roept te kunnen. Dit zijn de sectoren waar we zelf rondlopen, de cao's kennen en de mensen bij naam noemen.</p>
      </div>
      <div class="raster raster--4">
        ${SECTOREN.map((s, i) => `<div data-reveal style="--vertraag:${i * 55}ms">${sectorKaart(s, telPerSector(s.id))}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Cijfers -->
  <section class="sectie sectie--donker sectie--strak">
    <div class="wrap">
      <div class="raster raster--4">
        ${CIJFERS.map((c, i) => `
          <div class="cijfer" data-reveal style="--vertraag:${i * 80}ms">
            <b><span data-tel="${c.getal}">0</span>${esc(c.achter)}</b>
            <span>${esc(c.label)}</span>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Hoe werkt het -->
  <section class="sectie sectie--wit">
    <div class="wrap">
      <div class="sectie-kop sectie-kop--split" data-reveal>
        <div class="stapel">
          <span class="oogje">Zo werkt het</span>
          <h2>Van eerste contact tot eerste werkdag</h2>
        </div>
        <div class="tabs" role="tablist" aria-label="Kies je perspectief">
          <button class="tab" role="tab" aria-selected="true" data-stappen="werkzoekend">Ik zoek werk</button>
          <button class="tab" role="tab" aria-selected="false" data-stappen="werkgever">Ik zoek personeel</button>
        </div>
      </div>
      <div class="raster raster--2" style="align-items:start;gap:var(--ruimte-7)">
        <div id="stappen-doel">${stappenLijst(STAPPEN_WERKZOEKEND)}</div>
        <div class="kaart" data-reveal="rechts" style="background:var(--clover-050);gap:var(--ruimte-4)">
          <span class="sector-icoon" style="background:var(--geel)">${ICO.bel({ w: 26 })}</span>
          <h3 style="font-size:var(--t-2xl)">Niets gevonden? Laat ons zoeken.</h3>
          <p style="color:var(--inkt-75)">Zet een jobalert aan en ontvang alleen de vacatures die matchen met jouw sector, plaats en uren. Eén mail per week, uitschrijven met één klik.</p>
          <form class="formulier" data-form="jobalert">
            <div class="invoer">
              <label for="ja-mail">E-mailadres</label>
              <input id="ja-mail" name="email" type="email" required placeholder="jouw@email.nl">
              <span class="foutmelding">Vul een geldig e-mailadres in.</span>
            </div>
            <div class="invoer">
              <label for="ja-sector">Sector</label>
              <select id="ja-sector" name="sector">
                <option value="">Alle sectoren</option>
                ${SECTOREN.map((s) => `<option value="${s.id}">${esc(s.naam)}</option>`).join('')}
              </select>
            </div>
            <button class="knop knop--breed" type="submit">Zet mijn jobalert aan ${ICO.bel({ w: 17 })}</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Google-beoordelingen -->
  <section class="sectie">
    <div class="wrap">
      <div class="sectie-kop sectie-kop--split" data-reveal>
        <div class="stapel">
          <span class="oogje">Beoordelingen</span>
          <h2>Wat werkzoekenden en opdrachtgevers schrijven</h2>
        </div>
        <a class="knop knop--leeg" href="${GOOGLE.url}" target="_blank" rel="noopener">
          ${googleG(17)} Alles op Google ${ICO.pijlKlein({ w: 16 })}
        </a>
      </div>
      <div class="bank" style="grid-template-columns:300px minmax(0,1fr)">
        ${googlePaneel()}
        <div class="raster raster--2">
          ${[...REVIEWS_WERKZOEKEND, ...REVIEWS_WERKGEVER].map(reviewKaart).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Keurmerken -->
  <section class="sectie sectie--strak sectie--grijs-050">
    <div class="wrap" data-reveal>
      <p style="text-align:center;font-weight:700;color:var(--inkt-60);margin-bottom:var(--ruimte-5);font-size:.8125rem;letter-spacing:.14em;text-transform:uppercase">
        Aangesloten &amp; gecertificeerd
      </p>
      ${keurmerkStrip()}
    </div>
  </section>

  <section class="sectie sectie--wit"><div class="wrap">${ctaBlok()}</div></section>
  `;
}

/* =========================================================
   Pagina: vacaturebank
   ========================================================= */

function viewVacatures() {
  const tel = (fn) => VACATURES.filter(fn).length;
  const groep = (titel, naam, opties) => `
    <fieldset class="filter-groep">
      <h4 style="margin:0 0 .2rem">${esc(titel)}</h4>
      ${opties.map((o) => `
        <label class="keuze">
          <input type="checkbox" name="${naam}" value="${esc(o.waarde)}">
          <span class="vink">${ICO.vinkje({ w: 13 })}</span>
          <span>${esc(o.label)}</span>
          <span class="telling">${o.aantal}</span>
        </label>`).join('')}
    </fieldset>`;

  return `
  <section class="sectie sectie--strak" style="padding-bottom:var(--ruimte-5)">
    <div class="wrap">
      <div class="sectie-kop" data-reveal style="margin-bottom:var(--ruimte-5)">
        <span class="oogje">Vacaturebank</span>
        <h1>Vind werk dat bij je past</h1>
        <p class="lead">Filter op sector, plaats, uren en contractvorm. Je filters staan in de adresbalk, dus je kunt deze pagina zo doorsturen naar wie je maar wil.</p>
      </div>
    </div>
  </section>

  <section style="padding-bottom:var(--sectie)">
    <div class="wrap">
      <div class="bank">
        <form class="filterpaneel" id="filters" aria-label="Vacatures filteren">
          <div class="rij rij--tussen">
            <strong style="font-family:var(--font-display);font-size:1.1rem">Filters</strong>
            <button type="button" class="knop knop--leeg filter-sluit" data-sluit-filters style="padding:.4rem .7rem">
              ${ICO.kruis({ w: 16 })} Sluiten
            </button>
          </div>

          <div class="zoekveld">
            ${ICO.zoek({ w: 18 })}
            <input type="search" name="term" placeholder="Zoek op functie" aria-label="Zoek op functie of trefwoord" autocomplete="off">
          </div>

          <div class="zoekveld">
            ${ICO.pin({ w: 18 })}
            <input type="text" name="plaats" placeholder="Plaats of regio" aria-label="Plaats of provincie" list="plaatsen" autocomplete="off">
          </div>

          ${groep('Sector', 'sector', SECTOREN.map((s) => ({ waarde: s.id, label: s.naam, aantal: tel((v) => v.sector === s.id) })))}
          ${groep('Dienstverband', 'dienstverband', DIENSTVERBANDEN.map((d) => ({ waarde: d, label: d, aantal: tel((v) => v.dienstverband === d) })))}
          ${groep('Contractvorm', 'contract', CONTRACTVORMEN.map((c) => ({ waarde: c, label: c, aantal: tel((v) => v.contract === c) })))}
          ${groep('Opleidingsniveau', 'opleiding', OPLEIDINGEN.map((o) => ({ waarde: o, label: o, aantal: tel((v) => v.opleiding === o) })))}

          <fieldset class="filter-groep">
            <h4 style="margin:0 0 .2rem">Minimaal uurloon</h4>
            <div class="range-rij"><span>vanaf</span><output name="loon-uit">€ 13,00</output></div>
            <input type="range" name="loon" min="13" max="30" step="0.5" value="13" aria-label="Minimaal uurloon">
          </fieldset>

          <fieldset class="filter-groep">
            <h4 style="margin:0 0 .2rem">Extra</h4>
            <label class="keuze">
              <input type="checkbox" name="spoed" value="1">
              <span class="vink">${ICO.vinkje({ w: 13 })}</span>
              <span>Alleen spoedvacatures</span>
              <span class="telling">${tel((v) => v.spoed)}</span>
            </label>
            <label class="keuze">
              <input type="checkbox" name="geenDiploma" value="1">
              <span class="vink">${ICO.vinkje({ w: 13 })}</span>
              <span>Geen diploma nodig</span>
              <span class="telling">${tel((v) => v.opleiding === 'Geen diploma nodig')}</span>
            </label>
            <label class="keuze">
              <input type="checkbox" name="zonderRijbewijs" value="1">
              <span class="vink">${ICO.vinkje({ w: 13 })}</span>
              <span>Geen rijbewijs nodig</span>
              <span class="telling">${tel((v) => !v.rijbewijs)}</span>
            </label>
          </fieldset>

          <button type="button" class="knop knop--leeg knop--breed" data-wis-filters>
            ${ICO.kruis({ w: 16 })} Wis alle filters
          </button>
          <button type="button" class="knop knop--breed filter-sluit" data-sluit-filters>
            Toon resultaten
          </button>
        </form>

        <div>
          <div class="resultaat-balk">
            <p class="resultaat-telling" role="status" aria-live="polite">
              <b id="tel-resultaten">${VACATURES.length}</b> vacatures gevonden
            </p>
            <label class="sorteer">
              <span style="color:var(--inkt-60)">Sorteer</span>
              <select id="sorteer" aria-label="Sorteervolgorde">
                <option value="nieuw">Nieuwste eerst</option>
                <option value="loon">Hoogste uurloon</option>
                <option value="uren">Meeste uren</option>
                <option value="az">Functie A-Z</option>
              </select>
            </label>
          </div>

          <div class="chips-rij" id="actieve-filters"></div>
          <div class="resultaten" id="resultaten"></div>

          <div style="margin-top:var(--ruimte-6)">
            <div class="kaart" style="background:var(--clover-950);color:var(--grijs-050);border-radius:var(--radius-xl);gap:var(--ruimte-4)">
              <h3 style="font-size:var(--t-2xl)">Staat jouw baan er niet tussen?</h3>
              <p style="color:rgba(247, 248, 247,.72);max-width:52ch">Stuur een open sollicitatie. We hebben lang niet alles online staan — veel opdrachtgevers vragen ons rechtstreeks.</p>
              <div class="rij">
                <button class="knop knop--wit" data-open-sollicitatie="open">Open sollicitatie ${ICO.pijl({ w: 17 })}</button>
                <a class="knop knop--leeg" style="--knop-tekst:var(--grijs-050);--knop-rand:rgba(247,248,247,.3);--knop-bg-hover:rgba(247,248,247,.1)" href="https://wa.me/${BEDRIJF.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener">
                  ${ICO.whatsapp({ w: 17 })} App ons
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="knop knop--inkt mobiel-filterknop" data-open-filters>
        ${ICO.filter({ w: 17 })} Filters <span id="tel-filters"></span>
      </button>
    </div>
  </section>`;
}

/* =========================================================
   Pagina: vacaturedetail
   ========================================================= */

function viewVacature(id) {
  const v = VACATURES.find((x) => x.id === id);
  if (!v) return viewNietGevonden();
  const s = sectorVan(v.sector);
  const r = RECRUITERS.find((x) => x.id === v.recruiter);
  const gelijkend = VACATURES.filter((x) => x.sector === v.sector && x.id !== v.id).slice(0, 3);
  const lijst = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

  return `
  <section class="sectie sectie--strak" style="background:${s.zacht};border-bottom:1.5px solid var(--inkt)">
    <div class="wrap">
      <nav class="kruimels" aria-label="Kruimelpad">
        <a href="#/">Home</a> <span>/</span>
        <a href="#/vacatures">Vacatures</a> <span>/</span>
        <a href="#/vacatures?sector=${s.id}">${esc(s.naam)}</a> <span>/</span>
        <span style="color:var(--inkt)">${esc(v.titel)}</span>
      </nav>
      <div class="rij" style="gap:.4rem;margin-bottom:var(--ruimte-4)">
        ${v.spoed ? '<span class="label label--spoed">' + ICO.bliksem({ w: 13 }) + ' Spoed</span>' : ''}
        <span class="label" style="background:var(--wit)">${esc(s.naam)}</span>
        <span class="label label--rand">${esc(v.contract)}</span>
      </div>
      <h1 style="max-width:20ch">${esc(v.titel)}</h1>
      <ul class="vac-meta" style="margin-top:var(--ruimte-4);font-size:1rem">
        <li>${ICO.pin({ w: 17 })} ${esc(v.plaats)}, ${esc(v.provincie)}</li>
        <li>${ICO.klok({ w: 17 })} ${v.uren} uur per week</li>
        <li>${ICO.euro({ w: 17 })} ${bedrag(v.min)} – ${bedrag(v.max)} p/u</li>
        <li>${ICO.koffer({ w: 17 })} ${esc(v.dienstverband)}</li>
        <li>${ICO.klok({ w: 17 })} ${geplaatst(v.dagen)}</li>
      </ul>
    </div>
  </section>

  <section class="sectie">
    <div class="wrap">
      <div class="detail">
        <article class="prose">
          <p class="lead" style="color:var(--inkt);font-weight:500">${esc(v.intro)}</p>
          <div><h2>Wat ga je doen?</h2>${lijst(v.taken)}</div>
          <div><h2>Wat vragen we van je?</h2>${lijst(v.vraag)}</div>
          <div><h2>Wat krijg je ervoor terug?</h2>${lijst(v.bieden)}</div>
          <div>
            <h2>Over de werkplek</h2>
            <p>${esc(v.bedrijf)}. We vertellen je graag meer over het team en de sfeer voordat je op gesprek gaat — we zijn er zelf geweest.</p>
          </div>
          <div class="kaart kaart--zacht" style="background:var(--clover-050);border-color:var(--clover-200)">
            <div class="rij" style="gap:.75rem">
              <span class="sector-icoon" style="width:44px;height:44px;background:var(--wit)">${ICO.schild({ w: 20 })}</span>
              <div>
                <b style="font-family:var(--font-display);font-size:1.05rem">Inlenersbeloning gegarandeerd</b>
                <p style="font-size:.9375rem;color:var(--inkt-75);margin:0">Je verdient vanaf dag één hetzelfde als een vaste collega in dezelfde functie, inclusief toeslagen en reiskosten.</p>
              </div>
            </div>
          </div>
        </article>

        <aside class="solliciteer-kaart">
          <h2 style="font-size:var(--t-xl)">Solliciteren duurt 1 minuut</h2>
          <p class="lead" style="font-size:.9375rem">Een cv mag, maar hoeft niet. We bellen je binnen één werkdag terug.</p>
          <button class="knop knop--wit knop--breed knop--groot" data-open-sollicitatie="${v.id}">
            Solliciteer direct ${ICO.pijl({ w: 18 })}
          </button>
          <a class="knop knop--leeg knop--breed" style="--knop-tekst:var(--grijs-050);--knop-rand:rgba(247,248,247,.3);--knop-bg-hover:rgba(247,248,247,.1)" href="https://wa.me/${BEDRIJF.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hoi Clover, ik heb interesse in de vacature ' + v.titel + ' (' + v.id + ').')}" target="_blank" rel="noopener">
            ${ICO.whatsapp({ w: 18 })} Solliciteer via WhatsApp
          </a>
          <dl>
            <div><dt>Vacaturenummer</dt><dd>${esc(v.id.toUpperCase())}</dd></div>
            <div><dt>Contractvorm</dt><dd>${esc(v.contract)}</dd></div>
            <div><dt>Opleiding</dt><dd>${esc(v.opleiding)}</dd></div>
            <div><dt>Rijbewijs</dt><dd>${v.rijbewijs ? 'Nodig' : 'Niet nodig'}</dd></div>
            <div><dt>Ploegendienst</dt><dd>${v.ploegen ? 'Ja' : 'Nee'}</dd></div>
          </dl>
          <div class="recruiter">
            ${monogram(r.naam, RECRUITERS.indexOf(r))}
            <span>
              <b>${esc(r.naam)}</b>
              <small>${esc(r.rol)}</small>
            </span>
          </div>
          <div class="rij" style="gap:.5rem;flex-wrap:nowrap">
            <a class="knop knop--leeg" style="flex:1;--knop-tekst:var(--grijs-050);--knop-rand:rgba(247,248,247,.3);--knop-bg-hover:rgba(247,248,247,.1)" href="tel:${esc(r.tel.replace(/\s/g, ''))}">${ICO.telefoon({ w: 16 })} Bellen</a>
            <a class="knop knop--leeg" style="flex:1;--knop-tekst:var(--grijs-050);--knop-rand:rgba(247,248,247,.3);--knop-bg-hover:rgba(247,248,247,.1)" href="mailto:${esc(r.mail)}">${ICO.mail({ w: 16 })} Mailen</a>
          </div>
          <button class="knop knop--leeg knop--breed" style="--knop-tekst:var(--grijs-050);--knop-rand:rgba(247,248,247,.3);--knop-bg-hover:rgba(247,248,247,.1)" data-deel="${v.id}">
            ${ICO.pijlKlein({ w: 16 })} Deel deze vacature
          </button>
        </aside>
      </div>

      ${gelijkend.length ? `
      <div style="margin-top:var(--sectie)">
        <div class="sectie-kop sectie-kop--split">
          <h2>Vergelijkbare vacatures</h2>
          <a class="knop knop--leeg" href="#/vacatures?sector=${s.id}">Meer in ${esc(s.naam)} ${ICO.pijl({ w: 17 })}</a>
        </div>
        <div class="raster raster--3">${gelijkend.map((x) => vacKaart(x, { kort: true })).join('')}</div>
      </div>` : ''}
    </div>
  </section>`;
}

function viewNietGevonden() {
  return `
  <section class="sectie">
    <div class="wrap wrap--smal" style="text-align:center;display:grid;gap:var(--ruimte-5);justify-items:center">
      <span class="kop-mega" style="font-family:var(--font-display);color:var(--clover-300)">404</span>
      <h1>Deze pagina is van de werkvloer verdwenen</h1>
      <p class="lead">Misschien is de vacature vervuld of klopt de link niet meer. Kijk even in de vacaturebank — de kans is groot dat er iets beters tussen staat.</p>
      <div class="rij" style="justify-content:center">
        <a class="knop knop--groot" href="#/vacatures">Naar de vacaturebank ${ICO.pijl({ w: 18 })}</a>
        <a class="knop knop--leeg knop--groot" href="#/">Terug naar home</a>
      </div>
    </div>
  </section>`;
}

/* =========================================================
   Pagina: voor werkgevers
   ========================================================= */

function viewWerkgevers() {
  return `
  <section class="hero raster-lijnen" style="background:var(--staal-zacht);border-bottom:1.5px solid var(--inkt)">
    <div class="wrap">
      <div class="hero-raster">
        <div class="hero-tekst">
          <span class="oogje" data-reveal style="color:var(--staal)">Voor opdrachtgevers</span>
          <h1 data-split>Personeel dat <span class="markeer markeer--staal">blijft</span>.</h1>
          <p class="lead" data-reveal style="--vertraag:120ms;color:var(--inkt-75)">
            96% van onze kandidaten maakt de opdracht af. Dat komt niet door een grotere database,
            maar doordat we eerst uw werkvloer leren kennen en daarna pas gaan werven.
          </p>
          <div class="rij" data-reveal style="--vertraag:200ms">
            <a class="knop knop--blauw knop--groot" href="#aanvraag">Personeel aanvragen ${ICO.pijl({ w: 18 })}</a>
            <a class="knop knop--wit knop--groot" href="tel:${BEDRIJF.telRaw}">${ICO.telefoon({ w: 18 })} ${esc(BEDRIJF.tel)}</a>
          </div>
          <div class="rij" data-reveal style="--vertraag:260ms;gap:1rem">
            ${googleBadge()}
            <ul class="hero-bewijs" style="gap:.35rem 1rem">
              <li>${ICO.vink({ w: 15 })} Eerste kandidaten binnen 48 uur</li>
              <li>${ICO.vink({ w: 15 })} Maximaal 3 voorgedragen kandidaten</li>
              <li>${ICO.vink({ w: 15 })} Eén vast aanspreekpunt</li>
            </ul>
          </div>
        </div>
        <div class="hero-beeld" data-reveal="schaal">
          <div class="toon-paneel">
            <div class="toon-balk">
              <span class="stip"></span><span class="stip"></span><span class="stip"></span>
              <span style="margin-left:.5rem">Aanvraag CLV-2291 · Voorselectie</span>
            </div>

            <div style="display:grid;gap:.5rem;padding:.25rem .6rem .5rem">
              <div class="rij rij--tussen" style="font-size:var(--t-xs);color:var(--inkt-60)">
                <span>Aanvraag ontvangen</span><span>Kandidaten voorgedragen</span>
              </div>
              <div class="voortgang" aria-hidden="true">
                <span class="voortgang-stap is-klaar"><i></i></span>
                <span class="voortgang-stap is-klaar"><i></i></span>
                <span class="voortgang-stap is-bezig"><i></i></span>
                <span class="voortgang-stap"><i></i></span>
              </div>
            </div>

            ${VACATURES.slice(0, 3).map((v, i) => {
              const s = sectorVan(v.sector);
              const r = RECRUITERS.find((x) => x.id === v.recruiter);
              return `
              <div class="toon-rij ${i === 0 ? 'is-actief' : ''}">
                ${monogram(['Bas Overmars', 'Ilse Nagel', 'Kevin Rood'][i], i + 2, 'avatar')}
                <span style="min-width:0">
                  <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(['Bas Overmars', 'Ilse Nagel', 'Kevin Rood'][i])}</b>
                  <small>${esc(v.titel)} · beschikbaar per direct</small>
                </span>
                <span class="label label--zand" style="font-size:var(--t-xs)">${92 - i * 4}% match</span>
              </div>`;
            }).join('')}

            <div class="toon-balk" style="border-bottom:0;border-top:1px solid var(--lijn);padding-top:.75rem;padding-bottom:0">
              <span>Voorgedragen door <b style="font-weight:600;color:var(--inkt)">${esc(RECRUITERS[3].naam)}</b> · 41 uur na aanvraag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${band(['Uitzenden', 'Detachering', 'Werving & selectie', 'Payroll', 'ZZP-bemiddeling', 'Vaste flexpool', 'Piek & seizoen'], 'band--inkt')}

  <!-- Diensten -->
  <section class="sectie">
    <div class="wrap">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Onze diensten</span>
        <h2>Vier manieren om aan mensen te komen</h2>
        <p class="lead">Welke vorm het beste past hangt af van hoe lang u iemand nodig heeft en hoeveel risico u zelf wilt dragen. We zeggen het eerlijk als uitzenden niet de goedkoopste route is.</p>
      </div>
      <div class="raster raster--2">
        ${DIENSTEN.map((d, i) => `
          <article class="kaart" data-reveal style="--vertraag:${i * 70}ms;gap:var(--ruimte-4)">
            <span class="sector-icoon" style="background:${d.zacht};color:${d.kleur}">${ICO[d.icoon]({ w: 24 })}</span>
            <h3 style="font-size:var(--t-2xl)">${esc(d.titel)}</h3>
            <p style="color:var(--inkt-75)">${esc(d.tekst)}</p>
            <ul style="display:grid;gap:.5rem">
              ${d.punten.map((p) => `<li style="display:flex;gap:.6rem;align-items:start;font-weight:500;font-size:.9375rem">
                <span style="color:${d.kleur};flex:none">${ICO.vink({ w: 18 })}</span><span>${esc(p)}</span></li>`).join('')}
            </ul>
          </article>`).join('')}
      </div>
    </div>
  </section>

  <!-- Werkwijze -->
  <section class="sectie sectie--wit">
    <div class="wrap">
      <div class="raster raster--2" style="gap:var(--ruimte-7);align-items:start">
        <div class="stapel" data-reveal="links">
          <span class="oogje">Onze werkwijze</span>
          <h2>Wij komen eerst langs. Altijd.</h2>
          <p class="lead">Een functieprofiel vertelt wat iemand moet kunnen. Een ochtend meelopen vertelt wie er past. Daarom starten we elke nieuwe samenwerking op uw werkvloer — niet achter onze laptop.</p>
          ${keurmerkStrip()}
        </div>
        <div>${stappenLijst(STAPPEN_WERKGEVER)}</div>
      </div>
    </div>
  </section>

  <!-- Sectoren kort -->
  <section class="sectie">
    <div class="wrap">
      <div class="sectie-kop sectie-kop--split" data-reveal>
        <div class="stapel">
          <span class="oogje">Sectorkennis</span>
          <h2>Waar we de cao's uit ons hoofd kennen</h2>
        </div>
        <a class="knop knop--leeg" href="#/sectoren">Alle sectoren ${ICO.pijl({ w: 17 })}</a>
      </div>
      <div class="raster raster--4">
        ${SECTOREN.map((s, i) => `<div data-reveal style="--vertraag:${i * 50}ms">${sectorKaart(s, VACATURES.filter((v) => v.sector === s.id).length)}</div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Reviews werkgevers -->
  <section class="sectie sectie--papier">
    <div class="wrap">
      <div class="sectie-kop sectie-kop--split" data-reveal>
        <div class="stapel">
          <span class="oogje">Opdrachtgevers aan het woord</span>
          <h2>Samenwerkingen die blijven duren</h2>
        </div>
        ${googleBadge()}
      </div>
      <div class="raster raster--3">${REVIEWS_WERKGEVER.map(reviewKaart).join('')}</div>
    </div>
  </section>

  <!-- Aanvraagformulier -->
  <section class="sectie sectie--wit" id="aanvraag">
    <div class="wrap">
      <div class="raster raster--2" style="gap:var(--ruimte-7);align-items:start">
        <div class="stapel" data-reveal="links">
          <span class="oogje">Personeel aanvragen</span>
          <h2>Vertel wat u zoekt</h2>
          <p class="lead">Vul het formulier in of bel ${esc(BEDRIJF.tel)}. U krijgt binnen één werkdag een reactie van een vaste accountmanager, geen algemene inbox.</p>
          <div class="kaart kaart--zacht" style="background:var(--clover-050);border-color:var(--clover-200);flex-direction:row;gap:.85rem;align-items:center">
            ${monogram(RECRUITERS[3].naam, 3)}
            <div>
              <b style="font-family:var(--font-display);font-size:1.05rem;display:block">${esc(RECRUITERS[3].naam)}</b>
              <small style="color:var(--inkt-60)">${esc(RECRUITERS[3].rol)}</small>
              <div class="rij" style="gap:.75rem;margin-top:.4rem;font-size:.875rem;font-weight:600">
                <a href="tel:${esc(RECRUITERS[3].tel.replace(/\s/g, ''))}" class="link-pijl" style="font-size:.875rem">${esc(RECRUITERS[3].tel)}</a>
              </div>
            </div>
          </div>
        </div>

        <form class="formulier kaart" data-form="aanvraag" data-reveal="rechts" style="gap:var(--ruimte-4)">
          <div class="form-rij">
            <div class="invoer">
              <label for="a-bedrijf">Bedrijfsnaam</label>
              <input id="a-bedrijf" name="bedrijf" required placeholder="Uw bedrijf B.V.">
              <span class="foutmelding">Vul uw bedrijfsnaam in.</span>
            </div>
            <div class="invoer">
              <label for="a-naam">Contactpersoon</label>
              <input id="a-naam" name="naam" required placeholder="Voor- en achternaam">
              <span class="foutmelding">Vul een naam in.</span>
            </div>
          </div>
          <div class="form-rij">
            <div class="invoer">
              <label for="a-mail">E-mailadres</label>
              <input id="a-mail" name="email" type="email" required placeholder="naam@bedrijf.nl">
              <span class="foutmelding">Vul een geldig e-mailadres in.</span>
            </div>
            <div class="invoer">
              <label for="a-tel">Telefoonnummer</label>
              <input id="a-tel" name="tel" type="tel" required placeholder="06 12 34 56 78">
              <span class="foutmelding">Vul een telefoonnummer in.</span>
            </div>
          </div>
          <div class="form-rij">
            <div class="invoer">
              <label for="a-sector">Sector</label>
              <select id="a-sector" name="sector">
                ${SECTOREN.map((s) => `<option value="${s.id}">${esc(s.naam)}</option>`).join('')}
              </select>
            </div>
            <div class="invoer">
              <label for="a-dienst">Gewenste dienst</label>
              <select id="a-dienst" name="dienst">
                ${DIENSTEN.map((d) => `<option>${esc(d.titel)}</option>`).join('')}
                <option>Weet ik nog niet — adviseer mij</option>
              </select>
            </div>
          </div>
          <div class="form-rij">
            <div class="invoer">
              <label for="a-aantal">Aantal medewerkers</label>
              <input id="a-aantal" name="aantal" type="number" min="1" value="1">
            </div>
            <div class="invoer">
              <label for="a-start">Gewenste startdatum</label>
              <input id="a-start" name="start" type="date">
            </div>
          </div>
          <div class="invoer">
            <label for="a-omschrijving">Waar moet de kandidaat goed in zijn? <span class="opt">(optioneel)</span></label>
            <textarea id="a-omschrijving" name="omschrijving" placeholder="Bijvoorbeeld: zelfstandig kunnen werken, VCA, ervaring met heftruck…"></textarea>
            <span class="hulp">Hoe concreter, hoe scherper onze voorselectie.</span>
          </div>
          <label class="akkoord">
            <input type="checkbox" required>
            <span>Ik ga akkoord met de <a href="#/privacy">privacyverklaring</a> en wil gebeld worden over deze aanvraag.</span>
          </label>
          <button class="knop knop--blauw knop--breed knop--groot" type="submit">Aanvraag versturen ${ICO.pijl({ w: 18 })}</button>
          <p style="font-size:.8125rem;color:var(--inkt-60);text-align:center;margin:0">Reactie binnen 1 werkdag · Vrijblijvend · Geen abonnement</p>
        </form>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="sectie sectie--grijs-050">
    <div class="wrap wrap--smal">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Veelgestelde vragen</span>
        <h2>Wat opdrachtgevers meestal willen weten</h2>
      </div>
      ${accordeon(FAQ_WERKGEVER, 'faq-wg')}
    </div>
  </section>`;
}

/* =========================================================
   Pagina: sectoren
   ========================================================= */

function viewSectoren() {
  return `
  <section class="sectie sectie--strak" style="border-bottom:1.5px solid var(--lijn)">
    <div class="wrap">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Sectoren</span>
        <h1>Acht werelden, één aanpak</h1>
        <p class="lead">In elke sector gelden andere cao's, certificaten en gewoontes. Daarom hebben onze intercedenten hun eigen vakgebied — en kennen ze de vraag achter de vraag.</p>
      </div>
    </div>
  </section>

  <section class="sectie">
    <div class="wrap" style="display:grid;gap:var(--ruimte-5)">
      ${SECTOREN.map((s, i) => {
        const vacs = VACATURES.filter((v) => v.sector === s.id);
        const lonen = vacs.map((v) => v.min);
        const vanaf = lonen.length ? Math.min(...lonen) : 0;
        return `
        <article class="kaart" data-reveal style="--vertraag:${i * 50}ms;padding:0;overflow:hidden;flex-direction:row;flex-wrap:wrap">
          <div style="flex:3 1 340px;min-width:0;padding:clamp(1.5rem, 1rem + 2vw, 2.5rem);display:grid;gap:1rem;align-content:start">
            <div class="rij" style="gap:.85rem">
              <span class="sector-icoon" style="background:${s.zacht};color:${s.kleur}">${ICO[s.icoon]({ w: 26 })}</span>
              <div>
                <h2 style="font-size:var(--t-2xl)">${esc(s.naam)}</h2>
                <span class="telling-regel">${vacs.length} open ${vacs.length === 1 ? 'vacature' : 'vacatures'}${vanaf ? ` · vanaf ${euro(vanaf)} p/u` : ''}</span>
              </div>
            </div>
            <p style="color:var(--inkt-75);max-width:52ch">${esc(s.pitch)}</p>
            <div class="rij" style="gap:.4rem">
              ${[...new Set(vacs.map((v) => v.plaats))].slice(0, 5).map((p) => `<span class="label label--rand">${ICO.pin({ w: 13 })} ${esc(p)}</span>`).join('')}
            </div>
            <div class="rij" style="margin-top:.5rem">
              <a class="knop" href="#/vacatures?sector=${s.id}" style="--knop-bg:${s.kleur}">Bekijk vacatures ${ICO.pijl({ w: 17 })}</a>
              <a class="knop knop--leeg" href="#/werkgevers">Personeel in deze sector</a>
            </div>
          </div>
          <div style="flex:1 1 230px;min-height:220px;background:${s.zacht};border-left:1px solid var(--lijn);display:grid;align-content:center;gap:.9rem;padding:var(--ruimte-5)">
            <span style="color:${s.kleur}">${ICO[s.icoon]({ w: 34, sw: 1.6 })}</span>
            <dl style="display:grid;gap:.65rem;margin:0">
              <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.875rem">
                <dt style="color:var(--inkt-60)">Open vacatures</dt>
                <dd style="font-weight:600;font-variant-numeric:tabular-nums">${vacs.length}</dd>
              </div>
              <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.875rem">
                <dt style="color:var(--inkt-60)">Uurloon vanaf</dt>
                <dd style="font-weight:600;font-variant-numeric:tabular-nums">${vanaf ? euro(vanaf) : '—'}</dd>
              </div>
              <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.875rem">
                <dt style="color:var(--inkt-60)">Intercedent</dt>
                <dd style="font-weight:600">${esc((RECRUITERS.find((x) => vacs.some((v) => v.recruiter === x.id)) || RECRUITERS[3]).naam.split(' ')[0])}</dd>
              </div>
            </dl>
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>

  <section class="sectie sectie--wit"><div class="wrap">${ctaBlok()}</div></section>`;
}

/* =========================================================
   Pagina: over Clover
   ========================================================= */

function viewOver() {
  return `
  <section class="sectie sectie--strak" style="background:var(--clover-050);border-bottom:1.5px solid var(--inkt)">
    <div class="wrap">
      <div class="sectie-kop" data-reveal style="max-width:24ch">
        <span class="oogje">Over Clover</span>
        <h1 data-split>Een klavertje vier maak je niet. Je vindt het.</h1>
      </div>
      <p class="lead" data-reveal style="--vertraag:140ms">
        Clover is een regionaal uitzendbureau met een simpele overtuiging: een goede match ontstaat als je beide kanten
        écht kent. Daarom lopen wij mee op de werkvloer, bellen we terug wanneer we dat beloven en zeggen we ook
        wanneer iets niet gaat lukken.
      </p>
    </div>
  </section>

  <section class="sectie">
    <div class="wrap">
      <div class="raster raster--3">
        ${[
          { i: 'hand', t: 'Eerlijk boven verkopen', d: 'Als een kandidaat niet past, sturen we die niet. Als een tarief onrealistisch is, zeggen we dat vóór de opdracht in plaats van erna.' },
          { i: 'mensen', t: 'Eén vast gezicht', d: 'Je krijgt geen ticketnummer maar een intercedent met een naam, een telefoonnummer en kennis van jouw sector.' },
          { i: 'schild', t: 'Alles aantoonbaar op orde', d: 'SNA/NEN 4400-1, ABU-cao, VCU en AVG. Niet omdat het moet, maar omdat het u en onze mensen beschermt.' }
        ].map((k, i) => `
          <article class="kaart" data-reveal style="--vertraag:${i * 80}ms">
            <span class="sector-icoon">${ICO[k.i]({ w: 26 })}</span>
            <h3 style="font-size:var(--t-xl)">${esc(k.t)}</h3>
            <p style="color:var(--inkt-75)">${esc(k.d)}</p>
          </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="sectie sectie--donker sectie--strak">
    <div class="wrap">
      <div class="raster raster--4">
        ${CIJFERS.map((c, i) => `
          <div class="cijfer" data-reveal style="--vertraag:${i * 80}ms">
            <b><span data-tel="${c.getal}">0</span>${esc(c.achter)}</b><span>${esc(c.label)}</span>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sectie sectie--wit">
    <div class="wrap">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Het team</span>
        <h2>Dit zijn de mensen die je aan de lijn krijgt</h2>
        <p class="lead">Vier intercedenten, vier vakgebieden. Bel gerust rechtstreeks — daar zijn die nummers voor.</p>
      </div>
      <div class="raster raster--4">
        ${RECRUITERS.map((r, i) => `
          <article class="kaart kaart--klik" data-reveal style="--vertraag:${i * 70}ms;padding:0;overflow:hidden">
            <div style="aspect-ratio:4/3;display:grid;place-items:center;background:var(--grijs-100);border-bottom:1px solid var(--lijn)">
              ${monogram(r.naam, i, 'avatar')}
            </div>
            <div style="padding:var(--ruimte-4);display:grid;gap:.5rem">
              <h3 style="font-size:1.15rem">${esc(r.naam)}</h3>
              <small style="color:var(--inkt-60);font-size:.85rem">${esc(r.rol)}</small>
              <a class="link-pijl" style="font-size:.9rem;justify-self:start" href="tel:${esc(r.tel.replace(/\s/g, ''))}">${esc(r.tel)}</a>
            </div>
          </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="sectie sectie--grijs-050">
    <div class="wrap wrap--smal">
      <div class="sectie-kop" data-reveal>
        <span class="oogje">Voor werkzoekenden</span>
        <h2>Vragen die we vaak krijgen</h2>
      </div>
      ${accordeon(FAQ_WERKZOEKEND, 'faq-wz')}
    </div>
  </section>

  <section class="sectie sectie--wit"><div class="wrap">${ctaBlok()}</div></section>`;
}

/* =========================================================
   Pagina: contact
   ========================================================= */

function viewContact() {
  return `
  <section class="sectie">
    <div class="wrap">
      <div class="raster raster--2" style="gap:var(--ruimte-7);align-items:start">
        <div class="stapel" data-reveal="links">
          <span class="oogje">Contact</span>
          <h1>Even kort schakelen?</h1>
          <p class="lead">Bel, app of loop binnen. We zitten aan de ${esc(BEDRIJF.adres)} in ${esc(BEDRIJF.stad)} en zetten altijd koffie.</p>

          <div class="raster raster--2" style="gap:var(--ruimte-4);margin-top:var(--ruimte-4)">
            <a class="kaart kaart--klik" href="tel:${BEDRIJF.telRaw}" style="gap:.6rem">
              <span class="sector-icoon" style="background:var(--geel)">${ICO.telefoon({ w: 24 })}</span>
              <b style="font-family:var(--font-display);font-size:1.1rem">${esc(BEDRIJF.tel)}</b>
              <small style="color:var(--inkt-60)">${esc(BEDRIJF.openingstijden)}</small>
            </a>
            <a class="kaart kaart--klik" href="https://wa.me/${BEDRIJF.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener" style="gap:.6rem">
              <span class="sector-icoon" style="background:var(--clover-200)">${ICO.whatsapp({ w: 24 })}</span>
              <b style="font-family:var(--font-display);font-size:1.1rem">WhatsApp</b>
              <small style="color:var(--inkt-60)">Meestal binnen een uur antwoord</small>
            </a>
            <a class="kaart kaart--klik" href="mailto:${esc(BEDRIJF.mail)}" style="gap:.6rem">
              <span class="sector-icoon" style="background:var(--staal-zacht)">${ICO.mail({ w: 24 })}</span>
              <b style="font-family:var(--font-display);font-size:1rem;word-break:break-all">${esc(BEDRIJF.mail)}</b>
              <small style="color:var(--inkt-60)">Reactie binnen 1 werkdag</small>
            </a>
            <div class="kaart" style="gap:.6rem">
              <span class="sector-icoon" style="background:var(--signaal-zacht)">${ICO.pin({ w: 24 })}</span>
              <b style="font-family:var(--font-display);font-size:1.1rem">${esc(BEDRIJF.adres)}</b>
              <small style="color:var(--inkt-60)">${esc(BEDRIJF.postcode)} ${esc(BEDRIJF.stad)}</small>
            </div>
          </div>

          <div class="kaart kaart--zacht" style="margin-top:var(--ruimte-4);background:var(--clover-050);border-color:var(--clover-200)">
            <b style="font-family:var(--font-display);font-size:1.05rem">Liever langskomen zonder afspraak?</b>
            <p style="color:var(--inkt-75);font-size:.9375rem;margin:0">Elke donderdag tussen 15:00 en 18:00 is het inloopspreekuur. Neem je ID-bewijs mee, dan kunnen we je meteen inschrijven.</p>
          </div>
        </div>

        <form class="formulier kaart" data-form="contact" data-reveal="rechts" style="gap:var(--ruimte-4)">
          <h2 style="font-size:var(--t-2xl)">Stuur een bericht</h2>
          <div class="invoer">
            <label for="c-rol">Ik ben…</label>
            <select id="c-rol" name="rol">
              <option>Werkzoekend</option>
              <option>Opdrachtgever</option>
              <option>Uitzendkracht van Clover</option>
              <option>Anders</option>
            </select>
          </div>
          <div class="form-rij">
            <div class="invoer">
              <label for="c-naam">Naam</label>
              <input id="c-naam" name="naam" required placeholder="Voor- en achternaam">
              <span class="foutmelding">Vul je naam in.</span>
            </div>
            <div class="invoer">
              <label for="c-tel">Telefoonnummer</label>
              <input id="c-tel" name="tel" type="tel" required placeholder="06 12 34 56 78">
              <span class="foutmelding">Vul een telefoonnummer in.</span>
            </div>
          </div>
          <div class="invoer">
            <label for="c-mail">E-mailadres</label>
            <input id="c-mail" name="email" type="email" required placeholder="jouw@email.nl">
            <span class="foutmelding">Vul een geldig e-mailadres in.</span>
          </div>
          <div class="invoer">
            <label for="c-bericht">Je bericht</label>
            <textarea id="c-bericht" name="bericht" required placeholder="Waar kunnen we mee helpen?"></textarea>
            <span class="foutmelding">Schrijf even kort waar het over gaat.</span>
          </div>
          <label class="akkoord">
            <input type="checkbox" required>
            <span>Ik ga akkoord met de <a href="#/privacy">privacyverklaring</a>.</span>
          </label>
          <button class="knop knop--breed knop--groot" type="submit">Versturen ${ICO.pijl({ w: 18 })}</button>
        </form>
      </div>
    </div>
  </section>`;
}

/* =========================================================
   Pagina: privacy (beknopt, demo)
   ========================================================= */

function viewPrivacy() {
  return `
  <section class="sectie">
    <div class="wrap wrap--smal prose">
      <span class="oogje">Juridisch</span>
      <h1>Privacyverklaring</h1>
      <p class="lead">Dit is een voorbeeldtekst voor de demo. De definitieve privacyverklaring wordt opgesteld samen met de juridisch adviseur van Clover.</p>
      <div>
        <h2>Welke gegevens verwerken we?</h2>
        <ul>
          <li>Contactgegevens die je zelf invult bij een sollicitatie, jobalert of aanvraag</li>
          <li>Je cv en werkervaring, als je die uploadt</li>
          <li>Gegevens die nodig zijn voor de loonadministratie zodra je voor ons werkt</li>
        </ul>
      </div>
      <div>
        <h2>Hoe lang bewaren we ze?</h2>
        <p>Sollicitatiegegevens bewaren we vier weken na afronding van de procedure, of met jouw toestemming één jaar. Loongegevens bewaren we zolang de fiscale bewaarplicht dat vereist.</p>
      </div>
      <div>
        <h2>Jouw rechten</h2>
        <p>Je kunt op elk moment inzage, correctie of verwijdering vragen via ${esc(BEDRIJF.mail)}. We reageren binnen vier weken.</p>
      </div>
    </div>
  </section>`;
}

/* =========================================================
   Sollicitatieformulier (in modal)
   ========================================================= */

function sollicitatieFormulier(vacId) {
  const v = VACATURES.find((x) => x.id === vacId);
  const titel = v ? v.titel : 'Open sollicitatie';
  const r = v ? RECRUITERS.find((x) => x.id === v.recruiter) : RECRUITERS[3];

  return `
  <div class="modal-kop">
    <div>
      <span class="oogje">Solliciteren</span>
      <h2 id="modal-titel" style="font-size:var(--t-2xl);margin-top:.4rem">${esc(titel)}</h2>
      ${v ? `<p style="color:var(--inkt-60);font-size:.9375rem;margin-top:.3rem">${esc(v.plaats)} · ${v.uren} uur · ${euro(v.min)} – ${euro(v.max)} p/u</p>` : ''}
    </div>
    <button class="sluit-knop" data-sluit-modal aria-label="Sluiten">${ICO.kruis({ w: 18 })}</button>
  </div>

  <form class="formulier" data-form="sollicitatie" data-vacature="${esc(vacId)}" novalidate>
    <div class="form-rij">
      <div class="invoer">
        <label for="s-naam">Je naam</label>
        <input id="s-naam" name="naam" required placeholder="Voor- en achternaam">
        <span class="foutmelding">Vul je naam in.</span>
      </div>
      <div class="invoer">
        <label for="s-tel">Telefoonnummer</label>
        <input id="s-tel" name="tel" type="tel" required placeholder="06 12 34 56 78">
        <span class="foutmelding">Hier bellen we je op — vul een geldig nummer in.</span>
      </div>
    </div>
    <div class="invoer">
      <label for="s-mail">E-mailadres <span class="opt">(optioneel)</span></label>
      <input id="s-mail" name="email" type="email" placeholder="jouw@email.nl">
      <span class="foutmelding">Dit e-mailadres klopt niet helemaal.</span>
    </div>
    <div class="invoer">
      <label for="s-start">Wanneer kun je beginnen?</label>
      <select id="s-start" name="start">
        <option>Per direct</option>
        <option>Binnen 2 weken</option>
        <option>Binnen een maand</option>
        <option>In overleg</option>
      </select>
    </div>

    <div class="invoer">
      <label>Cv meesturen <span class="opt">(optioneel)</span></label>
      <label class="dropzone" data-dropzone>
        ${ICO.upload({ w: 28 })}
        <b data-dz-titel>Sleep je cv hierheen of klik om te kiezen</b>
        <small data-dz-sub>PDF, Word of een foto — max. 10 MB</small>
        <input type="file" class="alleen-lezer" name="cv" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg">
      </label>
      <span class="hulp">Geen cv? Geen probleem. We maken er samen één aan de telefoon.</span>
    </div>

    <div class="invoer">
      <label for="s-motivatie">Waarom deze baan? <span class="opt">(optioneel)</span></label>
      <textarea id="s-motivatie" name="motivatie" placeholder="Eén of twee zinnen is genoeg."></textarea>
    </div>

    <label class="akkoord">
      <input type="checkbox" name="akkoord" required>
      <span>Ik ga akkoord met de <a href="#/privacy">privacyverklaring</a> en wil gebeld worden over deze sollicitatie.</span>
    </label>
    <span class="foutmelding" data-fout-akkoord style="margin-top:-.5rem">Je moet akkoord gaan voordat we je mogen bellen.</span>

    <button class="knop knop--breed knop--groot" type="submit">Verstuur sollicitatie ${ICO.pijl({ w: 18 })}</button>

    <div class="rij" style="justify-content:center;gap:.5rem;font-size:.875rem;color:var(--inkt-60)">
      ${ICO.klok({ w: 15 })} <span>Je hoort binnen 1 werkdag van ${esc(r.naam.split(' ')[0])}</span>
    </div>
  </form>`;
}

function sollicitatieSucces(vacId) {
  const v = VACATURES.find((x) => x.id === vacId);
  const r = v ? RECRUITERS.find((x) => x.id === v.recruiter) : RECRUITERS[3];
  return `
  <div class="succes">
    <span class="succes-vink">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--clover-600)" stroke-width="3"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 4.5 4.5 10-10"/></svg>
    </span>
    <h2 style="font-size:var(--t-2xl)">Gelukt — je sollicitatie staat bij ons binnen</h2>
    <p class="lead" style="text-align:center">
      ${esc(r.naam)} kijkt ernaar en belt je binnen één werkdag. Je krijgt zo ook een bevestiging per e-mail.
    </p>
    <div class="recruiter" style="color:var(--inkt);justify-content:center">
      ${monogram(r.naam, RECRUITERS.indexOf(r))}
      <span style="text-align:left">
        <b style="font-family:var(--font-display);font-size:1.05rem">${esc(r.naam)}</b>
        <small style="color:var(--inkt-60);display:block">${esc(r.rol)}</small>
      </span>
    </div>
    <div class="rij" style="justify-content:center">
      <a class="knop knop--wit" href="tel:${esc(r.tel.replace(/\s/g, ''))}">${ICO.telefoon({ w: 17 })} Bel alvast zelf</a>
      <button class="knop" data-sluit-modal>Verder kijken ${ICO.pijl({ w: 17 })}</button>
    </div>
    <p style="font-size:.8125rem;color:var(--inkt-60)">Demo: er wordt niets echt verstuurd of opgeslagen.</p>
  </div>`;
}
