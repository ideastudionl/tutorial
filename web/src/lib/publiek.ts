import { createClient } from '@supabase/supabase-js';

/**
 * Client voor de publieke site. Geen cookies, geen sessie: iedere
 * bezoeker is `anon`, en RLS bepaalt wat dat mag — online vacatures en
 * online pagina's lezen, en een sollicitatie, aanvraag of jobalert
 * wegschrijven. Meer niet.
 *
 * Bewust niet de cookie-client uit supabase/server: die probeert een
 * sessie te verversen die er op de publieke site toch niet is, en zou
 * elke pagina onnodig dynamisch maken.
 */
export function supabasePubliek() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const VACATUREVELDEN =
  'id, nummer, slug, titel, sector_id, plaats, provincie, dienstverband, contract, ' +
  'opleiding, uren, uurloon_min, uurloon_max, spoed, rijbewijs, ploegendienst, ' +
  'bedrijf, intro, taken, vraag, bieden, gepubliceerd_op, vervalt_op';

export type PubliekeVacature = {
  id: string; nummer: string; slug: string; titel: string; sector_id: string;
  plaats: string; provincie: string; dienstverband: string; contract: string;
  opleiding: string; uren: number; uurloon_min: number; uurloon_max: number;
  spoed: boolean; rijbewijs: boolean; ploegendienst: boolean;
  bedrijf: string; intro: string; taken: string[]; vraag: string[]; bieden: string[];
  gepubliceerd_op: string | null; vervalt_op: string | null;
};

export type PubliekeSector = {
  id: string; naam: string; pitch: string; kleur: string;
  kleur_zacht: string; icoon: string; volgorde: number;
};

export async function haalSectoren(): Promise<PubliekeSector[]> {
  const { data } = await supabasePubliek()
    .from('sectoren')
    .select('id, naam, pitch, kleur, kleur_zacht, icoon, volgorde')
    .order('volgorde');
  return data ?? [];
}

/** Alleen wat online staat en niet verlopen is. */
export function online() {
  const vandaag = new Date().toISOString().slice(0, 10);
  return supabasePubliek()
    .from('vacatures')
    .select(VACATUREVELDEN)
    .eq('status', 'online')
    .or(`vervalt_op.is.null,vervalt_op.gte.${vandaag}`);
}

export const bedrag = (n: number) => n.toFixed(2).replace('.', ',');
export const euro = (n: number) => `€ ${bedrag(n)}`;

/** "Vandaag", "gisteren", of het aantal dagen. */
export function geplaatst(datum: string | null) {
  if (!datum) return 'Onlangs geplaatst';
  const dagen = Math.max(
    0,
    Math.floor((Date.now() - new Date(datum).getTime()) / 86_400_000),
  );
  if (dagen === 0) return 'Vandaag geplaatst';
  if (dagen === 1) return 'Gisteren geplaatst';
  if (dagen < 14) return `${dagen} dagen geleden geplaatst`;
  return `Geplaatst op ${new Date(datum).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })}`;
}

export function dagenOud(datum: string | null) {
  if (!datum) return 99;
  return Math.floor((Date.now() - new Date(datum).getTime()) / 86_400_000);
}
