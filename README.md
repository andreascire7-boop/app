# S&C Intelligence Platform — Tennis & Padel

Strength & Conditioning intelligente per tennis e padel: un motore decisionale che
genera, monitora e adatta la preparazione atletica in base a calendario gare, carico,
recupero e feedback — non una semplice raccolta di schede.

Il progetto completo di design (analisi di mercato, prodotto, PRD, architettura,
database, UX, sistema AI, business model, roadmap) è in
[`docs/product-design`](docs/product-design/PRD-strength-conditioning-tennis-padel.pdf).

## Struttura del monorepo

```
mobile/       Flutter — app athlete-facing iOS/Android (FASE 4 §4.1, FASE 6)
backend/      NestJS — Core API, business logic, Prisma/PostgreSQL (FASE 4 §4.2, FASE 5)
ai-engine/    FastAPI — motore a regole/ML per periodizzazione, rischio infortuni,
              sostituzione esercizi, spiegabilità (FASE 4 §4.9, FASE 7)
infra/        docker-compose per lo sviluppo locale (Postgres+TimescaleDB, Redis)
docs/         Documento di progettazione di prodotto (markdown + PDF sorgente)
.github/      CI (GitHub Actions) per backend, ai-engine, mobile
```

## Quickstart sviluppo locale

```bash
cd infra && docker compose up -d postgres redis
cd ../backend && cp .env.example .env && npm install && npx prisma migrate dev --name init
npm run start:dev          # Core API su :3000

cd ../ai-engine && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -m uvicorn app.main:app --reload --port 8000   # AI engine su :8000

cd ../mobile && flutter create . --platforms=android,ios && flutter pub get && flutter run
```

Dettagli e troubleshooting in `infra/README.md`, `backend/README.md` (TODO),
`ai-engine/README.md`, `mobile/README.md`.

## Stato di avanzamento

Questo scaffolding copre la **milestone M0 (Fondazione tecnica)** e una fetta della
**M1.1 (Auth + Onboarding)** della roadmap (FASE 9): struttura del monorepo, schema
database completo (FASE 5) validato via `prisma generate`/`nest build`, un primo
motore a regole funzionante lato AI engine (periodizzazione F2, rischio infortuni F5,
sostituzione esercizi F6 — con test unitari verdi), e uno scheletro Flutter con design
system e le prime 3 schermate (Splash, Login, Home).

Non ancora implementato (vedi FASE 9 per sequenza/priorità): tapering automatico (F3),
loop di autoregolazione end-to-end (F4), modulo nutrizione (F8), dashboard coach
(F11), pagamenti, e tutte le schermate mobile restanti (FASE 6).

## Principio guida per chi contribuisce

Il motore decisionale (periodizzazione, rischio infortuni, sostituzione esercizi) è
**deterministico e auditabile** — mai un prompt libero a un LLM (FASE 4 §4.9). L'LLM
entra solo per riformulare in linguaggio naturale una decisione già presa dalle regole
(`ai-engine/app/engine/explainability.py`). Ogni modifica alle regole va accompagnata
da test (vedi `ai-engine/tests/`) prima di essere considerata completa.
