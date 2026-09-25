import Link from 'next/link';
import { Klaver } from '@/lib/klaver';

const ZACHT = 'rgba(247, 248, 247,.7)';

export function Voet() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-raster">
          <div>
            <Link className="merk" href="/" style={{ color: 'var(--grijs-050)' }}>
              <span className="merk-mark"><Klaver size={40} /></span>
              <span className="merk-naam">
                Clo<span style={{ color: 'var(--clover-300)' }}>ver</span>
                <span className="merk-sub" style={{ color: 'rgba(247, 248, 247,.5)' }}>
                  Uitzendbureau
                </span>
              </span>
            </Link>
            <p style={{ color: ZACHT, marginTop: '1.25rem', maxWidth: '34ch' }}>
              Vakmensen en werkgevers bij elkaar brengen in acht sectoren. Met een vaste
              contactpersoon die de werkvloer kent.
            </p>
          </div>

          <nav aria-label="Voor werkzoekenden">
            <h4>Werkzoekenden</h4>
            <ul>
              <li><Link href="/vacatures">Alle vacatures</Link></li>
              <li><Link href="/vacatures?spoed=1">Spoedvacatures</Link></li>
              <li><Link href="/vacatures?dienstverband=Bijbaan">Bijbanen</Link></li>
              <li><Link href="/vacatures?opleiding=Geen+diploma+nodig">Zonder diploma</Link></li>
              <li><Link href="/sectoren">Sectoren</Link></li>
            </ul>
          </nav>

          <nav aria-label="Voor werkgevers">
            <h4>Werkgevers</h4>
            <ul>
              <li><Link href="/werkgevers">Personeel aanvragen</Link></li>
              <li><Link href="/werkgevers#diensten">Uitzenden</Link></li>
              <li><Link href="/werkgevers#diensten">Detachering</Link></li>
              <li><Link href="/werkgevers#diensten">Werving &amp; selectie</Link></li>
            </ul>
          </nav>

          <div>
            <h4>Contact</h4>
            <ul style={{ display: 'grid', gap: '.6rem' }}>
              <li><a href="tel:+31361234567">+31 (0)36 123 45 67</a></li>
              <li><a href="mailto:info@cloveruitzendbureau.nl">info@cloveruitzendbureau.nl</a></li>
              <li style={{ color: ZACHT }}>Voorbeeldstraat 12<br />1315 AB Almere</li>
              <li style={{ color: ZACHT }}>ma t/m vr 08:30 – 17:30</li>
            </ul>
            <div className="rij" style={{ gap: '.5rem', marginTop: '1.25rem' }}>
              {['ABU', 'SNA', 'NEN 4400-1'].map((k) => (
                <span key={k} className="label"
                      style={{ background: 'rgba(247, 248, 247,.12)', color: 'var(--grijs-050)' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-onder">
          <span>© {new Date().getFullYear()} Clover Uitzendbureau · KvK 00000000 · BTW NL000000000B01</span>
          <span className="rij" style={{ gap: '1.25rem' }}>
            <Link href="/privacy">Privacyverklaring</Link>
            <Link href="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
