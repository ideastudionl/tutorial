'use client';

import { useState } from 'react';
import Link from 'next/link';
import { vacatureOpslaan } from './acties';
import type { Intercedent, Sector, Vacature } from '@/lib/types';

const DIENSTVERBANDEN = ['Fulltime', 'Parttime', 'Bijbaan'];
const CONTRACTVORMEN = ['Uitzenden', 'Detachering', 'Werving & selectie', 'Tijdelijk werk'];
const OPLEIDINGEN = ['Geen diploma nodig', 'VMBO / MBO 1-2', 'MBO 3-4', 'HBO / WO'];
const STATUSSEN = ['concept', 'online', 'vervuld', 'gearchiveerd'];

export function VacatureFormulier({
  vacature, sectoren, intercedenten,
}: {
  vacature: Vacature | null;
  sectoren: Sector[];
  intercedenten: Intercedent[];
}) {
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<{ fout?: string; goed?: string } | null>(null);

  async function verstuur(formData: FormData) {
    setBezig(true);
    setMelding(null);
    const uitkomst = await vacatureOpslaan(vacature?.id ?? null, formData);
    setMelding(uitkomst ?? null);
    setBezig(false);
  }

  const v = vacature;

  return (
    <form action={verstuur} className="form">
      {melding?.fout && <p className="melding melding-fout">{melding.fout}</p>}
      {melding?.goed && <p className="melding melding-goed">{melding.goed}</p>}

      <section className="kaart form">
        <h2 style={{ fontSize: '1rem' }}>De functie</h2>

        <div className="form-rij">
          <div className="veld">
            <label htmlFor="titel">Functietitel</label>
            <input id="titel" name="titel" required defaultValue={v?.titel ?? ''}
                   placeholder="bijv. Servicemonteur Installatietechniek" />
            <span className="hulp">Dit is wat mensen in Google intikken — schrijf het zoals zij het zouden zeggen.</span>
          </div>
          <div className="veld">
            <label htmlFor="sector_id">Sector</label>
            <select id="sector_id" name="sector_id" required defaultValue={v?.sector_id ?? sectoren[0]?.id}>
              {sectoren.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>
        </div>

        <div className="form-rij">
          <div className="veld">
            <label htmlFor="plaats">Plaats</label>
            <input id="plaats" name="plaats" required defaultValue={v?.plaats ?? ''} />
          </div>
          <div className="veld">
            <label htmlFor="provincie">Provincie</label>
            <input id="provincie" name="provincie" required defaultValue={v?.provincie ?? ''} />
          </div>
          <div className="veld">
            <label htmlFor="intercedent_id">Contactpersoon</label>
            <select id="intercedent_id" name="intercedent_id" defaultValue={v?.intercedent_id ?? ''}>
              <option value="">Geen</option>
              {intercedenten.map((i) => <option key={i.id} value={i.id}>{i.naam}</option>)}
            </select>
          </div>
        </div>

        <div className="veld">
          <label htmlFor="bedrijf">Omschrijving van de opdrachtgever</label>
          <input id="bedrijf" name="bedrijf" required defaultValue={v?.bedrijf ?? ''}
                 placeholder="bijv. Landelijk installatiebedrijf (700+ medewerkers)" />
          <span className="hulp">Geen bedrijfsnaam als de opdrachtgever anoniem wil blijven.</span>
        </div>
      </section>

      <section className="kaart form">
        <h2 style={{ fontSize: '1rem' }}>Voorwaarden</h2>

        <div className="form-rij">
          <div className="veld">
            <label htmlFor="dienstverband">Dienstverband</label>
            <select id="dienstverband" name="dienstverband" defaultValue={v?.dienstverband ?? 'Fulltime'}>
              {DIENSTVERBANDEN.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="veld">
            <label htmlFor="contract">Contractvorm</label>
            <select id="contract" name="contract" defaultValue={v?.contract ?? 'Uitzenden'}>
              {CONTRACTVORMEN.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="veld">
            <label htmlFor="opleiding">Opleidingsniveau</label>
            <select id="opleiding" name="opleiding" defaultValue={v?.opleiding ?? 'Geen diploma nodig'}>
              {OPLEIDINGEN.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="form-rij">
          <div className="veld">
            <label htmlFor="uren">Uren per week</label>
            <input id="uren" name="uren" type="number" min={1} max={60} defaultValue={v?.uren ?? 40} />
          </div>
          <div className="veld">
            <label htmlFor="uurloon_min">Uurloon vanaf</label>
            <input id="uurloon_min" name="uurloon_min" type="number" step="0.05" min="0.05"
                   required defaultValue={v?.uurloon_min ?? ''} />
          </div>
          <div className="veld">
            <label htmlFor="uurloon_max">Uurloon tot</label>
            <input id="uurloon_max" name="uurloon_max" type="number" step="0.05" min="0.05"
                   required defaultValue={v?.uurloon_max ?? ''} />
          </div>
        </div>

        <div className="vinkrij">
          <label className="vink">
            <input type="checkbox" name="spoed" defaultChecked={v?.spoed} /> Spoedvacature
          </label>
          <label className="vink">
            <input type="checkbox" name="rijbewijs" defaultChecked={v?.rijbewijs} /> Rijbewijs nodig
          </label>
          <label className="vink">
            <input type="checkbox" name="ploegendienst" defaultChecked={v?.ploegendienst} /> Ploegendienst
          </label>
        </div>
      </section>

      <section className="kaart form">
        <h2 style={{ fontSize: '1rem' }}>De tekst</h2>

        <div className="veld">
          <label htmlFor="intro">Intro</label>
          <textarea id="intro" name="intro" required defaultValue={v?.intro ?? ''}
                    placeholder="Twee of drie zinnen die iemand laten zien hoe de dag eruitziet." />
        </div>

        <div className="form-rij">
          <div className="veld">
            <label htmlFor="taken">Wat ga je doen? <span className="opt">(één per regel)</span></label>
            <textarea id="taken" name="taken" defaultValue={v?.taken?.join('\n') ?? ''} />
          </div>
          <div className="veld">
            <label htmlFor="vraag">Wat vragen we? <span className="opt">(één per regel)</span></label>
            <textarea id="vraag" name="vraag" defaultValue={v?.vraag?.join('\n') ?? ''} />
          </div>
          <div className="veld">
            <label htmlFor="bieden">Wat bieden we? <span className="opt">(één per regel)</span></label>
            <textarea id="bieden" name="bieden" defaultValue={v?.bieden?.join('\n') ?? ''} />
          </div>
        </div>
      </section>

      <section className="kaart form">
        <h2 style={{ fontSize: '1rem' }}>Publicatie</h2>
        <div className="form-rij">
          <div className="veld">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={v?.status ?? 'concept'}>
              {STATUSSEN.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="hulp">Alleen “online” is zichtbaar op de site.</span>
          </div>
          <div className="veld">
            <label htmlFor="vervalt_op">Verloopt op</label>
            <input id="vervalt_op" name="vervalt_op" type="date"
                   defaultValue={v?.vervalt_op ?? ''} />
            <span className="hulp">
              Google straft sites af die vervulde vacatures laten staan. Vul dit altijd in.
            </span>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <button className="knop" type="submit" disabled={bezig}>
          {bezig ? 'Opslaan…' : v ? 'Wijzigingen opslaan' : 'Vacature aanmaken'}
        </button>
        <Link className="knop knop-leeg" href="/beheer/vacatures">Terug naar de lijst</Link>
      </div>
    </form>
  );
}
