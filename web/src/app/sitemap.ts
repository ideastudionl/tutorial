import type { MetadataRoute } from 'next';
import { supabasePubliek, online } from '@/lib/publiek';

const basis = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clover-beheer.vercel.app';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: vacatures }, { data: paginas }] = await Promise.all([
    online().order('gepubliceerd_op', { ascending: false }),
    supabasePubliek().from('paginas').select('slug, gewijzigd_op').eq('status', 'online'),
  ]);

  const vast: MetadataRoute.Sitemap = [
    { url: basis, changeFrequency: 'daily', priority: 1 },
    { url: `${basis}/vacatures`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${basis}/sectoren`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${basis}/werkgevers`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${basis}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${basis}/open-sollicitatie`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const vac = ((vacatures ?? []) as unknown as { slug: string; gepubliceerd_op: string | null }[])
    .map((v) => ({
      url: `${basis}/vacatures/${v.slug}`,
      lastModified: v.gepubliceerd_op ? new Date(v.gepubliceerd_op) : undefined,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  const pag = (paginas ?? []).map((p) => ({
    url: `${basis}/${p.slug}`,
    lastModified: p.gewijzigd_op ? new Date(p.gewijzigd_op) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...vast, ...vac, ...pag];
}
