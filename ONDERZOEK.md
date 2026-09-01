# Marktonderzoek & CRO-analyse — tegelwebshops NL
### Basis voor de webshop van Tegelloods BV · september 2026

> **Verantwoording bron & methode.** De sessie waarin dit onderzoek is uitgevoerd
> kan de genoemde websites niet rechtstreeks ophalen (egress-proxy blokkeert
> `throne.nl`, `toptegels.nl`, `tegeloutletnederland.nl`, `rbtegels.nl`,
> `seramika.nl`, `tegelpaleis.nl`, `saniweb.nl` en `tegelloodsbv.nl`). Alles wat
> hieronder als **feit** staat is afkomstig uit doorzoekbare, publiek
> geïndexeerde pagina's van die shops (verzendpagina's, FAQ's, over-ons,
> categoriepagina's) — de bronnen staan onderaan. Wat een **interpretatie** of
> **aanbeveling** is, staat expliciet als zodanig gemarkeerd. Prijzen en
> voorwaarden zijn momentopnames en moeten vóór livegang opnieuw gecheckt worden.

---

## 1. Conclusie in zes regels

1. De Nederlandse tegelmarkt online wordt gedomineerd door **volume en prijs**:
   60.000 m² voorraad, "laagste prijs", "vandaag besteld, morgen geleverd".
2. Op die as kan Tegelloods BV **niet winnen** — en dat hoeft ook niet.
3. Wat élke grote speler wél doet en waar de conversie zit: **gratis stalen,
   een m²-rekenmodule, duidelijke levertijd, een fysieke showroom als bewijs**.
4. Tegelloods BV heeft precies het schaarse goed dat de outlets missen:
   **15+ jaar vakkennis, een curatie in plaats van een catalogus, en een
   showroom op afspraak**.
5. De webshop moet dus niet de zesde tegeloutlet worden, maar
   **"de vakman die ook online verkoopt"**: minder SKU's, meer zekerheid.
6. De demo in `/demo` is die positionering, doorvertaald naar een Shopify-ready
   ontwerp met rekenmodule, samplebox en showroomboeking als kern.

---

## 2. Het speelveld: drie archetypen

| Archetype | Wie | Belofte | Zwakte die ruimte laat |
|---|---|---|---|
| **Voorraad-volumespeler** | Toptegels, RB Tegels, Tegelpaleis | "Alles op voorraad, morgen in huis" | Geen advies; klant moet zelf alles weten |
| **Prijs-/outletvechter** | Tegeloutlet Nederland, Throne | "Laagste prijs van NL/BE" | Vertrouwen; klant twijfelt over kwaliteit en nazorg |
| **Sanitair-allrounder** | Saniweb | "Alles voor de badkamer in één order" | Tegels zijn bijzaak; ondiepe tegelkennis |

**Interpretatie:** alle drie de archetypen laten dezelfde klant achter: iemand die
één badkamer of woonkamer doet, dat één keer in de vijftien jaar meemaakt, en
vooral bang is om een **verkeerde of te krappe** bestelling te doen. Dát is de
klant van Tegelloods BV.

---

## 3. Wat de concurrenten aantoonbaar doen

### throne.nl — Den Haag
- 7.000 m² showroom, De Werf 40, Den Haag; "grootste showroom in de regio".
- Positionering expliciet op prijs: **exclusief importeur** van merken als
  Çamsan en Floorpan, "rechtstreeks van de fabriek", **95% op voorraad**.
- Breed: tegels **én** laminaat **én** pvc — de showroom is de hoofdmotor,
  de webshop (Shopify) is de etalage.
- Trustpilot-profiel bestaat maar is dun (4 sterren, ~7 reviews); Trustoo
  toont 9,4 als tegelzetter.
- **Les:** een grote showroom is verkoopargument nr. 1, ook online. Zij zetten
  hem alleen in als *"kom kijken"*, niet als *"wij leggen het voor je klaar"*.

