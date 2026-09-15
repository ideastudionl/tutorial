# Headless koppeling met WooCommerce

Het prototype in dit repo is de front-end blauwdruk. De winkel-logica komt uit een
bestaande WooCommerce-installatie; WordPress blijft de back-office (producten,
voorraad, orders, betalingen), de front-end wordt een losse Next.js-app.

```
  WordPress + WooCommerce            Next.js 15 (App Router) op Vercel
  ┌───────────────────────┐          ┌──────────────────────────────┐
  │ producten / voorraad  │  REST    │ / (home)                     │
  │ orders / klanten      │◄────────►│ /soccer-memo (PDP)           │
  │ betalingen (Mollie)   │  Store   │ /winkelwagen  /afrekenen     │
  │ verzendregels         │   API    │ ISR + on-demand revalidate   │
  └───────────────────────┘          └──────────────────────────────┘
          ▲  webhooks (product.updated, order.created) → /api/revalidate
```

## 1. Welke API

| Doel | Endpoint | Auth |
|---|---|---|
| Productlijst / PDP-data | `GET /wp-json/wc/store/v1/products` | geen (publiek) |
| Eén product | `GET /wp-json/wc/store/v1/products/{id}` of `?slug=soccer-memo` | geen |
| Winkelwagen lezen | `GET /wp-json/wc/store/v1/cart` | `Cart-Token` header |
| Regel toevoegen | `POST /wc/store/v1/cart/add-item` | `Cart-Token` + `Nonce` |
| Aantal wijzigen / verwijderen | `POST /cart/update-item`, `/cart/remove-item` | idem |
| Verzendopties | `POST /cart/select-shipping-rate` | idem |
| Bestellen | `POST /wc/store/v1/checkout` | idem |
| Reviews | `GET /wc/store/v1/products/reviews?product_id=` | geen |

De Store API zit standaard in WooCommerce Blocks (dus in elke recente Woo-versie) en
is gemaakt voor precies dit doel — de oudere `wc/v3` REST API met consumer key/secret
gebruik je alleen server-side voor beheer, nooit vanuit de browser.

**Cart-token:** het eerste antwoord van `/cart` zet een `Cart-Token` responseheader.
Bewaar die (cookie, `httpOnly` via een route handler) en stuur hem bij elke volgende
cart-call mee, plus de `Nonce` header uit hetzelfde antwoord. Zonder token krijgt
elke request een nieuwe lege winkelwagen.

## 2. Domeinen: de beslissing die de rest makkelijk of moeilijk maakt

Zet de Next.js-app op het hoofddomein en WordPress op een subdomein van datzelfde
domein:

```
www.soccer-games.nl   → Next.js (Vercel)
shop.soccer-games.nl  → WordPress + WooCommerce (huidige hosting)
```

Waarom dit uitmaakt: een winkelwagen en een afrekensessie leunen op een cookie.
Staat WordPress op een compleet ander domein, dan is dat een third-party cookie —
Safari en Firefox gooien die weg en je klant ziet een lege winkelwagen bij het
afrekenen. Deel je het hoofddomein, dan zet WordPress het cookie op
`.soccer-games.nl` en werkt de overdracht naar de checkout gewoon. Dit is de
goedkoopste verzekering in het hele project; regel het vóór je begint te bouwen.

## 3. Afrekenen: drie routes

1. **Doorsturen naar de WooCommerce-checkout** — je bouwt zelf catalogus, PDP en
   winkelwagen; bij "Afrekenen" ga je naar `shop.soccer-games.nl/checkout`. Werkt
   meteen met elke betaalplugin die er al staat, inclusief iDEAL via Mollie. Kost
   je één merkbreuk: de checkout ziet er anders uit (op te lossen met een klein
   thema in de huisstijl). Vereist wel de domeinopzet hierboven.
2. **Eigen checkout op de Store API** (`POST /wc/store/v1/checkout`) — je stuurt
   adres, verzendmethode en betaalmethode mee en krijgt een `payment_result`
   terug met de redirect naar de bank. Mooiste flow, meeste werk: adres- en
   postcodevalidatie, verzendkeuze, foutafhandeling per veld. Alleen betaal-
   methodes met Blocks-ondersteuning doen mee (Mollie heeft die).
3. **CoCart** (plugin, betaald) — bouwt het cart-gedeelte om tot een echte
   headless API met tokens en een `load-cart`-endpoint dat de sessie aan de
   WordPress-kant vult. Neemt precies de randen weg die onder route 1 pijn doen,
   zeker als je de domeinen tóch niet kunt delen.

Advies voor deze winkel: **route 1 om live te gaan**, daarna meten, en pas naar
route 2 als de cijfers laten zien dat de checkout het knelpunt is. Eén product van
€ 14,95 verdient geen checkout van drie weken voordat er iets verkocht is.

## 4. De twee randen waar iedereen op stuit

