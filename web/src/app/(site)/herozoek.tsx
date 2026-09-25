'use client';

import { useRouter } from 'next/navigation';
import { Icoon } from '@/components/icoon';

export function Herozoek({ sectoren }: { sectoren: { id: string; naam: string }[] }) {
  const router = useRouter();

  return (
    <form
      className="zoekbalk"
      role="search"
      aria-label="Zoek een vacature"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const p = new URLSearchParams();
        for (const naam of ['term', 'sector', 'plaats']) {
          const w = String(fd.get(naam) ?? '').trim();
          if (w) p.set(naam, w);
        }
        const q = p.toString();
        router.push(`/vacatures${q ? `?${q}` : ''}`);
      }}
    >
      <div className="veld">
        <label htmlFor="hz-term">Functie</label>
        <input id="hz-term" name="term" type="search" placeholder="monteur" autoComplete="off" />
      </div>
      <div className="veld">
        <label htmlFor="hz-sector">Sector</label>
        <select id="hz-sector" name="sector" defaultValue="">
          <option value="">Alle sectoren</option>
          {sectoren.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
        </select>
      </div>
      <div className="veld">
        <label htmlFor="hz-plaats">Plaats</label>
        <input id="hz-plaats" name="plaats" type="text" placeholder="Almere" autoComplete="off" />
      </div>
      <button className="knop knop--groot" type="submit">
        <Icoon naam="zoek" w={18} /> Zoeken
      </button>
    </form>
  );
}
