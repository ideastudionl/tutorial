import { createClient } from '@supabase/supabase-js';

export type Aanvraag = {
  id: string;
  created_at: string;
  naam: string;
  email: string;
  telefoon: string;
  postcode: string;
  plaats: string;
  werk: string[];
  situatie: string;
  oppervlakte: string;
  oppervlakte_m2: number;
  pand: string;
  planning: string;
  opmerking: string;
  richtprijs: string;
  status: 'nieuw' | 'gebeld' | 'offerte' | 'gewonnen' | 'verloren';

  /** Herkomst: waardoor kwam deze aanvraag binnen? */
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  landingspagina: string | null;
  verwijzer: string | null;
};

/**
 * Korte omschrijving van de herkomst, bijvoorbeeld "google / cpc — stucwerk
 * amsterdam". Leeg als er niets is vastgelegd (aanvraag van vóór de meting,
 * of een bezoeker die sessionStorage blokkeert).
 */
export function herkomstVan(a: Aanvraag): string {
  const keten = [a.utm_source, a.utm_medium].filter(Boolean).join(' / ');
  const campagne = [a.utm_campaign, a.utm_term].filter(Boolean).join(' — ');
  return [keten, campagne].filter(Boolean).join(' — ');
}

/** Betaalde klik? Dan is deze aanvraag met advertentiegeld gekocht. */
export function isAdvertentie(a: Aanvraag): boolean {
  return Boolean(a.gclid || a.fbclid || a.msclkid || a.utm_medium === 'cpc');
}

export const STATUSSEN = ['nieuw', 'gebeld', 'offerte', 'gewonnen', 'verloren'] as const;

/** Client met de servicesleutel: alleen op de server gebruiken. */
export function adminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
