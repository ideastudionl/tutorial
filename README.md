# Offerte configurator — Fortis Kozijnen

Een online configurator waarmee bezoekers zelf een kozijn samenstellen, direct een
prijsindicatie zien en met één klik een vrijblijvende offerte aanvragen.

Geschreven in gewone HTML, CSS en JavaScript: **geen framework, geen bouwstap en geen
externe bibliotheken**. Het geheel bestaat uit statische bestanden plus één klein
PHP-bestand dat de aanvragen in ontvangst neemt.

---

## De stappen

| # | Stap | Wat de bezoeker kiest |
|---|------|------------------------|
| 1 | Materiaal | Kunststof of aluminium (hout staat klaar, maar uit) |
| 2 | Kozijnmaat | Breedte en hoogte in mm, met schuifregelaar |
| 3 | Profiel | Profielserie per materiaal, met isolatiewaarde en max. vakbreedte |
| 4 | Vakverdeling | 1 tot 5 vakken, breedte per vak, optioneel bovenlicht |
| 5 | Vast glas of te openen | Per vak: vast glas, draaikiep, draairaam, valraam, deur, schuifdeel of dicht paneel |
| 6 | Muuraansluiting | Aanslagprofiel, afdekprofiel, neuslat + soort muur |
| 7 | Kleur kozijn en muur-RAL | RAL-kleur binnen, buiten en voor de aansluitprofielen |
| 8 | Soort beglazing | HR++, triple, geluidwerend, veiligheid, figuur, zonwerend |
| 9 | Ventilatieroosters | Geen, zelfregelend, geluiddempend of vochtgestuurd |
| 10 | Inzethorren | Inzethor, plisséhor of rolhor, aantal beperkt tot het aantal te openen delen |
| 11 | Montage en toebehoren | Montage, demontage oude kozijn, dorpel, SKG***, roedes, rolluik, ... |
| 12 | Offerte | Overzicht van alle kozijnen, staffelkorting, btw en het aanvraagformulier |

Terwijl de bezoeker kiest, tekent de configurator het kozijn live mee: vakverdeling,
draairichting, ventilatierooster, horgaas, muuraansluiting in de gekozen RAL-kleur en
de maatvoering in millimeters.

Verder:

* meerdere kozijnen in één offerte, elk met een eigen aantal;
* automatische staffelkorting vanaf 3, 5 en 8 stuks;
* technische waarschuwingen (bijvoorbeeld triple glas in een te ondiep profiel of een
  vak dat breder is dan het profiel toelaat);
* de offerte is af te drukken of op te slaan als pdf;
* de configuratie blijft in de browser bewaard, dus een bezoeker die terugkomt is niets kwijt;
* werkt op telefoon, tablet en desktop; op de telefoon staat de prijs in een vaste balk onderin.

---

## Op de website plaatsen

### Manier 1 — insluiten (aanbevolen)

Zet de map `configurator/` op de webserver en plaats op de gewenste pagina:

```html
<div id="fortis-configurator"></div>
<script src="https://www.fortiskozijnen.nl/configurator/embed.js"
        data-doel="#fortis-configurator"></script>
```

In WordPress: blok **Aangepaste HTML**. De configurator komt in een iframe te staan en
groeit automatisch mee met de inhoud, dus er ontstaat geen tweede scrollbalk.

### Manier 2 — rechtstreeks in de pagina

Wilt u de configurator in het thema van de site opnemen (zelfde lettertype, zelfde
breedte), laad dan de bestanden zelf:

```html
<link rel="stylesheet" href="/configurator/assets/css/configurator.css">

<div id="fortis-configurator"></div>

<script src="/configurator/assets/js/catalog.js"></script>
<script src="/configurator/assets/js/pricing.js"></script>
<script src="/configurator/assets/js/preview.js"></script>
<script src="/configurator/assets/js/app.js"></script>
```

De volgorde van de vier scripts is belangrijk.

---

## Prijzen en opties aanpassen

Alles staat in **`configurator/assets/js/catalog.js`**. Dat is het enige bestand dat u
hoeft te openen om de configurator te laten kloppen met de eigen calculatie:

```js
materials: [
  { id: 'kunststof', label: 'Kunststof', basisPrijsM2: 295, ... }
]
```

