# AI / Decision Engine

Rules (+ future ML) engine for periodization, injury-risk detection, exercise
substitution and recovery guidance. See `docs/product-design` FASE 4 (§4.9) and
FASE 7 for the full design and rationale.

## Local dev

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
./.venv/bin/python -m pytest tests/ -v
```

## Status

Implemented as deterministic rules only (no ML yet — see FASE 7 §7.8 for why),
every module grounded in the `scienze-motorie-sc` skill's reference files (cited in
each engine module's docstring — no invented thresholds beyond what those state):

- `POST /v1/athletes/{id}/macrocycle` — F2, periodization model choice + mesocycle plan.
- `POST /v1/athletes/{id}/sessions` — F2, mesocycle → concrete sessions (exercise order/sets/reps/RPE).
- `POST /v1/athletes/{id}/autoregulation` — F4, RPE-driven volume adjustment/deload trigger.
- `POST /v1/athletes/{id}/risk-assessment` — F5, ACWR + composite risk score.
- `POST /v1/athletes/{id}/exercise-substitution` — F6, pain-driven substitution + RTP continuum.
- `POST /v1/athletes/{id}/taper-plan` — F3, calendar-aware tapering.
- `POST /v1/athletes/{id}/readiness` — F7, sleep/RPE/pain/stress readiness score.
- `POST /v1/athletes/{id}/nutrition-recommendation` — F8, context-aware macro guidance with safety guardrails.
- `POST /v1/athletes/{id}/conditioning-plan` — speed/agility (closed vs reactive drills)
  and energy-system conditioning (sprint quality, RSA, work:rest by target system),
  specific to intermittent racquet sports (`velocita-agilita.md`,
  `sistemi-energetici-condizionamento.md`).

Not yet implemented: ML layer (v2, FASE 9 M5.2) and the real Claude call in
`engine/explainability.py` (currently a pass-through fallback — see its docstring).
