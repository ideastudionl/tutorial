# Van demo naar verkopende webshop
### Wat er moet gebeuren om Tegelloods BV live te krijgen op Shopify

Dit document beschrijft de weg van de huidige demo naar een shop waarin
klanten daadwerkelijk kunnen bestellen en betalen. Bedragen zijn indicaties,
geen offerte.

---

## In één oogopslag

| Fase | Wat | Wie | Doorlooptijd |
|---|---|---|---|
| 0 | Beslissingen: account, plan, domein, assortimentsomvang | Klant | 1 week |
| 1 | **Productdata van Ege Seramik verzamelen** | Klant + leverancier | 2-4 weken ⚠️ |
| 2 | Shopify-store opzetten en inrichten | Wij | 1 week |
| 3 | Thema bouwen (design uit de demo) | Wij | 2-3 weken |
| 4 | Producten importeren en controleren | Wij + klant | 1 week |
| 5 | Testen, juridisch, betalingen | Wij + klant | 1 week |
| 6 | Livegang en nazorg | Wij | 1 week |

**Realistisch: 6 tot 9 weken**, waarbij fase 1 het kritieke pad is. De rest kan
grotendeels parallel lopen, maar zonder productdata kan er niets verkocht worden.

> **Het grootste risico zit niet in de techniek maar in de data.** Beeldmateriaal
> en technische fiches van de leverancier zijn in dit soort projecten bijna
> altijd de vertraging. Start daar deze week mee, niet straks.

---

## Fase 0 — Beslissingen die eerst moeten vallen

Dit zijn keuzes van de klant; zonder deze antwoorden staat de rest stil.

### 0.1 Shopify-account
- **Nieuw account op naam van Tegelloods BV** (niet koppelen aan een bestaande store).
- **Plan:** Basic volstaat om te starten — circa **€ 29 per maand** bij jaarlijkse
  betaling. Upgraden kan later; het beperkt vooral het aantal medewerkersaccounts
  en de rapportages, niet de verkoop.
- Aanmelden met een zakelijk e-mailadres van Tegelloods, niet met een persoonlijk adres.

### 0.2 Domein en de bestaande site
Drie opties, in volgorde van voorkeur:

| Optie | Gevolg |
|---|---|
| **A. `tegelloodsbv.nl` volledig naar Shopify** (aanbevolen) | Eén sterk domein, alle SEO-waarde blijft bij elkaar. De huidige informatieve pagina's worden overgezet als Shopify-pagina's. |
| B. `shop.tegelloodsbv.nl` naast de bestaande site | Snel te doen, maar je splitst je vindbaarheid en bezoekers moeten heen en weer. |
| C. Nieuw domein | Afgeraden: je begint qua vindbaarheid bij nul. |

Kiest de klant voor A, dan zijn **301-redirects** van elke bestaande URL naar
de nieuwe tegenhanger nodig. Zonder die redirects verlies je de posities die de
site nu heeft.

### 0.3 Hoeveel assortiment bij de start?
Advies: **10 tot 15 series**, niet meer. Dat past bij de positionering
("curatie, geen catalogus") uit `ONDERZOEK.md` en het scheelt weken werk aan
data en foto's. Uitbreiden kan daarna elke maand.

### 0.4 Prijzen en verzendtarieven vaststellen
Het voorstel staat in `ONDERZOEK.md § 7`: gratis bezorging vanaf € 250,
daaronder € 39,95, gratis afhalen in Heeten, 4 gratis stalen. **Deze bedragen
moeten door de klant bevestigd worden** — ze bepalen mede de marge.

### 0.5 Wie doet wat na livegang?
Orderverwerking, klantenservice, e-mail beantwoorden, voorraad bijwerken.
Een webshop is geen folder: er komt dagelijks werk bij. Leg vast wie dat doet.

---

## Fase 1 — Productdata (het kritieke pad)

### 1.1 Opvragen bij Ege Seramik
Vraag per serie een **technische fiche of datafeed**. De volledige veldenlijst
staat in `SHOPIFY.md § 7`. Vier velden zijn onmisbaar:

| Veld | Waarom kritisch |
|---|---|
| **m² per doos** | Zonder dit werkt de rekenmodule niet, en dat is de kern van het ontwerp |
| **Gewicht per doos** | Bepaalt het verzendtarief; tegels zijn zwaar en duur om te versturen |
| **Dozen per pallet** | Nodig om te bepalen wanneer een order op een pallet moet |
| **EAN / artikelcode** | Wordt de SKU; nodig om te kunnen bestellen en inkopen te matchen |

Daarnaast: PEI-klasse, R-waarde, dikte, wateropname, vorstbestendigheid en
alle beschikbare kleuren en formaten per serie.

### 1.2 Beeldmateriaal — onderschat dit niet
Nodig per serie:
- **Packshot** van de tegel zelf, hoge resolutie, kleurecht
- **Sfeerbeeld** in een ruimte (dit verkoopt; een losse tegel niet)
- Bij voorkeur een detailfoto van de structuur

Vraag Ege Seramik of ze deze beelden vrijgeven. Zo niet, dan is **zelf
fotograferen in de showroom** de oplossing — reken dan op een halve dag
fotografie plus nabewerking. In de demo zijn de tegelbeelden nu
gegenereerde patronen; die moeten allemaal vervangen.

### 1.3 Verkoopprijzen bepalen
Inkoopprijs per m² + marge → verkoopprijs per m². Leg de inkoopprijs ook vast
in Shopify (veld `cost`), dan zie je later je marge per order terug in de
rapportage.

