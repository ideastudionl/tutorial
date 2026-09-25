export type Dienstverband = 'Fulltime' | 'Parttime' | 'Bijbaan';
export type Contractvorm =
  | 'Uitzenden' | 'Detachering' | 'Werving & selectie' | 'Tijdelijk werk';
export type Opleidingsniveau =
  | 'Geen diploma nodig' | 'VMBO / MBO 1-2' | 'MBO 3-4' | 'HBO / WO';
export type VacatureStatus = 'concept' | 'online' | 'vervuld' | 'gearchiveerd';
export type SollicitatieStatus =
  | 'nieuw' | 'gebeld' | 'voorgesteld' | 'geplaatst' | 'afgewezen';
export type Gebruikersrol = 'admin' | 'intercedent' | 'lezer';

export type Sector = {
  id: string;
  naam: string;
  pitch: string;
  kleur: string;
  kleur_zacht: string;
  icoon: string;
  volgorde: number;
};

export type Intercedent = {
  id: string;
  naam: string;
  rol: string;
  telefoon: string | null;
  email: string;
};

export type Vacature = {
  id: string;
  nummer: string;
  slug: string;
  titel: string;
  sector_id: string;
  intercedent_id: string | null;
  plaats: string;
  provincie: string;
  dienstverband: Dienstverband;
  contract: Contractvorm;
  opleiding: Opleidingsniveau;
  uren: number;
  uurloon_min: string;
  uurloon_max: string;
  spoed: boolean;
  rijbewijs: boolean;
  ploegendienst: boolean;
  bedrijf: string;
  intro: string;
  taken: string[];
  vraag: string[];
  bieden: string[];
  status: VacatureStatus;
  gepubliceerd_op: string | null;
  vervalt_op: string | null;
  aangemaakt_op: string;
  gewijzigd_op: string;
};

export type Sollicitatie = {
  id: string;
  vacature_id: string | null;
  naam: string;
  telefoon: string;
  email: string | null;
  beschikbaar: string | null;
  motivatie: string | null;
  cv_pad: string | null;
  status: SollicitatieStatus;
  bron: string;
  notitie: string | null;
  bewaren_tot: string;
  aangemaakt_op: string;
};

export type Profiel = {
  id: string;
  naam: string;
  rol: Gebruikersrol;
  actief: boolean;
};

export const STATUS_LABEL: Record<VacatureStatus, string> = {
  concept: 'Concept',
  online: 'Online',
  vervuld: 'Vervuld',
  gearchiveerd: 'Gearchiveerd',
};

export const SOLLICITATIE_LABEL: Record<SollicitatieStatus, string> = {
  nieuw: 'Nieuw',
  gebeld: 'Gebeld',
  voorgesteld: 'Voorgesteld',
  geplaatst: 'Geplaatst',
  afgewezen: 'Afgewezen',
};

export const euro = (n: string | number) =>
  '€ ' + Number(n).toFixed(2).replace('.', ',');

export const datum = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '—';
