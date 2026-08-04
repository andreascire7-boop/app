"""Rules-engine v1 for meso-cycle close-out feedback (Sistema Mesocicli).

Same autoregulation principle as autoregulation.py but applied at the block level
instead of the single-session level: difficulty/energy/recovery/pain/satisfaction
reported when a mesociclo is closed set the starting volume of the *next* block,
before any within-block session-level autoregulation kicks in. Deterministic and
auditable — grounded in program-design.md's autoregulation principle, no free-form
LLM decision on training load.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import MesocycleAdjustmentOutput, MesocycleFeedbackInput

HIGH_DIFFICULTY = 8
LOW_RECOVERY = 3
HIGH_PAIN = 6
LOW_DIFFICULTY = 4
HIGH_RECOVERY = 7
LOW_PAIN = 2
HIGH_SATISFACTION = 7

REDUCE_FACTOR = 0.85  # coerente con VOLUME_REDUCTION_FACTOR di autoregulation.py
INCREASE_FACTOR = 1.10  # sovraccarico progressivo prudente

MIN_FACTOR = 0.6
MAX_FACTOR = 1.15


def evaluate_mesocycle_feedback(payload: MesocycleFeedbackInput) -> MesocycleAdjustmentOutput:
    factor = 1.0
    reasons: list[str] = []

    should_reduce = (
        payload.difficulty_perceived >= HIGH_DIFFICULTY
        or payload.recovery_quality <= LOW_RECOVERY
        or payload.pain_level >= HIGH_PAIN
    )
    should_increase = (
        payload.difficulty_perceived <= LOW_DIFFICULTY
        and payload.recovery_quality >= HIGH_RECOVERY
        and payload.pain_level <= LOW_PAIN
        and payload.program_satisfaction >= HIGH_SATISFACTION
    )

    if should_reduce:
        factor *= REDUCE_FACTOR
        if payload.difficulty_perceived >= HIGH_DIFFICULTY:
            reasons.append(f"difficoltà percepita alta ({payload.difficulty_perceived}/10)")
        if payload.recovery_quality <= LOW_RECOVERY:
            reasons.append(f"recupero scarso ({payload.recovery_quality}/10)")
        if payload.pain_level >= HIGH_PAIN:
            reasons.append(f"dolore riportato elevato ({payload.pain_level}/10)")
    elif should_increase:
        factor *= INCREASE_FACTOR
        reasons.append(
            f"difficoltà bassa ({payload.difficulty_perceived}/10), recupero buono "
            f"({payload.recovery_quality}/10) e soddisfazione alta ({payload.program_satisfaction}/10)"
        )

    factor = max(MIN_FACTOR, min(MAX_FACTOR, factor))

    if factor < 1.0:
        explanation = (
            f"Volume del prossimo mesociclo ridotto del {round((1 - factor) * 100)}% "
            f"per: {', '.join(reasons)}."
        )
    elif factor > 1.0:
        explanation = (
            f"Volume del prossimo mesociclo aumentato del {round((factor - 1) * 100)}% "
            f"(sovraccarico progressivo) per: {', '.join(reasons)}."
        )
    else:
        explanation = "Feedback nella norma: volume del prossimo mesociclo invariato."

    return MesocycleAdjustmentOutput(
        athlete_id=payload.athlete_id,
        volume_adjustment_factor=round(factor, 3),
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
