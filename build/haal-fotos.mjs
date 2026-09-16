/* Haalt de productfoto's van de bestaande WooCommerce-webshop op, zet ze in
   demo/assets/foto/ en schrijft het fotomanifest.

   Draai dit op een computer die witgoed-koning.nl kan bereiken:

     node build/haal-fotos.mjs
     node build/haal-fotos.mjs --url https://witgoed-koning.nl --max 4

   De Store API is publiek; er is geen sleutel of inlog voor nodig. Bestanden
   krijgen het artikelnummer als naam, zodat de demo ze vanzelf oppakt.       */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const fotoMap = resolve(root, 'demo/assets/foto');

function arg(naam, standaard) {
  const i = process.argv.indexOf('--' + naam);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : standaard;
}

const basis = arg('url', 'https://witgoed-koning.nl').replace(/\/$/, '');
const maxPerProduct = parseInt(arg('max', '4'), 10);
const OMSCHRIJVING = ['Vooraanzicht', 'Bedieningspaneel', 'Binnenzijde', 'Gebruikssporen'];

const veilig = (s) => String(s).replace(/[^A-Za-z0-9._-]/g, '-');

async function haalProducten() {
  const alles = [];
  for (let pagina = 1; pagina <= 20; pagina++) {
    const url = `${basis}/wp-json/wc/store/v1/products?per_page=100&page=${pagina}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`${url} gaf status ${res.status}`);
    const batch = await res.json();
    alles.push(...batch);
    if (batch.length < 100) break;
  }
  return alles;
}

async function bewaar(src, doel) {
  if (existsSync(doel)) return 'bestond al';
  const res = await fetch(src);
  if (!res.ok) throw new Error(`status ${res.status}`);
  writeFileSync(doel, Buffer.from(await res.arrayBuffer()));
  return 'opgehaald';
}

const producten = await haalProducten();
console.log(`${producten.length} producten gevonden op ${basis}`);

mkdirSync(fotoMap, { recursive: true });
const manifest = {};
let gehaald = 0, mislukt = 0;

for (const p of producten) {
  const sku = veilig(p.sku || p.slug);
  const fotos = (p.images || []).slice(0, maxPerProduct);
  if (!fotos.length) continue;

  manifest[sku] = [];
  for (let i = 0; i < fotos.length; i++) {
    const ext = (extname(new URL(fotos[i].src).pathname) || '.jpg').toLowerCase();
    const bestand = `${sku}-${i + 1}${ext}`;
    try {
      const wat = await bewaar(fotos[i].src, resolve(fotoMap, bestand));
      if (wat === 'opgehaald') gehaald++;
      manifest[sku].push({
        bestand,
        omschrijving: fotos[i].alt || OMSCHRIJVING[i] || `Foto ${i + 1}`
      });
    } catch (e) {
      mislukt++;
      console.warn(`  ${bestand}: ${e.message}`);
    }
  }
  if (!manifest[sku].length) delete manifest[sku];
}

const kop = `/* Automatisch geschreven door build/haal-fotos.mjs op ${new Date().toISOString().slice(0, 10)}.
   Bron: ${basis}. Niet met de hand aanpassen — draai het script opnieuw. */
window.WK = window.WK || {};

WK.FOTOS = `;
writeFileSync(resolve(fotoMap, 'manifest.js'), kop + JSON.stringify(manifest, null, 2) + ';\n');

console.log(`${gehaald} foto's opgehaald, ${mislukt} mislukt, ${Object.keys(manifest).length} artikelen in het manifest`);
console.log('Draai daarna: node build/inline.mjs');
