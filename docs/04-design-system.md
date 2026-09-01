# ForeverC9 — Design system (Phase 4)

The canonical source is `theme/assets/base.css` (CSS custom properties). This document
explains the reasoning; the code is the specification.

## 1. Direction

Premium health & wellness, Northern-European restraint. Calm, generous whitespace, one
confident accent. The brief warned against "overmatig groen" — the palette therefore uses a
deep, desaturated evergreen as an *anchor* colour rather than a fresh/pharmacy green, and
carries warmth in the neutrals so the shop reads natural rather than clinical.

Explicitly avoided: gradient meshes, glassmorphism, neon accents, drop shadows on everything,
rounded-everything, and the Dawn default look.

## 2. Colour

| Token | Value | Role |
| --- | --- | --- |
| `--c-ink` | `#14201c` | Primary text, headings |
| `--c-ink-soft` | `#4a5b54` | Secondary text |
| `--c-brand` | `#1f4d3d` | Brand anchor, headers, dark sections |
| `--c-brand-600` | `#28624e` | Hover state |
| `--c-accent` | `#c98a3c` | Warm gold — badges, editorial accents |
| `--c-cta` | `#1f4d3d` | Primary CTA |
| `--c-sand` | `#f6f3ee` | Soft neutral section background |
| `--c-surface` | `#ffffff` | Cards, page |
| `--c-line` | `#e3ded6` | Borders |
| `--c-success` | `#2f7d5b` | In stock, progress |
| `--c-sale` | `#b4432f` | Sale price, savings |

Contrast: every text/background pairing in the theme meets WCAG AA (4.5:1 body, 3:1 large).
`--c-accent` is never used for body text on white — only for large text, icons and rules.

**One CTA colour.** Primary actions are `--c-cta` and nothing else on the page uses it as a
fill. This is what makes the CTA findable without shouting.

## 3. Typography

- Headings: a modern grotesk with tight tracking. Stack:
  `"Fraunces", "Bricolage Grotesque", system-ui` is *not* used — instead the theme uses
  Shopify's `font_picker` so the merchant can set the pair from the theme editor, with
  sensible defaults and a full system fallback stack so there is no FOIT and no third-party
  font request unless the merchant opts in.
- Body: same picker, separate setting, optimised for small sizes.
- Fluid scale via `clamp()` so mobile typography is set for mobile rather than scaled down:
  `--fs-h1: clamp(2rem, 1.4rem + 2.6vw, 3.4rem)` etc.
- Body base is 16px minimum on mobile (never 14px), line-height 1.6 for prose.

## 4. Spacing, radius, elevation

- 4px base scale: `--sp-1` … `--sp-16` (4 → 96px).
- Section rhythm: `--section-y: clamp(3rem, 2rem + 5vw, 6.5rem)`.
- Radius: `--r-sm 6px`, `--r-md 12px`, `--r-lg 20px`, `--r-pill 999px`. Restrained.
- Elevation: two shadows only (`--shadow-1` for cards on hover, `--shadow-2` for drawers).
  Flat by default; shadow signals interactivity.

## 5. Components

Every one of these is a reusable snippet or section (see `theme/snippets`, `theme/sections`):

announcement bar · header · mega menu · mobile drawer nav · predictive search · button
(primary/secondary/ghost/link) · product card · badge · rating stars · trust bar · trust
block · accordion · icon row · testimonial · FAQ (with schema) · newsletter · footer ·
sticky ATC · cart drawer · free-shipping progress · upsell block · cross-sell block ·
quantity breaks · collection filters · sorting · breadcrumbs · pagination · quantity input ·
variant picker · price · media gallery.

## 6. Motion

Subtle and cheap. Fades and 150–250ms transitions on transform/opacity only (never on
layout properties). Drawers slide with `transform`. Reveal-on-scroll uses a single
`IntersectionObserver` and is disabled entirely under
`@media (prefers-reduced-motion: reduce)`.

## 7. Accessibility rules baked in

- Visible `:focus-visible` ring on every interactive element, never removed.
- Skip link to `#MainContent`.
- Drawers trap focus, close on `Escape`, restore focus to the trigger, and set `aria-expanded`.
- All icon-only buttons carry an accessible name.
- Landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page.
- Form fields have real `<label>`s; errors are announced via `aria-live`.
- Images carry alt text sourced from Shopify's media alt field.