**CORS.** Eerder stond hier dat de Store API helemaal geen CORS-headers stuurt.
Dat klopt niet: WordPress stuurt voor REST-verzoeken een
`Access-Control-Allow-Origin` terug die de `Origin` van het verzoek spiegelt,
dus **publieke GET-calls op producten werken gewoon vanuit de browser** — het
prototype op Vercel haalt de productdata van soccer-games.nl op die manier op.

Waar het wél knelt, is de winkelwagen. Daar moet de browser de `Cart-Token`- en
`Nonce`-responseheaders kunnen lezen (die moeten dan expliciet via
`Access-Control-Expose-Headers` vrijgegeven zijn) en wil je het token sowieso
niet in de browser hebben. Zet cart- en checkout-calls daarom door een eigen
route in Next.js: same-origin, token `httpOnly`, geen sleutels in de browser:

```ts
// app/api/cart/[...path]/route.ts
import { cookies } from 'next/headers';

const WOO = process.env.WOO_URL!; // https://shop.soccer-games.nl/wp-json/wc/store/v1

async function proxy(req: Request, path: string[]) {
  const jar = await cookies();
  const token = jar.get('cart-token')?.value;

  const res = await fetch(`${WOO}/cart/${path.join('/')}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Cart-Token': token } : {}),
      ...(req.headers.get('nonce') ? { Nonce: req.headers.get('nonce')! } : {}),
    },
    body: req.method === 'GET' ? undefined : await req.text(),
    cache: 'no-store',
  });

  const fresh = res.headers.get('Cart-Token');
  const out = new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', Nonce: res.headers.get('Nonce') ?? '' },
  });
  if (fresh && fresh !== token) {
    jar.set('cart-token', fresh, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 14 });
  }
  return out;
}

export const GET = (req: Request, { params }: { params: { path: string[] } }) => proxy(req, params.path);
export const POST = GET;
```

**Nonce.** Elke schrijvende cart-call wil de `Nonce` uit het laatste antwoord.
Bewaar hem in je cart-store in de browser en stuur hem mee; krijg je een 403 met
`woocommerce_rest_invalid_nonce`, doe dan één keer `GET /cart` en probeer opnieuw.
Bouw die herstelpoging meteen in, anders zie je hem pas terug in de conversie.

## 5. Veldenkaart (prototype → Woo)

| UI-element in het prototype | Woo-veld |
|---|---|
| Titel, omschrijving, korte tekst | `name`, `description`, `short_description` |
| Prijs / streepprijs | `prices.price`, `prices.regular_price` (in centen, met `currency_minor_unit`) |
| Galerij | `images[]` → `next/image` met `sizes` |
| Bundelkeuze 1 / 2 / 3 spellen | variaties van een variabel product (attribuut `aantal`) of drie losse producten met `grouped` relatie |
| Cadeauverpakking (+ € 2,95) | apart product, of `cart_item_data` add-on via `wc-blocks` extension |
| Voorraadregel "nog 23 stuks" | `stock_quantity`, `low_stock_remaining`, `is_in_stock` |
| Reviews + gemiddelde | `average_rating`, `review_count`, reviews-endpoint |
| Specificatietabel | productattributen (`attributes[]`) |
| USP-balk, FAQ, spelregels | WordPress-blokken of ACF-velden, via `wp/v2` opgehaald |
| "Nog € X tot gratis verzending" | `cart.totals.total_price` tegen de drempel uit `shipping_rates` |

Prijzen komen als string in de kleinste eenheid (`"1995"`) mét `currency_minor_unit: 2`.
Reken één keer centraal om en formatteer met `Intl.NumberFormat('nl-NL', {style:'currency',currency:'EUR'})`.

## 6. Caching

- Catalogus- en PDP-data: `fetch(..., { next: { revalidate: 300, tags: ['product:soccer-memo'] } })`.
- Woo-webhook `product.updated` → `/api/revalidate` → `revalidateTag('product:...')`.
- Alles onder `/wc/store/v1/cart` is per bezoeker: `cache: 'no-store'`, client-side ophalen.
- Voorraadaantal apart client-side verversen zodat de pagina statisch kan blijven.

## 7. Mappenstructuur

```
app/
  layout.tsx               fonts, header, footer, cart-provider
  page.tsx                 home
  (shop)/[slug]/page.tsx   PDP + generateMetadata + JSON-LD
  api/revalidate/route.ts  webhook-ontvanger
lib/woo/
  client.ts                fetch-wrapper, token-afhandeling
  products.ts  cart.ts     getProduct, addItem, updateItem
components/
  MemoryDemo.tsx  BuyBox.tsx  BundlePicker.tsx  CartDrawer.tsx  StickyBuyBar.tsx
