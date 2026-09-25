import Link from 'next/link';
import { Icoon } from './icoon';
import { euro, dagenOud, type PubliekeVacature, type PubliekeSector } from '@/lib/publiek';

export function VacatureKaart({
  vacature: v, sector: s, kort = false,
}: {
  vacature: PubliekeVacature;
  sector?: PubliekeSector;
  kort?: boolean;
}) {
  const nieuw = dagenOud(v.gepubliceerd_op) <= 2;

  return (
    <Link
      className="vac-kaart"
      href={`/vacatures/${v.slug}`}
      style={{
        ['--sector-kleur' as string]: s?.kleur ?? 'var(--clover-500)',
        ['--sector-zacht' as string]: s?.kleur_zacht ?? 'var(--clover-100)',
      }}
      aria-label={`${v.titel} in ${v.plaats}`}
    >
      <div className="vac-top">
        <div style={{ display: 'grid', gap: '.35rem' }}>
          <span className="vac-sector">{s?.naam ?? 'Vacature'}</span>
          <h3>{v.titel}</h3>
        </div>
        <span className="vac-logo" style={{ color: s?.kleur }}>
          <Icoon naam={s?.icoon ?? 'koffer'} w={24} />
        </span>
      </div>

      <div className="rij" style={{ gap: '.4rem' }}>
        {v.spoed && (
          <span className="label label--spoed"><Icoon naam="bliksem" w={13} /> Spoed</span>
        )}
        {nieuw && <span className="label label--nieuw">Nieuw</span>}
        <span className="label label--rand">{v.contract}</span>
        <span className="label label--rand">{v.dienstverband}</span>
      </div>

      <ul className="vac-meta">
        <li><Icoon naam="pin" w={15} /> {v.plaats}</li>
        <li><Icoon naam="klok" w={15} /> {v.uren} uur p/w</li>
        <li><Icoon naam="document" w={15} /> {v.opleiding}</li>
      </ul>

      {!kort && (
        <p style={{ color: 'var(--inkt-75)', fontSize: '.9375rem', margin: 0 }}>
          {v.intro.slice(0, 118)}…
        </p>
      )}

      <div className="vac-voet">
        <span className="vac-salaris">
          {euro(v.uurloon_min)} – {euro(v.uurloon_max)}<small>bruto per uur</small>
        </span>
        <span className="link-pijl" style={{ fontSize: '.9375rem' }}>
          Bekijk <Icoon naam="pijl" w={17} />
        </span>
      </div>
    </Link>
  );
}
