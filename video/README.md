# Interflex Stuc — beeld en video

Remotion-project dat twee dingen maakt uit dezelfde huisstijl en dezelfde
gegevens als de site:

1. **Deelafbeeldingen** (`og:image`) — één per pagina, in `site/public/og/`.
   Dit is wat mensen zien als een pagina in WhatsApp, LinkedIn of Facebook
   wordt gedeeld. Zonder deze afbeeldingen toont zo'n bericht alleen een
   kale tekstregel.
2. **Marketingvideo's** — een uitlegvideo (16:9) en een verticale post voor
   Reels en TikTok (9:16), in `video/out/`.

De teksten, prijzen en plaatsen komen rechtstreeks uit `site/src/data/`.
Verandert daar een tarief, dan verandert het beeld mee zodra je opnieuw
rendert — ze kunnen dus niet uit de pas lopen met de pagina's.

## Gebruik

```bash
cd video
npm install

npm run og       # deelafbeeldingen -> site/public/og/ + site/src/data/og.ts
npm run video    # video's -> video/out/
npm run studio   # visuele editor in de browser
```

Draai `npm run og` opnieuw na elke wijziging in `site/src/data/` en commit
het resultaat: de site is statisch en gebruikt de afbeeldingen zoals ze in
de repository staan.

## Chrome

Remotion wil standaard zijn eigen Chrome downloaden. Waar dat niet mag
(zoals in een afgeschermde omgeving of CI), wijs je hem naar een bestaande
Chrome Headless Shell:

```bash
export REMOTION_BROWSER_EXECUTABLE=/pad/naar/headless_shell
```

Let op: het moet de *headless shell* zijn. Een gewone Chrome-binary weigert
te starten met de melding "Old Headless mode has been removed".

## Lettertypes

`public/fonts/` bevat dezelfde Archivo en Source Sans 3 als de site. Ze
worden via `src/fonts.ts` geladen vóór het eerste frame; zonder die stap
valt Remotion terug op een systeemfont en klopt de uitlijning niet.
