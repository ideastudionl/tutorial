# Overdracht naar Lovable

Alles wat Lovable nodig heeft om Interflex Stuc te bouwen zonder het zelf te
verzinnen. Het idee: het dure werk in Lovable is niet het bouwen maar het
heen-en-weer over kleuren, teksten en logica. Dat staat hier allemaal al
vast, dus Lovable hoeft alleen de opmaak te maken.

## Wat er in zit

| Bestand | Wat het is | Overzetten |
| --- | --- | --- |
| `PROMPT.md` | Het eerste bericht voor Lovable | Plakken |
| `design/tokens.css` | Kleur, letters, ruimte, vorm | Letterlijk |
| `data/*.ts` | Bedrijfsgegevens, diensten, plaatsen, vragen, reviews, projecten | Ongewijzigd |
| `logica/quote.ts` | Prijsberekening van de offertewizard | Ongewijzigd |
| `supabase.sql` | Tabel voor de aanvragen, inclusief herkomstkolommen | Draaien |
| `INHOUD.md` | Title, description en H1 per pagina | Letterlijk |
| `REDIRECTS.md` | 13 oude adressen die moeten doorsturen | Instellen |
| `logo.svg` | Het logo | Kopiëren |

De 334 regels in `data/` en `logica/` zijn gewone TypeScript zonder
afhankelijkheden. Die werken ongewijzigd in React — daar hoeft niets aan
vertaald te worden.

## Wat niet meekomt

Drie dingen die in de Astro-versie zitten en in Lovable opnieuw moeten:

**De 31 deelafbeeldingen** staan in `site/public/og/`. Kopieer ze als vaste
bestanden naar de nieuwe site; ze zijn met Remotion gemaakt en dat draait
niet in Lovable. Wijzigt er later een tarief, dan kloppen ze niet meer en
moeten ze opnieuw — dat kan alleen in dit project.

**De lettertypes** staan nu op het eigen domein in `site/public/fonts/`, wat
twee externe verbindingen scheelt. In Lovable is Google Fonts eenvoudiger;
dat kost iets aan snelheid en is een bewuste afweging, geen vergissing.

**De pagina's als kant-en-klare HTML.** Dit is het enige punt dat de moeite
van het bewaken waard is. De site heeft 33 pagina's die nu als complete HTML
worden uitgeserveerd. Rendert Lovable ze pas in de browser, dan is dat voor
een lokale-SEO-site een stap terug. Vraag Lovable expliciet om server-side
rendering of prerendering, en controleer het na de bouw: open een
plaatspagina, bekijk de paginabron, en zoek of de tekst er staat. Staat er
alleen een leeg `<div id="root">`, dan is er iets mis.

## Volgorde

1. Nieuw project in Lovable met `PROMPT.md` als eerste bericht, en de
   bestanden van deze map erbij (zie `PROMPT.md` voor hoe).
2. Supabase aanzetten en `supabase.sql` draaien.
3. Resend koppelen voor de e-mail.
4. Deelafbeeldingen en logo erin zetten.
5. Redirects instellen uit `REDIRECTS.md`.
6. Paginabron controleren op een plaatspagina (zie hierboven).
7. Pas daarna het domein omzetten.

## Nog steeds open

Los van de techniek zijn dit dezelfde drie dingen als in de Astro-versie:
echte beoordelingen (die in `data/reviews.ts` zijn voorbeelden, en het cijfer
9,4 uit 87 is verzonnen), echte foto's, en het KvK- en BTW-nummer.
