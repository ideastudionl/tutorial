import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { datum, euro, STATUS_LABEL } from '@/lib/types';
import type { VacatureStatus } from '@/lib/types';

export const metadata = { title: 'Vacatures — Clover beheer' };
export const dynamic = 'force-dynamic';

export default async function VacatureLijst({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; zoek?: string; sector?: string }>;
}) {
  const { status, zoek, sector } = await searchParams;
  const supabase = await supabaseServer();

  let query = supabase
    .from('vacatures')
    .select('id, nummer, titel, plaats, status, spoed, uren, uurloon_min, uurloon_max, gepubliceerd_op, vervalt_op, sectoren(naam, kleur), intercedenten(naam)')
    .order('gewijzigd_op', { ascending: false });

  if (status && status !== 'alle') query = query.eq('status', status);
  if (sector) query = query.eq('sector_id', sector);
  if (zoek) query = query.ilike('zoektekst', `%${zoek.toLowerCase()}%`);

  const [{ data: vacatures, error }, { data: sectoren }] = await Promise.all([
    query,
    supabase.from('sectoren').select('id, naam').order('volgorde'),
  ]);

  const filters: { waarde: string; label: string }[] = [
    { waarde: 'alle', label: 'Alle' },
    { waarde: 'online', label: 'Online' },
    { waarde: 'concept', label: 'Concept' },
    { waarde: 'vervuld', label: 'Vervuld' },
    { waarde: 'gearchiveerd', label: 'Gearchiveerd' },
  ];
  const actief = status ?? 'alle';

  return (
    <>
      <div className="kop">
        <div>
          <h1>Vacatures</h1>
          <p>{vacatures?.length ?? 0} {vacatures?.length === 1 ? 'vacature' : 'vacatures'} gevonden.</p>
        </div>
        <Link className="knop" href="/beheer/vacatures/nieuw">Nieuwe vacature</Link>
      </div>

      <form className="kaart" style={{ marginBottom: '1rem', display: 'grid', gap: '.75rem' }}>
        <div className="form-rij">
          <div className="veld">
            <label htmlFor="zoek">Zoeken</label>
            <input id="zoek" name="zoek" type="search" defaultValue={zoek ?? ''}
                   placeholder="functie, plaats of bedrijf" />
          </div>
          <div className="veld">
            <label htmlFor="sector">Sector</label>
            <select id="sector" name="sector" defaultValue={sector ?? ''}>
              <option value="">Alle sectoren</option>
              {sectoren?.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>
          <div className="veld">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={actief}>
              {filters.map((f) => <option key={f.waarde} value={f.waarde}>{f.label}</option>)}
            </select>
          </div>
          <div className="veld" style={{ alignSelf: 'end' }}>
            <button className="knop" type="submit">Filteren</button>
          </div>
        </div>
      </form>

      {error && <p className="melding melding-fout">Ophalen mislukt: {error.message}</p>}

      <div className="tabelwrap">
        {vacatures?.length ? (
          <div className="tabelscroll">
            <table>
              <thead>
                <tr>
                  <th>Vacature</th><th>Sector</th><th>Status</th>
                  <th>Uren</th><th>Uurloon</th><th>Verloopt</th><th></th>
                </tr>
              </thead>
              <tbody>
                {vacatures.map((v) => {
                  const s = v.sectoren as unknown as { naam: string; kleur: string } | null;
                  const i = v.intercedenten as unknown as { naam: string } | null;
                  return (
                    <tr key={v.id}>
                      <td>
                        <Link href={`/beheer/vacatures/${v.id}`} className="rij-titel">
                          {v.spoed && <span className="pil pil-spoed" style={{ marginRight: '.4rem' }}>Spoed</span>}
                          {v.titel}
                        </Link>
                        <span className="rij-sub">
                          {v.nummer} · {v.plaats}{i ? ` · ${i.naam}` : ''}
                        </span>
                      </td>
                      <td>
                        {s && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.8125rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.kleur, flex: 'none' }} />
                            {s.naam}
                          </span>
                        )}
                      </td>
                      <td><span className={`pil pil-${v.status}`}>{STATUS_LABEL[v.status as VacatureStatus]}</span></td>
                      <td className="num">{v.uren}</td>
                      <td className="num">{euro(v.uurloon_min)} – {euro(v.uurloon_max)}</td>
                      <td className="num">{datum(v.vervalt_op)}</td>
                      <td>
                        <Link className="knop knop-leeg knop-klein" href={`/beheer/vacatures/${v.id}`}>
                          Bewerken
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="leeg">
            Geen vacatures met deze filters.<br />
            <Link href="/beheer/vacatures" style={{ textDecoration: 'underline' }}>Filters wissen</Link>
          </p>
        )}
      </div>
    </>
  );
}
