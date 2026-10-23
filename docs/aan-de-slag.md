# Wat jij moet doen om te koppelen

Checklist in volgorde. Het meeste is instelwerk in WordPress en bij je hoster;
de bouw van de front-end komt daarna. Je hoeft de huidige winkel niet plat te
leggen — de nieuwe front-end kan al tegen je bestaande WooCommerce praten
terwijl de oude site gewoon doordraait.

## Stap 0 — Test van vijf seconden (doe dit eerst)

Open in je browser:

```
https://www.soccer-games.nl/wp-json/wc/store/v1/products
```

- **Je ziet een lap JSON met je producten** → de Store API staat aan, we kunnen los.
- **Je ziet `rest_no_route`** → WooCommerce is verouderd, of de permalinks staan
  op "Standaard". Zet WordPress → Instellingen → Permalinks op "Berichtnaam" en
  werk WooCommerce bij.
- **Je ziet een 404 of een inlogscherm** → laat het me weten, dan kijken we samen
  wat er draait.

Deze uitkomst bepaalt of de rest van de lijst klopt.

## Stap 1 — Domeinen (bij je hoster / DNS)

| Domein | Waar het straks heen wijst |
|---|---|
| `www.soccer-games.nl` | de nieuwe front-end (Vercel) |
| `shop.soccer-games.nl` | je huidige WordPress + WooCommerce |

Wat je doet: vraag je hoster om WordPress bereikbaar te maken op
`shop.soccer-games.nl` (WordPress-adres en site-adres aanpassen, SSL-certificaat
erbij). Het hoofddomein laten we pas omzetten op het moment van livegang.

Waarom het moet: winkelwagen en afrekenen leunen op een cookie. Staan front-end
en WordPress op verschillende hoofddomeinen, dan gooien Safari en Firefox dat
cookie weg en ziet je klant een lege winkelwagen bij het afrekenen.

## Stap 2 — Producten goed in WooCommerce zetten

- **Soccer MeMo** als variabel product, met attribuut "aantal": 1 spel € 14,95,
  2 spellen € 24,95, 3 spellen € 34,95. Per variatie een eigen SKU en voorraad.
- **Cadeauverpakking** € 2,95 als los, klein product (geen voorraadbeheer).
- **Poster A2** € 9,95 als los product, eigen verzendklasse (rolkoker).
- Per product: echte foto's (minimaal 4: doos, kaarten, spel op tafel, kaartrug),
  gewicht en afmetingen — die heeft de verzendberekening nodig.
- Voorraad aanzetten, zodat "nog X op voorraad" op de site klopt in plaats van
  een verzonnen getal.

## Stap 3 — Verzenden en btw

- Verzendzone Nederland: € 3,95, **gratis vanaf € 30** (of € 20, zie het
  openstaande punt hieronder). Zone België apart.
- Btw: spellen vallen in het hoge tarief (21%). Zet prijzen **inclusief btw** in
  Woo, dan komen de bedragen op de site overeen met wat de klant betaalt.
  Even door je boekhouder laten bevestigen.
- Verzendcutoff 22:00 alleen beloven als je die ook haalt — de site telt live af.

## Stap 4 — Betalen

- Mollie (of Pay.nl) met **iDEAL bovenaan**, daarna Klarna en Bancontact.
- Doe één testbetaling van een cent in de huidige checkout, zodat we weten dat
  de gateway werkt vóór we de front-end erop aansluiten.

## Stap 5 — Wat ik van je nodig heb

Om te beginnen is dit genoeg:

1. De uitkomst van stap 0 (werkt de Store API).
2. Het adres waar WordPress straks staat (`shop.soccer-games.nl`).

Later, voor de laatste 10%:

3. Een WordPress-beheerdersaccount **of** een Application Password (WordPress →
   Gebruikers → Profiel → Application Passwords). Nodig om de webhook te zetten
   die de site ververst zodra je een prijs aanpast. Zet zo'n wachtwoord zelf in
   Vercel onder Environment Variables of stuur het via een kluis — niet in de chat.
4. Toegang tot DNS op het moment van livegang.
5. De echte kaartafbeeldingen en het logo als vectorbestand (.ai, .eps of .svg).
   De illustraties op de demo zijn natekeningen in de juiste stijl, bedoeld als
   plaatshouder.
6. Echte reviews: een export uit je huidige systeem, of een account bij
   Kiyoh/Trustpilot/WebwinkelKeur. De reviews op de demo zijn voorbeelden.

## Stap 6 — Wat ik dan doe

Catalogus en productpagina uit de Store API halen, winkelwagen via een eigen
proxy-route (token blijft `httpOnly`, geen sleutels in de browser), afrekenen
doorzetten naar de WooCommerce-checkout in de huisstijl, webhook voor het
verversen, GA4-events, en de boel op Vercel zetten. Zie
`docs/headless-woocommerce.md` voor de techniek en de tijdsinschatting
(ongeveer twee weken, los van foto's en teksten).

## Nog te beslissen

- **Verzendgrens € 30 of € 20?** Bij € 14,95 is één spel € 15,05 tekort voor
  gratis verzending; bij € 20 haalt één spel plus de poster het ruim en is het
  duo-pack meteen gratis verzonden.
- **Bundels als variaties of als losse producten?** Variaties houden de voorraad
  op één plek; losse producten zijn makkelijker apart te adverteren.
- **Checkout**: eerst de WooCommerce-checkout in de huisstijl (snel live), of
  meteen een eigen afrekenpagina bouwen (mooier, weken werk).
