import Link from 'next/link';
import { haalSectoren, online, type PubliekeVacature } from '@/lib/publiek';
import { Icoon } from '@/components/icoon';

export const metadata = {
  title: 'Sectoren',
  description:
    'Techniek, bouw, logistiek, productie, zorg, horeca, kantoor en schoonmaak — ' +
    'de sectoren waarin Clover Uitzendbureau bemiddelt.',
};

export const revalidate = 300;

export default async function Sectoren() {
  const [sectoren, { data }] = await Promise.all([haalSectoren(), online()]);
  const vacatures = (data ?? []) as unknown as PubliekeVacature[];
  const perSector = (id: string) => vacatures.filter((v) => v.sector_id === id).length;

  return (
    <section className="sectie">
      <div className="wrap">
        <div className="sectie-kop" style={{ marginBottom: 'var(--ruimte-6)' }}>
          <span className="oogje">Sectoren</span>
          <h1>We kennen de werkvloer</h1>
          <p className="lead">
            In elke sector werkt een intercedent die de taal spreekt. Dat scheelt je
            uitleggen wat een reachtruck is, of waarom een VCA-pasje er toe doet.
          </p>
        </div>

        <div className="raster raster--3">
          {sectoren.map((s) => (
            <Link
              key={s.id}
              className="sector-kaart"
              href={`/vacatures?sector=${s.id}`}
              style={{
                ['--sector-kleur' as string]: s.kleur,
                ['--sector-zacht' as string]: s.kleur_zacht,
              }}
            >
              <span className="sector-icoon" style={{ color: s.kleur }}>
                <Icoon naam={s.icoon} w={22} />
              </span>
              <h2 style={{ fontSize: 'var(--t-xl)' }}>{s.naam}</h2>
              <p>{s.pitch}</p>
              <span className="telling-regel">
                {perSector(s.id)} {perSector(s.id) === 1 ? 'vacature' : 'vacatures'}
                <Icoon naam="pijl" w={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
