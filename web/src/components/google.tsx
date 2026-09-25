import { Monogram } from './monogram';
import { GOOGLE, type Review } from '@/lib/inhoud';

const GKLEUR = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

export function GoogleLogo({ w = 18 }: { w?: number }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}>
      <path fill={GKLEUR[0]} d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
      <path fill={GKLEUR[3]} d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3C3.6 21.3 7.5 24 12 24Z" />
      <path fill={GKLEUR[2]} d="M5.5 14.6a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.7l3.8-3Z" />
      <path fill={GKLEUR[1]} d="M12 4.7c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.5 0 3.6 2.7 1.7 6.6l3.8 3C6.4 6.7 9 4.7 12 4.7Z" />
    </svg>
  );
}

/** Halve sterren via een verloop, zoals in de statische demo. */
export function Sterren({ score, w = 15 }: { score: number; w?: number }) {
  const vol = Math.floor(score);
  const half = score - vol >= 0.35;
  const sleutel = String(score).replace('.', '');

  return (
    <span className="sterren" aria-label={`${String(score).replace('.', ',')} van 5 sterren`}>
      {Array.from({ length: 5 }, (_, i) => {
        const vulling = i < vol ? 1 : i === vol && half ? 0.5 : 0;
        const id = `ster-${sleutel}-${i}`;
        return (
          <svg key={i} width={w} height={w} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={id}>
                <stop offset={`${vulling * 100}%`} stopColor="currentColor" />
                <stop offset={`${vulling * 100}%`} stopColor="rgba(16,22,20,.16)" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${id})`}
              d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8L12 3.5Z"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function GoogleBadge({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className="google-badge"
      href={GOOGLE.url}
      target="_blank"
      rel="noopener"
      aria-label={`${String(GOOGLE.score).replace('.', ',')} sterren uit ${GOOGLE.aantal} Google-reviews`}
    >
      <GoogleLogo w={compact ? 18 : 22} />
      <span className="g-cijfer">{String(GOOGLE.score).replace('.', ',')}</span>
      <span className="g-meta">
        <Sterren score={GOOGLE.score} w={13} />
        <small>{GOOGLE.aantal} Google-reviews</small>
      </span>
    </a>
  );
}

export function ReviewKaart({ r, tint = 0 }: { r: Review; tint?: number }) {
  return (
    <figure className="review">
      <figcaption className="review-kop">
        <Monogram naam={r.naam} tint={tint} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <b>{r.naam}</b>
          <small>{r.rol}</small>
        </span>
        <GoogleLogo w={18} />
      </figcaption>
      <div className="rij" style={{ gap: '.5rem' }}>
        <Sterren score={r.ster} w={15} />
        <span className="review-bron">{r.datum}</span>
      </div>
      <blockquote>{r.quote}</blockquote>
    </figure>
  );
}

/** Scorepaneel met de verdeling per sterwaardering. */
export function GooglePaneel() {
  const totaal = GOOGLE.verdeling.reduce((a, b) => a + b, 0);
  return (
    <div className="google-paneel">
      <div className="rij" style={{ gap: '.6rem' }}>
        <GoogleLogo w={24} />
        <b style={{ fontWeight: 600 }}>Google-beoordelingen</b>
      </div>
      <div className="google-score">
        <b>{String(GOOGLE.score).replace('.', ',')}</b>
        <span>/ 5</span>
      </div>
      <Sterren score={GOOGLE.score} w={20} />
      <p style={{ fontSize: 'var(--t-sm)', color: 'var(--inkt-60)', margin: 0 }}>
        Gebaseerd op {GOOGLE.aantal} reviews van werkzoekenden en opdrachtgevers.
      </p>
      <div className="verdeling">
        {GOOGLE.verdeling.map((n, i) => (
          <div className="verdeling-rij" key={i}>
            <span>{5 - i} \u2605</span>
            <span className="verdeling-balk">
              <i style={{ width: `${Math.round((n / totaal) * 100)}%` }} />
            </span>
            <span>{n}</span>
          </div>
        ))}
      </div>
      <a className="knop knop--leeg knop--breed" href={GOOGLE.url} target="_blank" rel="noopener">
        Alle reviews op Google
      </a>
    </div>
  );
}
