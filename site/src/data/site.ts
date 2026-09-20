/** Bedrijfsgegevens. Eén plek, overal gebruikt — ook in de structured data. */
export const site = {
  name: 'Interflex Stuc',
  tagline: 'Stukadoor & schilderwerk',
  description:
    'Stukadoor in Amsterdam en omstreken. Glad stucwerk, sierpleister, betonlook en schilderwerk voor woningen, VvE’s en bedrijfspanden.',
  url: 'https://interflexstuc.nl',

  phone: '+31 6 85 26 38 55',
  phoneHref: 'tel:+31685263855',
  whatsapp: '31685263855',
  email: 'info@interflexstuc.nl',

  street: 'Overschiestraat 86',
  postcode: '1062 XH',
  city: 'Amsterdam',
  mapsUrl: 'https://maps.google.com/?q=Overschiestraat+86,+1062+XH+Amsterdam',

  /** Vul aan voordat de site live gaat. */
  kvk: '',
  btw: '',

  hours: [
    { label: 'Maandag t/m zaterdag', time: '07:00 – 18:00', days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], opens: '07:00', closes: '18:00' },
    { label: 'Zondag', time: 'Gesloten', days: ['Su'] },
  ],

  /**
   * Voorbeeldcijfers — vervang door de echte vóór livegang.
   *
   * Zet `geverifieerd` pas op true als dit cijfer klopt en herleidbaar is tot
   * echte beoordelingen. Zolang het false is, laten we de waardering weg uit
   * de structured data: een verzonnen beoordelingscijfer aan Google doorgeven
   * is in strijd met hun richtlijnen en kan de hele site uit de zoekresultaten
   * halen. Op de pagina zelf blijft het zichtbaar als voorbeeld.
   */
  rating: { score: '9,4', count: 87, geverifieerd: false },
  yearsActive: 10,
  projectsDone: 750,
  warrantyYears: 5,
  responseTime: 'binnen 24 uur',

  social: { facebook: '', instagram: '', linkedin: '' },
} as const;

export const addressLine = `${site.street}, ${site.postcode} ${site.city}`;
export const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hallo, ik heb een vraag over stucwerk.')}`;
