# Risk module (placeholder)

Wires the Core API to the AI engine's injury-risk output (F5, docs/product-design FASE 3/7).
Scheduled for milestone M2.2 in the roadmap (FASE 9) — not implemented yet.

Planned surface once built:
- `GET /athletes/:athleteId/risk` — latest `RiskAssessment` + contributing factors.
- `POST /athletes/:athleteId/pain-reports` — feeds `PainReport`, read by the AI engine's
  substitution/RTP logic (F6).
