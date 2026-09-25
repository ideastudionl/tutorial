import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabasePubliek } from '@/lib/publiek';
import type { Sectie } from '@/lib/secties';

/**
 * De inhoudspagina's uit de database: Over Clover, Privacy, en alles
 * wat het kantoor er zelf bij maakt — via het beheer of via de
 * assistent. Alleen pagina's die op 'online' staan zijn hier zichtbaar;
 * dat regelt RLS, niet deze code.
 */

export const revalidate = 300;

type Pagina = {
  slug: string; titel: string; intro: string | null; secties: Sectie[];
  meta_titel: string | null; meta_omschrijving: string | null;
  gepubliceerd_op: string | null;
};

async function haalPagina(slug: string) {
  const { data } = await supabasePubliek()
    .from('paginas')
    .select('slug, titel, intro, secties, meta_titel, meta_omschrijving, gepubliceerd_op')
    .eq('slug', slug)
    .eq('status', 'online')
    .maybeSingle();
  return (data ?? null) as Pagina | null;
}

export async function generateStaticParams() {
  const { data } = await supabasePubliek()
    .from('paginas').select('slug').eq('status', 'online');
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const p = await haalPagina(slug);
  if (!p) return { title: 'Pagina niet gevonden' };
  return {
    title: p.meta_titel ?? p.titel,
    description: p.meta_omschrijving ?? p.intro?.slice(0, 155),
    alternates: { canonical: `/${p.slug}` },
  };
}

export default async function Inhoudspagina(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const p = await haalPagina(slug);
  if (!p) notFound();

  const secties = Array.isArray(p.secties) ? p.secties : [];

  return (
    <section className="sectie">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="sectie-kop" style={{ marginBottom: 'var(--ruimte-5)' }}>
          <h1>{p.titel}</h1>
          {p.intro && <p className="lead">{p.intro}</p>}
        </div>

        <article className="prose">
          {secties.map((s, i) => (
            <div key={i}>
              {s.kop && <h2>{s.kop}</h2>}
              {s.tekst.split(/\n+/).filter(Boolean).map((alinea, j) => (
                <p key={j}>{alinea}</p>
              ))}
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
