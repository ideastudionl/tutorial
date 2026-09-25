import { Klaver } from '@/lib/klaver';
import { InlogFormulier } from './formulier';

export const metadata = { title: 'Inloggen — Clover beheer' };

export default async function InloggenPagina({
  searchParams,
}: {
  searchParams: Promise<{ verder?: string; fout?: string }>;
}) {
  const { verder, fout } = await searchParams;

  return (
    <main className="inlogscherm">
      <div className="inlogkaart">
        <div className="merk">
          <Klaver size={34} />
          <span>
            <b>Clover</b>
            <small>Beheeromgeving</small>
          </span>
        </div>

        <div>
          <h1 style={{ fontSize: '1.375rem' }}>Inloggen</h1>
          <p style={{ color: 'var(--inkt-60)', marginTop: '.3rem', fontSize: '.875rem' }}>
            Alleen voor medewerkers van Clover.
          </p>
        </div>

        {fout && <p className="melding melding-fout">{fout}</p>}

        <InlogFormulier verder={verder} />

        <p className="demo-strook">
          <b>Demo-omgeving.</b> De gegevens in dit paneel zijn voorbeeldmateriaal.
        </p>
      </div>
    </main>
  );
}
