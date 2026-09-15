/* =========================================================
   Clover Uitzendbureau — demodata
   ---------------------------------------------------------
   LET OP: alle teksten, vacatures, namen en cijfers hieronder
   zijn ingevuld als voorbeeld voor de demo. Vervang ze door
   de echte content/ATS-koppeling van Clover.
   ========================================================= */

const SECTOREN = [
  { id: 'techniek',   naam: 'Techniek & Installatie', kleur: '#24466B', zacht: '#E4EAF1', icoon: 'moersleutel',
    pitch: 'Monteurs, servicetechnici en engineers voor installatie, W&E en industrie.' },
  { id: 'bouw',       naam: 'Bouw & Infra',           kleur: '#8A4B1E', zacht: '#F3EAE1', icoon: 'helm',
    pitch: 'Van timmerman tot uitvoerder. Vakmensen met VCA die morgen kunnen starten.' },
  { id: 'logistiek',  naam: 'Logistiek & Transport',  kleur: '#1B7F58', zacht: '#E2EFE9', icoon: 'doos',
    pitch: 'Orderpickers, heftruck- en reachtruckchauffeurs, planners en chauffeurs.' },
  { id: 'productie',  naam: 'Productie & Industrie',  kleur: '#3E4A54', zacht: '#E9EBED', icoon: 'tandwiel',
    pitch: 'Productiemedewerkers, operators en machinebedieners in 2- en 3-ploegendienst.' },
  { id: 'zorg',       naam: 'Zorg & Welzijn',         kleur: '#7A3B52', zacht: '#F1E7EB', icoon: 'hart',
    pitch: 'Verzorgenden IG, helpenden en begeleiders voor thuiszorg, VVT en gehandicaptenzorg.' },
  { id: 'horeca',     naam: 'Horeca & Facilitair',    kleur: '#6B5A2A', zacht: '#EFEBDF', icoon: 'kop',
    pitch: 'Bediening, keukenhulp en facilitair personeel voor hotels, events en zorginstellingen.' },
  { id: 'kantoor',    naam: 'Administratie & Kantoor',kleur: '#3F3A6B', zacht: '#E9E7F0', icoon: 'map',
    pitch: 'Klantenservice, financieel administratief en backoffice — hybride mogelijk.' },
  { id: 'schoonmaak', naam: 'Schoonmaak & Groen',     kleur: '#2C6357', zacht: '#E3EDEA', icoon: 'blad',
    pitch: 'Schoonmakers, glazenwassers en hoveniers met oog voor detail.' }
];

const RECRUITERS = [
  { id: 'nadia',  naam: 'Nadia El Amrani', rol: 'Intercedent Techniek & Bouw',   tel: '+31 6 12 34 56 71', mail: 'nadia@cloveruitzendbureau.nl' },
  { id: 'daan',   naam: 'Daan Verhoeven',  rol: 'Intercedent Logistiek & Productie', tel: '+31 6 12 34 56 72', mail: 'daan@cloveruitzendbureau.nl' },
  { id: 'saskia', naam: 'Saskia de Wit',   rol: 'Intercedent Zorg & Kantoor',    tel: '+31 6 12 34 56 73', mail: 'saskia@cloveruitzendbureau.nl' },
  { id: 'joris',  naam: 'Joris Bakker',    rol: 'Accountmanager Opdrachtgevers', tel: '+31 6 12 34 56 74', mail: 'joris@cloveruitzendbureau.nl' }
];

const DIENSTVERBANDEN = ['Fulltime', 'Parttime', 'Bijbaan'];
const CONTRACTVORMEN  = ['Uitzenden', 'Detachering', 'Werving & selectie', 'Tijdelijk werk'];
const OPLEIDINGEN     = ['Geen diploma nodig', 'VMBO / MBO 1-2', 'MBO 3-4', 'HBO / WO'];
const PROVINCIES      = ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant', 'Gelderland', 'Flevoland'];

