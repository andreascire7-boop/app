"""Rules-engine v1 for recovery/readiness (FASE 7 §7.6).

Priority order communicated to the athlete always follows the skill: sleep is the
single most powerful recovery factor, ahead of nutrition/hydration, stress
management, and passive recovery aids (whose evidence is more variable) — this
engine's factor ordering and recommendation text reflect that, not an arbitrary
ranking. Weights below are a v1 heuristic (no single validated "readiness formula"
exists in the skill) — FASE 7 §7.8 plans to replace/calibrate this with real
outcome data once available.
"""

from statistics import mean

from app.core.config import ENGINE_VERSION
from app.models.schemas import ReadinessInput, ReadinessOutput

LOW_SLEEP_HOURS = 6.0
SUBOPTIMAL_SLEEP_HOURS = 7.0
HIGH_RECENT_RPE = 8.0
HIGH_STRESS_LEVEL = 8


def compute_readiness(payload: ReadinessInput) -> ReadinessOutput:
    score = 100.0
    factors: list[str] = []

    if payload.sleep_hours is not None:
        if payload.sleep_hours < LOW_SLEEP_HOURS:
            score -= 30
            factors.append(f"sonno insufficiente ({payload.sleep_hours}h, sotto le {LOW_SLEEP_HOURS}h)")
        elif payload.sleep_hours < SUBOPTIMAL_SLEEP_HOURS:
            score -= 15
            factors.append(f"sonno sotto il range ottimale ({payload.sleep_hours}h)")

    if payload.sleep_quality is not None and payload.sleep_quality <= 2:
        score -= 15
        factors.append("qualità del sonno percepita bassa")

    if payload.recent_session_rpe:
        avg_rpe = mean(payload.recent_session_rpe)
        if avg_rpe > HIGH_RECENT_RPE:
            score -= 20
            factors.append(f"sforzo percepito molto alto nelle ultime sessioni (media RPE {avg_rpe:.1f})")

    if payload.recent_pain_reports > 0:
        score -= 10 * min(payload.recent_pain_reports, 3)
        factors.append("dolore segnalato di recente")

    if payload.stress_level is not None and payload.stress_level >= HIGH_STRESS_LEVEL:
        score -= 10
        factors.append("stress percepito elevato")

    score = max(0.0, min(100.0, score))

    if score >= 75:
        level = "alta"
        recommendation = "Prontezza buona: procedi con la sessione pianificata."
    elif score >= 50:
        level = "media"
        recommendation = "Prontezza ridotta: valuta una sessione a volume più basso oggi."
    else:
        level = "bassa"
        recommendation = (
            "Prontezza bassa: priorità al sonno stanotte; oggi meglio recupero attivo "
            "o una sessione molto leggera piuttosto che il piano pieno."
        )

    if not factors:
        factors.append("nessun segnale negativo rilevato")

    return ReadinessOutput(
        athlete_id=payload.athlete_id,
        readiness_score=score,
        level=level,
        contributing_factors=factors,
        recommendation=recommendation,
        engine_version=ENGINE_VERSION,
    )
