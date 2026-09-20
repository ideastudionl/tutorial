# Interflex Stuc — website

Astro-site voor [interflexstuc.nl](https://interflexstuc.nl/), gehost op Vercel.
Statische pagina's, één serverfunctie voor de offerteaanvraag, en een portal waar
binnengekomen aanvragen te bekijken zijn.

De code staat in [`site/`](site/). De map `interflexstuc/` bevat het eerdere
WordPress-thema en wordt niet meer gebruikt.

## Wat er in zit

**Pagina's** — homepage, zes dienstpagina's, dertien werkgebiedpagina's, projecten,
prijzen, over ons, werkwijze, contact, offerte, privacyverklaring, voorwaarden en 404.
Alles wordt bij het bouwen als kant-en-klare HTML weggeschreven.

**Offerte-wizard** — vier stappen met een meelopende richtprijs, een rekenhulp voor
m² (breedte × hoogte per vlak) en een popup-variant die vanaf elke pagina te openen is.
Aanvragen gaan naar `/api/offerte`: die bewaart ze in Supabase én mailt ze via Resend.

**Portal** — `/portal/` toont de aanvragen, met telefoonnummer, e-mail, klusgegevens
en richtprijs, en een status per aanvraag (nieuw, gebeld, offerte, gewonnen, verloren).
Beveiligd met één wachtwoord uit `PORTAL_PASSWORD`.

**SEO** — JSON-LD voor `HomeAndConstructionBusiness`, `FAQPage`, `BreadcrumbList` en
per dienst een `Service`. Sitemap, robots.txt, canonicals, Open Graph, en 301-redirects
van de oude WordPress-URL's.

**Deelafbeeldingen** — elke pagina heeft een eigen `og:image` in `site/public/og/`,
met de juiste plaats of dienst en het juiste tarief erop. Dat is wat iemand ziet als
een link in WhatsApp of op LinkedIn wordt gedeeld. Ze worden gemaakt met Remotion,
uit dezelfde gegevens als de pagina's — zie `video/`.

**Lettertypes** — Archivo en Source Sans 3 staan in `site/public/fonts/` en komen dus
van ons eigen domein. Geen verbinding met Google, geen extra wachttijd voordat de
eerste tekst verschijnt, en niets dat bezoekersgegevens naar buiten stuurt.

## Lokaal draaien

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # productiebuild
```

## Livegang

**1. Supabase** — maak een project op [supabase.com](https://supabase.com), open de
SQL-editor en draai [`site/supabase-setup.sql`](site/supabase-setup.sql). Noteer uit
Settings → API de project-URL, de anon-sleutel en de service-role-sleutel.

**2. Resend** — maak een account op [resend.com](https://resend.com), voeg
`interflexstuc.nl` toe als domein en zet de DNS-records die Resend aangeeft. Maak
daarna een API-sleutel.

**3. Vercel** — koppel deze repository aan een nieuw project, met `site` als root
directory. Zet onder Settings → Environment Variables de waarden uit
[`site/.env.example`](site/.env.example). **Zet sleutels nooit in de repository.**

**4. Domein** — voeg `interflexstuc.nl` toe in Vercel en wijs de DNS-records aan.
Vercel regelt het SSL-certificaat zelf.

**5. Controleren vóór de DNS omgaat**
- Formulier insturen en kijken of de mail aankomt én de aanvraag in het portal staat
- `/portal/` openen en inloggen
- Een oude URL zoals `/stucwerk-stukadoor-amsterdam` proberen: die hoort te
  redirecten met een 301
- Search Console koppelen en `sitemap-index.xml` indienen

## Nog te doen vóór livegang

- **Redirects aanvullen.** In `site/astro.config.mjs` staan de URL's die ik uit
  zoekresultaten kon afleiden. Haal de volledige lijst uit Search Console
  (Pagina's → geïndexeerd) en vul aan — zonder redirect verliest een pagina zijn positie.
- **Echte reviews** in `site/src/data/reviews.ts`, en het cijfer in `site/src/data/site.ts`.
  Dat cijfer staat ook in de structured data, dus het moet kloppen.
- **Foto's.** Er staan nu placeholders. Leg ze in `site/public/` en verwijs ernaar
  vanuit de data-bestanden.
- **KvK- en BTW-nummer** in `site/src/data/site.ts`, en de privacyverklaring aanvullen.

## Aanpassingen doen

Teksten, prijzen, diensten, werkgebieden, reviews en projecten staan als data in
`site/src/data/`. Eén bestand aanpassen verandert de site overal waar die gegevens
voorkomen — ook in de structured data.

Verander je een tarief, een plaats of een dienst, draai dan `cd video && npm run og`
en commit het resultaat mee: anders blijven de deelafbeeldingen het oude tarief tonen.

Elke push naar `main` zet Vercel automatisch live. Een push naar een andere branch
levert een preview-URL op, zodat je een wijziging eerst kunt bekijken.
