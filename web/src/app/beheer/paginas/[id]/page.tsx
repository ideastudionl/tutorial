import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { PaginaFormulier } from '../formulier';
import { sectiesNaarTekst, type Sectie } from '@/lib/secties';

export const dynamic = 'force-dynamic';

const LEEG = {
  id: null, slug: null, titel: '', status: 'concept', intro: '',
  sectiesTekst: '', meta_titel: '', meta_omschrijving: '', systeempagina: false,
};

export default async function PaginaBewerken({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ opgeslagen?: string }>;
}) {
  const { id } = await params;
  const { opgeslagen } = await searchParams;

  if (id === 'nieuw') {
    return (
      <>
        <div className="kop"><h1>Nieuwe pagina</h1></div>
        <PaginaFormulier pagina={LEEG} />
      </>
    );
  }

  const supabase = await supabaseServer();
  const { data: pagina } = await supabase
    .from('paginas').select('*').eq('id', id).maybeSingle();

  if (!pagina) notFound();

  const secties = Array.isArray(pagina.secties)
    ? (pagina.secties as Sectie[])
    : [];

  return (
    <>
      <div className="kop">
        <div>
          <h1>{pagina.titel}</h1>
          <p>/{pagina.slug}</p>
        </div>
      </div>
      {opgeslagen && <p className="melding melding-goed">Pagina aangemaakt.</p>}
      <PaginaFormulier
        pagina={{
          id: pagina.id,
          slug: pagina.slug,
          titel: pagina.titel,
          status: pagina.status,
          intro: pagina.intro ?? '',
          sectiesTekst: sectiesNaarTekst(secties),
          meta_titel: pagina.meta_titel ?? '',
          meta_omschrijving: pagina.meta_omschrijving ?? '',
          systeempagina: pagina.systeempagina,
        }}
      />
    </>
  );
}
