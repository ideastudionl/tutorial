/**
 * Meetcodes voor advertenties en statistiek.
 *
 * Alles staat uit zolang er geen code is ingevuld: zonder omgevingsvariabelen
 * laadt de site geen enkele externe tag en verschijnt er geen cookiebanner.
 * Vul ze in bij Vercel → Settings → Environment Variables.
 */
const env = import.meta.env;

export const tags = {
  /** Google Analytics 4, bijvoorbeeld G-XXXXXXX. */
  ga4: (env.PUBLIC_GA4_ID as string) || '',
  /** Google Ads, bijvoorbeeld AW-123456789. */
  ads: (env.PUBLIC_ADS_ID as string) || '',
  /** Conversielabel uit Google Ads, bijvoorbeeld AbC-D_efGh12. */
  adsLabel: (env.PUBLIC_ADS_CONVERSIE_LABEL as string) || '',
  /** Meta (Facebook/Instagram) pixel, alleen cijfers. */
  meta: (env.PUBLIC_META_PIXEL_ID as string) || '',
};

/** Laadt de site überhaupt iets waarvoor toestemming nodig is? */
export const tagsActief = Boolean(tags.ga4 || tags.ads || tags.meta);
