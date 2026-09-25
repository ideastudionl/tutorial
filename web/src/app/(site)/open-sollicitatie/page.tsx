import { SollicitatieFormulier } from '../vacatures/[slug]/formulier';

export const metadata = {
  title: 'Open sollicitatie',
  description:
    'Staat jouw baan er niet tussen? Stuur een open sollicitatie — we hebben lang ' +
    'niet alles online staan.',
};

export default function OpenSollicitatie() {
  return (
    <section className="sectie">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="sectie-kop" style={{ marginBottom: 'var(--ruimte-5)' }}>
          <span className="oogje">Open sollicitatie</span>
          <h1>Staat jouw baan er niet tussen?</h1>
          <p className="lead">
            We hebben lang niet alles online staan — veel opdrachtgevers vragen ons
            rechtstreeks. Laat weten wat je zoekt, dan bellen we je zodra er iets
            voorbijkomt dat past.
          </p>
        </div>
        <SollicitatieFormulier />
      </div>
    </section>
  );
}
