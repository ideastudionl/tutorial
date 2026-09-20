/**
 * Rendert de marketingvideo's naar video/out/. Die map staat niet in git:
 * video's horen niet in een repository thuis, lever ze los aan.
 *
 *   npm run video
 */
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'out');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const chrome = browserExecutable ? { browserExecutable } : {};

const main = async () => {
  await mkdir(outDir, { recursive: true });

  const serveUrl = await bundle({
    entryPoint: path.join(root, 'src', 'index.ts'),
    onProgress: () => undefined,
  });

  for (const id of process.argv.slice(2).length ? process.argv.slice(2) : ['Uitleg', 'SocialPost']) {
    const composition = await selectComposition({ serveUrl, id, inputProps: {}, ...chrome });
    const output = path.join(outDir, `${id.toLowerCase()}.mp4`);
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: output,
      // x264 wil even afmetingen; alle composities voldoen daaraan.
      crf: 20,
      onProgress: () => undefined,
      ...chrome,
    });
    console.log(`  ✓ out/${path.basename(output)}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
