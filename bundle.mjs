/* Bouwt dist/standalone.html: één zelfstandig bestand (CSS en JS inline,
   samengeperst) voor een demo-URL bij de klant. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const css = (await readFile('assets/styles.css', 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*([{};:,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

const js = (await readFile('assets/app.js', 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/^\s+/, ''))
  .filter((l) => l && !l.startsWith('//')).join('\n');

const page = (await readFile('index.html', 'utf8'))
  .replace('<link rel="stylesheet" href="assets/styles.css">', () => `<style>${css}</style>`)
  .replace('<script src="assets/app.js"></script>', () => `<script>${js}</script>`)
  .replace(/<!--[\s\S]*?-->/g, '')
  .split('\n').map((l) => l.replace(/^\s+/, '')).filter((l) => l.length).join('\n');

const title = 'Soccer MeMo, nieuw winkelontwerp';
const desc = 'Ontwerpvoorstel voor Soccer Games: homepagina en productpagina, klaar voor een headless WooCommerce-koppeling.';
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2322C55E'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M16 10l4.5 3.3-1.7 5.3h-5.6L11.5 13.3z' fill='%23fff'/%3E%3C/svg%3E";

await mkdir('dist', { recursive: true });
await writeFile('dist/standalone.html', `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="${desc}">
<meta name="robots" content="noindex,nofollow">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<link rel="icon" href="${icon}">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${page}
</body>
</html>
`);
console.log('dist/standalone.html klaar');
