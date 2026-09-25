import type Anthropic from '@anthropic-ai/sdk';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Het gereedschap dat de chatmodule mag gebruiken.
 *
 * Twee soorten, en het onderscheid is de hele beveiliging:
 *
 *  - LEZEN  voert direct uit. Kan niets kapotmaken.
 *  - SCHRIJVEN voert NIETS uit. Het levert een voorstel op dat de
 *    gebruiker in het scherm ziet en goedkeurt. Pas die goedkeuring
 *    schrijft naar de database, via een aparte route die opnieuw
 *    controleert wie er inlogt en wat die mag.
 *
 * Er is bewust geen gereedschap dat SQL uitvoert, bestanden schrijft
 * of opmaak aanpast. Wat hier niet staat, kan de chat niet.
 *
 * Geen `strict: true` op de schema's: dat stelt eisen aan geneste
 * objecten met optionele velden waar `velden` niet aan voldoet, en een
 * 400 zou de hele functie breken. De echte controle zit toch op de
 * server — zie TOEGESTANE_VELDEN en de uitvoerroute.
 */

export const LEESGEREEDSCHAP = [
  {
    name: 'zoek_vacatures',
    description:
      'Zoek vacatures. Gebruik dit altijd eerst om te achterhalen welke vacature ' +
      'de gebruiker bedoelt voordat je een wijziging voorstelt.',
    input_schema: {
      type: 'object' as const,
      properties: {
        term: { type: 'string', description: 'Trefwoord in titel, plaats of bedrijf' },
        sector: { type: 'string', description: 'Sector-id, bv. techniek of logistiek' },
        status: {
          type: 'string',
          enum: ['concept', 'online', 'vervuld', 'gearchiveerd'],
        },
      },
      required: [] as string[],
      additionalProperties: false,
    },
  },
  {
    name: 'toon_vacature',
    description: 'Haal alle velden van één vacature op, via het id.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'toon_sectoren',
    description: 'Lijst van alle sectoren met hun id en naam.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [] as string[],
      additionalProperties: false,
    },
  },
  {
    name: 'toon_sollicitaties',
    description:
      'Tel en toon sollicitaties per status. Geeft bewust geen cv, motivatie of ' +
      'contactgegevens terug: die persoonsgegevens hoeven niet door de chat.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['nieuw', 'gebeld', 'voorgesteld', 'geplaatst', 'afgewezen'],
        },
      },
      required: [] as string[],
      additionalProperties: false,
    },
  },
] satisfies Anthropic.Tool[];

export const SCHRIJFGEREEDSCHAP = [
  {
    name: 'stel_wijziging_voor',
    description:
      'Stel een wijziging aan een bestaande vacature voor. Dit voert NIETS uit: ' +
      'de gebruiker ziet het voorstel en keurt het goed. Geef alleen de velden ' +
      'die daadwerkelijk veranderen.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Id van de vacature' },
        toelichting: {
          type: 'string',
          description: 'Eén zin: wat verandert er en waarom.',
        },
        velden: {
          type: 'object',
          description: 'De te wijzigen velden met hun nieuwe waarde.',
          properties: {
            titel: { type: 'string' },
            plaats: { type: 'string' },
            provincie: { type: 'string' },
            bedrijf: { type: 'string' },
            intro: { type: 'string' },
            uren: { type: 'number' },
            uurloon_min: { type: 'number' },
            uurloon_max: { type: 'number' },
            spoed: { type: 'boolean' },
            rijbewijs: { type: 'boolean' },
            ploegendienst: { type: 'boolean' },
            status: { type: 'string', enum: ['concept', 'online', 'vervuld', 'gearchiveerd'] },
            vervalt_op: { type: 'string', description: 'JJJJ-MM-DD' },
            taken: { type: 'array', items: { type: 'string' } },
            vraag: { type: 'array', items: { type: 'string' } },
            bieden: { type: 'array', items: { type: 'string' } },
          },
          additionalProperties: false,
        },
      },
      required: ['id', 'toelichting', 'velden'],
      additionalProperties: false,
    },
  },
] satisfies Anthropic.Tool[];

export const ALLE_GEREEDSCHAP = [...LEESGEREEDSCHAP, ...SCHRIJFGEREEDSCHAP];

