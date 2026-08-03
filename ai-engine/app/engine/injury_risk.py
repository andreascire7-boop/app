"""Rules-engine v1 for injury-risk detection (docs/product-design FASE 7, §7.3).

Per prevenzione-rehab-prehab.md the skill is explicit: ACWR "is a monitoring tool, not
a law" and must be read in context, not against a universal fixed cutoff. The
SPIKE_THRESHOLD below is a v1 placeholder default — the roadmap (FASE 7 §7.8, FASE 9
M5.1-5.2) explicitly plans to replace it with thresholds calibrated on each athlete's
own historical variability once enough data accumulates. Treat it as configurable,
not as clinical truth.
"""

from datetime import date, timedelta

from app.core.config import ENGINE_VERSION
from app.models.schemas import InjuryRiskInput, InjuryRiskOutput, RiskLevel

ACUTE_WINDOW_DAYS = 7
CHRONIC_WINDOW_DAYS = 28
MIN_DAYS_FOR_RELIABLE_ESTIMATE = 28
SPIKE_THRESHOLD = 1.5  # placeholder default, see module docstring


def _average_load(points, since: date, until: date) -> float | None:
    window = [p.session_load for p in points if since <= date.fromisoformat(p.date) <= until]
    if not window:
        return None
    return sum(window) / len(window)


def compute_acwr(risk_input: InjuryRiskInput) -> tuple[float | None, bool]:
    if not risk_input.load_history:
        return None, False

    today = max(date.fromisoformat(p.date) for p in risk_input.load_history)
    acute = _average_load(risk_input.load_history, today - timedelta(days=ACUTE_WINDOW_DAYS), today)
    chronic = _average_load(risk_input.load_history, today - timedelta(days=CHRONIC_WINDOW_DAYS), today)

    span_days = (today - min(date.fromisoformat(p.date) for p in risk_input.load_history)).days
    data_sufficient = span_days >= MIN_DAYS_FOR_RELIABLE_ESTIMATE

    if not chronic or chronic == 0 or acute is None:
        return None, data_sufficient
    return acute / chronic, data_sufficient


def assess_risk(risk_input: InjuryRiskInput) -> InjuryRiskOutput:
    acwr, data_sufficient = compute_acwr(risk_input)
    factors: list[str] = []
    score = 0

    if acwr is not None and acwr >= SPIKE_THRESHOLD:
        score += 2
        factors.append(f"incremento rapido del carico acuto rispetto al cronico (ACWR={acwr:.2f})")

    if risk_input.recent_pain_reports >= 2:
        score += 2
        factors.append("segnalazioni di dolore ricorrenti nelle ultime sessioni")

    if risk_input.has_injury_history_same_area:
        # Prior injury in the same area is the strongest intrinsic risk factor
        # (prevenzione-rehab-prehab.md) — weighted accordingly.
        score += 2
        factors.append("storico infortuni pregresso nella stessa zona")

    if not data_sufficient:
        factors.append("meno di 4 settimane di storico: stima di rischio meno affidabile")

    if score >= 4:
        level = RiskLevel.red
        recommendation = "Riduci il carico della prossima sessione e valuta un consulto professionale."
    elif score >= 2:
        level = RiskLevel.yellow
        recommendation = "Monitora da vicino: considera una sessione a volume ridotto."
    else:
        level = RiskLevel.green
        recommendation = "Nessun segnale di rischio elevato: prosegui il piano pianificato."

    if not factors:
        factors.append("nessun fattore di rischio rilevante rilevato")

    return InjuryRiskOutput(
        athlete_id=risk_input.athlete_id,
        acwr=acwr,
        risk_level=level,
        contributing_factors=factors,
        recommendation=recommendation,
        data_sufficient=data_sufficient,
        engine_version=ENGINE_VERSION,
    )
