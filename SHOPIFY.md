# Van demo naar Shopify — technische vertaling
### Tegelloods BV webshop

De demo in `/demo` is bewust zo gebouwd dat elk onderdeel één-op-één een
Shopify-equivalent heeft. Dit document is de bouwtekening.

---

## 1. Datamodel

### Product = tegelserie, variant = kleur × formaat

Eén Shopify-product per **serie** (bv. *Especta Natuursteenlook*), met twee
opties:

| Shopify-optie | Voorbeeldwaarden |
|---|---|
| Option 1 — **Kleur** | Beige, Greige, Antraciet |
| Option 2 — **Maatvoering** | 60x60 cm, 80x80 cm, 100x100 cm |

Dat is de structuur die de demo aanhoudt (`kleuren[]` × `maten[]`) en die de
rekenmodule nodig heeft: **m² per doos verschilt per formaat**, dus die waarde
hoort op variantniveau.

### Prijsvoering: de belangrijkste keuze

Shopify rekent per variant, niet per m². Voer daarom in:

- **`variant.price` = prijs per doos** (dat is wat de klant daadwerkelijk koopt)
- **prijs per m²** als afgeleide metafield, puur voor weergave

Anders klopt de checkout niet met de PDP. De demo doet exact dit:
`prijs per doos = prijs per m² × m² per doos`.

### Metafields (namespace `tegel`)

| Key | Type | Niveau | Gebruikt door |
|---|---|---|---|
| `m2_per_doos` | `number_decimal` | variant | **rekenmodule** |
| `stuks_per_doos` | `number_integer` | variant | PDP-specs |
| `prijs_per_m2` | `money` | variant | prijsweergave |
| `gewicht_doos_kg` | `number_decimal` | variant | verzendcalculatie |
| `look` | `single_line_text` | product | filters (betonlook, houtlook, …) |
| `ruimte` | `list.single_line_text` | product | filters (badkamer, keuken, …) |
| `toepassing` | `list.single_line_text` | product | vloer/wand/binnen/buiten |
| `antislip` | `single_line_text` | product | R9/R10/R11, A+B+C |
| `slijtvastheid` | `single_line_text` | product | PEI-klasse |
| `dikte_mm` | `number_integer` | product | specs |
| `afwerking` | `single_line_text` | product | mat/glans/structuur |
| `sortering` | `single_line_text` | product | "1e sortering" — trustclaim |
| `vloerverwarming` | `boolean` | product | specs + filter |
| `levertijd` | `single_line_text` | product | boven de koopknop |
| `sample_variant_id` | `variant_reference` | product | koppelt de gratis-staalknop |

---

## 2. Secties (Online Store 2.0)

Elk blok uit de demo wordt een `sections/*.liquid`:

| Demo | Shopify-sectie | Bijzonderheden |
|---|---|---|
| USP-balk | `usp-bar.liquid` | Volledig via section settings, geen code-edit nodig |
| Categorie-tegels homepage | `collection-tiles.liquid` | Blocks met collectie + afbeelding |
| Productkaart | `snippets/product-card.liquid` | Inclusief "Gratis staal"-knop |
| PLP-filters | native **Search & Discovery** app | Filters op de metafields uit § 1 |
| **Rekenmodule** | `snippets/tegel-calculator.liquid` | Zie § 3 |
| Samplebox | `snippets/sample-button.liquid` + cart | Zie § 4 |
| Showroomlijst | `snippets/showroom-add.liquid` | Zie § 5 |
| Sticky FAB's | `snippets/floating-actions.liquid` | Zie § 6 |
| Winkelwagen-addons | `snippets/cart-addons.liquid` | Lijm/voeg op basis van totaal-m² |

---

## 3. De rekenmodule in Liquid

De rekenregel is marktstandaard en blijft ongewijzigd:

```
benodigd m²  = oppervlakte × (1 + snijverlies / 100)
aantal dozen = ceil(benodigd m² ÷ m² per doos)
totaalprijs  = aantal dozen × variantprijs
```

Uitgangspunten die je in Liquid moet vasthouden:

