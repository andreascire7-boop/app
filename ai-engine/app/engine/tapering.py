"""Rules-engine v1 for competition tapering (FASE 7 §7.4, grounded in
periodizzazione.md's tapering section: 1-3 weeks depending on the event, volume
cut ~40-70% while intensity is maintained, decline graduale/exponenziale — deeper
cuts the closer to the event).

`weeks_before_event = 0` means the week containing the event itself.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import CompetitionImportance, TaperPlanInput, TaperPlanOutput, TaperWeek

# (taper_weeks, factors from farthest-to-closest to the event) per importance.
# Deeper events (nazionale) get a longer, more gradual taper; deepest reduction is
# always the event week itself.
TAPER_PROFILES: dict[CompetitionImportance, tuple[int, list[float]]] = {
    CompetitionImportance.nazionale: (3, [0.8, 0.65, 0.5]),
    CompetitionImportance.regionale: (2, [0.7, 0.55]),
    CompetitionImportance.locale: (1, [0.6]),
}


def compute_taper_plan(payload: TaperPlanInput) -> TaperPlanOutput:
    taper_weeks, factors = TAPER_PROFILES[payload.importance]
    available_weeks = payload.days_until_event // 7

    if available_weeks >= taper_weeks:
        is_partial = False
        applied_factors = factors
    elif available_weeks == 0:
        is_partial = True
        applied_factors = [factors[-1]]
    else:
        is_partial = True
        applied_factors = factors[-available_weeks:]

    weeks_before_event_sequence = list(range(len(applied_factors) - 1, -1, -1))
    weeks = [
        TaperWeek(weeks_before_event=wbe, volume_adjustment_factor=factor)
        for wbe, factor in zip(weeks_before_event_sequence, applied_factors)
    ]

    if is_partial:
        explanation = (
            f"Preavviso di {payload.days_until_event} giorni insufficiente per un taper completo di "
            f"{taper_weeks} settimane ({payload.importance.value}): applicata solo la riduzione delle "
            f"{len(applied_factors)} settimane più vicine all'evento, intensità mantenuta."
        )
    else:
        explanation = (
            f"Taper di {taper_weeks} settimane per evento {payload.importance.value}: riduzione "
            "progressiva del volume, intensità mantenuta."
        )

    return TaperPlanOutput(
        athlete_id=payload.athlete_id,
        taper_weeks=taper_weeks,
        is_partial=is_partial,
        weeks=weeks,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
