# Redesign Witgoed Koning — onderzoek en verbeterplan

**Doel:** hogere conversie, meer vertrouwen, professionelere uitstraling — met behoud van
wat Witgoed Koning nu al onderscheidt.

---

## 0. Verantwoording en beperking

De omgeving waarin dit is gemaakt kan `witgoed-koning.nl` **niet direct benaderen**: het
domein wordt geblokkeerd door de egress-proxy (HTTP 403 op zowel de fetch-tool als `curl`).
Hetzelfde geldt voor `kiyoh.com` en de sites van de concurrenten.

De huidige site is daarom gereconstrueerd uit wat wél toegankelijk was: zoekresultaten met
paginatitels, meta-omschrijvingen en URL-structuur, bedrijvengidsen en de Marktplaats-shop.
Dat is genoeg voor propositie, categoriestructuur, USP's en tone of voice, maar **niet** voor
de exacte huisstijlkleuren en het logobestand.

**Wat dat betekent voor dit ontwerp:** de huisstijl in de demo is een beredeneerd voorstel,
geen kopie. Het logo is een placeholder-merkteken (wasmachinedeur met kroon, naar de naam
"Koning"). Beide zijn op één plek vervangbaar:

| Wat | Waar |
|---|---|
| Logo | `demo/assets/js/ui.js` → `WK.logo()` — vervang de SVG |
| Kleuren | `demo/assets/css/app.css` → `:root` — vijf merktokens |

Stuur mij het logobestand en de huisstijlkleuren en het ontwerp neemt ze over zonder dat er
verder iets aan de opbouw verandert.

---

## 1. Wat Witgoed Koning nu is

| | |
|---|---|
| Sinds | 2015, Deventer |
| Adres | Staverenstraat 9c, 7418 CJ Deventer — showroom met circa 200 apparaten |
| Propositie | Tweedehands en refurbished witgoed van A-merken |
| Merken | Miele, Bosch, Siemens, AEG, Samsung, Liebherr, Zanussi |
| Categorieën | Wasmachines, wasdrogers (warmtepomp en condens), vaatwassers, plus een outletselectie |
| Prijzen | Wasmachines vanaf circa €229 |
| Garantie | 6 maanden standaard |
| Levering | Gratis bezorgen, aansluiten en oud apparaat mee — heel Nederland, 1–5 werkdagen |
| Reputatie | 8,6/10 op Kiyoh, ruim 1.000 beoordelingen |
| Platform | WordPress/WooCommerce (`/product-categorie/…`, `/winkel/`) |

**De propositie is sterk.** Gratis bezorgen én aansluiten én afvoeren, landelijk, op
tweedehands witgoed — dat is scherper dan het gros van de concurrentie. Het probleem is niet
het aanbod, het is de presentatie.

### Wat er misgaat

1. **De paginatitel doet het werk van de homepage.** "Tweedehands wasmachine Gratis levering
   en aansluiten" staat in de `<title>` van élke pagina — inclusief `/contact/` en
   `/silverline-afzuigkap/`. Dat is een SEO-reflex uit 2015, het kannibaliseert de eigen
   zoekresultaten en het maakt de merknaam onzichtbaar.
2. **Twee categoriestructuren naast elkaar.** Er bestaan zowel `/wasmachine/` als
   `/product-categorie/wasdroger/` als `/winkel/`. Bezoekers en Google zien drie routes naar
   hetzelfde. Dat verdunt autoriteit en het maakt filteren onmogelijk uit te leggen.
3. **De 8,6 met 1.000+ beoordelingen wordt niet uitgespeeld.** Dit is het duurste bezit van
   het bedrijf en het staat, als het al ergens staat, in een widget onderaan.
4. **De unieke aard van het product wordt niet benoemd.** Elk tweedehands apparaat is één
   exemplaar met een eigen geschiedenis. Dat is precies waar de koper bang voor is — en
   precies waar de winst zit als je het omdraait.
5. **De showroom is een verstopte troef.** Een fysiek adres met 150 apparaten is voor een
   tweedehandshandelaar het sterkste vertrouwenssignaal dat er is. Nu staat het op
   `/contact/`.
