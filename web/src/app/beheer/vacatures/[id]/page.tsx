import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { VacatureFormulier } from '../formulier';
import { datum, STATUS_LABEL } from '@/lib/types';
import type { Intercedent, Sector, Vacature, VacatureStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function VacatureBewerken({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ opgeslagen?: string }>;
}) {
  const { id } = await params;
  const { opgeslagen } = await searchParams;
  const supabase = await supabaseServer();
  const nieuw = id === 'nieuw';

  const [vacatureResultaat, { data: sectoren }, { data: intercedenten }] = await Promise.all([
    nieuw
      ? Promise.resolve({ data: null })
      : supabase.from('vacatures').select('*').eq('id', id).maybeSingle(),
    supabase.from('sectoren').select('*').order('volgorde'),
    supabase.from('intercedenten').select('*').eq('actief', true).order('naam'),
  ]);

  const vacature = vacatureResultaat.data as Vacature | null;
  if (!nieuw && !vacature) notFound();

  return (
    <>
      <div className="kop">
        <div>
          <p style={{ fontSize: '.75rem', color: 'var(--inkt-60)', marginBottom: '.2rem' }}>
            <Link href="/beheer/vacatures" style={{ textDecoration: 'underline' }}>Vacatures</Link>
            {' / '}{nieuw ? 'Nieuw' : vacature!.nummer}
          </p>
          <h1>{nieuw ? 'Nieuwe vacature' : vacature!.titel}</h1>
          {vacature && (
            <p>
              <span className={`pil pil-${vacature.status}`}>
                {STATUS_LABEL[vacature.status as VacatureStatus]}
              </span>
              {' '}Laatst gewijzigd {datum(vacature.gewijzigd_op)}
              {vacature.status === 'online' && (
                <> · op de site als <code style={{ fontSize: '.8125rem' }}>/vacatures/{vacature.slug}</code></>
              )}
            </p>
          )}
        </div>
      </div>

      {opgeslagen && <p className="melding melding-goed" style={{ marginBottom: '1rem' }}>
        Vacature aangemaakt.
      </p>}

      <VacatureFormulier
        vacature={vacature}
        sectoren={(sectoren ?? []) as Sector[]}
        intercedenten={(intercedenten ?? []) as Intercedent[]}
      />
    </>
  );
}
