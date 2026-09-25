'use client';

import { useState, useTransition } from 'react';
import { Icoon } from '@/components/icoon';
import { jobalertAanmelden } from '@/app/acties';

export function JobalertFormulier({
  sectoren,
}: { sectoren: { id: string; naam: string }[] }) {
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState<string | null>(null);
  const [gelukt, setGelukt] = useState(false);

  if (gelukt) {
    return (
      <p className="form-melding form-melding--goed">
        Gelukt. Je krijgt een bevestiging in je mailbox; uitschrijven kan met één klik.
      </p>
    );
  }

  return (
    <form
      className="formulier"
      action={(fd) => {
        setFout(null);
        start(async () => {
          const uitkomst = await jobalertAanmelden(fd);
          if (uitkomst.fout) setFout(uitkomst.fout);
          else setGelukt(true);
        });
      }}
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
             style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      <div className="invoer">
        <label htmlFor="ja-mail">E-mailadres</label>
        <input id="ja-mail" name="email" type="email" required placeholder="jouw@email.nl" />
      </div>
      <div className="invoer">
        <label htmlFor="ja-sector">Sector <span className="opt">(optioneel)</span></label>
        <select id="ja-sector" name="sector_id" defaultValue="">
          <option value="">Alle sectoren</option>
          {sectoren.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
        </select>
      </div>
      <div className="invoer">
        <label htmlFor="ja-plaats">Omgeving <span className="opt">(optioneel)</span></label>
        <input id="ja-plaats" name="plaats" placeholder="Almere" />
      </div>

      {fout && <p className="form-melding form-melding--fout" role="alert">{fout}</p>}

      <button className="knop knop--breed" type="submit" disabled={bezig}>
        {bezig ? 'Bezig…' : <>Zet jobalert aan <Icoon naam="bel" w={17} /></>}
      </button>
    </form>
  );
}
