# ForeverC9 — Information architecture (Phase 3)

## 1. Navigation

Built from the categories the live catalogue actually uses. An earlier draft of this document
re-grouped C9 and F15 under an invented "Programma's" parent; that has been reverted. Inventing a
category tier costs existing URLs and existing search equity, and buyers already search for "C9"
and "F15" by name — so the real eight categories are kept verbatim.

```
SHOP (mega menu)
├─ C9 kuur                  → /collections/c9-kuur
├─ Forever F15              → /collections/forever-f15
├─ Sport & Fitness          → /collections/sport-fitness
├─ Dranken                  → /collections/dranken
├─ Huidverzorging           → /collections/huidverzorging
├─ Persoonlijke verzorging  → /collections/persoonlijke-verzorging
├─ Voedingssupplementen     → /collections/voedingssupplementen
├─ Bijenproducten           → /collections/bijenproducten
└─ [promo column]  De C9 kuur

C9 kuur          → top-level, highest commercial value and the brand's namesake
Forever F15      → top-level, the follow-on programme
Sport & Fitness  → top-level
Over ons         → /pages/over-ons
```

Utility: Zoeken · Account · Cart. Mobile header: logo · zoeken · cart · hamburger.

**Verify the handles before launch.** The handles above are the expected slugs; the live
collection handles could not be read from this environment (egress blocked, and the connected
Admin API belongs to a different store). Whatever the live handles are, keep them — do not rename
collections as part of this redesign.

Rationale: every product is at most two clicks away. The mega menu shows a live product count per
category, which both helps the visitor choose and signals that the catalogue is real and stocked.

## 2. Collection architecture

| Category | Filters that matter |
| --- | --- |
| C9 kuur | smaak, beschikbaarheid |
| Forever F15 | niveau, smaak |
| Sport & Fitness | doel, vorm |
| Dranken | smaak, inhoud |
| Huidverzorging | huidtype, producttype |
| Persoonlijke verzorging | producttype |
| Voedingssupplementen | doel, vorm |
| Bijenproducten | producttype |

Plus merchandising collections that cut across the eight: `bestsellers`, `nieuw`, `aanbiedingen`,
`bundels`.

Filters are delivered by **Shopify Search & Discovery** (native `filters` on the collection
object) — no filter app, no extra JavaScript. Recommended facet setup in the Search & Discovery
app: product type, availability, price, plus metafield facets `smaak` and `doel`.

Keep facets to a maximum of five per collection. More than that measurably reduces use.

### One catalogue change worth making

The five C9 flavours are currently five separate products with five handles
(`c9-gel-vanilla-nl`, `c9-berry-chocolate-nl-1`, `c9-peach-vanilla-nl`, …). That splits the
ranking signal for the shop's single most valuable search term across five URLs, and it splits
reviews across five products.

Recommendation: consolidate them into **one product with a "Smaak" variant option**, pick the
strongest-ranking handle as the canonical one, and 301 the other four onto it. The prototype's
product page shows this working. It is a catalogue change, not a theme change, and it should be
done in the Admin before the theme goes live so the redirects land in the same deploy.

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
