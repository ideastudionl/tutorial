# Witgoed Koning — redesign en demo-webshop

Voorstel voor een herontwerp van [witgoed-koning.nl](https://witgoed-koning.nl), gericht op
hogere conversie, meer vertrouwen en een professionelere uitstraling. De demo is zo gebouwd
dat hij later op Shopify of WooCommerce aangesloten kan worden.

- **[VERBETERPLAN.md](VERBETERPLAN.md)** — onderzoek, concurrentieanalyse, verbeterplan per
  paginatype, prioritering en meetplan.
- **`demo/`** — de werkende demo.
- **`dist/witgoed-koning-demo.html`** — dezelfde demo als één bestand, om te delen of te
  hosten zonder server.

## De demo bekijken

```bash
npx serve demo          # of: python3 -m http.server -d demo 8080
```

Of open `dist/witgoed-koning-demo.html` rechtstreeks in een browser.

Vier ingangen: wasmachines, wasdrogers, vaatwassers en outlet. Outlet is geen aparte voorraad
maar een dwarsdoorsnede — apparaten met een deuk of kras, die daarom extra afgeprijsd zijn.

Wat werkt: zoeken, filteren en sorteren, categoriepagina in lijstweergave, productpagina met
keuringsrapport en postcode-bezorgbelofte, winkelwagen met verlengde garantie, en een checkout
in drie stappen tot en met de bevestiging. De winkelwagen blijft in `localStorage` staan.

## Opbouw

```
demo/
  index.html
  assets/css/app.css          designsysteem — alle kleuren als tokens in :root
  assets/js/
    ui.js                     iconen, apparaat-illustraties, logo, formatters
    catalog.js                demodata (de enige plek met verzonnen gegevens)
    adapters.js               datalaag: mock | shopify | woocommerce
    cart.js                   winkelwagen
    views.js                  header, footer, productkaart, gedeelde onderdelen
    views-home.js             homepage
    views-plp.js              categoriepagina met filters
    views-pdp.js              productpagina
    views-checkout.js         winkelwagen, afrekenen, showroom
    app.js                    router en opstart
build/inline.mjs              bouwt dist/ tot één bestand
```

Geen build-stap, geen dependencies, geen framework. Dat is bewust: een webshop hoort snel te
laden, en dit is makkelijk over te zetten naar een Shopify-thema (Liquid) of een
WooCommerce-thema (PHP-templates).

## Huisstijl aanpassen

Het logo in de demo is een **placeholder** — het echte logobestand was niet op te halen.
Vervangen doet u op twee plekken:

**Logo** — `demo/assets/js/ui.js`, functie `WK.logo()`. Vervang de SVG, of zet er een
`<img src="…">` neer. Verder verandert er niets.

**Kleuren** — `demo/assets/css/app.css`, bovenaan in `:root`:

```css
--brand: #123A63;   /* koptekstbalk, footer, merk */
--link:  #12609E;   /* klikbare tekst */
--cta:   #BF5309;   /* bestelknoppen */
--green: #157347;   /* voorraad, bezorging, gratis */
--band:  #F4F5F7;   /* grijze secties */
```

Het logo staat op de blauwe balk, dus het merkteken is wit. Vervangt u `--brand` door een
lichte kleur, geef het logo dan ook een donkere variant.

De donkere variant staat eronder in `@media (prefers-color-scheme: dark)` en
`:root[data-theme="dark"]`. Past u een merkkleur aan, pas dan ook daar de tegenhanger aan.

## Koppelen aan een webshop

De hele interface praat uitsluitend met `WK.store`. Welke backend daaronder zit staat in
`demo/assets/js/adapters.js`:

```js
WK.CONFIG = { backend: 'mock' };   // 'mock' | 'shopify' | 'woocommerce'
```

Alle drie de adapters geven dezelfde productvorm terug:

```js
{
  id, slug, sku, title, brand, model, cat, kind,
  price, compareAt, cond, warranty, year,
  rating, reviews, stock, available,
  specs: { label: waarde },        // specificatietabel
  highlights: [ '…' ],             // "Waarom dit apparaat"
  refurb: [ { item, status, note } ],  // keuringsrapport, status 'ok' | 'repl'
  images: [ { url, alt } ]
}
```

### Shopify

```js
WK.CONFIG.backend = 'shopify';
WK.CONFIG.shopify.domain = 'witgoed-koning.myshopify.com';
WK.CONFIG.shopify.storefrontToken = '…';   // Storefront API access token
```

De adapter gebruikt de Storefront GraphQL API. Standaardvelden komen uit Shopify zelf
(`vendor` → merk, `productType` → categorie, `compareAtPrice` → nieuwprijs). Wat Shopify niet
kent komt uit metafields in de namespace `wk`:

| Metafield | Type | Inhoud |
|---|---|---|
| `wk.conditie` | Eén regel tekst | `Nieuwstaat` / `Refurbished A` / `Refurbished B` |
| `wk.garantie_maanden` | Geheel getal | `6` of `12` |
| `wk.bouwjaar` | Geheel getal | `2020` |
| `wk.specificaties` | JSON | `{"Vulgewicht":"8 kg","Centrifuge":"1400 tpm"}` |
| `wk.pluspunten` | JSON | `["…","…"]` |
| `wk.keuringsrapport` | JSON | `[{"item":"Lagers","status":"repl","note":"Vernieuwd"}]` |

De categorie komt uit `productType` (`Wasmachines`, `Wasdrogers`, `Vaatwassers`). **Outlet is
een tag**, geen producttype — zo staat een outlet-apparaat tegelijk in zijn eigen categorie en
in de outlet.

Afrekenen loopt via `cartCreate`; de demo-checkout wordt dan overgeslagen en de klant gaat
naar de Shopify-checkout.

### WooCommerce

```js
WK.CONFIG.backend = 'woocommerce';
WK.CONFIG.woocommerce.baseUrl = 'https://witgoed-koning.nl';
```

De adapter leest de publieke [Store API](https://developer.woocommerce.com/docs/apis/store-api/)
(`/wp-json/wc/store/v1`) — geen sleutel nodig voor lezen. De extra velden komen mee via
`extensions.wk`. Registreer ze met een mu-plugin:

```php
<?php
// wp-content/mu-plugins/wk-store-api.php
add_action( 'woocommerce_blocks_loaded', function () {
    woocommerce_store_api_register_endpoint_data( [
        'endpoint'        => Automattic\WooCommerce\StoreApi\Schemas\V1\ProductSchema::IDENTIFIER,
        'namespace'       => 'wk',
        'data_callback'   => function ( $product ) {
            $json = fn( $key ) => json_decode( $product->get_meta( $key ) ?: '[]', true );
            return [
                'merk'             => $product->get_meta( 'wk_merk' ),
                'model'            => $product->get_meta( 'wk_model' ),
                'conditie'         => $product->get_meta( 'wk_conditie' ),
                'garantie_maanden' => $product->get_meta( 'wk_garantie_maanden' ),
                'bouwjaar'         => $product->get_meta( 'wk_bouwjaar' ),
                'specificaties'    => $json( 'wk_specificaties' ),
                'pluspunten'       => $json( 'wk_pluspunten' ),
                'keuringsrapport'  => $json( 'wk_keuringsrapport' ),
            ];
        },
        'schema_callback' => fn() => [],
    ] );
} );
```

Zonder die plugin blijft de site werken: merk en conditie worden dan uit de
productattributen gelezen en het keuringsrapport blijft leeg.

**Outlet** is in WooCommerce een extra productcategorie náást de hoofdcategorie: een outlet-
wasmachine zit zowel in `wasmachines` als in `outlet`.

Afrekenen vult de servercart via `/cart/add-item` en stuurt door naar `/afrekenen/`.

## Wat er nog moet gebeuren voor livegang

- Echte productfoto's — vier per toestel (vooraanzicht, bedieningspaneel, binnenzijde,
  gebruikssporen)
- Categoriepagina's zonder voorraad opheffen en 301-redirecten naar de vier die overblijven
- Logo en huisstijlkleuren vervangen
- KvK- en btw-nummer invullen in `catalog.js` → `WK.SHOP`
- Reviews live ophalen bij Kiyoh in plaats van de voorbeelden in `WK.REVIEWS`
- Gestructureerde data (`Product`, `LocalBusiness`, `FAQPage`) toevoegen
- 301-redirects van `/wasmachine/` en `/product-categorie/…` naar de nieuwe structuur
- Analytics en de events uit het meetplan aanzetten

## Eén bestand bouwen

```bash
node build/inline.mjs      # → dist/witgoed-koning-demo.html
```
