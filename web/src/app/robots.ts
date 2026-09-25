import type { MetadataRoute } from 'next';

const basis = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clover-beheer.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Het beheer en de inlog horen niet in een zoekmachine.
      disallow: ['/beheer', '/inloggen', '/api/'],
    },
    sitemap: `${basis}/sitemap.xml`,
  };
}
