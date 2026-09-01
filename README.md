# TegelloodsBV — webshopontwerp & demo

Voorbeeldshop en onderbouwing voor de webshop van **Tegelloods BV**
(Telgenweg 4, Heeten), als opvolger van de huidige informatieve site
[tegelloodsbv.nl](https://tegelloodsbv.nl). Custom design, bedoeld om
gekoppeld te worden aan **Shopify**. Leverancier van de productdata:
**Ege Seramik**.

## Wat zit hierin

| Bestand | Inhoud |
|---|---|
| **[`ONDERZOEK.md`](ONDERZOEK.md)** | Marktonderzoek: 7 concurrenten, CRO-patronen, doelgroep & koopintentie, positionering, prijs-/verzendvoorstel, meetplan |
| **[`SHOPIFY.md`](SHOPIFY.md)** | Technische vertaling naar Shopify: datamodel, metafields, secties, rekenmodule in Liquid, sample-flow, **import van Ege Seramik-productdata** |
| **`demo/`** | Klikbare voorbeeldshop (statische HTML/CSS/JS, geen build) |

## Demo starten

```bash
cd demo && python3 -m http.server 8080
# open http://localhost:8080
```

Openen via `file://` werkt ook — alles draait client-side, zonder afhankelijkheden.

### Pagina's
- `index.html` — homepage met USP-balk, categorieën, bestsellers, mini-rekenmodule, showroomblok
- `collectie.html` — categoriepagina met filters (look, ruimte, prijs per m², voorraad) en sorteren
- **`product.html?id=especta-beige`** — productpagina; hier zit de kern
- `samples.html` — gratis stalen aanvragen (max. 4)
- `showroom.html` — showroomafspraak met datum, tijdslot en je klaargelegde tegels
- `winkelwagen.html` — winkelwagen met verzenddrempel en automatische lijm-/voegberekening

### De productpagina in het kort
- **Rekenmodule**: oppervlakte + snijverlies → aantal dozen → totaalprijs.
  `ceil(m² × (1 + snijverlies) ÷ m² per doos)`, standaard 10%, met een knop die
  de som letterlijk voorrekent. Tweerichtings gekoppeld aan de aantalselector.
- **Gratis staal** van de gekozen kleur, met een maximum van 4 per bestelling.
- **Toevoegen aan showroombezoek** — wij leggen je favorieten klaar op groot formaat.
- **Direct een afspraak maken** in de showroom.
- **Offerte via WhatsApp** voor grote projecten.
- Levertijd, afhaaloptie in Heeten, verzenddrempel en retourregel boven de koopknop.

### Sticky actieknoppen
Rechtsonder op elke pagina: een ronde **"Plan je afspraak"**-knop met een teller
voor je showroomlijst, en daaronder een **WhatsApp**-knop met voorgevulde tekst.
Op mobiel schuiven ze omhoog zodat ze de koopbalk niet overlappen.

## Technische opzet

```
demo/
├── assets/css/style.css     design tokens + componenten (1 bestand, geen framework)
├── assets/js/data.js        assortiment, categorieën, reviews + procedurele tegeltexturen
├── assets/js/app.js         header/footer, winkelwagen, samplebox, showroomlijst, drawers
└── *.html                   één pagina per template
```

- **Geen build, geen dependencies.** Alles vanilla; werkt offline.
- **Tegelafbeeldingen zijn procedureel gegenereerde SVG's** (`tex()` in `data.js`),
  zodat de demo geen externe assets nodig heeft. In Shopify vervang je die door
  echte productfoto's van Ege Seramik.
- **State** (winkelwagen, stalen, showroomlijst) staat in `localStorage`.
  In Shopify wordt dat de Cart AJAX API met line item properties — zie `SHOPIFY.md`.
- **Bedrijfsgegevens en tarieven** staan op één plek: `TL.shop` in `app.js`.

## Belangrijk om te weten

- **Alle productdata is fictief.** Namen, prijzen, voorraad, m² per doos en
  technische waarden zijn placeholders. De serienamen (Especta, Maison, Nepal,
  Ontario, Ares, Romina, Torro) komen uit de catalogus van Ege Seramik, maar de
  bijbehorende specificaties nog niet — die moeten uit de leveranciersfiches komen.
  Zie [`SHOPIFY.md` § 7](SHOPIFY.md) voor de importstructuur en de velden die
  we bij Ege Seramik moeten opvragen.
- **Reviews en scores in de demo zijn illustratief**, geen echte klantcitaten.
- Het onderzoek is gedaan op publiek geïndexeerde pagina's van de concurrenten;
  de bronnen staan onderaan `ONDERZOEK.md`. Prijzen en voorwaarden zijn
  momentopnames en moeten vóór livegang opnieuw gecontroleerd worden.
