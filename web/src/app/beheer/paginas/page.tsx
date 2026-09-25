import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { datum } from '@/lib/types';

export const metadata = { title: "Pagina's — Clover beheer" };
export const dynamic = 'force-dynamic';

const LABEL: Record<string, string> = {
  concept: 'Concept', online: 'Online', gearchiveerd: 'Gearchiveerd',
};

export default async function PaginaLijst() {
  const supabase = await supabaseServer();
  const { data: paginas, error } = await supabase
    .from('paginas')
    .select('id, slug, titel, status, systeempagina, secties, gewijzigd_op')
    .order('titel');

  return (
    <>
      <div className="kop">
        <div>
          <h1>Pagina&apos;s</h1>
          <p>De vaste tekstpagina&apos;s van de site. Vacatures staan apart.</p>
        </div>
        <Link className="knop" href="/beheer/paginas/nieuw">Nieuwe pagina</Link>
      </div>

      {error && <p className="melding melding-fout">Ophalen mislukt: {error.message}</p>}

      <div className="tabelwrap">
        {paginas?.length ? (
          <div className="tabelscroll">
            <table>
              <thead>
                <tr>
                  <th>Pagina</th><th>Status</th><th>Secties</th><th>Gewijzigd</th><th></th>
                </tr>
              </thead>
              <tbody>
                {paginas.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/beheer/paginas/${p.id}`} className="rij-titel">
                        {p.titel}
                      </Link>
                      <span className="rij-sub">
                        /{p.slug}
                        {p.systeempagina ? ' · vaste pagina' : ''}
                      </span>
                    </td>
                    <td><span className={`pil pil-${p.status}`}>{LABEL[p.status] ?? p.status}</span></td>
                    <td className="num">{Array.isArray(p.secties) ? p.secties.length : 0}</td>
                    <td className="num">{datum(p.gewijzigd_op)}</td>
                    <td>
                      <Link className="knop knop-leeg knop-klein" href={`/beheer/paginas/${p.id}`}>
                        Bewerken
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="leeg">Er staan nog geen pagina&apos;s in.</p>
        )}
      </div>
    </>
  );
}
