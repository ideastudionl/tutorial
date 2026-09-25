import Link from 'next/link';
import { haalSectoren, online, type PubliekeVacature } from '@/lib/publiek';
import { VacatureKaart } from '@/components/vacaturekaart';
import { Icoon } from '@/components/icoon';
import { Filterpaneel } from './filters';

export const metadata = {
  title: 'Vacatures',
  description:
    'Alle openstaande vacatures van Clover Uitzendbureau. Filter op sector, ' +
    'plaats, uren en contractvorm.',
};

export const revalidate = 60;

type Zoek = Record<string, string | string[] | undefined>;

const lijst = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

export default async function Vacaturebank({
  searchParams,
}: { searchParams: Promise<Zoek> }) {
  const zoek = await searchParams;
  const [sectoren, { data }] = await Promise.all([
    haalSectoren(),
    online().order('spoed', { ascending: false }).order('gepubliceerd_op', { ascending: false }),
  ]);

  const alle = (data ?? []) as unknown as PubliekeVacature[];
  const sectorVan = (id: string) => sectoren.find((s) => s.id === id);

  // Filteren gebeurt hier en niet in de database: het zijn een paar
  // honderd vacatures, en zo blijft de pagina één zoekopdracht.
  const term = String(zoek.term ?? '').trim().toLowerCase();
  const plaats = String(zoek.plaats ?? '').trim().toLowerCase();
  const sectors = lijst(zoek.sector);
  const contracten = lijst(zoek.contract);
  const dienstverbanden = lijst(zoek.dienstverband);
  const opleidingen = lijst(zoek.opleiding);
  const spoed = zoek.spoed === '1';
  const sorteer = String(zoek.sorteer ?? 'nieuw');

  const gevonden = alle.filter((v) => {
    if (spoed && !v.spoed) return false;
    if (sectors.length && !sectors.includes(v.sector_id)) return false;
    if (contracten.length && !contracten.includes(v.contract)) return false;
    if (dienstverbanden.length && !dienstverbanden.includes(v.dienstverband)) return false;
    if (opleidingen.length && !opleidingen.includes(v.opleiding)) return false;
    if (plaats && !v.plaats.toLowerCase().includes(plaats)) return false;
    if (term) {
      const hooi = `${v.titel} ${v.bedrijf} ${v.plaats} ${v.intro}`.toLowerCase();
      if (!hooi.includes(term)) return false;
    }
    return true;
  });

  if (sorteer === 'loon') gevonden.sort((a, b) => b.uurloon_max - a.uurloon_max);
  if (sorteer === 'uren') gevonden.sort((a, b) => b.uren - a.uren);

  const tel = (fn: (v: PubliekeVacature) => boolean) => alle.filter(fn).length;

  return (
    <>
      <section className="sectie sectie--strak sectie--tint" style={{ borderBottom: '1px solid var(--lijn)' }}>
        <div className="wrap">
          <div className="sectie-kop" style={{ marginBottom: 'var(--ruimte-5)' }}>
            <span className="oogje">Vacaturebank</span>
            <h1>Vind werk dat bij je past</h1>
            <p className="lead">
              Filter op sector, plaats, uren en contractvorm. Je filters staan in de
              adresbalk, dus je kunt deze pagina zo doorsturen naar wie je maar wil.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--sectie)' }}>
        <div className="wrap">
          <div className="bank">
            <Filterpaneel
              sectoren={sectoren.map((s) => ({
                id: s.id, naam: s.naam, aantal: tel((v) => v.sector_id === s.id),
              }))}
              tellingen={{
                contract: ['Uitzenden', 'Detachering', 'Werving & selectie', 'Tijdelijk werk']
                  .map((w) => ({ waarde: w, aantal: tel((v) => v.contract === w) })),
                dienstverband: ['Fulltime', 'Parttime', 'Bijbaan']
                  .map((w) => ({ waarde: w, aantal: tel((v) => v.dienstverband === w) })),
                opleiding: ['Geen diploma nodig', 'VMBO / MBO 1-2', 'MBO 3-4', 'HBO / WO']
                  .map((w) => ({ waarde: w, aantal: tel((v) => v.opleiding === w) })),
              }}
              spoedAantal={tel((v) => v.spoed)}
            />

            <div>
              <div className="rij rij--tussen" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
                <p style={{ margin: 0, color: 'var(--inkt-60)' }}>
                  <strong style={{ color: 'var(--inkt)' }}>{gevonden.length}</strong>{' '}
                  {gevonden.length === 1 ? 'vacature' : 'vacatures'}
                  {gevonden.length !== alle.length && ` van ${alle.length}`}
                </p>
              </div>

              {gevonden.length ? (
                <div className="vac-raster">
                  {gevonden.map((v) => (
                    <VacatureKaart key={v.id} vacature={v} sector={sectorVan(v.sector_id)} />
                  ))}
                </div>
              ) : (
                <div className="kaart" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                    Niets gevonden met deze filters.
                  </p>
                  <p style={{ color: 'var(--inkt-60)' }}>
                    Probeer een bredere zoekterm, of bekijk alle vacatures.
                  </p>
                  <Link className="knop" href="/vacatures" style={{ marginTop: '1rem' }}>
                    Filters wissen <Icoon naam="pijl" w={17} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