/* uurloon in euro's; dagen = hoeveel dagen geleden geplaatst */
const VACATURES = [
  {
    id: 'v-1001', titel: 'Servicemonteur Installatietechniek', sector: 'techniek',
    plaats: 'Almere', provincie: 'Flevoland', dienstverband: 'Fulltime', uren: 38,
    contract: 'Werving & selectie', opleiding: 'MBO 3-4', min: 19.50, max: 26.00,
    dagen: 1, spoed: true, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Landelijk installatiebedrijf (700+ medewerkers)',
    intro: 'Jij rijdt met je eigen servicebus door Flevoland en lost storingen op bij scholen, kantoren en zorginstellingen. Geen dag hetzelfde, en je klant is altijd blij als jij weer wegrijdt.',
    taken: ['Storingen verhelpen aan cv-, koel- en luchtbehandelingsinstallaties', 'Preventief onderhoud volgens onderhoudscontract', 'Klanten uitleggen wat er aan de hand is — in gewone taal', 'Je werk afmelden in de servicetool op je tablet'],
    vraag: ['Een afgeronde mbo-opleiding werktuigbouw, installatietechniek of vergelijkbaar', 'Minimaal 2 jaar ervaring als servicemonteur', 'Rijbewijs B en een VCA-certificaat (of bereid dit te halen)', 'Je werkt zelfstandig en communiceert makkelijk'],
    bieden: ['Direct een contract bij de opdrachtgever', 'Eigen servicebus, telefoon en gereedschap', '27 vakantiedagen + 13 ADV-dagen', 'Opleidingsbudget van € 1.500 per jaar']
  },
  {
    id: 'v-1002', titel: 'Heftruckchauffeur (reachtruck)', sector: 'logistiek',
    plaats: 'Tilburg', provincie: 'Noord-Brabant', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'Geen diploma nodig', min: 14.80, max: 17.25,
    dagen: 2, spoed: true, rijbewijs: false, ploegen: true, recruiter: 'daan',
    bedrijf: 'Groot e-commerce distributiecentrum',
    intro: 'In een gloednieuw distributiecentrum van 40.000 m² zorg jij dat alles op de juiste plek staat. Werken in 2-ploegendienst, met een flinke ploegentoeslag bovenop je uurloon.',
    taken: ['Pallets in- en uitslaan met de reachtruck', 'Voorraad controleren en boeken in het WMS', 'Vrachtwagens laden en lossen', 'Meedenken over een veiligere en snellere routing'],
    vraag: ['Geldig reachtruckcertificaat', 'Je spreekt Nederlands, Engels of Pools', 'Beschikbaar voor 2-ploegendienst (06:00-14:30 / 14:30-23:00)', 'Je werkt netjes en veilig'],
    bieden: ['€ 14,80 - € 17,25 per uur + 14% ploegentoeslag', 'Reiskostenvergoeding vanaf 10 km', 'Uitzicht op een vast contract na 6 maanden', 'Gratis herhaling van je certificaten']
  },
  {
    id: 'v-1003', titel: 'Verzorgende IG — wijkteam', sector: 'zorg',
    plaats: 'Utrecht', provincie: 'Utrecht', dienstverband: 'Parttime', uren: 28,
    contract: 'Detachering', opleiding: 'MBO 3-4', min: 18.20, max: 23.40,
    dagen: 3, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Thuiszorgorganisatie in Utrecht-West',
    intro: 'Jij kent je cliënten bij naam, weet hoe ze hun koffie drinken en ziet meteen als er iets niet klopt. Een klein, vast wijkteam waarin je écht tijd krijgt voor mensen.',
    taken: ['Persoonlijke verzorging en verpleegtechnische handelingen', 'Signaleren en rapporteren in het ECD', 'Contact met familie, huisarts en het wijkteam', 'Nieuwe collega’s inwerken'],
    vraag: ['Diploma Verzorgende IG en een geldige BIG-registratie', 'Rijbewijs B (of je fietst graag door de stad)', 'Beschikbaar voor ochtend- en avonddiensten', 'Je blijft rustig als het druk wordt'],
    bieden: ['Salaris volgens cao VVT, FWG 35', 'Zelf je rooster indelen per periode van 4 weken', 'Vaste wijk, vaste cliënten', 'Vergoeding voor je BIG-herregistratie']
  },
  {
    id: 'v-1004', titel: 'Timmerman nieuwbouw', sector: 'bouw',
    plaats: 'Zoetermeer', provincie: 'Zuid-Holland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 20.00, max: 27.50,
    dagen: 4, spoed: true, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Bouwbedrijf, project van 180 woningen',
    intro: 'Een project waar je de komende twee jaar zoet mee bent: 180 woningen van fundering tot oplevering. Vast team, vaste bouwplaats, geen gereis door het hele land.',
    taken: ['Kozijnen, binnenwanden en dakconstructies stellen en afmonteren', 'Werken volgens tekening en planning', 'Kwaliteitscontrole voor de oplevering', 'Leerlingen begeleiden op de bouwplaats'],
    vraag: ['Ervaring als timmerman in de nieuwbouw', 'VCA-basis', 'Eigen handgereedschap en rijbewijs B', 'Je levert strak werk af'],
    bieden: ['Uurloon volgens cao Bouw & Infra, periodiek 4 of hoger', 'Reisuren betaald vanaf de werkplaats', 'Werkkleding en PBM’s van ons', 'Twee jaar werkzekerheid op één project']
  },
  {
    id: 'v-1005', titel: 'Productiemedewerker voedingsmiddelen', sector: 'productie',
    plaats: 'Zaandam', provincie: 'Noord-Holland', dienstverband: 'Fulltime', uren: 36,
    contract: 'Uitzenden', opleiding: 'Geen diploma nodig', min: 14.20, max: 16.10,
    dagen: 1, spoed: false, rijbewijs: false, ploegen: true, recruiter: 'daan',
    bedrijf: 'Producent van koek en banket',
    intro: 'Het ruikt er elke dag naar versgebakken koek. Jij houdt de lijn draaiend, controleert de kwaliteit en zorgt dat er niets misgaat.',
    taken: ['Machines aan de productielijn bedienen en bijvullen', 'Steekproeven doen op gewicht en verpakking', 'Lijnwissels uitvoeren', 'Je werkplek schoon en HACCP-proof houden'],
    vraag: ['Geen ervaring nodig — wij leren het je aan', 'Beschikbaar voor 3-ploegendienst', 'Je kunt goed staand werk aan', 'Nederlands of Engels op basisniveau'],
    bieden: ['€ 14,20 per uur + tot 30% ploegentoeslag', 'Betaalde inwerkperiode van 2 weken', 'Gratis vervoer vanaf station Zaandam', 'Bij goed functioneren contract bij de opdrachtgever']
  },
  {
    id: 'v-1006', titel: 'Medewerker klantenservice (hybride)', sector: 'kantoor',
    plaats: 'Amersfoort', provincie: 'Utrecht', dienstverband: 'Parttime', uren: 24,
    contract: 'Detachering', opleiding: 'MBO 3-4', min: 15.75, max: 18.50,
    dagen: 5, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Energieleverancier met 400.000 klanten',
    intro: 'Mensen bellen je met een vraag over hun rekening en hangen op met het gevoel dat het geregeld is. Twee dagen op kantoor, de rest vanuit huis.',
    taken: ['Vragen per telefoon, mail en chat beantwoorden', 'Meterstanden, verhuizingen en betalingsregelingen verwerken', 'Klachten oplossen zonder door te verbinden', 'Verbeterpunten doorgeven aan het team'],
    vraag: ['Mbo 4 werk- en denkniveau', 'Uitstekende beheersing van het Nederlands', 'Je blijft vriendelijk, ook bij een boze klant', 'Minimaal 3 dagen per week beschikbaar'],
    bieden: ['Volledig betaalde inwerktraining van 3 weken', 'Thuiswerkvergoeding en laptop', 'Doorgroeien naar specialist of teamcoach', 'Reiskosten volledig vergoed']
  },
  {
    id: 'v-1007', titel: 'Elektromonteur woningbouw', sector: 'techniek',
    plaats: 'Breda', provincie: 'Noord-Brabant', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'MBO 3-4', min: 18.00, max: 24.00,
    dagen: 6, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Regionaal elektrotechnisch installatiebedrijf',
    intro: 'Van ruwbouw tot oplevering: jij legt de complete elektrotechnische installatie aan in nieuwbouwwoningen rond Breda.',
    taken: ['Leidingwerk en bedrading aanleggen volgens tekening', 'Groepenkasten opbouwen en aansluiten', 'Installaties testen en meetrapporten opstellen', 'Opleverpunten afhandelen'],
    vraag: ['Mbo niveau 3 of 4 elektrotechniek', 'Ervaring in de woningbouw is een pré', 'VCA en rijbewijs B', 'Je bent nauwkeurig en werkt veilig'],
    bieden: ['Marktconform uurloon en reiskostenvergoeding', 'Werk in de regio — ’s avonds gewoon thuis', 'Cursussen NEN 1010 en NEN 3140', 'Doorgroeien naar hoofdmonteur']
  },
  {
    id: 'v-1008', titel: 'Orderpicker met voice-picking', sector: 'logistiek',
    plaats: 'Ridderkerk', provincie: 'Zuid-Holland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'Geen diploma nodig', min: 13.90, max: 15.40,
    dagen: 2, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'daan',
    bedrijf: 'Landelijke groothandel in verse producten',
    intro: 'Met een headset op loop je door het vriesmagazijn en verzamel je bestellingen voor supermarkten. Stevig werk, maar je dag vliegt voorbij.',
    taken: ['Orders verzamelen via voice-picking', 'Pallets stapelen en wikkelen', 'Producten controleren op houdbaarheid', 'Rolcontainers klaarzetten voor transport'],
    vraag: ['Je kunt goed tempo maken', 'Je vindt werken in de koeling (2-7 °C) geen probleem', 'Nederlands, Engels of Pools', 'Beschikbaar voor minimaal 4 dagen per week'],
    bieden: ['Warme werkkleding van de zaak', 'Wekelijkse uitbetaling', 'Gratis parkeren op het terrein', 'Prestatiebonus bij hoge pickscore']
  },
  {
    id: 'v-1009', titel: 'Financieel administratief medewerker', sector: 'kantoor',
    plaats: 'Den Haag', provincie: 'Zuid-Holland', dienstverband: 'Fulltime', uren: 32,
    contract: 'Werving & selectie', opleiding: 'HBO / WO', min: 19.00, max: 25.00,
    dagen: 8, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Advieskantoor in het centrum van Den Haag',
    intro: 'Jij houdt de financiële administratie strak en sluit de maand af zonder losse eindjes. Klein team, korte lijnen, geen hiërarchie.',
    taken: ['Debiteuren- en crediteurenbeheer', 'Bankmutaties en tussenrekeningen verwerken', 'Voorbereiden van de btw-aangifte', 'Maandafsluiting en rapportages'],
    vraag: ['Hbo-opleiding bedrijfseconomie of vergelijkbaar', 'Ervaring met Exact Online of AFAS', 'Je werkt gestructureerd en zelfstandig', '32 tot 40 uur beschikbaar'],
    bieden: ['Direct een vast contract', '8% vakantiegeld + winstdeling', 'Kantoor op 5 minuten van Den Haag Centraal', 'Studiekostenregeling voor je PDB of MBA']
  },
  {
    id: 'v-1010', titel: 'Medewerker bediening — hotel', sector: 'horeca',
    plaats: 'Amsterdam', provincie: 'Noord-Holland', dienstverband: 'Bijbaan', uren: 16,
    contract: 'Tijdelijk werk', opleiding: 'Geen diploma nodig', min: 14.00, max: 16.50,
    dagen: 1, spoed: true, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Viersterrenhotel aan de Zuidas',
    intro: 'Ontbijt, lunch en de borrel erna. Jij zorgt dat gasten met een goed gevoel de deur uitlopen — en je kiest zelf welke diensten je oppakt.',
    taken: ['Gasten ontvangen en bedienen in het restaurant', 'Ontbijtbuffet aanvullen en presenteren', 'Bestellingen opnemen en afrekenen', 'Mise en place voor de volgende dienst'],
    vraag: ['Je bent minimaal 18 jaar', 'Nederlands en Engels', 'Je hebt een gastvrije, open houding', 'Beschikbaar in het weekend'],
    bieden: ['Zelf je diensten kiezen in de app', 'Personeelskorting op overnachtingen', 'Gratis maaltijd tijdens je dienst', 'Wekelijkse uitbetaling']
  },
  {
    id: 'v-1011', titel: 'Werkvoorbereider Infra', sector: 'bouw',
    plaats: 'Nijmegen', provincie: 'Gelderland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Werving & selectie', opleiding: 'HBO / WO', min: 26.00, max: 34.00,
    dagen: 9, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'joris',
    bedrijf: 'Aannemer in grond-, weg- en waterbouw',
    intro: 'Jij bedenkt hoe een project gebouwd wordt vóórdat de eerste schop de grond in gaat. Van kabels en leidingen tot planning en inkoop.',
    taken: ['Uitwerken van bestek en tekeningen naar een uitvoeringsplan', 'Materiaal- en materieelstaten opstellen', 'Onderaannemers aanvragen en vergelijken', 'Afstemmen met uitvoerder en projectleider'],
    vraag: ['Hbo Civiele Techniek of vergelijkbaar door ervaring', 'Ervaring met infraprojecten (riolering, wegen, kabels & leidingen)', 'Je werkt met AutoCAD en MS Project', 'Rijbewijs B'],
    bieden: ['Vast contract, salaris tot € 5.400 bruto per maand', 'Auto van de zaak, ook privé', 'Flexibele werktijden en thuiswerkdagen', 'Doorgroei naar projectleider binnen 3 jaar']
  },
  {
    id: 'v-1012', titel: 'Begeleider gehandicaptenzorg', sector: 'zorg',
    plaats: 'Apeldoorn', provincie: 'Gelderland', dienstverband: 'Parttime', uren: 24,
    contract: 'Detachering', opleiding: 'MBO 3-4', min: 17.40, max: 22.10,
    dagen: 11, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Woonlocatie met 18 bewoners',
    intro: 'Samen koken, samen naar de dagbesteding, samen lachen om dezelfde grap. Jij begeleidt volwassenen met een verstandelijke beperking in hun eigen huis.',
    taken: ['Begeleiden bij dagelijkse activiteiten en persoonlijke verzorging', 'Werken volgens het ondersteuningsplan', 'Contact onderhouden met verwanten', 'Signaleren van veranderingen in gedrag'],
    vraag: ['Mbo niveau 3 of 4 in een zorg- of welzijnsrichting', 'Ervaring met LVB-doelgroep is een pré', 'Beschikbaar voor dag- en avonddiensten', 'Je bent geduldig en houdt van structuur'],
    bieden: ['Cao Gehandicaptenzorg, FWG 40', 'Vaste woongroep, geen invalwerk', 'Scholing op het gebied van agressieregulatie', 'Onregelmatigheidstoeslag tot 44%']
  },
  {
    id: 'v-1013', titel: 'Operator verpakkingslijn', sector: 'productie',
    plaats: 'Bergen op Zoom', provincie: 'Noord-Brabant', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 16.50, max: 19.80,
    dagen: 7, spoed: false, rijbewijs: true, ploegen: true, recruiter: 'daan',
    bedrijf: 'Internationale chemieproducent',
    intro: 'Jij bent verantwoordelijk voor een volledige verpakkingslijn: instellen, draaiend houden en storingen oplossen voordat ze stilstand veroorzaken.',
    taken: ['Lijn instellen bij productwissels', 'Eerstelijns storingen verhelpen', 'Productieregistratie bijhouden', 'Kwaliteitscontroles uitvoeren'],
    vraag: ['Technisch inzicht, mbo werk- en denkniveau', 'Ervaring als operator in de procesindustrie', 'Beschikbaar voor 5-ploegendienst', 'VCA-basis'],
    bieden: ['Uurloon + 28% ploegentoeslag', 'Vast rooster, ruim van tevoren bekend', 'Interne opleiding tot allround operator', 'Uitzicht op een vast dienstverband']
  },
  {
    id: 'v-1014', titel: 'Schoonmaakmedewerker kantoorpanden', sector: 'schoonmaak',
    plaats: 'Rotterdam', provincie: 'Zuid-Holland', dienstverband: 'Parttime', uren: 20,
    contract: 'Uitzenden', opleiding: 'Geen diploma nodig', min: 14.10, max: 15.60,
    dagen: 3, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'daan',
    bedrijf: 'Facilitair dienstverlener in de Rotterdamse haven',
    intro: 'Vaste panden, vaste tijden, vaste collega’s. Je start om 06:00 en bent om 10:00 klaar — de rest van de dag is van jou.',
    taken: ['Kantoren, vergaderruimtes en sanitair schoonmaken', 'Werken volgens het schoonmaakprogramma', 'Voorraad aanvullen', 'Bijzonderheden melden bij de objectleider'],
    vraag: ['Je bent betrouwbaar en op tijd', 'Nederlands of Engels op basisniveau', 'Beschikbaar op werkdagen tussen 06:00 en 10:00', 'Geen ervaring nodig'],
    bieden: ['Cao Schoonmaak met eindejaarsuitkering', 'Werk dicht bij huis', 'Betaalde inwerktijd', 'Doorgroeien naar voorman of objectleider']
  },
  {
    id: 'v-1015', titel: 'Monteur zonnepanelen', sector: 'techniek',
    plaats: 'Lelystad', provincie: 'Flevoland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 16.00, max: 21.00,
    dagen: 5, spoed: true, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Installateur van duurzame energie-installaties',
    intro: 'Elke dag een ander dak, elke dag een huishouden dat van het gas af gaat. Werk waarvan je aan het eind van de dag ziet wat je gedaan hebt.',
    taken: ['Montagesystemen en panelen plaatsen op schuine en platte daken', 'Omvormers aansluiten en installaties testen', 'Bekabeling wegwerken tot in de meterkast', 'Klanten uitleg geven over de app'],
    vraag: ['Technische handigheid — ervaring is mooi, geen must', 'Geen hoogtevrees', 'Rijbewijs B', 'VCA (of bereid dit te halen op onze kosten)'],
    bieden: ['Betaalde opleiding tot gecertificeerd PV-monteur', 'Werken in vaste duo’s', 'Reisuren vanaf de loods vergoed', 'Doorgroei naar eerste monteur binnen een jaar']
  },
  {
    id: 'v-1016', titel: 'Vrachtwagenchauffeur CE distributie', sector: 'logistiek',
    plaats: 'Eindhoven', provincie: 'Noord-Brabant', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 17.20, max: 20.90,
    dagen: 12, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'daan',
    bedrijf: 'Distributeur voor bouwmarkten in Zuid-Nederland',
    intro: 'Dagritten door Brabant en Limburg, ’s avonds gewoon thuis aan tafel. Vaste wagen, vaste klanten, geen weekendwerk.',
    taken: ['Distributieritten rijden met een trekker-oplegger', 'Laden en lossen met meeneemheftruck', 'Vrachtdocumenten controleren', 'Dagelijkse controle van je wagen'],
    vraag: ['Rijbewijs CE, code 95 en digitale bestuurderskaart', 'Ervaring met meeneemheftruck (certificaat)', 'Je kunt goed plannen en bent klantvriendelijk', 'Beschikbaar voor vroege starttijden (05:30)'],
    bieden: ['Cao Beroepsgoederenvervoer + toeslagen', 'Vaste wagen die je mee naar huis mag nemen', 'Geen weekend- of nachtritten', 'Vergoeding voor verlenging van je code 95']
  },
  {
    id: 'v-1017', titel: 'Assistent-uitvoerder utiliteitsbouw', sector: 'bouw',
    plaats: 'Haarlem', provincie: 'Noord-Holland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Detachering', opleiding: 'MBO 3-4', min: 22.00, max: 28.00,
    dagen: 14, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'joris',
    bedrijf: 'Bouwbedrijf gespecialiseerd in scholen en zorgvastgoed',
    intro: 'Je loopt over de bouwplaats, kent iedere onderaannemer bij naam en houdt de planning in je hoofd. De uitvoerder leunt op jou.',
    taken: ['Dagelijkse aansturing van onderaannemers', 'Bewaken van planning, kwaliteit en veiligheid', 'Materiaal bestellen en afroepen', 'Bouwvergaderingen voorbereiden'],
    vraag: ['Mbo 4 Bouwkunde of ervaring als voorman', 'VCA-VOL', 'Je durft mensen aan te spreken', 'Rijbewijs B'],
    bieden: ['Detachering met uitzicht op een vast contract', 'Bedrijfsauto en telefoon', 'Begeleiding richting de rol van uitvoerder', 'Opleidingsbudget voor VCA-VOL en BHV']
  },
  {
    id: 'v-1018', titel: 'Keukenhulp zorginstelling', sector: 'horeca',
    plaats: 'Zwijndrecht', provincie: 'Zuid-Holland', dienstverband: 'Parttime', uren: 20,
    contract: 'Uitzenden', opleiding: 'Geen diploma nodig', min: 13.70, max: 15.20,
    dagen: 4, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Woonzorgcentrum met 120 bewoners',
    intro: 'Je maakt maaltijden klaar voor mensen die de hele dag naar dat ene moment uitkijken. Rustig tempo, warm team, geen avonddiensten.',
    taken: ['Maaltijdcomponenten voorbereiden en uitserveren', 'Afwas en keukenhygiëne volgens HACCP', 'Dieetwensen bijhouden', 'Koffie- en theerondes verzorgen'],
    vraag: ['Je houdt van aanpakken', 'Nederlands op gespreksniveau', 'Beschikbaar tussen 10:00 en 15:00', 'Een VOG (wij regelen en betalen die)'],
    bieden: ['Werk met vaste dagen en tijden', 'Gratis warme maaltijd', 'Cao-loon met vakantiegeld', 'Een team dat elkaar echt kent']
  },
  {
    id: 'v-1019', titel: 'Hovenier onderhoud', sector: 'schoonmaak',
    plaats: 'Amersfoort', provincie: 'Utrecht', dienstverband: 'Fulltime', uren: 38,
    contract: 'Werving & selectie', opleiding: 'VMBO / MBO 1-2', min: 16.80, max: 21.50,
    dagen: 16, spoed: false, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Hoveniersbedrijf met particuliere en zakelijke klanten',
    intro: 'Buiten werken met je handen in de aarde, en elk seizoen iets anders. Van snoeien in het najaar tot beplanting in het voorjaar.',
    taken: ['Onderhoud van tuinen en groenvoorzieningen', 'Snoeien, maaien en beplanten', 'Bedienen van machines en gereedschap', 'Klantcontact op locatie'],
    vraag: ['Opleiding of ervaring in hovenierswerk', 'Rijbewijs B (BE is een pré)', 'Je vindt het geen probleem om buiten te werken', 'Oog voor detail'],
    bieden: ['Direct in dienst bij de opdrachtgever', 'Cao Hoveniers met goede toeslagen', 'Cursussen motorkettingzaag en gewasbescherming', 'Winterwerk gegarandeerd']
  },
  {
    id: 'v-1020', titel: 'Magazijnmedewerker bijbaan', sector: 'logistiek',
    plaats: 'Almere', provincie: 'Flevoland', dienstverband: 'Bijbaan', uren: 12,
    contract: 'Tijdelijk werk', opleiding: 'Geen diploma nodig', min: 13.00, max: 14.50,
    dagen: 2, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'daan',
    bedrijf: 'Webshop in sportartikelen',
    intro: 'Perfect naast je studie: je werkt op zaterdag en één avond in de week, en je kunt met het ov zo voor de deur staan.',
    taken: ['Bestellingen inpakken en verzendklaar maken', 'Retouren controleren en terugboeken', 'Magazijn opgeruimd houden', 'Voorraad aanvullen in de stellingen'],
    vraag: ['Je bent minimaal 16 jaar', 'Beschikbaar op zaterdag', 'Je werkt netjes en nauwkeurig', 'Geen ervaring nodig'],
    bieden: ['Flexibele uren rond je rooster', 'Personeelskorting op het assortiment', 'Gezellig jong team', 'Doorwerken in de vakanties mogelijk']
  },
  {
    id: 'v-1021', titel: 'CNC-verspaner (draaien & frezen)', sector: 'techniek',
    plaats: 'Helmond', provincie: 'Noord-Brabant', dienstverband: 'Fulltime', uren: 40,
    contract: 'Werving & selectie', opleiding: 'MBO 3-4', min: 21.00, max: 29.00,
    dagen: 10, spoed: true, rijbewijs: true, ploegen: true, recruiter: 'nadia',
    bedrijf: 'Toeleverancier voor de high-tech maakindustrie',
    intro: 'Toleranties van honderdsten, machines van de bovenste plank en collega’s die net zo veel van techniek houden als jij.',
    taken: ['CNC-draai- en freesbanken instellen en programmeren (Fanuc/Heidenhain)', 'Werkstukken meten en documenteren', 'Meedenken over de bewerkingsvolgorde', 'Kleine series en enkelstuks maken'],
    vraag: ['Mbo 3/4 verspaningstechniek', 'Minimaal 3 jaar ervaring met CNC', 'Je kunt technische tekeningen lezen', 'Bereid tot 2-ploegendienst'],
    bieden: ['Salaris tot € 4.600 bruto per maand', 'Vast contract vanaf dag één', 'Moderne machinepark en klimaatbeheerste hal', 'Opleidingsbudget en interne trainingen']
  },
  {
    id: 'v-1022', titel: 'HR-medewerker (tijdelijk, 6 maanden)', sector: 'kantoor',
    plaats: 'Utrecht', provincie: 'Utrecht', dienstverband: 'Parttime', uren: 28,
    contract: 'Tijdelijk werk', opleiding: 'HBO / WO', min: 20.00, max: 24.50,
    dagen: 13, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Onderwijsinstelling met 900 medewerkers',
    intro: 'Zes maanden lang het aanspreekpunt voor alles rond contracten, verzuim en instroom. Een mooie kans om een grote HR-afdeling van binnen te zien.',
    taken: ['Arbeidsovereenkomsten opstellen en muteren', 'Verzuimregistratie bijhouden en Arbo-afspraken plannen', 'Vragen van medewerkers beantwoorden', 'Onboarding van nieuwe collega’s verzorgen'],
    vraag: ['Hbo-opleiding HRM of vergelijkbaar', 'Ervaring met AFAS Profit', 'Je bent discreet en accuraat', 'Beschikbaar per direct'],
    bieden: ['Cao MBO, schaal 7', 'Kans op verlenging of een vaste rol', 'Reiskosten en thuiswerkvergoeding', 'Werkplek op 10 minuten van Utrecht CS']
  },
  {
    id: 'v-1023', titel: 'Lasser MIG/MAG', sector: 'productie',
    plaats: 'Dordrecht', provincie: 'Zuid-Holland', dienstverband: 'Fulltime', uren: 40,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 19.00, max: 25.50,
    dagen: 6, spoed: true, rijbewijs: true, ploegen: false, recruiter: 'nadia',
    bedrijf: 'Constructiebedrijf voor de scheepsbouw',
    intro: 'Zware constructies voor binnenvaartschepen. Als jouw las goed is, houdt hij het dertig jaar vol — dat weet je, en daar ben je trots op.',
    taken: ['MIG/MAG lassen van plaat- en buismateriaal', 'Werken volgens lasmethodebeschrijving (WPS)', 'Constructies uitvouwen en passen', 'Eigen werk visueel controleren'],
    vraag: ['Aantoonbare laservaring MIG/MAG', 'Lascertificaat is een pré, anders leg je een lasproef af', 'Tekeninglezen', 'VCA-basis en rijbewijs B'],
    bieden: ['Uurloon tot € 25,50 bij bewezen kwaliteit', 'Wij betalen je lascertificering', 'Overwerk mogelijk tegen 130%', 'Uitzicht op een vast contract']
  },
  {
    id: 'v-1024', titel: 'Helpende Plus — verpleeghuis', sector: 'zorg',
    plaats: 'Hoofddorp', provincie: 'Noord-Holland', dienstverband: 'Parttime', uren: 20,
    contract: 'Uitzenden', opleiding: 'VMBO / MBO 1-2', min: 15.60, max: 19.30,
    dagen: 15, spoed: false, rijbewijs: false, ploegen: false, recruiter: 'saskia',
    bedrijf: 'Verpleeghuis met een psychogeriatrische afdeling',
    intro: 'Een praatje bij het aankleden, samen de krant doorbladeren, even een arm om iemand heen. Jij maakt de dag van de bewoners.',
    taken: ['Ondersteunen bij wassen, aankleden en eten', 'Huiskamerbegeleiding en activiteiten', 'Observeren en doorgeven aan de verzorgende', 'Zorgen voor een schone, prettige woonomgeving'],
    vraag: ['Diploma Helpende Zorg & Welzijn niveau 2 (of in opleiding)', 'Geduld en een warme houding', 'Beschikbaar in het weekend (1 op 2)', 'VOG'],
    bieden: ['Cao VVT met ORT tot 47%', 'Betaalde doorgroei naar Verzorgende IG', 'Vaste afdeling en vast team', 'Roosterwensen worden echt gehonoreerd']
  }
];