### toptegels.nl — Bergambacht
De best gedocumenteerde CRO-machine van het rijtje:
- **60.000 m² voorraad**, >95% direct leverbaar, **1-3 werkdagen** in NL.
- **Samplebox: max. 4 artikelen, stalen van 20×20 cm**, thuisbezorgd.
- **Verzendkosten: gratis boven € 200 incl. btw; daaronder € 29,95** (m.u.v.
  de Waddeneilanden).
- Speciale bestellingen expliciet gecommuniceerd op **3-4 weken** — verwachting
  managen in plaats van verstoppen.
- Op de PDP staat **"aantal m² per doos"** onder de details.
- Categorie-titels dragen de USP: *"Wandtegels kopen | 1.000+ stijlen ·
  levering 1-3 dagen"*.
- **Les:** dit is de blauwdruk. Vier variabelen — voorraad, levertijd,
  verzendgrens, stalen — worden op élke pagina herhaald.

### tegeloutletnederland.nl — Hoofddorp
- **Laagste prijsgarantie** als hoofdclaim.
- **Gratis bezorging boven € 499,95; daaronder € 49,95.** Levertijd 2-5 werkdagen.
- **Afhalen bij het servicepunt in Hoofddorp = geen verzendkosten.**
- **Les:** de hoge gratis-verzendgrens (€ 499,95) is een bewuste
  ordergrootte-hefboom; afhalen is de veiligheidsklep voor kleine orders.

### rbtegels.nl — Tiel
- Claim: **"de grootste tegelwinkel van Nederland"**, showroom in Tiel.
- Instapprijzen prominent: **vanaf € 17/m²** voor badkamer, keuken, woonkamer, toilet.
- **Les:** één scherp instapbedrag in de titel doet meer voor de klik dan een
  hele prijstabel.

### tegelpaleis.nl — IJsselstein
- **"Vandaag besteld = morgen geleverd."**
- Kwaliteitsgarantie is de tweede claim: **uitsluitend hardheid 5, A-klasse,
  1e sortering**; ruim 100 tegelmerken uit DE, FR, IT, NL, PL, PT, ES, CZ, TR.
- Onderdeel van Vloerenman (sinds 1999) — dus zelf ook legger.
- Aparte **zakelijke ingang** voor professionals.
- **Les:** "1e sortering" is in deze markt een échte trustclaim, want de
  outlets verkopen ook restpartijen. Tegelloods kan die claim één-op-één voeren.

### seramika.nl
Geen betrouwbaar geïndexeerde informatie gevonden binnen deze sessie.
Niet meegewogen in de analyse.

### saniweb.nl/tegels.html
- **"Kies je bezorgdag"** als hoofd-CTA in de paginatitel — bezorgregie als USP.
- Gratis bezorging vanaf € 50, maar **voor tegels € 49 toeslag onder € 150**;
  voorraadtegels in 2-3 dagen.
- **Afhalen in Waalwijk**, ma-vr 10:00-16:00.
- Uitgebreide **adviescontent**, waaronder een eigen pagina *"Hoeveel tegels heb
  ik nodig?"*.
- **Les:** tegels zijn logistiek zwaar en duur; iedere serieuze speler heeft een
  aparte, afwijkende verzendregel voor tegels. Verstop dat niet in de footer.

### De rekenmodule is marktstandaard
WDtegels, Tegels in Huis, Tegelking, De Tegelsite, TegelEend en Saniweb hebben
allemaal een tegelcalculator. De rekenregel is overal dezelfde:

```
benodigd m²  = oppervlakte × (1 + snijverlies)
aantal dozen = ceil(benodigd m² ÷ m² per doos)
```

met **~10% snijverlies** als norm (meer bij visgraat/diagonaal). Wie hem
alleen op een losse adviespagina zet, laat conversie liggen: hij hoort op de
**productpagina**, naast de koopknop.

---

## 4. Doelgroep & koopintentie

