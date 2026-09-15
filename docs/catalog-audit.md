# Wat de Store API teruggeeft (controle, eerste pagina)

De Store API op `https://www.soccer-games.nl/wp-json/wc/store/v1/products` werkt:
hij geeft geldige JSON met prijzen in centen (`currency_minor_unit: 2`), voorraad,
gewicht en afmetingen. Technisch kunnen we koppelen.

Inhoudelijk ziet de catalogus er anders uit dan het ontwerp aanneemt. Hieronder
wat de eerste tien producten laten zien, en wat er moet gebeuren voordat een
headless front-end er iets moois van kan maken.

## De tien producten op pagina 1

| ID | Naam | Type | Prijs | Voorraad |
|---|---|---|---|---|
| 796 | 3D-papierpuzzel Voetbalveld Stadion … TMZ | variabel | € 2,93 – 3,07 | 161 |
| 795 | Marmeren schietspelmachine … concentratietraining | simpel | € 12,80 | 3 |
| 696 | Kingsday Shirt | variabel | € 5,07 – 10,73 | 26.932 |
| 684 | Opblaasbare WK 2026 Bank | variabel | € 28,05 – 28,42 | 58 |
| 662 | WK 2026 Limited Edition Puzzel – 300 stuks | simpel | € 99,47 | 2 |
| 661 | Voetbal Tafelkleed | variabel | € 3,65 – 8,84 | 193 |
| 616 | WK 2026 kussen | variabel | € 9,86 – 32,18 | 23 |
| 615 | WK 2026 3D Muursticker | variabel | € 4,77 – 6,57 | 15 |
| 578 | WK 2026 Beker | simpel | € 125,27 | 3 |
| 577 | WK 2026 Gouden handschoen | simpel | € 16,68 | 3 |

**Soccer Memo staat er niet bij** — hij bleek als elfde product in de catalogus te
staan (ID 65, slug `soccer-memo`). Zie hieronder.

## Soccer Memo (ID 65) — het eigen product

| Veld | Waarde |
|---|---|
| Prijs | € 14,95, afgeprijsd van € 19,95 (`on_sale: true`) |
| Voorraad | 39 stuks, maximaal 39 per bestelling |
| Type | simpel product, geen varianten |
| Foto's | 7 stuks, **op het eigen domein** (`/wp-content/uploads/2022/07/…`) |
| Tekst | nette Nederlandse copy, geschreven voor de winkel |
| SKU | leeg |
| Gewicht en afmetingen | leeg |
| Categorie | geen |
| Reviews | 0 |

Dit product is in orde: goede foto's, goede tekst, kloppende prijs. Wat mist:
een SKU, gewicht en afmetingen (nodig zodra de verzendkosten op gewicht worden
berekend), een categorie, en reviews.

De hele catalogus telt **elf producten**: Soccer Memo plus tien ingekochte
artikelen. Dat maakt route A (merkwinkel met Soccer Memo centraal) goed
haalbaar — het is geen catalogus van honderden artikelen die om filters vraagt.

## Wat een headless front-end hier tegenhoudt

Een koppeling toont exact wat er in WooCommerce staat. Deze punten worden dus
één op één zichtbaar op de nieuwe winkel:

1. **Geen categorieën.** Elk product heeft `categories: []` en `tags: []`. Zonder
   indeling is er geen navigatie, geen filter, geen categoriepagina en geen
   interne links voor SEO. Dit is het grootste blokkerende punt.
2. **Afbeeldingen staan niet in WordPress.** Alle `images[].src` wijzen naar
   `ae01.alicdn.com` (de AliExpress-CDN). Dat betekent: geen eigen beeldbeheer,
   geen optimalisatie via `next/image`, en een winkel die op zwart gaat zodra die
   CDN de bestanden verwijdert of blokkeert.
3. **Beschrijvingen zijn ruwe leverancierstekst.** Machinevertaalde HTML met
   inline `font-family`, tientallen `<img>`-tags, en verkopertaal die je klant
   niet hoort te lezen: *"laat ons een positieve beoordeling met 5 sterren
   achter"*, *"Groothandel en drop shipping zijn beide welkom"*, *"neem contact
   met ons op voordat u feedback geeft"*. In één beschrijving lekt zelfs CSS mee
   (`.aplus-v2 .aplus-review-right-padding { … }`).
4. **Varianten zijn onleesbaar.** Kleuren heten `20601S`, `TTwd001745LJ`,
   `2842pcs no box`; maten zijn Aziatisch (K100 t/m 6XL). Een bezoeker kan hier
   niet uit kiezen.
5. **Attributen zijn ruis.** `Merknaam: NONE`, `Choice: yes`, `Oorsprong: Cn`,
   `size_info: {`. Deze horen niet op een productpagina en kunnen weg.
6. **Prijzen ogen als ingekochte prijzen.** € 2,93, € 4,77, € 5,07: dat zijn
   geen consumentenprijzen met marge en geen psychologische prijspunten. Ook de
   btw-instelling moet gecontroleerd worden (inclusief of exclusief).
7. **Nul reviews.** Overal `review_count: 0`. De beoordelingsblokken in het
   ontwerp hebben dus nog geen bron.
8. **Titel en beschrijving spreken elkaar tegen.** Product 662 heet "300 stuks",
   de tekst eronder zegt "200 Pieces".
9. **Merkrechten.** Meerdere producten dragen "FIFA", "WK 2026" en de claim
   "officieel gelicentieerd". Het verkopen van FIFA-gemerkte artikelen zonder
   licentie is een reëel juridisch risico, en die claim overnemen op de nieuwe
   winkel vergroot dat. Dit is een keuze van de eigenaar, maar het hoort bewust
   gemaakt te worden.

## De vraag die eerst beantwoord moet worden

Het huidige ontwerp is een **merkwinkel rond één product**: Soccer MeMo, met
bundels, cadeauverpakking en een speelbare demo. De catalogus in WooCommerce is
een **brede voetbalmerchandise-winkel** met tientallen losse artikelen.

- **Route A — merkwinkel.** Soccer MeMo (en eigen spellen) staan centraal; de
  overige artikelen verhuizen naar een aparte sectie of verdwijnen. Het ontwerp
  dat er nu ligt, past dan meteen.
- **Route B — brede winkel.** Dan is er meer nodig dan er nu ligt:
  categoriepagina's, filters op prijs en leeftijd, zoekfunctie, en een homepagina
  die collecties toont in plaats van één product. Dat bouw ik graag, maar het is
  extra werk bovenop het huidige ontwerp.

## Wat er hoe dan ook moet gebeuren vóór de koppeling

1. Categorieën aanmaken en elk product indelen (bijvoorbeeld: Spellen, Puzzels,
   Kleding, Decoratie, Supporters).
2. Afbeeldingen importeren in de WordPress-mediabibliotheek, zodat ze van je eigen
   domein komen.
3. Beschrijvingen herschrijven: korte Nederlandse tekst, specificaties als
   attributen, geen leverancierstekst en geen losse `<img>`-tags in de tekst.
4. Varianten hernoemen naar begrijpelijke waarden (kleurnaam, EU-maat).
5. Verkoopprijzen en btw vaststellen.
6. Besluiten wat er met de FIFA-artikelen gebeurt.
7. Een bron voor reviews kiezen (Kiyoh, WebwinkelKeur, Trustpilot of Woo zelf).

Punt 1 en 2 zijn blokkerend voor een goede front-end; de rest bepaalt of de
winkel er professioneel uitziet.
