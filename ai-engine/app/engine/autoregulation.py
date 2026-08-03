"""Rules-engine v1 for feedback-driven adaptation (FASE 7 §7.2).

Rule taken directly from the skill (program-design.md's autoregulation principle +
FASE 7 §7.2): RPE consistently above the block's expected value for >=3 consecutive
sessions triggers a volume-only reduction (never intensity, to protect the neural/
speed adaptations) of 10-20%. The >=9 "very high fatigue" deload trigger below is a
v1 heuristic proxy for "cumulated fatigue beyond the athlete's threshold" — the
skill doesn't give a precise number here, and FASE 7's roadmap (§7.8) plans to
replace this with a learned, per-athlete threshold once enough data exists.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import AutoregulationInput, AutoregulationOutput

MIN_SESSIONS_FOR_PATTERN = 3
VOLUME_REDUCTION_FACTOR = 0.85  # -15%, within the 10-20% range FASE 7 §7.2 specifies
VERY_HIGH_FATIGUE_RPE = 9.0


def evaluate_autoregulation(payload: AutoregulationInput) -> AutoregulationOutput:
    recent = payload.recent_session_rpe

    if len(recent) < MIN_SESSIONS_FOR_PATTERN:
        return AutoregulationOutput(
            athlete_id=payload.athlete_id,
            volume_adjustment_factor=1.0,
            should_trigger_deload=False,
            explanation=(
                f"Meno di {MIN_SESSIONS_FOR_PATTERN} sessioni di storico RPE: "
                "nessun aggiustamento applicato."
            ),
            engine_version=ENGINE_VERSION,
        )

    last_sessions = recent[-MIN_SESSIONS_FOR_PATTERN:]
    is_systematically_high = all(rpe > payload.expected_rpe for rpe in last_sessions)

    if not is_systematically_high:
        return AutoregulationOutput(
            athlete_id=payload.athlete_id,
            volume_adjustment_factor=1.0,
            should_trigger_deload=False,
            explanation="Nessun pattern di affaticamento rilevato: nessun aggiustamento necessario.",
            engine_version=ENGINE_VERSION,
        )

    should_deload = all(rpe >= VERY_HIGH_FATIGUE_RPE for rpe in last_sessions)
    explanation = (
        f"RPE sopra l'atteso ({payload.expected_rpe}) nelle ultime "
        f"{MIN_SESSIONS_FOR_PATTERN} sessioni: volume ridotto del "
        f"{round((1 - VOLUME_REDUCTION_FACTOR) * 100)}% per la prossima seduta, intensità mantenuta."
    )
    if should_deload:
        explanation += " Fatica molto elevata su tutte le sessioni recenti: scarico anticipato consigliato."

    return AutoregulationOutput(
        athlete_id=payload.athlete_id,
        volume_adjustment_factor=VOLUME_REDUCTION_FACTOR,
        should_trigger_deload=should_deload,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
