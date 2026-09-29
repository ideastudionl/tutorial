# Belamonte

Shopify-theme voor **Belamonte**, gebaseerd op Shopify's officiële [Dawn](https://github.com/Shopify/dawn) theme (v15.4.1).

Deze repository is gekoppeld aan de Shopify-winkel via de GitHub-integratie. Wijzigingen die naar de gekoppelde branch worden gepusht, worden automatisch naar het theme in de winkel gesynchroniseerd. Aanpassingen die in de Shopify theme-editor worden gemaakt, worden teruggecommit naar deze branch.

## Theme-structuur

| Map | Inhoud |
|-----|--------|
| `assets/` | CSS, JavaScript, afbeeldingen en fonts |
| `config/` | Theme-instellingen (`settings_schema.json`, `settings_data.json`) |
| `layout/` | Hoofd-layoutbestanden (`theme.liquid`, `password.liquid`) |
| `locales/` | Vertalingen |
| `sections/` | Herbruikbare secties |
| `snippets/` | Herbruikbare Liquid-snippets |
| `templates/` | Pagina-templates |

## Lokaal ontwikkelen (optioneel)

Installeer de [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) en draai:

```bash
shopify theme dev      # live preview tijdens ontwikkelen
shopify theme check    # theme linten
shopify theme push     # handmatig pushen naar de winkel
```

## Koppelen aan Shopify via GitHub

In Shopify admin: **Online Store → Themes → Add theme → Connect from GitHub**, kies deze repository en de branch. Zie de Shopify-documentatie over [GitHub-integratie](https://shopify.dev/docs/storefronts/themes/tools/github).
