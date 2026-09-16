/**
 * Bouwt een self-contained single-file demo (dist/lermode-demo.html)
 * door CSS en JS inline te zetten. Handig om te delen of te previewen.
 *   node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/style.css', 'utf8');
const js = readFileSync('assets/js/main.js', 'utf8');

const out = html
  .replace('<link rel="stylesheet" href="assets/css/style.css">', `<style>\n${css}\n</style>`)
  .replace('<script src="assets/js/main.js"></script>', `<script>\n${js}\n</script>`);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/lermode-demo.html', out);
console.log(`dist/lermode-demo.html — ${(out.length / 1024).toFixed(1)} kB`);
