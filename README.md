# Clover Uitzendbureau — redesign demo

Klikbare designdemo voor de nieuwe website van Clover Uitzendbureau: een
vacaturebank met filters, een duidelijk pad voor opdrachtgevers,
Google-beoordelingen als vertrouwenssignaal, en een zakelijke, moderne
vormtaal.

**Opdracht:** vacaturebank in de geest van axstechniek.nl, vertaald naar een
eigen, professionele signatuur voor Clover.

---

## Demo starten

Geen build, geen dependencies. Open `index.html` in de browser, of serveer
de map lokaal (aanbevolen, want dan werkt alles zoals online):

```bash
npx http-server -p 8099 -s
# → http://127.0.0.1:8099/index.html
```

## Wat er in zit

| Pagina | Route | Wat je ziet |
|---|---|---|
| Home | `#/` | Hero met directe vacaturezoeker en een preview van de vacaturebank, splitsing werkzoekende/opdrachtgever, uitgelichte vacatures, sectoren, cijfers, werkwijze, Google-beoordelingen, keurmerken |
| Vacaturebank | `#/vacatures` | 24 vacatures, filters op sector/plaats/dienstverband/contractvorm/opleiding/uurloon, sorteren, actieve-filterchips, lege staat |
| Vacaturedetail | `#/vacature/v-1001` | Volledige vacature, sticky solliciteerkaart met intercedent, WhatsApp-sollicitatie, vergelijkbare vacatures |
| Sectoren | `#/sectoren` | Acht sectoren met vacaturetelling en instapsalaris |
| Voor werkgevers | `#/werkgevers` | Hero met een voorbeeldaanvraag en voorgedragen kandidaten, diensten, werkwijze, keurmerken, Google-reviews, aanvraagformulier, FAQ |
| Over Clover | `#/over` | Belofte, cijfers, team met directe doorkiesnummers, FAQ werkzoekenden |
| Contact | `#/contact` | Contactkaarten, inloopspreekuur, contactformulier |

**Werkende interactie:** filteren en sorteren (filters staan in de URL, dus
een gefilterde lijst is deelbaar), sollicitatiemodal met validatie en
succesbeeld, cv-upload met drag & drop, jobalert, personeelsaanvraag,
accordeons, mobiel menu, mobiele filterlade, deel-knop.

## Belangrijk: dit is een ontwerpvoorstel

- **Alle content is voorbeeldmateriaal.** Vacatures, bedrijfsnamen,
  medewerkers, reviews, cijfers, adres, KvK- en btw-nummer zijn verzonnen.
  Ze staan gegroepeerd in `assets/js/data.js` zodat ze in één bestand te
  vervangen zijn.
- **De huidige site en axstechniek.nl konden niet worden ingelezen** — het
  netwerk van deze omgeving blokkeerde beide domeinen. De sectorindeling,
  diensten en teksten zijn dus een beredeneerd voorstel op basis van de
  briefing, niet een overname van bestaande content. Verwacht hier een
  correctieronde.
- **Formulieren versturen niets.** Ze valideren, tonen een succesbeeld en
  stoppen daar. Koppeling aan het ATS of de mailservice is stap 2.
- **Monogrammen in plaats van portretfoto's.** Medewerkers en reviewers
  krijgen hun initialen in een merktint. Dat is een bewuste plaatsvervanger:
  echte foto's van echte mensen op de werkvloer maken dit merk sterker.
  Zie *Fotografie inbouwen* hieronder.
- **De Google-reviews zijn voorbeelddata.** Score, aantal, sterverdeling en
  de reviews zelf staan in `GOOGLE` en `REVIEWS_*` in `assets/js/data.js`,
  met dezelfde velden die de Google Places API teruggeeft.

## Structuur

```
index.html              schil: header, footer, modal, toast
assets/css/tokens.css   kleuren, typografie, ruimte, beweging
assets/css/style.css    basis, componenten, responsive, animatie
assets/js/data.js       ← ALLE CONTENT: vacatures, sectoren, team, FAQ, cijfers
assets/js/icons.js      SVG-iconen, klaverlogo, portretten, hero-illustratie
assets/js/views.js      paginatemplates
assets/js/app.js        router, filterlogica, animaties, formulieren
```

## Content aanpassen

