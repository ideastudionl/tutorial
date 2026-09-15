# Ontwerpverantwoording — Clover

## Het probleem met de meeste uitzendsites

Ze bedienen twee heel verschillende bezoekers met één pagina. Een
werkzoekende wil binnen tien seconden zien of er werk is in zijn buurt;
een opdrachtgever wil weten of dit bureau betrouwbaar is en wat het kost.
Als je die twee door elkaar husselt, verlies je beide.

Daarom staat de splitsing hier hoog op de homepage ("Ik zoek werk" /
"Ik zoek personeel") en heeft elk pad zijn eigen taal: **je** voor
werkzoekenden, **u** voor opdrachtgevers.

## Vormtaal: speels, maar zakelijk

De briefing vroeg om Dutch Design. Dat is hier vertaald naar:

- **Vlakken en raster.** De hero is een raster van vier panelen met een
  harde inktrand — geen zwevende collage, maar een compositie die ergens op
  staat. Dat leest als ordelijk en Nederlands, en het geeft echte
  fotografie later een duidelijke plek.
- **Harde slagschaduw in plaats van zachte blur.** Knoppen en kaarten
  krijgen een offset in inkt (`3px 3px 0`). Dat is drukwerk-logica, geen
  material design, en het houdt de interface zakelijk terwijl het speels
  aanvoelt bij hover.
- **Primaire kleurvlakken.** Groen (het merk), oranje, geel en blauw.
  Elke sector heeft zijn eigen accent, wat in de vacaturebank meteen
  functioneel wordt: de gekleurde balk aan de linkerkant van een
  vacaturekaart vertelt je zonder lezen in welke sector je zit.
- **Ronde hoeken, geen scherpe.** Een uitzendbureau gaat over mensen. De
  geometrie mag bot zijn, de hoeken niet.

## Kleur

| Rol | Waarde | Waarom |
|---|---|---|
| Clover groen | `#12A15A` | Klaver, geluk, groei. Donker genoeg voor witte tekst (contrast 3.6:1 op tekstgrootte 18px+, knoppen hebben bovendien een inktrand). |
| Inkt | `#0C1410` | Geen puur zwart — een groenzwart dat bij het merk hoort. |
| Papier | `#FAF8F2` | Warm wit. Zuiver wit maakt een zakelijke site koud. |
| Geel | `#FFC93F` | Markeerstift-accent en de "solliciteer"-knop: het meest opvallende element op de detailpagina. |
| Oranje | `#FF5A1F` | Urgentie: nieuw, spoed, bouw. |
| Blauw | `#2B4FFF` | Het opdrachtgeverspad. Rustiger en zakelijker dan het groen van de werkzoekende.  |

## Typografie

- **Bricolage Grotesque** voor koppen. Variabele grotesk met een eigen,
  licht eigenwijs karakter — precies de "speels maar zakelijk" die gevraagd
  werd. Strak gespatieerd (`-.03em`) zodat grote koppen als blok lezen.
- **Instrument Sans** voor lopende tekst. Neutraal, open en goed leesbaar
  op kleine schermen — waar het grootste deel van het vacatureverkeer
  vandaan komt.

## De vacaturebank

Gemodelleerd naar wat mensen echt filteren, in deze volgorde:

1. **Trefwoord en plaats** bovenaan — dat is wat 80% als eerste doet.
2. **Sector**, met live tellingen achter elke optie, zodat je niet in een
   leeg resultaat klikt.
3. **Dienstverband en contractvorm** — het verschil tussen uitzenden en
   werving & selectie is voor de kandidaat het verschil tussen flexibel en
   vast, dus dat is een filter en geen voetnoot.
4. **Opleidingsniveau**, inclusief de expliciete optie *Geen diploma nodig*.
   Voor logistiek, productie en schoonmaak is dat het belangrijkste filter
   dat er is, en de meeste sites verstoppen het.
5. **Uurloon** als schuif. Bruto per uur, want dat is de eenheid waarin
   uitzendkrachten denken — niet bruto per maand.

Drie keuzes die de bank praktisch beter maken:

- **Filters staan in de URL.** Een gefilterde lijst is een link die je kunt
  appen naar een vriend of in een advertentie kunt zetten.
- **Solliciteren kan zonder cv.** Naam en telefoonnummer zijn genoeg. Elke
  extra verplichte stap kost sollicitaties, en Clover belt toch.
- **WhatsApp staat overal naast de sollicitatieknop.** Voor een groot deel
  van deze doelgroep is dat het natuurlijke kanaal.

## Beweging

Animatie is hier functioneel, niet decoratief: elementen komen binnen als
ze in beeld schuiven, cijfers tellen op, kaarten lichten op bij hover, de
sectorband loopt door als teken dat er meer is. Alles is uitgeschakeld
onder `prefers-reduced-motion: reduce` — inclusief de lopende band, die
anders onbruikbaar is voor wie last heeft van beweging.

## Vertrouwen

Voor een uitzendbureau is dit geen sfeerelement maar het verkoopargument.
Daarom staan keurmerken (ABU, SNA/NEN 4400-1, VCU) niet weggestopt in de
footer maar als eigen blok op de homepage en op de werkgeverspagina, staat
de inlenersbeloning expliciet bij elke vacature, en heeft elke vacature een
intercedent met naam, gezicht en doorkiesnummer. Geen algemene inbox.
