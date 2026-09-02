# Interflex Stuc — nieuwe website

Custom WordPress-thema voor [interflexstuc.nl](https://interflexstuc.nl/): een stukadoors- en
afbouwbedrijf in Amsterdam. Het thema staat in [`interflexstuc/`](interflexstuc/).

De opzet is **offerte-eerst**, geïnspireerd op [stukadoorsclub.nl](https://stukadoorsclub.nl/):
de bezoeker kan binnen drie minuten een aanvraag doen, en elke pagina leidt daarnaartoe.

## Wat er in zit

**Meerstaps offerte-wizard** — zes vragen plus een samenvatting, met voortgangsbalk,
validatie per stap, automatisch doorspringen bij een enkelvoudige keuze en verzending
via AJAX. Elke aanvraag wordt als privébericht in WordPress bewaard (menu
*Offerteaanvragen*) én per e-mail verstuurd, met een bevestigingsmail naar de klant.
Beveiligd met een nonce, een honeypot-veld en een snelheidsbegrenzing per IP-adres.

**Contenttypes** — Diensten, Projecten, Werkgebieden, Reviews en Veelgestelde vragen,
elk met eigen invulvelden in de beheeromgeving.

**SEO-landingspagina's per plaats** — `/stukadoor/amsterdam/`, `/stukadoor/haarlem/`,
enzovoort. Twaalf plaatsen staan klaar, elk met eigen tekst, wijken, reistijd, diensten,
reviews en een eigen offerteformulier.

**Vindbaarheid** — JSON-LD voor `HomeAndConstructionBusiness` (adres, openingstijden,
werkgebied, beoordelingen, dienstencatalogus), `FAQPage` en `BreadcrumbList`, plus
meta-description en Open Graph-tags.

**Huisstijl** — de kleuren uit het stijlbord (#0d4ead blauw, #f15a24 oranje) en
Ubuntu als huisletter zijn als CSS-tokens vastgelegd in `assets/css/main.css` en als
palet in `theme.json`, zodat ze ook in de blokeditor beschikbaar zijn. Blauw draagt de
structuur (labels, iconen, links, selectie), oranje is voorbehouden aan acties
(knoppen, voortgang, accenten op donkere vlakken). Het logo staat als SVG in
`assets/img/logo.svg`, uit het stijlbord overgenomen; op donkere vlakken schakelt het
naar de witte variant. Upload je in WordPress een eigen logo, dan gaat dat altijd voor.

**Beheerbaar zonder code** — telefoonnummer, adres, openingstijden, KvK, beoordelingscijfers,
reactietermijn en de herotekst staan in de WordPress Customizer.

**Toegankelijkheid** — skip-link, zichtbare focusstijlen, `aria-live` op het resultaat van
de wizard, correcte labels en `role="progressbar"`, en respect voor
`prefers-reduced-motion`.

## Installeren

1. Zip de map `interflexstuc/` (de map zelf, niet de inhoud).
2. WordPress → **Weergave → Thema's → Nieuw toevoegen → Thema uploaden**.
3. Activeer het thema.

Bij activatie vult het thema de site eenmalig met startcontent: zes diensten, twaalf
werkgebieden, acht veelgestelde vragen, zes voorbeeldreviews, de pagina's (home, offerte,
over ons, werkwijze, prijzen, contact, privacy, voorwaarden) en de navigatiemenu's. De
homepage en permalinkstructuur worden meteen goed gezet.

> De seed draait alleen als de optie `ifs_seeded` nog niet bestaat, dus je verliest nooit
> eigen content bij een heractivatie.

## Na installatie instellen

**Weergave → Customizer:**

- *Bedrijfsgegevens* — telefoon, WhatsApp, e-mail, adres, openingstijden, KvK- en BTW-nummer.
- *Offerteaanvraag* — het e-mailadres waar aanvragen naartoe gaan.
- *Cijfers & beoordelingen* — vervang de voorbeeldwaarden (9,4 uit 87 beoordelingen) door
  je echte cijfers. Ze staan ook in de structured data, dus ze moeten kloppen.

**Verder:**

- Vervang de zes voorbeeldreviews door echte klantbeoordelingen.
- Voeg projecten met foto's toe; zonder uitgelichte afbeelding tonen de kaarten een
  neutrale placeholder.
- Vul de privacyverklaring en algemene voorwaarden aan met je bedrijfsgegevens.
- Controleer de richtprijzen op de pagina *Prijzen* en bij elke dienst.

## E-mailbezorging

Het thema gebruikt `wp_mail()`. Op veel hostings komt dat in de spammap terecht. Installeer
daarom een SMTP-plugin (WP Mail SMTP of vergelijkbaar) en verstuur via een geverifieerd
domein. De afzender is `no-reply@<jouwdomein>`, met de klant als `Reply-To`, zodat je direct
kunt antwoorden.

Aanvragen worden altijd óók in WordPress opgeslagen, dus een mislukte e-mail betekent geen
verloren aanvraag.

## Aandachtspunt bij paginacaching

Draai je een cacheplugin, sluit dan `admin-ajax.php` uit van caching. Bij zeer agressieve
full-page caching kan de nonce in het offerteformulier verlopen (na 24 uur); zet de
offertepagina in dat geval op de uitzonderingenlijst.

## Ontwikkelen

Er is geen buildstap: CSS en JavaScript zijn platte bestanden.

```
interflexstuc/
├── functions.php
├── theme.json               # kleuren/typografie voor de blokeditor
├── inc/
│   ├── setup.php            # themaondersteuning, menu's, widgets
│   ├── enqueue.php          # assets en scriptvariabelen
│   ├── post-types.php       # contenttypes en invulvelden
│   ├── customizer.php       # bedrijfsgegevens en teksten
│   ├── template-tags.php    # kaarten, kruimelpad, FAQ, paginatie
│   ├── icons.php            # inline SVG-set (geen iconfont)
│   ├── schema.php           # structured data en meta-tags
│   ├── offerte.php          # wizardstappen, validatie, opslag, e-mail
│   └── seed-content.php     # startcontent bij activatie
├── template-parts/
│   ├── quote-form.php       # de wizard
│   └── cta.php
└── assets/
    ├── css/main.css         # huisstijltokens + alle opmaak
    ├── js/                  # menu en offerte-wizard
    └── img/logo.svg         # logo uit het stijlbord
```

De vragen en antwoordopties van de wizard staan in `ifs_quote_steps()` in
`inc/offerte.php`. Ze zijn ook van buitenaf aan te passen via het filter `ifs_quote_steps`,
zodat je het thema zelf niet hoeft te wijzigen.

## Getest

Alle twaalf sjablonen zijn gerenderd tegen een WordPress-stub zonder PHP-fouten of
waarschuwingen, en de wizard is in Chromium volledig doorlopen (meervoudige keuze,
doorspringen, veldvalidatie, samenvatting) zonder JavaScript-fouten. Een volledige
WordPress-installatie kon in deze omgeving niet worden gedraaid, dus test de e-mailbezorging
en de permalinks nog op een staging-omgeving voordat de site live gaat.
