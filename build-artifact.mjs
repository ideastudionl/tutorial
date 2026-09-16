/**
 * Bouwt de artifact-versie (dist/lermode-artifact.html): body-inhoud met
 * inline CSS/JS, zonder eigen <html>/<head>-wrapper.
 *   node build-artifact.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/style.css', 'utf8');
const js = readFileSync('assets/js/main.js', 'utf8');

const body = html.split('<body>')[1].split('</body>')[0]
  .replace('<script src="assets/js/main.js"></script>', '')
  .trim();

const safeArea = `
/* Artifact-skelet: veilige zones respecteren */
html,body{margin:0}
.header{top:env(safe-area-inset-top,0px)}
.announce{padding-top:env(safe-area-inset-top,0px);height:auto;min-height:38px}
.toast{bottom:calc(34px + env(safe-area-inset-bottom,0px))}
`;

const out = `<title>LERMODE Amsterdam</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
${css}
${safeArea}
</style>
${body}
<script>
${js}
</script>
`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/lermode-artifact.html', out);
console.log(`dist/lermode-artifact.html — ${(out.length / 1024).toFixed(1)} kB`);