**Een vacature toevoegen** — voeg een object toe aan `VACATURES` in
`assets/js/data.js`. De filters, tellingen, sectorpagina's en
"vergelijkbare vacatures" werken daarna automatisch mee:

```js
{
  id: 'v-1025', titel: 'Monteur laadpalen', sector: 'techniek',
  plaats: 'Almere', provincie: 'Flevoland',
  dienstverband: 'Fulltime',           // Fulltime | Parttime | Bijbaan
  uren: 40,
  contract: 'Uitzenden',               // zie CONTRACTVORMEN
  opleiding: 'MBO 3-4',                // zie OPLEIDINGEN
  min: 18.00, max: 24.00,              // uurloon
  dagen: 0,                            // dagen geleden geplaatst
  spoed: true, rijbewijs: true, ploegen: false,
  recruiter: 'nadia',                  // zie RECRUITERS
  bedrijf: 'Installateur van laadinfrastructuur',
  intro: '…', taken: ['…'], vraag: ['…'], bieden: ['…']
}
```

**Een sector wijzigen** — pas `SECTOREN` aan. `kleur` en `zacht` sturen de
accentkleur van kaarten, filters en de detailpagina; `icoon` verwijst naar
een sleutel in `ICO` (`assets/js/icons.js`).

**Merkkleuren en typografie** — alles staat in `assets/css/tokens.css`.
Eén waarde veranderen werkt door in de hele site.

## Google-reviews live koppelen

`GOOGLE` in `assets/js/data.js` heeft dezelfde vorm als het antwoord van de
Google Places API (`Place Details`):

```js
const GOOGLE = {
  score: 4.8,        // → result.rating
  aantal: 137,       // → result.user_ratings_total
  url: '…',          // → result.url
  verdeling: [112, 18, 4, 2, 1]   // 5★ → 1★ (zelf tellen of via een widgetdienst)
};
```

De losse reviews (`REVIEWS_WERKZOEKEND` / `REVIEWS_WERKGEVER`) mappen op
`result.reviews`: `author_name` → `naam`, `rating` → `ster`,
`relative_time_description` → `datum`, `text` → `quote`. Het veld `rol`
voegt Clover zelf toe, want dat geeft Google niet terug. Haal de API-call in
productie aan de serverkant op en cache het resultaat — de sleutel hoort
niet in de front-end, en Google staat geen onbeperkt aantal calls toe.

## Fotografie inbouwen

Vervang `monogram(naam, i)` in `assets/js/views.js` door een `<img>` met
dezelfde `.avatar`-klasse; de vorm en afmeting blijven dan kloppen. Op de
teampagina zit al een vlak van 4:3 klaar waar een portret in past.

## Ontwerpkeuzes

Zie `DESIGN.md` voor de vormtaal, de kleur- en typografiekeuzes en de
overwegingen achter de vacaturebank.

## Als dit doorgaat: aandachtspunten voor productie

1. **SEO.** Deze demo is één pagina met een hash-router. Dat is prima om te
   beoordelen, maar vacatures moeten voor Google en Indeed elk een eigen
   URL, `<title>`, `<meta description>` en `JobPosting`-structured data
   hebben. In productie hoort hier server-side rendering onder (Next.js,
   Astro of een WordPress/Craft-thema).
2. **Vacaturebron.** Koppel de bank aan het bestaande ATS of vacaturesysteem
   in plaats van een handmatige lijst, inclusief automatische publicatie
   naar Indeed, Google for Jobs en Nationale Vacaturebank.
3. **Sollicitatie-afhandeling.** Formulieren naar het ATS, met bevestigings-
   mail, VOG/ID-flow en AVG-bewaartermijnen.
4. **Toegankelijkheid.** De demo houdt rekening met toetsenbordbediening,
   focusstates, `prefers-reduced-motion` en contrast. Voor oplevering hoort
   hier een volledige WCAG 2.1 AA-toets bij — relevant omdat een groot deel
   van de doelgroep op een goedkope telefoon zit.
5. **Prestaties.** Nu twee webfonts van Google Fonts; zelf hosten scheelt een
   externe verbinding en is AVG-vriendelijker.
6. **Meertaligheid.** Voor logistiek, productie en schoonmaak is een Engelse
   en Poolse variant van de vacaturebank waarschijnlijk meer waard dan welke
   designverfijning dan ook.
