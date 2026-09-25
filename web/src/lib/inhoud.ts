/**
 * Vaste content die (nog) niet in de database staat: bedrijfsgegevens,
 * Google-beoordelingen en reviews. Zet dit over naar de database zodra
 * de beoordelingen echt uit Google komen; de vorm is er al op gebouwd.
 */
export const BEDRIJF = {
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
};

export const GOOGLE = {
  score: 4.8,
  aantal: 137,
  url: 'https://www.google.com/maps',
  verdeling: [112, 18, 4, 2, 1],
};

export type Review = {
  quote: string; naam: string; rol: string; ster: number; datum: string;
};

export const REVIEWS_WERKZOEKEND: Review[] = [
  {
    quote: 'Maandag gebeld, woensdag kennismaken, maandag erna begonnen. En ze belden daarna nog om te vragen hoe het ging.',
    naam: 'Youssef Bakkali', rol: 'Heftruckchauffeur, Tilburg', ster: 5, datum: '2 weken geleden',
  },
  {
    quote: 'Eindelijk een bureau dat niet alleen zegt “ik bel je terug”, maar het ook doet. Mijn contactpersoon kende de werkvloer echt.',
    naam: 'Linda Hoekstra', rol: 'Verzorgende IG, Utrecht', ster: 5, datum: 'een maand geleden',
  },
  {
    quote: 'Ik zocht iets naast mijn studie. Binnen tien minuten gefilterd op bijbaan en avonddiensten, en via WhatsApp gesolliciteerd.',
    naam: 'Tim Wolters', rol: 'Magazijnmedewerker, Almere', ster: 5, datum: '3 weken geleden',
  },
];

export const REVIEWS_WERKGEVER: Review[] = [
  {
    quote: 'Binnen 48 uur drie kandidaten op gesprek, waarvan er twee zijn gebleven. Clover snapt onze productieomgeving.',
    naam: 'Marjolein Brouwer', rol: 'Productiemanager, voedingsmiddelenindustrie', ster: 5, datum: '1 maand geleden',
  },
  {
    quote: 'We werken met een vaste pool via Clover. Geen onverwachte facturen, altijd NEN 4400-1 in orde, en ze denken mee over de planning.',
    naam: 'Erik Vermeulen', rol: 'Operationeel directeur, logistiek dienstverlener', ster: 5, datum: '2 maanden geleden',
  },
  {
    quote: 'De accountmanager kwam eerst een dag meelopen op de bouwplaats. Daarna waren de voorgestelde vakmensen ook echt raak.',
    naam: 'Sandra Kok', rol: 'Hoofd bedrijfsbureau, aannemersbedrijf', ster: 4, datum: '3 maanden geleden',
  },
];
