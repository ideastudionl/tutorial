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

## 2. Afrekenen: twee routes

1. **Store API checkout** (`POST /wc/store/v1/checkout`) — volledig eigen afreken-UI,
   je krijgt een `payment_result` met een redirect-URL van de payment gateway.
   Mooiste conversie, meeste werk: adresvalidatie, postcode-API, iDEAL-bankkeuze.
2. **Redirect naar WooCommerce checkout** — cart-token doorgeven via
   `?cart_token=` en de Woo-checkout stylen. Snel live, maar een merkbreuk in de flow.

Advies: begin met route 2 zodat de shop binnen een sprint draait, en vervang de
afrekenstap later door route 1 zodra de rest meet.

## 3. Veldenkaart (prototype → Woo)

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

## 4. Caching

- Catalogus- en PDP-data: `fetch(..., { next: { revalidate: 300, tags: ['product:soccer-memo'] } })`.
- Woo-webhook `product.updated` → `/api/revalidate` → `revalidateTag('product:...')`.
- Alles onder `/wc/store/v1/cart` is per bezoeker: `cache: 'no-store'`, client-side ophalen.
- Voorraadaantal apart client-side verversen zodat de pagina statisch kan blijven.

## 5. Mappenstructuur

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

## 6. SEO en techniek

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
