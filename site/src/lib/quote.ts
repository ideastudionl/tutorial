import { services, headlineRate } from '../data/services';

/** Eén bron voor de stappen, gebruikt door het formulier én de server. */
export type Choice = { value: string; label: string; desc?: string; icon: string; rate?: number; factor?: number; m2?: number };

export const werkOptions: Choice[] = [
  ...services.map((s) => ({
    value: s.slug,
    label: s.title,
    icon: s.icon,
    ...(s.rate !== null ? { rate: s.rate } : {}),
  })),
  { value: 'anders', label: 'Iets anders', icon: 'clipboard' },
];

export const situatieOptions: Choice[] = [
  { value: 'nieuwbouw', label: 'Nieuwbouw / kale muren', icon: 'home', factor: 1 },
  { value: 'glad', label: 'Bestaand en redelijk glad', icon: 'ruler', factor: 1 },
  { value: 'beschadigd', label: 'Bestaand en beschadigd', icon: 'layers', factor: 1.25 },
  { value: 'behang', label: 'Er zit nog behang op', icon: 'file-text', factor: 1.15 },
  { value: 'onbekend', label: 'Weet ik niet precies', icon: 'clipboard', factor: 1.1 },
];

export const oppervlakteOptions: Choice[] = [
  { value: 'tot-25', label: 'Tot 25 m²', icon: 'ruler', m2: 20 },
  { value: '25-60', label: '25 – 60 m²', icon: 'ruler', m2: 42 },
  { value: '60-120', label: '60 – 120 m²', icon: 'ruler', m2: 90 },
  { value: '120-plus', label: 'Meer dan 120 m²', icon: 'ruler', m2: 160 },
  { value: 'onbekend', label: 'Weet ik niet', icon: 'clipboard' },
];

export const pandOptions = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'tussenwoning', label: 'Tussen- of hoekwoning' },
  { value: 'vrijstaand', label: 'Twee-onder-een-kap of vrijstaand' },
  { value: 'nieuwbouw', label: 'Nieuwbouwproject' },
  { value: 'zakelijk', label: 'Bedrijfspand of VvE' },
];

export const planningOptions = [
  { value: 'asap', label: 'Zo snel mogelijk' },
  { value: 'maand', label: 'Binnen een maand' },
  { value: 'kwartaal', label: 'Over 1 tot 3 maanden' },
  { value: 'later', label: 'Later dit jaar' },
  { value: 'orienteren', label: 'Ik oriënteer me nog' },
];

/** Rekenwaarden die het formulier in de browser gebruikt. */
export const pricing = {
  rates: Object.fromEntries(werkOptions.filter((o) => o.rate).map((o) => [o.value, o.rate!])),
  factors: Object.fromEntries(situatieOptions.map((o) => [o.value, o.factor!])),
  areas: Object.fromEntries(oppervlakteOptions.filter((o) => o.m2).map((o) => [o.value, o.m2!])),
  from: headlineRate,
};

const labelOf = (list: { value: string; label: string }[], value: string) =>
  list.find((o) => o.value === value)?.label ?? value;

/** Zet een binnengekomen aanvraag om naar leesbare regels voor de e-mail. */
export function describe(data: Record<string, any>) {
  const werk = (Array.isArray(data.werk) ? data.werk : [data.werk]).filter(Boolean);
  const m2 = Number(data.oppervlakte_m2) || 0;

  return {
    Naam: data.naam,
    'E-mail': data.email,
    Telefoon: data.telefoon,
    Adres: [data.postcode, data.plaats].filter(Boolean).join(' '),
    'Gewenst werk': werk.map((w: string) => labelOf(werkOptions, w)).join(', '),
    Ondergrond: labelOf(situatieOptions, data.situatie),
    Oppervlakte: m2 > 0 ? `${m2} m² (door de klant opgegeven)` : labelOf(oppervlakteOptions, data.oppervlakte),
    'Type pand': data.pand ? labelOf(pandOptions, data.pand) : '',
    'Gewenste start': data.planning ? labelOf(planningOptions, data.planning) : '',
    Toelichting: data.opmerking,
  };
}

/** Richtprijs, met dezelfde formule als in de browser. */
export function estimate(data: Record<string, any>): string {
  const werk = (Array.isArray(data.werk) ? data.werk : [data.werk]).filter(Boolean);
  const rates = werk.map((w: string) => pricing.rates[w]).filter((r: number) => typeof r === 'number');
  if (!rates.length) return '';

  const rate = Math.max(...rates);
  const factor = pricing.factors[data.situatie] ?? 1;
  const m2 = Number(data.oppervlakte_m2) || pricing.areas[data.oppervlakte];
  if (!m2) return `vanaf € ${rate.toFixed(2).replace('.', ',')} per m²`;

  const mid = rate * factor * m2;
  const fmt = (n: number) => '€ ' + Math.round(n / 10) * 10;
  return `${fmt(mid * 0.9)} – ${fmt(mid * 1.2)} (indicatie, ± ${m2} m²)`;
}

/**
 * Geschatte orderwaarde in hele euro's, voor de conversiemeting.
 *
 * Google Ads kan hiermee sturen op omzet in plaats van op aantal aanvragen:
 * een aanvraag voor 200 m² is nu eenmaal meer waard dan een voor 10 m².
 * Het is een indicatie uit dezelfde formule als de richtprijs, geen offerte.
 */
export function estimateValue(data: Record<string, any>): number {
  const werk = (Array.isArray(data.werk) ? data.werk : [data.werk]).filter(Boolean);
  const rates = werk.map((w: string) => pricing.rates[w]).filter((r: number) => typeof r === 'number');
  if (!rates.length) return 0;

  const rate = Math.max(...rates);
  const factor = pricing.factors[data.situatie] ?? 1;
  const m2 = Number(data.oppervlakte_m2) || pricing.areas[data.oppervlakte];
  if (!m2) return 0;

  return Math.round(rate * factor * m2);
}
