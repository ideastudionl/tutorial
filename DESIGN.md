# Ontwerpverantwoording — Clover

## Het probleem met de meeste uitzendsites

Ze bedienen twee heel verschillende bezoekers met één pagina. Een
werkzoekende wil binnen tien seconden zien of er werk is in zijn buurt;
een opdrachtgever wil weten of dit bureau betrouwbaar is en wat het kost.
Als je die twee door elkaar husselt, verlies je beide.

Daarom staat de splitsing hoog op de homepage ("Ik zoek werk" /
"Ik zoek personeel") en heeft elk pad zijn eigen taal en kleur:
**je** en clovergroen voor werkzoekenden, **u** en staalblauw voor
opdrachtgevers.

## Kleurritme

De pagina wisselt bewust van grond, zodat je al scrollend voelt waar een
onderwerp begint en eindigt — en zodat het geheel niet als één lange witte
lap leest:

| Vlak | Waar |
|---|---|
| Diepgroen met lichtval | Hero van de homepage, cijferblok, CTA, footer |
| Lichtgroene tint `#EFF6F2` | Keuzepaden, kop van de vacaturebank, contact, sectorenoverzicht |
| Zand `#F5F2EC` | Sectoren, diensten, het team |
| Staalblauwe tint `#EEF2F7` | Alles rond opdrachtgevers en de Google-beoordelingen |
| Wit | Vacatures, werkwijze, keurmerken, formulieren |

De acht sectorkaarten staan elk op hun eigen gedempte tint. Dat maakt van
het sectoroverzicht een mozaïek dat kleur brengt zonder bont te worden, en
het is functioneel: dezelfde tint komt terug in de vacaturekaart, het
sectorfilter en de kop van de vacaturepagina.

De donkere vlakken zijn geen platte kleur maar twee zachte radiale
verlopen over `#06231A`, met fijne verticale maatlijnen erover. Dat geeft
diepte zonder dat er een effect op zit.

## Vormtaal: zakelijk, stevig, modern

De site moet vertrouwen wekken bij een operationeel directeur die een
flexpool uitbesteedt, én toegankelijk blijven voor een monteur die op zijn
telefoon een baan zoekt. Dat betekent: geen illustratiefestijn, maar rust,
ritme en bewijs.

- **Hairlines in plaats van slagschaduwen.** Kaarten hebben een randje van
  één pixel en lichten bij hover subtiel op. Geen offset-schaduwen, geen
  stickerlook — die leest als consumentenapp, niet als dienstverlener.
- **Kleine radii (3–8px).** Strak, softwarematig, volwassen. Pillen zijn
  gereserveerd voor het klein grut.
- **Het product als beeld.** In plaats van decoratieve illustraties laat de
  hero zien wat de site kán: de vacaturebank in het klein, en op de
  werkgeverspagina een aanvraag met drie voorgedragen kandidaten. Dat is
  overtuigender dan welke stockfoto ook, en het is eerlijk — het bestaat echt.
- **Eén signaalkleur.** Terracotta (`#A8401C`) alleen voor spoed. Alles wat
  altijd opvalt, valt nergens meer op.

## Kleur

Diep en verzadigd in plaats van fel. Het groen is een tint donkerder dan de
voor de hand liggende keuze, zodat witte tekst erop leesbaar is en het naast
een cao-tabel niet uit de toon valt.

| Rol | Waarde | Waarom |
|---|---|---|
| Clovergroen | `#1B7F58` | Merkkleur en het pad van de werkzoekende. Draagt witte tekst op knopformaat. |
| Diepgroen | `#06231A` | Donkere vlakken: solliciteerkaart, CTA-blok, footer. |
| Staalblauw | `#24466B` | Het opdrachtgeverspad. Zakelijk, rustig, duidelijk ánders dan groen. |
| Terracotta | `#A8401C` | Uitsluitend spoed en urgentie. |
| Inkt | `#101614` | Geen puur zwart maar een groenzwart, zodat tekst bij het merk hoort. |
| Neutralen | `#F7F8F7` → `#E2E5E3` | Licht groen gebogen grijzen, zodat niets koud oogt. |

