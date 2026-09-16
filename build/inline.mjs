/* Bouwt demo/index.html om tot één bestand: dist/witgoed-koning-demo.html.
   Nodig voor publicatie als Artifact (die verwacht één document zonder
   <html>/<head>/<body>) en handig om de demo als bijlage te versturen.
   Gebruik: node build/inline.mjs */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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

/* Het losse bestand heeft geen map ernaast, dus foto's gaan er als data-URI in. */
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' };
let fotoBytes = 0;

function fotosInsluiten(js) {
  /* Werkt zowel op het automatisch geschreven manifest (JSON, dubbele
     aanhalingstekens) als op een met de hand ingevuld manifest (enkele). */
  return js.replace(/(["']?bestand["']?\s*:\s*)(["'])([^"']+)\2/g, (heel, kop, q, bestand) => {
    const pad = resolve(root, 'demo/assets/foto', bestand);
    const ext = bestand.slice(bestand.lastIndexOf('.')).toLowerCase();
    if (!existsSync(pad) || !MIME[ext]) return heel;
    const buf = readFileSync(pad);
    fotoBytes += buf.length;
    return `${kop}${q}data:${MIME[ext]};base64,${buf.toString('base64')}${q}`;
  });
}

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
  scripts.map(s => `/* ${s} */\n` + safe(s.includes('/foto/') ? fotosInsluiten(read(s)) : read(s))).join('\n\n'),
  '</script>',
  ''
].join('\n');

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/witgoed-koning-demo.html'), out);
const mb = out.length / 1024 / 1024;
console.log(`dist/witgoed-koning-demo.html — ${(out.length / 1024).toFixed(0)} kB, ${scripts.length} scripts inline` +
  (fotoBytes ? `, ${(fotoBytes / 1024 / 1024).toFixed(1)} MB aan foto's ingesloten` : ''));
if (mb > 15) console.warn(`Let op: ${mb.toFixed(1)} MB. Boven 16 MB weigert de Artifact-publicatie; verklein de foto's of neem er minder mee.`);
