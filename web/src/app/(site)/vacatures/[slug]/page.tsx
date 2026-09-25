import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  supabasePubliek, online, haalSectoren, bedrag, geplaatst,
  type PubliekeVacature,
} from '@/lib/publiek';
import { VacatureKaart } from '@/components/vacaturekaart';
import { Icoon } from '@/components/icoon';
import { Monogram } from '@/components/monogram';
import { SollicitatieFormulier } from './formulier';

export const revalidate = 60;

async function haalVacature(slug: string) {
  const { data } = await online().eq('slug', slug).maybeSingle();
  return (data ?? null) as unknown as PubliekeVacature | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const v = await haalVacature(slug);
  if (!v) return { title: 'Vacature niet gevonden' };
  return {
    title: `${v.titel} in ${v.plaats}`,
    description: v.intro.slice(0, 155),
    alternates: { canonical: `/vacatures/${v.slug}` },
    openGraph: { title: `${v.titel} in ${v.plaats}`, description: v.intro.slice(0, 155) },
  };
}

export default async function VacatureDetail(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const v = await haalVacature(slug);
  if (!v) notFound();

  const [sectoren, { data: gelijkendRuw }, { data: intercedent }] = await Promise.all([
    haalSectoren(),
    online().eq('sector_id', v.sector_id).neq('id', v.id).limit(3),
    supabasePubliek()
      .from('intercedenten')
      .select('naam, rol, telefoon, email')
      .eq('actief', true)
      .limit(1)
      .maybeSingle(),
  ]);

  const s = sectoren.find((x) => x.id === v.sector_id);
  const gelijkend = (gelijkendRuw ?? []) as unknown as PubliekeVacature[];

  // Google leest dit blok om de vacature in Google for Jobs te tonen.
  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: v.titel,
    description: [
      `<p>${v.intro}</p>`,
      v.taken.length ? `<h3>Wat ga je doen?</h3><ul>${v.taken.map((t) => `<li>${t}</li>`).join('')}</ul>` : '',
      v.vraag.length ? `<h3>Wat vragen we?</h3><ul>${v.vraag.map((t) => `<li>${t}</li>`).join('')}</ul>` : '',
      v.bieden.length ? `<h3>Wat bieden we?</h3><ul>${v.bieden.map((t) => `<li>${t}</li>`).join('')}</ul>` : '',
    ].join(''),
    identifier: { '@type': 'PropertyValue', name: 'Clover Uitzendbureau', value: v.nummer },
    datePosted: v.gepubliceerd_op,
    validThrough: v.vervalt_op ?? undefined,
    employmentType: v.dienstverband === 'Fulltime' ? 'FULL_TIME' : 'PART_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Clover Uitzendbureau',
      sameAs: process.env.NEXT_PUBLIC_SITE_URL,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: v.plaats,
        addressRegion: v.provincie,
        addressCountry: 'NL',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: v.uurloon_min,
        maxValue: v.uurloon_max,
        unitText: 'HOUR',
      },
    },
  };

  const lichtOpDonker = {
    ['--knop-tekst' as string]: 'var(--grijs-050)',
    ['--knop-rand' as string]: 'rgba(247,248,247,.3)',
    ['--knop-bg-hover' as string]: 'rgba(247,248,247,.1)',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting) }}
      />

      <section
        className="sectie sectie--strak"
        style={{ background: s?.kleur_zacht, borderBottom: '1px solid var(--lijn)' }}
      >
        <div className="wrap">
          <nav className="kruimels" aria-label="Kruimelpad">
            <Link href="/">Home</Link> <span>/</span>{' '}
            <Link href="/vacatures">Vacatures</Link> <span>/</span>{' '}
            <Link href={`/vacatures?sector=${v.sector_id}`}>{s?.naam}</Link> <span>/</span>{' '}
            <span style={{ color: 'var(--inkt)' }}>{v.titel}</span>
          </nav>

          <div className="rij" style={{ gap: '.4rem', marginBottom: 'var(--ruimte-4)' }}>
            {v.spoed && (
              <span className="label label--spoed"><Icoon naam="bliksem" w={13} /> Spoed</span>
            )}
            <span className="label" style={{ background: 'var(--wit)' }}>{s?.naam}</span>
            <span className="label label--rand">{v.contract}</span>
          </div>

          <h1 style={{ maxWidth: '20ch' }}>{v.titel}</h1>

          <ul className="vac-meta" style={{ marginTop: 'var(--ruimte-4)', fontSize: '1rem' }}>
            <li><Icoon naam="pin" w={17} /> {v.plaats}, {v.provincie}</li>
            <li><Icoon naam="klok" w={17} /> {v.uren} uur per week</li>
            <li><Icoon naam="euro" w={17} /> {bedrag(v.uurloon_min)} – {bedrag(v.uurloon_max)} p/u</li>
            <li><Icoon naam="koffer" w={17} /> {v.dienstverband}</li>
            <li><Icoon naam="klok" w={17} /> {geplaatst(v.gepubliceerd_op)}</li>
          </ul>
        </div>
      </section>

      <section className="sectie">
        <div className="wrap">
          <div className="detail">
            <article className="prose">
              <p className="lead" style={{ color: 'var(--inkt)', fontWeight: 500 }}>{v.intro}</p>

              {v.taken.length > 0 && (
                <div>
                  <h2>Wat ga je doen?</h2>
                  <ul>{v.taken.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}
              {v.vraag.length > 0 && (
                <div>
                  <h2>Wat vragen we van je?</h2>
                  <ul>{v.vraag.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}
              {v.bieden.length > 0 && (
                <div>
                  <h2>Wat krijg je ervoor terug?</h2>
                  <ul>{v.bieden.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}

              <div>
                <h2>Over de werkplek</h2>
                <p>
                  {v.bedrijf}. We vertellen je graag meer over het team en de sfeer voordat
                  je op gesprek gaat — we zijn er zelf geweest.
                </p>
              </div>

              <div className="kaart kaart--zacht"
                   style={{ background: 'var(--clover-050)', borderColor: 'var(--clover-200)' }}>
                <div className="rij" style={{ gap: '.75rem' }}>
                  <span className="sector-icoon"
                        style={{ width: 44, height: 44, background: 'var(--wit)' }}>
                    <Icoon naam="schild" w={20} />
                  </span>
                  <div>
                    <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                      Inlenersbeloning gegarandeerd
                    </b>
                    <p style={{ fontSize: '.9375rem', color: 'var(--inkt-75)', margin: 0 }}>
                      Je verdient vanaf dag één hetzelfde als een vaste collega in dezelfde
                      functie, inclusief toeslagen en reiskosten.
                    </p>
                  </div>
                </div>
              </div>

              <div id="solliciteren" style={{ scrollMarginTop: '100px' }}>
                <h2>Solliciteren</h2>
                <SollicitatieFormulier vacatureId={v.id} titel={v.titel} />
              </div>
            </article>

            <aside className="solliciteer-kaart">
              <h2 style={{ fontSize: 'var(--t-xl)' }}>Solliciteren duurt 1 minuut</h2>
              <p className="lead" style={{ fontSize: '.9375rem' }}>
                Een cv mag, maar hoeft niet. We bellen je binnen één werkdag terug.
              </p>
              <a className="knop knop--wit knop--breed knop--groot" href="#solliciteren">
                Solliciteer direct <Icoon naam="pijl" w={18} />
              </a>
              <a
                className="knop knop--leeg knop--breed"
                style={lichtOpDonker}
                href={`https://wa.me/31612345678?text=${encodeURIComponent(
                  `Hoi Clover, ik heb interesse in de vacature ${v.titel} (${v.nummer}).`,
                )}`}
                target="_blank"
                rel="noopener"
              >
                <Icoon naam="whatsapp" w={18} /> Solliciteer via WhatsApp
              </a>

              <dl>
                <div><dt>Vacaturenummer</dt><dd>{v.nummer}</dd></div>
                <div><dt>Contractvorm</dt><dd>{v.contract}</dd></div>
                <div><dt>Opleiding</dt><dd>{v.opleiding}</dd></div>
                <div><dt>Rijbewijs</dt><dd>{v.rijbewijs ? 'Nodig' : 'Niet nodig'}</dd></div>
                <div><dt>Ploegendienst</dt><dd>{v.ploegendienst ? 'Ja' : 'Nee'}</dd></div>
              </dl>

              {intercedent && (
                <>
                  <div className="recruiter">
                    <Monogram naam={intercedent.naam} />
                    <span>
                      <b>{intercedent.naam}</b>
                      <small>{intercedent.rol}</small>
                    </span>
                  </div>
                  <div className="rij" style={{ gap: '.5rem', flexWrap: 'nowrap' }}>
                    {intercedent.telefoon && (
                      <a className="knop knop--leeg" style={{ flex: 1, ...lichtOpDonker }}
                         href={`tel:${intercedent.telefoon.replace(/\s/g, '')}`}>
                        <Icoon naam="telefoon" w={16} /> Bellen
                      </a>
                    )}
                    <a className="knop knop--leeg" style={{ flex: 1, ...lichtOpDonker }}
                       href={`mailto:${intercedent.email}`}>
                      <Icoon naam="mail" w={16} /> Mailen
                    </a>
                  </div>
                </>
              )}
            </aside>
          </div>

          {gelijkend.length > 0 && (
            <div style={{ marginTop: 'var(--sectie)' }}>
              <div className="sectie-kop sectie-kop--split">
                <h2>Vergelijkbare vacatures</h2>
                <Link className="knop knop--leeg" href={`/vacatures?sector=${v.sector_id}`}>
                  Meer in {s?.naam} <Icoon naam="pijl" w={17} />
                </Link>
              </div>
              <div className="raster raster--3">
                {gelijkend.map((x) => (
                  <VacatureKaart key={x.id} vacature={x} sector={s} kort />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