```

## 8. SEO en techniek

- `<html lang="nl">`, canonical per product, `hreflang` nl-NL en nl-BE als België meedoet.
- JSON-LD: `Product` (prijs, `availability`, `aggregateRating`), `FAQPage` bij de
  vragenblokken, `BreadcrumbList` bij het kruimelpad.
- Budget: LCP < 2,0 s op 4G, CLS < 0,05. De hero is tekst + inline SVG, dus de LCP is
  de koptekst; laad de fonts met `next/font` (self-hosted, `display: swap`).
- Betalingen NL: iDEAL eerst in de lijst, daarna Klarna en Bancontact — via Mollie
  of Pay.nl, ingesteld in Woo zelf.
- Analytics: GA4 via server-side GTM, events `view_item`, `add_to_cart`,
  `begin_checkout`, `purchase`, plus het eigen event `memo_demo_completed`.
- Cookies: consent (Cookiebot of eigen banner) vóór analytics, verplicht onder de
  Nederlandse telecomwet.


## 9. Alternatief: WPGraphQL in plaats van de Store API

`WPGraphQL` + `WPGraphQL for WooCommerce` geeft je één endpoint waarin je product,
varianten, reviews en content in één query ophaalt. Prettig als er veel redactionele
content bij komt. Nadelen: twee plugins extra om te onderhouden, de cart-kant is
minder volwassen dan de Store API, en betaalintegraties lopen alsnog via Woo. Voor
één product met een paar bundels is de Store API de rustigere keuze.

## 10. Volgorde van bouwen

1. **Domeinen en SSL regelen** (hoofddomein Next.js, subdomein WordPress). Zonder
   dit klopt de rest niet. — een dagdeel
2. **Producten in Woo goed zetten**: Soccer MeMo met de bundels als variaties,
   cadeauverpakking als apart product, echte foto's, voorraad, verzendklassen,
   verzendregel "gratis vanaf € 30". — een dag
3. **Catalogus en PDP statisch uit de Store API** met ISR en revalidate-webhook.
   Hier zit de winst in snelheid; alles is publiek, dus geen tokens nodig. — 2–3 dagen
4. **Winkelwagen via de proxy-route** hierboven, inclusief de verzendmeter. — 2 dagen
5. **Afrekenen route 1**, checkout-thema in de huisstijl, testorder met iDEAL. — 1–2 dagen
6. **Meten**: GA4-events uit `docs/conversie.md`, dan pas beslissen over een eigen
   checkout.

Reken op ongeveer twee weken voor een werkende winkel, los van foto's en teksten.


## 11. Wat het prototype al live ophaalt

`assets/app.js` bevat onderaan een stukje dat de echte winkel aanspreekt:

```js
var WOO = { base: 'https://www.soccer-games.nl/wp-json/wc/store/v1', productId: 65 };
fetch(WOO.base + '/products/' + WOO.productId).then(...).then(applyProduct);
```

Lukt de call, dan vervangt `applyProduct()` prijs, streepprijs, voorraad, titel,
omschrijving en de fotogalerij door wat er in WooCommerce staat, en verandert het
label in de header in "Live uit WooCommerce". Lukt de call niet, dan blijft de
ingebouwde voorbeelddata staan en ziet de bezoeker een volledige pagina — geen
lege plekken, geen foutmelding.

De bundelprijzen rekenen mee met de echte prijs (2 × prijs − € 4,95 en
3 × prijs − € 9,90), maar bestaan nog niet in WooCommerce. Zodra de varianten er
zijn, komen ook die uit `variations[]` in plaats van uit de rekenregel.

Testen zonder de live winkel kan met een fixture:

```js
window.__WOO_BASE__ = 'http://localhost:4173/test/fixtures';
```

`test/fixtures/products/65` bevat het echte antwoord van de Store API voor
Soccer Memo, zodat de logica te testen is zonder netwerk.


## 12. De afrekenknop gaat nu echt naar de kassa

"Afrekenen" in de winkelwagenlade opent de checkout van de winkel zelf:

```
https://www.soccer-games.nl/checkout/?add-to-cart=65&quantity=<aantal>
```

Dat is route 1 uit hoofdstuk 3, in zijn eenvoudigste vorm: een gewone navigatie,
dus het sessiecookie van WooCommerce werkt gewoon, ook zonder gedeeld
hoofddomein. Wat er nog niet in de winkel staat, gaat niet mee — en dat zegt de
lade er eerlijk bij:

- **Bundels.** Twee of drie spellen worden doorgegeven als `quantity=2` of `3`
  van hetzelfde product. Het bundelvoordeel (€ 4,95 en € 9,90) bestaat nog niet
  in WooCommerce, dus bij de kassa staat de losse prijs. Op te lossen door de
  bundels als varianten aan te maken, of door een kortingscode te koppelen.
- **Cadeauverpakking en poster.** Die producten bestaan niet; ze blijven in de
  demo-winkelwagen staan met de melding dat ze niet meegaan.

Zodra die drie dingen in WooCommerce staan, hoeft alleen `WOO_IDS` in
`assets/app.js` uitgebreid te worden met hun product-ID's. Wil je meerdere
verschillende artikelen in één keer doorgeven, dan is dit het moment om over te
stappen op de Store API-winkelwagen met de proxy-route uit hoofdstuk 4 — de
`?add-to-cart=`-truc van WooCommerce doet maar één product per keer.
