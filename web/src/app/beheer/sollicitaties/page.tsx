import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { datum, SOLLICITATIE_LABEL } from '@/lib/types';
import type { SollicitatieStatus } from '@/lib/types';

export const metadata = { title: 'Sollicitaties — Clover beheer' };
export const dynamic = 'force-dynamic';

export default async function Sollicitaties() {
  const supabase = await supabaseServer();

  const { data: sollicitaties, error } = await supabase
    .from('sollicitaties')
    .select('id, naam, telefoon, email, status, bron, cv_pad, bewaren_tot, aangemaakt_op, vacatures(titel, plaats)')
    .order('aangemaakt_op', { ascending: false });

  return (
    <>
      <div className="kop">
        <div>
          <h1>Sollicitaties</h1>
          <p>Alles wat via de site en WhatsApp binnenkomt, met status.</p>
        </div>
      </div>

      {error && <p className="melding melding-fout">Ophalen mislukt: {error.message}</p>}

      <div className="tabelwrap">
        {sollicitaties?.length ? (
          <div className="tabelscroll">
            <table>
              <thead>
                <tr>
                  <th>Kandidaat</th><th>Vacature</th><th>Status</th>
                  <th>Cv</th><th>Binnen</th><th>Bewaren tot</th>
                </tr>
              </thead>
              <tbody>
                {sollicitaties.map((s) => {
                  const v = s.vacatures as unknown as { titel: string; plaats: string } | null;
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/beheer/sollicitaties/${s.id}`} className="rij-titel">
                          {s.naam}
                        </Link>
                        <span className="rij-sub">{s.telefoon}{s.email ? ` · ${s.email}` : ''}</span>
                      </td>
                      <td>{v ? `${v.titel} — ${v.plaats}` : <span className="rij-sub">Open sollicitatie</span>}</td>
                      <td>
                        <span className={`pil pil-${s.status}`}>
                          {SOLLICITATIE_LABEL[s.status as SollicitatieStatus]}
                        </span>
                      </td>
                      <td className="rij-sub">{s.cv_pad ? 'ja' : '—'}</td>
                      <td className="num">{datum(s.aangemaakt_op)}</td>
                      <td className="num rij-sub">{datum(s.bewaren_tot)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="leeg">
            <p style={{ fontWeight: 600, color: 'var(--inkt)' }}>Nog geen sollicitaties</p>
            <p style={{ fontSize: '.875rem', marginTop: '.4rem' }}>
              Zodra iemand op de site solliciteert, verschijnt het hier — met cv,
              motivatie en een bevestigingsmail naar de kandidaat.
            </p>
          </div>
        )}
      </div>

      <p className="melding melding-goed" style={{ marginTop: '1rem' }}>
        <b>AVG:</b> elke sollicitatie krijgt automatisch een bewaartermijn van vier weken.
        Een geplande taak ruimt op wat verlopen is.
      </p>
    </>
  );
}
