# Ontwerpsysteem — "Veldlijnen & Oranje"

Nederlands rastersysteem (strakke kolommen, vlakke kleuren, één tactiel accent)
gekruist met de krijtlijnen van een voetbalveld. Speels waar het kind kijkt,
zakelijk waar de ouder beslist.

## Kleur

De winkel heeft één vaste lichte weergave op wit — geen donkere variant.

| Token | Waarde | Gebruik |
|---|---|---|
| `--paper` | `#FFFFFF` | pagina-ondergrond |
| `--surface` | `#FFFFFF` | kaarten en panelen (afgegrensd met `--line`) |
| `--surface-2` | `#F2F7EE` | beeldvlakken, ingesprongen blokken |
| `--ink` | `#121A14` | tekst |
| `--muted` | `#5D6B5C` | bijschriften |
| `--brand` | `#22C55E` | logogroen van Soccer Games |
| `--pitch` | `#0B6B3A` | vertrouwen, USP-balk, footer |
| `--flame` | `#FF5A00` | één rol: kopen (CTA, prijs, actieve keuze) |
| `--lemon` | `#FFC630` | sterren, accentvlak |
| `--sky` | `#2F6BFF` | focusring |

Kaartkleuren uit het spel zelf: gras `#7FBF3F`, mint `#6DC9A9`, room `#F8EFC0`,
lucht `#A9DCEE`, kaartrug `#2E8B43`, shirtrood `#E8352E`, bekergeel `#FFD23F`.

Oranje is gereserveerd voor koopacties. Staat er oranje op het scherm, dan kun je
daar klikken om te bestellen — dat maakt de belangrijkste knop altijd vindbaar.

## Typografie

- **Bricolage Grotesque 700/800** — koppen. Brede, iets eigenwijze grotesque:
  speels genoeg voor kinderen, stevig genoeg voor een prijskaartje.
- **Instrument Sans 400/500/600** — lopende tekst, regels van ± 65 tekens.
- **DM Mono 500** — labels, prijzen, tellers, aftelklok. Cijfers die uitlijnen
  (`font-variant-numeric: tabular-nums`) lezen als productinformatie, niet als marketing.

Schaal: `clamp()` tussen 2,4 en 4,4 rem voor H1, 1,8–2,9 rem voor H2, 1 rem basis.

## Logo

Het beeldmerk staat in `assets/logo/` (`mark.svg` groen, `mark-white.svg` wit) en
als symbool `#logo-mark` in de pagina. De speler is een uitsparing in de schijf,
dus de variant volgt de kleur die je meegeeft: groen op wit, wit op groen of
donkergroen. Het woordmerk staat eronder of ernaast in Bricolage Grotesque 800,
met de pay-off "Play Focus and Learn" in DM Mono. Let op: dit is een natekening
op basis van het aangeleverde beeld — vraag voor druk en productie het originele
vectorbestand op.

## Illustraties

De kaarten volgen de stijl van het spel: dikke zwarte contour (4–4,5 px op een
raster van 100), vlakke kleuren, geen verlopen, alles op een gekleurde tegel met
ronde hoeken. Zeven motieven liggen klaar (`#card-ball`, `-trophy`, `-team`,
`-goal`, `-kit`, `-bottle`, `-player`) plus de kaartrug `#card-back`. Het zijn
plaatshouders in de juiste stijl; vervang ze door de echte kaartafbeeldingen.

## Componenten

- **Knop** — pil, 2 px zwarte rand, harde schaduw van 4 px. Primair = oranje.
  Indrukken verplaatst de knop over de schaduw heen: fysiek, als een kaart op tafel.
- **Memorykaart** — 3:4, `rotateY(180deg)` in 420 ms, achterkant in veldgroen.
- **Productkaart** — 1 px rand, geen schaduw in rust, 3 px lift bij hover.
- **Bundelkeuze** — radiogroep als blokken; gekozen blok krijgt oranje rand en vlak.
- **Lade (winkelwagen)** — 420 px, schuift in vanaf rechts, met verzendmeter.

## Beweging

Beweging bevestigt een handeling of vertelt iets over voetbal; ze versiert niet.

- Krijtlijnen van het veld tekenen zichzelf bij het laden van de hero (1,6 s).
- Een bal zweeft naast de kop en draait mee in de koopknop zodra je erover gaat.
- Tussen secties rolt een bal over de zijlijn, één keer, zodra hij in beeld komt.
- Kaarten worden gedeeld met 45 ms verschil en draaien om in 420 ms.
- Confetti bij een gevonden paar en bij toevoegen aan de winkelwagen.
- Cijfers (48 kaarten, 24 paren, het cijfer 9,4) lopen op zodra ze in beeld staan.

Secties komen binnen vanaf een zichtbare ruststand — met JS uit staat alles er
gewoon. Alles zwijgt onder `prefers-reduced-motion: reduce`.

## Toegankelijkheid

- Contrast ≥ 4,5:1 voor tekst; oranje op wit alleen voor grote tekst of met randen.
- Zichtbare focusring (`--sky`, 3 px) op alles wat je kunt bedienen.
- De memorydemo is met toetsenbord te spelen (kaarten zijn `<button>`).
- Lade is `role="dialog"` met Escape-sluiting; statusmeldingen via `aria-live`.
- Eén lichte weergave, ook als het systeem op donker staat: geen halve omkering.
