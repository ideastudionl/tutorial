/* Bouwt demo/index.html om tot één bestand: dist/witgoed-koning-demo.html.
   Nodig voor publicatie als Artifact (die verwacht één document zonder
   <html>/<head>/<body>) en handig om de demo als bijlage te versturen.
   Gebruik: node build/inline.mjs */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const src = readFileSync(resolve(root, 'demo/index.html'), 'utf8');

const read = (rel) => readFileSync(resolve(root, 'demo', rel), 'utf8');

const title = src.match(/<title>([\s\S]*?)<\/title>/)[1];
const fontsLink = src.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/)[0];
const cssHref = src.match(/<link rel="stylesheet" href="(assets\/[^"]+)">/)[1];
const scripts = [...src.matchAll(/<script src="(assets\/[^"]+)"><\/script>/g)].map(m => m[1]);
const body = src.match(/<body>([\s\S]*?)<script/)[1].trim();

/* </script> binnen JS-strings zou de inline tag vroegtijdig sluiten. */
const safe = (js) => js.replace(/<\/script>/gi, '<\\/script>');

const out = [
  fontsLink,
  `<title>${title}</title>`,
  '<style>',
  read(cssHref),
  '</style>',
  '',
  body,
  '',
  '<script>',
  scripts.map(s => `/* ${s} */\n` + safe(read(s))).join('\n\n'),
  '</script>',
  ''
].join('\n');

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/witgoed-koning-demo.html'), out);
console.log(`dist/witgoed-koning-demo.html — ${(out.length / 1024).toFixed(0)} kB, ${scripts.length} scripts inline`);