### Vier koperstypen (in volgorde van omzetwaarde voor Tegelloods)

| # | Wie | Aandeel* | Koopintentie | Wat ze tegenhoudt |
|---|---|---|---|---|
| 1 | **De verbouwer** — 35-55, koopwoning, badkamer of woonkeuken | ~50% | Hoog maar traag: 4-10 weken oriëntatie | "Kies ik straks een vloer waar ik spijt van heb?" |
| 2 | **De klusser** — doet het zelf, weet wat R10 is | ~20% | Hoog en snel | Hoeveelheid, lijmkeuze, levertijd |
| 3 | **De tegelzetter/aannemer** — koopt namens klant, herhaalaankoop | ~20% | Zeer hoog, prijsgedreven | Marge, staffel, betaaltermijn, afhaalgemak |
| 4 | **De oriënterende dromer** — Pinterest-fase, nog geen datum | ~10% | Laag | Nog niets; alleen e-mail waard |

\* *Inschatting op basis van het assortiment en de regio, niet gemeten. Valideer
na 3 maanden met analytics.*

### De echte koopmoment-blokkades (in deze volgorde)
1. **Kleurangst.** Een scherm liegt. → **Gratis stalen + showroom.**
2. **Hoeveelheidsangst.** Te weinig = nabestellen uit een andere partij, met
   kleurverschil. Te veel = weggegooid geld. → **Rekenmodule met snijverlies
   en zichtbare retourregel op restdozen.**
3. **Legangst.** "Kan dit op mijn vloerverwarming? Welke lijm?" →
   **Specificaties + automatische lijm-/voegberekening.**
4. **Levertijdangst.** De tegelzetter staat over drie weken ingepland. →
   **Levertijd per product, niet per shop.**
5. **Prijsangst.** Pas als 1-4 weg zijn. → **Totaalprijs incl. btw, direct zichtbaar.**

**Kernpunt:** vier van de vijf blokkades zijn *zekerheids*problemen, geen
prijsproblemen. Daar zit het gat in de markt voor een specialist.

---

## 5. CRO-checklist: wat elke goede tegelwebshop doet

**Op elke pagina**
- [x] USP-balk bovenaan met 3-4 harde beloftes (stalen, levertijd, verzendgrens, afhalen)
- [x] Reviewscore met bron ("4,9 op Google") in de header
- [x] Telefoonnummer klikbaar — tegels blijven een beladvies-product
- [x] Sticky WhatsApp- en afspraakknop (zie § 6)

**Op de categoriepagina (PLP)**
- [x] Filters op look, ruimte, prijs per m², beschikbaarheid
- [x] Prijs **per m²** groot, van-prijs doorgestreept, badge met kortingspercentage
- [x] Voorraadlabel per product ("Op voorraad" / "Op bestelling")
- [x] "Gratis staal"-knop direct op de kaart — micro-conversie zonder doorklik

**Op de productpagina (PDP)** — de plek waar het gebeurt
- [x] Prijs per m² **én** per doos, met inhoud per doos (m² + stuks)
- [x] **Rekenmodule**: m² + snijverlies → dozen → totaalprijs
- [x] Levertijd en afhaaloptie op ooghoogte, boven de koopknop
- [x] Betaalmethoden zichtbaar (iDEAL, Klarna, in3)
- [x] Twee "nog-niet-zeker"-uitgangen: **gratis staal** en **showroomlijst**
- [x] Offerte-CTA voor grote projecten
- [x] Volledige specificatietabel: antislip, PEI, dikte, sortering, vloerverwarming

**Wat de meesten laten liggen (kans voor Tegelloods)**
- Automatisch **lijm en voeg meerekenen** bij de bestelde m²
- Een **showroomlijst** in plaats van "kom een keer langs"
- Retourbeleid op **ongeopende restdozen** actief als geruststelling inzetten
- Advies dat naar de *goedkopere* optie durft te wijzen — dat is precies het
  verhaal dat in reviews terechtkomt

