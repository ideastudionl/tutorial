export type Service = {
  slug: string;
  title: string;
  short: string;
  /** Tarief per m² dat de richtprijs voedt; null = op aanvraag. */
  rate: number | null;
  priceLabel: string;
  /** Het tarief waar we mee adverteren. Slechts één dienst draagt dit. */
  headline?: boolean;
  icon: string;
  usps: string[];
  body: string;
};

export const services: Service[] = [
  {
    slug: 'glad-stucwerk',
    title: 'Wanden stucen',
    short: 'Strak, vlak en behangklaar pleisterwerk voor binnenmuren.',
    rate: 16,
    priceLabel: '€ 16,00 per m²',
    headline: true,
    icon: 'wall',
    usps: ['Vlak en naadloos resultaat', 'Direct over te schilderen of te behangen', 'Geschikt voor nieuwbouw en renovatie'],
    body: `<p>Glad stucwerk is de meest gevraagde afwerking voor binnenmuren. Wij brengen een dunne, egale laag pleister aan die de ondergrond volledig vlak maakt. Het resultaat is een strakke wand zonder zichtbare naden, klaar om te sausen of te behangen.</p>
<h2>Wanneer kies je hiervoor?</h2>
<p>Bij nieuwbouw is glad stucwerk de standaard afwerking op kalkzandsteen of gipsblokken. Bij een renovatie gebruiken we het om oude, beschadigde of ongelijke muren weer als nieuw te maken. Ook wanden waar behang van af is gehaald krijgen er hun strakke uitstraling mee terug.</p>
<h2>Zo gaan we te werk</h2>
<ol>
<li><strong>Voorbereiding.</strong> We beschermen vloeren en kozijnen, verwijderen loszittend materiaal en repareren scheuren.</li>
<li><strong>Voorstrijken.</strong> De ondergrond wordt voorbehandeld zodat de pleister goed hecht en gelijkmatig droogt.</li>
<li><strong>Stucen.</strong> We brengen het pleisterwerk aan en werken het in meerdere gangen vlak af.</li>
<li><strong>Opleveren.</strong> Na droging controleren we het werk en leveren we schoon op.</li>
</ol>
<h2>Behangklaar of sausklaar?</h2>
<p>Behangklaar volstaat wanneer er behang of structuurverf op komt. Kies je voor strak sauswerk of een donkere kleur, dan adviseren we sausklaar: dat vraagt een extra afwerkgang, maar voorkomt dat licht kleine oneffenheden uitvergroot.</p>`,
  },
  {
    slug: 'plafond-stucen',
    title: 'Plafonds stucen',
    short: 'Van gipsplaten of oude schrootjes naar een naadloos, spierwit plafond.',
    rate: 17.5,
    priceLabel: '€ 17,50 per m²',
    icon: 'ceiling',
    usps: ['Naden en schroefgaten volledig weggewerkt', 'Ook over bestaande systeemplafonds', 'Stof- en spatvrij werken'],
    body: `<p>Een plafond valt pas op als het níét strak is. Wij werken plafonds van gipsplaten, beton of oude schrootjes af tot een egaal en naadloos vlak. Schroefgaten, naden en oneffenheden verdwijnen volledig.</p>
<h2>Veelvoorkomende situaties</h2>
<p>Bij nieuwbouw en verbouwingen worden gipsplaten geplaatst die wij afwerken met een gaas- en pleisterlaag. In oudere Amsterdamse woningen treffen we vaak stucplafonds met scheuren of een verlaagd schrootjesplafond aan; die kunnen we herstellen of vervangen door een strak nieuw plafond.</p>
<h2>Sierlijsten en ornamenten</h2>
<p>Werk je aan een pand met karakter? We plaatsen en herstellen ook sierlijsten, rozetten en ornamenten, zodat het originele karakter van de woning behouden blijft.</p>`,
  },
  {
    slug: 'sierpleister-spachtelputz',
    title: 'Sierpleister & spachtelputz',
    short: 'Structuurpleister van kunsthars en steenkorrels: sterk en slijtvast.',
    rate: 21,
    priceLabel: '€ 21,00 per m²',
    icon: 'sparkles',
    usps: ['Zeer slijtvast en stootvast', 'Korrelgrootte naar keuze', 'Geschikt voor binnen en buiten'],
    body: `<p>Spachtelputz is een sierpleister van kunsthars met steenkorrels. De korrelgrootte bepaalt hoe fijn of grof het oppervlak wordt — van een subtiele structuur tot een uitgesproken korrel. Het materiaal hardt zeer sterk uit en is daardoor lastig te beschadigen.</p>
<h2>Waar wordt het toegepast?</h2>
<p>Sierpleister is populair in trappenhuizen, gangen, portieken en bedrijfsruimtes: plekken waar veel langs gelopen wordt en gladde wanden snel beschadigen. Buiten wordt het gebruikt als gevelafwerking, omdat het bestand is tegen weer en wind.</p>
<h2>Kleur en korrel</h2>
<p>Spachtelputz is in vrijwel elke kleur leverbaar en kan direct in kleur worden aangebracht, zodat naschilderen niet nodig is. We laten je vooraf graag proefmonsters zien, zodat je precies weet welke structuur je krijgt.</p>`,
  },
  {
    slug: 'buitengevel-stucen',
    title: 'Buitengevel stucen',
    short: 'Gevelpleister die de woning waterdicht maakt en strak oogt.',
    rate: 45,
    priceLabel: 'op aanvraag',
    icon: 'building',
    usps: ['Waterdichte, ademende afwerking', 'Optioneel met gevelisolatie', 'Verlengt de levensduur van het metselwerk'],
    body: `<p>Een gestuukte gevel beschermt het metselwerk tegen regen en vorst en geeft de woning direct een frissere uitstraling. We werken met ademende systemen die vocht van binnenuit doorlaten, maar regen buitenhouden.</p>
<h2>Drie mogelijkheden</h2>
<ul>
<li><strong>Glad gevelstuc.</strong> Een strakke, moderne uitstraling.</li>
<li><strong>Gestructureerde pleister.</strong> Een korrelstructuur die kleine oneffenheden in het metselwerk verbergt.</li>
<li><strong>Gevelisolatie met stucwerk.</strong> Isolatieplaten op de bestaande gevel, afgewerkt met wapening en sierpleister. Dat verlaagt de stookkosten en verbetert het energielabel.</li>
</ul>
<h2>Voorbereiding is bepalend</h2>
<p>Slecht voegwerk, optrekkend vocht of scheuren in het metselwerk moeten eerst worden aangepakt. Tijdens de opname beoordelen we de gevel en benoemen we eerlijk wat er nodig is voordat er gepleisterd kan worden.</p>`,
  },
  {
    slug: 'betonlook',
    title: 'Betonlook & betonstuc',
    short: 'Naadloze betonciré met levendige wolking, ook in de badkamer.',
    rate: 89,
    priceLabel: '€ 89,00 per m²',
    icon: 'layers',
    usps: ['Volledig naadloos, ook in natte ruimtes', 'Slechts enkele millimeters dik', 'Elk werk is uniek van tekening'],
    body: `<p>Betonstuc — ook wel betonciré of betonlook genoemd — geeft een wand of vloer de rauwe uitstraling van beton, maar dan in een laag van slechts enkele millimeters. Doordat het naadloos wordt aangebracht ontstaat een rustig, doorlopend vlak zonder voegen.</p>
<h2>Populair in badkamers</h2>
<p>Met de juiste opbouw en afdichting is betonstuc uitstekend geschikt voor badkamers en doucheruimtes. Geen voegen betekent geen schimmelrandjes en veel makkelijker schoonmaken.</p>
<h2>Handwerk met karakter</h2>
<p>De wolking in betonstuc ontstaat tijdens het aanbrengen en is bij elk werk anders. We maken vooraf een proefvlak, zodat je precies weet welke tekening en kleur je krijgt.</p>`,
  },
  {
    slug: 'schilderwerk',
    title: 'Schilderwerk binnen & buiten',
    short: 'Kozijnen, deuren, trappen, plafonds en wanden — vakkundig geschilderd.',
    rate: 11.5,
    priceLabel: 'op aanvraag',
    icon: 'brush',
    usps: ['Grondig schuren en plamuren vooraf', 'Duurzame verfsystemen', 'Binnen- en buitenschilderwerk'],
    body: `<p>Omdat wij het stucwerk zelf uitvoeren, kunnen we de wanden en plafonds ook direct afwerken met verf. Eén partij voor het hele traject scheelt afstemming, wachttijd en discussie over wie waar verantwoordelijk voor is.</p>
<h2>Binnenschilderwerk</h2>
<p>Trappen, kozijnen, deuren, plafonds en wanden. We schuren, plamuren en gronden zorgvuldig voordat de aflak erop gaat — daar zit het verschil tussen verf die twee jaar meegaat en verf die tien jaar mooi blijft.</p>
<h2>Buitenschilderwerk</h2>
<p>Buiten werken we met verfsystemen die bestand zijn tegen UV en vocht. Houtrot pakken we aan voordat we schilderen, zodat het probleem niet onder de verf doorwoekert.</p>`,
  },
];

export const headlineRate = services.find((s) => s.headline)?.rate ?? 16;
export const getService = (slug: string) => services.find((s) => s.slug === slug);
