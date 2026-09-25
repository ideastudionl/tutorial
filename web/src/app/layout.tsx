import type { Metadata } from 'next';

const basis = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clover-beheer.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(basis),
  title: {
    default: 'Clover Uitzendbureau — werk dat bij je past',
    template: '%s — Clover Uitzendbureau',
  },
  description:
    'Clover Uitzendbureau brengt vakmensen en werkgevers samen in acht sectoren. ' +
    'Filter vacatures, solliciteer in één minuut of vraag direct personeel aan.',
  openGraph: { type: 'website', locale: 'nl_NL' },
};

export const viewport = { themeColor: '#1B7F58', colorScheme: 'light' as const };

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath d='M24 22C24 13 20 7 13.5 7 7.8 7 4 11.2 4 16.4 4 20.6 7.6 22 24 22Z' fill='%231B7F58'/%3E%3Cpath d='M26 22c0-9 4-15 10.5-15C42.2 7 46 11.2 46 16.4 46 20.6 42.4 22 26 22Z' fill='%232E9B6E'/%3E%3Cpath d='M24 24C24 33 20 39 13.5 39 7.8 39 4 34.8 4 29.6 4 25.4 7.6 24 24 24Z' fill='%230E4633'/%3E%3Cpath d='M26 24c0 9 4 15 10.5 15C42.2 39 46 34.8 46 29.6 46 25.4 42.4 24 26 24Z' fill='%237FC0A5'/%3E%3C/svg%3E";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..800&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
