export type Review = {
  author: string;
  city: string;
  job: string;
  rating: number;
  text: string;
  /** 'google' toont het Google-logo bij de review. */
  source?: 'google' | 'eigen';
  date?: string;
};

/**
 * VOORBEELDEN — vervang door echte klantbeoordelingen voordat de site live
 * gaat. Het cijfer in site.ts staat ook in de structured data, dus dat moet
 * kloppen met wat hier staat.
 */
export const reviews: Review[] = [
  { author: 'Sanne de Vries', city: 'Amsterdam', job: 'Glad stucwerk woonkamer', rating: 5, text: 'Onze woonkamer en hal zijn compleet opnieuw gestuukt. Strak resultaat, netjes afgeplakt en elke dag opgeruimd achtergelaten. De prijs die vooraf werd afgesproken bleef ook de eindprijs.' },
  { author: 'Mark Jansen', city: 'Haarlem', job: 'Plafonds en sierlijsten', rating: 5, text: 'De plafonds in ons jaren-30-huis zaten vol scheuren. Ze zijn hersteld en de originele sierlijsten zijn keurig bijgewerkt. Je ziet niet meer waar het oude ophoudt.' },
  { author: 'Fatima El Amrani', city: 'Almere', job: 'Betonstuc badkamer', rating: 5, text: 'Betonlook in de badkamer laten aanbrengen. Vooraf een proefvlak gemaakt zodat we de kleur konden kiezen. Naadloos en makkelijk schoon te houden — precies wat we wilden.' },
  { author: 'Peter Bakker', city: 'Amstelveen', job: 'Gevelstuc met isolatie', rating: 5, text: 'Gevel geïsoleerd en afgewerkt met sierpleister. Duidelijke uitleg vooraf over wat er nodig was, geen verrassingen achteraf. Het huis is merkbaar warmer.' },
  { author: 'VvE Hoofddorp-West', city: 'Hoofddorp', job: 'Trappenhuizen VvE', rating: 5, text: 'Vier trappenhuizen voorzien van nieuwe sierpleister en schilderwerk. Goed gepland, bewoners op tijd geïnformeerd en binnen de afgesproken periode klaar.' },
  { author: 'Lisa Wong', city: 'Utrecht', job: 'Nieuwbouw compleet stucwerk', rating: 5, text: 'Complete nieuwbouwwoning gestuukt. Meedenkend over de afwerkingsniveaus per ruimte, waardoor we het budget goed hebben kunnen verdelen.' },
];
