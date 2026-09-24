# Livegang: van WooCommerce-winkel naar headless winkel op www

Gekozen opzet:

| Adres | Wat draait er | Waar |
|---|---|---|
| `www.soccer-games.nl` | deze site | Vercel |
| `soccer-games.nl` | stuurt door naar www | Vercel |
| `winkel.soccer-games.nl` | WordPress + WooCommerce | je eigen hosting, ongewijzigd |

## Twee misverstanden vooraf

**Een submap kan niet.** Een domein wijst via DNS naar één server. Wijst
`www.soccer-games.nl` naar Vercel, dan wijst `www.soccer-games.nl/webshop` daar
ook naartoe. Mappen bestaan alleen bínnen één server, en deze site staat op een
andere server dan WordPress.

**Er wordt niets verplaatst.** WordPress blijft staan waar het staat, op dezelfde
schijf, in dezelfde map. Het gaat alleen luisteren naar een tweede naam. Er komt
geen FTP aan te pas, en geen enkel bestand verhuist.

## De volgorde, en waarom die zo is

Het idee: op de dag dat het DNS omgaat, is er niets nieuws meer. De site draait
dan al een week tegen `winkel.soccer-games.nl`, getest en wel. Het omzetten van
het DNS is dan de laatste, kleinste handeling.

```
1. subdomein aanmaken           → WordPress luistert naar een tweede naam
2. site naar dat subdomein      → nieuwe site praat met de nieuwe naam
3. testen op de Vercel-URL      → alles werkt, inclusief een echte bestelling
4. WordPress officieel omzetten → WordPress ís nu winkel.soccer-games.nl
5. domein in Vercel zetten      → Vercel weet dat het www mag serveren
6. DNS omzetten                 → bezoekers komen op de nieuwe site
7. nakijken                     → bestellingen, logboek, Search Console
```

---

## Stap 1. Subdomein aanmaken — jij

In het beheerpaneel van je hosting: maak `winkel.soccer-games.nl` aan en laat
het naar dezelfde map wijzen als de huidige site (vaak heet dat "parkeren op"
of "wijzen naar dezelfde documentroot"). Zet er een SSL-certificaat op; bij de
meeste partijen gebeurt dat vanzelf via Let's Encrypt.

Klaar als dit werkt in je browser:

- `https://winkel.soccer-games.nl` toont je huidige site
- `https://winkel.soccer-games.nl/wp-json/wc/store/v1/products` toont JSON

De tweede is de belangrijkste: dat is de deur waar deze site doorheen praat.

## Stap 2. De site naar het subdomein laten wijzen — ik

Drie instellingen in Vercel:

| Naam | Waarde |
|---|---|
| `WP_BASE` | `https://winkel.soccer-games.nl` |
| `MEDIA_SRC` | `https://winkel.soccer-games.nl` |
| `SITE_URL` | `https://www.soccer-games.nl` |

Wat ze doen: `WP_BASE` bepaalt waar de winkelwagen, de voorwaarden en de Store
API vandaan komen. `MEDIA_SRC` bepaalt waar de foto's tijdens het bouwen
opgehaald worden. `SITE_URL` zet de site op indexeerbaar, met canonical,
sitemap en robots.txt, en zet de echte adressen aan (`/product/soccer-memo`).

Dit moet vóór de DNS-omzetting gebeuren. Doe je het erna, dan probeert de build
de foto's op te halen bij www — en dat is dan de site zelf.

## Stap 3. Testen op de Vercel-URL — samen

De site draait dan nog op `soccer-memo-shop.vercel.app`, maar praat al met
`winkel.soccer-games.nl`. Alles wat straks live moet werken, werkt hier al.

- [ ] Productpagina toont de juiste prijs en voorraad
- [ ] In de winkelwagen leggen, aantal wijzigen, regel verwijderen
- [ ] Kortingscode toepassen en weghalen
- [ ] Postcode invullen: straat en plaats vullen zichzelf
- [ ] Verzendmethode kiezen, bedrag verandert mee
- [ ] **Echte bestelling van € 0,01 via iDEAL, tot en met de bevestigingsmail**
- [ ] Bestelling staat goed in WooCommerce (adres, bedrag, product)
- [ ] Terugbetaling doen, zodat je de hele keten een keer gezien hebt
- [ ] Alles nog eens op een telefoon

