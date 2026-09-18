/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  app.js  ->  Interface, stappen en offerteaanvraag.
 * ============================================================================
 *  Stappenvolgorde (aanpasbaar in STAPPEN onderaan dit bestand):
 *    1 Materiaal   2 Kozijnmaat   3 Profiel   4 Vakverdeling
 *    5 Vakinvulling (vast glas / draaikiep / deur)
 *    6 Muuraansluiting   7 Kleur kozijn en muur-RAL   8 Soort beglazing
 *    9 Ventilatieroosters   10 Inzethorren   11 Montage en toebehoren
 *    12 Overzicht en offerte aanvragen
 * ============================================================================
 */

(function () {
  'use strict';

  var CAT = window.FORTIS_CATALOG;
  var P   = window.FortisPricing;
  var PV  = window.FortisPreview;

  var OPSLAG_SLEUTEL = 'fortis-offerte-v1';

  /* ======================================================== kleine helpers */

  function h(tag, attrs, kinderen) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    });
    (kinderen || []).forEach(function (kind) {
      if (kind === null || kind === undefined || kind === false) return;
      node.appendChild(typeof kind === 'string' ? document.createTextNode(kind) : kind);
    });
    return node;
  }

  function leeg(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /*
   *  Het verlaten van een maatveld leidt tot een nieuwe opbouw van de pagina.
   *  Doen we dat meteen, dan raakt het veld waar de bezoeker net op klikte zijn
   *  focus kwijt. Daarom wachten we tot de browser de focus heeft verplaatst.
   */
  function naFocusWissel(fn) { setTimeout(fn, 0); }

  /** Houdt alleen cijfers over in een maat- of aantalveld. */
  function alleenCijfers(e) {
    var schoon = String(e.target.value).replace(/[^0-9]/g, '');
    if (schoon !== e.target.value) {
      var pos = Math.max(0, (e.target.selectionStart || schoon.length) - 1);
      e.target.value = schoon;
      try { e.target.setSelectionRange(pos, pos); } catch (err) { /* niet ondersteund */ }
    }
    return schoon;
  }
  function euro(n) { return P.euro(n); }
  function getal(v, standaard) { var n = parseInt(v, 10); return isNaN(n) ? standaard : n; }
  function klem(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function svgEl(attrs) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    return s;
  }

  function actieveMaterialen() {
    return CAT.materials.filter(function (m) { return m.actief !== false; });
  }

  /* =============================================================== toestand */

  function nieuwItem() {
    var mat = actieveMaterialen()[0];
    var breedte = 1800, hoogte = 1500;
    return {
      id: 'el-' + Date.now() + '-' + Math.round(Math.random() * 1e4),
      naam: '',                       // bv. 'Woonkamer voorgevel'
      material: mat.id,
      profile: mat.profielen[0].id,
      width: breedte,
      height: hoogte,
      bovenlicht: false,
      bovenlichtHoogte: CAT.settings.bovenlicht.standaard,
      bovenlichtInvulling: 'vast',
      vakken: [
        { breedte: breedte / 2, invulling: 'vast' },
        { breedte: breedte / 2, invulling: 'dk-r' }
      ],
      muuraansluiting: 'aanslag-afdek',
      muursoort: 'spouw',
      muurRal: 'gelijk',
      colorOut: 'ral9016',
      colorIn: 'ral9016',
      glass: 'hr2p',
      rooster: 'zelfregelend',
      hor: { type: 'geen', aantal: 0 },
      options: {},
      montage: true,
      demontage: false,
      qty: 1
    };
  }

  var state = {
    huidig: nieuwItem(),
    bewerktId: null,      // id van het element dat wordt aangepast (of null)
    items: [],
    eenmalig: { meetservice: true },
    klant: {
      naam: '', email: '', telefoon: '', adres: '', postcode: '', plaats: '',
      soortWoning: '', periode: '', opmerking: '', akkoord: false
    },
    verzonden: null       // { referentie, moment }
  };

  /* --------------------------------------------------- opslaan in de browser */

  function bewaar() {
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify({
        huidig: state.huidig, items: state.items, eenmalig: state.eenmalig
      }));
    } catch (e) { /* privémodus: gewoon doorgaan */ }
  }

  function herstel() {
    try {
      var ruw = localStorage.getItem(OPSLAG_SLEUTEL);
      if (!ruw) return;
      var data = JSON.parse(ruw);
      if (data.huidig && data.huidig.vakken) state.huidig = data.huidig;
      if (Array.isArray(data.items)) state.items = data.items;
      if (data.eenmalig) state.eenmalig = data.eenmalig;
    } catch (e) { /* stuk of verouderd: negeren */ }
  }

  /* ================================================== vakverdeling bijwerken */

  /** Verdeelt de kozijnbreedte gelijk over de vakken. */
  function verdeelGelijk(item) {
    var n = item.vakken.length;
    var basis = Math.floor(item.width / n);
    item.vakken.forEach(function (vak, i) {
      vak.breedte = (i === n - 1) ? item.width - basis * (n - 1) : basis;
    });
  }

  /** Past één vakbreedte aan en verdeelt de rest over de overige vakken. */
  function pasVakBreedteAan(item, index, nieuweBreedte) {
    var minB = CAT.settings.vak.minBreedte;
    var n = item.vakken.length;
    if (n === 1) { item.vakken[0].breedte = item.width; return; }

    var maxB = item.width - minB * (n - 1);
    nieuweBreedte = klem(nieuweBreedte, minB, maxB);
    item.vakken[index].breedte = nieuweBreedte;

    var rest = item.width - nieuweBreedte;
    var anderen = item.vakken.filter(function (_, i) { return i !== index; });
    var somAnderen = anderen.reduce(function (s, v) { return s + v.breedte; }, 0) || 1;

    var toegekend = 0;
    anderen.forEach(function (vak, i) {
      var b;
      if (i === anderen.length - 1) {
        b = rest - toegekend;
      } else {
        b = Math.max(minB, Math.round((vak.breedte / somAnderen) * rest));
        toegekend += b;
      }
      vak.breedte = Math.max(minB, b);
    });
  }

  function zetAantalVakken(item, aantal) {
    aantal = klem(aantal, 1, CAT.settings.vak.maxAantal);
    while (item.vakken.length < aantal) {
      item.vakken.push({ breedte: 0, invulling: 'vast' });
    }
    while (item.vakken.length > aantal) item.vakken.pop();
    verdeelGelijk(item);
  }

  /* ================================================== bouwstenen interface */

  function keuzeKaart(opties) {
    var input = h('input', {
      type: opties.type || 'radio',
      name: opties.naam,
      value: opties.waarde,
      checked: opties.gekozen,
      onchange: opties.onchange
    });
    return h('label', { class: 'fk-card' }, [
      input,
      h('span', { class: 'fk-card-body' }, [
        opties.tekening || null,
        h('span', { class: 'fk-card-title' }, [
          opties.swatch ? h('span', { class: 'fk-swatch', style: 'background:' + opties.swatch }) : null,
          h('span', { text: opties.titel })
        ]),
        opties.omschrijving ? h('span', { class: 'fk-card-desc', text: opties.omschrijving }) : null,
        opties.prijs ? h('span', { class: 'fk-card-price', text: opties.prijs }) : null
      ])
    ]);
  }

  function sectie(nr, id, titel, hint, inhoud) {
    // fk-stap-panel: alleen op het scherm, niet op de afdruk van de offerte
    return h('section', { class: 'fk-panel fk-stap-panel', id: id }, [
      h('h2', { text: nr + '. ' + titel }),
      hint ? h('p', { class: 'fk-hint', text: hint }) : null
    ].concat(inhoud));
  }

  function meldingBlok(soort, tekst) {
    return h('div', { class: 'fk-melding fk-melding--' + soort, text: tekst });
  }

  /* ====================================================== stap 1: materiaal */

  function stapMateriaal() {
    var kaarten = actieveMaterialen().map(function (mat) {
      return keuzeKaart({
        naam: 'fk-materiaal',
        waarde: mat.id,
        gekozen: state.huidig.material === mat.id,
        titel: mat.label,
        omschrijving: mat.omschrijving,
        prijs: 'vanaf ' + euro(mat.basisPrijsM2) + ' per m² · levertijd ' + mat.levertijdWeken + ' weken',
        onchange: function () {
          var item = state.huidig;
          item.material = mat.id;
          // Profiel hoort bij het materiaal: terug naar het eerste profiel.
          item.profile = mat.profielen[0].id;
          teken();
        }
      });
    });
    return sectie(1, 'fk-stap-materiaal', 'Materiaal',
      'Waarvan moet het kozijn gemaakt worden?',
      [h('div', { class: 'fk-grid is-wide' }, kaarten)]);
  }

  /* ==================================================== stap 2: kozijnmaat */

  /*
   *  Tijdens het typen wordt de waarde NIET geklemd: anders springt '1' direct
   *  naar de minimumwaarde en kan er geen '1800' meer getypt worden. Pas als
   *  het veld verlaten wordt (change) leggen we de grenzen op.
   */
  function maatVeld(id, label, waarde, min, max, zetWaarde) {
    return h('div', { class: 'fk-veld' }, [
      h('label', { for: id, text: label }),
      h('div', { class: 'fk-maat-wrap' }, [
        h('input', {
          class: 'fk-input', type: 'text', id: id, value: waarde,
          inputmode: 'numeric', pattern: '[0-9]*',
          'aria-describedby': id + '-uitleg',
          // Een leeg veld laten we leeg: anders staat de oude waarde er meteen
          // weer in en typt de bezoeker zijn nieuwe maat erachteraan.
          oninput: function (e) {
            if (alleenCijfers(e) === '') return;
            zetWaarde(getal(e.target.value, waarde), false);
          },
          // Let op: een veld dat door een nieuwe opbouw uit de pagina verdwijnt,
          // stuurt zelf nog een change/blur. Dat signaal mag de half getypte
          // waarde niet klemmen ('2' zou dan direct de minimummaat worden).
          onblur: function (e) {
            if (bezigMetTekenen || !e.target.isConnected) return;
            var ruw = e.target.value;
            naFocusWissel(function () {
              if (ruw === '') { teken(); return; }
              zetWaarde(getal(ruw, waarde), true);
            });
          }
        }),
        h('span', { class: 'fk-eenheid', text: 'mm' })
      ]),
      h('input', {
        class: 'fk-slider', type: 'range', min: min, max: max, step: 10, value: klem(waarde, min, max),
        'aria-label': label + ' schuifregelaar',
        oninput: function (e) { zetWaarde(getal(e.target.value, waarde), true); }
      }),
      h('div', { class: 'fk-uitleg', id: id + '-uitleg', text: 'Tussen ' + min + ' en ' + max + ' mm' })
    ]);
  }

  function stapMaat() {
    var item = state.huidig;
    var S = CAT.settings.maat;

    var inhoud = [
      h('div', { class: 'fk-rij' }, [
        maatVeld('fk-breedte', 'Breedte kozijn', item.width, S.minBreedte, S.maxBreedte,
          function (v, definitief) {
            item.width = definitief ? klem(v, S.minBreedte, S.maxBreedte) : Math.max(1, v);
            verdeelGelijk(item);
            teken();
          }),
        maatVeld('fk-hoogte', 'Hoogte kozijn', item.height, S.minHoogte, S.maxHoogte,
          function (v, definitief) {
            item.height = definitief ? klem(v, S.minHoogte, S.maxHoogte) : Math.max(1, v);
            if (item.bovenlicht && item.bovenlichtHoogte > item.height - 300) {
              item.bovenlichtHoogte = Math.max(CAT.settings.bovenlicht.minHoogte, item.height - 300);
            }
            teken();
          })
      ]),
      h('div', { class: 'fk-melding fk-melding--info' }, [
        h('strong', { text: 'Meten in het kozijn of van buiten? ' }),
        document.createTextNode('Geef de buitenwerkse dagmaat op: de breedte en hoogte van de opening in de muur. ' +
          'Bij de definitieve offerte meet onze adviseur alles exact in.')
      ]),
      h('div', { class: 'fk-veld' }, [
        h('label', { for: 'fk-naam', text: 'Omschrijving (optioneel)' }),
        h('input', {
          class: 'fk-input', type: 'text', id: 'fk-naam', value: item.naam,
          placeholder: 'Bijvoorbeeld: woonkamer voorgevel',
          oninput: function (e) { item.naam = e.target.value; bewaar(); }
        }),
        h('div', { class: 'fk-uitleg', text: 'Handig als u meerdere kozijnen in één offerte zet.' })
      ])
    ];

    return sectie(2, 'fk-stap-maat', 'Kozijnmaat',
      'Hoe groot wordt het kozijn? U kunt de maten typen of met de schuifregelaar instellen.',
      inhoud);
  }

  /* ======================================================= stap 3: profiel */

  function stapProfiel() {
    var item = state.huidig;
    var mat = P.getMateriaal(item);

    var kaarten = mat.profielen.map(function (pr) {
      var meer = pr.factor === 1
        ? 'basisprijs'
        : (pr.factor > 1 ? '+' : '') + Math.round((pr.factor - 1) * 100) + '% t.o.v. basisprofiel';
      return keuzeKaart({
        naam: 'fk-profiel',
        waarde: pr.id,
        gekozen: item.profile === pr.id,
        titel: pr.label,
        omschrijving: pr.omschrijving,
        prijs: meer + ' · max. ' + pr.maxVakBreedte + ' mm per vak' +
               (pr.tripleGeschikt ? ' · triple mogelijk' : ''),
        onchange: function () { item.profile = pr.id; teken(); }
      });
    });

    return sectie(3, 'fk-stap-profiel', 'Profiel',
      'Het profiel bepaalt de isolatiewaarde, de aanzichtbreedte en de maximale vakbreedte.',
      [h('div', { class: 'fk-grid is-wide' }, kaarten)]);
  }

  /* ================================================== stap 4: vakverdeling */

  function stapVakverdeling() {
    var item = state.huidig;
    var maxVakken = CAT.settings.vak.maxAantal;

    var knoppen = [];
    for (var n = 1; n <= maxVakken; n++) {
      (function (aantal) {
        knoppen.push(keuzeKaart({
          naam: 'fk-aantal-vakken',
          waarde: aantal,
          gekozen: item.vakken.length === aantal,
          titel: aantal + (aantal === 1 ? ' vak' : ' vakken'),
          onchange: function () { zetAantalVakken(item, aantal); teken(); }
        }));
      })(n);
    }

    var breedteVelden = item.vakken.map(function (vak, i) {
      var id = 'fk-vakbreedte-' + i;
      return h('div', { class: 'fk-veld' }, [
        h('label', { for: id, text: 'Breedte vak ' + (i + 1) }),
        h('div', { class: 'fk-maat-wrap' }, [
          h('input', {
            class: 'fk-input', type: 'text', id: id, value: Math.round(vak.breedte),
            inputmode: 'numeric', pattern: '[0-9]*',
            oninput: function (e) {
              if (alleenCijfers(e) === '') return;
              var v = getal(e.target.value, vak.breedte);
              // Alleen herverdelen zodra de getypte waarde een geldige vakbreedte is
              if (v >= CAT.settings.vak.minBreedte && v <= item.width) {
                pasVakBreedteAan(item, i, v);
              } else {
                vak.breedte = Math.max(1, v);
              }
              teken();
            },
            onblur: function (e) {
              if (bezigMetTekenen || !e.target.isConnected) return;
              var ruw = e.target.value;
              naFocusWissel(function () {
                if (ruw !== '') pasVakBreedteAan(item, i, getal(ruw, vak.breedte));
                teken();
              });
            }
          }),
          h('span', { class: 'fk-eenheid', text: 'mm' })
        ])
      ]);
    });

    var bovenlicht = [
      h('label', { class: 'fk-optie' }, [
        h('input', {
          type: 'checkbox', checked: item.bovenlicht,
          onchange: function (e) { item.bovenlicht = e.target.checked; teken(); }
        }),
        h('span', { class: 'fk-optie-tekst' }, [
          h('span', { class: 'fk-optie-naam', text: 'Bovenlicht toevoegen' }),
          h('span', { class: 'fk-optie-desc', text: 'Een extra vak over de volle breedte, boven in het kozijn.' })
        ])
      ])
    ];

    if (item.bovenlicht) {
      var B = CAT.settings.bovenlicht;
      bovenlicht.push(h('div', { class: 'fk-rij', style: 'margin-top:12px' }, [
        h('div', { class: 'fk-veld' }, [
          h('label', { for: 'fk-bl-hoogte', text: 'Hoogte bovenlicht' }),
          h('div', { class: 'fk-maat-wrap' }, [
            h('input', {
              class: 'fk-input', type: 'text', id: 'fk-bl-hoogte',
              value: item.bovenlichtHoogte, inputmode: 'numeric', pattern: '[0-9]*',
              oninput: function (e) {
                if (alleenCijfers(e) === '') return;
                item.bovenlichtHoogte = klem(getal(e.target.value, item.bovenlichtHoogte),
                  B.minHoogte, Math.min(B.maxHoogte, item.height - 300));
                teken();
              }
            }),
            h('span', { class: 'fk-eenheid', text: 'mm' })
          ])
        ]),
        h('div', { class: 'fk-veld' }, [
          h('label', { for: 'fk-bl-invulling', text: 'Invulling bovenlicht' }),
          h('select', {
            class: 'fk-select', id: 'fk-bl-invulling',
            onchange: function (e) { item.bovenlichtInvulling = e.target.value; teken(); }
          }, CAT.vakInvullingen
            .filter(function (inv) { return ['vast', 'val', 'draai-l', 'draai-r', 'paneel'].indexOf(inv.id) !== -1; })
            .map(function (inv) {
              return h('option', {
                value: inv.id, selected: item.bovenlichtInvulling === inv.id, text: inv.label
              });
            }))
        ])
      ]));
    }

    var som = item.vakken.reduce(function (s, v) { return s + v.breedte; }, 0);

    return sectie(4, 'fk-stap-vakverdeling', 'Vakverdeling',
      'In hoeveel vakken wordt het kozijn verdeeld en hoe breed is elk vak?',
      [
        h('div', { class: 'fk-grid' }, knoppen),
        item.vakken.length > 1 ? h('div', { class: 'fk-rij', style: 'margin-top:18px' }, breedteVelden) : null,
        item.vakken.length > 1 ? h('div', { style: 'display:flex;gap:10px;align-items:center;flex-wrap:wrap' }, [
          h('button', {
            type: 'button', class: 'fk-knop fk-knop--rand', text: 'Gelijk verdelen',
            onclick: function () { verdeelGelijk(item); teken(); }
          }),
          h('span', {
            class: 'fk-uitleg',
            text: 'Totaal ' + Math.round(som) + ' mm van ' + item.width + ' mm'
          })
        ]) : null,
        h('div', { style: 'margin-top:18px' }, bovenlicht)
      ]);
  }

  /* ================================================== stap 5: vakinvulling */

  function miniTekening(item, vakIndex, invullingId) {
    // Tekening van één vak, om de keuze visueel te maken.
    var kopie = JSON.parse(JSON.stringify(item));
    kopie.bovenlicht = false;
    kopie.vakken = [{ breedte: kopie.width, invulling: invullingId }];
    // Alleen het vak zelf tonen: geen aansluitprofiel, rooster of hor eromheen
    kopie.muuraansluiting = 'geen';
    kopie.rooster = 'geen';
    kopie.hor = { type: 'geen', aantal: 0 };
    // Vierkant uitsnijden zodat alle keuzes even groot in beeld komen
    kopie.width = 1000;
    kopie.height = 1000;
    var svg = svgEl({ class: 'fk-card-thumb' });
    PV.renderThumb(svg, kopie);
    return svg;
  }

  function stapVakinvulling() {
    var item = state.huidig;

    var blokken = item.vakken.map(function (vak, i) {
      var kaarten = CAT.vakInvullingen.map(function (inv) {
        return keuzeKaart({
          naam: 'fk-invulling-' + i,
          waarde: inv.id,
          gekozen: vak.invulling === inv.id,
          titel: inv.label,
          omschrijving: inv.omschrijving,
          tekening: miniTekening(item, i, inv.id),
          onchange: function () {
            vak.invulling = inv.id;
            // Aantal horren nooit hoger dan het aantal te openen vakken
            var max = P.aantalTeOpenen(item);
            if (item.hor.aantal > max) item.hor.aantal = max;
            teken();
          }
        });
      });

      return h('div', { style: i > 0 ? 'margin-top:26px' : '' }, [
        h('h3', {
          style: 'font-size:15px;margin-bottom:10px',
          text: 'Vak ' + (i + 1) + ' (' + Math.round(vak.breedte) + ' mm breed)'
        }),
        h('div', { class: 'fk-grid' }, kaarten)
      ]);
    });

    return sectie(5, 'fk-stap-invulling', 'Vast glas of te openen',
      'Bepaal per vak of het vast glas wordt of een draaikiepraam, deur of schuifdeel.',
      blokken);
  }

  /* =============================================== stap 6: muuraansluiting */

  function stapMuuraansluiting() {
    var item = state.huidig;
    var m1 = P.aansluitingM1(item);

    var kaarten = CAT.muuraansluitingen.map(function (aan) {
      return keuzeKaart({
        naam: 'fk-aansluiting',
        waarde: aan.id,
        gekozen: item.muuraansluiting === aan.id,
        titel: aan.label,
        omschrijving: aan.omschrijving,
        prijs: aan.prijsM1 === 0
          ? 'geen meerprijs'
          : euro(aan.prijsM1) + ' per m1 · ' + euro(aan.prijsM1 * m1) + ' voor dit kozijn',
        onchange: function () { item.muuraansluiting = aan.id; teken(); }
      });
    });

    var muursoort = h('div', { class: 'fk-veld', style: 'margin-top:20px' }, [
      h('label', { for: 'fk-muursoort', text: 'Waar sluit het kozijn op aan?' }),
      h('select', {
        class: 'fk-select', id: 'fk-muursoort',
        onchange: function (e) { item.muursoort = e.target.value; teken(); }
      }, CAT.muursoorten.map(function (ms) {
        return h('option', { value: ms.id, selected: item.muursoort === ms.id, text: ms.label });
      })),
      h('div', { class: 'fk-uitleg', text: 'Dit bepaalt hoeveel stel- en hakwerk de montage vraagt.' })
    ]);

    return sectie(6, 'fk-stap-aansluiting', 'Muuraansluiting',
      'Hoe wordt de aansluiting op de muur afgewerkt? Gerekend over 2 x hoogte + 1 x breedte (' +
      m1.toFixed(2) + ' m1).',
      [h('div', { class: 'fk-grid is-wide' }, kaarten), muursoort]);
  }

  /* ======================================== stap 7: kleuren en muur-RAL */

  function kleurGrid(naam, gekozenId, onkies, extraOpties) {
    var opties = (extraOpties || []).concat(CAT.colors.map(function (c) {
      return {
        id: c.id, label: c.label, hex: c.hex,
        prijs: c.toeslag === 0 ? 'geen toeslag' : '+' + Math.round(c.toeslag * 100) + '%'
      };
    }));
    return h('div', { class: 'fk-grid' }, opties.map(function (o) {
      return keuzeKaart({
        naam: naam,
        waarde: o.id,
        gekozen: gekozenId === o.id,
        titel: o.label,
        swatch: o.hex,
        prijs: o.prijs,
        onchange: function () { onkies(o.id); }
      });
    }));
  }

  function stapKleur() {
    var item = state.huidig;
    var tweekleurig = item.colorIn !== item.colorOut;

    var muurOpties = [{
      id: 'gelijk',
      label: 'Gelijk aan het kozijn',
      hex: (P.byId(CAT.colors, item.colorOut) || CAT.colors[0]).hex,
      prijs: 'geen toeslag'
    }];

    var inhoud = [
      h('h3', { style: 'font-size:15px;margin-bottom:10px', text: 'Kleur buitenzijde kozijn' }),
      kleurGrid('fk-kleur-buiten', item.colorOut, function (id) { item.colorOut = id; teken(); }),

      h('h3', { style: 'font-size:15px;margin:22px 0 10px', text: 'Kleur binnenzijde kozijn' }),
      kleurGrid('fk-kleur-binnen', item.colorIn, function (id) { item.colorIn = id; teken(); }),
      tweekleurig ? h('div', { class: 'fk-melding fk-melding--let-op', style: 'margin-top:12px',
        text: 'Tweekleurig uitgevoerd: hiervoor rekenen wij ' +
              Math.round(CAT.tweekleurigToeslag * 100) + '% extra.' }) : null,

      h('h3', { style: 'font-size:15px;margin:22px 0 10px', text: 'Muur-RAL (kleur aansluitprofielen)' }),
      item.muuraansluiting === 'geen'
        ? meldingBlok('info', 'U heeft gekozen voor een aansluiting zonder profiel. Kies in stap 6 een aansluitprofiel als u hier een kleur wilt bepalen.')
        : kleurGrid('fk-muur-ral', item.muurRal, function (id) { item.muurRal = id; teken(); }, muurOpties)
    ];

    return sectie(7, 'fk-stap-kleur', 'Kleur kozijn en muur-RAL',
      'Binnen- en buitenzijde kunnen in verschillende kleuren worden uitgevoerd.',
      inhoud);
  }

  /* ================================================== stap 8: soort beglazing */

  function stapBeglazing() {
    var item = state.huidig;
    var profiel = P.getProfiel(item);
    var oppervlak = P.alleVakken(item).reduce(function (s, vak) {
      if (vak.invulling === 'paneel') return s;
      return s + (vak.breedte / 1000) * (vak.hoogte / 1000);
    }, 0) * CAT.settings.glasAandeel;

    var kaarten = CAT.glazing.map(function (glas) {
      var kanNiet = glas.triple && !profiel.tripleGeschikt;
      return keuzeKaart({
        naam: 'fk-glas',
        waarde: glas.id,
        gekozen: item.glass === glas.id,
        titel: glas.label + (kanNiet ? ' (niet in dit profiel)' : ''),
        omschrijving: glas.omschrijving + ' U-waarde ' + glas.uWaarde + ' W/m²K.',
        prijs: euro(glas.prijsM2) + ' per m² · ' + euro(glas.prijsM2 * oppervlak) + ' voor dit kozijn',
        onchange: function () { item.glass = glas.id; teken(); }
      });
    });

    return sectie(8, 'fk-stap-glas', 'Soort beglazing',
      'Circa ' + oppervlak.toFixed(2) + ' m² glas in dit kozijn. Dichte panelen worden apart gerekend.',
      [h('div', { class: 'fk-grid is-wide' }, kaarten)]);
  }

  /* ============================================= stap 9: ventilatieroosters */

  function stapRoosters() {
    var item = state.huidig;
    var breedteM1 = item.width / 1000;

    var kaarten = CAT.roosters.map(function (r) {
      return keuzeKaart({
        naam: 'fk-rooster',
        waarde: r.id,
        gekozen: item.rooster === r.id,
        titel: r.label,
        omschrijving: r.omschrijving,
        prijs: r.prijsM1 === 0
          ? 'geen meerprijs'
          : euro(r.prijsM1) + ' per m1 · ' + euro(r.prijsM1 * breedteM1) + ' voor dit kozijn',
        onchange: function () { item.rooster = r.id; teken(); }
      });
    });

    return sectie(9, 'fk-stap-rooster', 'Ventilatieroosters',
      'Het rooster wordt over de volle breedte (' + breedteM1.toFixed(2) + ' m1) in het bovenkozijn geplaatst.',
      [h('div', { class: 'fk-grid is-wide' }, kaarten)]);
  }

  /* ================================================== stap 10: inzethorren */

  function stapHorren() {
    var item = state.huidig;
    var maxHorren = P.aantalTeOpenen(item);

    var kaarten = CAT.horren.map(function (hor) {
      return keuzeKaart({
        naam: 'fk-hor',
        waarde: hor.id,
        gekozen: item.hor.type === hor.id,
        titel: hor.label,
        omschrijving: hor.omschrijving,
        prijs: hor.prijsPerStuk === 0 ? 'geen meerprijs' : euro(hor.prijsPerStuk) + ' per stuk',
        onchange: function () {
          item.hor.type = hor.id;
          item.hor.aantal = (hor.id === 'geen') ? 0 : Math.max(1, Math.min(item.hor.aantal || 1, maxHorren));
          teken();
        }
      });
    });

    var aantalKeuze = null;
    if (item.hor.type !== 'geen' && maxHorren > 0) {
      aantalKeuze = h('div', { class: 'fk-veld', style: 'margin-top:18px' }, [
        h('span', { class: 'fk-label', text: 'Aantal horren (maximaal ' + maxHorren + ')' }),
        h('div', { class: 'fk-stepper' }, [
          h('button', {
            type: 'button', text: '−', 'aria-label': 'Minder horren',
            onclick: function () { item.hor.aantal = Math.max(0, item.hor.aantal - 1); teken(); }
          }),
          h('input', {
            type: 'text', id: 'fk-hor-aantal', value: item.hor.aantal,
            inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': 'Aantal horren',
            oninput: function (e) {
              if (alleenCijfers(e) === '') return;
              item.hor.aantal = klem(getal(e.target.value, 0), 0, maxHorren);
              teken();
            }
          }),
          h('button', {
            type: 'button', text: '+', 'aria-label': 'Meer horren',
            onclick: function () { item.hor.aantal = Math.min(maxHorren, item.hor.aantal + 1); teken(); }
          })
        ])
      ]);
    }

    var melding = maxHorren === 0
      ? meldingBlok('info', 'Dit kozijn heeft geen te openen delen, dus horren zijn niet van toepassing. ' +
          'Pas de vakinvulling aan in stap 5 als u toch een te openen raam wilt.')
      : null;

    return sectie(10, 'fk-stap-hor', 'Inzethorren',
      'Horren kunnen alleen in de te openen delen; dit kozijn heeft er ' + maxHorren + '.',
      [melding, h('div', { class: 'fk-grid is-wide' }, kaarten), aantalKeuze]);
  }

  /* ========================================= stap 11: montage en toebehoren */

  function stapMontage() {
    var item = state.huidig;

    function dienstVink(aan, label, omschrijving, onchange) {
      return h('label', { class: 'fk-optie' }, [
        h('input', { type: 'checkbox', checked: aan, onchange: onchange }),
        h('span', { class: 'fk-optie-tekst' }, [
          h('span', { class: 'fk-optie-naam', text: label }),
          h('span', { class: 'fk-optie-desc', text: omschrijving })
        ])
      ]);
    }

    var toebehoren = P.beschikbareOpties(item).map(function (optie) {
      var bedrag = P.optiePrijs(optie, item);
      return h('label', { class: 'fk-optie' }, [
        h('input', {
          type: 'checkbox', checked: !!item.options[optie.id],
          onchange: function (e) {
            if (e.target.checked) item.options[optie.id] = true;
            else delete item.options[optie.id];
            teken();
          }
        }),
        h('span', { class: 'fk-optie-tekst' }, [
          h('span', { class: 'fk-optie-naam', text: optie.label }),
          h('span', { class: 'fk-optie-desc', text: optie.omschrijving })
        ]),
        h('span', { class: 'fk-optie-prijs', text: euro(bedrag) })
      ]);
    });

    return sectie(11, 'fk-stap-montage', 'Montage en toebehoren',
      'Wilt u het kozijn laten plaatsen door Fortis Kozijnen?',
      [
        h('div', { class: 'fk-optielijst' }, [
          dienstVink(item.montage, CAT.services.montage.label, CAT.services.montage.omschrijving,
            function (e) { item.montage = e.target.checked; teken(); }),
          dienstVink(item.demontage, CAT.services.demontage.label, CAT.services.demontage.omschrijving,
            function (e) { item.demontage = e.target.checked; teken(); })
        ]),
        h('h3', { style: 'font-size:15px;margin:22px 0 10px', text: 'Extra toebehoren' }),
        h('div', { class: 'fk-optielijst' }, toebehoren)
      ]);
  }

  /* ====================================================== zijbalk (preview) */

  function zijbalk() {
    var item = state.huidig;
    var prijs = P.berekenElement(item);

    var svg = svgEl({});
    PV.render(svg, item);

    var specs = [
      ['Materiaal en profiel', P.getMateriaal(item).label + ' · ' + P.getProfiel(item).label],
      ['Kozijnmaat', item.width + ' x ' + item.height + ' mm (' + P.elementM2(item).toFixed(2) + ' m²)'],
      ['Vakverdeling', item.vakken.length + (item.vakken.length === 1 ? ' vak' : ' vakken') +
        (item.bovenlicht ? ' + bovenlicht' : '')],
      ['Beglazing', (P.byId(CAT.glazing, item.glass) || {}).label],
      ['Kleur buiten', (P.byId(CAT.colors, item.colorOut) || {}).label],
      ['Muuraansluiting', (P.byId(CAT.muuraansluitingen, item.muuraansluiting) || {}).label],
      ['Ventilatierooster', (P.byId(CAT.roosters, item.rooster) || {}).label],
      ['Horren', item.hor.type === 'geen' ? 'Geen' :
        item.hor.aantal + ' x ' + (P.byId(CAT.horren, item.hor.type) || {}).label],
      ['Montage', item.montage ? 'Inclusief montage' : 'Alleen levering'],
      ['Levertijd', prijs.levertijd + ' weken']
    ];

    var uitsplitsing = h('details', { class: 'fk-uitsplitsing' }, [
      h('summary', { style: 'cursor:pointer;font-size:13.5px;margin-top:12px', text: 'Prijsopbouw bekijken' }),
      h('ul', { class: 'fk-specs', style: 'margin-top:10px' }, prijs.regels.map(function (r) {
        return h('li', {}, [
          h('span', { class: 'fk-spec-naam' }, [
            h('span', { text: r.label }),
            r.detail ? h('small', { style: 'display:block;opacity:.8', text: r.detail }) : null
          ]),
          h('span', { class: 'fk-spec-waarde', text: euro(r.bedrag) })
        ]);
      }))
    ]);

    var waarschuwingen = prijs.waarschuwingen.map(function (w) {
      return meldingBlok('let-op', w);
    });

    return [
      h('div', { class: 'fk-panel' }, [
        h('div', { class: 'fk-preview' }, [
          svg,
          h('div', { class: 'fk-preview-bijschrift', text: 'Aanzicht vanaf de buitenzijde · niet op schaal van de gevel' })
        ]),
        h('div', { class: 'fk-prijskaart' }, [
          h('div', { class: 'fk-prijs-label', text: 'Richtprijs per stuk, excl. btw' }),
          h('div', { class: 'fk-prijs-groot', text: euro(prijs.perStuk) }),
          h('div', { class: 'fk-prijs-label', text: euro(prijs.perStuk * (1 + CAT.settings.btwTarief)) + ' incl. btw' })
        ]),
        h('div', { style: 'margin-top:16px' }, [
          h('span', { class: 'fk-label', text: 'Aantal van dit kozijn' }),
          h('div', { class: 'fk-stepper' }, [
            h('button', {
              type: 'button', text: '−', 'aria-label': 'Minder',
              onclick: function () { item.qty = Math.max(1, item.qty - 1); teken(); }
            }),
            h('input', {
              type: 'text', id: 'fk-aantal', value: item.qty,
              inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': 'Aantal kozijnen',
              oninput: function (e) {
                if (alleenCijfers(e) === '') return;
                item.qty = klem(getal(e.target.value, 1), 1, 99);
                teken();
              }
            }),
            h('button', {
              type: 'button', text: '+', 'aria-label': 'Meer',
              onclick: function () { item.qty = Math.min(99, item.qty + 1); teken(); }
            })
          ])
        ]),
        h('button', {
          type: 'button', class: 'fk-knop fk-knop--accent fk-knop--blok', style: 'margin-top:16px',
          text: state.bewerktId ? 'Wijziging opslaan' : 'Voeg toe aan offerte',
          onclick: voegToe
        }),
        state.bewerktId ? h('button', {
          type: 'button', class: 'fk-knop fk-knop--stil fk-knop--blok', style: 'margin-top:6px',
          text: 'Wijziging annuleren',
          onclick: function () { state.bewerktId = null; state.huidig = nieuwItem(); teken(); }
        }) : null,
        h('ul', { class: 'fk-specs' }, specs.map(function (rij) {
          return h('li', {}, [
            h('span', { class: 'fk-spec-naam', text: rij[0] }),
            h('span', { class: 'fk-spec-waarde', text: rij[1] || '-' })
          ]);
        })),
        uitsplitsing
      ])
    ].concat(waarschuwingen.length ? [h('div', { class: 'fk-panel' }, waarschuwingen)] : []);
  }

  /* ------------------------------------------ vaste prijsbalk op de telefoon */

  function mobieleBalk() {
    var prijs = P.berekenElement(state.huidig);
    return h('div', { class: 'fk-mobielbalk fk-niet-printen' }, [
      h('div', { class: 'fk-mb-prijs' }, [
        h('strong', { text: euro(prijs.perStuk) }),
        h('span', { text: 'per stuk excl. btw · ' +
          euro(prijs.perStuk * (1 + CAT.settings.btwTarief)) + ' incl. btw' })
      ]),
      h('button', {
        type: 'button', class: 'fk-knop fk-knop--rand', text: 'Tekening',
        onclick: function () {
          var doel = document.getElementById('fk-zijbalk');
          if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }),
      h('button', {
        type: 'button', class: 'fk-knop fk-knop--accent',
        text: state.bewerktId ? 'Opslaan' : 'Toevoegen',
        onclick: voegToe
      })
    ]);
  }

  /* ================================================= offerte: regels beheren */

  /** Zet een half ingevulde configuratie om naar geldige maten. */
  function normaliseer(item) {
    var S = CAT.settings.maat;
    item.width  = klem(getal(item.width, 1800), S.minBreedte, S.maxBreedte);
    item.height = klem(getal(item.height, 1500), S.minHoogte, S.maxHoogte);

    if (item.bovenlicht) {
      var B = CAT.settings.bovenlicht;
      item.bovenlichtHoogte = klem(getal(item.bovenlichtHoogte, B.standaard),
        B.minHoogte, Math.min(B.maxHoogte, item.height - 300));
    }

    var som = item.vakken.reduce(function (s, v) { return s + v.breedte; }, 0);
    var minB = CAT.settings.vak.minBreedte;
    var teSmal = item.vakken.some(function (v) { return v.breedte < minB; });
    if (Math.abs(som - item.width) > 2 || teSmal) verdeelGelijk(item);

    item.qty = klem(getal(item.qty, 1), 1, 99);
    item.hor.aantal = klem(getal(item.hor.aantal, 0), 0, P.aantalTeOpenen(item));
    return item;
  }

  function voegToe() {
    // Na een wijziging in de offerte mag opnieuw aangevraagd worden
    state.verzonden = null;
    normaliseer(state.huidig);
    var kopie = JSON.parse(JSON.stringify(state.huidig));
    if (state.bewerktId) {
      var index = state.items.findIndex(function (i) { return i.id === state.bewerktId; });
      if (index !== -1) state.items[index] = kopie;
      state.bewerktId = null;
    } else {
      state.items.push(kopie);
    }
    state.huidig = nieuwItem();
    teken();
    var doel = document.getElementById('fk-offerte');
    if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bewerk(id) {
    var item = state.items.find(function (i) { return i.id === id; });
    if (!item) return;
    state.huidig = JSON.parse(JSON.stringify(item));
    state.bewerktId = id;
    teken();
    var doel = document.getElementById('fk-stap-materiaal');
    if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function dupliceer(id) {
    var item = state.items.find(function (i) { return i.id === id; });
    if (!item) return;
    state.verzonden = null;
    var kopie = JSON.parse(JSON.stringify(item));
    kopie.id = 'el-' + Date.now() + '-' + Math.round(Math.random() * 1e4);
    state.items.push(kopie);
    teken();
  }

  function verwijder(id) {
    state.verzonden = null;
    state.items = state.items.filter(function (i) { return i.id !== id; });
    if (state.bewerktId === id) { state.bewerktId = null; state.huidig = nieuwItem(); }
    teken();
  }

  /* ============================================== stap 12: offerteoverzicht */

  function offerteRegel(regel, nummer) {
    var item = regel.item;
    var prijs = regel.prijs;

    var svg = svgEl({});
    PV.renderThumb(svg, item);

    var opties = [];
    if (item.rooster !== 'geen') opties.push((P.byId(CAT.roosters, item.rooster) || {}).label);
    if (item.hor.type !== 'geen' && item.hor.aantal > 0) {
      opties.push(item.hor.aantal + ' x ' + (P.byId(CAT.horren, item.hor.type) || {}).label);
    }
    if (item.muuraansluiting !== 'geen') opties.push((P.byId(CAT.muuraansluitingen, item.muuraansluiting) || {}).label);
    Object.keys(item.options).forEach(function (id) {
      var o = P.byId(CAT.options, id);
      if (o) opties.push(o.label);
    });
    if (item.montage) opties.push('inclusief montage');
    if (item.demontage) opties.push('inclusief demontage oude kozijn');

    return h('div', { class: 'fk-regel' }, [
      h('div', { class: 'fk-regel-thumb' }, [svg]),
      h('div', {}, [
        h('div', { class: 'fk-regel-titel', text: (item.naam || 'Kozijn ' + nummer) }),
        h('div', { class: 'fk-regel-spec', text: prijs.omschrijving }),
        opties.length ? h('div', { class: 'fk-regel-opties', text: opties.join(' · ') }) : null,
        prijs.waarschuwingen.length
          ? h('div', { class: 'fk-regel-opties', style: 'color:#8a4b04', text: '⚠ ' + prijs.waarschuwingen.join(' ') })
          : null
      ]),
      h('div', { class: 'fk-regel-prijs' }, [
        h('span', { text: euro(prijs.totaal) }),
        h('small', { text: prijs.aantal + ' x ' + euro(prijs.perStuk) })
      ]),
      h('div', { class: 'fk-regel-knoppen fk-niet-printen' }, [
        h('button', { type: 'button', class: 'fk-knop fk-knop--rand', style: 'padding:6px 12px;font-size:13px',
          text: 'Aanpassen', onclick: function () { bewerk(item.id); } }),
        h('button', { type: 'button', class: 'fk-knop fk-knop--rand', style: 'padding:6px 12px;font-size:13px',
          text: 'Dupliceren', onclick: function () { dupliceer(item.id); } }),
        h('button', { type: 'button', class: 'fk-knop fk-knop--stil',
          text: 'Verwijderen', onclick: function () { verwijder(item.id); } })
      ])
    ]);
  }

  function offerteOverzicht() {
    var offerte = P.berekenOfferte(state);

    if (!state.items.length) {
      return h('section', { class: 'fk-panel', id: 'fk-offerte' }, [
        h('h2', {}, [h('span', { class: 'fk-stapnr', text: '12. ' }), document.createTextNode('Uw offerte')]),
        h('div', { class: 'fk-leeg', text: 'Nog geen kozijnen toegevoegd. Stel hierboven een kozijn samen en klik op "Voeg toe aan offerte".' })
      ]);
    }

    var eenmaligeDiensten = h('div', { class: 'fk-optielijst', style: 'margin-top:20px' },
      CAT.services.eenmalig.map(function (dienst) {
        return h('label', { class: 'fk-optie' }, [
          h('input', {
            type: 'checkbox', checked: !!state.eenmalig[dienst.id],
            onchange: function (e) {
              if (e.target.checked) state.eenmalig[dienst.id] = true;
              else delete state.eenmalig[dienst.id];
              teken();
            }
          }),
          h('span', { class: 'fk-optie-tekst' }, [
            h('span', { class: 'fk-optie-naam', text: dienst.label }),
            h('span', { class: 'fk-optie-desc', text: dienst.omschrijving })
          ]),
          h('span', { class: 'fk-optie-prijs', text: euro(dienst.prijs) })
        ]);
      }));

    var totalen = [
      h('li', {}, [h('span', { text: 'Subtotaal kozijnen (' + offerte.aantalElementen + ' stuks)' }),
                   h('span', { text: euro(offerte.subtotaal) })])
    ];
    if (offerte.korting > 0) {
      totalen.push(h('li', { class: 'fk-korting' }, [
        h('span', { text: 'Staffelkorting ' + Math.round(offerte.kortingPct * 100) + '%' }),
        h('span', { text: '- ' + euro(offerte.korting) })
      ]));
    }
    offerte.eenmalig.forEach(function (d) {
      totalen.push(h('li', {}, [h('span', { text: d.label }), h('span', { text: euro(d.bedrag) })]));
    });
    totalen.push(h('li', {}, [h('span', { text: 'Totaal exclusief btw' }), h('span', { text: euro(offerte.exclBtw) })]));
    totalen.push(h('li', {}, [
      h('span', { text: 'Btw ' + Math.round(offerte.btwTarief * 100) + '%' }),
      h('span', { text: euro(offerte.btw) })
    ]));
    totalen.push(h('li', { class: 'fk-eindtotaal' }, [
      h('span', { text: 'Totaal inclusief btw' }), h('span', { text: euro(offerte.inclBtw) })
    ]));

    return h('section', { class: 'fk-panel', id: 'fk-offerte' }, [
      h('div', { class: 'fk-print-kop' }, [
        h('h2', { text: CAT.company.name + ' - prijsindicatie' }),
        h('p', { text: 'Opgesteld op ' + new Date().toLocaleDateString('nl-NL', {
          day: 'numeric', month: 'long', year: 'numeric'
        }) })
      ]),
      h('h2', {}, [h('span', { class: 'fk-stapnr', text: '12. ' }), document.createTextNode('Uw offerte')]),
      h('p', { class: 'fk-hint fk-niet-printen', text: 'Controleer de samenstelling en vraag daarna vrijblijvend de definitieve offerte aan.' }),
      h('div', { class: 'fk-regels' }, offerte.items.map(function (regel, i) {
        return offerteRegel(regel, i + 1);
      })),
      h('h3', { style: 'font-size:15px;margin:24px 0 0', text: 'Aanvullende diensten' }),
      eenmaligeDiensten,
      h('ul', { class: 'fk-totalen' }, totalen),
      h('div', { class: 'fk-acties fk-niet-printen' }, [
        h('button', {
          type: 'button', class: 'fk-knop fk-knop--rand', text: 'Offerte afdrukken of opslaan als pdf',
          onclick: function () { window.print(); }
        }),
        h('button', {
          type: 'button', class: 'fk-knop fk-knop--stil', text: 'Offerte leegmaken',
          onclick: function () {
            if (window.confirm('Weet u zeker dat u alle kozijnen uit deze offerte wilt verwijderen?')) {
              state.items = []; state.bewerktId = null; state.verzonden = null; teken();
            }
          }
        })
      ]),
      h('ul', { class: 'fk-voorwaarden' }, CAT.voorwaarden.map(function (v) {
        return h('li', { text: v });
      }))
    ]);
  }

  /* ================================================== aanvraagformulier */

  function veld(id, label, type, waarde, verplicht, extra) {
    extra = extra || {};
    return h('div', { class: 'fk-veld' }, [
      h('label', { for: id, text: label + (verplicht ? ' *' : '') }),
      h(type === 'textarea' ? 'textarea' : 'input', Object.assign({
        class: type === 'textarea' ? 'fk-textarea' : 'fk-input',
        id: id,
        // <textarea> kent geen value-attribuut: de tekst is de inhoud
        value: type === 'textarea' ? null : waarde,
        text: type === 'textarea' ? waarde : null,
        type: type === 'textarea' ? null : type,
        required: verplicht || null,
        oninput: function (e) { state.klant[extra.sleutel] = e.target.value; }
      }, extra.attrs || {})),
      h('div', { class: 'fk-fout', id: id + '-fout' })
    ]);
  }

  function aanvraagFormulier() {
    if (!state.items.length) return null;

    if (state.verzonden) {
      return h('section', { class: 'fk-panel', id: 'fk-aanvraag' }, [
        h('div', { class: 'fk-bedankt' }, [
          h('div', { class: 'fk-vink', text: '✓' }),
          h('h2', { text: 'Bedankt voor uw aanvraag' }),
          h('p', { text: 'Wij nemen binnen één werkdag contact met u op om de configuratie door te nemen ' +
                         'en een definitieve offerte op te stellen.' }),
          h('div', { class: 'fk-referentie', text: 'Referentie: ' + state.verzonden.referentie }),
          h('div', { class: 'fk-acties', style: 'justify-content:center;border:0' }, [
            h('button', {
              type: 'button', class: 'fk-knop fk-knop--rand', text: 'Offerte afdrukken of opslaan als pdf',
              onclick: function () { window.print(); }
            })
          ])
        ])
      ]);
    }

    var K = state.klant;

    return h('section', { class: 'fk-panel fk-niet-printen', id: 'fk-aanvraag' }, [
      h('h2', { text: 'Offerte aanvragen' }),
      h('p', { class: 'fk-hint', text: 'Vul uw gegevens in. Wij sturen de volledige configuratie mee met uw aanvraag.' }),
      h('div', { id: 'fk-formulier-melding' }),
      h('form', {
        id: 'fk-form', novalidate: true,
        onsubmit: function (e) { e.preventDefault(); verstuur(); }
      }, [
        h('div', { class: 'fk-rij' }, [
          veld('fk-k-naam', 'Naam', 'text', K.naam, true, { sleutel: 'naam', attrs: { autocomplete: 'name' } }),
          veld('fk-k-email', 'E-mailadres', 'email', K.email, true, { sleutel: 'email', attrs: { autocomplete: 'email' } })
        ]),
        h('div', { class: 'fk-rij' }, [
          veld('fk-k-telefoon', 'Telefoonnummer', 'tel', K.telefoon, true, { sleutel: 'telefoon', attrs: { autocomplete: 'tel' } }),
          veld('fk-k-postcode', 'Postcode', 'text', K.postcode, true, { sleutel: 'postcode', attrs: { autocomplete: 'postal-code', placeholder: '1234 AB' } })
        ]),
        h('div', { class: 'fk-rij' }, [
          veld('fk-k-adres', 'Adres', 'text', K.adres, false, { sleutel: 'adres', attrs: { autocomplete: 'street-address' } }),
          veld('fk-k-plaats', 'Plaats', 'text', K.plaats, false, { sleutel: 'plaats', attrs: { autocomplete: 'address-level2' } })
        ]),
        h('div', { class: 'fk-rij' }, [
          h('div', { class: 'fk-veld' }, [
            h('label', { for: 'fk-k-woning', text: 'Soort woning' }),
            h('select', {
              class: 'fk-select', id: 'fk-k-woning',
              onchange: function (e) { state.klant.soortWoning = e.target.value; }
            }, ['', 'Tussenwoning', 'Hoekwoning', 'Twee-onder-een-kap', 'Vrijstaand', 'Appartement', 'Bedrijfspand']
              .map(function (w) {
                return h('option', { value: w, selected: K.soortWoning === w, text: w || 'Maak een keuze' });
              }))
          ]),
          h('div', { class: 'fk-veld' }, [
            h('label', { for: 'fk-k-periode', text: 'Gewenste periode van plaatsing' }),
            h('select', {
              class: 'fk-select', id: 'fk-k-periode',
              onchange: function (e) { state.klant.periode = e.target.value; }
            }, ['', 'Zo snel mogelijk', 'Binnen 3 maanden', 'Binnen 6 maanden', 'Later dan 6 maanden', 'Nog onbekend']
              .map(function (w) {
                return h('option', { value: w, selected: K.periode === w, text: w || 'Maak een keuze' });
              }))
          ])
        ]),
        veld('fk-k-opmerking', 'Opmerking of vraag', 'textarea', K.opmerking, false, { sleutel: 'opmerking' }),
        h('label', { class: 'fk-optie' }, [
          h('input', {
            type: 'checkbox', checked: K.akkoord,
            onchange: function (e) { state.klant.akkoord = e.target.checked; }
          }),
          h('span', { class: 'fk-optie-tekst' }, [
            h('span', { class: 'fk-optie-naam', text: 'Ik ga akkoord met het opslaan en gebruiken van mijn gegevens *' }),
            h('span', { class: 'fk-optie-desc', text: 'Wij gebruiken uw gegevens uitsluitend om deze offerteaanvraag te behandelen.' })
          ])
        ]),
        h('div', { class: 'fk-fout', id: 'fk-akkoord-fout' }),
        h('div', { class: 'fk-acties' }, [
          h('button', { type: 'submit', class: 'fk-knop fk-knop--primair', id: 'fk-verstuur',
            text: 'Vrijblijvend offerte aanvragen' }),
          h('span', { class: 'fk-spacer' }),
          h('button', {
            type: 'button', class: 'fk-knop fk-knop--rand', text: 'Configuratie mailen naar mijzelf',
            onclick: function () { window.location.href = mailtoLink(); }
          })
        ])
      ])
    ]);
  }

  /* ------------------------------------------------------------- versturen */

  function toonFormulierMelding(soort, tekst) {
    var doel = document.getElementById('fk-formulier-melding');
    if (!doel) return;
    leeg(doel);
    doel.appendChild(meldingBlok(soort, tekst));
  }

  function zetVeldFout(id, tekst) {
    var node = document.getElementById(id + '-fout');
    var invoer = document.getElementById(id);
    if (node) {
      node.textContent = tekst || '';
      node.classList.toggle('is-zichtbaar', !!tekst);
    }
    if (invoer) invoer.setAttribute('aria-invalid', tekst ? 'true' : 'false');
  }

  function controleerFormulier() {
    var K = state.klant;
    var fouten = 0;

    function eis(id, waarde, boodschap) {
      var fout = !String(waarde || '').trim() ? boodschap : '';
      zetVeldFout(id, fout);
      if (fout) fouten++;
    }

    eis('fk-k-naam', K.naam, 'Vul uw naam in.');
    eis('fk-k-telefoon', K.telefoon, 'Vul uw telefoonnummer in.');
    eis('fk-k-postcode', K.postcode, 'Vul uw postcode in.');

    if (!String(K.email || '').trim()) {
      zetVeldFout('fk-k-email', 'Vul uw e-mailadres in.'); fouten++;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(K.email.trim())) {
      zetVeldFout('fk-k-email', 'Dit e-mailadres lijkt niet te kloppen.'); fouten++;
    } else {
      zetVeldFout('fk-k-email', '');
    }

    var akkoordFout = document.getElementById('fk-akkoord-fout');
    if (!K.akkoord) {
      if (akkoordFout) { akkoordFout.textContent = 'U moet akkoord gaan om de aanvraag te versturen.'; akkoordFout.classList.add('is-zichtbaar'); }
      fouten++;
    } else if (akkoordFout) {
      akkoordFout.textContent = ''; akkoordFout.classList.remove('is-zichtbaar');
    }

    return fouten === 0;
  }

  function referentieNummer() {
    var d = new Date();
    var datum = '' + d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    return 'FK-' + datum + '-' + String(Math.floor(Math.random() * 9000) + 1000);
  }

  /** Bouwt het volledige gegevenspakket dat naar Fortis wordt gestuurd. */
  function bouwPayload(referentie) {
    var offerte = P.berekenOfferte(state);
    return {
      referentie: referentie,
      moment: new Date().toISOString(),
      herkomst: window.location.href,
      klant: state.klant,
      totalen: {
        aantalElementen: offerte.aantalElementen,
        subtotaal: offerte.subtotaal,
        kortingPercentage: offerte.kortingPct,
        korting: offerte.korting,
        eenmaligeDiensten: offerte.eenmalig,
        exclBtw: offerte.exclBtw,
        btw: offerte.btw,
        inclBtw: offerte.inclBtw
      },
      elementen: offerte.items.map(function (regel, i) {
        return {
          nummer: i + 1,
          naam: regel.item.naam || ('Kozijn ' + (i + 1)),
          omschrijving: regel.prijs.omschrijving,
          aantal: regel.prijs.aantal,
          prijsPerStuk: regel.prijs.perStuk,
          totaal: regel.prijs.totaal,
          waarschuwingen: regel.prijs.waarschuwingen,
          configuratie: regel.item,
          prijsopbouw: regel.prijs.regels
        };
      })
    };
  }

  /** Leesbare samenvatting voor de e-mail-fallback. */
  function tekstSamenvatting() {
    var offerte = P.berekenOfferte(state);
    var regels = ['Offerteaanvraag ' + CAT.company.name, ''];
    offerte.items.forEach(function (r, i) {
      regels.push((i + 1) + '. ' + (r.item.naam || 'Kozijn ' + (i + 1)));
      regels.push('   ' + r.prijs.omschrijving);
      regels.push('   Aantal: ' + r.prijs.aantal + ' x ' + euro(r.prijs.perStuk) + ' = ' + euro(r.prijs.totaal));
      regels.push('');
    });
    regels.push('Totaal excl. btw: ' + euro(offerte.exclBtw));
    regels.push('Btw: ' + euro(offerte.btw));
    regels.push('Totaal incl. btw: ' + euro(offerte.inclBtw));
    regels.push('');
    regels.push('Gegevens aanvrager:');
    regels.push(state.klant.naam + ' | ' + state.klant.email + ' | ' + state.klant.telefoon);
    regels.push(state.klant.adres + ', ' + state.klant.postcode + ' ' + state.klant.plaats);
    if (state.klant.opmerking) { regels.push(''); regels.push('Opmerking: ' + state.klant.opmerking); }
    return regels.join('\n');
  }

  function mailtoLink() {
    return 'mailto:' + encodeURIComponent(CAT.company.email) +
      '?subject=' + encodeURIComponent('Offerteaanvraag configurator ' + CAT.company.name) +
      '&body=' + encodeURIComponent(tekstSamenvatting());
  }

  function verstuur() {
    if (!controleerFormulier()) {
      toonFormulierMelding('fout', 'Niet alle verplichte velden zijn (juist) ingevuld.');
      var eersteFout = document.querySelector('[aria-invalid="true"]');
      if (eersteFout) eersteFout.focus();
      return;
    }

    var knop = document.getElementById('fk-verstuur');
    if (knop) { knop.disabled = true; knop.textContent = 'Bezig met versturen...'; }

    var referentie = referentieNummer();
    var payload = bouwPayload(referentie);
    var endpoint = CAT.settings.endpoint;

    function gelukt() {
      state.verzonden = { referentie: referentie, moment: new Date().toISOString() };
      teken();
      var doel = document.getElementById('fk-aanvraag');
      if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function mislukt() {
      if (knop) { knop.disabled = false; knop.textContent = 'Vrijblijvend offerte aanvragen'; }
      toonFormulierMelding('let-op',
        'Het versturen lukte niet. Klik op "Configuratie mailen naar mijzelf" om de aanvraag ' +
        'per e-mail te versturen, of bel ons op ' + (CAT.company.phone || 'het nummer op onze website') + '.');
    }

    if (!endpoint) { gelukt(); return; }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      return res.json().catch(function () { return {}; });
    }).then(function (data) {
      if (data && data.referentie) state.verzonden = { referentie: data.referentie };
      gelukt();
    }).catch(mislukt);
  }

  /* ================================================== stappenbalk (navigatie) */

  var STAPPEN = [
    { nr: 1,  id: 'fk-stap-materiaal',    titel: 'Materiaal',       render: stapMateriaal },
    { nr: 2,  id: 'fk-stap-maat',         titel: 'Kozijnmaat',      render: stapMaat },
    { nr: 3,  id: 'fk-stap-profiel',      titel: 'Profiel',         render: stapProfiel },
    { nr: 4,  id: 'fk-stap-vakverdeling', titel: 'Vakverdeling',    render: stapVakverdeling },
    { nr: 5,  id: 'fk-stap-invulling',    titel: 'Vast glas',       render: stapVakinvulling },
    { nr: 6,  id: 'fk-stap-aansluiting',  titel: 'Muuraansluiting', render: stapMuuraansluiting },
    { nr: 7,  id: 'fk-stap-kleur',        titel: 'Muur-RAL',        render: stapKleur },
    { nr: 8,  id: 'fk-stap-glas',         titel: 'Beglazing',       render: stapBeglazing },
    { nr: 9,  id: 'fk-stap-rooster',      titel: 'Roosters',        render: stapRoosters },
    { nr: 10, id: 'fk-stap-hor',          titel: 'Inzethorren',     render: stapHorren },
    { nr: 11, id: 'fk-stap-montage',      titel: 'Montage',         render: stapMontage },
    { nr: 12, id: 'fk-offerte',           titel: 'Offerte',         render: null }
  ];

  var actieveStap = 'fk-stap-materiaal';

  function stappenBalk() {
    return h('ul', { class: 'fk-steps fk-niet-printen' }, STAPPEN.map(function (stap) {
      return h('li', {}, [
        h('button', {
          type: 'button',
          class: 'fk-step',
          'aria-current': actieveStap === stap.id ? 'step' : null,
          onclick: function () {
            var doel = document.getElementById(stap.id);
            if (doel) doel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, [
          h('span', { class: 'fk-step-nr', text: String(stap.nr) }),
          h('span', { text: stap.titel })
        ])
      ]);
    }));
  }

  /** Markeert de stap die in beeld is. */
  function volgStappen() {
    if (!('IntersectionObserver' in window)) return;
    var waarnemer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          actieveStap = entry.target.id;
          var knoppen = document.querySelectorAll('.fk-step');
          STAPPEN.forEach(function (stap, i) {
            if (!knoppen[i]) return;
            if (stap.id === actieveStap) knoppen[i].setAttribute('aria-current', 'step');
            else knoppen[i].removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px' });

    STAPPEN.forEach(function (stap) {
      var node = document.getElementById(stap.id);
      if (node) waarnemer.observe(node);
    });
  }

  /* ============================================================== tekenen */

  var app, stappenDoel, zijbalkDoel, balkDoel, balkOnderDoel;
  var bezigMetTekenen = false;

  function teken() {
    /*
     *  Bij het opnieuw opbouwen verdwijnt het actieve invoerveld uit de DOM.
     *  De browser stuurt dan een blur/change, die opnieuw teken() zou aanroepen
     *  terwijl de vorige opbouw nog loopt. Deze vlag voorkomt dat.
     */
    if (bezigMetTekenen) return;
    bezigMetTekenen = true;
    try {
      tekenNu();
    } finally {
      bezigMetTekenen = false;
    }
  }

  function tekenNu() {
    bewaar();

    // Focus én cursorpositie vasthouden bij het opnieuw opbouwen
    var actief = document.activeElement;
    var focusId = actief && actief.id ? actief.id : null;
    var cursor = null;
    if (focusId) {
      try { cursor = { start: actief.selectionStart, eind: actief.selectionEnd }; }
      catch (e) { cursor = null; }
    }

    leeg(stappenDoel);
    STAPPEN.forEach(function (stap) {
      if (stap.render) stappenDoel.appendChild(stap.render());
    });
    stappenDoel.appendChild(offerteOverzicht());
    var formulier = aanvraagFormulier();
    if (formulier) stappenDoel.appendChild(formulier);

    leeg(zijbalkDoel);
    zijbalk().forEach(function (node) { zijbalkDoel.appendChild(node); });

    leeg(balkOnderDoel);
    balkOnderDoel.appendChild(mobieleBalk());

    if (focusId) {
      var herstelNode = document.getElementById(focusId);
      if (herstelNode && typeof herstelNode.focus === 'function') {
        herstelNode.focus({ preventScroll: true });
        if (cursor && cursor.start !== null && cursor.start !== undefined) {
          try { herstelNode.setSelectionRange(cursor.start, cursor.eind); }
          catch (e) { /* sommige veldtypen ondersteunen dit niet */ }
        }
      }
    }
  }

  /* ================================================================ start */

  function start() {
    app = document.getElementById('fortis-configurator');
    if (!app) return;

    herstel();

    app.className = 'fk';
    leeg(app);

    var wrap = h('div', { class: 'fk-wrap' }, [
      h('header', { class: 'fk-header fk-niet-printen' }, [
        h('h1', { text: 'Stel uw kozijn samen en ontvang direct een prijsindicatie' }),
        h('p', { class: 'fk-sub', text: CAT.company.name + ' · ' + CAT.company.tagline +
          ' · vrijblijvend en zonder verplichtingen' })
      ]),
      h('div', { id: 'fk-balk' }),
      h('div', { class: 'fk-layout' }, [
        h('main', { id: 'fk-stappen' }),
        h('aside', { class: 'fk-aside fk-niet-printen', id: 'fk-zijbalk' })
      ]),
      h('div', { id: 'fk-balk-onder' })
    ]);
    app.appendChild(wrap);

    balkDoel = document.getElementById('fk-balk');
    balkOnderDoel = document.getElementById('fk-balk-onder');
    stappenDoel = document.getElementById('fk-stappen');
    zijbalkDoel = document.getElementById('fk-zijbalk');

    balkDoel.appendChild(stappenBalk());
    teken();
    volgStappen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* Voor eventuele koppeling met de website (bv. analytics of een CRM) */
  window.FortisConfigurator = {
    state: state,
    teken: teken,
    payload: function () { return bouwPayload('preview'); }
  };
})();
