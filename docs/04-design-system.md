# ForeverC9 — Design system (Phase 4)

The canonical source is `theme/assets/base.css` plus the theme settings written into
`layout/theme.liquid`. The prototype at `demo/foreverc9-demo.html` uses the same tokens, so
the two stay one system. This document explains the reasoning; the code is the specification.

## 1. Direction

**Modern Dutch design, light-dominant, for a health-conscious audience.**

Concretely that means: a strict visible grid, flat colour blocks butted edge to edge, hairline
rules, near-zero corner radius, large functional typography, and one saturated colour spent in
exactly one place. The reference points are Dutch graphic design's functional tradition — Total
Design, Wim Crouwel's grids, Experimental Jetset's restraint — rather than the soft, rounded,
shadowed look most Shopify wellness themes default to.

The palette is deliberately light. Grounds are white and pale neutrals; the deep green appears
as text, as the buy button, and as a single anchoring band per page. This suits a health
audience (clean, calm, legible) and it keeps the CTA unmistakable, which is the conversion
argument for the restraint.

Explicitly avoided: gradient meshes, glassmorphism, rounded-everything, shadows on every block,
stock wellness photography clichés, and the Dawn default look.

## 2. Colour

| Token | Value | Role |
| --- | --- | --- |
| `--c-surface` | `#ffffff` | Cards and page surface |
| *paper* | `#fbfbf9` | Page ground (prototype token; warm white) |
| `--c-sand` | `#f1f2ee` | Pale neutral band |
| *sage* | `#e7efe8` | Pale green band — hero, C9 spotlight |
| `--c-ink` | `#111a15` | Primary text, headings |
| `--c-ink-soft` | `#55625b` | Secondary text |
| `--c-line` | `#dfe2db` | Borders and hairlines |
| `--c-brand` / `--c-cta` | `#0f6b46` | The one bold colour — buy actions, brand |
| `--c-brand-hover` | `#0a5537` | Hover state |
| `--c-accent` | `#b57b1e` | Amber, used only for star ratings and small marks |
| `--c-sale` | `#b6412a` | Sale price and savings, nothing else |
| `--c-success` | `#147a52` | In stock, shipping progress |

Two rules do most of the work:

1. **One CTA colour.** `--c-cta` is never used as a fill anywhere else on the page. That is what
   makes the buy button findable without it having to shout.
2. **Neutrals are biased, not grey.** Every neutral carries a slight green cast so the page reads
   as chosen rather than defaulted, and so it sits with the brand colour instead of fighting it.

Contrast: every text/background pairing meets WCAG AA. `--c-accent` is never used for body text
on white — only for icons and large marks, where 3:1 applies.

**Light is the standard.** The storefront opens light for everyone, including visitors whose
device is set to dark mode — the page does not follow `prefers-color-scheme`. The Shopify theme is
light-only by design (all colour comes from theme settings; there is no dark-mode stylesheet). The
prototype keeps a dark palette behind an explicit opt-in toggle so the tokens can be checked, but
nothing reaches it automatically.

## 3. Typography

- **Display — Archivo**, a sturdy grotesk with a variable width axis. Set wide (`wdth` 112–118)
  and heavy for headlines, with tight tracking (`-0.03em`). That combination is the Dutch poster
  move and is what stops the page reading as a generic template.
- **UI and body — Instrument Sans.** Neutral, highly legible at small sizes, and not one of the
  faces every AI-generated page reaches for.
- **Micro-labels** are Instrument Sans at 11px, 600 weight, `0.14em` tracking, uppercase.

A fluid scale set for mobile first, not scaled down from desktop:
`--fs-h1: clamp(2.1rem, 1.2rem + 3.6vw, 4.1rem)` and so on. Body is 16px minimum on mobile,
line-height 1.55, running text held near 60–65 characters.

**Theme note.** The theme exposes both faces through Shopify's `font_picker`, so the merchant can
change them without code. Archivo and Instrument Sans could not be confirmed as handles in
Shopify's font library from this environment, so the shipped defaults remain the verified-safe
`assistant_n7` / `assistant_n4`. Set the intended pair in the theme editor if the library carries
them, or add them as custom fonts; the CSS reads whatever the picker returns.

## 4. Structure, spacing, radius

- 4px base scale, `--sp-1` … `--sp-24`.
- Band rhythm: `--section-y: clamp(3rem, 2rem + 4.4vw, 5.5rem)`.
- **12-column grid** on desktop, 2 columns on mobile. The grid is load-bearing: content spans
  named column counts (`.c3`, `.c5`, `.c7`) rather than ad-hoc widths.
- **Radius 2px.** Crisp, deliberate, neither bubbly nor brutally square.
- **Flat by default.** Separation comes from a 1px border or a colour block. Shadow is reserved
  for surfaces that genuinely float: drawers and the search panel.

### The micro-label rule

The recurring device — a short rule, then a wide-tracked uppercase label — must always encode
something true: a product count, a category, a step in a real sequence. The C9 spotlight numbers
its steps because the C9 *is* a nine-day sequence; a decorative 01/02/03 on a list that has no
order is exactly the generic move this system exists to avoid.

## 5. Components

All reusable, all in `theme/sections` and `theme/snippets`:

announcement bar · header · mega menu · mobile drawer nav · predictive search · buttons
(primary/outline/quiet/on-dark) · product card · tag · rating stars · USP strip · feature block ·
accordion · FAQ with schema · newsletter · footer with company block · sticky ATC · cart drawer ·
free-shipping progress · quantity breaks · upsell and cross-sell rows · collection filters ·
sorting · breadcrumbs · pagination · quantity input · variant picker · price · media gallery.

## 6. Product imagery

The theme renders the store's own product media — that is the intended and only correct source.

The prototype cannot: this environment's egress proxy blocks `foreverc9.nl` and `cdn.shopify.com`,
so the real packshots could not be fetched, and a published artifact cannot load external images
in any case. The prototype therefore draws each pack as flat SVG — a product-coloured ground, a
body in the right pack format (bottle, box, jar, tube, tub, sachet), and a label carrying the real
product name. Each product has its own hue, so a grid of 26 packs stays scannable. Flavours follow
the fruit: Berry Nectar is cranberry, Peaches is orange, Mango is yellow.

These are placeholders for layout, not proposed artwork. On import they are replaced by
`product.featured_media` and the gallery loop.

## 7. Motion

Fades and 150–220ms transitions on `transform` and `opacity` only, never on layout properties.
Drawers slide with `transform`. Everything is disabled under `prefers-reduced-motion: reduce`,
and no content depends on JavaScript to become visible.

## 8. Accessibility rules baked in

- Visible `:focus-visible` ring on every interactive element, never removed.
- Skip link to `#MainContent`.
- Drawers trap focus, close on `Escape`, restore focus to the trigger, and set `aria-expanded`.
- Every icon-only button carries an accessible name.
- Landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- Real `<label>`s on form fields; errors announced via `aria-live`.
- Inputs are 16px minimum so iOS does not zoom on focus.
- Alt text sourced from Shopify's media alt field.
