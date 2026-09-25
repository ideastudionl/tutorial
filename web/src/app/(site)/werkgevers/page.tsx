import { haalSectoren } from '@/lib/publiek';
import { Icoon } from '@/components/icoon';
import { GoogleBadge, ReviewKaart } from '@/components/google';
import { REVIEWS_WERKGEVER, BEDRIJF } from '@/lib/inhoud';
import { AanvraagFormulier } from './formulier';

export const metadata = {
  title: 'Voor werkgevers',
  description:
    'Personeel nodig? Clover levert vakmensen via uitzenden, detachering en werving ' +
    '& selectie. Eerste kandidaten binnen 48 uur, NEN 4400-1 gecertificeerd.',
};

export const revalidate = 3600;

const DIENSTEN = [
  {
    icoon: 'mensen', titel: 'Uitzenden',
    tekst: 'Flexibele capaciteit voor pieken, ziekte en seizoen. Wij zijn werkgever, u stuurt aan.',
  },
  {
    icoon: 'koffer', titel: 'Detachering',
    tekst: 'Een vakman voor langere tijd op uw project, met een vast contract bij ons.',
  },
  {
    icoon: 'zoek', titel: 'Werving & selectie',
    tekst: 'Wij zoeken, u neemt zelf in dienst. Eén tarief bij plaatsing, verder niets.',
  },
  {
    icoon: 'document', titel: 'Payroll & ZZP',
    tekst: 'U vindt ze zelf, wij regelen het werkgeverschap en de administratie.',
  },
];

const STAPPEN = [
  { kop: 'We komen langs', tekst: 'Een uur op de werkvloer zegt meer dan een vacaturetekst.' },
  { kop: 'We selecteren scherp', tekst: 'Maximaal drie kandidaten, allemaal gesproken en nagetrokken.' },
  { kop: 'U kiest', tekst: 'Kennismaken op uw locatie. Klikt het niet, dan zoeken we door.' },
  { kop: 'We blijven bellen', tekst: 'Na week één, week vier en daarna elk kwartaal.' },
];

export default async function Werkgevers() {
  const sectoren = await haalSectoren();

  return (
    <>
      <section className="hero hero--donker">
        <div className="wrap">
          <div className="hero-raster">
            <div className="hero-tekst">
              <span className="oogje">Voor werkgevers</span>
              <h1>Vakmensen die <span className="markeer">blijven</span>.</h1>
              <p className="lead">
                Geen stapel cv&apos;s, maar maximaal drie kandidaten die we zelf gesproken
                hebben. Eerste kandidaten binnen 48 uur, een tarief zonder kleine
                lettertjes, en een aansprakelijkheid die is afgedekt.
              </p>
              <div className="rij" style={{ gap: '1rem' }}>
                <GoogleBadge />
                <ul className="hero-bewijs" style={{ gap: '.35rem 1rem' }}>
                  <li><Icoon naam="vink" w={15} /> NEN 4400-1 &amp; SNA</li>
                  <li><Icoon naam="vink" w={15} /> ABU-lid</li>
                  <li><Icoon naam="vink" w={15} /> Inlenersbeloning geborgd</li>
                </ul>
              </div>
            </div>

            <div className="hero-beeld" id="aanvraag" style={{ scrollMarginTop: '100px' }}>
              <div className="kaart" style={{ background: 'var(--wit)' }}>
                <h2 style={{ fontSize: 'var(--t-xl)' }}>Personeel aanvragen</h2>
                <p style={{ color: 'var(--inkt-75)', fontSize: '.9375rem', margin: 0 }}>
                  Vul in wat u zoekt. We bellen binnen één werkdag.
                </p>
                <AanvraagFormulier
                  sectoren={sectoren.map((s) => ({ id: s.id, naam: s.naam }))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sectie" id="diensten" style={{ scrollMarginTop: '90px' }}>
        <div className="wrap">
          <div className="sectie-kop">
            <span className="oogje">Diensten</span>
            <h2>Vier manieren om samen te werken</h2>
          </div>
          <div className="raster raster--4">
            {DIENSTEN.map((d) => (
              <div key={d.titel} className="kaart">
                <span className="sector-icoon" style={{ color: 'var(--clover-600)' }}>
                  <Icoon naam={d.icoon} w={22} />
                </span>
                <h3 style={{ fontSize: 'var(--t-lg)' }}>{d.titel}</h3>
                <p style={{ color: 'var(--inkt-75)', fontSize: '.9375rem', margin: 0 }}>{d.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sectie sectie--tint">
        <div className="wrap">
          <div className="sectie-kop">
            <span className="oogje">Werkwijze</span>
            <h2>Van aanvraag tot eerste werkdag</h2>
          </div>
          <ol className="stappen">
            {STAPPEN.map((s) => (
              <li className="stap" key={s.kop}>
                <span className="stap-bol" />
                <div>
                  <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{s.kop}</b>
                  <p style={{ color: 'var(--inkt-75)', margin: '.25rem 0 0' }}>{s.tekst}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sectie">
        <div className="wrap">
          <div className="sectie-kop">
            <span className="oogje">Opdrachtgevers</span>
            <h2>Wat zij ervan vinden</h2>
          </div>
          <div className="raster raster--3">
            {REVIEWS_WERKGEVER.map((r, i) => <ReviewKaart key={r.naam} r={r} tint={i + 3} />)}
          </div>
        </div>
      </section>

      <section className="sectie sectie--donker">
        <div className="wrap">
          <div className="cta-blok">
            <div>
              <h2>Liever meteen even bellen?</h2>
              <p className="lead">Tien minuten is meestal genoeg om te weten of het past.</p>
            </div>
            <a className="knop knop--wit knop--groot" href={`tel:${BEDRIJF.telRaw}`}>
              <Icoon naam="telefoon" w={18} /> {BEDRIJF.tel}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
