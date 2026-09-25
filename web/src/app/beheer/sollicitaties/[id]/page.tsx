import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { datum, SOLLICITATIE_LABEL } from '@/lib/types';
import type { SollicitatieStatus } from '@/lib/types';
import { Behandelen } from './behandelen';

export const dynamic = 'force-dynamic';

export default async function SollicitatieDetail(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: s } = await supabase
    .from('sollicitaties')
    .select('*, vacatures(titel, plaats, nummer, slug)')
    .eq('id', id)
    .maybeSingle();

  if (!s) notFound();
  const v = s.vacatures as unknown as
    { titel: string; plaats: string; nummer: string; slug: string } | null;

  return (
    <>
      <div className="kop">
        <div>
          <h1>{s.naam}</h1>
          <p>
            {v ? `${v.titel} — ${v.plaats} (${v.nummer})` : 'Open sollicitatie'}
            {' · '}binnengekomen {datum(s.aangemaakt_op)}
          </p>
        </div>
        <Link className="knop knop-leeg" href="/beheer/sollicitaties">Terug</Link>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="kaart" style={{ display: 'grid', gap: '.75rem' }}>
            <h2 style={{ fontSize: '.9375rem' }}>Gegevens</h2>
            <dl style={{ display: 'grid', gap: '.5rem', margin: 0 }}>
              <Rij kop="Telefoon"><a href={`tel:${s.telefoon.replace(/\s/g, '')}`}>{s.telefoon}</a></Rij>
              <Rij kop="E-mail">
                {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : '—'}
              </Rij>
              <Rij kop="Beschikbaar">{s.beschikbaar ?? '—'}</Rij>
              <Rij kop="Bron">{s.bron}</Rij>
              <Rij kop="Bewaren tot">{datum(s.bewaren_tot)}</Rij>
            </dl>
          </div>

          {s.motivatie && (
            <div className="kaart">
              <h2 style={{ fontSize: '.9375rem' }}>Motivatie</h2>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{s.motivatie}</p>
            </div>
          )}
        </div>

        <Behandelen
          id={s.id}
          status={s.status as SollicitatieStatus}
          notitie={s.notitie ?? ''}
          cvPad={s.cv_pad}
          statusLabel={SOLLICITATIE_LABEL[s.status as SollicitatieStatus]}
        />
      </div>
    </>
  );
}

function Rij({ kop, children }: { kop: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '.5rem' }}>
      <dt style={{ color: 'var(--inkt-60)', fontSize: '.8125rem' }}>{kop}</dt>
      <dd style={{ margin: 0, fontSize: '.875rem' }}>{children}</dd>
    </div>
  );
}