/* ---------------------------------------------------------
   Google-beoordelingen
   In productie komen score, aantal en de losse reviews live
   binnen via de Google Places API (Place Details → rating,
   user_ratings_total, reviews) of via een widgetdienst.
   Onderstaande waarden zijn voorbeelddata.
   --------------------------------------------------------- */

const GOOGLE = {
  score: 4.8,
  aantal: 137,
  url: 'https://www.google.com/maps',
  /* verdeling van 5 sterren naar 1 ster */
  verdeling: [112, 18, 4, 2, 1]
};

const REVIEWS_WERKZOEKEND = [
  { quote: 'Maandag gebeld, woensdag kennismaken, maandag erna begonnen. En ze belden daarna nog om te vragen hoe het ging.', naam: 'Youssef Bakkali', rol: 'Heftruckchauffeur, Tilburg', ster: 5, datum: '2 weken geleden' },
  { quote: 'Eindelijk een bureau dat niet alleen zegt “ik bel je terug”, maar het ook doet. Mijn contactpersoon kende de werkvloer echt.', naam: 'Linda Hoekstra', rol: 'Verzorgende IG, Utrecht', ster: 5, datum: 'een maand geleden' },
  { quote: 'Ik zocht iets naast mijn studie. Binnen tien minuten gefilterd op bijbaan en avonddiensten, en via WhatsApp gesolliciteerd.', naam: 'Tim Wolters', rol: 'Magazijnmedewerker, Almere', ster: 5, datum: '3 weken geleden' }
];

