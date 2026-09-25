'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { Icoon } from '@/components/icoon';
import { solliciteren } from '@/app/acties';

export function SollicitatieFormulier({
  vacatureId, titel,
}: { vacatureId?: string; titel?: string }) {
  const [bezig, start] = useTransition();
  const [fout, setFout] = useState<string | null>(null);
  const [gelukt, setGelukt] = useState(false);
  const [bestand, setBestand] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (gelukt) {
    return (
      <div className="succes" style={{ border: 'var(--rand)', borderRadius: 'var(--radius-l)', padding: 'var(--ruimte-6)' }}>
        <span className="succes-vink">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="var(--clover-600)"
               strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4.5 12.5 4.5 4.5 10-10" />
          </svg>
        </span>
        <h3 style={{ fontSize: 'var(--t-2xl)' }}>Gelukt — je sollicitatie staat bij ons binnen</h3>
        <p className="lead" style={{ textAlign: 'center' }}>
          Een van onze intercedenten kijkt ernaar en belt je binnen één werkdag.
          Heb je een e-mailadres achtergelaten, dan krijg je ook een bevestiging.
        </p>
        <div className="rij" style={{ justifyContent: 'center' }}>
          <a className="knop knop--leeg" href="tel:+31361234567">
            <Icoon naam="telefoon" w={17} /> Bel alvast zelf
          </a>
          <Link className="knop" href="/vacatures">
            Verder kijken <Icoon naam="pijl" w={17} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="formulier"
      action={(fd) => {
        setFout(null);
        start(async () => {
          const uitkomst = await solliciteren(fd);
          if (uitkomst.fout) setFout(uitkomst.fout);
          else setGelukt(true);
        });
      }}
    >
      {vacatureId && <input type="hidden" name="vacature_id" value={vacatureId} />}

      {/* Honeypot: onzichtbaar voor mensen, onweerstaanbaar voor bots. */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <div className="form-rij">
        <div className="invoer">
          <label htmlFor="s-naam">Je naam</label>
          <input id="s-naam" name="naam" required placeholder="Voor- en achternaam" />
        </div>
        <div className="invoer">
          <label htmlFor="s-tel">Telefoonnummer</label>
          <input id="s-tel" name="telefoon" type="tel" required placeholder="06 12 34 56 78" />
        </div>
      </div>

      <div className="invoer">
        <label htmlFor="s-mail">E-mailadres <span className="opt">(optioneel)</span></label>
        <input id="s-mail" name="email" type="email" placeholder="jouw@email.nl" />
        <span className="hulp">Vul je dit in, dan krijg je meteen een bevestiging.</span>
      </div>

      <div className="invoer">
        <label htmlFor="s-start">Wanneer kun je beginnen?</label>
        <select id="s-start" name="beschikbaar" defaultValue="Per direct">
          <option>Per direct</option>
          <option>Binnen 2 weken</option>
          <option>Binnen een maand</option>
          <option>In overleg</option>
        </select>
      </div>

      <div className="invoer">
        <label htmlFor="s-cv">Cv meesturen <span className="opt">(optioneel)</span></label>
        <label className="dropzone" htmlFor="s-cv">
          <Icoon naam="upload" w={28} />
          <b>{bestand ?? 'Klik om je cv te kiezen'}</b>
          <small>PDF, Word of een foto — max. 10 MB</small>
          <input
            id="s-cv"
            type="file"
            className="alleen-lezer"
            name="cv"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setBestand(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <span className="hulp">Geen cv? Geen probleem. We maken er samen één aan de telefoon.</span>
      </div>

      <div className="invoer">
        <label htmlFor="s-motivatie">
          Waarom deze baan? <span className="opt">(optioneel)</span>
        </label>
        <textarea id="s-motivatie" name="motivatie" placeholder="Eén of twee zinnen is genoeg." />
      </div>

      <label className="akkoord">
        <input type="checkbox" name="akkoord" required />
        <span>
          Ik ga akkoord met de <Link href="/privacy">privacyverklaring</Link> en wil gebeld
          worden over {titel ? 'deze vacature' : 'passend werk'}.
        </span>
      </label>

      {fout && <p className="form-melding form-melding--fout" role="alert">{fout}</p>}

      <button className="knop knop--breed knop--groot" type="submit" disabled={bezig}>
        {bezig ? 'Bezig met versturen…' : <>Verstuur sollicitatie <Icoon naam="pijl" w={18} /></>}
      </button>

      <div className="rij" style={{
        justifyContent: 'center', gap: '.5rem', fontSize: '.875rem', color: 'var(--inkt-60)',
      }}>
        <Icoon naam="klok" w={15} /> <span>Je hoort binnen 1 werkdag van ons</span>
      </div>
    </form>
  );
}
