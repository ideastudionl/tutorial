import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * Laadt dezelfde lettertypes als de site, vanaf schijf. Remotion wacht met
 * renderen tot ze klaar zijn, anders valt het eerste frame terug op een
 * systeemfont en klopt de uitlijning niet.
 */
const faces: [string, string][] = [
  ['Archivo', 'fonts/archivo-latin.woff2'],
  ['Source Sans 3', 'fonts/source-sans-3-latin.woff2'],
];

let started = false;

export const loadFonts = () => {
  if (started) return;
  started = true;

  const handle = delayRender('Lettertypes laden');

  Promise.all(
    faces.map(async ([family, path]) => {
      const face = new FontFace(family, `url(${staticFile(path)}) format('woff2')`, {
        weight: '200 900',
        display: 'block',
      });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