const REVIEWS_WERKGEVER = [
  { quote: 'Binnen 48 uur drie kandidaten op gesprek, waarvan er twee zijn gebleven. Clover snapt onze productieomgeving.', naam: 'Marjolein Brouwer', rol: 'Productiemanager, voedingsmiddelenindustrie', ster: 5, datum: '1 maand geleden' },
  { quote: 'We werken met een vaste pool via Clover. Geen onverwachte facturen, altijd NEN 4400-1 in orde, en ze denken mee over de planning.', naam: 'Erik Vermeulen', rol: 'Operationeel directeur, logistiek dienstverlener', ster: 5, datum: '2 maanden geleden' },
  { quote: 'De accountmanager kwam eerst een dag meelopen op de bouwplaats. Daarna waren de voorgestelde vakmensen ook echt raak.', naam: 'Sandra Kok', rol: 'Hoofd bedrijfsbureau, aannemersbedrijf', ster: 4, datum: '3 maanden geleden' }
];

const KEURMERKEN = [
  { naam: 'ABU', sub: 'Lid brancheorganisatie' },
  { naam: 'SNA', sub: 'NEN 4400-1 gecertificeerd' },
  { naam: 'VCU', sub: 'Veilig uitzenden' },
  { naam: 'SFU', sub: 'Stichting Fonds Uitzendbranche' },
  { naam: 'AVG', sub: 'Privacy op orde' }
];

