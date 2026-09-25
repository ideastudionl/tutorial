'use client';

import { useEffect, useRef, useState } from 'react';
import type { Voorstel } from '@/lib/chat/gereedschap';

type Beurt =
  | { van: 'mens'; tekst: string }
  | { van: 'assistent'; tekst: string; voorstellen: Voorstel[] };

const VOORBEELDEN = [
  'Welke spoedvacatures staan er open?',
  'Zet de heftruckvacature in Tilburg op vervuld',
  'Verhoog het uurloon van de lasser in Dordrecht met een euro',
  'Hoeveel sollicitaties staan er op nieuw?',
];

const veldnaam: Record<string, string> = {
  titel: 'Titel', plaats: 'Plaats', provincie: 'Provincie', bedrijf: 'Opdrachtgever',
  intro: 'Intro', uren: 'Uren per week', uurloon_min: 'Uurloon vanaf',
  uurloon_max: 'Uurloon tot', spoed: 'Spoed', rijbewijs: 'Rijbewijs nodig',
  ploegendienst: 'Ploegendienst', status: 'Status', vervalt_op: 'Verloopt op',
  taken: 'Wat ga je doen', vraag: 'Wat vragen we', bieden: 'Wat bieden we',
};

const toon = (w: unknown): string => {
  if (w === null || w === undefined || w === '') return '—';
  if (typeof w === 'boolean') return w ? 'ja' : 'nee';
  if (Array.isArray(w)) return w.join(' · ');
  return String(w);
};

export function ChatVenster() {
  const [beurten, setBeurten] = useState<Beurt[]>([]);
  const [invoer, setInvoer] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [uitgevoerd, setUitgevoerd] = useState<Record<string, string>>({});
  const onder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onder.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [beurten, bezig]);

  async function stuur(tekst: string) {
    if (!tekst.trim() || bezig) return;
    setFout(null);
    setInvoer('');
    const nieuw: Beurt[] = [...beurten, { van: 'mens', tekst }];
    setBeurten(nieuw);
    setBezig(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          berichten: nieuw.map((b) => ({
            role: b.van === 'mens' ? 'user' : 'assistant',
            content: b.tekst,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFout(data.fout ?? 'Er ging iets mis.');
        return;
      }
      setBeurten([...nieuw, {
        van: 'assistent', tekst: data.tekst, voorstellen: data.voorstellen ?? [],
      }]);
    } catch {
      setFout('Geen verbinding met de server.');
    } finally {
      setBezig(false);
    }
  }

  async function keurGoed(voorstel: Voorstel, sleutel: string) {
    setUitgevoerd((v) => ({ ...v, [sleutel]: 'bezig' }));
    const res = await fetch('/api/chat/uitvoeren', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voorstel }),
    });
    const data = await res.json();
    setUitgevoerd((v) => ({
      ...v,
      [sleutel]: res.ok ? 'klaar' : `fout: ${data.fout ?? 'onbekend'}`,
    }));
  }

  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 780 }}>
      <div className="kaart" style={{ display: 'grid', gap: '1rem', minHeight: 280 }}>
        {beurten.length === 0 && (
          <div style={{ color: 'var(--inkt-60)', display: 'grid', gap: '.8rem' }}>
            <p style={{ fontSize: '.875rem' }}>
              Schrijf op wat je wilt. De assistent zoekt het op en doet een voorstel —
              wijzigen gebeurt pas nadat jij akkoord geeft.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {VOORBEELDEN.map((v) => (
                <button key={v} className="knop knop-leeg knop-klein" onClick={() => stuur(v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {beurten.map((b, i) => (
          <div key={i} style={{ display: 'grid', gap: '.6rem' }}>
            <div style={{
              justifySelf: b.van === 'mens' ? 'end' : 'start',
              maxWidth: '85%',
              background: b.van === 'mens' ? 'var(--clover-700)' : 'var(--grijs-100)',
              color: b.van === 'mens' ? 'var(--wit)' : 'var(--inkt)',
              padding: '.6rem .85rem',
              borderRadius: 'var(--radius-m)',
              fontSize: '.875rem',
              whiteSpace: 'pre-wrap',
            }}>
              {b.tekst}
            </div>

            {b.van === 'assistent' && b.voorstellen.map((v, j) => {
              const sleutel = `${i}-${j}`;
              const staat = uitgevoerd[sleutel];
              return (
                <div key={sleutel} className="kaart" style={{
                  borderColor: staat === 'klaar' ? 'var(--clover-300)' : 'var(--staal)',
                  background: staat === 'klaar' ? 'var(--clover-050)' : 'var(--staal-zacht)',
                  display: 'grid', gap: '.7rem',
                }}>
                  <div>
                    <span className="pil" style={{ background: 'var(--wit)' }}>Voorstel</span>{' '}
                    <b style={{ fontSize: '.875rem' }}>{v.nummer} — {v.titel}</b>
                    {v.toelichting && (
                      <p style={{ fontSize: '.8125rem', color: 'var(--inkt-60)', marginTop: '.2rem' }}>
                        {v.toelichting}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: '.4rem', fontSize: '.8125rem' }}>
                    {v.wijzigingen.map((w) => (
                      <div key={w.veld} style={{
                        display: 'grid', gridTemplateColumns: 'minmax(90px, auto) 1fr',
                        gap: '.3rem .7rem', alignItems: 'baseline',
                      }}>
                        <b>{veldnaam[w.veld] ?? w.veld}</b>
                        <span>
                          <s style={{ color: 'var(--inkt-60)' }}>{toon(w.voor)}</s>
                          {' → '}
                          <b>{toon(w.na)}</b>
                        </span>
                      </div>
                    ))}
                  </div>

                  {staat === 'klaar' ? (
                    <p className="melding melding-goed" style={{ margin: 0 }}>
                      Doorgevoerd en vastgelegd in het logboek.
                    </p>
                  ) : staat?.startsWith('fout') ? (
                    <p className="melding melding-fout" style={{ margin: 0 }}>{staat}</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button
                        className="knop knop-klein"
                        disabled={staat === 'bezig'}
                        onClick={() => keurGoed(v, sleutel)}
                      >
                        {staat === 'bezig' ? 'Bezig…' : 'Akkoord, voer door'}
                      </button>
                      <button
                        className="knop knop-leeg knop-klein"
                        onClick={() => setUitgevoerd((u) => ({ ...u, [sleutel]: 'fout: afgewezen' }))}
                      >
                        Afwijzen
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {bezig && (
          <p style={{ color: 'var(--inkt-60)', fontSize: '.875rem' }}>Even kijken…</p>
        )}
        {fout && <p className="melding melding-fout">{fout}</p>}
        <div ref={onder} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); stuur(invoer); }}
        style={{ display: 'flex', gap: '.5rem' }}
      >
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          placeholder="Bijvoorbeeld: zet de vacature in Tilburg op vervuld"
          style={{
            flex: 1, padding: '.65rem .8rem', background: 'var(--wit)',
            border: '1px solid var(--inkt-14)', borderRadius: 'var(--radius-m)',
            fontSize: '.875rem',
          }}
        />
        <button className="knop" type="submit" disabled={bezig || !invoer.trim()}>
          Versturen
        </button>
      </form>

      <p style={{ fontSize: '.75rem', color: 'var(--inkt-60)' }}>
        De assistent kan vacatures lezen en wijzigingen voorstellen. Doorvoeren gebeurt
        alleen na jouw akkoord, en gaat met voor- en na-waarde het logboek in.
      </p>
    </div>
  );
}
