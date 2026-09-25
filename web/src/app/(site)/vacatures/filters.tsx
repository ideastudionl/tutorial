'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icoon } from '@/components/icoon';

type Optie = { waarde: string; aantal: number; label?: string };

export function Filterpaneel({
  sectoren, tellingen, spoedAantal,
}: {
  sectoren: { id: string; naam: string; aantal: number }[];
  tellingen: Record<'contract' | 'dienstverband' | 'opleiding', Optie[]>;
  spoedAantal: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const aan = (naam: string, waarde: string) =>
    params.getAll(naam).includes(waarde);

  /** Zet één filter aan of uit en schrijf het resultaat in de adresbalk,
   *  zodat je een gefilterde lijst kunt doorsturen of bewaren. */
  function wissel(naam: string, waarde: string, meervoud = true) {
    const p = new URLSearchParams(params.toString());
    const huidig = p.getAll(naam);
    p.delete(naam);
    if (meervoud) {
      const nieuw = huidig.includes(waarde)
        ? huidig.filter((w) => w !== waarde)
        : [...huidig, waarde];
      nieuw.forEach((w) => p.append(naam, w));
    } else if (!huidig.includes(waarde)) {
      p.set(naam, waarde);
    }
    router.push(`/vacatures?${p.toString()}`, { scroll: false });
  }

  function zetTekst(naam: string, waarde: string) {
    const p = new URLSearchParams(params.toString());
    if (waarde.trim()) p.set(naam, waarde.trim());
    else p.delete(naam);
    router.push(`/vacatures?${p.toString()}`, { scroll: false });
  }

  const actieveAantal = [...params.keys()].filter((k) => k !== 'sorteer').length;

  const groep = (titel: string, naam: string, opties: Optie[]) => (
    <fieldset className="filter-groep">
      <h4 style={{ margin: '0 0 .2rem' }}>{titel}</h4>
      {opties.map((o) => (
        <label className="keuze" key={o.waarde}>
          <input
            type="checkbox"
            checked={aan(naam, o.waarde)}
            onChange={() => wissel(naam, o.waarde)}
          />
          <span className="vink"><Icoon naam="vinkje" w={13} /></span>
          <span>{o.label ?? o.waarde}</span>
          <span className="telling">{o.aantal}</span>
        </label>
      ))}
    </fieldset>
  );

  return (
    <>
      <form
        className={`filterpaneel${open ? ' is-open' : ''}`}
        aria-label="Vacatures filteren"
        onSubmit={(e) => { e.preventDefault(); setOpen(false); }}
      >
        <div className="rij rij--tussen">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Filters</strong>
          <button
            type="button"
            className="knop knop--leeg filter-sluit"
            style={{ padding: '.4rem .7rem' }}
            onClick={() => setOpen(false)}
          >
            <Icoon naam="kruis" w={16} /> Sluiten
          </button>
        </div>

        <div className="zoekveld">
          <Icoon naam="zoek" w={18} />
          <input
            type="search"
            name="term"
            placeholder="Zoek op functie"
            aria-label="Zoek op functie of trefwoord"
            autoComplete="off"
            defaultValue={params.get('term') ?? ''}
            onBlur={(e) => zetTekst('term', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                zetTekst('term', (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        <div className="zoekveld">
          <Icoon naam="pin" w={18} />
          <input
            type="text"
            name="plaats"
            placeholder="Plaats of regio"
            aria-label="Plaats of provincie"
            autoComplete="off"
            defaultValue={params.get('plaats') ?? ''}
            onBlur={(e) => zetTekst('plaats', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                zetTekst('plaats', (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {groep('Sector', 'sector', sectoren.map((s) => ({
          waarde: s.id, label: s.naam, aantal: s.aantal,
        })))}
        {groep('Dienstverband', 'dienstverband', tellingen.dienstverband)}
        {groep('Contractvorm', 'contract', tellingen.contract)}
        {groep('Opleidingsniveau', 'opleiding', tellingen.opleiding)}

        <fieldset className="filter-groep">
          <h4 style={{ margin: '0 0 .2rem' }}>Extra</h4>
          <label className="keuze">
            <input
              type="checkbox"
              checked={params.get('spoed') === '1'}
              onChange={() => wissel('spoed', '1', false)}
            />
            <span className="vink"><Icoon naam="vinkje" w={13} /></span>
            <span>Alleen spoedvacatures</span>
            <span className="telling">{spoedAantal}</span>
          </label>
        </fieldset>

        <button
          type="button"
          className="knop knop--leeg knop--breed"
          onClick={() => router.push('/vacatures')}
        >
          <Icoon naam="kruis" w={16} /> Wis alle filters
        </button>
        <button type="submit" className="knop knop--breed filter-sluit">
          Toon resultaten
        </button>
      </form>

      <button
        type="button"
        className="knop knop--inkt mobiel-filterknop"
        onClick={() => setOpen(true)}
      >
        <Icoon naam="filter" w={17} /> Filters{actieveAantal ? ` (${actieveAantal})` : ''}
      </button>
    </>
  );
}