---

## 6. Positionering voor Tegelloods BV

**Huidige situatie (tegelloodsbv.nl):** informatieve site. Zorgvuldig
samengesteld assortiment wand- en vloertegels, persoonlijk advies, eerlijke
prijzen, **15+ jaar ervaring in tegelwerk en afwerking**; showroom **op
afspraak** aan de Telgenweg 4, 8111 CM Heeten; naast keramiek en natuursteen
ook **lijmen, voegmiddelen, kitten, primers, ontkoppelingsmatten en
onderhoudsproducten**.

Dat laatste is strategisch belangrijker dan het lijkt: Tegelloods verkoopt niet
de tegel, maar **de complete, werkende vloer**.

### Belofte
> **"Tegels waar je vijftien jaar blij mee blijft."**
> Geen eindeloze catalogus, maar een scherpe selectie die wij zelf zouden
> leggen — met de berekening, de lijm en het advies erbij.

### Vier pijlers, doorgevoerd in de demo
| Pijler | Concreet in de shop |
|---|---|
| **Curatie** | ~12 series i.p.v. 100 merken; elke tegel heeft een reden om er te zijn |
| **Zekerheid** | Rekenmodule, 4 gratis stalen, restdozen retour, alleen 1e sortering |
| **Vakkennis** | Lijm-/voegberekening, legadvies per tegel, R-waardes uitgelegd |
| **Showroom als asset** | Showroomlijst: je favorieten liggen klaar op groot formaat |

### Wat we bewust **niet** doen
- Niet concurreren op "laagste prijs van Nederland" — ongeloofwaardig bij 12 series.
- Geen kunstmatige afteltimers of "nog 2 op voorraad"-druk. Dit is een
  overwogen aankoop van € 500-€ 4.000; nepschaarste kost hier vertrouwen.
- Geen 60.000 m²-claim. Wel: **"alles wat er staat, zouden we zelf leggen."**

---

## 7. Prijs- en verzendbeleid (voorstel)

Gebaseerd op wat de markt doet, geschaald naar een specialist:

| | Markt | Voorstel Tegelloods | Waarom |
|---|---|---|---|
| Gratis verzending vanaf | € 200 (Toptegels) – € 499,95 (Tegeloutlet) | **€ 250** | Onder de outlet-drempel, boven de gemiddelde losse doos |
| Verzendkosten daaronder | € 29,95 – € 49,95 | **€ 39,95** | Kostendekkend voor palletlevering |
| Afhalen | Hoofddorp / Waalwijk / Tiel | **Gratis in Heeten, op afspraak** | Combineert met showroombezoek → adviesmoment |
| Stalen | max. 4, gratis | **max. 4, gratis, 20×20 cm** | Marktstandaard; niet op besparen |
| Retour | wisselend | **Ongeopende dozen, 30 dagen** | Neemt blokkade #2 rechtstreeks weg |

*Deze bedragen staan als constante in `demo/assets/js/app.js` (`TL.shop`) en zijn
op één plek aan te passen.*

---

## 8. Wat de demo laat zien

`/demo` is een klikbare voorbeeldshop. Zie `README.md` voor het draaien en
`SHOPIFY.md` voor de vertaling naar een echt Shopify-thema.

| Pagina | Wat het bewijst |
|---|---|
| `index.html` | Positionering, USP-balk, categorie-instap, mini-rekenmodule, showroomblok |
| `collectie.html` | PLP met filters op look/ruimte/prijs/voorraad, sorteren, "gratis staal" per kaart |
| `product.html` | **De kern**: rekenmodule, totaalprijs, samples, showroomlijst, offerte via WhatsApp |
| `samples.html` | Samplebox-flow met max. 4 stalen |
| `showroom.html` | Afspraakflow met datum, tijdslot, projecttype én je klaargelegde tegels |
| `winkelwagen.html` | Verzenddrempel, automatische lijm-/voegberekening |