Gaat hier iets mis, dan heb je nog niets omgezet en merkt geen klant er iets van.

## Stap 4. WordPress officieel omzetten — jij

Nu pas verhuist de naam van WordPress zelf.

1. Zet in `wp-config.php`, boven de regel `/* That's all, stop editing! */`:

   ```php
   define( 'WP_HOME', 'https://winkel.soccer-games.nl' );
   define( 'WP_SITEURL', 'https://winkel.soccer-games.nl' );
   ```

2. Zoek-en-vervang over de database: `www.soccer-games.nl` →
   `winkel.soccer-games.nl`. Gebruik WP-CLI (`wp search-replace`) of de plugin
   Better Search Replace. **Niet** met een gewone SQL-query: die breekt
   geserialiseerde instellingen.
3. Instellingen → Permalinks → Wijzigingen opslaan (dat ververst de regels).
4. Kijk in Mollie of de webhook-adressen meeveranderd zijn.

Vanaf nu is `winkel.soccer-games.nl` het echte adres van je winkel. `www` doet
nog steeds hetzelfde als altijd, want het DNS staat nog ongewijzigd.

## Stap 5. Domein in Vercel zetten — ik

Ik voeg `www.soccer-games.nl` en `soccer-games.nl` toe aan het project. Vercel
geeft dan de exacte DNS-regels terug. Meestal:

| Naam | Type | Waarde |
|---|---|---|
| `www` | CNAME | wat Vercel toont |
| `@` (het domein zelf) | A of ALIAS | wat Vercel toont |

Ik geef je die waarden letterlijk door; overschrijven uit een handleiding is
vragen om problemen, want ze veranderen soms.

## Stap 6. DNS omzetten — jij

1. **Een dag ervoor**: zet de TTL van de records voor `www` en `@` op 300
   seconden. Dan kun je binnen vijf minuten terug in plaats van binnen een dag.
2. Vervang de records voor `www` en `@` door wat Vercel gaf. **Laat je
   MX-records met rust** — die gaan over je mail en hebben hier niets mee te
   maken. Laat ook het record voor `winkel` staan.
3. Wacht tot het certificaat in Vercel groen staat. Meestal binnen een half uur.

## Stap 7. Nakijken — samen

Meteen na de omzetting:

- [ ] `www.soccer-games.nl` toont de nieuwe site
- [ ] `soccer-games.nl` stuurt door naar www
- [ ] Nog een testbestelling van één cent, nu op het echte adres
- [ ] `www.soccer-games.nl/wp-admin` komt uit op het beheer van WordPress
- [ ] Een oude productlink uit Google komt goed uit
- [ ] Een oude afbeeldingslink (`/wp-content/uploads/…`) komt goed uit

Daarna, binnen een dag:

- [ ] `www.soccer-games.nl` toevoegen in Google Search Console en de sitemap
      indienen
- [ ] Analytics en cookiemelding nalopen op het nieuwe adres
- [ ] TTL weer omhoog, een week later

**Terug kunnen**: zet de DNS-records terug naar je hosting. Binnen vijf minuten
staat de oude winkel er weer, precies zoals hij was. Houd WordPress daarom
minstens een maand op het subdomein bereikbaar.

---

## Wat er in WooCommerce moet kloppen

Los van de verhuizing, maar wel vóór de eerste echte bestelling:

- **Store API bereikbaar houden.** `/wp-json/wc/store/v1/` mag niet achter een
  login, firewall of botbescherming zitten. Let op regels die POST naar
  `/wp-json` blokkeren: dan kan niemand iets in de winkelwagen leggen.
- **Cache uitzetten op `/wp-json`.** Elke paginacache (LiteSpeed, WP Rocket,
  Cloudflare) moet dat pad overslaan. Een gecachte winkelwagen is de
  winkelwagen van iemand anders.
- **"Naar winkelwagen na toevoegen" uitzetten.**
- **Verzendkosten gelijktrekken.** De site belooft € 3,95 en gratis vanaf € 30;
  WooCommerce rekent € 4,10 en kent die drempel niet.
