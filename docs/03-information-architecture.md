# ForeverC9 — Information architecture (Phase 3)

## 1. Navigation

Built from buyer intent, not from Forever's internal catalogue tree.

```
SHOP (mega menu)
├─ Programma's        → /collections/programmas      (C9, F15)
├─ Dranken            → /collections/dranken         (aloe vera gels/drinks)
├─ Supplementen       → /collections/supplementen
├─ Sport & Fitness    → /collections/sport-fitness
├─ Huidverzorging     → /collections/huidverzorging
├─ Persoonlijke verzorging → /collections/persoonlijke-verzorging
├─ Bijenproducten     → /collections/bijenproducten
└─ [promo column]  Bestsellers · Nieuw · Aanbiedingen · Bundels

C9              → /collections/c9          (own landing, highest commercial value)
F15             → /collections/f15
Sport & Fitness → /collections/sport-fitness
Wellness        → /collections/wellness
Over ons        → /pages/over-ons
```

Utility: Zoeken · Account · Cart. Mobile header: logo · zoeken · cart · hamburger.

Rationale: max two clicks to any product. "Programma's" groups C9 and F15 because buyers
shop the *outcome* (a 9-day programme) not the *SKU*. C9 additionally gets a top-level slot
because it is the primary demand driver and the brand's namesake.

## 2. Collection architecture

| Handle | Purpose | Filters that matter |
| --- | --- | --- |
| `c9` | Hero programme, all flavour variants | smaak, prijs, beschikbaarheid |
| `f15` | Follow-on programme | niveau, smaak |
| `programmas` | C9 + F15 parent | programma, duur |
| `dranken` | Aloe gels & drinks | smaak, inhoud |
| `supplementen` | Daily supplements | doel, vorm |
| `sport-fitness` | Sport range | doel, vorm |
| `huidverzorging` | Skincare | huidtype, producttype |
| `persoonlijke-verzorging` | Personal care | producttype |
| `bijenproducten` | Bee products | producttype |
| `bestsellers` | Social-proof driven | — |
| `nieuw` | Recency | — |
| `aanbiedingen` | Price-led | — |
| `bundels` | AOV | — |

Filters are delivered by **Shopify Search & Discovery** (native `filters` on the collection
object) — no filter app, no extra JS. Recommended facet setup in the Search & Discovery app:
product type, availability, price, plus metafield facets `smaak` and `doel`.

Keep facets to a maximum of five per collection. More than that measurably reduces use.

## 3. URL & redirect policy

**No existing URL may 404.** Concretely:

1. Keep every current `/products/<handle>` handle exactly as-is. Handles are *not* to be
   "cleaned up" — the SEO cost outweighs the tidiness gain.
2. The duplicate-handle problem (`c9-berry-chocolate-nl-1`, `forever-daily-1`) is a *product
   catalogue* problem, not a theme problem. Resolve it in the Admin: pick the canonical
   product, move inventory and reviews onto it, and create a
   **301 redirect** from the loser handle via Online Store → Navigation → URL Redirects.
   Deleting a duplicate without a redirect loses the ranking.
3. `/pages/over-ons` and `/pages/retournering` keep their handles. New pages
   (`/pages/verzending`, `/pages/faq`, `/pages/contact`) are additive.
4. `/collections/all` stays reachable and indexable as the full catalogue.
5. Export the current sitemap before cutover and diff it against the new one. Any URL that
   disappears needs a redirect entry.

## 4. Internal linking

- Mega menu links every collection (crawlable `<a>` markup, not JS-injected).
- Breadcrumbs on collection, product, blog and page templates (with `BreadcrumbList` schema).
- Collection SEO block links to sibling collections.
- PDP links to its parent collection, to related products, and to relevant guides.
- Blog articles link to the programme/collection they discuss.
- Footer links every top-level collection and every policy page.

## 5. Metafields consumed by the theme

All optional — the theme degrades cleanly if they are absent.

| Namespace.key | Type | Used for |
| --- | --- | --- |
| `custom.short_benefit` | single_line_text | Buy box + product card one-liner |
| `custom.usage` | rich_text | "Hoe gebruik je het" accordion |
| `custom.ingredients` | rich_text | Ingredients accordion |
| `custom.contents` | rich_text | "Wat zit erin" (programme contents) |
| `custom.suitable_for` | rich_text | "Voor wie" accordion |
| `custom.specs` | rich_text | Specifications accordion |
| `custom.faq` | rich_text | Product-level FAQ |
| `custom.badge` | single_line_text | Card/PDP badge label |
| `custom.smaak` | single_line_text | Flavour facet |
| `custom.doel` | single_line_text | Goal facet |
| `reviews.rating` / `reviews.rating_count` | rating / number_integer | Stars on card + PDP (Shopify's standard review metafields) |

## 6. User journeys designed for

1. **Brand searcher** ("forever c9 kopen") → homepage → featured C9 section → C9 PDP →
   cart drawer → checkout. Trust must land in the first viewport.
2. **Category browser** ("aloe vera drink") → collection → filter → PDP.
3. **Sceptic** (brand + "ervaringen") → arrives already doubting → needs company identity,
   phone number, real reviews and returns policy reachable within one click from anywhere.
   This journey is why the footer company block and contact page are load-bearing.
4. **Returning customer** → search or account → reorder. Predictive search and clean account
   templates carry this.
