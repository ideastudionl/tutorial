# ForeverC9 — Shopify theme (deploy branch)

**This branch is the deploy target for Shopify's GitHub integration.**
Shopify expects theme files in the repository root, so this branch contains the
contents of `theme/` from `claude/foreverc9-shopify-redesign-eooy5g`, moved up
one level. Nothing else (docs, prototype) is here — Shopify would reject those.

## Connecting it

Shopify admin → Online Store → Themes → Add theme → Connect from GitHub
→ repository `ideastudionl/tutorial` → branch `shopify-theme`.

Add it as an **unpublished** theme, preview it, and only publish once you have
checked it. Duplicate the current live theme as a backup first.

## Two-way sync

Once connected, Shopify writes back to this branch whenever someone edits theme
settings or section content in the theme editor. Those commits are expected.
Code changes flow the other way: they are made on the development branch and
copied here.

## Before publishing

The theme renders your store's own data, so this has to be in place:

1. The eight collections, with the handles the navigation points at
2. A `main-menu` and `footer` menu under Navigation
3. Metafields under Settings → Custom data: `custom.short_benefit`,
   `custom.contents`, `custom.usage`, `custom.suitable_for`,
   `custom.ingredients`, `custom.badge`
4. The Search & Discovery app, for collection filters
5. Theme settings → Bedrijfsgegevens: KvK, BTW-nummer, phone, support hours
6. Theme settings → Claims: leave empty unless the claim can be substantiated

Star ratings appear only when a review app writes `reviews.rating` and
`reviews.rating_count`. That is deliberate — see `docs/01-audit.md` on the
development branch.
