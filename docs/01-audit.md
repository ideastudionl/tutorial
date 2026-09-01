# ForeverC9 — Audit (Phase 1)

> **Research constraint (important).** This session runs in a sandbox whose network egress
> proxy blocks all direct HTTP fetching. `foreverc9.nl`, Trustpilot and `shopify.dev` could
> **not** be crawled. Everything below comes from server-side web search results and is
> marked with a confidence level. The connected Shopify Admin API in this session belongs to
> a **different store (`belamonte.nl`)**, so the live ForeverC9 catalog, collections,
> metafields, theme settings and app list could not be read either.
> **Anything marked `UNVERIFIED` must be confirmed against the live store before launch.**

## 1. What ForeverC9 is

A Dutch reseller webshop for Forever Living Products (aloe vera drinks, the C9 / F15
programmes, supplements, skincare, bee products, sport & fitness). Roughly 136 products.
Shopify-hosted.

| Fact | Value | Confidence |
| --- | --- | --- |
| Domain | foreverc9.nl | verified |
| Platform | Shopify | verified (URL structure `/collections/`, `/products/`, `phcursor` pagination) |
| Business address | Keizersgracht 391-A, 1016 EJ Amsterdam | search result — **UNVERIFIED** |
| Email | info@foreverc9.nl | search result — **UNVERIFIED** |
| Phone number | **none published** | reported repeatedly in reviews |
| KvK / BTW number | **not found** | **UNVERIFIED** |
| Returns | 14 days cancel + 14 days to return, refund within 14 days | matches statutory NL/EU minimum |
| Shipping NL | free | claimed on site |
| Shipping BE | €5,95 | from brief |
| Delivery promise | "Vandaag besteld, morgen in huis" | claimed on site |
| Customer claim | "25.000 tevreden klanten" | from brief — **UNSUBSTANTIATED** |

Known live URLs (must not 404 after redesign):
`/`, `/collections/all`, `/pages/over-ons`, `/pages/retournering`,
`/products/c9-gel-vanilla-nl`, `/products/c9-gel-chocolate-nl`,
`/products/c9-berry-vanilla-nl`, `/products/c9-berry-chocolate-nl-1`,
`/products/c9-peach-vanilla-nl`, `/products/forever-c9-mango-vanilla-nl`,
`/products/forever-daily-1`.

Handle convention is inconsistent (`c9-gel-vanilla-nl` vs `forever-c9-mango-vanilla-nl`,
plus `-1` suffixes from duplicated products). See IA doc — this is a real SEO liability.

## 2. The finding that outranks every design decision

**ForeverC9 has a TrustScore of 2.1 / 5 on Trustpilot across ~43 reviews.**

The recurring complaints are not cosmetic:

1. **Orders paid for and never delivered.** Multiple reviewers report tracking numbers
   issued but no package (one cites a €120 order).
2. **Customer service does not answer.** Emails unanswered, or answered twice with no
   resolution.
3. **No phone number** anywhere on the site.
4. **Partial shipments** — two units ordered, one delivered.
5. Delivery taking ~9 days against a "tomorrow in huis" promise.
6. Trustpilot flags that the business has never invited customers to review, so the
   sample skews to the aggrieved.

### What this means for this project

I was asked to design "a much stronger trust framework". I can, and this repo does. But I
want to be straight with you about the limits of that, because it changes what the redesign
can be expected to achieve:

- **A redesign cannot fix a fulfilment or service problem.** If orders genuinely aren't
  arriving and email isn't answered, better typography raises the conversion rate on the
  first order and raises the chargeback, complaint and Trustpilot-review rate right behind
  it. The net effect can be *negative*.
- **Two claims on the current site are in direct tension with the public record.**
  "Vandaag besteld, morgen in huis" against reviews reporting 9 days, and
  "25.000 tevreden klanten" against a 2.1 TrustScore on 43 reviews. Under Dutch/EU rules on
  misleading commercial practice (Afdeling 3A.3.3a BW / UCPD), an unsubstantiated headline
  claim is a legal exposure, not just a credibility one. **I have not hardcoded either claim
  into the theme.** Both are theme settings, empty by default, with schema help text saying
  they may only be filled in with substantiated figures.
- **The theme therefore ships trust *infrastructure*, not trust *theatre*:** real review
  integration points, mandatory company identification in the footer, published phone number
  field, honest delivery-window copy driven by settings, real stock state, and no invented
  testimonials, no fake countdowns, no fabricated review counts anywhere.

### Operational prerequisites (outside this repo, but blocking)

Ranked by impact on conversion and on risk:

1. Fix fulfilment reliability and publish a real, achievable delivery window.
2. Publish a phone number and staffed support hours. (Also: NL law requires identifiable
   trader contact details.)
3. Publish KvK number, BTW-nummer and legal entity name in the footer.
4. Start actively inviting reviews after *delivery* (Trustpilot / Kiyoh / Google), which is
   the only legitimate way to move a 2.1 score.
5. Substantiate or retire the "25.000 klanten" claim.
6. Reconcile the "morgen in huis" promise with actual carrier performance.

Steps 1–3 are worth more conversion than everything else in this repository combined.

## 3. UX / CRO frictions inferred from the current site

Marked by confidence, since the pages could not be opened.

| # | Friction | Confidence | Fix in this repo |
| --- | --- | --- | --- |
| 1 | No trust framework above the fold; visitor has no reason to believe the shop | high | Trust bar section, buy-box trust row, footer company block |
| 2 | Company identity effectively invisible (no phone, no KvK) | high | Footer company block with dedicated settings, contact page |
| 3 | Product discovery is a flat 136-product catalogue behind `/collections/all` | high | Shop-by-need section, mega menu, faceted collection page |
| 4 | Duplicate/inconsistent product handles (`-1` suffixes) splitting SEO equity | high | IA doc: canonical + redirect plan |
| 5 | Reviews not integrated into PDP or cards | high | Rating snippet on card + PDP, review section, schema |
| 6 | No sticky add-to-cart on mobile | high | `sticky-atc` snippet |
| 7 | No cart drawer / free-shipping progress → no AOV mechanic | high | Cart drawer with threshold progress + upsell |
| 8 | Delivery + returns info not present at the decision point | high | Buy-box shipping row, PDP accordions |
| 9 | Predictive search weak or absent | medium | Predictive search section, desktop + mobile |
| 10 | C9 — the commercial hero product — merchandised as just another SKU | high | Dedicated featured-C9 section |
| 11 | No bundles / quantity breaks / cross-sell → low AOV | medium | Quantity breaks + complete-your-order blocks |
| 12 | Wellness products sold with no educational layer | high | Editorial section + blog templates |

## 4. Theme / technical baseline

Could not be read (no egress, wrong store on the Admin API). Assumed and to be verified:

- Current theme is an older or lightly-customised Shopify theme — **UNVERIFIED**.
- App stack unknown. Any review app, upsell app or filter app currently installed must be
  reconciled with this theme before go-live; several of them duplicate what is built here
  natively and should be removed for performance.
- Metafields/metaobjects in use: unknown. This theme reads a defined set (see
  `docs/05-implementation-plan.md`) and degrades gracefully when they are absent.

## 5. Conclusion

The design and code problems are real and are solved in this repository. The *primary*
constraint on ForeverC9's revenue is not the storefront — it is delivery reliability,
reachability and the resulting public reputation. The theme is built so that when those are
fixed, every trust surface is already in place to show it.