1. **`m2_per_doos` per variant meegeven** aan JavaScript, want de gebruiker kan
   van formaat wisselen zonder page reload:

   ```liquid
   <script type="application/json" id="tegel-varianten">
     {
       {%- for v in product.variants -%}
       "{{ v.id }}": {
         "m2": {{ v.metafields.tegel.m2_per_doos | default: 1 }},
         "stuks": {{ v.metafields.tegel.stuks_per_doos | default: 1 }},
         "prijs": {{ v.price }}
       }{%- unless forloop.last -%},{%- endunless -%}
       {%- endfor -%}
     }
   </script>
   ```

2. **De uitkomst van de module = `quantity` in het add-to-cart-formulier.**
   Niet twee losse velden; de demo koppelt ze tweerichtings zodat aantal dozen
   en totaalprijs nooit uit elkaar lopen.

3. **Sla de berekening op als line item property**, zodat de orderpicker en de
   klantenservice zien waar het aantal vandaan komt:

   ```liquid
   <input type="hidden" name="properties[Oppervlakte]" value="24 m²">
   <input type="hidden" name="properties[Snijverlies]" value="10%">
   <input type="hidden" name="properties[Berekend]" value="17 dozen = 24,48 m²">
   ```

4. Stuur een analytics-event `calc_used` — dat is meetpunt 3 uit `ONDERZOEK.md`.

---

## 4. Gratis stalen

Twee werkbare routes; **route A** heeft de voorkeur.

**A. Sample als eigen € 0,00-variant per serie** (voorraadvrij, `requires_shipping: true`)
- Voordeel: één checkout, echt verzendlabel, meetbaar als order.
- Beperk het maximum met een cart-validatie: max. 4 regels met `product_type = Staal`.
- Koppel via metafield `sample_variant_id` aan de moederserie, zodat de knop op
  de PDP en op de productkaart hetzelfde artikel toevoegt.

**B. Los formulier** (Shopify Forms of een app)
- Sneller live, maar geen orderdata, dus meetpunt 4 (*sample → order binnen 60
  dagen*) vervalt. Alleen doen als tijdsdruk het eist.

Verzendregel: stalen mogen nooit de tegel-verzendkosten triggeren. Zet een
aparte verzendprofiel-groep voor `product_type = Staal` op € 0,00.

---

## 5. Showroomlijst & afspraken

De showroomlijst is géén winkelwagen. Implementatie:

1. **Lijst** in `localStorage` (zoals de demo) of als Shopify **cart attribute**
   `showroom_items` wanneer de klant is ingelogd.
2. **Afspraakformulier** via een boekingsapp (Tipo, Appointo of Calendly-embed)
   met de lijst als verborgen veld, zodat de mail die binnenkomt letterlijk
   zegt: *"legt Especta Beige 100x100 en Ontario Betonlook 60x120 klaar"*.
3. Tijdsloten inclusief avondopeningen — dat is een concreet voordeel op
   afspraak-basis dat de grote showrooms niet bieden.

---

## 6. Sticky actieknoppen

`snippets/floating-actions.liquid`, ingeladen in `theme.liquid`:

- **Ronde afspraakknop** met circulaire tekst (SVG `textPath`) en een teller die
  het aantal items op de showroomlijst toont.
- **WhatsApp-knop** met voorgevulde tekst; op de PDP wordt productnaam, kleur en
  formaat automatisch in het bericht gezet.
- Op mobiel schuiven ze omhoog zodat ze de sticky koopbalk niet overlappen
  (zie de media query in `demo/assets/css/style.css`).

WhatsApp is hier geen gimmick: bij een aankoop van € 500-€ 4.000 met twee
onzekerheden (kleur en hoeveelheid) is een foto heen en weer sturen de
snelste conversieroute.

---

## 7. Productdata van de leverancier — Ege Seramik

