/* Bouwt de deploybare site: index.html is geschreven als fragment (zodat hij
   ook als artifact werkt); hier wordt hij in een volwaardig HTML-document
   gezet en samen met assets/ naar dist/ geschreven. */
import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';

const body = await readFile('index.html', 'utf8');
const title = 'Soccer MeMo, het voetbal-memoryspel';
const desc = 'Soccer MeMo: het voetbal-memoryspel met 48 kaarten. Ontwerpvoorstel voor de nieuwe webwinkel van soccer-games.nl.';

const doc = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${desc}">
<meta name="robots" content="noindex, nofollow">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230B6B3A'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M16 10l4.5 3.3-1.7 5.3h-5.6L11.5 13.3z' fill='%23fff'/%3E%3C/svg%3E">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{color-scheme:light dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', doc);
await cp('assets', 'dist/assets', { recursive: true });
console.log('dist/ klaar');
