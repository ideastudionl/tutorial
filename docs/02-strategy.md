# ForeverC9 — Market research & CRO strategy (Phase 2)

> Same research constraint as the audit: competitor sites could not be crawled directly.
> The competitor set below is drawn from search results plus category knowledge of the
> NL/EU wellness-DTC market. Patterns are described as patterns, not as claims about any
> individual site's current page.

## 1. Competitive landscape

Three tiers compete for the same query set ("forever c9", "clean 9 kuur", "aloe vera drink").

**Tier A — Forever Living reseller shops (direct competitors, NL/BE).**
`4everaloevera.nl`, `forever24-7.nl`, `foreverdiscount.nl`, `foreversnack.nl`,
`rachelhulshof.nl`, plus dozens of distributor micro-sites. Characteristics: identical
catalogue, identical product photography supplied by Forever, competing almost entirely on
price ("15% korting"), shipping speed and personal/coach credibility. Most look like stock
templates. **This is the key insight: the products are undifferentiated, so the storefront
experience and trust are the only available differentiators.**

**Tier B — NL/EU premium supplement & wellness DTC.** The reference class for design and
CRO quality — brands with strong review integration, subscription mechanics, bundle
merchandising and genuinely premium art direction.

**Tier C — Marketplaces** (bol.com, Amazon.nl) — win on trust and delivery certainty. A
small shop cannot beat them on logistics; it must beat them on expertise, product
education, and being visibly a real, reachable company.

## 2. Patterns worth adopting (and the ones to refuse)

Adopt:

| Pattern | Why | Where in this build |
| --- | --- | --- |
| Rating + review count above the product title | Highest-leverage single PDP element | `snippets/rating.liquid` in buy box |
| Benefit statement before the description | Answers "what does this do for me" in 3s | Buy box short benefit |
| Shipping/returns/payment row inside the buy box | Kills the top three objections at the decision point | `snippets/buy-box-trust.liquid` |
| Sticky ATC on mobile after the CTA scrolls out | Recovers long-page drop-off | `snippets/sticky-atc.liquid` |
| Cart drawer + free-shipping progress | Single best AOV mechanic that isn't annoying | `sections/cart-drawer.liquid` |
| Quantity breaks on consumables | C9/drinks are repeat-purchase; multi-packs raise AOV honestly | `snippets/quantity-breaks.liquid` |
| "Shop by need" over "shop by catalogue" | 136 SKUs is a discovery problem, not a choice problem | `sections/shop-by-need.liquid` |
| Faceted collection filtering | Shopify-native, no app, no JS weight | `sections/main-collection.liquid` |
| Education/editorial layer | Wellness buyers research first; also earns non-brand SEO | `sections/editorial-grid.liquid` + blog |

Refuse (explicitly out, per brief and per my own judgement):

- Fake countdown timers, "3 people are viewing", invented low-stock numbers.
- Fabricated testimonials or review counts.
- Medical/health claims ("geneest", "voorkomt", "detoxt je lichaam"). EU Regulation
  1924/2006 permits only authorised health claims; unauthorised wellness claims are a
  regulatory exposure and this theme's copy avoids them entirely.
- Entry popups. One newsletter section in the footer flow instead.
- Heavy JS frameworks, carousels-as-hero, autoplaying video backgrounds.

## 3. Positioning

> **The Forever specialist you can actually reach.**

Every competitor sells the identical product at a similar price. ForeverC9 cannot win on
product and should not try to win on discount alone. Given the reputation baseline, the only
defensible position is *operational credibility*: real stock, honest delivery windows, a
published phone number, named people, and expertise about the programmes.

That position is also the exact remedy for the Trustpilot problem — which is why it is the
right one rather than merely the available one.

## 4. Conversion model

The funnel this build optimises, in order of expected lift:

1. **Trust before interest** (bounce reduction) — trust bar, company identity, real reviews.
2. **Discovery** (PDP sessions per visit) — shop-by-need, mega menu, predictive search.
3. **Objection handling** (ATC rate) — buy-box trust row, accordions, FAQ, delivery clarity.
4. **Friction removal** (ATC → checkout) — sticky ATC, cart drawer, accelerated checkout.
5. **AOV** — free-shipping threshold, quantity breaks, complete-your-order, bundles.
6. **Retention** — post-purchase content, newsletter, reorder-friendly account pages.

### Measurement plan

Set up before launch, so the redesign can be judged rather than believed:

- GA4 + Shopify analytics events on: `view_item`, `add_to_cart`, `begin_checkout`, purchase.
- Segment mobile vs desktop separately — mobile is the majority and the weaker experience.
- Track the free-shipping-threshold cross rate and AOV distribution, not just mean AOV.
- Track *delivered-on-time rate* and *support first-response time* alongside conversion.
  If conversion rises while these fall, the redesign is doing harm and should be throttled.

## 5. Honest expectation setting

Storefront work of this quality typically moves conversion rate meaningfully on a shop with
sound operations. On a shop with a 2.1 TrustScore and open non-delivery complaints, a large
share of the traffic that would convert is lost to people who search the brand name before
buying — and the redesign has no effect on what they find. Fix the operations in parallel or
this work under-delivers regardless of how well it is built.
