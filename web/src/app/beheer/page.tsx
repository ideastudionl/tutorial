import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { datum, euro, STATUS_LABEL, SOLLICITATIE_LABEL } from '@/lib/types';
import type { SollicitatieStatus, VacatureStatus } from '@/lib/types';

export const metadata = { title: 'Dashboard — Clover beheer' };
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = await supabaseServer();

  const [vacatures, sollicitaties, aanvragen, perSector] = await Promise.all([
    supabase.from('vacatures').select('id, status, spoed, vervalt_op'),
    supabase
      .from('sollicitaties')
      .select('id, naam, status, aangemaakt_op, vacature_id, vacatures(titel, plaats)')
      .order('aangemaakt_op', { ascending: false })
      .limit(6),
    supabase.from('aanvragen').select('id, status'),
    supabase.from('vacatures').select('sector_id, sectoren(naam, kleur)').eq('status', 'online'),
  ]);

  const alle = vacatures.data ?? [];
  const online = alle.filter((v) => v.status === 'online');
  const spoed = online.filter((v) => v.spoed);
  const vervaltBinnenkort = online.filter((v) => {
    if (!v.vervalt_op) return false;
    const dagen = (new Date(v.vervalt_op).getTime() - Date.now()) / 86_400_000;
    return dagen <= 14;
  });

  const nieuweAanvragen = (aanvragen.data ?? []).filter((a) => a.status === 'nieuw');

  // Tellen per sector, aflopend
  const sectorTelling = new Map<string, { naam: string; kleur: string; n: number }>();
  for (const rij of perSector.data ?? []) {
    const s = rij.sectoren as unknown as { naam: string; kleur: string } | null;
    if (!s) continue;
    const huidig = sectorTelling.get(rij.sector_id) ?? { naam: s.naam, kleur: s.kleur, n: 0 };
    huidig.n += 1;
    sectorTelling.set(rij.sector_id, huidig);
  }
  const sectoren = [...sectorTelling.values()].sort((a, b) => b.n - a.n);
  const grootste = sectoren[0]?.n ?? 1;

  return (
    <>
      <div className="kop">
        <div>
          <h1>Dashboard</h1>
          <p>Hoe de vacaturebank er vandaag voor staat.</p>
        </div>
        <Link className="knop" href="/beheer/vacatures/nieuw">Nieuwe vacature</Link>
      </div>

      <div className="raster raster-4" style={{ marginBottom: '1.5rem' }}>
        <Tegel getal={online.length} label="vacatures online" />
        <Tegel
          getal={(sollicitaties.data ?? []).filter((s) => s.status === 'nieuw').length}
          label="nieuwe sollicitaties"
          accent={(sollicitaties.data ?? []).some((s) => s.status === 'nieuw') ? 'nieuw' : undefined}
        />
        <Tegel getal={spoed.length} label="spoedvacatures" accent={spoed.length ? 'spoed' : undefined} />
        <Tegel
          getal={vervaltBinnenkort.length}
          label="verlopen binnen 14 dagen"
          accent={vervaltBinnenkort.length ? 'nieuw' : undefined}
        />
      </div>

      <div className="raster" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        <section className="tabelwrap">
          <div style={{ padding: '.9rem 1rem', borderBottom: '1px solid var(--lijn)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>Laatste sollicitaties</h2>
            <Link className="knop knop-leeg knop-klein" href="/beheer/sollicitaties">Alles bekijken</Link>
          </div>
          {sollicitaties.data?.length ? (
            <div className="tabelscroll">
              <table>
                <thead>
                  <tr><th>Kandidaat</th><th>Vacature</th><th>Status</th><th>Binnengekomen</th></tr>
                </thead>
                <tbody>
                  {sollicitaties.data.map((s) => {
                    const v = s.vacatures as unknown as { titel: string; plaats: string } | null;
                    return (
                      <tr key={s.id}>
                        <td><span className="rij-titel">{s.naam}</span></td>
                        <td>
                          {v ? (
                            <>
                              <span className="rij-titel" style={{ fontWeight: 500 }}>{v.titel}</span>
                              <span className="rij-sub">{v.plaats}</span>
                            </>
                          ) : <span className="rij-sub">Open sollicitatie</span>}
                        </td>
                        <td><span className={`pil pil-${s.status}`}>{SOLLICITATIE_LABEL[s.status as SollicitatieStatus]}</span></td>
                        <td className="num">{datum(s.aangemaakt_op)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="leeg">
              Nog geen sollicitaties binnen.<br />
              <span style={{ fontSize: '.8125rem' }}>
                Het sollicitatieformulier wordt in het volgende blok aangesloten.
              </span>
            </p>
          )}
        </section>

        <section className="kaart">
          <h2 style={{ fontSize: '1rem', marginBottom: '.9rem' }}>Online per sector</h2>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            {sectoren.map((s) => (
              <div key={s.naam} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '.4rem .7rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.8125rem' }}>{s.naam}</span>
                <span className="num" style={{ fontSize: '.8125rem', fontWeight: 600 }}>{s.n}</span>
                <span style={{ gridColumn: '1 / -1', height: 5, borderRadius: 99, background: 'var(--grijs-200)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: `${(s.n / grootste) * 100}%`, background: s.kleur, borderRadius: 99 }} />
                </span>
              </div>
            ))}
          </div>

          {nieuweAanvragen.length > 0 && (
            <p className="melding melding-goed" style={{ marginTop: '1rem' }}>
              {nieuweAanvragen.length} nieuwe personeelsaanvraag
              {nieuweAanvragen.length === 1 ? '' : 'en'} van opdrachtgevers.
            </p>
          )}
        </section>
      </div>

      <section className="kaart" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '.6rem' }}>Statusverdeling</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {(['online', 'concept', 'vervuld', 'gearchiveerd'] as VacatureStatus[]).map((st) => (
            <span key={st} className={`pil pil-${st}`}>
              {STATUS_LABEL[st]}: {alle.filter((v) => v.status === st).length}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '.75rem', color: 'var(--inkt-60)', marginTop: '.75rem' }}>
          Uurloon in de bank loopt van {euro(13)} tot {euro(34)} bruto per uur.
        </p>
      </section>
    </>
  );
}

function Tegel({ getal, label, accent }: { getal: number; label: string; accent?: string }) {
  return (
    <div className="kaart cijfer">
      <b>{getal}</b>
      <span>{label}</span>
      {accent && <span className={`pil pil-${accent}`} style={{ marginTop: '.2rem' }}>vraagt aandacht</span>}
    </div>
  );
}
