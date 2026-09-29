# De WooCommerce-checkout finetunen

De overdracht werkt: het spel komt in de winkelwagen van soccer-games.nl terecht.
Wat je daarna ziet, is de standaard Flatsome-winkelwagen. Die is niet lelijk door
een ontwerpfout, maar omdat er nooit iets aan gedaan is. In deze volgorde haal je
de meeste winst.

## 1. Instellingen die nu geld kosten

Deze vier vallen op in de huidige winkelwagenpagina en staan los van vormgeving.

**a. Je landt op de winkelwagen, niet op de kassa.**
De knop stuurt naar `/checkout/`, maar WooCommerce leidt door naar
`/winkelwagen/`. Dat is de instelling *WooCommerce → Instellingen → Producten →
Algemeen → "Doorverwijzen naar de winkelwagen na succesvol toevoegen"*. Zet die
uit, dan komt de bezoeker direct op de afrekenpagina. Eén stap minder betekent
in de praktijk enkele procenten meer bestellingen.

**b. iDEAL ontbreekt.**
Onderaan de pagina staan Visa, PayPal, Stripe, Mastercard en "Cash on delivery".
Geen iDEAL — terwijl dat in Nederland veruit de meestgebruikte betaalmethode is.
Installeer Mollie of Pay.nl, zet iDEAL bovenaan in de lijst en laat de andere
methodes eronder staan. Dit is verreweg het belangrijkste punt in deze lijst.

**c. Rembours ("cash on delivery") staat aan.**
Dat is voor een webwinkel met een product van € 14,95 vrijwel altijd verlies:
niet-afgehaalde pakketten kosten je de verzendkosten twee keer. Overweeg om het
uit te zetten zodra iDEAL werkt.

**d. Verzendkosten en btw kloppen niet met het ontwerp.**
De winkelwagen toont "Vast tarief: € 4,10", het nieuwe ontwerp belooft € 3,95 en
gratis vanaf € 30. Kies één waarheid en zet die in *WooCommerce → Instellingen →
Verzending*.

Let ook op de btw-regel: totaal € 19,05 met € 2,59 btw. Dat is precies de btw over
het product (€ 14,95 incl. 21%), dus over de € 4,10 verzendkosten wordt geen btw
gerekend. In Nederland volgt verzending normaal het btw-tarief van het product.
Laat dit door je boekhouder bevestigen en zet de verzendbelastingklasse goed —
anders draag je structureel te weinig btw af.

## 2. De vormgeving: één bestand plakken

`assets/woo-checkout.css` bevat de huisstijl voor winkelwagen en afrekenen:
dezelfde lettertypes, dezelfde oranje knop met harde schaduw, dezelfde
invoervelden en hetzelfde besteloverzicht als op de nieuwe winkel.

Plakken in **WordPress → Weergave → Customizer → Algemene stijlen → Custom CSS**.
Het raakt alleen `.woocommerce-cart` en `.woocommerce-checkout` aan, dus de rest
van de site verandert niet.

Wat het doet:

- Koppen in Bricolage Grotesque, bedragen in DM Mono met uitlijnende cijfers.
- Bestelknop: oranje pil over de volle breedte, met de tactiele schaduw uit het
  ontwerp. Op mobiel blijft hij onderin plakken tijdens het scrollen.
- Invoervelden van 52 px hoog met lettergrootte 16 px — dat laatste voorkomt dat
  iPhones inzoomen zodra je een veld aantikt, wat de halve pagina verspringt.
- Betaalmethodes als aanklikbare blokken in plaats van een kale radiolijst.
- Besteloverzicht in een eigen kader dat op desktop meescrollt.
- Onder de bestelknop een geruststellende regel: veilig betalen, 30 dagen
  bedenktijd, voor 22:00 besteld.

## 3. Wat CSS niet kan, en wel helpt

Deze punten vragen een instelling of een klein stukje thema-werk:

- **Eén pagina in plaats van twee.** Sla de winkelwagenpagina over (punt 1a) en
  overweeg een plugin voor een checkout in één scherm.
- **Minder velden.** Bedrijfsnaam en "adresregel 2" mogen weg of onder een
  "toevoegen"-link; elk veld minder is minder uitval. *WooCommerce → Instellingen
  → Algemeen* en de adresvelden-instellingen van je thema.
- **Adres op postcode.** Een postcode-huisnummer-check (bijvoorbeeld Postcode.nl)
  scheelt fouten én tikwerk.
- **Gast bestellen aanzetten.** Verplicht een account aanmaken kost bestellingen.
- **Afleiding weg.** Op de afrekenpagina hoeven menu, zoekbalk en footerlinks niet
  te staan. Flatsome heeft daar een "distraction free checkout"-optie voor.

## 4. En daarna?

Wil je verder dan finetunen, dan is de volgende stap de eigen afrekenpagina op de
Store API (route 2 in `headless-woocommerce.md`): volledig in je eigen ontwerp,
zonder merkbreuk. Dat is weken werk in plaats van een middag. Doe het pas als de
cijfers laten zien dat de checkout het knelpunt is — en meet dat met de events uit
`conversie.md`.
