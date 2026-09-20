// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

/**
 * De site is grotendeels statisch: elke pagina wordt bij het bouwen
 * uitgerekend en als kant-en-klare HTML geserveerd. Alleen de offerte-API en
 * het portal draaien op de server, omdat die met de database praten.
 */
export default defineConfig({
  site: 'https://interflexstuc.nl',
  output: 'static',
  adapter: vercel({ webAnalytics: { enabled: true } }),
  // Portal en API horen niet in de sitemap of de zoekresultaten.
  integrations: [sitemap({ filter: (page) => !page.includes('/portal') })],
  build: { inlineStylesheets: 'auto' },

  /**
   * 301-redirects van de oude WordPress-URL's. Zonder deze verliezen de
   * stadspagina's hun posities in Google. Aanvullen zodra de volledige lijst
   * uit Search Console bekend is.
   */
  redirects: {
    '/stucwerk-stukadoor-amsterdam': '/stukadoor/amsterdam/',
    '/stucwerk-stukadoor-amstelveen': '/stukadoor/amstelveen/',
    '/stucwerk-stukadoor-haarlem': '/stukadoor/haarlem/',
    '/stucwerk-stukadoor-almere': '/stukadoor/almere/',
    '/stucwerk-stukadoor-purmerend': '/stukadoor/purmerend/',
    '/stucwerk-stukadoor-aalsmeer': '/stukadoor/aalsmeer/',
    '/stucwerk-stukadoor-uithoorn': '/stukadoor/uithoorn/',
    '/stucwerk-stukadoor-utrecht': '/stukadoor/utrecht/',
    '/stucwerk-stukadoor-den-haag': '/stukadoor/den-haag/',
    '/stucwerk-stukadoor-noord-holland': '/werkgebied/',
    '/sierpleister': '/diensten/sierpleister-spachtelputz/',
    '/spachtelputz-2': '/diensten/sierpleister-spachtelputz/',
    '/diensten/buitengevel-stukadoren': '/diensten/buitengevel-stucen/',
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
