# Soccer Games — webwinkel

De winkel van [soccer-games.nl](https://www.soccer-games.nl/) als eigen
front-end op WooCommerce. Bezoekers zien deze site; WooCommerce blijft de
administratie: producten, voorraad, prijzen, bestellingen, betalingen en mails.

Deze site heeft geen database. Alles wat een bezoeker ziet aan producten en
prijzen komt live uit de **WooCommerce Store API**.

## Hoe het in elkaar zit

```
index.html          de hele site als één document: home, product, shop, afrekenen
assets/styles.css   het ontwerp, opgebouwd in tokens
assets/app.js       winkelwagen, memoryspel, productpagina, afrekenen
api/store.js        proxy naar de Store API; houdt het cart-token in een httpOnly-cookie
api/postcode.js     postcode + huisnummer → adres, via de PDOK Locatieserver
build.mjs           bouwt dist/: haalt de foto's op, schrijft sitemap en robots.txt
bundle.mjs          bouwt dist/standalone.html, alles in één bestand
vercel.json         adressen, omleidingen naar WordPress, beveiligingskoppen
test/mock-store.js  nagebouwde winkel, om te testen zonder de echte
docs/               achtergrond bij elke beslissing, zie hieronder
```

De pagina's hebben echte adressen: `/`, `/product/soccer-memo`, `/product/<id>`,
`/shop` en `/afrekenen`. Hash-adressen (`#/product`) blijven werken, zodat oude
links goed uitkomen en de site ook zonder server te bekijken is.

## Lokaal draaien

```bash
node build.mjs                 # bouwt dist/
npx http-server dist -p 4173   # → http://localhost:4173

node test/mock-store.js        # nagebouwde winkel op poort 4199
```

Met de nagebouwde winkel test je de winkelwagen en het afrekenen zonder de echte
winkel te raken. Zet in de browserconsole `window.__STORE_PROXY__ =
'http://127.0.0.1:4199'` vóór het laden, of gebruik de testscripts.

## Instellingen bij het bouwen

| Variabele | Standaard | Waarvoor |
|---|---|---|
| `WP_BASE` | `https://www.soccer-games.nl` | waar WooCommerce draait: Store API, voorwaarden |
| `MEDIA_SRC` | gelijk aan `WP_BASE` | waar de foto's vandaan komen tijdens het bouwen |
| `SITE_URL` | leeg | het eigen adres. Gezet = productie: indexeerbaar, met sitemap |
| `WOO_STORE_URL` | `https://www.soccer-games.nl/wp-json/wc/store/v1` | wat de proxy in `api/store.js` aanspreekt |

Zonder `SITE_URL` bouwt hij een voorbeeldweergave op `noindex`. Dat is met opzet:
een demo mag nooit per ongeluk in Google belanden naast de echte winkel.

De foto's worden tijdens het bouwen opgehaald en meegeleverd in `dist/media/`.
Lukt dat niet, dan stopt de build. Liever geen nieuwe versie dan een site zonder
beeld.

## Uitrollen

Vercel bouwt uit deze repository. Buildopdracht `node build.mjs`, uitvoermap
`dist`. De serverfuncties in `api/` gaan automatisch mee.

## Documentatie

| Document | Waarover |
|---|---|
| `docs/livegang.md` | het draaiboek voor de lancering op www, stap voor stap |
| `docs/headless-woocommerce.md` | de koppeling: Store API, cart-token, afrekenen, caching |
| `docs/headless-checkout.md` | hoe de eigen afrekenpagina werkt |
| `docs/checkout-finetunen.md` | de WooCommerce-kant bijwerken in de huisstijl |
| `docs/catalog-audit.md` | wat er in de catalogus nog niet klopt |
| `docs/conversie.md` | elk conversie-element, met reden en meetplan |
| `docs/design-system.md` | kleur, typografie, componenten, beweging, toegankelijkheid |
| `docs/aan-de-slag.md` | eerste stappen voor wie dit project overneemt |

## Wat nog voorbeelddata is

De beoordelingen (9,4 uit 212) en de bundels (2 of 3 spellen met korting) staan
nog niet in WooCommerce. De bundels rekenen bij de kassa af als losse spellen;
de beoordelingen moeten vóór de lancering door echte vervangen worden, of weg.
De cadeauverpakking en de poster bestaan nog niet als product en gaan daarom
niet mee naar de kassa.