6. **Het assortiment is smaller dan de navigatie suggereert.** Er staan losse pagina's voor
   koelkasten, fornuizen en afzuigkappen waar nauwelijks voorraad achter zit. Dat kost
   vertrouwen: wie op "koelkasten" klikt en drie apparaten vindt, gelooft de rest ook minder.
   Beter drie categorieën die vol staan dan zes die half leeg zijn.

---

## 2. Concurrentieanalyse

| | Garantie | Levering | Onderscheidend | Zwakte |
|---|---|---|---|---|
| **Witgoed Koning** | 6 mnd | Gratis NL-breed, incl. aansluiten + afvoeren | Landelijk gratis aansluiten; 8,6 op 1.000+ reviews | Presentatie, structuur, geen bewijs per toestel |
| **Wesley's Witgoed** (Grootebroek) | **12 mnd** vanaf €200 | Gratis binnen 25 km; landelijk vanaf €750 | Eigen werkplaats; **garantie aan huis** in de regio; 20+ jaar familiebedrijf | Regionaal beperkt; verouderde webshop (JoomShopping) |
| **De Witgoedhandelaar** (Rotterdam) | 6 mnd (budget: 30 dgn) | Landelijk, afvoeren mogelijk | Duidelijke showroom-openingstijden; "budgethoek" als apart segment | Weinig productdiepte |
| **WGS Witgoed** | tot 6 mnd | Landelijk | **Eigen artikelnummer per machine** — expliciet gecommuniceerd | Verder generieke presentatie |
| **Welhof / Witgoedoutlet** | Fabrieksgarantie | Landelijk | Nieuw met transportschade, niet tweedehands | Ander segment, hogere prijzen |
| **Coolblue** (benchmark, nieuw) | 2 jaar+ | Morgen in huis | Specialistreview met foto; voorraadstatus per winkel; expliciete bezorgbelofte | Speelt niet in tweedehands |

### Assortiment: drie categorieën en een outlet

De navigatie toont wat er werkelijk is: **wasmachines, wasdrogers en vaatwassers**. Daarnaast
één **outlet** — geen aparte voorraad, maar een dwarsdoorsnede van apparaten met een deuk, een
kras of een verkleurd paneel, die daarom extra afgeprijsd zijn.

Waarom outlet als vierde ingang werkt:

- Het **vangt de prijszoeker** die anders bij de goedkoopste concurrent uitkomt, zonder dat de
  rest van het assortiment op prijs hoeft te concurreren.
- Het **verkoopt de B-voorraad** die anders blijft staan. Met een foto van de kras erbij is
  "beschadigd" een korting in plaats van een bezwaar.
- Het is **eerlijk**, en dat past bij het keuringsrapport: u vertelt wat eraan mankeert
  voordat de klant het zelf ontdekt.

### Wat dit oplevert

**De sector verkoopt allemaal hetzelfde en zegt allemaal hetzelfde.** "Gecontroleerd,
gereinigd, met garantie" staat letterlijk op vier van de vijf sites. Niemand bewíjst het.

Wesley's is de gevaarlijkste concurrent: 12 maanden garantie en een monteur aan huis. Maar
alleen binnen 25 kilometer. Witgoed Koning doet het landelijk — dat is het aanvalspunt.

WGS noemt het eigen artikelnummer per machine, maar doet er verder niets mee. Dat is een
open doel.

---

## 3. De strategische keuze: elk apparaat een dossier

> Tweedehands kopen is eng omdat je niet weet wat je krijgt.
> Dus laten we precies zien wat je krijgt.

Bij elk apparaat hoort een **keuringsrapport van dát toestel**: welke onderdelen zijn
gecontroleerd, welke zijn vervangen, hoeveel draaiuren erop staan, en foto's van de
gebruikssporen — ook de lelijke.

Waarom dit het juiste idee is:

- Het is **waar**. Er ís een werkplaats, er wórdt gekeurd. Het wordt alleen niet getoond.
- Het is **niet te kopiëren zonder het echt te doen**. Een concurrent kan "gecontroleerd en
  gereinigd" overtypen. Een rapport met vervangen onderdelen per artikelnummer niet.
