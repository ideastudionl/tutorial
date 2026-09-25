'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Klaver } from '@/lib/klaver';

const MENU = [
  { href: '/vacatures', label: 'Vacatures' },
  { href: '/sectoren', label: 'Sectoren' },
  { href: '/werkgevers', label: 'Voor werkgevers' },
  { href: '/over-clover', label: 'Over Clover' },
  { href: '/contact', label: 'Contact' },
];

export function Kop() {
  const pad = usePathname();
  const [open, setOpen] = useState(false);
  const [plakt, setPlakt] = useState(false);

  // Het menu moet dicht als je doorklikt; anders sta je op de nieuwe
  // pagina met het menu nog over de inhoud heen.
  useEffect(() => setOpen(false), [pad]);

  useEffect(() => {
    const bij = () => setPlakt(window.scrollY > 12);
    bij();
    window.addEventListener('scroll', bij, { passive: true });
    return () => window.removeEventListener('scroll', bij);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className={`site-header${plakt ? ' is-plakkend' : ''}`}>
        <div className="wrap header-binnen">
          <Link className="merk" href="/" aria-label="Clover Uitzendbureau, naar de homepage">
            <span className="merk-mark"><Klaver size={40} /></span>
            <span className="merk-naam">
              Clo<span>ver</span><span className="merk-sub">Uitzendbureau</span>
            </span>
          </Link>

          <nav className="hoofdnav" aria-label="Hoofdmenu">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                aria-current={pad.startsWith(m.href) ? 'page' : undefined}
              >
                {m.label}
              </Link>
            ))}
          </nav>

          <div className="header-acties">
            <Link className="knop knop--leeg knop--verbergbaar" href="/werkgevers">
              Personeel aanvragen
            </Link>
            <Link className="knop" href="/vacatures">Vind je baan</Link>
            <button
              className={`hamburger${open ? ' is-open' : ''}`}
              aria-expanded={open}
              aria-controls="mobiel-menu"
              aria-label={open ? 'Menu sluiten' : 'Menu openen'}
              onClick={() => setOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobiel-menu${open ? ' is-open' : ''}`} id="mobiel-menu">
        {MENU.map((m) => (
          <Link key={m.href} className="m-link" href={m.href}>
            {m.label} <span aria-hidden="true">→</span>
          </Link>
        ))}
        <div className="m-acties">
          <Link className="knop knop--breed knop--groot" href="/vacatures">Vind je baan</Link>
          <Link className="knop knop--wit knop--breed knop--groot" href="/werkgevers">
            Personeel aanvragen
          </Link>
          <a className="knop knop--leeg knop--breed" href="tel:+31361234567">
            Bel +31 (0)36 123 45 67
          </a>
        </div>
      </div>
    </>
  );
}