const FAQ_WERKGEVER = [
  { v: 'Hoe snel kunnen jullie iemand leveren?', a: 'Voor logistiek, productie en schoonmaak leveren we doorgaans binnen 48 uur de eerste kandidaten. Voor technische en specialistische functies rekenen we op 3 tot 10 werkdagen, omdat we dan gericht werven in plaats van een cv doorsturen.' },
  { v: 'Wat kost uitzenden bij Clover?', a: 'We werken met een transparante omrekenfactor op het cao-loon van de inlener. Die factor staat in de offerte en verandert niet tussentijds. Geen verborgen kosten voor werving, screening of certificaten.' },
  { v: 'Hoe zit het met de inlenersbeloning?', a: 'Iedere uitzendkracht krijgt vanaf dag één dezelfde beloning als uw eigen medewerkers in een vergelijkbare functie: loon, toeslagen, reiskosten en periodieken. We controleren dit bij aanvang en bij iedere cao-wijziging.' },
  { v: 'Zijn jullie NEN 4400-1 gecertificeerd?', a: 'Ja. Clover staat in het register van de Stichting Normering Arbeid (SNA) en wordt halfjaarlijks getoetst. Daarmee beperkt u uw inleners- en ketenaansprakelijkheid. We werken desgewenst met een G-rekening.' },
  { v: 'Kunnen we een uitzendkracht overnemen?', a: 'Zeker. Na 1.040 gewerkte uren neemt u de medewerker kosteloos over. Wilt u eerder overnemen, dan geldt een aflopende vergoeding die we vooraf vastleggen.' },
  { v: 'Werken jullie ook buiten jullie eigen regio?', a: 'Onze kracht zit in de regio’s waar we zelf op de werkvloer komen. Daarbuiten kijken we per aanvraag of we die belofte waar kunnen maken — zo niet, dan zeggen we dat eerlijk.' }
];

