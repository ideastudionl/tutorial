# Taken Dashboard

Een eenvoudig dashboard om taken te beheren: takenlijst met statusbeheer
(te doen / bezig / klaar), prioriteiten en deadlines. Gebouwd met **Next.js
(App Router) + TypeScript**.

Het dashboard is voorbereid op een latere **Akiflow-koppeling** via een
adapter-laag, zonder dat de rest van de app daarvoor hoeft te veranderen.

## Starten

```bash
npm install
npm run dev      # ontwikkelserver op http://localhost:3000
```

Productie:

```bash
npm run build
npm run start
```

## Functies

- Takenlijst met status **te doen → bezig → klaar**
- Taak afvinken, status wijzigen, verwijderen
- Prioriteit (laag/middel/hoog) en deadline per taak
- Filters per status + tellers bovenaan
- REST API onder `/api/tasks`

## Projectstructuur

```
src/
  app/
    page.tsx              # dashboard-pagina
    layout.tsx            # html-layout
    globals.css           # styling
    api/tasks/route.ts        # GET (lijst) + POST (aanmaken)
    api/tasks/[id]/route.ts   # GET / PATCH / DELETE per taak
  components/
    Dashboard.tsx         # client-component met state + data-ophaling
    AddTaskForm.tsx       # formulier voor nieuwe taken
    TaskItem.tsx          # één taak-rij
  lib/
    types.ts              # Task / status / prioriteit types
    seed.ts               # voorbeelddata
    redis.ts              # Redis-client uit omgevingsvariabelen
    sources/
      types.ts            # TaskSource-interface (de adapter-laag)
      local.ts            # LocalTaskSource (opslag in data/tasks.json)
      redis.ts            # RedisTaskSource (opslag in Upstash Redis, cloud)
      akiflow.ts          # AkiflowTaskSource (placeholder voor later)
      index.ts            # kiest de actieve bron
```

## Opslag

De app kiest automatisch de juiste opslag:

- **Lokaal** (geen database ingesteld): taken in `data/tasks.json`.
- **Cloud** (Redis ingesteld via env-variabelen): taken in Upstash Redis,
  zodat ze herstarts van serverless functies overleven.

Zie `.env.example` voor de variabelen.

## Deployen naar Vercel (cloud)

1. Ga naar [vercel.com](https://vercel.com), log in met je GitHub-account.
2. **Add New → Project** en kies de repo `ideastudionl/tutorial`. Selecteer
   bij branch `claude/nice-cray-r7t006` (of merge die eerst naar `main`).
   Vercel herkent Next.js automatisch.
3. **Database koppelen** (voor blijvende opslag): ga in het project naar het
   tabblad **Storage → Create Database → Upstash for Redis** (gratis tier).
   Vercel zet de benodigde env-variabelen (`KV_REST_API_URL` /
   `KV_REST_API_TOKEN`) automatisch klaar.
4. **Deploy.** Na een paar minuten krijg je een URL (`...vercel.app`) die je
   overal — ook op je telefoon — kunt openen.

Zonder gekoppelde database werkt de app ook, maar dan kunnen taken resetten.

## Akiflow koppelen (later)

> **Let op:** Akiflow heeft op dit moment **geen publieke API** om taken
> rechtstreeks op te halen. Daarom werkt het dashboard nu met een lokale
> bron, en is de koppeling voorbereid maar nog niet actief.

De koppeling draait om één interface, `TaskSource` (`src/lib/sources/types.ts`).
Elke bron — lokaal of Akiflow — implementeert `list / get / create / update /
remove`. De app praat alleen tegen `getTaskSource()`, dus omschakelen is één
regel in `src/lib/sources/index.ts`.

Realistische koppelroutes:

1. **Zapier / Make webhook** — Akiflow stuurt bij een taak-wijziging een
   webhook. Voeg een API-route toe (bijv. `POST /api/akiflow/webhook`) die de
   payload via `AkiflowTaskSource.fromAkiflow()` naar het `Task`-model mapt en
   opslaat.
2. **Bron-tool** — Akiflow synct vaak met Todoist, Google Tasks of Google
   Calendar. Koppel aan die API en map het resultaat naar `Task`.
3. **CSV-import** — handmatige export uit Akiflow inlezen.

Stappen om route 1/2 te activeren:

1. Vul `src/lib/sources/akiflow.ts` in (echte fetch + mapping).
2. Zet in `src/lib/sources/index.ts` de `AkiflowTaskSource` als actieve bron
   (of combineer met de lokale bron).
3. Zet eventuele tokens in een `.env.local` (niet committen).
