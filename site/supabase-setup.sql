-- Draai dit één keer in de SQL-editor van Supabase.
-- Maakt de tabel waarin offerteaanvragen worden bewaard.

create table if not exists public.aanvragen (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  naam           text not null,
  email          text not null,
  telefoon       text not null,
  postcode       text,
  plaats         text,

  werk           text[] not null default '{}',
  situatie       text,
  oppervlakte    text,
  oppervlakte_m2 numeric(8,1) default 0,
  pand           text,
  planning       text,
  opmerking      text,

  richtprijs     text,
  status         text not null default 'nieuw'
                 check (status in ('nieuw','gebeld','offerte','gewonnen','verloren'))
);

create index if not exists aanvragen_created_at_idx on public.aanvragen (created_at desc);
create index if not exists aanvragen_status_idx     on public.aanvragen (status);

-- Rijbeveiliging aan, zonder policies: alleen de servicesleutel — die
-- uitsluitend op de server wordt gebruikt — kan lezen en schrijven. De
-- publieke anon-sleutel komt er dus niet bij, ook niet als die uitlekt.
alter table public.aanvragen enable row level security;
