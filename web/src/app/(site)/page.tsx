import Link from 'next/link';
import { haalSectoren, online, euro, type PubliekeVacature } from '@/lib/publiek';
import { VacatureKaart } from '@/components/vacaturekaart';
import { Icoon } from '@/components/icoon';
import { GoogleBadge, GooglePaneel, ReviewKaart } from '@/components/google';
import { REVIEWS_WERKZOEKEND, REVIEWS_WERKGEVER, GOOGLE, BEDRIJF } from '@/lib/inhoud';
import { Herozoek } from './herozoek';

export const revalidate = 300;

export default async function Home() {
  const [sectoren, { data }] = await Promise.all([
    haalSectoren(),
    online().order('gepubliceerd_op', { ascending: false }).limit(60),
  ]);

  const vacatures = (data ?? []) as unknown as PubliekeVacature[];
  const sectorVan = (id: string) => sectoren.find((s) => s.id === id);
  const uitgelicht = vacatures.slice(0, 6);
  const paneelrijen = vacatures.slice(0, 5);
  const perSector = (id: string) => vacatures.filter((v) => v.sector_id === id).length;

  return (
    <>
      <section className="hero hero--donker">
        <div className="wrap">
          <div className="hero-raster">
            <div className="hero-tekst">
              <span className="oogje">Uitzenden · Detacheren · Werving &amp; selectie</span>
              <h1>
                Werk dat klopt.<br />
                <span className="markeer">Mensen</span> die blijven.
              </h1>
              <p className="lead">
                Clover bemiddelt vakmensen in {sectoren.length} sectoren. Eén vaste
                contactpersoon die de werkvloer kent, een voorselectie die klopt, en
                afspraken die we nakomen — bij de eerste plaatsing en bij de honderdste.
              </p>

              <Herozoek sectoren={sectoren.map((s) => ({ id: s.id, naam: s.naam }))} />

              <div className="rij" style={{ gap: '1rem' }}>
                <GoogleBadge />
                <ul className="hero-bewijs" style={{ gap: '.35rem 1rem' }}>
                  <li><Icoon naam="vink" w={15} /> {vacatures.length} actuele vacatures</li>
                  <li><Icoon naam="vink" w={15} /> Reactie binnen 1 werkdag</li>
                  <li><Icoon naam="vink" w={15} /> SNA / NEN 4400-1 gecertificeerd</li>
                </ul>
              </div>
            </div>

            <div className="hero-beeld">
              <div className="toon-paneel">
                <div className="toon-balk">
                  <span className="stip" /><span className="stip" /><span className="stip" />
                  <span style={{ marginLeft: '.5rem' }}>
                    Vacaturebank · {vacatures.length} resultaten
                  </span>
                </div>
                {paneelrijen.map((v, i) => {
                  const s = sectorVan(v.sector_id);
                  return (
                    <div
                      key={v.id}
                      className={`toon-rij${i === 0 ? ' is-actief' : ''}`}
                      style={{
                        ['--sector-kleur' as string]: s?.kleur,
                        ['--sector-zacht' as string]: s?.kleur_zacht,
                      }}
                    >
                      <span className="merkje"><Icoon naam={s?.icoon ?? 'koffer'} w={17} /></span>
                      <span style={{ minWidth: 0 }}>
                        <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.titel}
                        </b>
                        <small>{v.plaats} · {v.uren} uur · {v.dienstverband}</small>
                      </span>
                      <span className="loon">{euro(v.uurloon_min)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="raster raster--2" style={{ gap: '.75rem', marginTop: '.75rem' }}>
                {[
                  { icoon: 'klok', groot: '48 uur', klein: 'tot de eerste kandidaat' },
                  { icoon: 'schild', groot: '96%', klein: 'maakt de opdracht af' },
                ].map((k) => (
                  <div key={k.groot} className="kaart kaart--zacht"
                       style={{ flexDirection: 'row', alignItems: 'center', gap: '.7rem', padding: '.85rem 1rem' }}>
                    <span className="icoontje" style={{ color: 'var(--clover-600)', flex: 'none' }}>
                      <Icoon naam={k.icoon} w={20} />
                    </span>
                    <span>
                      <b style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', display: 'block', lineHeight: 1.2 }}>
                        {k.groot}
                      </b>
                      <small style={{ fontSize: 'var(--t-xs)', color: 'var(--inkt-60)' }}>{k.klein}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Twee paden */}
      <section className="sectie sectie--tint">
        <div className="wrap">
          <div className="sectie-kop">
            <span className="oogje">Waar sta jij?</span>
            <h2>Kies je route. De rest doen wij.</h2>
          </div>
          <div className="split">
            <Link className="pad-kaart" href="/vacatures">
              <span className="pad-nummer">01 — Werkzoekend</span>
              <h3 style={{ fontSize: 'var(--t-2xl)' }}>Ik zoek werk</h3>
              <p style={{ color: 'var(--inkt-75)' }}>
                Filter op sector, plaats en uren. Solliciteer in één minuut, met of zonder cv.
              </p>
              <ul>
                <li><Icoon naam="vink" w={18} /> <span>{vacatures.length} vacatures, dagelijks bijgewerkt</span></li>
                <li><Icoon naam="vink" w={18} /> <span>Solliciteren zonder cv of via WhatsApp</span></li>
                <li><Icoon naam="vink" w={18} /> <span>Wekelijkse uitbetaling, uren in de app</span></li>
              </ul>
              <span className="knop knop--groot" style={{ justifySelf: 'start' }}>
                Bekijk vacatures <Icoon naam="pijl" w={18} />
              </span>
            </Link>

            <Link className="pad-kaart pad-kaart--werkgever" href="/werkgevers">
              <span className="pad-nummer">02 — Opdrachtgever</span>
              <h3 style={{ fontSize: 'var(--t-2xl)' }}>Ik zoek personeel</h3>
              <p style={{ color: 'var(--inkt-75)' }}>
                Vertel wat u nodig heeft. Wij komen langs, selecteren scherp en sturen
                maximaal drie kandidaten.
              </p>
              <ul>
                <li><Icoon naam="vink" w={18} /> <span>Eerste kandidaten binnen 48 uur</span></li>
                <li><Icoon naam="vink" w={18} /> <span>Transparante omrekenfactor, geen verrassingen</span></li>
                <li><Icoon naam="vink" w={18} /> <span>NEN 4400-1: uw aansprakelijkheid afgedekt</span></li>
              </ul>
              <span className="knop knop--groot" style={{ justifySelf: 'start' }}>
                Personeel aanvragen <Icoon naam="pijl" w={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sectoren */}
      <section className="sectie">
        <div className="wrap">
          <div className="sectie-kop sectie-kop--split">
            <div>
              <span className="oogje">Sectoren</span>
              <h2>We kennen de werkvloer</h2>
            </div>
            <Link className="knop knop--leeg" href="/sectoren">
              Alle sectoren <Icoon naam="pijl" w={17} />
            </Link>
          </div>
          <div className="raster raster--4">
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
                <h3>{s.naam}</h3>
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

      {/* Uitgelichte vacatures */}
      <section className="sectie sectie--tint">
        <div className="wrap">
          <div className="sectie-kop sectie-kop--split">
            <div>
              <span className="oogje">Vers binnen</span>
              <h2>Vacatures van deze week</h2>
            </div>
            <Link className="knop knop--leeg" href="/vacatures">
              Alle vacatures <Icoon naam="pijl" w={17} />
            </Link>
          </div>
          {uitgelicht.length ? (
            <div className="raster raster--3">
              {uitgelicht.map((v) => (
                <VacatureKaart key={v.id} vacature={v} sector={sectorVan(v.sector_id)} />
              ))}
            </div>
          ) : (
            <p className="lead">
              Er staan op dit moment geen vacatures online. Bel ons gerust —
              we hebben lang niet alles op de site staan.
            </p>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="sectie">
        <div className="wrap">
          <div className="sectie-kop">
            <span className="oogje">Wat anderen zeggen</span>
            <h2>Beoordeeld met een {String(GOOGLE.score).replace('.', ',')}</h2>
          </div>
          <div className="bank" style={{ gridTemplateColumns: '300px minmax(0,1fr)' }}>
            <GooglePaneel />
            <div className="raster raster--2" style={{ alignContent: 'start' }}>
              {[...REVIEWS_WERKZOEKEND, ...REVIEWS_WERKGEVER].map((r, i) => (
                <ReviewKaart key={r.naam} r={r} tint={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slot */}
      <section className="sectie sectie--donker">
        <div className="wrap">
          <div className="cta-blok">
            <div>
              <h2>Zullen we even bellen?</h2>
              <p className="lead">
                Eén gesprek van tien minuten is meestal genoeg om te weten of we iets
                voor elkaar kunnen betekenen.
              </p>
            </div>
            <div className="rij">
              <a className="knop knop--wit knop--groot" href={`tel:${BEDRIJF.telRaw}`}>
                <Icoon naam="telefoon" w={18} /> {BEDRIJF.tel}
              </a>
              <Link className="knop knop--leeg knop--groot" href="/contact"
                    style={{
                      ['--knop-tekst' as string]: 'var(--grijs-050)',
                      ['--knop-rand' as string]: 'rgba(247,248,247,.3)',
                      ['--knop-bg-hover' as string]: 'rgba(247,248,247,.1)',
                    }}>
                Stuur een bericht <Icoon naam="pijl" w={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
