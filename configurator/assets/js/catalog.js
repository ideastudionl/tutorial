/*
 * ============================================================================
 *  FORTIS KOZIJNEN - OFFERTE CONFIGURATOR
 *  catalog.js  ->  Alle keuzes, opties en prijzen op één plek.
 * ============================================================================
 *
 *  Dit is het ENIGE bestand dat je hoeft aan te passen om prijzen, profielen,
 *  kleuren of opties te wijzigen. De rekenmodule, de tekening en de interface
 *  passen zich automatisch aan.
 *
 *  Alle bedragen zijn EXCLUSIEF btw, in euro's.
 *
 *  LET OP: onderstaande bedragen zijn realistische richtprijzen als startpunt.
 *  Vervang ze door de eigen tarieven van Fortis Kozijnen vóór livegang.
 *
 *  Volgorde van de configurator (zie ook app.js -> STAPPEN):
 *    1. Materiaal          6. Muuraansluiting
 *    2. Kozijnmaat         7. Kleur kozijn + muur-RAL
 *    3. Profiel            8. Soort beglazing
 *    4. Vakverdeling       9. Ventilatieroosters
 *    5. Vakinvulling      10. Inzethorren
 *                         11. Overzicht en offerte aanvragen
 * ============================================================================
 */

window.FORTIS_CATALOG = {

  /* ---------------------------------------------------------------- bedrijf */
  company: {
    name: 'Fortis Kozijnen',
    tagline: 'Kozijnen, deuren en schuifpuien op maat',
    phone: '',                       // bv. '085 - 000 00 00'
    email: 'info@fortiskozijnen.nl', // ontvanger van de offerteaanvragen
    website: 'https://www.fortiskozijnen.nl',
    kvk: '',
    btwNummer: ''
  },

  /* --------------------------------------------------------- algemene regels */
  settings: {
    btwTarief: 0.21,
    minVakOppervlakM2: 0.25,   // klein vak wordt gerekend als dit oppervlak
    minPrijsPerElement: 285,   // ondergrens per kozijn (excl. btw)
    glasAandeel: 0.85,         // deel van het vakoppervlak dat glas is
    paneelPrijsM2: 105,        // prijs per m² voor een dicht paneel i.p.v. glas
    offerteGeldigheidDagen: 30,
    afrondenOp: 1,

    // Grenzen voor het hele kozijn (mm)
    maat: { minBreedte: 400, maxBreedte: 6000, minHoogte: 400, maxHoogte: 3000 },
    // Grenzen per vak (mm)
    vak: { minBreedte: 250, maxAantal: 5 },
    bovenlicht: { minHoogte: 250, maxHoogte: 900, standaard: 400 },

    // Staffelkorting op het subtotaal van de elementen
    staffelkorting: [
      { vanafAantal: 3, percentage: 0.03 },
      { vanafAantal: 5, percentage: 0.05 },
      { vanafAantal: 8, percentage: 0.075 }
    ],

    // Waar de offerteaanvraag naartoe wordt gestuurd. Leeg laten = alleen
    // de e-mail-fallback (mailto) en de printbare offerte gebruiken.
    endpoint: '../server/offerte.php'
  },

  /* ---------------------------------------------- 1. MATERIAAL + 3. PROFIEL */
  /*
   *  basisPrijsM2 = kale kozijnprijs per m² (excl. glas, kleur, montage)
   *  profielen[].factor = vermenigvuldiger op die basisprijs
   */
  materials: [
    {
      id: 'kunststof',
      actief: true,
      label: 'Kunststof',
      omschrijving: 'Onderhoudsarm, uitstekende isolatie en de gunstigste prijs.',
      basisPrijsM2: 295,
      levertijdWeken: '6 - 8',
      profielen: [
        { id: 'ks-70', label: 'Standaard 70 mm - 5 kamers', factor: 1.00,
          omschrijving: 'Uf 1,3 W/m²K. De meest gekozen uitvoering voor renovatie.',
          tripleGeschikt: false, maxVakBreedte: 1400 },
        { id: 'ks-76', label: 'Comfort 76 mm - 6 kamers', factor: 1.12,
          omschrijving: 'Uf 1,1 W/m²K. Geschikt voor triple beglazing.',
          tripleGeschikt: true, maxVakBreedte: 1500 },
        { id: 'ks-82', label: 'Premium 82 mm - 7 kamers', factor: 1.26,
          omschrijving: 'Uf 0,95 W/m²K. Passiefhuiswaardig, zwaar staalverstevigd.',
          tripleGeschikt: true, maxVakBreedte: 1600 },
        { id: 'ks-renovatie', label: 'Renovatieprofiel', factor: 0.92,
          omschrijving: 'Wordt over het bestaande kozijnhout geplaatst: minder hak- en breekwerk.',
          tripleGeschikt: false, maxVakBreedte: 1300 }
      ]
    },
    {
      id: 'aluminium',
      actief: true,
      label: 'Aluminium',
      omschrijving: 'Slanke profielen, maximale glasoppervlakte, zeer lange levensduur.',
      basisPrijsM2: 465,
      levertijdWeken: '8 - 10',
      profielen: [
        { id: 'alu-65', label: 'Thermisch onderbroken 65 mm', factor: 1.00,
          omschrijving: 'Uf 1,6 W/m²K. Standaard voor ramen en deuren.',
          tripleGeschikt: true, maxVakBreedte: 1800 },
        { id: 'alu-slank', label: 'Slankline 55 mm', factor: 1.15,
          omschrijving: 'Minimale aanzichtbreedte, maximaal daglicht.',
          tripleGeschikt: false, maxVakBreedte: 1600 },
        { id: 'alu-hi', label: 'HI 85 mm passiefhuis', factor: 1.32,
          omschrijving: 'Uf 0,9 W/m²K. Voor nieuwbouw met hoge isolatie-eisen.',
          tripleGeschikt: true, maxVakBreedte: 2000 }
      ]
    },
    {
      /* Wil Fortis ook hout aanbieden? Zet actief op true. */
      id: 'hout',
      actief: false,
      label: 'Hout (Meranti)',
      omschrijving: 'Authentieke uitstraling, gegrond of in kleur afgelakt.',
      basisPrijsM2: 395,
      levertijdWeken: '7 - 9',
      profielen: [
        { id: 'hout-67', label: 'Meranti 67 x 114 mm', factor: 1.00,
          omschrijving: 'Standaard renovatiemaat, fabrieksmatig gegrond.',
          tripleGeschikt: false, maxVakBreedte: 1400 },
        { id: 'hout-90', label: 'Meranti 90 x 140 mm', factor: 1.18,
          omschrijving: 'Zwaardere uitvoering, geschikt voor grotere vakken.',
          tripleGeschikt: true, maxVakBreedte: 1700 }
      ]
    }
  ],

  /* ------------------------------------------------------- 5. VAKINVULLING */
  /*
   *  factor     = vermenigvuldiger op de kozijnprijs per m² voor dít vak
   *  teOpenen   = telt mee voor het maximaal aantal horren
   *  symbool    = tekening in de live preview (zie preview.js)
   */
  vakInvullingen: [
    { id: 'vast',     label: 'Vast glas',                factor: 1.00, teOpenen: false,
      omschrijving: 'Niet te openen vak, maximale glasoppervlakte.' },
    { id: 'dk-r',     label: 'Draaikiep, scharnier rechts', factor: 1.38, teOpenen: true,
      omschrijving: 'Draaien én kiepen, bediening met één kruk.' },
    { id: 'dk-l',     label: 'Draaikiep, scharnier links',  factor: 1.38, teOpenen: true,
      omschrijving: 'Draaien én kiepen, bediening met één kruk.' },
    { id: 'draai-r',  label: 'Draairaam, scharnier rechts', factor: 1.28, teOpenen: true,
      omschrijving: 'Alleen draaiend, geen kiepstand.' },
    { id: 'draai-l',  label: 'Draairaam, scharnier links',  factor: 1.28, teOpenen: true,
      omschrijving: 'Alleen draaiend, geen kiepstand.' },
    { id: 'val',      label: 'Valraam (uitzetraam)',        factor: 1.30, teOpenen: true,
      omschrijving: 'Scharnier boven of onder, veel gebruikt bij bovenlichten.' },
    { id: 'deur-r',   label: 'Deur, draairichting rechts',  factor: 1.80, teOpenen: true,
      omschrijving: 'Inclusief driepuntssluiting en veiligheidsgarnituur.' },
    { id: 'deur-l',   label: 'Deur, draairichting links',   factor: 1.80, teOpenen: true,
      omschrijving: 'Inclusief driepuntssluiting en veiligheidsgarnituur.' },
    { id: 'schuif-r', label: 'Schuifdeel, schuift naar rechts', factor: 2.15, teOpenen: true,
      omschrijving: 'Hef-schuifdeel voor een schuifpui.' },
    { id: 'schuif-l', label: 'Schuifdeel, schuift naar links',  factor: 2.15, teOpenen: true,
      omschrijving: 'Hef-schuifdeel voor een schuifpui.' },
    { id: 'paneel',   label: 'Dicht paneel',               factor: 0.88, teOpenen: false,
      omschrijving: 'Geïsoleerd borstwerings- of deurpaneel in plaats van glas.' }
  ],

  /* ---------------------------------------------------- 6. MUURAANSLUITING */
  /*
   *  De prijs wordt gerekend over 2 x hoogte + 1 x breedte (niet onder de
   *  dorpel). eigenschap = extra montagetoeslag door het type aansluiting.
   */
  muuraansluitingen: [
    { id: 'geen',        label: 'Geen aansluitprofiel',       prijsM1: 0,
      omschrijving: 'Aansluiting wordt afgekit; afwerking door uzelf of uw aannemer.' },
    { id: 'aanslag',     label: 'Aanslagprofiel buitenzijde', prijsM1: 28,
      omschrijving: 'Strakke, waterkerende aansluiting op het buitenspouwblad.' },
    { id: 'afdek',       label: 'Afdekprofiel binnenzijde',   prijsM1: 24,
      omschrijving: 'Werkt de aansluiting binnen netjes weg, geen stucwerk nodig.' },
    { id: 'aanslag-afdek', label: 'Aanslag buiten + afdek binnen', prijsM1: 46,
      omschrijving: 'Binnen én buiten volledig afgewerkt: meest gekozen.' },
    { id: 'neuslat',     label: 'Neuslat / stelkozijn',       prijsM1: 39,
      omschrijving: 'Voor houtskeletbouw en diepe aansluitingen.' }
  ],

  /* Soort muur - bepaalt de montagetoeslag (hak- en stelwerk) */
  muursoorten: [
    { id: 'spouw',      label: 'Gemetselde spouwmuur',   montageToeslag: 0.00 },
    { id: 'massief',    label: 'Massieve muur / beton',  montageToeslag: 0.12 },
    { id: 'hsb',        label: 'Houtskeletbouw',         montageToeslag: 0.05 },
    { id: 'bestaand',   label: 'Op bestaand kozijn (renovatie)', montageToeslag: -0.10 }
  ],

  /* ------------------------------------------------- 7. KLEUREN EN MUUR-RAL */
  // toeslag = percentage op de elementprijs (kozijn + glas)
  colors: [
    { id: 'ral9016', label: 'RAL 9016 Verkeerswit',  hex: '#f4f4f0', toeslag: 0.00 },
    { id: 'ral9010', label: 'RAL 9010 Zuiver wit',   hex: '#f1efe7', toeslag: 0.00 },
    { id: 'ral9001', label: 'RAL 9001 Crèmewit',     hex: '#e6dfd0', toeslag: 0.06 },
    { id: 'ral1013', label: 'RAL 1013 Parelwit',     hex: '#e6dbc6', toeslag: 0.06 },
    { id: 'ral7016', label: 'RAL 7016 Antracietgrijs', hex: '#383e42', toeslag: 0.10 },
    { id: 'ral7021', label: 'RAL 7021 Zwartgrijs',   hex: '#2f3234', toeslag: 0.10 },
    { id: 'ral7039', label: 'RAL 7039 Kwartsgrijs',  hex: '#6b665e', toeslag: 0.10 },
    { id: 'ral9005', label: 'RAL 9005 Gitzwart',     hex: '#1b1b1b', toeslag: 0.10 },
    { id: 'ral6009', label: 'RAL 6009 Dennengroen',  hex: '#27352a', toeslag: 0.10 },
    { id: 'ral8014', label: 'RAL 8014 Sepiabruin',   hex: '#4a3526', toeslag: 0.10 },
    { id: 'goldenoak', label: 'Golden Oak (houtnerf)', hex: '#a5661f', toeslag: 0.14 },
    { id: 'noten',     label: 'Noten (houtnerf)',      hex: '#5a3a22', toeslag: 0.14 }
  ],
  // Extra toeslag wanneer binnen- en buitenkleur verschillen (tweekleurig)
  tweekleurigToeslag: 0.05,

  /* ------------------------------------------------------- 8. SOORT BEGLAZING */
  glazing: [
    { id: 'hr2p',      label: 'HR++ isolatieglas',      prijsM2: 95,  uWaarde: '1,1', triple: false,
      omschrijving: 'De standaard bij renovatie. Voldoet aan het Bouwbesluit.' },
    { id: 'triple',    label: 'Triple glas HR+++',      prijsM2: 148, uWaarde: '0,6', triple: true,
      omschrijving: 'Beste isolatie, ideaal in combinatie met een warmtepomp.' },
    { id: 'geluid',    label: 'Geluidwerend glas',      prijsM2: 175, uWaarde: '1,1', triple: false,
      omschrijving: 'Tot 38 dB reductie, bijvoorbeeld langs een drukke weg.' },
    { id: 'veilig',    label: 'Veiligheidsglas 33.2',   prijsM2: 132, uWaarde: '1,1', triple: false,
      omschrijving: 'Gelaagd glas: inbraakvertragend en letselwerend.' },
    { id: 'figuur',    label: 'Figuur-/matglas',        prijsM2: 118, uWaarde: '1,1', triple: false,
      omschrijving: 'Beperkt doorzicht - voor badkamer en toilet.' },
    { id: 'zonwerend', label: 'Zonwerend glas',         prijsM2: 145, uWaarde: '1,1', triple: false,
      omschrijving: 'Weert warmte op zon-georiënteerde gevels.' }
  ],

  /* -------------------------------------------------- 9. VENTILATIEROOSTERS */
  // Prijs per strekkende meter kozijnbreedte, geplaatst in het bovenkozijn.
  roosters: [
    { id: 'geen',       label: 'Geen ventilatierooster', prijsM1: 0,
      omschrijving: 'Ventilatie via een bestaand systeem of via de ramen.' },
    { id: 'zelfregelend', label: 'Zelfregelend rooster', prijsM1: 139,
      omschrijving: 'Houdt de luchttoevoer constant, ook bij harde wind.' },
    { id: 'geluiddempend', label: 'Geluiddempend rooster', prijsM1: 215,
      omschrijving: 'Ventileren met gesloten ramen zonder geluidsoverlast.' },
    { id: 'vochtgestuurd', label: 'Vochtgestuurd rooster', prijsM1: 245,
      omschrijving: 'Opent automatisch bij een hoge luchtvochtigheid.' }
  ],

  /* ------------------------------------------------------- 10. INZETHORREN */
  // Prijs per stuk; alleen mogelijk bij te openen vakken.
  horren: [
    { id: 'geen',    label: 'Geen horren',   prijsPerStuk: 0,
      omschrijving: 'Later alsnog bij te bestellen.' },
    { id: 'inzet',   label: 'Inzethor',      prijsPerStuk: 145,
      omschrijving: 'Vast horgaas in het draaiende deel, uitneembaar.' },
    { id: 'plisse',  label: 'Plisséhor',     prijsPerStuk: 245,
      omschrijving: 'Oprolbare plissé, ook geschikt voor deuren en schuifpuien.' },
    { id: 'rolhor',  label: 'Rolhor',        prijsPerStuk: 215,
      omschrijving: 'Onzichtbaar weggewerkt in een cassette.' }
  ],

  /* ------------------------------------------------------- extra toebehoren */
  /*
   *  eenheid: 'stuk' | 'm1-b' (per m breedte) | 'm1-o' (per m omtrek) | 'm2'
   */
  options: [
    { id: 'dorpel', label: 'Kunststeen onderdorpel', prijs: 105, eenheid: 'm1-b',
      omschrijving: 'Waterkerende dorpel onder het kozijn.' },
    { id: 'skg3', label: 'Beslag SKG*** in plaats van SKG**', prijs: 89, eenheid: 'stuk',
      omschrijving: 'Hoogste inbraakwerendheid, gunstig voor de verzekering.' },
    { id: 'roede', label: 'Glasverdeling / roedes', prijs: 65, eenheid: 'm2',
      omschrijving: 'Wiener sprossen of roedes tussen het glas.' },
    { id: 'rolluik', label: 'Voorzetrolluik (elektrisch)', prijs: 285, eenheid: 'm2',
      omschrijving: 'Inclusief motor en bediening.' },
    { id: 'elektrisch', label: 'Elektrisch deurslot', prijs: 585, eenheid: 'stuk',
      omschrijving: 'Openen met vingerscan of app. Alleen bij een deurvak.' },
    { id: 'brievenbus', label: 'Brievenbus in deur', prijs: 95, eenheid: 'stuk',
      omschrijving: 'Inclusief binnenklep en tochtborstel.' }
  ],

  /* --------------------------------------------------------------- diensten */
  services: {
    montage: {
      label: 'Montage door Fortis Kozijnen',
      omschrijving: 'Plaatsen, stellen, purren en waterdicht afkitten.',
      percentageVanElement: 0.16,
      minimumPerElement: 175
    },
    demontage: {
      label: 'Demontage en afvoer oude kozijn',
      omschrijving: 'Uitnemen bestaand kozijn en gescheiden afvoeren.',
      perElement: 95,
      perM2: 22
    },
    eenmalig: [
      { id: 'meetservice', label: 'Inmeetservice aan huis', prijs: 145,
        omschrijving: 'Onze adviseur meet alles exact in. Bij opdracht verrekenen wij dit bedrag.' },
      { id: 'stelpost-metselwerk', label: 'Stelpost herstel metsel- en stucwerk', prijs: 450,
        omschrijving: 'Indicatieve post voor het herstellen van de aansluitingen.' },
      { id: 'kraan', label: 'Inzet hoogwerker of kraan', prijs: 495,
        omschrijving: 'Nodig bij plaatsing op de verdieping of bij zware elementen.' }
    ]
  },

  /* ------------------------------------------------------- tekst in offerte */
  voorwaarden: [
    'Deze prijsindicatie is samengesteld met de online configurator en is 30 dagen geldig.',
    'De definitieve prijs volgt na het inmeten op locatie; afwijkende maten of bouwkundige situaties kunnen de prijs beïnvloeden.',
    'Alle genoemde bedragen zijn exclusief 21% btw, tenzij anders vermeld.',
    'Levertijd is indicatief en gaat in na akkoord op de definitieve offerte en de technische tekening.'
  ]
};
