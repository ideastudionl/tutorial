# Soccer MeMo — shopredesign (headless WooCommerce)

Nieuw winkelontwerp voor [soccer-games.nl](https://www.soccer-games.nl/), het
voetbal-memoryspel Soccer MeMo (48 kaarten, 24 paren, vanaf 4 jaar). Doel: een
speelse maar zakelijke winkel voor Nederlandse bezoekers — kinderen kijken mee,
ouders rekenen af — die als front-end op een bestaande WooCommerce draait.

## Wat zit erin

```
index.html            prototype: homepagina + productpagina (hash-routing)
assets/styles.css     ontwerpsysteem in tokens, licht én donker
assets/app.js         memorydemo, winkelwagen, bundels, aftelklok, galerij
docs/headless-woocommerce.md   koppeling: Store API, cart-token, checkout, caching
docs/design-system.md          kleur, typografie, componenten, beweging, toegankelijkheid
docs/conversie.md              elk conversie-element met reden en meetplan
```

## Bekijken

Open `index.html` in de browser, of serveer de map:

```bash
python3 -m http.server 4173   # → http://localhost:4173
```

`#/` is de homepagina, `#/product` de productpagina.

## Over de inhoud

Prijzen, voorraad, reviews en de collectie zijn **voorbeelddata** — in de echte
winkel komen ze uit WooCommerce (zie de veldenkaart in
`docs/headless-woocommerce.md`). De productfeiten (48 kaarten, 24 paren, 2–4
spelers, vanaf 4 jaar) komen van de huidige site; de recensies en de aantallen zijn
ingevuld om het ontwerp te tonen en moeten vóór livegang door echte data vervangen
worden. De illustraties zijn inline SVG, bedoeld als plaatshouder voor de echte
kaartafbeeldingen en productfoto's.
