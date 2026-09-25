# Eerste bericht voor Lovable

Plak de tekst hieronder als eerste bericht in een nieuw Lovable-project.
Alles wat Lovable anders zou moeten verzinnen — kleuren, letters, teksten,
prijzen, plaatsen, de rekenformule — zit in de bestanden van deze map.
Daardoor hoeft Lovable alleen de opmaak te bouwen, en dat scheelt zowel
credits als afwijkingen van de huisstijl.

**De bestanden erbij krijgen.** Via de Lovable-koppeling in Claude kunnen de
bestanden rechtstreeks worden meegestuurd met dit bericht. Doe je het met de
hand in Lovable zelf, ga er dan niet van uit dat je `.ts`-bestanden kunt
slepen — de bijlagefunctie is vooral op afbeeldingen gericht. Plak in dat
geval de inhoud van `design/tokens.css`, `data/*.ts` en `logica/quote.ts` als
losse berichten na dit eerste bericht.

---

Bouw de website voor Interflex Stuc, een stukadoorsbedrijf in Amsterdam.
Alle inhoud en alle huisstijl zitten in de meegeleverde bestanden. Verzin
niets zelf en verander geen teksten, prijzen of kleuren.

**Techniek**
- React + TypeScript + Vite met Tailwind, jouw standaard.
- Gebruik server-side rendering of prerendering voor alle pagina's. Dit is
  een lokale-SEO-site: de teksten moeten in de HTML staan, niet pas na het
  laden van JavaScript.
- Supabase voor de database, Resend voor de e-mail.

**Huisstijl** — neem `design/tokens.css` letterlijk over in je Tailwind-thema.
- Merkkleuren: blauw `#0D4EAD` voor structuur en links, oranje `#F15A24`
  uitsluitend voor knoppen en accenten. Oranje is geen achtergrondkleur.
- Ondergrond is kalksteen `#F1EDE6`, niet wit. Donkere vlakken `#0A1626`.
- Koppen in Archivo (800, strak aangetrokken: `letter-spacing: -0.018em`),
  lopende tekst in Source Sans 3. Beide van Google Fonts.
- Knoppen zijn volledig rond (`border-radius: 999px`) met een rand van 2px.
  Alle andere hoeken zijn juist bijna recht (4–10px).
- Container is 1440px breed. Dit is bewust een brede opzet.

**Pagina's** — 33 stuks, zie `INHOUD.md` voor de volledige lijst en de
teksten per pagina.
- Homepage
- 6 dienstpagina's, gegenereerd uit `data/services.ts`
- 13 plaatspagina's op `/stukadoor/<plaats>/`, uit `data/areas.ts`
- 3 projectpagina's uit `data/projects.ts`
- Prijzen, werkwijze, werkgebied, over ons, contact, offerte
- Privacyverklaring, algemene voorwaarden, 404

**Offertewizard** — dit is het belangrijkste onderdeel van de site.
- Vier stappen: welk werk, wat voor ondergrond, hoeveel m², contactgegevens.
- Tijdens het invullen loopt er een richtprijs mee. Gebruik `logica/quote.ts`
  ongewijzigd; die formule staat ook op de server, zodat browser en server
  hetzelfde uitrekenen.
- Bij de oppervlakte kan de bezoeker kiezen uit vier bereiken, óf zelf m²
  invullen, óf breedte × hoogte per muur opgeven en laten optellen.
- Keuzerondjes springen automatisch door naar de volgende stap; vinkjes niet.
- Ook als popup te openen vanaf elke pagina.
- Verborgen honeypot-veld `website`: als dat is ingevuld, doe alsof het is
  gelukt maar verwerk niets.

**Formulier verwerken** (Supabase Edge Function)
- Valideer op de server, niet alleen in de browser.
- Sla de aanvraag eerst op, mail hem daarna. Een aanvraag mag nooit verloren
  gaan omdat de mail hapert. Lukken beide niet, geef dan het telefoonnummer
  terug in plaats van een bevestiging die niet waar is.
- Draai `supabase.sql` voor de tabel. Rijbeveiliging staat aan zonder
  policies: alleen de service-role-sleutel mag erbij.
- Twee mails: melding aan het bedrijf met alle gegevens, bevestiging aan de
  klant met de richtprijs. Antwoordadres van de melding is de klant.

**Herkomst meesturen** — leg bij elke aanvraag vast waar de bezoeker vandaan
kwam: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`,
`gclid`, `fbclid`, `msclkid`, plus landingspagina en verwijzer. Bewaar de
eerste aanraking van een bezoek in `sessionStorage` en stuur die mee met het
formulier. De kolommen staan al in `supabase.sql`. Zonder dit zie je bij
Google Ads wel de kosten, maar niet wat ze opleverden.

**Portal** op `/portal/`, afgeschermd met één wachtwoord uit een
omgevingsvariabele. Toont de aanvragen met contactgegevens, klusgegevens,
richtprijs en herkomst, en een status per aanvraag: nieuw, gebeld, offerte,
gewonnen, verloren. Houd `/portal/` uit de sitemap en zet hem op noindex.

**Toestemming** — cookiebanner waarin weigeren net zo makkelijk is als
accepteren, en de keuze in te trekken via de privacyverklaring. Google laadt
met Consent Mode v2 op geweigerd; de Meta-pixel pas na toestemming. Staat er
geen meetcode ingesteld, laat dan ook geen banner zien.

**SEO**
- Elke pagina een eigen title en description. Description tussen 110 en 165
  tekens, anders blijft het zoekresultaat half leeg.
- De homepage mag níét dezelfde title krijgen als `/stukadoor/amsterdam/`.
  De plaatspagina krijgt "Stukadoor Amsterdam"; de homepage richt zich op de
  regio. Anders concurreren die twee met elkaar.
- JSON-LD: `HomeAndConstructionBusiness` op elke pagina, plus `Service` per
  dienst, `FAQPage` waar vragen staan en `BreadcrumbList`.
- Neem géén `aggregateRating` op. De beoordelingen in `data/reviews.ts` zijn
  voorbeelden; verzonnen beoordelingen doorgeven is in strijd met de
  richtlijnen van Google.
- Sitemap, robots.txt met `/portal/` uitgesloten, en de 301-redirects uit
  `REDIRECTS.md`.

**Responsive** — getest en werkend van 320 tot 1920 pixels breed. Twee dingen
die in de Astro-versie fout gingen en hier niet moeten terugkomen:
- Het menu moet inklappen op 1180px, niet op 768px. Daaronder passen merk,
  menu en knoppen niet naast elkaar en scrolt de pagina horizontaal.
- Gebruik `minmax(min(320px, 100%), 1fr)` in rasters, niet `minmax(320px, 1fr)`.
  Anders dwingt een raster op een scherm van 320px een kolom van 320px af
  binnen 283 beschikbare pixels.

Begin met de homepage en de offertewizard. De rest volgt daarna.