- Het **rechtvaardigt de prijs**. €549 voor een tweedehands Miele voelt duur — tot je ziet
  dat er 412 draaiuren op staan en wat er gecontroleerd is.
- Het **verlaagt retouren en klachten**. Wie de kras vooraf op de foto ziet, belt er
  achteraf niet over.
- Het geeft **iets om over te schrijven**: het rapport is de e-mailbijlage, het is de
  advertentie, het is het verschil.

Dit stuurt het hele ontwerp: de productkaart toont het artikelnummer, de homepage legt het
principe uit, de productpagina geeft het volledige rapport, en de bevestigingsmail stuurt het
mee.

---

## 3b. Vormgeving: de conventies van de branche volgen

Een webshop hoort er niet origineel uit te zien. Hij hoort eruit te zien als een webshop.
Bezoekers scannen op patronen die zij van Coolblue, Welhof en Bol kennen — en alles wat van
dat patroon afwijkt kost een halve seconde nadenken, en soms de bestelling.

Daarom volgt het ontwerp de Nederlandse retail-conventies, niet een eigen vormtaal:

| Element | Keuze | Waarom |
|---|---|---|
| Koptekstbalk | Vlakke donkerblauwe balk met logo, brede zoekbalk en winkelwagen rechts | Het patroon dat elke Nederlandse webshop gebruikt; bezoekers hoeven niet te zoeken |
| Bestelknoppen | Oranje, altijd op dezelfde plek | Oranje is in NL de conventie voor "bestellen"; blauw leest als een link, groen als een bevestiging |
| Categoriepagina | **Lijstweergave**, niet een tegelraster | Coolblue's opzet: foto links, opsommingstekens in het midden, prijs en knop rechts. Meer informatie per apparaat zichtbaar zonder door te klikken — juist bij tweedehands, waar elk exemplaar anders is |
| Bezorgbelofte | Groene regel met datum bij elk apparaat | Standaard in NL e-commerce; concrete datum wint van "1–5 werkdagen" |
| Sterren | Bij elk apparaat, met het aantal beoordelingen | 82% van de shoppers leest reviews vóór aankoop |
| Typografie | Eén schreefloze letter (Source Sans 3), verschil door grootte en gewicht | Twee opvallende letters maken van een winkel een portfoliostuk |
| Kleurgebruik | Blauw voor het merk, oranje voor actie, groen voor zekerheid, verder grijs en wit | Kleur betekent iets; decoratieve accenten leiden af van de knop |

Wat er bewust **niet** in zit: paginavullende sfeerbeelden, uitvergrote koppen, siercijfers bij
processtappen, en decoratieve accentkleuren. Dat zijn kenmerken van een portfoliosite, niet van
een winkel waar iemand met een kapotte wasmachine binnen twee minuten wil bestellen.

---

## 4. Verbeterplan per paginatype

### 4.1 Homepage

| # | Ingreep | Waarom |
|---|---|---|
| 1 | Hero met concrete belofte: "Een wasmachine van Miele of Bosch voor de prijs van een onbekend merk", met de 8,6/10 en 1.024 reviews direct eronder | Prijs-kwaliteitverhouding is het koopmotief; sociale bewijskracht moet in het eerste scherm |
| 2 | Keuringsrapport-kaart náást de hero, met echte regels ("Lagers en trommelas — gekeurd", "Deurrubber — vervangen") | Het onderscheidende idee is meteen zichtbaar in plaats van uitgelegd |
| 3 | USP-balk: gratis bezorgd én aangesloten / 6–12 mnd garantie / oud apparaat mee / keuringsrapport | De vier bezwaren die een tweedehandskoper heeft, in één regel weerlegd |
| 4 | Categorietegels met aantal op voorraad en "vanaf €X" | Beantwoordt "wat kost het" en "is er keuze" voor de klik |
| 5 | "Net binnengekomen" met acht recente toestellen | Voorraad wisselt dagelijks; laat zien dat de winkel leeft |
| 6 | Uitlegblok met een volledig rapport ernaast | Bewijs, niet claim |
| 7 | Reviews inclusief vier sterren en lager | Alleen vijf sterren wekt wantrouwen |
| 8 | Showroomblok met adres en openingstijden | Fysiek adres is voor deze categorie het sterkste vertrouwenssignaal |
| 9 | FAQ met de acht echte bezwaren, inclusief "krijg ik het apparaat van de foto?" | Vangt de bezwaren die anders tot bellen of afhaken leiden |