Elke sector heeft een eigen, gedempt accent (leisteen, umber, grafiet,
pruim, olijf, indigo, teal). Dat is niet decoratief: de gekleurde streep aan
de linkerkant van een vacaturekaart vertelt je zonder lezen in welke sector
je zit.

## Typografie

- **Archivo** voor koppen. Een stevige grotesk met een variabele breedte-as;
  koppen staan op 105% breedte, waardoor ze steviger op de pagina liggen
  zonder zwaarder te worden. Zakelijk, hedendaags, zonder trucjes.
- **IBM Plex Sans** voor lopende tekst. Technisch van oorsprong, helder op
  kleine schermen, en het past bij een bureau dat monteurs, operators en
  werkvoorbereiders plaatst.
- **Tabulaire cijfers** overal waar getallen onder elkaar staan: uurlonen,
  aantallen, beoordelingen.

## Google-beoordelingen

Sociale bewijskracht moet van buiten komen, anders is het marketing. Daarom
staan de Google-reviews op drie plekken, oplopend in detail:

1. **Een badge in beide hero's** — score, sterren en het aantal reviews,
   direct naast de belangrijkste knop.
2. **Een scorepaneel** met de verdeling van 5 naar 1 ster. Die verdeling
   tonen is een vertrouwenssignaal op zich: wie alleen een gemiddelde laat
   zien, lijkt iets te verbergen.
3. **De reviews zelf**, met naam, rol, sterren, datum en het Google-logo —
   herkenbaar als een echte review en niet als een uitgezocht citaat.

In productie komen score, aantal en reviews live binnen via de Google Places
API (`Place Details` → `rating`, `user_ratings_total`, `reviews`). De
waarden in `data.js` zijn voorbeelddata met exact die structuur.

## De vacaturebank

Gemodelleerd naar wat mensen echt filteren, in deze volgorde:

1. **Trefwoord en plaats** bovenaan — dat is wat de meesten als eerste doen.
2. **Sector**, met live tellingen achter elke optie, zodat je niet in een
   leeg resultaat klikt.
3. **Dienstverband en contractvorm** — het verschil tussen uitzenden en
   werving & selectie is voor de kandidaat het verschil tussen flexibel en
   vast. Dat is een filter, geen voetnoot.
4. **Opleidingsniveau**, inclusief de expliciete optie *Geen diploma nodig*.
   Voor logistiek, productie en schoonmaak is dat het belangrijkste filter
   dat er is, en de meeste sites verstoppen het.
5. **Uurloon** als schuif. Bruto per uur, want dat is de eenheid waarin
   uitzendkrachten denken — niet bruto per maand.

Drie keuzes die de bank praktisch beter maken:

- **Filters staan in de URL.** Een gefilterde lijst is een link die je kunt
  appen of in een advertentie kunt zetten.
- **Solliciteren kan zonder cv.** Naam en telefoonnummer zijn genoeg. Elke
  extra verplichte stap kost sollicitaties, en Clover belt toch.
- **WhatsApp staat overal naast de sollicitatieknop.** Voor een groot deel
  van deze doelgroep is dat het natuurlijke kanaal.

## Beweging

Animatie is functioneel, niet decoratief: secties komen binnen als ze in
beeld schuiven, cijfers tellen op, de sterverdeling loopt vol, kaarten
lichten op bij hover. De amplitudes zijn klein — 6 pixels, geen 14 — want
wat zweeft leest als speels, wat ademt leest als verzorgd. Alles staat uit
onder `prefers-reduced-motion: reduce`.

## Vertrouwen

Voor een uitzendbureau is dit geen sfeerelement maar het verkoopargument.
Keurmerken (ABU, SNA/NEN 4400-1, VCU) staan niet weggestopt in de footer
maar als eigen blok op de homepage en op de werkgeverspagina; de
inlenersbeloning staat expliciet bij elke vacature; en elke vacature heeft
een intercedent met naam en doorkiesnummer. Geen algemene inbox.

## Portretfotografie

De monogrammen (initialen in een merktint) zijn bewuste plaatsvervangers,
geen eindresultaat. Het zijn cirkels van 44 px die zich één-op-één laten
vervangen door een `<img>`: zie `monogram()` in `assets/js/icons.js`. Echte
foto's van echte medewerkers op de werkvloer maken dit merk aanzienlijk
sterker — dat is de belangrijkste investering na deze demo.