const FAQ_WERKZOEKEND = [
  { v: 'Moet ik een cv hebben om te solliciteren?', a: 'Nee. Je kunt solliciteren met alleen je naam en telefoonnummer. We bellen je en maken samen een profiel. Heb je wel een cv, dan kun je die uploaden — dat versnelt het.' },
  { v: 'Wanneer krijg ik betaald?', a: 'Je uren gaan op zondag de deur uit en staan uiterlijk vrijdag op je rekening. Je ziet je gewerkte uren en loonstroken altijd terug in de Clover-app.' },
  { v: 'Bouw ik vakantiedagen en pensioen op?', a: 'Ja. Je bouwt vakantiegeld, vakantiedagen en — na 8 gewerkte weken — pensioen op volgens de ABU-cao. Alles staat op je loonstrook gespecificeerd.' },
  { v: 'Ik spreek nog niet goed Nederlands. Kan ik toch aan de slag?', a: 'Bij veel functies in logistiek, productie en schoonmaak is Engels of Pools voldoende. Filter in de vacaturebank op “Geen diploma nodig” en bel ons gerust — we spreken je taal vaak ook.' },
  { v: 'Wat als het werk toch niet bevalt?', a: 'Dan bellen we de opdrachtgever en zoeken we samen iets anders. Je zit nergens aan vast, en we vinden het belangrijker dat je op de juiste plek zit dan dat een plaatsing doorloopt.' }
];

