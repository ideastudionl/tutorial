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
};

export const STATUSSEN = ['nieuw', 'gebeld', 'offerte', 'gewonnen', 'verloren'] as const;

/** Client met de servicesleutel: alleen op de server gebruiken. */
export function adminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
