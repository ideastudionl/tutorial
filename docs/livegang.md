# Livegang: headless front-end naast WooCommerce

Deze site is de winkel voor de bezoeker; WooCommerce blijft de winkel voor de
administratie. Producten, voorraad, prijzen, bestellingen, betalingen, mails en
boekhouding blijven daar. Deze site praat met WooCommerce via de Store API en
heeft zelf geen database.

Dat maakt de livegang eenvoudiger dan bij de meeste migraties: er wordt niets
overgezet. De vraag is alleen welk adres de bezoeker ziet.

## 1. Kies de domeinopstelling

Drie varianten, met oplopend gewicht.

### A. Naast elkaar (snelste, minste risico)

| Adres | Wat draait er |
|---|---|
| `www.soccer-games.nl` | WooCommerce, zoals nu |
| `nieuw.soccer-games.nl` | deze site |

Je zet de nieuwe site live op een subdomein en laat de winkel ongemoeid. Ideaal
om mee te beginnen: echte bestellingen, echte betalingen, geen risico voor de
omzet die nu binnenkomt. Zet het subdomein wel op `noindex`, anders concurreren
twee sites met dezelfde producten in Google.

Dit is de aanbevolen eerste stap, ook als je uiteindelijk naar B wilt.

### B. Omdraaien (het einddoel)

| Adres | Wat draait er |
|---|---|
| `www.soccer-games.nl` | deze site |
| `winkel.soccer-games.nl` | WordPress + WooCommerce (beheer, API, bedankpagina) |

De bezoeker komt op de nieuwe site, WordPress verhuist naar een subdomein en
blijft daar het werk doen. Dit is wat je wilt zodra de nieuwe site zich bewezen
heeft. Let op de omleidingen: elke product-URL die nu in Google staat moet met
een 301 naar de nieuwe pagina wijzen.

### C. Alles op één domein via een proxy

`www.soccer-games.nl/*` gaat naar de nieuwe site, `/wp-admin` en `/wp-json`
blijven naar WordPress wijzen. Technisch het netst, maar het vraagt om een
rewrite-laag (Vercel-rewrites of Cloudflare Workers) en meer testwerk. Pas
interessant als je later meerdere systemen op één domein wilt.

## 2. Zet de site live op Vercel

1. **Project koppelen aan de repo.** Nu deployt het project uit een vaste
   commit; koppel het aan GitHub zodat elke push naar de hoofdbranch
   automatisch uitrolt.
2. **Domein toevoegen** in het Vercel-project. Vercel toont de exacte DNS-regel
   die je moet zetten: een CNAME voor een subdomein, een A- of ALIAS-record voor
   het hoofddomein. Neem die waarden over uit het dashboard, niet uit een
   handleiding: ze veranderen soms.
3. **Certificaat** komt automatisch zodra het DNS klopt. Reken op een half uur.
4. **Omgevingsvariabele** `WOO_STORE_URL` zetten op de Store API van de winkel,
   bijvoorbeeld `https://winkel.soccer-games.nl/wp-json/wc/store/v1`. De
   serverfunctie leest die variabele al; zonder waarde valt hij terug op
   `www.soccer-games.nl`.
5. **Sleutels horen in Vercel**, niet in de code en niet in een chat. Voor nu
   zijn er geen sleutels nodig: de Store API is openbaar.

Verlaag de TTL van je DNS naar vijf minuten, een dag voordat je omzet. Dan kun
je binnen minuten terug.

## 3. Wat er in WordPress moet gebeuren

- **Store API bereikbaar houden.** `/wp-json/wc/store/v1/` mag niet achter een
  login, firewall of botbescherming zitten. Let bij Cloudflare of een WAF op
  regels die POST naar `/wp-json` blokkeren: dan kan niemand iets in de
  winkelwagen leggen.
- **Cache uitzetten op `/wp-json`.** Elke paginacache (LiteSpeed, WP Rocket,
  Cloudflare) moet dat pad overslaan. Een gecachte winkelwagen is een
  winkelwagen van iemand anders.
- **De instelling "naar winkelwagen na toevoegen" uit.** Die stuurt bezoekers
  terug naar de WooCommerce-winkelwagen.