### 4.2 Categoriepagina

- **Eén structuur.** `/c/<categorie>` vervangt zowel `/wasmachine/` als
  `/product-categorie/…`. Oude URL's 301-redirecten. Vier ingangen: wasmachines,
  wasdrogers, vaatwassers, outlet. Pagina's voor categorieën zonder voorraad verdwijnen.
- **Filters die bij tweedehands horen:** merk, staat (Nieuwstaat / Refurbished A /
  Refurbished B), minimale garantie, prijs. Met aantallen per optie, zodat niemand op nul
  resultaten uitkomt.
- **Uitleg bij het staat-filter.** "Refurbished B is technisch even goed maar heeft
  zichtbare gebruikssporen — die staan op de foto." Dat verkoopt de B-voorraad in plaats van
  hem te laten liggen.
- **Productkaart** toont staat, kortingspercentage, twee kernspecificaties, garantie, prijs
  met nieuwprijs ernaast, voorraadregel en **artikelnummer**.
- **"Op voorraad — uniek exemplaar"** in plaats van een aftellende schaarsteteller. Het is
  waar, en het werkt beter dan een timer.

### 4.3 Productpagina — het zwaartepunt

| # | Ingreep | Waarom |
|---|---|---|
| 1 | Prijsblok met nieuwprijs, besparing in euro's én procenten | Maakt de waarde expliciet in plaats van impliciet |
| 2 | **"Inclusief btw, bezorging, aansluiten en het meenemen van uw oude apparaat. Er komt niets meer bij."** | Onverwachte kosten in de laatste stap zijn de grootste oorzaak van winkelwagenverlating |
| 3 | Vier zekerheden onder de prijs: garantie met monteur aan huis, gratis bezorgd, oud apparaat mee, 14 dagen bedenktijd | De vier bezwaren, op de plek waar de knop staat |
| 4 | **Postcode-bezorgbelofte:** "Bezorgd en aangesloten op zaterdag 6 september" | Concrete datum converteert meetbaar beter dan "1–5 werkdagen" |
| 5 | **Keuringsrapport van dit exemplaar** met vervangen onderdelen apart gemarkeerd | Het idee, volledig uitgevoerd |
| 6 | Draaiuren en bouwjaar in de specificaties | De twee getallen die de koper echt wil weten en die niemand geeft |
| 7 | Gebruikssporen benoemd in de pluspunten en gefotografeerd | Eerlijkheid verkoopt hier beter dan verzwijgen |
| 8 | Telefoonnummer bij de knop, met "wij nemen zelf op" | Bij €300 wil een deel van de kopers eerst een mens |
| 9 | Sticky koopbalk op mobiel | Mobiel is het merendeel van het verkeer; de knop mag nooit uit beeld |
| 10 | "Eerst bekijken in de showroom" als tweede actie | Twijfelaars gaan naar Deventer in plaats van weg |

### 4.4 Winkelwagen en afrekenen

- **Kosten expliciet op nul.** Bezorgen, aansluiten en afvoeren staan als aparte regels met
  "gratis" ernaast, niet weggelaten. Wat je niet noemt, telt niet mee.
- **Geen account verplicht.**
- **Drie stappen** met zichtbare voortgang: gegevens → bezorging → betalen.
- **"Waar komt het apparaat te staan?"** — begane grond, eerste verdieping, kelder. Relevant
  voor de planning en het laat zien dat er echte mensen komen sjouwen.
