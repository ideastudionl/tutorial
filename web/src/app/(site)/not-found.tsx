import Link from 'next/link';
import { Icoon } from '@/components/icoon';

export default function NietGevonden() {
  return (
    <section className="sectie">
      <div className="wrap" style={{ maxWidth: 620, textAlign: 'center' }}>
        <span className="oogje">404</span>
        <h1>Deze pagina bestaat niet (meer)</h1>
        <p className="lead">
          Misschien is de vacature vervuld of het adres verouderd. Bekijk de
          vacaturebank — de kans is groot dat er iets anders bij zit.
        </p>
        <div className="rij" style={{ justifyContent: 'center', marginTop: 'var(--ruimte-5)' }}>
          <Link className="knop knop--groot" href="/vacatures">
            Naar de vacatures <Icoon naam="pijl" w={18} />
          </Link>
          <Link className="knop knop--leeg knop--groot" href="/">Naar de homepage</Link>
        </div>
      </div>
    </section>
  );
}