/** Velden die een voorstel mag aanraken. Alles daarbuiten wordt geweigerd. */
export const TOEGESTANE_VELDEN = new Set([
  'titel', 'plaats', 'provincie', 'bedrijf', 'intro',
  'uren', 'uurloon_min', 'uurloon_max',
  'spoed', 'rijbewijs', 'ploegendienst',
  'status', 'vervalt_op', 'taken', 'vraag', 'bieden',
]);

export type Voorstel = {
  soort: 'wijziging';
  id: string;
  nummer: string;
  titel: string;
  toelichting: string;
  wijzigingen: { veld: string; voor: unknown; na: unknown }[];
};

/** Voert één leesactie uit. Schrijfacties komen hier nooit langs. */
export async function voerLeesactieUit(
  naam: string,
  invoer: Record<string, unknown>,
): Promise<string> {
  const supabase = await supabaseServer();

  switch (naam) {
    case 'zoek_vacatures': {
      let q = supabase
        .from('vacatures')
        .select('id, nummer, titel, plaats, status, uren, uurloon_min, uurloon_max, spoed, sector_id')
        .order('gewijzigd_op', { ascending: false })
        .limit(25);

      if (invoer.term) q = q.ilike('zoektekst', `%${String(invoer.term).toLowerCase()}%`);
      if (invoer.sector) q = q.eq('sector_id', String(invoer.sector));
      if (invoer.status) q = q.eq('status', String(invoer.status));

      const { data, error } = await q;
      if (error) return `Fout bij zoeken: ${error.message}`;
      if (!data?.length) return 'Geen vacatures gevonden met deze criteria.';
      return JSON.stringify(data);
    }

    case 'toon_vacature': {
      const { data, error } = await supabase
        .from('vacatures').select('*').eq('id', String(invoer.id)).maybeSingle();
      if (error) return `Fout: ${error.message}`;
      if (!data) return 'Geen vacature met dit id.';
      // zoekvelden zijn intern, die hoeft het model niet te zien
      const { zoek, zoektekst, ...rest } = data;
      void zoek; void zoektekst;
      return JSON.stringify(rest);
    }

    case 'toon_sectoren': {
      const { data, error } = await supabase
        .from('sectoren').select('id, naam').order('volgorde');
      if (error) return `Fout: ${error.message}`;
      return JSON.stringify(data);
    }

    case 'toon_sollicitaties': {
      let q = supabase.from('sollicitaties').select('status, aangemaakt_op, vacature_id');
      if (invoer.status) q = q.eq('status', String(invoer.status));
      const { data, error } = await q;
      if (error) return `Fout: ${error.message}`;
      const perStatus: Record<string, number> = {};
      for (const r of data ?? []) perStatus[r.status] = (perStatus[r.status] ?? 0) + 1;
      return JSON.stringify({ totaal: data?.length ?? 0, per_status: perStatus });
    }

    default:
      return `Onbekend gereedschap: ${naam}`;
  }
}

/**
 * Zet een voorgestelde wijziging om in een leesbaar voor/na-overzicht.
 * Voert niets uit; weigert velden die niet op de toegestane lijst staan.
 */
export async function bouwVoorstel(
  invoer: Record<string, unknown>,
): Promise<{ voorstel?: Voorstel; fout?: string }> {
  const supabase = await supabaseServer();
  const id = String(invoer.id ?? '');
  const velden = (invoer.velden ?? {}) as Record<string, unknown>;

  const { data: huidig, error } = await supabase
    .from('vacatures').select('*').eq('id', id).maybeSingle();

  if (error) return { fout: `Ophalen mislukt: ${error.message}` };
  if (!huidig) return { fout: 'Geen vacature met dit id.' };

  const wijzigingen: Voorstel['wijzigingen'] = [];
  for (const [veld, na] of Object.entries(velden)) {
    if (!TOEGESTANE_VELDEN.has(veld)) {
      return { fout: `Het veld "${veld}" mag niet via de chat gewijzigd worden.` };
    }
    const voor = (huidig as Record<string, unknown>)[veld];
    if (JSON.stringify(voor) === JSON.stringify(na)) continue;
    wijzigingen.push({ veld, voor, na });
  }

  if (!wijzigingen.length) {
    return { fout: 'Deze waarden staan er al zo in; er verandert niets.' };
  }

  return {
    voorstel: {
      soort: 'wijziging',
      id,
      nummer: huidig.nummer,
      titel: huidig.titel,
      toelichting: String(invoer.toelichting ?? ''),
      wijzigingen,
    },
  };
}
