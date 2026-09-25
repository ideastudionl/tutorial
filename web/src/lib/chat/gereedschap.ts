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
 * Er is bewust geen gereedschap dat SQL uitvoert, bestanden schrijft,
 * opmaak aanpast of iets verwijdert. Archiveren kan; weggooien niet.
 * Wat hier niet staat, kan de assistent niet.
 *
 * Geen `strict: true` op de schema's: dat stelt eisen aan geneste
 * objecten met optionele velden waar `velden` niet aan voldoet, en een
 * 400 zou de hele functie breken. De echte controle zit op de server.
 */

const VACATUREVELDEN = {
  titel: { type: 'string' },
  plaats: { type: 'string' },
  provincie: { type: 'string' },
  bedrijf: { type: 'string', description: 'Omschrijving van de opdrachtgever' },
  intro: { type: 'string' },
  sector_id: { type: 'string' },
  dienstverband: { type: 'string', enum: ['Fulltime', 'Parttime', 'Bijbaan'] },
  contract: {
    type: 'string',
    enum: ['Uitzenden', 'Detachering', 'Werving & selectie', 'Tijdelijk werk'],
  },
  opleiding: {
    type: 'string',
    enum: ['Geen diploma nodig', 'VMBO / MBO 1-2', 'MBO 3-4', 'HBO / WO'],
  },
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
} as const;

const PAGINAVELDEN = {
  titel: { type: 'string' },
  intro: { type: 'string' },
  secties: {
    type: 'array',
    description: 'Blokken tekst, elk met een kop en een alinea.',
    items: {
      type: 'object',
      properties: { kop: { type: 'string' }, tekst: { type: 'string' } },
      required: ['kop', 'tekst'],
    },
  },
  meta_titel: { type: 'string', description: 'Titel voor zoekmachines, max ~60 tekens' },
  meta_omschrijving: { type: 'string', description: 'Omschrijving voor zoekmachines, max ~155 tekens' },
  status: { type: 'string', enum: ['concept', 'online', 'gearchiveerd'] },
} as const;

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
        status: { type: 'string', enum: ['concept', 'online', 'vervuld', 'gearchiveerd'] },
      },
    },
  },
  {
    name: 'toon_vacature',
    description: 'Haal alle velden van één vacature op, via het id.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'zoek_paginas',
    description: "Zoek inhoudspagina's van de site, zoals \"Over Clover\".",
    input_schema: {
      type: 'object' as const,
      properties: {
        term: { type: 'string' },
        status: { type: 'string', enum: ['concept', 'online', 'gearchiveerd'] },
      },
    },
  },
  {
    name: 'toon_pagina',
    description: 'Haal een pagina op met al zijn secties, via het id.',
    input_schema: {
      type: 'object' as const,
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'toon_sectoren',
    description: 'Lijst van alle sectoren met hun id en naam.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'toon_sollicitaties',
    description:
      'Tel sollicitaties per status. Geeft bewust geen cv, motivatie of ' +
      'contactgegevens terug: die persoonsgegevens hoeven niet door de chat.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['nieuw', 'gebeld', 'voorgesteld', 'geplaatst', 'afgewezen'],
        },
      },
    },
  },
] satisfies Anthropic.Tool[];

export const SCHRIJFGEREEDSCHAP = [
  {
    name: 'stel_wijziging_voor',
    description:
      'Stel een wijziging aan een bestaande vacature voor. Voert NIETS uit: de ' +
      'gebruiker ziet het voorstel en keurt het goed. Geef alleen de velden die ' +
      'daadwerkelijk veranderen.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        toelichting: { type: 'string', description: 'Eén zin: wat verandert er en waarom.' },
        velden: { type: 'object', properties: VACATUREVELDEN },
      },
      required: ['id', 'toelichting', 'velden'],
    },
  },
  {
    name: 'stel_nieuwe_vacature_voor',
    description:
      'Stel een nieuwe vacature voor. Voert NIETS uit. De vacature wordt na ' +
      'goedkeuring altijd als CONCEPT aangemaakt, nooit direct online: iemand ' +
      'moet hem eerst nalezen. Vraag door als essentiele gegevens ontbreken ' +
      '(sector, plaats, uren, uurloon) in plaats van te gokken.',
    input_schema: {
      type: 'object' as const,
      properties: {
        toelichting: { type: 'string' },
        velden: {
          type: 'object',
          properties: VACATUREVELDEN,
          required: [
            'titel', 'sector_id', 'plaats', 'provincie', 'bedrijf', 'intro',
            'dienstverband', 'contract', 'opleiding', 'uren',
            'uurloon_min', 'uurloon_max',
          ],
        },
      },
      required: ['toelichting', 'velden'],
    },
  },
  {
    name: 'stel_paginawijziging_voor',
    description:
      'Stel een wijziging aan een bestaande pagina voor. Voert NIETS uit. ' +
      'Wil je één sectie aanpassen, geef dan de volledige nieuwe lijst secties mee.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string' },
        toelichting: { type: 'string' },
        velden: { type: 'object', properties: PAGINAVELDEN },
      },
      required: ['id', 'toelichting', 'velden'],
    },
  },
  {
    name: 'stel_nieuwe_pagina_voor',
    description:
      'Stel een nieuwe inhoudspagina voor. Voert NIETS uit. Wordt na goedkeuring ' +
      'als CONCEPT aangemaakt. De webadres-slug leid je af van de titel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        toelichting: { type: 'string' },
        velden: {
          type: 'object',
          properties: PAGINAVELDEN,
          required: ['titel', 'intro', 'secties'],
        },
      },
      required: ['toelichting', 'velden'],
    },
  },
] satisfies Anthropic.Tool[];

