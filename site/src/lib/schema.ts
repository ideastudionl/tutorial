import { site } from '../data/site';
import { services } from '../data/services';
import { areas } from '../data/areas';

/** JSON-LD voor het bedrijf. Staat op elke pagina. */
export function businessSchema() {
  // Dagen zonder openingstijd (zondag) vallen af. Het type-predicaat vertelt
  // TypeScript dat opens en closes daarna wél bestaan.
  const openingHours = site.hours
    .filter((h): h is Extract<(typeof site.hours)[number], { opens: string }> => 'opens' in h)
    .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes }));

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${site.url}/#organisatie`,
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    logo: `${site.url}/logo.svg`,
    image: `${site.url}/logo.svg`,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.street,
      postalCode: site.postcode,
      addressLocality: site.city,
      addressCountry: 'NL',
    },
    openingHoursSpecification: openingHours,
    areaServed: areas.map((a) => ({ '@type': 'City', name: a.city })),
    // Alleen doorgeven als de cijfers kloppen; zie data/site.ts.
    ...(site.rating.geverifieerd
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: site.rating.score.replace(',', '.'),
            reviewCount: site.rating.count,
            bestRating: '10',
            worstRating: '1',
          },
        }
      : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Diensten',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.short, url: `${site.url}/diensten/${s.slug}/` },
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
