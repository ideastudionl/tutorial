/* =========================================================
   Clover — SVG iconen & illustraties (inline, geen requests)
   ========================================================= */

const svg = (d, opt = {}) =>
  `<svg width="${opt.w || 20}" height="${opt.h || opt.w || 20}" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="${opt.sw || 1.9}" stroke-linecap="round"
     stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const ICO = {
  pijl:      (o) => svg('<path d="M5 12h14M13 6l6 6-6 6"/>', o),
  pijlKlein: (o) => svg('<path d="M7 17 17 7M9 7h8v8"/>', o),
  terug:     (o) => svg('<path d="M19 12H5M11 18l-6-6 6-6"/>', o),
  chevron:   (o) => svg('<path d="m6 9 6 6 6-6"/>', o),
  zoek:      (o) => svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', o),
  pin:       (o) => svg('<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>', o),
  klok:      (o) => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>', o),
  euro:      (o) => svg('<path d="M18 7.5A7 7 0 0 0 7.2 16 7 7 0 0 0 18 17M4.5 11h8M4.5 14h8"/>', o),
  koffer:    (o) => svg('<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18"/>', o),
  vink:      (o) => svg('<path d="m5 13 4.2 4.2L19 7"/>', o),
  vinkje:    (o) => svg('<path d="m4.5 12.5 4.5 4.5 10-10"/>', { ...o, sw: 2.6 }),
  kruis:     (o) => svg('<path d="M6 6 18 18M18 6 6 18"/>', o),
  plus:      (o) => svg('<path d="M12 5v14M5 12h14"/>', o),
  filter:    (o) => svg('<path d="M3 5.5h18M6.5 12h11M10 18.5h4"/>', o),
  bel:       (o) => svg('<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z"/><path d="M13.7 19.5a2 2 0 0 1-3.4 0"/>', o),
  telefoon:  (o) => svg('<path d="M6.2 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3c0 1-.8 1.8-1.8 1.7C9.9 18 6 14.1 4.5 5.3c-.1-1 .7-1.8 1.7-1.8Z"/>', o),
  mail:      (o) => svg('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.5 8.2 6 8.2-6"/>', o),
  whatsapp:  (o) => svg('<path d="M4 20l1.2-3.7A7.8 7.8 0 1 1 8 19.1L4 20Z"/><path d="M9.2 9.1c.2 1.6 2.1 3.5 3.7 3.7.5.1 1.1-.5 1.3-.9"/>', o),
  gebruiker: (o) => svg('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>', o),
  mensen:    (o) => svg('<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0"/><path d="M16.2 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.4a6.2 6.2 0 0 1 3.7 5.1"/>', o),
  document:  (o) => svg('<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-4.5-4.5Z"/><path d="M13.8 3.7V8H18M9 13h6M9 16.5h4"/>', o),
  upload:    (o) => svg('<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V15"/>', o),
  schild:    (o) => svg('<path d="M12 3.2 5 6v5.5c0 4.4 3 7.6 7 9.3 4-1.7 7-4.9 7-9.3V6l-7-2.8Z"/><path d="m9.2 12 2 2 3.6-3.8"/>', o),
  bliksem:   (o) => svg('<path d="M13.5 3 5.5 13.5h5L10 21l8.5-10.8h-5.3L13.5 3Z"/>', o),
  hart:      (o) => svg('<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>', o),
  ster:      (o) => `<svg width="${o?.w||16}" height="${o?.w||16}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8L12 3.5Z"/></svg>`,
  moersleutel:(o) => svg('<path d="M15.6 4.4a5 5 0 0 0-6.4 6.2l-5.1 5.1a2 2 0 0 0 0 2.8l1.4 1.4a2 2 0 0 0 2.8 0l5.1-5.1a5 5 0 0 0 6.2-6.4l-2.9 2.9-2.6-.6-.6-2.6 2.1-3.7Z"/>', o),
  helm:      (o) => svg('<path d="M4 15a8 8 0 0 1 16 0M3 15h18v2.5H3z"/><path d="M9.5 15V5.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V15"/>', o),
  doos:      (o) => svg('<path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="M3.8 7.6 12 12l8.2-4.4M12 12v9"/>', o),
  tandwiel:  (o) => svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M4.5 12H2M22 12h-2.5M6.3 6.3 4.5 4.5M19.5 19.5l-1.8-1.8M17.7 6.3l1.8-1.8M4.5 19.5l1.8-1.8"/>', o),
  kop:       (o) => svg('<path d="M4.5 7h11v6a5.5 5.5 0 0 1-11 0V7Z"/><path d="M15.5 9h2.2a2.3 2.3 0 0 1 0 4.6h-2.2M3.5 20.5h13"/>', o),
  map:       (o) => svg('<path d="M3.5 7.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10.5Z"/>', o),
  blad:      (o) => svg('<path d="M5 19c0-8 5-13 14-13 0 8-4.5 12.5-11 12.5H5Z"/><path d="M5 19c2.5-4 5.5-6.5 9-8"/>', o),
  kompas:    (o) => svg('<circle cx="12" cy="12" r="9"/><path d="m15.2 8.8-1.7 4.7-4.7 1.7 1.7-4.7 4.7-1.7Z"/>', o),
  praatwolk: (o) => svg('<path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9.6 9.6 0 0 1-2.8-.4L4 20.5l1.2-3.4A6.7 6.7 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z"/>', o),
  slinger:   (o) => svg('<path d="M4 6.5h16M4 12h16M4 17.5h10"/>', o),
  hand:      (o) => svg('<path d="M9 11V5.8a1.6 1.6 0 1 1 3.2 0V11m0-1.4a1.6 1.6 0 1 1 3.2 0V12m0-1a1.6 1.6 0 1 1 3.1 0v4.8a5.4 5.4 0 0 1-5.4 5.4h-1.4a5 5 0 0 1-3.6-1.5L4.6 17a1.6 1.6 0 0 1 2.2-2.3L9 16.4V9.6a1.6 1.6 0 1 0-3.2 0"/>', o)
};

/* -- Klaverlogo: vier blaadjes, animeerbaar ---------------- */
const klaverLogo = (size = 40) => `
<svg class="merk-mark" viewBox="0 0 48 48" width="${size}" height="${size}" role="img" aria-label="Clover">
  <g>
    <path class="klaver-blad" d="M24 22C24 13 20 7 13.5 7 7.8 7 4 11.2 4 16.4 4 20.6 7.6 22 24 22Z" fill="#1B7F58"/>
    <path class="klaver-blad" d="M26 22c0-9 4-15 10.5-15C42.2 7 46 11.2 46 16.4 46 20.6 42.4 22 26 22Z" fill="#2E9B6E"/>
    <path class="klaver-blad" d="M24 24C24 33 20 39 13.5 39 7.8 39 4 34.8 4 29.6 4 25.4 7.6 24 24 24Z" fill="#0E4633"/>
    <path class="klaver-blad" d="M26 24c0 9 4 15 10.5 15C42.2 39 46 34.8 46 29.6 46 25.4 42.4 24 26 24Z" fill="#7FC0A5"/>
    <rect x="23" y="20" width="4" height="6" rx="2" fill="#101614"/>
  </g>