**De rekenmodule** (blokkade #2) werkt exact volgens de marktstandaard:
`ceil(m² × (1 + snijverlies) ÷ m² per doos)`, standaard 10% snijverlies, met
een uitlegknop die de som letterlijk voorrekent. De uitkomst is tweerichtings-
gekoppeld aan de aantalselector, zodat het aantal dozen en de totaalprijs nooit
uit elkaar kunnen lopen.

**De twee sticky knoppen** rechtsonder (showroomafspraak met teller +
WhatsApp) zijn er omdat de twee duurste vragen in deze markt — *"welke kleur?"*
en *"hoeveel?"* — beide sneller via een mens dan via een pagina worden opgelost.

---

## 9. Meetplan na livegang

Meet deze zes, niets meer:

1. **Aanvraagratio stalen** (sessies → sampleaanvraag) — doel 2-4%
2. **Showroomafspraken per week** — de duurste en meest waardevolle conversie
3. **Gebruik rekenmodule** (event: `calc_used`) vs. add-to-cart-ratio van die
   sessies — verwacht een duidelijk hoger conversiepercentage
4. **Sample → order binnen 60 dagen** (hier zit de echte ROI van gratis stalen)
5. **Gemiddelde orderwaarde vs. de € 250-drempel**
6. **Retourpercentage restdozen** — loopt dit op boven ~5%, dan rekent de module
   te ruim

---

## Bronnen

- [Toptegels.nl — homepage](https://toptegels.nl/) · [verzenden en levertijd](https://toptegels.nl/pages/verzenden-en-levertijd) · [veelgestelde vragen](https://toptegels.nl/pages/veelgestelde-vragen-toptegels) · [online bestellen](https://toptegels.nl/pages/eenvoudig-online-tegels-bestellen-bij-toptegels-nl) · [wandtegels](https://toptegels.nl/collections/wandtegels)
- [Throne.nl — homepage](https://throne.nl/) · [showroom](https://throne.nl/pages/showroom) · [tegels](https://throne.nl/collections/tegels) · [Trustpilot](https://www.trustpilot.com/review/throne.nl) · [Trustoo](https://trustoo.nl/zuid-holland/den-haag/tegelzetter/throne-projectontwikkeling-bv/)
- [Tegeloutlet Nederland — tegels](https://tegeloutletnederland.nl/tegels/) · [bezorgen en afhalen](https://tegeloutletnederland.nl/klantenservice/bezorgen-afhalen/)
- [RB Tegels — homepage](https://www.rbtegels.nl/) · [over RB Tegels](https://www.rbtegels.nl/over-rb-tegels-tegelwinkel-nederland/)
- [Tegelpaleis — homepage](https://www.tegelpaleis.nl/) · [over ons](https://www.tegelpaleis.nl/over-ons/) · [tegelmerken](https://www.tegelpaleis.nl/tegelmerken/) · [zakelijk](https://www.tegelpaleis.nl/zakelijk)
- [Saniweb — tegels](https://www.saniweb.nl/tegels.html) · [bezorgen en afhalen](https://www.saniweb.nl/kopen-en-service/bezorgen-afhalen) · [hoeveel tegels heb ik nodig?](https://www.saniweb.nl/advies/tegels/hoeveel-tegels-nodig)
- Rekenmodules ter vergelijking: [WDtegels](https://wdtegels.com/blogs/kennisbank/hoeveel-tegels-nodig-berekenen) · [Tegels in Huis](https://www.tegelsinhuis.nl/advies/tegelcalculator/) · [Tegelking](https://www.tegelking.nl/tegelcalculator/) · [De Tegelsite](https://www.detegelsite.nl/calculator/) · [TegelEend](https://tegeleend.nl/pages/m2-berekenen)
- [Tegelloods BV — showroom & assortiment](https://tegelloodsbv.nl/tegelloods/) · [tegels-info.nl bedrijfsprofiel](https://www.tegels-info.nl/tegelloods-bv)