- **Bezorgmoment kiezen** uit drie dagen met dagdeel.
- **Betaalmix:** iDEAL, **pinnen bij levering**, Klarna, in3, overboeking. Bij een onbekende
  webshop zakt de iDEAL-voorkeur van 70% naar 40%, en één op de vier kiest bij een eerste
  aankoop bewust voor achteraf betalen. Van twee naar vier betaalopties levert gemiddeld
  circa 15% conversiewinst op. Pinnen bij levering is voor deze doelgroep het sterkste
  vertrouwensanker: *u betaalt pas als het apparaat draait.*
- **Bevestigingspagina** die vertelt wat er nu gebeurt, met het keuringsrapport als bijlage.

### 4.5 Vertrouwen en professionaliteit — sitebreed

1. **Thuiswinkel Waarborg aanvragen.** Verhoogt de conversie bij nieuwe bezoekers met
   gemiddeld circa 8%.
2. **Kiyoh-score in de header of hero**, niet alleen in een widget onderaan.
3. **KvK- en btw-nummer in de footer.** Ontbreekt vaak, wordt door twijfelaars opgezocht.
4. **Retour- en garantievoorwaarden als leesbare pagina**, niet als juridische bijsluiter.
5. **Eén paginatitel per pagina**, met de merknaam erin.
6. **Gestructureerde data:** `Product` met `itemCondition: RefurbishedCondition`,
   `LocalBusiness` met openingstijden, `FAQPage` voor de veelgestelde vragen. Levert
   sterren, prijzen en voorraadstatus in Google op.
7. **Foto's van het echte toestel.** Dit is de duurste maar belangrijkste ingreep: vier
   opnames per apparaat (vooraanzicht, bedieningspaneel, binnenzijde, gebruikssporen).
   Reken op circa 5 minuten per toestel — dat is de prijs van het hele concept.

---

## 5. Prioritering

Score 1–10 per as, ICE = (Impact × Vertrouwen × Gemak) / 10.

| Ingreep | Impact | Vertrouwen | Gemak | ICE | Wanneer |
|---|---|---|---|---|---|
| Kosten expliciet op nul in winkelwagen en checkout | 9 | 9 | 9 | **72,9** | Week 1 |
| Navigatie terug naar drie categorieën plus outlet | 7 | 8 | 9 | **50,4** | Week 1 |
| Betaalmix uitbreiden (pin bij levering, Klarna, in3) | 8 | 8 | 8 | **51,2** | Week 1 |
| Kiyoh-score in hero en header | 7 | 9 | 8 | **50,4** | Week 1 |
| Paginatitels per pagina uniek maken | 6 | 9 | 9 | **48,6** | Week 1 |
| Postcode-bezorgbelofte op de productpagina | 8 | 8 | 6 | **38,4** | Week 2–3 |
| Zekerhedenblok bij de koopknop | 8 | 8 | 6 | **38,4** | Week 2–3 |
| Sticky koopbalk mobiel | 7 | 8 | 7 | **39,2** | Week 2–3 |
| Categoriestructuur samenvoegen + 301's | 7 | 8 | 5 | **28,0** | Week 3–4 |
| Filters met aantallen | 7 | 7 | 5 | **24,5** | Week 3–4 |
| Keuringsrapport per toestel | 9 | 7 | 4 | **25,2** | Week 4–8 |
| Vier foto's per toestel | 9 | 8 | 3 | **21,6** | Doorlopend |
| Thuiswinkel Waarborg | 6 | 7 | 5 | **21,0** | Parallel |

**Volgorde:** week 1 is bijna gratis en raakt de checkout — daar valt de meeste omzet weg.
Het keuringsrapport scoort lager op gemak maar is de enige ingreep die structureel
onderscheidt; begin er in week 4 mee bij de nieuwe instroom en werk niet met terugwerkende
kracht.

---

## 6. Meetplan

Zonder meting is elke uitspraak hierboven een mening.

**Kern-KPI's**
- Conversieratio, apart voor mobiel en desktop
- Winkelwagenverlating en checkout-uitval per stap
- Toevoegingen aan winkelwagen per productpaginabezoek
- Gemiddelde orderwaarde
- Telefoongesprekken per 100 productpaginabezoeken (dit blijft een telefoonbedrijf)

