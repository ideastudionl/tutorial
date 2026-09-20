import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';
import { loadFonts } from './fonts';

const stappen = [
  { n: '1', titel: 'Aanvraag', tekst: 'Vier korte vragen over het werk, de ondergrond en de oppervlakte.' },
  { n: '2', titel: 'Opname & prijs', tekst: 'We komen vrijblijvend meten. Daarna een vaste prijs per m².' },
  { n: '3', titel: 'Uitvoering', tekst: 'Alles afgeschermd, per ruimte gewerkt, elke dag opgeruimd.' },
  { n: '4', titel: 'Oplevering', tekst: 'Samen nalopen. Vijf jaar garantie op de uitvoering.' },
];

const Stap: React.FC<{ stap: (typeof stappen)[number]; duur: number }> = ({ stap, duur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 90 } });
  const y = interpolate(enter, [0, 1], [40, 0]);

  // Ook weer uitvloeien, anders is er op de overgang één leeg frame.
  const zichtbaar = interpolate(frame, [0, 8, duur - 14, duur - 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center', opacity: Math.min(enter, zichtbaar), transform: `translateY(${y}px)` }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: `3px solid ${theme.blue}`,
          color: theme.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: theme.head,
          fontWeight: 800,
          fontSize: 44,
          marginBottom: 44,
        }}
      >
        {stap.n}
      </div>
      <div style={{ fontFamily: theme.head, fontWeight: 800, fontSize: 104, letterSpacing: -3, color: theme.ink, marginBottom: 24 }}>
        {stap.titel}
      </div>
      <div style={{ fontSize: 42, lineHeight: 1.45, color: theme.body, maxWidth: 1100 }}>{stap.tekst}</div>
    </AbsoluteFill>
  );
};

/** Uitleg van de werkwijze in vier stappen. */
export const Uitleg: React.FC = () => {
  loadFonts();

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const perStap = 4 * fps;
  const intro = 2 * fps;
  const outroStart = durationInFrames - 2 * fps;

  const introFade = interpolate(frame, [0, 12, intro - 8, intro], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const outro = spring({ frame: frame - outroStart, fps, config: { damping: 200 } });

  // Voortgangsbalk onderin loopt mee met de hele video.
  const voortgang = interpolate(frame, [0, durationInFrames], [0, 100]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.kalksteen, fontFamily: theme.text }}>
      <Img src={staticFile('logo.svg')} style={{ position: 'absolute', top: 70, left: 160, width: 230 }} />

      {frame < intro && (
        <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center', opacity: introFade }}>
          <div style={{ fontFamily: theme.head, fontWeight: 800, fontSize: 128, letterSpacing: -4, lineHeight: 1.02, color: theme.ink }}>
            Zo werkt het
          </div>
          <div style={{ fontSize: 46, color: theme.stone, marginTop: 28 }}>Van aanvraag tot oplevering, zonder verrassingen.</div>
        </AbsoluteFill>
      )}

      {stappen.map((stap, i) => (
        <Sequence key={stap.n} from={intro + i * perStap} durationInFrames={perStap + 10}>
          <Stap stap={stap} duur={perStap + 10} />
        </Sequence>
      ))}

      {frame >= outroStart && (
        <AbsoluteFill
          style={{
            backgroundColor: theme.ink,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: outro,
          }}
        >
          <div style={{ fontFamily: theme.head, fontWeight: 800, fontSize: 92, color: '#fff', letterSpacing: -2 }}>
            Prijs in 3 minuten
          </div>
          <div style={{ fontSize: 44, color: theme.orange, marginTop: 20, fontFamily: theme.head, fontWeight: 700 }}>
            interflexstuc.nl
          </div>
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, backgroundColor: theme.kalksteenLine }}>
        <div style={{ width: `${voortgang}%`, height: '100%', backgroundColor: theme.orange }} />
      </div>
    </AbsoluteFill>
  );
};
