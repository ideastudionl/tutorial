# LERMODE — redesign demo

Statische designdemo voor het herontwerp van **lermode.nl** als premium, chique
damesmode-boetiek. Bedoeld om eerst het design te beoordelen; de opbouw is al
voorbereid op een latere Shopify-implementatie.

```
index.html              volledige homepage
assets/css/style.css    designsysteem + alle secties
assets/js/main.js       catalogus, winkelmand, filters, sliders
assets/img/             hier komen de echte foto's (zie hieronder)
build.mjs               bouwt dist/lermode-demo.html (alles in één bestand)
```

## Bekijken

```bash
npx http-server . -p 8080     # of: open index.html
node build.mjs                # single-file versie in dist/
```

## Designrichting

| | |
|---|---|
| Typografie | Cormorant Garamond (display) + Jost (UI), ruime letterspatiëring in kapitalen |
| Palet | ivoor `#FBF9F6`, bot `#F4EFE9`, zand `#EAE0D5`, klei `#A08A74`, espresso `#241F1A`, goud `#B08A54` |
| Ritme | veel witruimte, haarlijnen, rustige fades — geen harde schaduwen of felle accenten |
| Beeld | full-bleed editorial, 3:4 productbeeld, hover wisselt naar tweede foto |

Secties in volgorde: aankondigingsbalk · header met gecentreerd logo · hero-slider
(3 looks, ken-burns) · USP-marquee · categorieën · nieuw binnen met filters ·
merkverhaal · private sale met parallax · bestsellers-carrousel · services ·
reviews · Instagram-grid · nieuwsbrief · footer.

Interactie: winkelmand-lade met gratis-verzendingsbalk en aantallen, verlanglijst,
zoekoverlay, mobiel menu, scroll-reveals, toasts. Volledig responsive (getest op
1440px en 390px), respecteert `prefers-reduced-motion`.

## Echte foto's en logo plaatsen

De demo draait nu op gegenereerde editorial placeholders. **Zet een bestand met de
juiste naam in `assets/img/` en het vervangt automatisch de placeholder** — geen
code aanpassen. Volgorde van proberen: `.jpg` → `.webp` → `.png`.

| Bestandsnaam | Plek | Verhouding |
|---|---|---|
| `hero-1` `hero-2` `hero-3` | hero-slider | liggend, ±2:1 (min. 2400px breed) |
| `cat-kleding` `cat-tassen` `cat-accessoires` | categoriekaarten | staand 3:4 |
| `product-1` t/m `product-8` | nieuw binnen, vooraanzicht | staand 3:4 |
| `product-1b` t/m `product-8b` | hover-/tweede foto | staand 3:4 |
| `best-1` t/m `best-6` + `best-1b`…`best-6b` | bestsellers | staand 3:4 |
| `story-atelier` `story-detail` | merkverhaal | staand 4:5 en 3:4 |
| `lookbook` | private-sale-banner | liggend, ±2:1 |
| `ig-1` t/m `ig-6` | Instagram-grid | vierkant 1:1 |

Het logo staat nu als SVG-woordmerk in `index.html` (`.brand`, met monogram in
`.brand__mark`). Vervang dat blok door het originele logobestand:

```html
<a class="brand" href="/"><img src="assets/img/logo.svg" alt="LERMODE" style="height:26px"></a>
```

Teksten, prijzen en productnamen staan bovenin `assets/js/main.js` in `PRODUCTS`
en `BESTSELLERS` en zijn losse regels — makkelijk te vervangen door de echte
catalogus.

## Later naar Shopify

Elke `<section>` is bewust één afgebakend blok, zodat het 1-op-1 een Shopify
section wordt met eigen schema-instellingen:

| Sectie in de demo | Shopify section | Bron van de data |
|---|---|---|
| `.announce` | `announcement-bar.liquid` | section settings (blocks per regel) |
| `.header` | `header.liquid` | `linklists` / menu's |
| `.hero` | `hero-slider.liquid` | blocks met image + heading + link |
| `.cats` | `collection-list.liquid` | `collections` |
| `#new .grid--products` | `featured-collection.liquid` | `collection.products` |
| `.card` | snippet `product-card.liquid` | `product`, `product.variants` |
| `.story` | `image-with-text.liquid` | section settings |
| `.lookbook` | `image-banner.liquid` | section settings |
| `#bestsellers .carousel` | `featured-collection.liquid` (carousel) | `collection.products` |
| `.reviews` | `testimonials.liquid` of review-app | blocks / app |
| `.ig` | `instagram-feed.liquid` | app of statische blocks |
| `.news` | `newsletter.liquid` | `customer` form |
| `.footer` | `footer.liquid` | menu's + settings |

Aandachtspunten bij die stap: `assets/js/main.js` bevat nu een demo-winkelmand in
het geheugen — die wordt vervangen door de Cart AJAX API (`/cart/add.js`,
`/cart/change.js`, `/cart.js`); de kleurbolletjes komen uit varianten-opties; de
`data-img`-placeholderlogica vervalt zodra `image_url` van Shopify komt.
