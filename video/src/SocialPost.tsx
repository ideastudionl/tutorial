import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from './theme';
import { loadFonts } from './fonts';

export type SocialProps = { titel: string; prijs: string; plaats: string };

const punten = ['Vaste prijs per m²', 'Reactie binnen 24 uur', '5 jaar garantie', 'Schoon opgeleverd'];

/** Staand formaat voor Reels, TikTok en Stories. */
export const SocialPost: React.FC<SocialProps> = ({ titel, prijs, plaats }) => {
  loadFonts();

  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titelIn = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const prijsIn = spring({ frame: frame - 18, fps, config: { damping: 200, stiffness: 80 } });
  const ctaIn = spring({ frame: frame - durationInFrames + 60, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.kalksteen, fontFamily: theme.text, padding: 90 }}>
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(115deg, ${theme.kalksteenLine}00 0 18px, ${theme.kalksteenLine}90 18px 36px)`,
          opacity: 0.45,
        }}
      />

      <AbsoluteFill style={{ padding: 90, justifyContent: 'space-between' }}>
        <Img src={staticFile('logo.svg')} style={{ width: 300 }} />

        <div>
          <div
            style={{
              fontFamily: theme.head,
              fontWeight: 800,
              fontSize: 118,
              letterSpacing: -4,
              lineHeight: 1.02,
              color: theme.ink,
              opacity: titelIn,
              transform: `translateY(${interpolate(titelIn, [0, 1], [40, 0])}px)`,
            }}
          >
            {titel}
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'inline-block',
              backgroundColor: theme.orange,
              color: '#fff',
              fontFamily: theme.head,
              fontWeight: 800,
              fontSize: 56,
              padding: '20px 36px',
              borderRadius: 10,
              opacity: prijsIn,
              transform: `scale(${interpolate(prijsIn, [0, 1], [0.9, 1])})`,
            }}
          >
            {prijs}
          </div>

          <div style={{ marginTop: 56, display: 'grid', gap: 26 }}>
            {punten.map((p, i) => {
              const inn = spring({ frame: frame - 36 - i * 8, fps, config: { damping: 200 } });
              return (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    fontSize: 44,
                    color: theme.body,
                    opacity: inn,
                    transform: `translateX(${interpolate(inn, [0, 1], [-24, 0])}px)`,
                  }}
                >
                  <span style={{ color: theme.blue, fontWeight: 700, fontFamily: theme.head }}>✓</span>
                  {p}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.ink,
            borderRadius: 12,
            padding: '44px 50px',
            opacity: ctaIn,
            transform: `translateY(${interpolate(ctaIn, [0, 1], [30, 0])}px)`,
          }}
        >
          <div style={{ color: '#BDCADC', fontSize: 34, marginBottom: 10 }}>Stukadoor in {plaats}</div>
          <div style={{ fontFamily: theme.head, fontWeight: 800, fontSize: 60, color: '#fff' }}>interflexstuc.nl</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
