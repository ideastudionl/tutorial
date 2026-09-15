# Ontwerpsysteem — "Veldlijnen & Oranje"

Nederlands rastersysteem (strakke kolommen, vlakke kleuren, één tactiel accent)
gekruist met de krijtlijnen van een voetbalveld. Speels waar het kind kijkt,
zakelijk waar de ouder beslist.

## Kleur

| Token | Licht | Donker | Gebruik |
|---|---|---|---|
| `--paper` | `#F6F8F1` | `#0C110D` | pagina-ondergrond (neutraal met groenzweem) |
| `--surface` | `#FFFFFF` | `#141C15` | kaarten, panelen |
| `--ink` | `#121A14` | `#ECF2E7` | tekst |
| `--muted` | `#5D6B5C` | `#9FAD9D` | bijschriften |
| `--pitch` | `#0B6B3A` | `#25A163` | merk, vertrouwen, USP's |
| `--flame` | `#FF5A00` | `#FF7A2E` | één rol: kopen (CTA, prijs, actieve keuze) |
| `--lemon` | `#FFC630` | `#FFD25C` | sterren, accentvlak |
| `--sky` | `#2F6BFF` | `#6E97FF` | focusring |

Oranje is gereserveerd voor koopacties. Staat er oranje op het scherm, dan kun je
daar klikken om te bestellen — dat maakt de belangrijkste knop altijd vindbaar.

## Typografie

- **Bricolage Grotesque 700/800** — koppen. Brede, iets eigenwijze grotesque:
  speels genoeg voor kinderen, stevig genoeg voor een prijskaartje.
- **Instrument Sans 400/500/600** — lopende tekst, regels van ± 65 tekens.
- **DM Mono 500** — labels, prijzen, tellers, aftelklok. Cijfers die uitlijnen
  (`font-variant-numeric: tabular-nums`) lezen als productinformatie, niet als marketing.

Schaal: `clamp()` tussen 2,4 en 4,4 rem voor H1, 1,8–2,9 rem voor H2, 1 rem basis.

## Componenten

- **Knop** — pil, 2 px zwarte rand, harde schaduw van 4 px. Primair = oranje.
  Indrukken verplaatst de knop over de schaduw heen: fysiek, als een kaart op tafel.
- **Memorykaart** — 3:4, `rotateY(180deg)` in 420 ms, achterkant in veldgroen.
- **Productkaart** — 1 px rand, geen schaduw in rust, 3 px lift bij hover.
- **Bundelkeuze** — radiogroep als blokken; gekozen blok krijgt oranje rand en vlak.
- **Lade (winkelwagen)** — 420 px, schuift in vanaf rechts, met verzendmeter.

## Beweging

Beweging bevestigt een handeling, ze kondigt niets aan. Kaart omdraaien (420 ms),
lade openen (280 ms), confetti bij een gevonden paar en bij toevoegen aan de wagen.
Secties komen binnen vanaf een zichtbare ruststand — met JS uit staat alles er gewoon.
Alles zwijgt onder `prefers-reduced-motion: reduce`.

## Toegankelijkheid

- Contrast ≥ 4,5:1 voor tekst; oranje op wit alleen voor grote tekst of met randen.
- Zichtbare focusring (`--sky`, 3 px) op alles wat je kunt bedienen.
- De memorydemo is met toetsenbord te spelen (kaarten zijn `<button>`).
- Lade is `role="dialog"` met Escape-sluiting; statusmeldingen via `aria-live`.
- Licht en donker zijn beide ontworpen, geen omkering van kleuren.