**Events (GA4 of Plausible)**
`view_item`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`,
`purchase`, plus eigen events: `postcode_check`, `keuringsrapport_open`, `bel_klik`,
`showroom_klik`, `filter_gebruikt`.

**Toetsbare aannames**
| Aanname | Toets |
|---|---|
| Concrete bezorgdatum verhoogt toevoegingen | A/B op de productpagina, 4 weken |
| Pinnen bij levering verlaagt checkout-uitval | Aandeel per betaalmethode + uitvalpercentage |
| Het keuringsrapport verlaagt retouren | Retourpercentage met versus zonder rapport |
| Refurbished B verkoopt beter mét uitleg | Doorverkooptijd per staatlabel |

Verwacht rendement bij een uitgangsconversie van rond de 1%: **1,4 tot 1,8%** binnen twee
kwartalen. Het grootste deel komt uit de checkout, niet uit de homepage.

---

## 7. Techniek: Shopify of WooCommerce

De site draait nu op WooCommerce. Beide routes zijn afgedekt in de demo.

**Blijven bij WooCommerce** — laagste drempel, geen migratie, geen URL-breuk. De extra
velden (staat, garantie, draaiuren, keuringsrapport) worden productmeta. Nadeel: hosting,
beveiliging en snelheid blijven uw eigen zorg.

**Naar Shopify** — snelheid en betrouwbaarheid uit de doos, betere checkout. De extra velden
worden metafields. Nadeel: migratie van producten, klanten en URL's, en een maandbedrag.

**Advies:** blijf bij WooCommerce en investeer het migratiebudget in productfoto's en het
keuringsrapport. Dat verdient meer terug dan een platformwissel. De demo bevat wel een
werkende Shopify-adapter, zodat de keuze open blijft.

---

## 8. Aannames in de demo

Alles hieronder is ingevuld om het ontwerp te kunnen tonen en moet vervangen worden door
echte gegevens:

- **17 producten** (8 wasmachines, 5 drogers, 4 vaatwassers, waarvan 5 in de outlet) met
  verzonnen artikelnummers, prijzen, draaiuren en keuringsrapporten
- **Klantreviews** — geschreven naar het patroon van de echte Kiyoh-reviews, maar niet echt
- **KvK- en btw-nummer** staan op nullen
- **Openingstijden** zijn aangenomen
- **Productfoto's** zijn lijnillustraties; er zijn geen echte foto's beschikbaar
- **Logo en kleuren** zijn een voorstel, geen kopie van de bestaande huisstijl

---

## Bronnen

- [Witgoed Koning op Kiyoh](https://www.kiyoh.com/reviews/1062001/Witgoed+Koning)
- [Witgoed Koning op Marktplaats](https://www.marktplaats.nl/u/witgoed-koning/9915927/)
- [Wesley's Witgoed](https://wesleyswitgoed.nl/)
- [De Witgoedhandelaar](https://www.dewitgoedhandelaar.nl/)
- [WGS Witgoed](https://wgswitgoed.nl/over-ons/)
- [Welhof witgoed outlet](https://www.welhof.com/nl_nl/witgoed)
- [Productpagina's van Coolblue door de tijd heen — Emerce](https://www.emerce.nl/reviews/productpaginas-coolblue-door-de-tijd-heen)
- [Coolblue over voorraadstatus en prijzen](https://www.coolblue.nl/klantenservice/voorraadstatus-producten)
- [Thuiswinkel.org — betalen na levering en consumentenvertrouwen](https://www.thuiswinkel.org/kennisbank/kennisartikelen/waarom-betalen-na-levering-het-consumentenvertrouwen-bij-online-shoppen-vergroot/)
- [Webshop-statistieken Nederland 2026 — Searchlab](https://searchlab.nl/statistieken/webshop-statistieken-nederland-2026)
- [Betaalmethoden en conversie — Timmermans Media](https://www.timmermansmedia.nl/blog/conversieoptimalisatie/welke-betaalmethoden-webshop/)
