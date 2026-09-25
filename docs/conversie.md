# Conversiekeuzes en hoe je ze meet

Uitgangspunt: één product van ± € 15 met een korte beslistijd. De winst zit niet in
lange overtuiging maar in twijfel wegnemen (bezorging, leeftijd, cadeau) en in
gemiddelde orderwaarde (bundel, cadeauverpakking, poster).

## Wat er op de pagina staat en waarom

| Element | Waarom | Verwachte werking |
|---|---|---|
| Speelbare memorydemo in de hero | Het product zelf laten voelen vóór de koop; ouders zien in tien seconden wat hun kind doet | langere sessie, hogere doorklik naar PDP |
| Koopknop met prijs erin | Geen verrassing bij de volgende stap | minder uitval bij de eerste klik |
| USP-balk (verzending, retour, iDEAL) | De drie vragen die elke NL-bezoeker heeft, boven de vouw | minder bounce vanaf advertentieverkeer |
| Aftelklok tot 22:00 | Echte deadline, geen nepschaarste | koopbeslissing nú in plaats van "later" |
| Voorraadregel met aantal | Concreet en controleerbaar | lichte urgentie zonder wantrouwen |
| Bundel 1 / 2 / 3 met streepprijs | Cadeau + eigen exemplaar is het echte koopmoment | hogere gemiddelde orderwaarde |
| Cadeauverpakking als vinkje | Wegneemt het "moet ik nog inpakken"-bezwaar | + € 2,95 op een deel van de orders |
| Verzendmeter in de lade | Maakt de stap van € 14,95 naar € 30 zichtbaar | meer tweede artikel per order |
| Sticky koopbalk op de PDP | De knop blijft bereikbaar tijdens het lezen | meer toevoegingen vanaf onderin de pagina |
| Reviews met verdeling én tekst | Sociale bevestiging van ouders, niet van het merk | vertrouwen bij nieuw verkeer |
| FAQ over leeftijd, bezorging, retour | De vier vragen die anders naar de klantenservice gaan | minder uitval en minder mails |

## Wat er bewust níet staat

Geen pop-up bij binnenkomst, geen nep-aftellers ("nog 2 minuten!"), geen
"12 mensen kijken nu". Dat wint één order en kost het vertrouwen van een ouder
die een cadeau voor een kind koopt.

## Meten

Events (GA4): `view_item`, `add_to_cart`, `begin_checkout`, `purchase`,
`memo_demo_started`, `memo_demo_completed`, `bundle_selected` (met waarde),
`giftwrap_toggled`, `sticky_add_click`.

Doelen om op te sturen: conversie home → PDP, PDP → winkelwagen, winkelwagen →
bestelling, gemiddelde orderwaarde, aandeel bundelorders.

Eerste drie tests, op volgorde van verwachte opbrengst:
1. Bundelblok boven vs. onder de koopknop.
2. Hero met speelbare demo vs. hero met productfoto.
3. Cadeauverpakking als vinkje vs. als stap in de winkelwagen.

Draai elke test tot minimaal 200 transacties per variant; daaronder meet je ruis.
