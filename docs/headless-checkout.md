# Een eigen afrekenpagina op de Store API

Kan de checkout headless? Ja. WooCommerce heeft er een endpoint voor dat precies
hiervoor bedoeld is, en jouw situatie is gunstiger dan gemiddeld: één product,
één land, en met iDEAL een betaalmethode die niets anders doet dan doorsturen
naar de bank. Geen kaartvelden, geen 3D Secure-iframe, geen Stripe Elements.

## De volgorde van calls

Alles onder `/wp-json/wc/store/v1/`. Elke schrijvende call stuurt de `Cart-Token`
en de `Nonce` mee uit het vorige antwoord (zie hoofdstuk 4 van
`headless-woocommerce.md` voor de proxy-route die dat afhandelt).

```
1. POST /cart/add-item        { id: 65, quantity: 2 }
   → winkelwagen met regels, totalen en btw

2. POST /cart/update-customer { billing_address: { country:"NL", postcode:"1043 AH", city:"Amsterdam" } }
   → verzendopties en btw worden herberekend op het adres

3. POST /cart/select-shipping-rate { package_id: 0, rate_id: "flat_rate:1" }
   → totaal inclusief verzendkosten; hier zie je of de gratis-verzendregel pakt

4. POST /checkout
   {
     billing_address:  { first_name, last_name, address_1, postcode, city, country:"NL", email, phone },
     shipping_address: { ... },
     payment_method:   "mollie_wc_gateway_ideal",
     customer_note:    "Cadeau: van opa en oma",
     extensions:       {}
   }
   → { order_id, status:"pending", payment_result: { payment_status:"success",
       redirect_url:"https://www.mollie.com/checkout/..." } }

5. window.location = payment_result.redirect_url
   → de klant betaalt bij zijn bank en komt terug op de return-URL van de order
```

Stap 5 is het punt waarop je de controle even uit handen geeft. Dat is normaal:
ook de standaard WooCommerce-checkout doet niets anders.

## Wat je zelf moet bouwen

Dit is het echte werk, en de reden dat het weken kost in plaats van een middag:

- **Adresformulier met validatie.** Postcode als `1043 AH`, huisnummer apart van
  de straat (WooCommerce stopt beide in `address_1`), e-mail, telefoon. Een
  postcode-API zoals Postcode.nl vult straat en plaats automatisch in; dat scheelt
  fouten én invultijd.
- **Foutafhandeling per veld.** De Store API geeft bij een afgekeurde bestelling
  een `data.params` terug met de velden die niet kloppen. Die moet je koppelen aan
  de juiste invoervelden, anders ziet de klant één vage melding bovenaan.
- **Verzendkeuze.** De opties komen uit `cart.shipping_rates`; je toont ze en
  stuurt de keuze terug. Zolang er één tarief is, kun je dit automatisch doen.
- **Bedankpagina.** De gateway stuurt de klant standaard terug naar de
  order-received-pagina van WooCommerce. Wil je die ook in je eigen ontwerp, dan
  haal je de order op met `GET /wc/store/v1/order/{id}?key={order_key}` — de
  sleutel staat in de return-URL.
- **Randgevallen.** Voorraad die tussendoor op raakt, een verlopen nonce, een
  afgebroken betaling, dubbel klikken. Dit is saai werk en precies waar een
  zelfgebouwde checkout stuk kan gaan op een manier die je omzet kost.

## Wat er aan de WooCommerce-kant moet kloppen

- **Mollie** (of Pay.nl) geïnstalleerd, met iDEAL actief. Alleen gateways met
  Blocks-ondersteuning werken via de Store API; Mollie heeft die.
- De gateway-ID die je meestuurt bij `payment_method` moet exact kloppen. Op te
  vragen met `GET /wc/store/v1/cart` — daar staat `payment_methods` in.
- **Rembours** werkt ook via de Store API, maar zou ik uitzetten (zie
  `checkout-finetunen.md`).
- De verzendregels en de btw-klasse op verzending moeten goed staan, anders klopt
  het totaal dat jij toont niet met de factuur.

## Wat het oplevert, en wat niet

**Wel:** één ontwerp van homepage tot bedankpagina, geen merkbreuk, volledige
controle over de volgorde van velden, en snelheid — geen WordPress-thema dat
meelaadt.

**Niet:** een betere betaalervaring dan iDEAL al is, en ook geen hogere conversie
op zichzelf. De winst zit in de dingen die je ermee kúnt doen: minder velden,
adres op postcode, één scherm in plaats van twee.

## Eerlijke volgorde

1. **iDEAL aanzetten** en de doorverwijzing naar de winkelwagen uitzetten. Dit
   zijn twee instellingen en ze doen meer voor je conversie dan een eigen
   checkout.
2. **De CSS uit `assets/woo-checkout.css`** erin, zodat de kassa bij de winkel
   past.
3. **Meten** met de events uit `conversie.md`: hoeveel mensen komen op de kassa en
   hoeveel ronden af. Onder de 50% bij een product van € 14,95 is er iets mis;
   boven de 70% valt er met een eigen checkout weinig te winnen.
4. **Pas dan** de eigen afrekenpagina bouwen — met de cijfers erbij weet je ook
   waaraan je hem moet afmeten.

Reken voor stap 4 op anderhalve tot twee weken bouwen en testen, inclusief
testbestellingen met echte iDEAL-betalingen van één cent.
