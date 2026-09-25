'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/beheer', label: 'Dashboard', telling: null },
  { href: '/beheer/vacatures', label: 'Vacatures', telling: 'vacatures' },
  { href: '/beheer/sollicitaties', label: 'Sollicitaties', telling: 'sollicitaties' },
  { href: '/beheer/paginas', label: "Pagina's", telling: null },
  { href: '/beheer/chat', label: 'Assistent', telling: null },
] as const;

export function Zijnav({ vacatures, sollicitaties }: { vacatures: number; sollicitaties: number }) {
  const pad = usePathname();
  const tellingen: Record<string, number> = { vacatures, sollicitaties };

  return (
    <nav className="zijnav" aria-label="Beheermenu">
      {LINKS.map((l) => {
        const actief = l.href === '/beheer' ? pad === '/beheer' : pad.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={actief ? 'page' : undefined}>
            {l.label}
            {l.telling && <span className="telling">{tellingen[l.telling]}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
