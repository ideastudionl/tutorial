export type Area = { slug: string; city: string; travel: string; districts: string };

/** Werkgebieden. Elke plaats krijgt een eigen pagina op /stukadoor/<slug>/. */
export const areas: Area[] = [
  { slug: 'amsterdam', city: 'Amsterdam', travel: 'thuisbasis', districts: 'Centrum, De Pijp, Oud-West, Oud-Zuid, Noord, Oost, Nieuw-West, Zuidoost, IJburg' },
  { slug: 'amstelveen', city: 'Amstelveen', travel: '15 minuten', districts: 'Westwijk, Bankras, Elsrijk, Randwijck' },
  { slug: 'haarlem', city: 'Haarlem', travel: '25 minuten', districts: 'Centrum, Haarlem-Noord, Schalkwijk, Spaarndam' },
  { slug: 'almere', city: 'Almere', travel: '30 minuten', districts: 'Almere Stad, Almere Buiten, Almere Haven, Poort' },
  { slug: 'purmerend', city: 'Purmerend', travel: '25 minuten', districts: 'Weidevenne, Overwhere, Purmer-Noord, Purmer-Zuid' },
  { slug: 'zaandam', city: 'Zaandam', travel: '20 minuten', districts: 'Zaandam Centrum, Westerkoog, Kogerveld, Wormerveer' },
  { slug: 'hoofddorp', city: 'Hoofddorp', travel: '20 minuten', districts: 'Overbos, Toolenburg, Floriande, Nieuw-Vennep' },
  { slug: 'aalsmeer', city: 'Aalsmeer', travel: '25 minuten', districts: 'Aalsmeer-Dorp, Kudelstaart, Oosteinde' },
  { slug: 'uithoorn', city: 'Uithoorn', travel: '25 minuten', districts: 'Thamerdal, Zijdelwaard, De Kwakel' },
  { slug: 'diemen', city: 'Diemen', travel: '15 minuten', districts: 'Diemen-Noord, Diemen-Zuid, Diemen Centrum' },
  { slug: 'hilversum', city: 'Hilversum', travel: '35 minuten', districts: 'Centrum, Hilversum-Noord, Kerkelanden' },
  { slug: 'utrecht', city: 'Utrecht', travel: '40 minuten', districts: 'Binnenstad, Leidsche Rijn, Oost, Overvecht' },
  { slug: 'den-haag', city: 'Den Haag', travel: '50 minuten', districts: 'Centrum, Loosduinen, Scheveningen, Ypenburg' },
];