const STAPPEN_WERKZOEKEND = [
  { t: 'Vind je vacature', d: 'Filter op sector, plaats en uren. Zie je niets? Maak een jobalert aan — dan mail je ons niet, maar mailen wij jou.' },
  { t: 'Solliciteer in 1 minuut', d: 'Naam, telefoonnummer en klaar. Een cv mag, maar hoeft niet. Liever appen? Dat kan ook.' },
  { t: 'Bellen binnen 1 werkdag', d: 'Je krijgt een vaste contactpersoon aan de lijn die de werkvloer kent. Geen callcenter.' },
  { t: 'Kennismaken bij de werkgever', d: 'Wij regelen de afspraak en bereiden je voor. Je weet vooraf wie je spreekt en wat ze vragen.' },
  { t: 'Starten — en contact houden', d: 'Contract digitaal ondertekend, uren in de app, wekelijks betaald. Na week één bellen we hoe het gaat.' }
];

const STAPPEN_WERKGEVER = [
  { t: 'Aanvraag in 2 minuten', d: 'Vul het formulier in of bel. We vragen door op wat de functie écht nodig heeft, niet alleen op het functieprofiel.' },
  { t: 'Wij komen langs', d: 'Voor een nieuwe samenwerking lopen we een dagdeel mee op de werkvloer. Zo weten we wie er past — en wie niet.' },
  { t: 'Voorselectie met motivatie', d: 'U ontvangt maximaal 3 kandidaten, met een korte toelichting waarom juist zij. Geen cv-bombardement.' },
  { t: 'Kennismaken en starten', d: 'Wij plannen de gesprekken, regelen ID-check, VCA, contract en verzekering. U tekent digitaal.' },
  { t: 'Nazorg en rapportage', d: 'Wekelijkse urenregistratie, maandelijkse evaluatie en één vast aanspreekpunt dat u herkent aan de telefoon.' }
];

