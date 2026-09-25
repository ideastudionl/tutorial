# Database — Clover Uitzendbureau

De database staat in Supabase (Postgres 17), regio `eu-west-1`.
EU-regio is een bewuste keuze: sollicitatiegegevens en cv's vallen
onder de AVG en horen niet buiten de EU.

**Project:** `clover-uitzendbureau` — ref `mouqiagasvuzbskbjvxo`

Dit project staat los van elk ander project in de organisatie en is
bij oplevering over te dragen aan de organisatie van Clover.

## Migraties ophalen

De migratiegeschiedenis leeft in Supabase. Haal hem lokaal op met de CLI:

```bash
npx supabase login
npx supabase link --project-ref mouqiagasvuzbskbjvxo
npx supabase db pull          # schrijft supabase/migrations/*.sql
```

Toegepaste migraties:

| Versie | Naam |
|---|---|
| 20260924232223 | basis_enums_en_stamtabellen |
| 20260924234739 | vacatures |
| 20260924234824 | sollicitaties_aanvragen_jobalerts_auditlog |
| 20260924235218 | profielen_rollen_en_rls |
| 20260924235253 | opslag_cvs_prive |
| 20260925010851 | zoeken_op_samenstellingen |
| 20260925020052 | beveiligingsbevindingen_oplossen |

## Tabellen

| Tabel | Waarvoor |
|---|---|
| `sectoren` | De acht sectoren, met accentkleur en icoon voor de vormgeving |
| `intercedenten` | Het team; gekoppeld aan vacatures als contactpersoon |
| `vacatures` | De vacaturebank. Eigen `slug` per vacature voor de SEO-URL |
| `sollicitaties` | Instroom van kandidaten, met status-pijplijn |
| `aanvragen` | Personeelsaanvragen van opdrachtgevers |
| `jobalerts` | Inschrijvingen met dubbele opt-in en uitschrijftoken |
| `profielen` | Koppelt een ingelogde gebruiker aan een rol |
| `audit_log` | Elke wijziging, met voor/na en het kanaal (ui of chat) |

## Keuzes die uitleg verdienen

**Zoeken op samenstellingen.** De Nederlandse tsvector-stemmer behandelt
`servicemonteur` als één woord, dus wie *monteur* intikt vindt hem niet.
Daarom staat er naast de tsvector een platte `zoektekst` met een
trigram-index. De functie `zoek_vacatures(term)` combineert beide: de
tsvector levert de relevantie, de zoektekst vangt samenstellingen en
typefouten op. Zonder die tweede route mist de vacaturebank de helft van
wat mensen intikken.

**Vervaldatum op vacatures.** `vervalt_op` vult het `validThrough`-veld in
de JobPosting-data. Google straft sites af die vervulde vacatures laten
staan, dus een vacature zonder einddatum is geen optie.

**Bewaartermijn op sollicitaties.** `bewaren_tot` staat standaard op vier
weken. Een geplande taak ruimt op; dat is een AVG-verplichting, geen
goed voornemen.

**Schrijven gebeurt server-side.** De anon-sleutel kan nergens schrijven.
Alle formulieren lopen via de Next.js API, zodat validatie, rate limiting
en het versturen van mail op één plek zitten.

**Auditlog vanaf dag één.** Nodig voor de chatmodule: elke wijziging is
terug te zien en terug te draaien, of die nu uit de interface of uit een
chatopdracht komt.
