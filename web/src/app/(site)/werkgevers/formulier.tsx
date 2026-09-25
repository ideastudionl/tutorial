'use client';

import { useState, useTransition } from 'react';
import { Icoon } from '@/components/icoon';
import { personeelAanvragen } from '@/app/acties';

export function AanvraagFormulier({
  sectoren,
}: { sectoren: { id: string; naam: string }[] }) {
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState<string | null>(null);
  const [gelukt, setGelukt] = useState(false);

  if (gelukt) {
    return (
      <div className="succes">
        <span className="succes-vink">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--clover-600)"
               strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4.5 12.5 4.5 4.5 10-10" />
          </svg>
        </span>
        <h3 style={{ fontSize: 'var(--t-2xl)' }}>Aanvraag ontvangen</h3>
        <p className="lead" style={{ textAlign: 'center' }}>
          Een intercedent belt u binnen één werkdag om de details door te nemen.
          U krijgt ook een bevestiging per e-mail.
        </p>
        <a className="knop knop--wit" href="tel:+31361234567">
          <Icoon naam="telefoon" w={17} /> Of bel ons alvast
        </a>
      </div>
    );
  }

  return (
    <form
      className="formulier"
      action={(fd) => {
        setFout(null);
        start(async () => {
          const uitkomst = await personeelAanvragen(fd);
          if (uitkomst.fout) setFout(uitkomst.fout);
          else setGelukt(true);
        });
      }}
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
             style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      <div className="form-rij">
        <div className="invoer">
          <label htmlFor="w-bedrijf">Bedrijfsnaam</label>
          <input id="w-bedrijf" name="bedrijf" required placeholder="Uw bedrijf" />
        </div>
        <div className="invoer">
          <label htmlFor="w-contact">Contactpersoon</label>
          <input id="w-contact" name="contactpersoon" required placeholder="Voor- en achternaam" />
        </div>
      </div>

      <div className="form-rij">
        <div className="invoer">
          <label htmlFor="w-mail">E-mailadres</label>
          <input id="w-mail" name="email" type="email" required placeholder="naam@bedrijf.nl" />
        </div>
        <div className="invoer">
          <label htmlFor="w-tel">Telefoonnummer</label>
          <input id="w-tel" name="telefoon" type="tel" required placeholder="036 123 45 67" />
        </div>
      </div>

      <div className="form-rij">
        <div className="invoer">
          <label htmlFor="w-sector">Sector</label>
          <select id="w-sector" name="sector_id" defaultValue="">
            <option value="">Kies een sector</option>
            {sectoren.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
          </select>
        </div>
        <div className="invoer">
          <label htmlFor="w-dienst">Dienst</label>
          <select id="w-dienst" name="dienst" defaultValue="Uitzenden">
            <option>Uitzenden</option>
            <option>Detachering</option>
            <option>Werving &amp; selectie</option>
            <option>Payroll</option>
            <option>Weet ik nog niet</option>
          </select>
        </div>
      </div>

      <div className="form-rij">
        <div className="invoer">
          <label htmlFor="w-aantal">Aantal medewerkers</label>
          <input id="w-aantal" name="aantal" type="number" min={1} max={500} defaultValue={1} />
        </div>
        <div className="invoer">
          <label htmlFor="w-start">Gewenste startdatum <span className="opt">(optioneel)</span></label>
          <input id="w-start" name="startdatum" type="date" />
        </div>
      </div>

      <div className="invoer">
        <label htmlFor="w-toelichting">
          Waar zoekt u mensen voor? <span className="opt">(optioneel)</span>
        </label>
        <textarea id="w-toelichting" name="omschrijving"
                  placeholder="Functie, werktijden, locatie — hoe meer we weten, hoe scherper we selecteren." />
      </div>

      {fout && <p className="form-melding form-melding--fout" role="alert">{fout}</p>}

      <button className="knop knop--breed knop--groot" type="submit" disabled={bezig}>
        {bezig ? 'Bezig met versturen…' : <>Aanvraag versturen <Icoon naam="pijl" w={18} /></>}
      </button>

      <div className="rij" style={{
        justifyContent: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--inkt-60)',
      }}>
        <Icoon naam="klok" w={15} /> <span>Reactie binnen 1 werkdag</span>
      </div>
    </form>
  );
}