### 1.4 Vertaling en normalisatie
De catalogus is Turks/Engels. Kleurnamen (`Beyaz` → Wit, `Gri` → Grijs,
`Bej` → Beige) en afwerkingen (`Rektifiye` → Gerectificeerd, `Tam Parlak` →
Hoogglans) moeten consistent naar het Nederlands. Daarnaast een verkooptekst
per serie — die schrijven wij, maar de vakinhoudelijke check komt van de klant.

---

## Fase 2 — Shopify-store opzetten

1. Store aanmaken, taal Nederlands, valuta EUR, tijdzone Amsterdam
2. **Btw:** 21% inclusief tonen (in deze markt communiceert iedereen inclusief btw)
3. **Metafields aanmaken** volgens de definitielijst in `SHOPIFY.md § 1` —
   dit moet vóór de productimport, anders moet je alles opnieuw doen
4. **Verzendprofielen**, drie aparte groepen:
   - Tegels: gewicht- of bedraggebaseerd, palletlevering
   - Stalen: altijd € 0 (mogen nooit tegelverzendkosten activeren)
   - Toebehoren: pakketpost
5. **Afhalen in Heeten** aanzetten via Local Pickup, op afspraak
6. **Betaalmethoden:** iDEAL via Shopify Payments (verplicht in NL),
   plus Klarna en in3 — bij orders van € 500 tot € 4.000 is gespreid betalen
   een reëel conversieargument

---

## Fase 3 — Thema bouwen

Het ontwerp ligt er al; dit is de vertaling naar een werkend Shopify-thema.
Basis: Dawn (het gratis standaardthema), met eigen secties.

| Onderdeel | Complexiteit |
|---|---|
| Huisstijl, kleuren, typografie, header/footer | Laag |
| Homepage, collectiepagina, USP-balk | Laag |
| Filters op look/ruimte/prijs/voorraad | Laag — via de gratis app Search & Discovery |
| **Rekenmodule op de productpagina** | **Hoog — dit is het maatwerkstuk** |
| Sample-flow (max. 4 gratis stalen) | Middel |
| Showroomlijst + afspraakflow | Middel — met een boekingsapp |
| Sticky afspraak- en WhatsApp-knop | Laag |
| Automatische lijm-/voegberekening in de winkelwagen | Middel |

De rekenmodule is het onderdeel dat de shop onderscheidt én het meeste werk
kost, omdat hij per variant moet weten hoeveel m² er in een doos zit en de
uitkomst direct de besteleenheid moet worden. De technische opzet staat
uitgewerkt in `SHOPIFY.md § 3`.

**Benodigde apps** (indicatie): Search & Discovery (gratis), een boekingsapp
voor showroomafspraken (circa € 10-20/maand), reviews (circa € 15/maand),
eventueel Matrixify voor de import (circa € 20/maand, opzegbaar na de import).

---

## Fase 4 — Producten importeren en controleren

1. Eerst **één serie** volledig doorvoeren als proef
2. Controleren of de rekenmodule voor die serie het juiste aantal dozen geeft
3. Pas daarna de rest importeren
4. **Handmatige controle van `m² per doos` per formaat** — dit is de kolom die
   het vaakst fout gaat. Eén verkeerde waarde betekent dat elke klant van die
   serie een verkeerd aantal dozen ontvangt.

---

## Fase 5 — Testen en juridisch

**Functioneel testen**
- Volledige testorder: bestellen, betalen, bevestiging, factuur
- Verzendkosten kloppen boven en onder de € 250-grens
- Afhaalorder zonder verzendkosten
- Sample-order: 4 stalen, € 0, eigen verzendlabel
- Showroomafspraak komt aan bij de juiste mailbox
- Mobiel doorlopen — daar komt het merendeel van het verkeer vandaan

**Juridisch verplicht vóór livegang**
- Algemene voorwaarden
- Retourbeleid met het wettelijke herroepingsrecht van 14 dagen — let op:
  dat staat naast onze eigen regeling voor ongeopende restdozen
- Privacyverklaring en cookiemelding (AVG)
- Zichtbare vermelding van KvK-nummer en btw-nummer

---

## Fase 6 — Livegang en daarna

- **301-redirects** van alle bestaande URL's (zie fase 0.2)
- Google Analytics 4 en Google Search Console koppelen
- De zes meetpunten uit `ONDERZOEK.md § 9` instellen, waaronder het event
  `calc_used` op de rekenmodule
- Google Bedrijfsprofiel koppelen zodat de reviewscore klopt met wat de shop toont
- E-mailflow: klant die stalen bestelde na 10 dagen opvolgen — daar zit de
  echte opbrengst van gratis stalen
- Na 4 weken evalueren en bijsturen op basis van de cijfers

---

## Wat ik kan oppakken en wat de klant moet leveren

| Ik | Klant |
|---|---|
| Shopify-store inrichten, metafields, verzendprofielen | Account aanmaken en toegang geven |
| Thema bouwen inclusief rekenmodule | Beslissingen uit fase 0 |
| Productimport en transformatie van de leveranciersdata | **Fiches en beelden van Ege Seramik opvragen** |
| Verkoopteksten per serie | Vakinhoudelijke check op die teksten |
| Testen en meetpunten instellen | Inkoopprijzen en marges |
| Redirects en SEO-overgang | Juridische teksten (of laten opstellen) |

---

## De drie dingen die nu het meest urgent zijn

1. **Vraag deze week de technische fiches en het beeldmateriaal op bij Ege
   Seramik.** Dit is het kritieke pad; al het andere kan wachten.
2. **Beslis over het domein** (fase 0.2) — dat bepaalt hoe de overgang van de
   huidige site eruitziet en of er redirects nodig zijn.
3. **Bevestig de verzend- en prijsstrategie** uit `ONDERZOEK.md § 7`, want die
   bepaalt de marge en zit verweven in het hele ontwerp.