Leverancier: **Ege Seramik** (Turkije, sinds 1972), [egeseramik.com](https://www.egeseramik.com/).
De productdetails worden daar opgehaald.

### Wat we weten over hun datastructuur
Hun catalogus is per **serie** georganiseerd, met een URL-patroon dat direct
bruikbaar is als bronsleutel:

```
https://www.egeseramik.com/en/collection/{serie}/{maat}-{serie}-{kleur}-{finish}
bv. /en/collection/especta/60x120-especta-biege-rectified
```

Bekende series o.a.: **Especta, Maison, Nepal, Ontario, Ares, Romina, Senate, Torro**.
Dat patroon (`serie` → `maat × kleur × finish`) sluit exact aan op het
Shopify-datamodel uit § 1: **serie = product, maat × kleur = varianten**.

> De demodata in `demo/assets/js/data.js` gebruikt deze serienamen al als
> placeholder. Prijzen, m² per doos en technische waarden daarin zijn **fictief**
> en moeten door de echte leveranciersdata worden vervangen.

### Importstructuur (in te vullen zodra de feed er is)

Vraag bij Ege Seramik (of hun NL-vertegenwoordiging) om een **datafeed of
technische fiches per serie** met minimaal deze velden. Het middelste kolommetje
is waar het om draait: zonder `m2_per_doos` werkt de rekenmodule niet.

| Leveranciersveld | Shopify-doel | Verplicht |
|---|---|---|
| Serie / collection | `product.title` (basis) + `tags` | ✅ |
| Kleur / colour | Option 1 | ✅ |
| Maat (bv. 60x120) | Option 2 | ✅ |
| Finish (mat / rectified / lappato) | metafield `tegel.afwerking` | ✅ |
| **m² per doos** | metafield `tegel.m2_per_doos` | ✅ **kritisch** |
| Stuks per doos | metafield `tegel.stuks_per_doos` | ✅ |
| Gewicht per doos (kg) | metafield `tegel.gewicht_doos_kg` | ✅ (verzendtarief) |
| Dozen per pallet | metafield `tegel.dozen_per_pallet` | aanbevolen |
| Dikte (mm) | metafield `tegel.dikte_mm` | ✅ |
| PEI / abrasion class | metafield `tegel.slijtvastheid` | ✅ |
| R-waarde / DIN 51130 | metafield `tegel.antislip` | ✅ (buiten & douche) |
| Wateropname (E) | metafield `tegel.wateropname` | aanbevolen |
| Frost resistant (ja/nee) | tag `vorstbestendig` | ✅ voor buitentegels |
| EAN / artikelcode | `variant.sku` + `barcode` | ✅ |
| Beeldmateriaal (hi-res + sfeer) | product media | ✅ |
| Inkoopprijs | `variant.cost` (marge-rapportage) | ✅ |

### Aanpak in drie stappen
1. **Bronbestand vastleggen.** Eén CSV/XLSX per serie, kolomnamen exact zoals
   hierboven. Bewaar de bron-URL per variant in metafield `tegel.bron_url` —
   dan is een latere sync of prijsupdate traceerbaar.
2. **Transformatie.** Een klein script zet leveranciersrijen om naar het
   Shopify-importformaat: prijs per m² → prijs per doos, maten normaliseren
   (`60X120` → `60x120 cm`), Turkse/Engelse kleurnamen naar Nederlandse
   (`Biege` → `Beige`, `Beyaz` → `Wit`, `Gri` → `Grijs`).
3. **Import.** Matrixify of de Shopify Admin GraphQL API
   (`productSet` + `metafieldsSet`). Draai eerst één serie als proef, controleer
   of de rekenmodule op de PDP het juiste aantal dozen geeft, en rol daarna uit.

**Let op bij de transformatie:** de kolom die het vaakst fout gaat is *m² per
doos* bij gerectificeerde grootformaten — controleer die per formaat handmatig
tegen de fiche. Eén verkeerde waarde betekent dat elke klant die die serie
bestelt een verkeerd aantal dozen krijgt.

---

## 8. Apps & instellingen

| Doel | Keuze | Notitie |
|---|---|---|
| Filters op PLP | **Search & Discovery** (gratis, Shopify) | Werkt direct op de metafields |
| Reviews | Judge.me of Google Reviews-koppeling | Score in de header is een USP |
| Afspraken | Tipo / Appointo | Met showroomlijst als veld |
| Betalen | iDEAL, Klarna, in3 | in3 is relevant bij orders > € 500 |
| Verzending | Aparte profielen voor tegels (pallet), stalen (€ 0) en toebehoren | De hele markt doet dit |
| Afhalen | Shopify **Local Pickup** op Heeten | Op afspraak, gratis |

---

## 9. Volgorde van bouwen

1. Datamodel + metafields, en **één** serie compleet ingericht als proef
2. PDP met rekenmodule (grootste conversiewinst)
3. Sample-flow (grootste micro-conversie)
4. PLP met filters
5. Showroomlijst + afspraakflow
6. Homepage
7. Verzendprofielen, betaalmethoden, Local Pickup
8. Analytics-events uit § 9 van `ONDERZOEK.md`
