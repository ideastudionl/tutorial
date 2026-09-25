'use client';

import { useState, useTransition } from 'react';
import { sollicitatieBijwerken, cvLink } from '../acties';
import { SOLLICITATIE_LABEL } from '@/lib/types';
import type { SollicitatieStatus } from '@/lib/types';

const STATUSSEN: SollicitatieStatus[] =
  ['nieuw', 'gebeld', 'voorgesteld', 'geplaatst', 'afgewezen'];

export function Behandelen({
  id, status, notitie, cvPad,
}: {
  id: string;
  status: SollicitatieStatus;
  notitie: string;
  cvPad: string | null;
  statusLabel: string;
}) {
  const [bezig, start] = useTransition();
  const [melding, setMelding] = useState<{ fout?: string; goed?: string } | null>(null);
  const [cvBezig, setCvBezig] = useState(false);

  async function openCv() {
    if (!cvPad) return;
    setCvBezig(true);
    const uitkomst = await cvLink(cvPad);
    setCvBezig(false);
    if (uitkomst.url) window.open(uitkomst.url, '_blank', 'noopener');
    else setMelding({ fout: uitkomst.fout ?? 'Cv openen lukte niet.' });
  }

  return (
    <aside className="kaart" style={{ display: 'grid', gap: '.85rem', alignSelf: 'start' }}>
      <h2 style={{ fontSize: '.9375rem' }}>Behandelen</h2>

      {melding?.fout && <p className="melding melding-fout">{melding.fout}</p>}
      {melding?.goed && <p className="melding melding-goed">{melding.goed}</p>}

      <div className="veld">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          defaultValue={status}
          disabled={bezig}
          onChange={(e) => {
            const nieuw = e.target.value;
            start(async () => {
              const u = await sollicitatieBijwerken(id, { status: nieuw });
              setMelding(u);
            });
          }}
        >
          {STATUSSEN.map((s) => (
            <option key={s} value={s}>{SOLLICITATIE_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {cvPad ? (
        <button className="knop knop-leeg" onClick={openCv} disabled={cvBezig}>
          {cvBezig ? 'Even geduld…' : 'Cv openen'}
        </button>
      ) : (
        <p style={{ fontSize: '.8125rem', color: 'var(--inkt-60)', margin: 0 }}>
          Geen cv meegestuurd.
        </p>
      )}

      <form
        action={(fd) => {
          start(async () => {
            const u = await sollicitatieBijwerken(id, {
              notitie: String(fd.get('notitie') ?? ''),
            });
            setMelding(u);
          });
        }}
        style={{ display: 'grid', gap: '.5rem' }}
      >
        <div className="veld">
          <label htmlFor="notitie">Notitie</label>
          <textarea id="notitie" name="notitie" rows={5} defaultValue={notitie}
                    placeholder="Wat is er besproken?" />
        </div>
        <button className="knop" type="submit" disabled={bezig}>
          {bezig ? 'Opslaan…' : 'Notitie opslaan'}
        </button>
      </form>
    </aside>
  );
}
