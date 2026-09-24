/* Bouwt de deploybare site: index.html is geschreven als fragment (zodat hij
   ook als artifact werkt); hier wordt hij in een volwaardig HTML-document
   gezet en samen met assets/ naar dist/ geschreven.

   Bij het bouwen worden twee dingen losgemaakt van het WordPress-domein:

   1. Alle foto's uit de mediabibliotheek worden één keer opgehaald en in
      dist/media/ gezet. De site draagt haar eigen beeld, dus als het
      hoofddomein straks naar deze site wijst, breekt er niets.
   2. Wat wél naar WordPress moet blijven wijzen (de Store API, de
      voorwaardenpagina's) leest het adres uit WP_BASE. Verhuist WordPress naar
      een subdomein, dan zet je die variabele om en bouw je opnieuw.

   Omgevingsvariabelen, allemaal met een werkbare standaard:
     WP_BASE   adres van de WordPress-winkel (standaard www.soccer-games.nl)
     MEDIA_SRC waar de foto's vandaan gehaald worden (standaard WP_BASE)
     SITE_URL  het eigen adres. Gezet = productie: indexeerbaar, met sitemap.
*/
import { mkdir, readFile, writeFile, cp, rm, access } from 'node:fs/promises';
import { join, basename } from 'node:path';

const WP_BASE = (process.env.WP_BASE || 'https://www.soccer-games.nl').replace(/\/+$/, '');
const MEDIA_SRC = (process.env.MEDIA_SRC || WP_BASE).replace(/\/+$/, '');
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const PRODUCTIE = Boolean(SITE_URL);

const OUDE_BASIS = 'https://www.soccer-games.nl';
const CACHE = '.media-cache';

let bron = await readFile('index.html', 'utf8');
let script = await readFile('assets/app.js', 'utf8');

/* ---------- 1. Foto's meenemen ---------- */

/* Elk adres naar de mediabibliotheek, uit de pagina én uit het script. */
const mediaRe = /https:\/\/www\.soccer-games\.nl(\/wp-content\/uploads\/[^"'\s)]+)/g;
const paden = new Set();
for (const tekst of [bron, script]) {
  for (const treffer of tekst.matchAll(mediaRe)) paden.add(treffer[1]);
}

await mkdir(CACHE, { recursive: true });

async function haal(pad) {
  const naam = basename(pad);
  const opslag = join(CACHE, naam);
  try {
    await access(opslag);
    return naam;               /* al eerder opgehaald */
  } catch { /* nog niet in de cache */ }

  const res = await fetch(MEDIA_SRC + pad);
  if (!res.ok) {
    throw new Error(
      `Foto ophalen mislukte: ${MEDIA_SRC + pad} gaf HTTP ${res.status}.\n` +
      'De build stopt hier met opzet: liever geen nieuwe versie dan een site zonder beeld.\n' +
      'Staat WordPress inmiddels op een ander adres, zet dan MEDIA_SRC goed.'
    );
  }
  await writeFile(opslag, Buffer.from(await res.arrayBuffer()));
  return naam;
}

const vertaling = new Map();
for (const pad of paden) vertaling.set(pad, await haal(pad));

/* ---------- 2. Document samenstellen ---------- */

function herschrijf(tekst) {
  for (const [pad, naam] of vertaling) {
    tekst = tekst.split(OUDE_BASIS + pad).join('/media/' + naam);
  }
  /* Wat overblijft wijst naar WordPress zelf: voorwaarden, winkel, Store API. */
  return tekst.split(OUDE_BASIS).join(WP_BASE);
}

bron = herschrijf(bron);
script = herschrijf(script);

/* Absolute paden naar de bestanden: op /product/soccer-memo zou een relatief
   pad in /product/assets/ gaan zoeken. */
bron = bron.split('href="assets/').join('href="/assets/').split('src="assets/').join('src="/assets/');

const title = 'Soccer MeMo, het voetbal-memoryspel';
const desc = 'Soccer MeMo: het voetbal-memoryspel met 48 kaarten en 24 paren. Voor 22:00 besteld, morgen in huis.';
const beeld = vertaling.has('/wp-content/uploads/2022/07/Soccer-Memo.jpg')
  ? '/media/' + vertaling.get('/wp-content/uploads/2022/07/Soccer-Memo.jpg') : '';

const kop = [
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  `<title>${title}</title>`,
  `<meta name="description" content="${desc}">`,
  PRODUCTIE ? `<link rel="canonical" href="${SITE_URL}/">` : '<meta name="robots" content="noindex, nofollow">',
  '<meta property="og:type" content="website">',
  '<meta property="og:locale" content="nl_NL">',
  `<meta property="og:title" content="${title}">`,
  `<meta property="og:description" content="${desc}">`,
  PRODUCTIE ? `<meta property="og:url" content="${SITE_URL}/">` : '',
  beeld && PRODUCTIE ? `<meta property="og:image" content="${SITE_URL}${beeld}">` : '',
  '<meta name="theme-color" content="#0B6B3A">',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
].filter(Boolean).join('\n');

const doc = `<!doctype html>
<html lang="nl">
<head>
${kop}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230B6B3A'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M16 10l4.5 3.3-1.7 5.3h-5.6L11.5 13.3z' fill='%23fff'/%3E%3C/svg%3E">
${PRODUCTIE ? '<script>window.__PADEN__=1</script>' : ''}
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{color-scheme:light dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${bron}
</body>
</html>
`;

await rm('dist', { recursive: true, force: true });
await mkdir('dist/media', { recursive: true });
await writeFile('dist/index.html', doc);
await cp('assets', 'dist/assets', { recursive: true });
await writeFile('dist/assets/app.js', script);
for (const naam of vertaling.values()) await cp(join(CACHE, naam), join('dist/media', naam));

/* ---------- 3. Vindbaarheid ---------- */

if (PRODUCTIE) {
  /* De bedankpagina hoort bij één klant, niet in de zoekresultaten. */
  await writeFile('dist/robots.txt',
    `User-agent: *\nAllow: /\nDisallow: /bedankt\nDisallow: /afrekenen\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  const paginas = ['/', '/product/soccer-memo', '/shop'];
  await writeFile('dist/sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paginas.map((pad) => `  <url><loc>${SITE_URL}${pad}</loc></url>`).join('\n') +
    '\n</urlset>\n');
} else {
  await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
}

console.log(`dist/ klaar — ${vertaling.size} foto's meegeleverd, WordPress op ${WP_BASE}` +
  (PRODUCTIE ? `, site op ${SITE_URL}` : ', voorbeeldweergave (noindex)'));