- **Verzendkosten gelijktrekken.** De site belooft € 3,95 en gratis vanaf € 30;
  WooCommerce rekent nu € 4,10 en kent die drempel niet. Wat de klant ziet moet
  zijn wat hij betaalt, anders klopt de bestelbevestiging niet met de site.
- **Btw over verzendkosten** staat nu uit. Laat je boekhouder bevestigen of dat
  klopt.
- **Betaalmethoden.** De Store API geeft op dit moment alleen
  `mollie_wc_gateway_ideal` terug. Wil je ook Bancontact, creditcard of Klarna
  op de site, zet die dan aan in Mollie én in WooCommerce.
- **Kortingscode voor de nieuwsbrief** aanmaken als coupon; het veld op de
  afrekenpagina werkt al tegen `/cart/apply-coupon`.

## 4. De betaling en de bedankpagina

De bestelling gaat via `/wp-json/wc/store/v1/checkout` naar WooCommerce. Die
geeft een `redirect_url` naar Mollie terug, en na het betalen stuurt Mollie de
klant naar de bedankpagina van WooCommerce. Die pagina staat dus op het domein
van de winkel.

Twee manieren om daarmee om te gaan:

1. **Laat hem daar staan** en geef hem de huisstijl mee met
   `assets/woo-checkout.css`. Klaar in een uur, maar de klant ziet een ander
   domein in de adresbalk.
2. **Stuur hem terug naar deze site** met een kleine snippet in het thema:

   ```php
   add_filter( 'woocommerce_get_return_url', function ( $url, $order ) {
       return 'https://www.soccer-games.nl/#/bedankt?order=' . $order->get_id()
            . '&key=' . $order->get_order_key();
   }, 10, 2 );
   ```

   Daarna bouwen we hier een bedankpagina die met dat ordernummer en die sleutel
   de bevestiging toont. Mooier, en het is een half dagje werk.

De bevestigingsmail komt hoe dan ook uit WooCommerce. Daar hoef je niets aan te
doen.

## 4b. Als www.soccer-games.nl het nieuwe adres wordt

Dit is de omzetting uit variant B, en het is de enige stap in het hele traject
die echt spannend is. WordPress verhuist naar `winkel.soccer-games.nl` en het
hoofddomein gaat naar Vercel wijzen.

**In WordPress, vóór de omzetting:**

1. Maak het subdomein aan bij je hosting en laat het naar dezelfde server
   wijzen. Certificaat erop.
2. Zet in **Instellingen → Algemeen** zowel het WordPress-adres als het
   site-adres op `https://winkel.soccer-games.nl`. Vastleggen in `wp-config.php`
   kan ook en is veiliger:

   ```php
   define( 'WP_HOME', 'https://winkel.soccer-games.nl' );
   define( 'WP_SITEURL', 'https://winkel.soccer-games.nl' );
   ```

3. Doe een zoek-en-vervang over de database van `www.soccer-games.nl` naar
   `winkel.soccer-games.nl`, met een gereedschap dat geserialiseerde data
   respecteert (WP-CLI `search-replace`, of de plugin Better Search Replace).
   Een gewone SQL-replace breekt opgeslagen instellingen.
4. Permalinks opnieuw opslaan.
5. Controleer in Mollie of de webhook- en retour-adressen meeveranderd zijn.
   WooCommerce genereert die zelf, maar kijken kost een minuut.

**Let op de mediabestanden.** Deze site verwijst op een paar plekken
rechtstreeks naar `www.soccer-games.nl/wp-content/uploads/…` voor het logo, de
productfoto's en de betaallogo's. Zodra www naar Vercel wijst, bestaan die
adressen daar niet meer. Vóór de omzetting moeten die verwijzingen mee naar het
nieuwe WordPress-adres, of de bestanden moeten in dit project komen te staan.
Dat is een kwartiertje werk; zeg het en ik zet het klaar.

**Op het hoofddomein, ná de omzetting:** www wijst naar Vercel, dus alles wat
vroeger WordPress deed moet nu daar geregeld worden. In `vercel.json`:

```json
{
  "redirects": [
    { "source": "/wp-admin/:pad*", "destination": "https://winkel.soccer-games.nl/wp-admin/:pad*", "permanent": false },
    { "source": "/product/soccer-memo", "destination": "/#/product", "permanent": true },
    { "source": "/winkel", "destination": "/#/shop", "permanent": true }
  ]
}
```

Laat `/wp-json` met rust: die calls lopen via de eigen serverfunctie op
`/api/store`, die met `WOO_STORE_URL` naar het nieuwe adres wijst.

**Wat je niet aanraakt:** je MX-records. Alleen de A- of CNAME-records van het
hoofddomein en www veranderen. Je mail blijft gewoon werken.

## 5. Vindbaarheid

Zolang beide sites dezelfde producten tonen, concurreren ze met elkaar.

- **Variant A**: zet het subdomein op `noindex` (dat staat er nu al in) en laat
  de winkel de vindbaarheid houden.
- **Variant B**: haal `noindex` weg, zet een sitemap klaar, en leg voor elke
  bestaande URL een 301 vast:

  | Oud | Nieuw |
  |---|---|
  | `/product/soccer-memo/` | `/#/product` |
  | `/winkel/` | `/#/shop` |

  Hash-adressen (`#/product`) zijn voor Google lastiger dan gewone paden. Wil je
  serieus scoren, dan is de volgende stap echte paden (`/product/soccer-memo`)
  met server-side rendering. Dat is een grotere verbouwing; voor een winkel met
  één eigen product weegt dat meestal nog niet op tegen de moeite.

Vergeet niet: analytics en cookiemelding opnieuw instellen op het nieuwe adres,
en de bestaande GA4- of Meta-tags meenemen. Een domein dat nog geen data
verzamelt, ziet er de eerste week uit als een instorting.

## 6. Testen voor je omzet

Loop deze lijst af op het echte adres, niet op een voorbeeldweergave:

- [ ] Product openen, aantal wijzigen, in de winkelwagen leggen
- [ ] Winkelwagen legen en opnieuw vullen
- [ ] Kortingscode toepassen en verwijderen
- [ ] Postcode invullen; straat en plaats vullen zichzelf
- [ ] Verzendmethode kiezen; het bedrag verandert mee
- [ ] Echte bestelling van € 0,01 via iDEAL, helemaal tot de bevestigingsmail
- [ ] Bestelling staat in WooCommerce met het juiste adres en bedrag
- [ ] Terugbetaling doen om de hele keten te zien
- [ ] Alles op een telefoon, niet alleen op een smal browservenster
- [ ] Winkel even in onderhoudsmodus: geeft de site een nette melding?

## 7. Volgorde van de dag zelf

1. Ochtend: DNS-TTL omlaag, back-up van WordPress, laatste deploy.
2. Zet de nieuwe site live op het gekozen adres.
3. Doe de testbestelling van één cent. Pas daarna verder.
4. Variant B: zet de 301's aan en meld het nieuwe adres bij Google Search
   Console.
5. Kijk de eerste twee uur mee: Vercel-logboek, bestellingen in WooCommerce,
   foutmeldingen in de browser.
6. Na een week: TTL terug omhoog.

**Terug kunnen**: bij variant A hoef je niets terug te draaien, de winkel draait
gewoon door. Bij variant B zet je het DNS-record terug naar de oude server. Houd
daarom de oude WordPress-installatie minstens een maand bereikbaar.

## 8. Wat los van de techniek nog aandacht vraagt

Deze punten kwamen uit de catalogusanalyse en worden zichtbaarder zodra de
nieuwe site live staat:

- De meeste producten in de winkel zijn dropship-artikelen met machinaal
  vertaalde titels en foto's die op AliExpress staan. Die foto's kunnen zonder
  waarschuwing verdwijnen.
- Een aantal artikelen draagt merknamen van clubs of bonden. Dat is een risico
  dat je zelf moet wegen.
- Er zijn geen productcategorieën, dus de winkelpagina kan nog niet filteren.
- Alleen Soccer MeMo heeft eigen fotografie en een eigen tekst. Voor de andere
  producten is dat het verschil tussen een winkel en een doorverkooppagina.
