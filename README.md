# S&C Intelligence Platform — Tennis & Padel

Strength & Conditioning intelligente per tennis e padel: un motore decisionale che
genera, monitora e adatta la preparazione atletica in base a calendario gare, carico,
recupero e feedback — non una semplice raccolta di schede.

Il progetto completo di design (analisi di mercato, prodotto, PRD, architettura,
database, UX, sistema AI, business model, roadmap) è in
[`docs/product-design`](docs/product-design/PRD-strength-conditioning-tennis-padel.pdf).

## Struttura del monorepo

```
mobile/         Flutter — app athlete-facing iOS/Android (FASE 4 §4.1, FASE 6)
backend/        NestJS — Core API, business logic, Prisma/PostgreSQL (FASE 4 §4.2, FASE 5)
ai-engine/      FastAPI — motore a regole/ML per periodizzazione, rischio infortuni,
                tapering, nutrizione, recupero, sostituzione esercizi, spiegabilità
                (FASE 4 §4.9, FASE 7)
web-dashboard/  Next.js — dashboard coach B2B (FASE 4 §4.1, F11)
infra/          docker-compose per lo sviluppo locale (Postgres+TimescaleDB, Redis)
docs/           Documento di progettazione di prodotto (markdown + PDF sorgente)
.github/        CI (GitHub Actions) per backend, ai-engine, mobile
```

## Quickstart sviluppo locale

```bash
cd infra && docker compose up -d postgres redis
cd ../backend && cp .env.example .env && npm install && npx prisma migrate dev --name init
npm run start:dev          # Core API su :3000

cd ../ai-engine && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -m uvicorn app.main:app --reload --port 8000   # AI engine su :8000

cd ../mobile && flutter create . --platforms=android,ios && flutter pub get && flutter run

cd ../web-dashboard && npm install && cp .env.local.example .env.local
npm run dev -- -p 3001    # Dashboard coach su :3001
```

Dettagli e troubleshooting in `infra/README.md`, `backend/README.md` (TODO),
`ai-engine/README.md`, `mobile/README.md`.

## Stato di avanzamento

Copre le milestone **M0-M2 e una fetta di M3/M4** della roadmap (FASE 9), tutto
verificato end-to-end (non solo compilato) contro un Postgres reale e i servizi
in esecuzione:

- **Onboarding → primo piano** (F1/F2): assessment, generazione macrociclo/mesocicli
  e della prima settimana di sedute con esercizi reali dal catalogo.
- **Esecuzione e feedback** (F9/F4): log delle serie, check-in post-sessione che
  innesca l'autoregolazione e adatta davvero la seduta successiva.
- **Prevenzione infortuni** (F5/F6): rischio (ACWR + storico + dolore), sostituzione
  automatica di esercizi con log e rimando a professionista nei casi severi.
- **Calendario gare e tapering** (F3): creare un torneo riduce automaticamente il
  volume delle sedute nella finestra di taper e annullarlo ripristina i valori
  originali (snapshot pre-taper).
- **Recupero/readiness** (F7) e **nutrizione con guardrail di sicurezza** (F8,
  inclusi i casi minorenne e segnale di rapporto disfunzionale col cibo).
- **B2B coach** (F11): richiesta/accettazione/revoca del collegamento coach-atleta,
  dashboard web (Next.js) con lista atleti ordinata per rischio.
- **Mobile**: onboarding, home con readiness e sessione del giorno, esecuzione
  sessione, calendario gare, centro rischio, hub nutrizionale.

Non ancora implementato: pagamenti/abbonamenti reali (Stripe/RevenueCat — solo
scaffolding dati), dashboard coach oltre la lista atleti (drill-down, override
piano), motore ML v2, e la tab "Programma" (timeline macro/meso/microciclo) lato
mobile.

## Principio guida per chi contribuisce

Il motore decisionale (periodizzazione, rischio infortuni, sostituzione esercizi) è
**deterministico e auditabile** — mai un prompt libero a un LLM (FASE 4 §4.9). L'LLM
entra solo per riformulare in linguaggio naturale una decisione già presa dalle regole
(`ai-engine/app/engine/explainability.py`). Ogni modifica alle regole va accompagnata
da test (vedi `ai-engine/tests/`) prima di essere considerata completa.
