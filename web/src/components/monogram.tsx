/**
 * Plaatsvervanger voor portretfotografie: initialen in een rustige
 * merkkleur. Vervangen door een <img> zodra er beeld is.
 */
const TINTEN = [
  { bg: '#E2EFE9', tekst: '#0E4633' },
  { bg: '#E4EAF1', tekst: '#24466B' },
  { bg: '#EFEBE6', tekst: '#6B4A2A' },
  { bg: '#E9E7F0', tekst: '#3F3A6B' },
  { bg: '#E6EFEE', tekst: '#2C6357' },
  { bg: '#F1E9EC', tekst: '#7A3B52' },
];

const initialen = (naam: string) =>
  naam
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^(de|van|der|den|el|het)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export function Monogram({ naam, tint = 0 }: { naam: string; tint?: number }) {
  const t = TINTEN[tint % TINTEN.length];
  return (
    <span
      className="avatar monogram"
      style={{
        ['--avatar-bg' as string]: t.bg,
        ['--avatar-tekst' as string]: t.tekst,
      }}
      aria-hidden="true"
    >
      {initialen(naam)}
    </span>
  );
}
