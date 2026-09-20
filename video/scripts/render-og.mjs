/**
 * Genereert één deelafbeelding per pagina, rechtstreeks uit de gegevens van de
 * site. Eén bron voor prijzen, plaatsen en diensten — de afbeeldingen kunnen
 * dus niet uit de pas lopen met de pagina's.
 *
 *   npm run og
 *
 * Resultaat: site/public/og/*.jpg, die Base.astro als og:image meegeeft.
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { build } from 'esbuild';
import { mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const siteDir = path.resolve(root, '..', 'site');
const outDir = path.join(siteDir, 'public', 'og');

/** In deze sandbox en in CI mag Remotion geen eigen Chrome downloaden. */
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;

/** De site-gegevens zijn TypeScript; esbuild maakt er even gewone JS van. */
const loadSiteData = async () => {
  const tmp = path.join(root, 'node_modules', '.cache', 'og-data.mjs');
  await mkdir(path.dirname(tmp), { recursive: true });
  await build({
    entryPoints: [path.join(here, 'site-data.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: tmp,
    logLevel: 'silent',
  });
  return import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const main = async () => {
  const { site, services, areas, projects } = await loadSiteData();

  const headline = services.find((s) => s.headline) ?? services[0];
  const price = headline.priceLabel ? `vanaf ${headline.priceLabel}` : undefined;
  const rating = site.rating
    ? `${site.rating.score} uit ${site.rating.count} reviews`
    : undefined;

  /** Eén regel per pagina: bestandsnaam + wat er op de afbeelding komt. */
  const jobs = [
    {
      name: 'home',
      eyebrow: `Stukadoor ${site.city}`,
      title: 'Strak stucwerk dat jaren mooi blijft',
      price,
      rating,
    },
    { name: 'diensten', eyebrow: 'Ons werk', title: 'Alle stukadoorsdiensten op een rij', price, rating },
    { name: 'prijzen', eyebrow: 'Tarieven', title: 'Wat kost stucwerk?', price, rating },
    { name: 'werkwijze', eyebrow: 'Zo werken wij', title: 'Van offerte tot oplevering', rating },
    { name: 'werkgebied', eyebrow: 'Werkgebied', title: `${site.city} en omstreken`, rating },
    { name: 'over-ons', eyebrow: 'Over Interflex Stuc', title: 'Vakmensen uit de buurt', rating },
    { name: 'contact', eyebrow: 'Contact', title: 'Even overleggen? Bel of mail ons', rating },
    { name: 'offerte', eyebrow: 'Gratis en vrijblijvend', title: 'Offerte binnen 24 uur', price },
    { name: 'projecten', eyebrow: 'Projecten', title: 'Werk dat we opgeleverd hebben', rating },

    ...services.map((service) => ({
      name: `diensten-${service.slug}`,
      eyebrow: `Stukadoor ${site.city}`,
      title: service.title,
      price: service.rate ? `vanaf ${service.priceLabel}` : 'prijs op aanvraag',
      rating,
    })),

    ...areas.map((area) => ({
      name: `stukadoor-${area.slug}`,
      eyebrow: 'Stukadoor',
      title: `Stucwerk in ${area.city}`,
      price,
      rating,
      spine: `Stukadoor ${area.city}`,
    })),

    ...projects.map((project) => ({
      name: `projecten-${project.slug ?? slugify(project.title)}`,
      eyebrow: 'Project',
      title: project.title,
      rating,
    })),
  ];

  console.log(`Bundelen…`);
  const serveUrl = await bundle({
    entryPoint: path.join(root, 'src', 'index.ts'),
    onProgress: () => undefined,
  });

  const composition = await selectComposition({
    serveUrl,
    id: 'OgImage',
    inputProps: {},
    ...(browserExecutable ? { browserExecutable } : {}),
  });

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const job of jobs) {
    const { name, ...inputProps } = job;
    await renderStill({
      // renderStill leest de props van het composition-object; inputProps
      // alleen meegeven levert voor elke pagina hetzelfde plaatje op.
      composition: { ...composition, props: { ...composition.props, ...inputProps } },
      serveUrl,
      output: path.join(outDir, `${name}.jpg`),
      imageFormat: 'jpeg',
      jpegQuality: 82,
      ...(browserExecutable ? { browserExecutable } : {}),
    });
    console.log(`  ✓ og/${name}.jpg`);
  }

  // Base.astro leidt de bestandsnaam af uit het pad. Deze lijst zegt welke
  // namen er echt zijn, zodat een pagina zonder eigen beeld terugvalt op home.
  const names = jobs.map((job) => job.name).sort();
  await writeFile(
    path.join(siteDir, 'src', 'data', 'og.ts'),
    [
      '// Gegenereerd door video/scripts/render-og.mjs — niet met de hand bijwerken.',
      '',
      'export const ogImages = new Set([',
      ...names.map((name) => `  '${name}',`),
      ']);',
      '',
    ].join('\n'),
  );

  const written = await readdir(outDir);
  console.log(`\n${written.length} afbeeldingen in site/public/og/ + src/data/og.ts`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
