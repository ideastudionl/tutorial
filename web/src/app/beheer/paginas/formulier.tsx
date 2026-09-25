'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { paginaOpslaan } from './acties';

export type PaginaVelden = {
  id: string | null;
  slug: string | null;
  titel: string;
  status: string;
  intro: string;
  sectiesTekst: string;
  meta_titel: string;
  meta_omschrijving: string;
  systeempagina: boolean;
};

export function PaginaFormulier({ pagina }: { pagina: PaginaVelden }) {
  const [bezig, start] = useTransition();
  const [melding, setMelding] = useState<{ fout?: string; goed?: string } | null>(null);

  return (
    <form
      action={(formData) => {
        setMelding(null);
        start(async () => {
          const uitkomst = await paginaOpslaan(pagina.id, formData);
          if (uitkomst) setMelding(uitkomst);
        });
      }}
      style={{ display: 'grid', gap: '1rem' }}
    >
      {melding?.fout && <p className="melding melding-fout">{melding.fout}</p>}
      {melding?.goed && <p className="melding melding-goed">{melding.goed}</p>}

      <div className="kaart" style={{ display: 'grid', gap: '.75rem' }}>
        <div className="form-rij">
          <div className="veld" style={{ flex: 2 }}>
            <label htmlFor="titel">Titel</label>
            <input id="titel" name="titel" defaultValue={pagina.titel} required />
          </div>
          <div className="veld">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={pagina.status}>
              <option value="concept">Concept</option>
              <option value="online">Online</option>
              <option value="gearchiveerd">Gearchiveerd</option>
            </select>
          </div>
        </div>

        {pagina.slug && (
          <p style={{ fontSize: '.75rem', color: 'var(--inkt-60)' }}>
            Webadres: <code>/{pagina.slug}</code>
            {pagina.systeempagina && ' — vaste pagina, het adres verandert niet.'}
          </p>
        )}

        <div className="veld">
          <label htmlFor="intro">Intro</label>
          <textarea id="intro" name="intro" rows={3} defaultValue={pagina.intro} />
        </div>
      </div>

      <div className="kaart" style={{ display: 'grid', gap: '.5rem' }}>
        <div className="veld">
          <label htmlFor="secties">Secties</label>
          <textarea
            id="secties"
            name="secties"
            rows={16}
            defaultValue={pagina.sectiesTekst}
            style={{ fontFamily: 'var(--mono, ui-monospace, monospace)', fontSize: '.8125rem' }}
          />
        </div>
        <p style={{ fontSize: '.75rem', color: 'var(--inkt-60)' }}>
          Eerste regel van een blok is de kop, de regels daaronder de tekst. Laat
          een lege regel tussen twee blokken.
        </p>
      </div>

      <div className="kaart" style={{ display: 'grid', gap: '.75rem' }}>
        <h2 style={{ fontSize: '.9375rem' }}>Zoekmachines</h2>
        <div className="veld">
          <label htmlFor="meta_titel">Titel in Google</label>
          <input id="meta_titel" name="meta_titel" defaultValue={pagina.meta_titel}
                 maxLength={70} placeholder="Laat leeg om de paginatitel te gebruiken" />
        </div>
        <div className="veld">
          <label htmlFor="meta_omschrijving">Omschrijving in Google</label>
          <textarea id="meta_omschrijving" name="meta_omschrijving" rows={2}
                    maxLength={200} defaultValue={pagina.meta_omschrijving} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem' }}>
        <button className="knop" type="submit" disabled={bezig}>
          {bezig ? 'Opslaan…' : 'Opslaan'}
        </button>
        <Link className="knop knop-leeg" href="/beheer/paginas">Terug</Link>
      </div>
    </form>
  );
}