export const ALLE_GEREEDSCHAP = [...LEESGEREEDSCHAP, ...SCHRIJFGEREEDSCHAP];

/** Velden die een voorstel mag aanraken. Alles daarbuiten wordt geweigerd. */
export const VELDEN_VACATURE = new Set(Object.keys(VACATUREVELDEN));
export const VELDEN_PAGINA = new Set(Object.keys(PAGINAVELDEN));

export type Entiteit = 'vacature' | 'pagina';

export type Voorstel =
  | {
      soort: 'wijziging';
      entiteit: Entiteit;
      id: string;
      label: string;
      toelichting: string;
      wijzigingen: { veld: string; voor: unknown; na: unknown }[];
    }
  | {
      soort: 'nieuw';
      entiteit: Entiteit;
      label: string;
      toelichting: string;
      velden: Record<string, unknown>;
    };

export const slugVan = (tekst: string) =>
  tekst
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' en ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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
      return data?.length ? JSON.stringify(data) : 'Geen vacatures gevonden.';
    }

    case 'toon_vacature': {
      const { data, error } = await supabase
        .from('vacatures').select('*').eq('id', String(invoer.id)).maybeSingle();
      if (error) return `Fout: ${error.message}`;
      if (!data) return 'Geen vacature met dit id.';
      const { zoek, zoektekst, ...rest } = data;
      void zoek; void zoektekst;
      return JSON.stringify(rest);
    }

    case 'zoek_paginas': {
      let q = supabase
        .from('paginas')
        .select('id, slug, titel, status, systeempagina, gewijzigd_op')
        .order('titel');
      if (invoer.term) q = q.ilike('titel', `%${String(invoer.term)}%`);
      if (invoer.status) q = q.eq('status', String(invoer.status));
      const { data, error } = await q;
      if (error) return `Fout: ${error.message}`;
      return data?.length ? JSON.stringify(data) : "Geen pagina's gevonden.";
    }

    case 'toon_pagina': {
      const { data, error } = await supabase
        .from('paginas').select('*').eq('id', String(invoer.id)).maybeSingle();
      if (error) return `Fout: ${error.message}`;
      return data ? JSON.stringify(data) : 'Geen pagina met dit id.';
    }

    case 'toon_sectoren': {
      const { data, error } = await supabase
        .from('sectoren').select('id, naam').order('volgorde');
      if (error) return `Fout: ${error.message}`;
      return JSON.stringify(data);
    }

    case 'toon_sollicitaties': {
      let q = supabase.from('sollicitaties').select('status');
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

/** Bouwt een voorstel op. Voert niets uit. */
export async function bouwVoorstel(
  gereedschap: string,
  invoer: Record<string, unknown>,
): Promise<{ voorstel?: Voorstel; fout?: string }> {
  const supabase = await supabaseServer();
  const velden = (invoer.velden ?? {}) as Record<string, unknown>;
  const toelichting = String(invoer.toelichting ?? '');

  const isPagina = gereedschap.includes('pagina');
  const entiteit: Entiteit = isPagina ? 'pagina' : 'vacature';
  const toegestaan = isPagina ? VELDEN_PAGINA : VELDEN_VACATURE;
  const tabel = isPagina ? 'paginas' : 'vacatures';

  for (const veld of Object.keys(velden)) {
    if (!toegestaan.has(veld)) {
      return { fout: `Het veld "${veld}" mag niet via de assistent gewijzigd worden.` };
    }
  }

  // ---- Nieuw ---------------------------------------------
  if (gereedschap.startsWith('stel_nieuwe')) {
    if (!velden.titel) return { fout: 'Een titel is verplicht.' };

    if (isPagina) {
      const slug = slugVan(String(velden.titel));
      const { data: bestaat } = await supabase
        .from('paginas').select('id').eq('slug', slug).maybeSingle();
      if (bestaat) {
        return { fout: `Er bestaat al een pagina met het adres /${slug}. Kies een andere titel.` };
      }
    }

    return {
      voorstel: {
        soort: 'nieuw',
        entiteit,
        label: String(velden.titel),
        toelichting,
        // Nieuw materiaal komt altijd als concept binnen: iemand leest het na.
        velden: { ...velden, status: 'concept' },
      },
    };
  }

  // ---- Wijziging -----------------------------------------
  const id = String(invoer.id ?? '');
  const { data: huidig, error } = await supabase
    .from(tabel).select('*').eq('id', id).maybeSingle();

  if (error) return { fout: `Ophalen mislukt: ${error.message}` };
  if (!huidig) return { fout: `Geen ${entiteit} met dit id.` };

  const wijzigingen: { veld: string; voor: unknown; na: unknown }[] = [];
  for (const [veld, na] of Object.entries(velden)) {
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
      entiteit,
      id,
      label: isPagina
        ? String(huidig.titel)
        : `${huidig.nummer} — ${huidig.titel}`,
      toelichting,
      wijzigingen,
    },
  };
}
