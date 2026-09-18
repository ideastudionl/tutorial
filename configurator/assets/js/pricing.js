/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  pricing.js  ->  Alle prijsberekeningen (geen interface-code).
 * ============================================================================
 *  De functies hieronder lezen de configuratie uit catalog.js en geven een
 *  volledig uitgesplitste prijsopbouw terug. Elke regel op de offerte is
 *  daardoor te verantwoorden richting de klant.
 *
 *  Opbouw van één element (kozijn):
 *    per vak : kozijnprijs (materiaal x profiel x invulling x m²) + glas
 *    daarna  : kleurtoeslag, muuraansluiting, rooster, horren, toebehoren
 *    tot slot: minimumprijs, montage, demontage
 * ============================================================================
 */

window.FortisPricing = (function () {
  'use strict';

  var CAT = window.FORTIS_CATALOG;

  /* -------------------------------------------------------------- helpers */

  function byId(list, id) {
    for (var i = 0; i < (list || []).length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function round(bedrag) {
    var stap = CAT.settings.afrondenOp || 1;
    return Math.round(bedrag / stap) * stap;
  }

  function euro(bedrag) {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2
    }).format(bedrag || 0);
  }

  function getMateriaal(item) { return byId(CAT.materials, item.material) || CAT.materials[0]; }

  function getProfiel(item) {
    var mat = getMateriaal(item);
    return byId(mat.profielen, item.profile) || mat.profielen[0];
  }

  /* --------------------------------------------------------------- maten */

  /** Hoogte van de onderste rij vakken (zonder bovenlicht). */
  function vakHoogte(item) {
    var h = item.height - (item.bovenlicht ? item.bovenlichtHoogte : 0);
    return Math.max(h, 100);
  }

  /** Alle vakken inclusief een eventueel bovenlicht, met hun maten in mm. */
  function alleVakken(item) {
    var rijen = [];
    if (item.bovenlicht) {
      rijen.push({
        rij: 'bovenlicht',
        breedte: item.width,
        hoogte: item.bovenlichtHoogte,
        invulling: item.bovenlichtInvulling || 'vast'
      });
    }
    var h = vakHoogte(item);
    (item.vakken || []).forEach(function (vak, i) {
      rijen.push({
        rij: 'hoofd', index: i,
        breedte: vak.breedte,
        hoogte: h,
        invulling: vak.invulling
      });
    });
    return rijen;
  }

  /** 'Bovenlicht' of 'Vak 2': overal dezelfde naam gebruiken. */
  function vakNaam(item, vak) {
    if (vak.rij === 'bovenlicht') return 'Bovenlicht';
    return 'Vak ' + ((vak.index || 0) + 1);
  }

  function m2VanVak(vak) {
    var m2 = (vak.breedte / 1000) * (vak.hoogte / 1000);
    return Math.max(m2, CAT.settings.minVakOppervlakM2);
  }

  /** Bruto oppervlak van het hele element in m² (zoals ingevoerd). */
  function elementM2(item) {
    return (item.width / 1000) * (item.height / 1000);
  }

  /** Strekkende meters muuraansluiting: 2 x hoogte + 1 x breedte. */
  function aansluitingM1(item) {
    return 2 * (item.height / 1000) + (item.width / 1000);
  }

  /** Aantal te openen vakken (bepaalt het maximum aantal horren). */
  function aantalTeOpenen(item) {
    return alleVakken(item).filter(function (vak) {
      var inv = byId(CAT.vakInvullingen, vak.invulling);
      return inv && inv.teOpenen;
    }).length;
  }

  function heeftDeurvak(item) {
    return alleVakken(item).some(function (vak) {
      return vak.invulling === 'deur-l' || vak.invulling === 'deur-r';
    });
  }

  /** Prijs van een los toebehoren voor dit element. */
  function optiePrijs(optie, item) {
    switch (optie.eenheid) {
      case 'm1-b': return optie.prijs * (item.width / 1000);
      case 'm1-o': return optie.prijs * (2 * (item.width / 1000) + 2 * (item.height / 1000));
      case 'm2':   return optie.prijs * elementM2(item);
      case 'stuk':
      default:     return optie.prijs;
    }
  }

  /** Welke toebehoren zijn zinvol bij deze configuratie? */
  function beschikbareOpties(item) {
    return CAT.options.filter(function (o) {
      if (o.id === 'elektrisch' || o.id === 'brievenbus') return heeftDeurvak(item);
      return true;
    });
  }

  /* ------------------------------------------------------ controles vooraf */

  /**
   * Technische waarschuwingen: geen blokkades, maar signalen die de klant
   * (en de calculator van Fortis) moet zien.
   */
  function controleer(item) {
    var waarschuwingen = [];
    var profiel = getProfiel(item);
    var glas = byId(CAT.glazing, item.glass);
    var S = CAT.settings;

    if (item.width < S.maat.minBreedte || item.width > S.maat.maxBreedte) {
      waarschuwingen.push('De breedte moet tussen ' + S.maat.minBreedte + ' en ' +
        S.maat.maxBreedte + ' mm liggen.');
    }
    if (item.height < S.maat.minHoogte || item.height > S.maat.maxHoogte) {
      waarschuwingen.push('De hoogte moet tussen ' + S.maat.minHoogte + ' en ' +
        S.maat.maxHoogte + ' mm liggen.');
    }
    if (glas && glas.triple && !profiel.tripleGeschikt) {
      waarschuwingen.push('Triple glas past niet in profiel "' + profiel.label +
        '". Kies een dieper profiel of HR++ glas.');
    }
    alleVakken(item).forEach(function (vak) {
      var naam = vakNaam(item, vak);
      if (vak.breedte > profiel.maxVakBreedte) {
        waarschuwingen.push(naam + ' is ' + Math.round(vak.breedte) +
          ' mm breed; dit profiel gaat tot ' + profiel.maxVakBreedte +
          ' mm per vak. Wij adviseren een extra tussenstijl.');
      }
      if (vak.breedte < CAT.settings.vak.minBreedte) {
        waarschuwingen.push(naam + ' is smaller dan ' +
          CAT.settings.vak.minBreedte + ' mm.');
      }
    });
    var somVakken = (item.vakken || []).reduce(function (s, v) { return s + v.breedte; }, 0);
    if (Math.abs(somVakken - item.width) > 2) {
      waarschuwingen.push('De vakbreedtes tellen op tot ' + somVakken +
        ' mm, terwijl het kozijn ' + item.width + ' mm breed is.');
    }
    return waarschuwingen;
  }

  /* ------------------------------------------------------- prijs per element */

  /**
   * Volledige prijsopbouw van één element (één regel in de offerte).
   */
  function berekenElement(item) {
    var S         = CAT.settings;
    var materiaal = getMateriaal(item);
    var profiel   = getProfiel(item);
    var glas      = byId(CAT.glazing, item.glass) || CAT.glazing[0];
    var kleurBi   = byId(CAT.colors, item.colorIn) || CAT.colors[0];
    var kleurBu   = byId(CAT.colors, item.colorOut) || CAT.colors[0];

    var regels = [];
    var kozijnTotaal = 0;
    var vulTotaal = 0;

    /* 1. Per vak: kozijnprijs en glas/paneel ------------------------------ */
    alleVakken(item).forEach(function (vak) {
      var inv = byId(CAT.vakInvullingen, vak.invulling) || CAT.vakInvullingen[0];
      var m2  = m2VanVak(vak);
      var prijsM2 = materiaal.basisPrijsM2 * profiel.factor * inv.factor;
      var kozijn  = prijsM2 * m2;
      kozijnTotaal += kozijn;

      var naam = vakNaam(item, vak);

      regels.push({
        groep: 'vak',
        label: naam + ': ' + inv.label,
        detail: vak.breedte + ' x ' + vak.hoogte + ' mm (' + m2.toFixed(2) + ' m²) x ' +
                euro(prijsM2) + ' per m²',
        bedrag: kozijn
      });

      var vulling;
      if (vak.invulling === 'paneel') {
        vulling = S.paneelPrijsM2 * m2 * S.glasAandeel;
        regels.push({
          groep: 'glas',
          label: naam + ': geïsoleerd paneel',
          detail: (m2 * S.glasAandeel).toFixed(2) + ' m² x ' + euro(S.paneelPrijsM2) + ' per m²',
          bedrag: vulling
        });
      } else {
        vulling = glas.prijsM2 * m2 * S.glasAandeel;
        regels.push({
          groep: 'glas',
          label: naam + ': ' + glas.label,
          detail: (m2 * S.glasAandeel).toFixed(2) + ' m² x ' + euro(glas.prijsM2) + ' per m²',
          bedrag: vulling
        });
      }
      vulTotaal += vulling;
    });

    /* 2. Kleurtoeslag over kozijn + beglazing ----------------------------- */
    var basis = kozijnTotaal + vulTotaal;
    var kleurPct = Math.max(kleurBi.toeslag, kleurBu.toeslag);
    if (item.colorIn !== item.colorOut) kleurPct += CAT.tweekleurigToeslag;

    if (kleurPct > 0) {
      regels.push({
        groep: 'kleur',
        label: (item.colorIn === item.colorOut)
          ? 'Kleur ' + kleurBu.label
          : 'Kleur buiten ' + kleurBu.label + ' / binnen ' + kleurBi.label,
        detail: 'toeslag ' + Math.round(kleurPct * 100) + '% op kozijn en beglazing',
        bedrag: basis * kleurPct
      });
    }

    /* 3. Muuraansluiting -------------------------------------------------- */
    var aansluiting = byId(CAT.muuraansluitingen, item.muuraansluiting);
    if (aansluiting && aansluiting.prijsM1 > 0) {
      var m1 = aansluitingM1(item);
      var muurKleur = (item.muurRal && item.muurRal !== 'gelijk')
        ? byId(CAT.colors, item.muurRal) : null;
      regels.push({
        groep: 'aansluiting',
        label: aansluiting.label + (muurKleur ? ' - ' + muurKleur.label : ' - gelijk aan kozijn'),
        detail: m1.toFixed(2) + ' m1 x ' + euro(aansluiting.prijsM1) + ' per m1',
        bedrag: aansluiting.prijsM1 * m1
      });
    }

    /* 4. Ventilatierooster ------------------------------------------------ */
    var rooster = byId(CAT.roosters, item.rooster);
    if (rooster && rooster.prijsM1 > 0) {
      regels.push({
        groep: 'rooster',
        label: rooster.label,
        detail: (item.width / 1000).toFixed(2) + ' m1 x ' + euro(rooster.prijsM1) + ' per m1',
        bedrag: rooster.prijsM1 * (item.width / 1000)
      });
    }

    /* 5. Inzethorren ------------------------------------------------------ */
    var horType = byId(CAT.horren, item.hor && item.hor.type);
    var horAantal = Math.min(
      Math.max(0, parseInt(item.hor && item.hor.aantal, 10) || 0),
      aantalTeOpenen(item)
    );
    if (horType && horType.prijsPerStuk > 0 && horAantal > 0) {
      regels.push({
        groep: 'hor',
        label: horType.label,
        detail: horAantal + ' x ' + euro(horType.prijsPerStuk) + ' per stuk',
        bedrag: horType.prijsPerStuk * horAantal
      });
    }

    /* 6. Overige toebehoren ----------------------------------------------- */
    var gekozen = item.options || {};
    beschikbareOpties(item).forEach(function (optie) {
      if (!gekozen[optie.id]) return;
      var detail = '';
      if (optie.eenheid === 'm1-b') detail = (item.width / 1000).toFixed(2) + ' m1 x ' + euro(optie.prijs);
      if (optie.eenheid === 'm1-o') detail = (2 * (item.width / 1000) + 2 * (item.height / 1000)).toFixed(2) + ' m1 x ' + euro(optie.prijs);
      if (optie.eenheid === 'm2')   detail = elementM2(item).toFixed(2) + ' m² x ' + euro(optie.prijs);
      regels.push({
        groep: 'optie', label: optie.label, detail: detail,
        bedrag: optiePrijs(optie, item)
      });
    });

    /* 7. Minimumprijs per element ----------------------------------------- */
    var elementPrijs = regels.reduce(function (som, r) { return som + r.bedrag; }, 0);
    if (elementPrijs < S.minPrijsPerElement) {
      regels.push({
        groep: 'minimum',
        label: 'Aanvulling tot minimumprijs per element',
        detail: 'minimaal ' + euro(S.minPrijsPerElement) + ' per element',
        bedrag: S.minPrijsPerElement - elementPrijs
      });
      elementPrijs = S.minPrijsPerElement;
    }

    /* 8. Montage en demontage --------------------------------------------- */
    var muursoort = byId(CAT.muursoorten, item.muursoort) || CAT.muursoorten[0];
    var montageBedrag = 0;
    if (item.montage) {
      var m = CAT.services.montage;
      montageBedrag = Math.max(
        elementPrijs * m.percentageVanElement * (1 + muursoort.montageToeslag),
        m.minimumPerElement
      );
      regels.push({
        groep: 'dienst',
        label: m.label,
        detail: 'plaatsen, stellen en waterdicht afwerken - ' + muursoort.label.toLowerCase(),
        bedrag: montageBedrag
      });
    }

    var demontageBedrag = 0;
    if (item.demontage) {
      var d = CAT.services.demontage;
      demontageBedrag = d.perElement + d.perM2 * elementM2(item);
      regels.push({
        groep: 'dienst',
        label: d.label,
        detail: 'inclusief gescheiden afvoer',
        bedrag: demontageBedrag
      });
    }

    var perStuk = round(elementPrijs + montageBedrag + demontageBedrag);
    var aantal = Math.max(1, parseInt(item.qty, 10) || 1);

    return {
      regels: regels,
      m2: elementM2(item),
      perStuk: perStuk,
      aantal: aantal,
      totaal: perStuk * aantal,
      levertijd: materiaal.levertijdWeken,
      waarschuwingen: controleer(item),
      omschrijving: samenvatting(item)
    };
  }

  /** Korte tekstuele samenvatting van een element, voor de offerteregel. */
  function samenvatting(item) {
    var mat     = getMateriaal(item);
    var profiel = getProfiel(item);
    var glas    = byId(CAT.glazing, item.glass) || CAT.glazing[0];
    var kleurBi = byId(CAT.colors, item.colorIn) || CAT.colors[0];
    var kleurBu = byId(CAT.colors, item.colorOut) || CAT.colors[0];

    var indeling = (item.vakken || []).map(function (v) {
      var inv = byId(CAT.vakInvullingen, v.invulling);
      return inv ? inv.label : v.invulling;
    }).join(' + ');
    if (item.bovenlicht) indeling += ' + bovenlicht';

    var kleur = (item.colorIn === item.colorOut)
      ? kleurBu.label
      : 'buiten ' + kleurBu.label + ', binnen ' + kleurBi.label;

    return [
      mat.label + ' - ' + profiel.label,
      item.width + ' x ' + item.height + ' mm',
      indeling,
      glas.label,
      kleur
    ].join(' | ');
  }

  /* -------------------------------------------------------- prijs per offerte */

  function berekenOfferte(state) {
    var items = (state.items || []).map(function (item) {
      return { item: item, prijs: berekenElement(item) };
    });

    var aantalElementen = items.reduce(function (n, r) { return n + r.prijs.aantal; }, 0);
    var subtotaal = items.reduce(function (s, r) { return s + r.prijs.totaal; }, 0);

    var kortingPct = 0;
    CAT.settings.staffelkorting.forEach(function (staffel) {
      if (aantalElementen >= staffel.vanafAantal && staffel.percentage > kortingPct) {
        kortingPct = staffel.percentage;
      }
    });
    var korting = round(subtotaal * kortingPct);

    var eenmalig = [];
    CAT.services.eenmalig.forEach(function (dienst) {
      if (state.eenmalig && state.eenmalig[dienst.id]) {
        eenmalig.push({ id: dienst.id, label: dienst.label, bedrag: dienst.prijs });
      }
    });
    var eenmaligTotaal = eenmalig.reduce(function (s, d) { return s + d.bedrag; }, 0);

    var exclBtw = subtotaal - korting + eenmaligTotaal;
    var btw = exclBtw * CAT.settings.btwTarief;

    return {
      items: items,
      aantalElementen: aantalElementen,
      subtotaal: subtotaal,
      kortingPct: kortingPct,
      korting: korting,
      eenmalig: eenmalig,
      eenmaligTotaal: eenmaligTotaal,
      exclBtw: exclBtw,
      btwTarief: CAT.settings.btwTarief,
      btw: btw,
      inclBtw: exclBtw + btw
    };
  }

  /* ------------------------------------------------------------------ export */

  return {
    byId: byId,
    euro: euro,
    round: round,
    getMateriaal: getMateriaal,
    getProfiel: getProfiel,
    vakHoogte: vakHoogte,
    alleVakken: alleVakken,
    elementM2: elementM2,
    aansluitingM1: aansluitingM1,
    aantalTeOpenen: aantalTeOpenen,
    vakNaam: vakNaam,
    heeftDeurvak: heeftDeurvak,
    beschikbareOpties: beschikbareOpties,
    optiePrijs: optiePrijs,
    controleer: controleer,
    berekenElement: berekenElement,
    berekenOfferte: berekenOfferte,
    samenvatting: samenvatting
  };
})();
