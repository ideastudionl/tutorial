/**
 * De iconen uit de statische demo, ongewijzigd overgezet. Inline SVG,
 * dus geen extra verzoeken, en ze pakken de tekstkleur over.
 */
type Pad = { d: string; sw?: number };

const PADEN: Record<string, Pad> = {
  pijl: { d: '<path d="M5 12h14M13 6l6 6-6 6"/>' },
  pijlKlein: { d: '<path d="M7 17 17 7M9 7h8v8"/>' },
  terug: { d: '<path d="M19 12H5M11 18l-6-6 6-6"/>' },
  chevron: { d: '<path d="m6 9 6 6 6-6"/>' },
  zoek: { d: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>' },
  pin: { d: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>' },
  klok: { d: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>' },
  euro: { d: '<path d="M18 7.5A7 7 0 0 0 7.2 16 7 7 0 0 0 18 17M4.5 11h8M4.5 14h8"/>' },
  koffer: { d: '<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18"/>' },
  vink: { d: '<path d="m5 13 4.2 4.2L19 7"/>' },
  vinkje: { d: '<path d="m4.5 12.5 4.5 4.5 10-10"/>', sw: 2.6 },
  kruis: { d: '<path d="M6 6 18 18M18 6 6 18"/>' },
  plus: { d: '<path d="M12 5v14M5 12h14"/>' },
  filter: { d: '<path d="M3 5.5h18M6.5 12h11M10 18.5h4"/>' },
  bel: { d: '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>' },
  telefoon: { d: '<path d="M6.2 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3c0 1-.8 1.8-1.8 1.7C9.9 18 6 14.1 4.5 5.3c-.1-1 .7-1.8 1.7-1.8Z"/>' },
  mail: { d: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.5 8.2 6 8.2-6"/>' },
  whatsapp: { d: '<path d="M4 20l1.2-3.7A7.8 7.8 0 1 1 8 19.1L4 20Z"/><path d="M9.2 9.1c.2 1.6 2.1 3.5 3.7 3.7.5.1 1.1-.5 1.3-.9"/>' },
  gebruiker: { d: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>' },
  mensen: { d: '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M16.2 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.4a6.2 6.2 0 0 1 3.7 5.1"/>' },
  document: { d: '<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-4.5-4.5Z"/><path d="M13.8 3.7V8H18M9 13h6M9 16.5h4"/>' },
  upload: { d: '<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15"/>' },
  schild: { d: '<path d="M12 3.2 5 6v5.5c0 4.4 3 7.6 7 9.3 4-1.7 7-4.9 7-9.3V6l-7-2.8Z"/><path d="m9.2 12 2 2 3.6-3.8"/>' },
  bliksem: { d: '<path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.8h-5.3L13.5 3Z"/>' },
  hart: { d: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>' },
  moersleutel: { d: '<path d="M15.6 4.4a5 5 0 0 0-6.4 6.2l-5.1 5.1a2 2 0 0 0 0 2.8l1.4 1.4a2 2 0 0 0 2.8 0l5.1-5.1a5 5 0 0 0 6.2-6.4l-2.9 2.9-2.6-.6-.6-2.6 2.1-3.7Z"/>' },
  helm: { d: '<path d="M4 15a8 8 0 0 1 16 0M3 15h18v2.5H3z"/><path d="M9.5 15V5.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V15"/>' },
  doos: { d: '<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="M3.8 7.6 12 12l8.2-4.4M12 12v9"/>' },
  tandwiel: { d: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M4.5 12H2M22 12h-2.5M6.3 6.3 4.5 4.5M19.5 19.5l-1.8-1.8M17.7 6.3l1.8-1.8M4.5 19.5l1.8-1.8"/>' },
  kop: { d: '<path d="M4.5 7h11v6a5.5 5.5 0 0 1-11 0V7Z"/><path d="M15.5 9h2.2a2.3 2.3 0 0 1 0 4.6h-2.2M3.5 20.5h13"/>' },
  map: { d: '<path d="M3.5 7.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10.5Z"/>' },
  blad: { d: '<path d="M5 19c0-8 5-13 14-13 0 8-4.5 12.5-11 12.5H5Z"/><path d="M5 19c2.5-4 5.5-6.5 9-8"/>' },
  kompas: { d: '<circle cx="12" cy="12" r="9"/><path d="m15.2 8.8-1.7 4.7-4.7 1.7 1.7-4.7 4.7-1.7Z"/>' },
  praatwolk: { d: '<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.8-.4L4 20.5l1.2-3.4A6.7 6.7 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>' },
  slinger: { d: '<path d="M4 6.5h16M4 12h16M4 17.5h10"/>' },
  hand: { d: '<path d="M9 11V5.8a1.6 1.6 0 1 1 3.2 0V11m0-1.4a1.6 1.6 0 1 1 3.2 0V12m0-1a1.6 1.6 0 1 1 3.1 0v4.8a5.4 5.4 0 0 1-5.4 5.4h-1.4a5 5 0 0 1-3.6-1.5L4.6 17a1.6 1.6 0 0 1 2.2-2.3L9 16.4V9.6a1.6 1.6 0 1 0-3.2 0"/>' },
};

export function Icoon({ naam, w = 20, sw }: { naam: string; w?: number; sw?: number }) {
  const pad = PADEN[naam];
  if (!pad) return null;
  return (
    <svg
      width={w}
      height={w}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw ?? pad.sw ?? 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: pad.d }}
    />
  );
}

/** De ster is gevuld in plaats van gelijnd. */
export function Ster({ w = 16 }: { w?: number }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8L12 3.5Z" />
    </svg>
  );
}