const DIENSTEN = [
  { titel: 'Uitzenden', kleur: '#1B7F58', zacht: '#E2EFE9', icoon: 'mensen',
    tekst: 'Flexibele capaciteit voor pieken, ziekte en seizoenswerk. U betaalt alleen de gewerkte uren, wij nemen het werkgeverschap volledig over.',
    punten: ['Binnen 48 uur kandidaten', 'Geen risico bij ziekte', 'Kosteloos overnemen na 1.040 uur'] },
  { titel: 'Detachering', kleur: '#24466B', zacht: '#E4EAF1', icoon: 'koffer',
    tekst: 'Een vakkracht voor een langere periode of een concreet project, in dienst bij Clover. Vaste kosten per uur, vaste zekerheid voor de medewerker.',
    punten: ['Voor 6 maanden tot 3 jaar', 'Vast contract voor de medewerker', 'Eén vaste contactpersoon'] },
  { titel: 'Werving & selectie', kleur: '#8A4B1E', zacht: '#F3EAE1', icoon: 'kompas',
    tekst: 'Wij werven, screenen en dragen voor — u neemt direct zelf in dienst. Eenmalige fee, no cure no pay, en drie maanden garantie.',
    punten: ['No cure, no pay', 'Maximaal 3 kandidaten', '3 maanden nazorggarantie'] },
  { titel: 'Payroll & ZZP-bemiddeling', kleur: '#3F3A6B', zacht: '#E9E7F0', icoon: 'document',
    tekst: 'Heeft u zelf iemand gevonden? Wij nemen het juridisch werkgeverschap of de zzp-toetsing (DBA) voor onze rekening.',
    punten: ['Modelovereenkomsten DBA-proof', 'Volledige loonadministratie', 'Wekelijkse verloning'] }
];

const CIJFERS = [
  { getal: 1250, achter: '+', label: 'plaatsingen per jaar' },
  { getal: 96,   achter: '%', label: 'van onze kandidaten maakt de opdracht af' },
  { getal: 48,   achter: ' uur', label: 'gemiddeld tot de eerste kandidaat' },
  { getal: 8,    achter: '',  label: 'sectoren waarin we thuis zijn' }
];

const BEDRIJF = {
  naam: 'Clover Uitzendbureau',
  tel: '+31 (0)36 123 45 67',
  telRaw: '+31361234567',
  whatsapp: '+31612345678',
  mail: 'info@cloveruitzendbureau.nl',
  adres: 'Voorbeeldstraat 12',
  postcode: '1315 AB',
  stad: 'Almere',
  kvk: '00000000',
  btw: 'NL000000000B01',
  openingstijden: 'ma t/m vr 08:30 – 17:30'
};
