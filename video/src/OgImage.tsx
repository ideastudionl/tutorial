import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { theme } from './theme';
import { loadFonts } from './fonts';

export type OgProps = {
  eyebrow: string;
  title: string;
  price?: string;
  rating?: string;
  /** Tekst in het donkere vlak rechts. */
  spine?: string;
};

const PANEL = 340;
const RULE = 8;

/** Lange koppen krijgen een kleinere letter, zodat ze binnen drie regels blijven. */
const titleSize = (title: string) => {
  if (title.length > 52) return 58;
  if (title.length > 38) return 68;
  if (title.length > 26) return 78;
  return 88;
};

/**
 * Deelafbeelding voor sociale media en WhatsApp. Eén stilstaand beeld per
 * pagina, met dezelfde kleuren en letters als de site.
 */
export const OgImage: React.FC<OgProps> = ({ eyebrow, title, price, rating, spine }) => {
  loadFonts();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.kalksteen, fontFamily: theme.text }}>
      {/* Diagonale pleisterstructuur, subtiel. */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(115deg, ${theme.kalksteenLine}00 0 14px, ${theme.kalksteenLine}80 14px 28px)`,
          opacity: 0.5,
        }}
      />

      {/* Marineblauw vlak rechts als anker, met oranje bies. */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: PANEL,
          backgroundColor: theme.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            writingMode: 'vertical-rl',
            fontFamily: theme.head,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: theme.white,
            opacity: 0.92,
          }}
        >
          {spine ?? 'Stukadoor Amsterdam'}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: PANEL,
          top: 0,
          bottom: 0,
          width: RULE,
          backgroundColor: theme.orange,
        }}
      />

      <AbsoluteFill
        style={{
          padding: `64px ${PANEL + RULE + 56}px 64px 64px`,
          justifyContent: 'space-between',
        }}
      >
        <Img src={staticFile('logo.svg')} style={{ width: 250, height: 'auto' }} />

        <div>
          <div
            style={{
              fontFamily: theme.head,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: theme.stone,
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: theme.head,
              fontSize: titleSize(title),
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: theme.ink,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            fontSize: 25,
            color: theme.body,
            whiteSpace: 'nowrap',
          }}
        >
          {price && (
            <strong style={{ fontFamily: theme.head, fontWeight: 700, color: theme.ink }}>
              {price}
            </strong>
          )}
          {price && rating && <span style={{ color: theme.kalksteenLine }}>|</span>}
          {rating && <span>{rating}</span>}
          <span style={{ marginLeft: 'auto', color: theme.stone }}>interflexstuc.nl</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
