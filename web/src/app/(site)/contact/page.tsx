import { supabasePubliek } from '@/lib/publiek';
import { Icoon } from '@/components/icoon';
import { Monogram } from '@/components/monogram';
import { BEDRIJF } from '@/lib/inhoud';
import { JobalertFormulier } from './jobalert';
import { haalSectoren } from '@/lib/publiek';

export const metadata = {
  title: 'Contact',
  description:
    'Bel, mail of app Clover Uitzendbureau. We reageren binnen één werkdag.',
};

export const revalidate = 3600;

export default async function Contact() {
  const [sectoren, { data: team }] = await Promise.all([
    haalSectoren(),
    supabasePubliek()
      .from('intercedenten')
      .select('naam, rol, telefoon, email')
      .eq('actief', true)
      .order('naam'),
  ]);

  return (
    <section className="sectie">
      <div className="wrap">
        <div className="sectie-kop" style={{ marginBottom: 'var(--ruimte-6)' }}>
          <span className="oogje">Contact</span>
          <h1>Even bellen werkt meestal het snelst</h1>
          <p className="lead">
            We zitten in Almere, maar werken door heel Nederland. Bellen, mailen of
            appen — wat je het prettigst vindt.
          </p>
        </div>

        <div className="bank" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px' }}>
          <div style={{ display: 'grid', gap: 'var(--ruimte-6)' }}>
            <div className="raster raster--2">
              <a className="kaart" href={`tel:${BEDRIJF.telRaw}`}>
                <span className="sector-icoon" style={{ color: 'var(--clover-600)' }}>
                  <Icoon naam="telefoon" w={22} />
                </span>
                <h2 style={{ fontSize: 'var(--t-lg)' }}>Bellen</h2>
                <p style={{ margin: 0, color: 'var(--inkt-75)' }}>{BEDRIJF.tel}</p>
                <small style={{ color: 'var(--inkt-60)' }}>ma t/m vr 08:30 – 17:30</small>
              </a>
              <a className="kaart" href={`mailto:${BEDRIJF.mail}`}>
                <span className="sector-icoon" style={{ color: 'var(--clover-600)' }}>
                  <Icoon naam="mail" w={22} />
                </span>
                <h2 style={{ fontSize: 'var(--t-lg)' }}>Mailen</h2>
                <p style={{ margin: 0, color: 'var(--inkt-75)' }}>{BEDRIJF.mail}</p>
                <small style={{ color: 'var(--inkt-60)' }}>Antwoord binnen 1 werkdag</small>
              </a>
              <a className="kaart" href={`https://wa.me/${BEDRIJF.whatsapp.replace(/\D/g, '')}`}
                 target="_blank" rel="noopener">
                <span className="sector-icoon" style={{ color: 'var(--clover-600)' }}>
                  <Icoon naam="whatsapp" w={22} />
                </span>
                <h2 style={{ fontSize: 'var(--t-lg)' }}>WhatsApp</h2>
                <p style={{ margin: 0, color: 'var(--inkt-75)' }}>{BEDRIJF.whatsapp}</p>
                <small style={{ color: 'var(--inkt-60)' }}>Ook voor solliciteren</small>
              </a>
              <div className="kaart">
                <span className="sector-icoon" style={{ color: 'var(--clover-600)' }}>
                  <Icoon naam="pin" w={22} />
                </span>
                <h2 style={{ fontSize: 'var(--t-lg)' }}>Langskomen</h2>
                <p style={{ margin: 0, color: 'var(--inkt-75)' }}>
                  {BEDRIJF.adres}<br />{BEDRIJF.postcode} {BEDRIJF.stad}
                </p>
                <small style={{ color: 'var(--inkt-60)' }}>Inloop op woensdag 15:00 – 17:00</small>
              </div>
            </div>

            {team && team.length > 0 && (
              <div>
                <h2 style={{ fontSize: 'var(--t-2xl)', marginBottom: 'var(--ruimte-4)' }}>
                  Je vaste contactpersonen
                </h2>
                <div className="raster raster--3">
                  {team.map((t, i) => (
                    <div className="kaart" key={t.email}>
                      <div className="rij" style={{ gap: '.75rem' }}>
                        <Monogram naam={t.naam} tint={i} />
                        <span>
                          <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', display: 'block' }}>
                            {t.naam}
                          </b>
                          <small style={{ color: 'var(--inkt-60)' }}>{t.rol}</small>
                        </span>
                      </div>
                      <div className="rij" style={{ gap: '.5rem' }}>
                        {t.telefoon && (
                          <a className="knop knop--leeg" href={`tel:${t.telefoon.replace(/\s/g, '')}`}>
                            <Icoon naam="telefoon" w={15} /> Bellen
                          </a>
                        )}
                        <a className="knop knop--leeg" href={`mailto:${t.email}`}>
                          <Icoon naam="mail" w={15} /> Mailen
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="kaart" style={{ background: 'var(--clover-050)', borderColor: 'var(--clover-200)', alignSelf: 'start' }}>
            <h2 style={{ fontSize: 'var(--t-xl)' }}>Jobalert</h2>
            <p style={{ color: 'var(--inkt-75)', fontSize: '.9375rem', margin: 0 }}>
              Nog niks gevonden? Laat je mailadres achter, dan sturen we je een bericht
              zodra er werk voorbijkomt dat past.
            </p>
            <JobalertFormulier sectoren={sectoren.map((s) => ({ id: s.id, naam: s.naam }))} />
          </aside>
        </div>
      </div>
    </section>
  );
}
