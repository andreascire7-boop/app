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

## Status (M0/M1.2 of the roadmap, FASE 9)

Implemented as deterministic rules only (no ML yet — see FASE 7 §7.8 for why):

- `POST /v1/athletes/{id}/macrocycle` — F2, periodization model choice + mesocycle plan.
- `POST /v1/athletes/{id}/risk-assessment` — F5, ACWR + composite risk score.
- `POST /v1/athletes/{id}/exercise-substitution` — F6, pain-driven substitution.

Not yet implemented: F3 (tapering), F4 (autoregulation loop), F7 (recovery/readiness),
ML layer (v2), and the real Claude call in `engine/explainability.py` (currently a
pass-through fallback).