- **Btw over verzendkosten** staat uit. Laat je boekhouder bevestigen of dat klopt.
- **Betaalmethoden.** De Store API geeft nu alleen iDEAL terug. Wil je ook
  Bancontact, creditcard of Klarna, zet die dan aan in Mollie én WooCommerce.
- **Kortingscode voor de nieuwsbrief** aanmaken als coupon.

## De bedankpagina na het betalen

De bedankpagina staat op deze site: `/bedankt`. Hij vraagt de status van de
bestelling op bij WooCommerce, want alleen de winkel weet of het geld binnen is,
en toont per uitkomst iets anders:

| Status in WooCommerce | Wat de klant ziet |
|---|---|
| processing | Betaling ontvangen, met de drie stappen die volgen |
| completed | Je bestelling is onderweg |
| on-hold | We wachten op je overboeking |
| pending | Betaling nog niet afgerond, met een knop om te hervatten |
| failed | Betaling niet gelukt, met een knop om te hervatten |
| cancelled | Je hebt de betaling afgebroken, met een knop om te hervatten |
| refunded | Deze bestelling is terugbetaald |

Vlak na het betalen staat een bestelling soms nog even op `pending`, omdat de
melding van Mollie nog binnen moet komen. De pagina kijkt daarom vier keer
opnieuw, met twee tellen ertussen, voordat hij zegt dat er iets misging.

Geeft de winkel de bestelling niet terug (oudere WooCommerce, of een ontbrekende
sleutel), dan bedankt de pagina op basis van wat de site bij het afrekenen zelf
opsloeg. De klant staat dus nooit voor een lege pagina.

### Wat jij in WordPress moet zetten

Eén filter in het thema (`functions.php` van je childthema, of via Code
Snippets). Zonder dit komt de klant na het betalen op de bedankpagina van
WooCommerce terecht:

```php
add_filter( 'woocommerce_get_return_url', function ( $url, $order ) {
    if ( ! $order ) {
        return $url;
    }
    return add_query_arg( array(
        'order' => $order->get_id(),
        'key'   => $order->get_order_key(),
    ), 'https://www.soccer-games.nl/bedankt' );
}, 10, 2 );
```

Test je nog op het Vercel-adres, zet daar dan `https://soccer-memo-shop.vercel.app/bedankt`
neer en pas het aan bij de omzetting.

De sleutel in het adres is de `order_key` die WooCommerce zelf aanmaakt. Zonder
die sleutel geeft de Store API de bestelling niet vrij, dus kan niemand met een
gegokt bestelnummer andermans bestelling inzien.

**Bij de testbestelling controleren:** breek de betaling bij Mollie ook een keer
af. In de meeste opstellingen komt de klant dan op dezelfde bedankpagina uit, met
de status `cancelled` of `pending`. Stuurt jouw Mollie-instelling de klant naar
de WooCommerce-winkelwagen, laat het me dan weten; dan vang ik dat adres ook af.

De bevestigingsmail komt hoe dan ook uit WooCommerce.

## Over vindbaarheid, eerlijk

De nieuwe site heeft echte adressen (`/product/soccer-memo`), een sitemap en
een canonical. De oude WordPress-adressen worden doorgestuurd, inclusief de
mediabestanden. Dat is de basis op orde.

Wat de site níet doet, is de pagina op de server samenstellen. Google leest
JavaScript tegenwoordig prima, maar het blijft een stap trager dan een kant en
klare HTML-pagina. Voor een winkel met één eigen product weegt dat meestal niet
op tegen de kosten van die verbouwing. Merk je na een paar maanden dat je
posities zakken, dan is dat het eerste dat ik zou aanpakken.

## Nog een losse eindje: waar staat de code

Dit project deelt nu een repository met branches van andere klussen. Voor een
winkel die geld verdient wil je een eigen repository met `main` als
productietak, gekoppeld aan Vercel, zodat elke wijziging automatisch uitrolt en
je altijd terug kunt naar een vorige versie. Dat is een kwartiertje inrichten en
kan ook ná de livegang.
