# Infra (local dev)

```bash
cd infra
docker compose up -d postgres redis
cd ../backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
# one-time, after the first migration:
docker exec -i $(docker compose -f ../infra/docker-compose.yml ps -q postgres) \
  psql -U sc_platform -d sc_platform < ../infra/db/hypertables.sql
npm run start:dev
```

```bash
cd ai-engine
python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Or bring up the whole stack (Postgres + Redis + backend + ai-engine) with:

```bash
cd infra
docker compose up --build
```

See `docs/product-design` FASE 4 for why each piece was chosen, and FASE 9 for what's
implemented vs. still on the roadmap.
