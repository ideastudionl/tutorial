/* Witgoed Koning — demo-catalogus.
   Dit bestand is de ENIGE plek met verzonnen data. Zodra de Shopify- of
   WooCommerce-adapter aanstaat wordt dit bestand niet meer gelezen; de
   productvorm hieronder is precies wat die adapters teruggeven. */
window.WK = window.WK || {};

(function (WK) {
  'use strict';

  WK.CATEGORIES = [
    { slug: 'wasmachines', label: 'Wasmachines',    kind: 'wasmachine', blurb: 'Bosch, Siemens, Miele en AEG — gekeurd, gereinigd en met garantie.' },
    { slug: 'wasdrogers',  label: 'Wasdrogers',     kind: 'wasdroger',  blurb: 'Warmtepomp- en condensdrogers, zuinig in verbruik.' },
    { slug: 'vaatwassers', label: 'Vaatwassers',    kind: 'vaatwasser', blurb: 'Vrijstaand en inbouw, ontkalkt en getest op één volledig programma.' },
    { slug: 'koelvries',   label: 'Koelen & vriezen', kind: 'koelkast', blurb: 'Koelkasten, koel-vriescombinaties en vriezers met gecontroleerd koelcircuit.' },
    { slug: 'fornuizen',   label: 'Fornuizen & ovens', kind: 'fornuis', blurb: 'Gasfornuizen en inbouwovens, inclusief veiligheidskeuring.' },
    { slug: 'overig',      label: 'Magnetrons & overig', kind: 'magnetron', blurb: 'Magnetrons, afzuigkappen en losse apparaten.' }
  ];

  /* Status: 'ok' = gecontroleerd en goed bevonden, 'repl' = vervangen onderdeel. */
  const R = (item, status, note) => ({ item, status, note: note || '' });

  const RAW = [
    /* ------------------------------------------------------- wasmachines -- */
    {
      sku: 'WK-26-0417', brand: 'Miele', model: 'W1 WCG660 WPS', cat: 'wasmachines',
      title: 'Miele W1 WCG660 WPS wasmachine', price: 549, compareAt: 1249,
      cond: 'Nieuwstaat', warranty: 12, year: 2021, hours: 412, rating: 4.9, reviews: 23, stock: 1,
      specs: { 'Vulgewicht': '9 kg', 'Centrifuge': '1600 tpm', 'Energielabel': 'A', 'Geluid wassen': '48 dB', 'Geluid centrifugeren': '72 dB', 'Afmeting (hxbxd)': '85 × 60 × 64 cm', 'Gewicht': '96 kg', 'Bouwjaar': '2021', 'Draaiuren teller': '412 uur' },
      highlights: ['CapDosing en PowerWash — Miele-topmodel', 'Slechts 412 draaiuren, vrijwel niet gebruikt', 'Origineel Miele-lager, niet vervangen nodig'],
      refurb: [ R('Lagers en trommelas', 'ok', 'Speling binnen fabrieksnorm'), R('Pomp en afvoerfilter', 'ok', 'Gereinigd, vrij van vervuiling'), R('Deurrubber', 'ok', 'Geen scheuren of schimmel'), R('Verwarmingselement', 'ok', 'Weerstand 26 Ω, kalkvrij'), R('Schokdempers', 'ok'), R('Aanvoerslang', 'repl', 'Nieuwe slang gemonteerd'), R('Besturingsprint', 'ok', 'Foutgeheugen leeg'), R('Proefwas 60 °C katoen', 'ok', 'Volledig programma doorlopen') ]
    },
    {
      sku: 'WK-26-0402', brand: 'Bosch', model: 'Serie 6 WAU28T00NL', cat: 'wasmachines',
      title: 'Bosch Serie 6 WAU28T00NL wasmachine', price: 379, compareAt: 799,
      cond: 'Refurbished A', warranty: 12, year: 2020, hours: 980, rating: 4.7, reviews: 41, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Centrifuge': '1400 tpm', 'Energielabel': 'C', 'Geluid wassen': '50 dB', 'Afmeting (hxbxd)': '85 × 60 × 59 cm', 'Gewicht': '73 kg', 'Bouwjaar': '2020', 'Draaiuren teller': '980 uur' },
      highlights: ['EcoSilence Drive motor met 10 jaar fabrieksgarantie', 'VarioPerfect: sneller of zuiniger wassen', 'Nieuwe lagerset gemonteerd'],
      refurb: [ R('Lagers en trommelas', 'repl', 'Complete lagerset vernieuwd'), R('Pomp en afvoerfilter', 'ok', 'Gereinigd'), R('Deurrubber', 'repl', 'Nieuw origineel Bosch-rubber'), R('Verwarmingselement', 'ok', 'Ontkalkt'), R('Schokdempers', 'ok'), R('Koolborstels', 'ok', 'Borstelloze motor, n.v.t.'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0388', brand: 'Siemens', model: 'iQ500 WM14T463NL', cat: 'wasmachines',
      title: 'Siemens iQ500 WM14T463NL wasmachine', price: 349, compareAt: 749,
      cond: 'Refurbished A', warranty: 6, year: 2019, hours: 1340, rating: 4.6, reviews: 34, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Centrifuge': '1400 tpm', 'Energielabel': 'C', 'Geluid wassen': '49 dB', 'Afmeting (hxbxd)': '85 × 60 × 59 cm', 'Gewicht': '71 kg', 'Bouwjaar': '2019', 'Draaiuren teller': '1.340 uur' },
      highlights: ['iQdrive-motor, zeer stil', 'waterPerfect Plus doseert water op beladingsgewicht', 'Nieuwe pomp gemonteerd'],
      refurb: [ R('Lagers en trommelas', 'ok'), R('Pomp en afvoerfilter', 'repl', 'Nieuwe afvoerpomp'), R('Deurrubber', 'ok'), R('Verwarmingselement', 'ok', 'Ontkalkt'), R('Schokdempers', 'repl', 'Beide dempers vervangen'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0361', brand: 'Miele', model: 'W3241 Softtronic', cat: 'wasmachines',
      title: 'Miele W3241 Softtronic wasmachine', price: 329, compareAt: 0,
      cond: 'Refurbished B', warranty: 6, year: 2014, hours: 3100, rating: 4.5, reviews: 52, stock: 1,
      specs: { 'Vulgewicht': '6 kg', 'Centrifuge': '1200 tpm', 'Energielabel': 'A+ (oude schaal)', 'Geluid wassen': '52 dB', 'Afmeting (hxbxd)': '85 × 60 × 60 cm', 'Gewicht': '82 kg', 'Bouwjaar': '2014', 'Draaiuren teller': '3.100 uur' },
      highlights: ['Miele-kwaliteit voor een instapprijs', 'Honingraattrommel, zacht voor textiel', 'Kleine gebruikssporen op de zijkant — zie foto 3'],
      refurb: [ R('Lagers en trommelas', 'ok', 'Licht hoorbaar, binnen norm'), R('Pomp en afvoerfilter', 'ok'), R('Deurrubber', 'repl'), R('Verwarmingselement', 'repl', 'Verkalkt element vervangen'), R('Schokdempers', 'ok'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0344', brand: 'AEG', model: 'L6FBSPORT ProSense', cat: 'wasmachines',
      title: 'AEG L6FBSPORT ProSense wasmachine', price: 289, compareAt: 649,
      cond: 'Refurbished A', warranty: 6, year: 2018, hours: 1720, rating: 4.4, reviews: 28, stock: 1,
      specs: { 'Vulgewicht': '7 kg', 'Centrifuge': '1400 tpm', 'Energielabel': 'D', 'Geluid wassen': '51 dB', 'Afmeting (hxbxd)': '85 × 60 × 57 cm', 'Gewicht': '66 kg', 'Bouwjaar': '2018', 'Draaiuren teller': '1.720 uur' },
      highlights: ['ProSense weegt de was en past de tijd aan', 'Kort programma van 20 minuten', 'Sportprogramma voor technisch textiel'],
      refurb: [ R('Lagers en trommelas', 'ok'), R('Pomp en afvoerfilter', 'repl'), R('Deurrubber', 'ok'), R('Verwarmingselement', 'ok'), R('Schokdempers', 'ok'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0329', brand: 'Samsung', model: 'EcoBubble WW80J5426', cat: 'wasmachines',
      title: 'Samsung EcoBubble WW80J5426 wasmachine', price: 259, compareAt: 599,
      cond: 'Refurbished B', warranty: 6, year: 2017, hours: 2260, rating: 4.3, reviews: 19, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Centrifuge': '1400 tpm', 'Energielabel': 'D', 'Geluid wassen': '54 dB', 'Afmeting (hxbxd)': '85 × 60 × 55 cm', 'Gewicht': '61 kg', 'Bouwjaar': '2017', 'Draaiuren teller': '2.260 uur' },
      highlights: ['EcoBubble wast schoon op 20 °C', 'Digital Inverter-motor', 'Ondiep model — past in een smalle badkamer'],
      refurb: [ R('Lagers en trommelas', 'ok'), R('Pomp en afvoerfilter', 'ok'), R('Deurrubber', 'ok'), R('Verwarmingselement', 'repl'), R('Schokdempers', 'ok'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0311', brand: 'Bosch', model: 'WAN28242', cat: 'wasmachines',
      title: 'Bosch WAN28242 Serie 4 wasmachine', price: 299, compareAt: 629,
      cond: 'Refurbished A', warranty: 6, year: 2018, hours: 1890, rating: 4.6, reviews: 37, stock: 1,
      specs: { 'Vulgewicht': '7 kg', 'Centrifuge': '1400 tpm', 'Energielabel': 'D', 'Geluid wassen': '52 dB', 'Afmeting (hxbxd)': '85 × 60 × 59 cm', 'Gewicht': '68 kg', 'Bouwjaar': '2018', 'Draaiuren teller': '1.890 uur' },
      highlights: ['ActiveWater Plus past het waterverbruik aan', 'AntiVlek-systeem voor vier vlektypes', 'Nieuwe schokdempers'],
      refurb: [ R('Lagers en trommelas', 'ok'), R('Pomp en afvoerfilter', 'ok'), R('Deurrubber', 'ok'), R('Verwarmingselement', 'ok'), R('Schokdempers', 'repl'), R('Besturingsprint', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },
    {
      sku: 'WK-26-0298', brand: 'Zanussi', model: 'ZWF81243W', cat: 'wasmachines',
      title: 'Zanussi ZWF81243W wasmachine', price: 229, compareAt: 0,
      cond: 'Refurbished B', warranty: 6, year: 2016, hours: 2840, rating: 4.1, reviews: 14, stock: 2,
      specs: { 'Vulgewicht': '8 kg', 'Centrifuge': '1200 tpm', 'Energielabel': 'E', 'Geluid wassen': '56 dB', 'Afmeting (hxbxd)': '85 × 60 × 57 cm', 'Gewicht': '64 kg', 'Bouwjaar': '2016', 'Draaiuren teller': '2.840 uur' },
      highlights: ['Onze voordeligste 8 kg-machine', 'AquaControl lekbeveiliging', 'Prima tweede machine of voor een verhuurwoning'],
      refurb: [ R('Lagers en trommelas', 'ok'), R('Pomp en afvoerfilter', 'ok'), R('Deurrubber', 'ok'), R('Verwarmingselement', 'ok'), R('Schokdempers', 'ok'), R('Proefwas 60 °C katoen', 'ok') ]
    },

    /* -------------------------------------------------------- wasdrogers -- */
    {
      sku: 'WK-26-0409', brand: 'Miele', model: 'TKB550WP EcoSpeed', cat: 'wasdrogers',
      title: 'Miele TKB550WP warmtepompdroger', price: 499, compareAt: 1099,
      cond: 'Nieuwstaat', warranty: 12, year: 2021, hours: 520, rating: 4.9, reviews: 18, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Type': 'Warmtepomp', 'Energielabel': 'A++', 'Verbruik per cyclus': '1,45 kWh', 'Geluid': '64 dB', 'Afmeting (hxbxd)': '85 × 60 × 64 cm', 'Gewicht': '58 kg', 'Bouwjaar': '2021', 'Draaiuren teller': '520 uur' },
      highlights: ['PerfectDry meet de restvochtigheid en stopt precies op tijd', 'Onderhoudsvrije condensor', 'Zeer laag verbruik: circa €0,45 per droogbeurt'],
      refurb: [ R('Warmtepompcircuit', 'ok', 'Druk en koudemiddel gecontroleerd'), R('Condensor en filters', 'ok', 'Uitgeblazen en gereinigd'), R('Trommellagers', 'ok'), R('Aandrijfriem', 'ok'), R('Vochtsensoren', 'ok', 'Gekalibreerd'), R('Deurschakelaar', 'ok'), R('Proefdroogbeurt kastdroog', 'ok') ]
    },
    {
      sku: 'WK-26-0396', brand: 'Bosch', model: 'WTW85463NL Serie 6', cat: 'wasdrogers',
      title: 'Bosch WTW85463NL warmtepompdroger', price: 359, compareAt: 799,
      cond: 'Refurbished A', warranty: 12, year: 2019, hours: 1420, rating: 4.7, reviews: 31, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Type': 'Warmtepomp', 'Energielabel': 'A++', 'Verbruik per cyclus': '1,56 kWh', 'Geluid': '65 dB', 'Afmeting (hxbxd)': '84 × 60 × 60 cm', 'Gewicht': '54 kg', 'Bouwjaar': '2019', 'Draaiuren teller': '1.420 uur' },
      highlights: ['SelfCleaning Condenser — spoelt zichzelf schoon', 'AutoDry stopt op het ingestelde droogniveau', 'Nieuwe pluizenfilters gemonteerd'],
      refurb: [ R('Warmtepompcircuit', 'ok'), R('Condensor en filters', 'repl', 'Nieuwe pluizenfilterset'), R('Trommellagers', 'ok'), R('Aandrijfriem', 'repl'), R('Vochtsensoren', 'ok'), R('Deurschakelaar', 'ok'), R('Proefdroogbeurt kastdroog', 'ok') ]
    },
    {
      sku: 'WK-26-0372', brand: 'Siemens', model: 'iQ300 WT45N202NL', cat: 'wasdrogers',
      title: 'Siemens iQ300 WT45N202NL warmtepompdroger', price: 319, compareAt: 699,
      cond: 'Refurbished A', warranty: 6, year: 2018, hours: 1980, rating: 4.5, reviews: 26, stock: 1,
      specs: { 'Vulgewicht': '7 kg', 'Type': 'Warmtepomp', 'Energielabel': 'A+', 'Verbruik per cyclus': '1,88 kWh', 'Geluid': '65 dB', 'Afmeting (hxbxd)': '84 × 60 × 60 cm', 'Gewicht': '50 kg', 'Bouwjaar': '2018', 'Draaiuren teller': '1.980 uur' },
      highlights: ['autoDry beschermt textiel tegen te lang drogen', 'Groot display met resterende tijd', 'Condensbak op ooghoogte, makkelijk legen'],
      refurb: [ R('Warmtepompcircuit', 'ok'), R('Condensor en filters', 'ok'), R('Trommellagers', 'ok'), R('Aandrijfriem', 'ok'), R('Vochtsensoren', 'ok'), R('Proefdroogbeurt kastdroog', 'ok') ]
    },
    {
      sku: 'WK-26-0355', brand: 'AEG', model: 'T8DBN86ES AbsoluteCare', cat: 'wasdrogers',
      title: 'AEG T8DBN86ES warmtepompdroger', price: 339, compareAt: 749,
      cond: 'Refurbished A', warranty: 6, year: 2019, hours: 1610, rating: 4.6, reviews: 22, stock: 1,
      specs: { 'Vulgewicht': '8 kg', 'Type': 'Warmtepomp', 'Energielabel': 'A++', 'Verbruik per cyclus': '1,49 kWh', 'Geluid': '66 dB', 'Afmeting (hxbxd)': '85 × 60 × 64 cm', 'Gewicht': '56 kg', 'Bouwjaar': '2019', 'Draaiuren teller': '1.610 uur' },
      highlights: ['AbsoluteCare-programma voor wol en zijde', 'ProSense weegt de lading', 'Nieuwe condensorafdichting'],
      refurb: [ R('Warmtepompcircuit', 'ok'), R('Condensor en filters', 'repl', 'Afdichting vernieuwd'), R('Trommellagers', 'ok'), R('Aandrijfriem', 'ok'), R('Vochtsensoren', 'ok'), R('Proefdroogbeurt kastdroog', 'ok') ]
    },
    {
      sku: 'WK-26-0317', brand: 'Beko', model: 'DS7333PA0W', cat: 'wasdrogers',
      title: 'Beko DS7333PA0W condensdroger', price: 199, compareAt: 0,
      cond: 'Refurbished B', warranty: 6, year: 2017, hours: 2410, rating: 4.0, reviews: 11, stock: 1,
      specs: { 'Vulgewicht': '7 kg', 'Type': 'Condens', 'Energielabel': 'B', 'Verbruik per cyclus': '4,15 kWh', 'Geluid': '65 dB', 'Afmeting (hxbxd)': '86 × 60 × 54 cm', 'Gewicht': '38 kg', 'Bouwjaar': '2017', 'Draaiuren teller': '2.410 uur' },
      highlights: ['Instapmodel — laagste aanschafprijs', 'Let op: condensdroger, hoger stroomverbruik dan warmtepomp', 'Geschikt voor incidenteel gebruik'],
      refurb: [ R('Verwarmingselement', 'ok'), R('Condensor en filters', 'ok', 'Gereinigd'), R('Trommellagers', 'ok'), R('Aandrijfriem', 'repl'), R('Vochtsensoren', 'ok'), R('Proefdroogbeurt kastdroog', 'ok') ]
    },

    /* ------------------------------------------------------- vaatwassers -- */
    {
      sku: 'WK-26-0405', brand: 'Miele', model: 'G4203 SC Active', cat: 'vaatwassers',
      title: 'Miele G4203 SC vrijstaande vaatwasser', price: 399, compareAt: 899,
      cond: 'Refurbished A', warranty: 12, year: 2019, hours: 1180, rating: 4.8, reviews: 24, stock: 1,
      specs: { 'Couverts': '14', 'Type': 'Vrijstaand', 'Energielabel': 'D', 'Geluid': '46 dB', 'Waterverbruik': '9,7 liter', 'Afmeting (hxbxd)': '85 × 60 × 60 cm', 'Gewicht': '48 kg', 'Bouwjaar': '2019', 'Draaiuren teller': '1.180 uur' },
      highlights: ['Miele-korven met roestvrijstalen geleiders', 'Waterproof-systeem tegen waterschade', 'Nieuwe onderste spoelarm'],
      refurb: [ R('Spoelarmen', 'repl', 'Onderste arm vernieuwd'), R('Zeef en filterset', 'ok', 'Gereinigd'), R('Circulatiepomp', 'ok'), R('Afvoerpomp', 'ok'), R('Deurafdichting', 'ok'), R('Verwarmingselement', 'ok', 'Ontkalkt'), R('Aquastop-slang', 'repl'), R('Proefprogramma 65 °C', 'ok') ]
    },
    {
      sku: 'WK-26-0381', brand: 'Bosch', model: 'SMV46KX01N Serie 4', cat: 'vaatwassers',
      title: 'Bosch SMV46KX01N volledig integreerbare vaatwasser', price: 329, compareAt: 729,
      cond: 'Refurbished A', warranty: 6, year: 2020, hours: 1340, rating: 4.7, reviews: 29, stock: 1,
      specs: { 'Couverts': '13', 'Type': 'Volledig integreerbaar', 'Energielabel': 'E', 'Geluid': '46 dB', 'Waterverbruik': '9,5 liter', 'Afmeting (hxbxd)': '82 × 60 × 55 cm', 'Gewicht': '41 kg', 'Bouwjaar': '2020', 'Draaiuren teller': '1.340 uur' },
      highlights: ['InfoLight projecteert een stip op de vloer als hij draait', 'VarioFlex-korven met klapbare pinnen', 'Let op: inbouwmodel, deurfront niet meegeleverd'],
      refurb: [ R('Spoelarmen', 'ok'), R('Zeef en filterset', 'ok'), R('Circulatiepomp', 'ok'), R('Afvoerpomp', 'repl'), R('Deurafdichting', 'ok'), R('Verwarmingselement', 'ok'), R('Aquastop-slang', 'ok'), R('Proefprogramma 65 °C', 'ok') ]
    },
    {
      sku: 'WK-26-0358', brand: 'Siemens', model: 'SN236W01ME iQ300', cat: 'vaatwassers',
      title: 'Siemens iQ300 SN236W01ME vrijstaande vaatwasser', price: 289, compareAt: 619,
      cond: 'Refurbished B', warranty: 6, year: 2018, hours: 1860, rating: 4.4, reviews: 17, stock: 1,
      specs: { 'Couverts': '13', 'Type': 'Vrijstaand', 'Energielabel': 'E', 'Geluid': '48 dB', 'Waterverbruik': '9,5 liter', 'Afmeting (hxbxd)': '85 × 60 × 60 cm', 'Gewicht': '43 kg', 'Bouwjaar': '2018', 'Draaiuren teller': '1.860 uur' },
      highlights: ['varioSpeed: tot 66% sneller klaar', 'Bestekkorf en bovenlade', 'Lichte krasjes op de zijkant — zie foto 4'],
      refurb: [ R('Spoelarmen', 'ok'), R('Zeef en filterset', 'ok'), R('Circulatiepomp', 'ok'), R('Afvoerpomp', 'ok'), R('Deurafdichting', 'repl'), R('Verwarmingselement', 'ok'), R('Proefprogramma 65 °C', 'ok') ]
    },
    {
      sku: 'WK-26-0336', brand: 'AEG', model: 'FSE63307P AirDry', cat: 'vaatwassers',
      title: 'AEG FSE63307P integreerbare vaatwasser', price: 279, compareAt: 599,
      cond: 'Refurbished A', warranty: 6, year: 2019, hours: 1520, rating: 4.5, reviews: 15, stock: 1,
      specs: { 'Couverts': '13', 'Type': 'Volledig integreerbaar', 'Energielabel': 'E', 'Geluid': '47 dB', 'Waterverbruik': '9,9 liter', 'Afmeting (hxbxd)': '82 × 60 × 55 cm', 'Gewicht': '40 kg', 'Bouwjaar': '2019', 'Draaiuren teller': '1.520 uur' },
      highlights: ['AirDry opent de deur automatisch voor natuurlijk drogen', 'SprayZone voor pannen en ovenschalen', 'Let op: inbouwmodel, deurfront niet meegeleverd'],
      refurb: [ R('Spoelarmen', 'ok'), R('Zeef en filterset', 'repl'), R('Circulatiepomp', 'ok'), R('Afvoerpomp', 'ok'), R('Deurafdichting', 'ok'), R('Deurveer AirDry', 'ok'), R('Proefprogramma 65 °C', 'ok') ]
    },

    /* --------------------------------------------------------- koelvries -- */
    {
      sku: 'WK-26-0412', brand: 'Liebherr', model: 'KGN 52 NoFrost', cat: 'koelvries',
      title: 'Liebherr KGN 52 koel-vriescombinatie', price: 449, compareAt: 1049,
      cond: 'Refurbished A', warranty: 12, year: 2020, hours: 0, rating: 4.8, reviews: 20, stock: 1,
      specs: { 'Inhoud koelen': '246 liter', 'Inhoud vriezen': '106 liter', 'Type': 'Koel-vriescombinatie, NoFrost', 'Energielabel': 'E', 'Geluid': '38 dB', 'Afmeting (hxbxd)': '201 × 60 × 63 cm', 'Gewicht': '82 kg', 'Bouwjaar': '2020' },
      highlights: ['NoFrost — nooit meer ontdooien', 'BioFresh-lade houdt groente tot drie keer langer vers', 'Zeer stil met 38 dB, geschikt voor een open keuken'],
      refurb: [ R('Koelcircuit en compressor', 'ok', 'Drukzijde 24 uur getest'), R('Thermostaat', 'ok', 'Gekalibreerd op 4 °C / -18 °C'), R('Deurafdichtingen', 'repl', 'Beide rubbers vernieuwd'), R('NoFrost-ventilator', 'ok'), R('Verlichting', 'ok'), R('Condensafvoer', 'ok', 'Doorgespoten'), R('Koeltest 24 uur', 'ok', 'Stabiel op temperatuur') ]
    },
    {
      sku: 'WK-26-0391', brand: 'Bosch', model: 'KGN36VLEC Serie 4', cat: 'koelvries',
      title: 'Bosch KGN36VLEC koel-vriescombinatie', price: 379, compareAt: 799,
      cond: 'Refurbished A', warranty: 6, year: 2020, hours: 0, rating: 4.6, reviews: 27, stock: 1,
      specs: { 'Inhoud koelen': '215 liter', 'Inhoud vriezen': '111 liter', 'Type': 'Koel-vriescombinatie, NoFrost', 'Energielabel': 'E', 'Geluid': '39 dB', 'Afmeting (hxbxd)': '186 × 60 × 66 cm', 'Gewicht': '73 kg', 'Bouwjaar': '2020' },
      highlights: ['VitaFresh-lade voor vlees en vis', 'NoFrost in het vriesdeel', 'MultiBox met eierhouder'],
      refurb: [ R('Koelcircuit en compressor', 'ok'), R('Thermostaat', 'ok'), R('Deurafdichtingen', 'ok'), R('NoFrost-ventilator', 'repl'), R('Verlichting', 'repl', 'Nieuwe ledbalk'), R('Condensafvoer', 'ok'), R('Koeltest 24 uur', 'ok') ]
    },
    {
      sku: 'WK-26-0367', brand: 'Samsung', model: 'RB34T672DSA', cat: 'koelvries',
      title: 'Samsung RB34T672DSA koel-vriescombinatie', price: 329, compareAt: 749,
      cond: 'Refurbished B', warranty: 6, year: 2019, hours: 0, rating: 4.3, reviews: 16, stock: 1,
      specs: { 'Inhoud koelen': '230 liter', 'Inhoud vriezen': '114 liter', 'Type': 'Koel-vriescombinatie, NoFrost', 'Energielabel': 'E', 'Geluid': '39 dB', 'Afmeting (hxbxd)': '185 × 60 × 66 cm', 'Gewicht': '70 kg', 'Bouwjaar': '2019' },
      highlights: ['SpaceMax: dunnere wanden, meer inhoud', 'Digital Inverter-compressor met 10 jaar fabrieksgarantie', 'Deukje in de rechterzijwand — zie foto 4, niet zichtbaar bij inbouw'],
      refurb: [ R('Koelcircuit en compressor', 'ok'), R('Thermostaat', 'ok'), R('Deurafdichtingen', 'repl'), R('NoFrost-ventilator', 'ok'), R('Verlichting', 'ok'), R('Condensafvoer', 'ok'), R('Koeltest 24 uur', 'ok') ]
    },
    {
      sku: 'WK-26-0349', brand: 'Liebherr', model: 'GN 2723 Comfort', cat: 'koelvries',
      title: 'Liebherr GN 2723 vrieskast NoFrost', price: 299, compareAt: 699,
      cond: 'Refurbished A', warranty: 6, year: 2018, hours: 0, rating: 4.7, reviews: 12, stock: 1,
      specs: { 'Inhoud vriezen': '195 liter', 'Type': 'Vrieskast, NoFrost', 'Energielabel': 'F', 'Geluid': '41 dB', 'Laden': '7', 'Afmeting (hxbxd)': '164 × 60 × 63 cm', 'Gewicht': '68 kg', 'Bouwjaar': '2018' },
      highlights: ['Zeven transparante laden, goed te ordenen', 'NoFrost — geen ijsaanslag', 'SuperFrost-knop voor snel invriezen'],
      refurb: [ R('Koelcircuit en compressor', 'ok'), R('Thermostaat', 'ok', 'Gekalibreerd op -18 °C'), R('Deurafdichting', 'ok'), R('NoFrost-ventilator', 'ok'), R('Laden en fronten', 'ok', 'Compleet, geen breuk'), R('Vriestest 24 uur', 'ok') ]
    },

    /* --------------------------------------------------------- fornuizen -- */
    {
      sku: 'WK-26-0384', brand: 'Bosch', model: 'HBA334BB0 Serie 4', cat: 'fornuizen',
      title: 'Bosch Serie 4 HBA334BB0 inbouwoven', price: 279, compareAt: 629,
      cond: 'Refurbished A', warranty: 6, year: 2020, hours: 0, rating: 4.6, reviews: 13, stock: 1,
      specs: { 'Inhoud': '71 liter', 'Type': 'Inbouw multifunctionele oven', 'Energielabel': 'A', 'Reiniging': 'EcoClean Direct', 'Verwarmingsfuncties': '7', 'Nismaat (hxbxd)': '59,5 × 56 × 55 cm', 'Gewicht': '31 kg', 'Bouwjaar': '2020' },
      highlights: ['3D-heteluchtsysteem, bakt op drie niveaus tegelijk', 'EcoClean-coating aan achterwand', 'Inclusief bakplaat en rooster'],
      refurb: [ R('Verwarmingselementen boven/onder', 'ok'), R('Hetelucht-element en ventilator', 'ok'), R('Deurscharnieren', 'repl', 'Beide scharnieren vernieuwd'), R('Deurglas en afdichting', 'ok', 'Gereinigd'), R('Thermostaat', 'ok', 'Gekalibreerd op 180 °C'), R('Bedieningsknoppen', 'ok'), R('Opwarmtest 200 °C', 'ok') ]
    },
    {
      sku: 'WK-26-0341', brand: 'Etna', model: 'FVW560WIT', cat: 'fornuizen',
      title: 'Etna FVW560WIT gasfornuis met oven', price: 249, compareAt: 549,
      cond: 'Refurbished B', warranty: 6, year: 2017, hours: 0, rating: 4.2, reviews: 9, stock: 1,
      specs: { 'Pitten': '4 gaspitten', 'Oveninhoud': '54 liter', 'Type': 'Vrijstaand gasfornuis, elektrische oven', 'Energielabel oven': 'A', 'Vlambeveiliging': 'Ja, alle pitten', 'Afmeting (hxbxd)': '85 × 60 × 60 cm', 'Gewicht': '46 kg', 'Bouwjaar': '2017' },
      highlights: ['Alle pitten met thermokoppel-vlambeveiliging', 'Gietijzeren pannendragers', 'Gasaansluiting door onze monteur gekeurd'],
      refurb: [ R('Gaskranen en branders', 'ok', 'Gereinigd en afgesteld'), R('Vlambeveiliging alle pitten', 'ok', 'Uitvaltijd < 45 sec'), R('Gasslang en koppeling', 'repl', 'Nieuwe gekeurde slang'), R('Ovenelement', 'ok'), R('Deurafdichting oven', 'ok'), R('Lekdichtheidstest gasleiding', 'ok', 'Zeepwatertest akkoord'), R('Opwarmtest 200 °C', 'ok') ]
    },

    /* ------------------------------------------------------------ overig -- */
    {
      sku: 'WK-26-0374', brand: 'Bosch', model: 'BFL523MS0 Serie 4', cat: 'overig',
      title: 'Bosch BFL523MS0 inbouwmagnetron', price: 149, compareAt: 349,
      cond: 'Refurbished A', warranty: 6, year: 2020, hours: 0, rating: 4.5, reviews: 8, stock: 1,
      specs: { 'Inhoud': '20 liter', 'Vermogen': '800 watt', 'Type': 'Inbouwmagnetron', 'Vermogensstanden': '5', 'Draaiplateau': '25,5 cm', 'Nismaat (hxbxd)': '38 × 56 × 32 cm', 'Gewicht': '18 kg', 'Bouwjaar': '2020' },
      highlights: ['AutoPilot met 7 automatische programma\'s', 'RVS-front, past bij Bosch-inbouwlijn', 'Inclusief glazen draaiplateau'],
      refurb: [ R('Magnetron en golfgeleider', 'ok'), R('Deurvergrendeling', 'ok', 'Drie schakelaars getest'), R('Straling-lekmeting', 'ok', 'Ruim binnen norm, < 1 mW/cm²'), R('Draaiplateaumotor', 'ok'), R('Bedieningspaneel', 'ok'), R('Opwarmtest 1 liter water', 'ok') ]
    },
    {
      sku: 'WK-26-0322', brand: 'Whirlpool', model: 'MWP 254 M', cat: 'overig',
      title: 'Whirlpool MWP 254 M vrijstaande magnetron', price: 89, compareAt: 0,
      cond: 'Refurbished B', warranty: 6, year: 2019, hours: 0, rating: 4.1, reviews: 6, stock: 3,
      specs: { 'Inhoud': '25 liter', 'Vermogen': '900 watt', 'Type': 'Vrijstaande magnetron', 'Vermogensstanden': '6', 'Draaiplateau': '31,5 cm', 'Afmeting (hxbxd)': '28 × 48 × 39 cm', 'Gewicht': '13 kg', 'Bouwjaar': '2019' },
      highlights: ['Ruime 25 liter inhoud', 'Jet Defrost ontdooiprogramma', 'Voordeligste optie in het assortiment'],
      refurb: [ R('Magnetron en golfgeleider', 'ok'), R('Deurvergrendeling', 'ok'), R('Straling-lekmeting', 'ok', 'Ruim binnen norm'), R('Draaiplateaumotor', 'repl'), R('Bedieningspaneel', 'ok'), R('Opwarmtest 1 liter water', 'ok') ]
    }
  ];

  const KIND_BY_CAT = {};
  WK.CATEGORIES.forEach(c => { KIND_BY_CAT[c.slug] = c.kind; });

  const slugify = (s) => s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  WK.PRODUCTS = RAW.map((p, i) => {
    const kind = p.cat === 'koelvries'
      ? (/vries(kast)?\b/i.test(p.title) && !/koel-vries/i.test(p.title) ? 'vriezer' : 'koelkast')
      : p.cat === 'overig' ? 'magnetron'
      : p.cat === 'fornuizen' ? (/oven/i.test(p.title) && !/fornuis/i.test(p.title) ? 'fornuis' : 'fornuis')
      : KIND_BY_CAT[p.cat];
    return Object.assign({
      id: 'p' + (i + 1),
      slug: slugify(p.brand + '-' + p.model + '-' + p.sku),
      kind,
      available: true,
      addedDaysAgo: (i * 3) % 21
    }, p);
  });

  WK.byCategory = (slug) => WK.PRODUCTS.filter(p => p.cat === slug);
  WK.bySlug = (slug) => WK.PRODUCTS.find(p => p.slug === slug);
  WK.byId = (id) => WK.PRODUCTS.find(p => p.id === id);

  /* -------------------------------------------------- reviews en content -- */

  WK.SHOP = {
    name: 'Witgoed Koning',
    tagline: 'Tweedehands witgoed van A-merken',
    street: 'Staverenstraat 9c', zip: '7418 CJ', city: 'Deventer',
    phone: '0570 - 585 023', phoneHref: '+31570585023',
    email: 'info@witgoed-koning.nl',
    kvk: '00000000', btw: 'NL000000000B01',
    since: 2015,
    rating: 8.6, reviewCount: 1024,
    hours: [
      ['Maandag', 'op afspraak'], ['Dinsdag', '10:00 – 17:00'], ['Woensdag', '10:00 – 17:00'],
      ['Donderdag', '10:00 – 17:00'], ['Vrijdag', '10:00 – 17:00'], ['Zaterdag', '10:00 – 16:00'], ['Zondag', 'gesloten']
    ]
  };

  WK.REVIEWS = [
    { name: 'Marjolein', city: 'Apeldoorn', rating: 5, date: '28 augustus 2026', product: 'Bosch Serie 6 wasmachine',
      text: 'Dinsdag besteld, donderdag stond hij er. De monteurs hebben de oude machine meegenomen, de nieuwe aangesloten en een proefwas gedraaid voordat ze weggingen. Dat laatste had ik niet verwacht.' },
    { name: 'Hendrik', city: 'Zwolle', rating: 5, date: '21 augustus 2026', product: 'Miele TKB550WP droger',
      text: 'Ik was huiverig voor tweedehands, maar het keuringsrapport bij het apparaat gaf de doorslag: je ziet precies wat er vervangen is. Draait nu twee maanden zonder één klacht.' },
    { name: 'Fatima', city: 'Deventer', rating: 4, date: '14 augustus 2026', product: 'Siemens iQ500 vaatwasser',
      text: 'Vaatwasser gaf na een week een foutcode. Gebeld, dezelfde week kwam er een monteur langs die het opgelost heeft. Geen gedoe, geen kosten. Vier sterren omdat het natuurlijk niet had moeten gebeuren.' },
    { name: 'Joost', city: 'Amersfoort', rating: 5, date: '9 augustus 2026', product: 'Liebherr koel-vriescombinatie',
      text: 'Prijs was ruim de helft van nieuw en het ding staat er als nieuw bij. Aan de telefoon meteen iemand die verstand van zaken had en me van een duurder model afhield omdat ik het niet nodig had.' },
    { name: 'Annelies', city: 'Raalte', rating: 5, date: '2 augustus 2026', product: 'AEG wasmachine',
      text: 'Bezorgd op zaterdag, in het tijdvak dat ik zelf gekozen had, met een sms een half uur van tevoren. Precies zoals je het wil.' },
    { name: 'Ramon', city: 'Almelo', rating: 4, date: '26 juli 2026', product: 'Bosch inbouwvaatwasser',
      text: 'Goede machine voor een scherpe prijs. Wel even opletten: bij een inbouwmodel zit het deurfront er niet bij. Staat er eerlijk bij op de site, maar ik had het bijna gemist.' }
  ];

  WK.FAQ = [
    { q: 'Hoe lang heb ik garantie op een tweedehands apparaat?',
      a: 'Standaard 6 maanden volledige garantie op alle apparaten. Op apparaten met het label Refurbished A of Nieuwstaat geven wij 12 maanden. De garantietermijn staat altijd bij het product vermeld. Binnen de garantieperiode komen wij kosteloos langs, of halen wij het apparaat op en brengen een vervangend exemplaar.' },
    { q: 'Wat kost bezorgen en aansluiten?',
      a: 'Niets. Bezorging, aansluiten en het meenemen van uw oude apparaat zijn gratis in heel Nederland. Er komen geen kosten bij in de laatste stap van het bestellen — de prijs die u op de productpagina ziet is de prijs die u betaalt.' },
    { q: 'Nemen jullie mijn oude apparaat mee?',
      a: 'Ja, gratis, ook als u het bij ons niet gekocht heeft. Zorg dat het apparaat leeg en losgekoppeld is en op de begane grond of bij de voordeur staat. Wij voeren het af via een erkende recycler.' },
    { q: 'Wat betekent Refurbished A, Refurbished B en Nieuwstaat?',
      a: 'Nieuwstaat: nauwelijks gebruikt, geen zichtbare gebruikssporen, meestal minder dan 1.000 draaiuren. Refurbished A: technisch volledig in orde, hooguit lichte gebruikssporen die u bij normaal gebruik niet ziet. Refurbished B: technisch volledig in orde, met zichtbare gebruikssporen. Die sporen fotograferen wij en benoemen wij bij het product — u koopt nooit een verrassing.' },
    { q: 'Krijg ik precies het apparaat dat op de foto staat?',
      a: 'Ja. Elk apparaat heeft een eigen artikelnummer en eigen foto\'s. Wij verkopen geen voorraadmodellen met stockfoto\'s: wat u ziet is het exemplaar dat bij u thuis wordt afgeleverd, inclusief het keuringsrapport van dát toestel.' },
    { q: 'Wanneer wordt er bezorgd?',
      a: 'Binnen 1 tot 5 werkdagen, van maandag tot en met zaterdag. U kiest zelf een dagdeel tijdens het bestellen. De dag ervoor ontvangt u een tijdvak van twee uur, en op de dag zelf een sms als de bezorger onderweg is.' },
    { q: 'Kan ik het apparaat eerst in de showroom bekijken?',
      a: 'Zeker. Onze showroom aan de Staverenstraat 9c in Deventer is dinsdag tot en met zaterdag open. Reserveer het apparaat online zodat het klaarstaat, of kom vrijblijvend langs — er staan doorgaans zo\'n 200 apparaten.' },
    { q: 'Wat als het apparaat niet bevalt?',
      a: 'U heeft 14 dagen bedenktijd, net als bij nieuw. Wij halen het apparaat kosteloos op en storten het aankoopbedrag binnen 5 werkdagen terug. Wel graag zorgvuldig gebruikt en met de originele accessoires.' }
  ];

})(window.WK);