In dat bestand regelt u onder meer:

| Wat | Waar |
|-----|------|
| Materialen en hun prijs per m² | `materials` |
| Profielen per materiaal | `materials[].profielen` |
| Toeslag per soort vak (draaikiep, deur, schuifdeel) | `vakInvullingen[].factor` |
| Glassoorten en hun prijs per m² | `glazing` |
| RAL-kleuren en hun toeslagpercentage | `colors` |
| Muuraansluitingen (prijs per m1) | `muuraansluitingen` |
| Roosters, horren en toebehoren | `roosters`, `horren`, `options` |
| Montage, demontage en eenmalige diensten | `services` |
| Btw, minimumprijzen, maatgrenzen en staffelkorting | `settings` |
| Bedrijfsgegevens en ontvangstadres | `company` |

Wordt er ook hout aangeboden? Zet dan bij `materials` de regel `actief: false` om naar
`true`; het materiaal verschijnt dan meteen in stap 1.

**De bedragen in het bestand zijn realistische richtprijzen als startpunt, geen
tarieven van Fortis Kozijnen. Vervang ze door de eigen verkoopprijzen voordat de
configurator live gaat.**

### Huisstijl

De kleuren staan bovenaan `configurator/assets/css/configurator.css`:

```css
:root {
  --fk-primair: #123a5c;   /* koppen en knoppen */
  --fk-accent:  #d97706;   /* prijzen en de hoofdknop */
}
```

### Volgorde van de stappen

Onderaan `configurator/assets/js/app.js` staat de lijst `STAPPEN`. Door regels te
verplaatsen verandert de volgorde; door een regel weg te halen vervalt een stap.

---

## De offerteaanvraag ontvangen

`server/offerte.php` neemt de aanvraag in ontvangst, bewaart hem als JSON en mailt hem
naar het bedrijf. De aanvrager krijgt een bevestiging met dezelfde samenvatting.

1. Zet `server/offerte.php` op de webserver (PHP 7.4 of nieuwer).
2. Pas bovenin het bestand `$CONFIG` aan: ontvanger, afzender en toegestane domeinen.
   Gebruik als afzender een adres op het eigen domein, anders wordt de mail als spam gezien.
3. Zet het pad naar dit bestand in `catalog.js` bij `settings.endpoint`.

Het bestand controleert het domein van de aanvraag, begrenst de omvang van het bericht,
houdt het aantal aanvragen per IP-adres per uur bij en filtert regeleindes uit de
mailheaders. De aanvragen komen in `server/aanvragen/` te staan; die map wordt afgeschermd
met een `.htaccess` en hoort niet in versiebeheer thuis.

Laat `settings.endpoint` leeg als er (nog) geen server beschikbaar is. De bezoeker krijgt
dan de printbare offerte en de knop "Configuratie mailen naar mijzelf", die de samenvatting
in het e-mailprogramma zet.

Wie liever met een ander systeem werkt (CRM, Make, Zapier, een eigen API): het formulier
verstuurt een gewone JSON-POST met daarin de klantgegevens, alle elementen, de volledige
prijsopbouw per element en de totalen. Elk endpoint dat JSON accepteert, kan die ontvangen.

---

## Mappen

```
index.html                              installatievoorbeeld met uitleg
configurator/
  index.html                            de configurator als losse pagina
  embed.js                              plaatst de configurator op elke website
  assets/css/configurator.css           opmaak en huisstijl
  assets/js/catalog.js                  producten, opties en prijzen  <- hier aanpassen
  assets/js/pricing.js                  prijsberekening
  assets/js/preview.js                  live tekening (SVG)
  assets/js/app.js                      stappen, interface en offerteaanvraag
server/offerte.php                      ontvangt en mailt de aanvraag
```

---

## Lokaal bekijken

```bash
npx http-server -p 8080 .
# open http://localhost:8080/configurator/index.html
```

Voor het testen van het aanvraagformulier is PHP nodig:

```bash
php -S localhost:8080 -t .
```

Zet in dat geval `toegestaneHosts` in `server/offerte.php` tijdelijk op `[]`, anders
weigert het script aanvragen van `localhost`.