</svg>`;

/* -- Google-logo & ster ------------------------------------ */

const googleG = (w = 18) => `
<svg width="${w}" height="${w}" viewBox="0 0 48 48" aria-hidden="true">
  <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3Z"/>
  <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46Z"/>
  <path fill="#FBBC05" d="M11.6 28.3c-.4-1.3-.7-2.7-.7-4.3s.2-2.9.7-4.3v-5.7H4.3A22 22 0 0 0 2 24c0 3.6.9 6.9 2.3 9.9l7.3-5.6Z"/>
  <path fill="#EA4335" d="M24 10.6c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1Z"/>
</svg>`;

const sterRij = (score, w = 15) => {
  const vol = Math.floor(score);
  const half = score - vol >= 0.35;
  let uit = '';
  for (let i = 0; i < 5; i++) {
    const vulling = i < vol ? 1 : (i === vol && half ? 0.5 : 0);
    uit += `
      <svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true">
        <defs><linearGradient id="st${i}-${String(score).replace('.', '')}">
          <stop offset="${vulling * 100}%" stop-color="currentColor"/>
          <stop offset="${vulling * 100}%" stop-color="rgba(16,22,20,.16)"/>
        </linearGradient></defs>
        <path fill="url(#st${i}-${String(score).replace('.', '')})"
          d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8L12 3.5Z"/>
      </svg>`;
  }
  return `<span class="sterren" role="img" aria-label="${String(score).replace('.', ',')} van de 5 sterren">${uit}</span>`;
};

/* -- Monogram-avatar ---------------------------------------
   Plaatsvervanger voor portretfotografie. Vervang door een
   <img> zodra het beeldmateriaal van Clover er is.          */

const AVATAR_TINTEN = [
  { bg: '#E2EFE9', tekst: '#0E4633' },
  { bg: '#E4EAF1', tekst: '#24466B' },
  { bg: '#EFEBE6', tekst: '#6B4A2A' },
  { bg: '#E9E7F0', tekst: '#3F3A6B' },
  { bg: '#E6EFEE', tekst: '#2C6357' },
  { bg: '#F1E9EC', tekst: '#7A3B52' }
];

const initialen = (naam) => naam
  .split(/\s+/)
  .filter((w) => w.length > 1 && !/^(de|van|der|den|el|het)$/i.test(w))
  .slice(0, 2)
  .map((w) => w[0])
  .join('');

const monogram = (naam, i = 0, klasse = 'avatar') => {
  const t = AVATAR_TINTEN[i % AVATAR_TINTEN.length];
  return `<span class="${klasse} monogram" style="--avatar-bg:${t.bg};--avatar-tekst:${t.tekst}"
    aria-hidden="true">${initialen(naam)}</span>`;
};
