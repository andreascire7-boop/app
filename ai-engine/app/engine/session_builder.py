"""Rules-engine v1 for turning a mesocycle into concrete sessions (FASE 7 §7.1,
grounded in program-design.md's 6-step process and forza-potenza.md's rep continuum).

Session order follows program-design.md: complex/explosive work first (fresh CNS),
then heavy multi-joint strength, then prehab/accessories, then conditioning.
Set/rep/RPE targets vary by mesocycle block_type per periodizzazione.md's block
descriptions (accumulo = high volume/moderate intensity, trasmutazione = moderate
volume/high intensity, realizzazione = reduced volume/high intensity+specificity).
These are v1 defaults within the skill's documented ranges, not universal prescriptions
— program-design.md itself calls set/rep tables "guide, not dogma".
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import (
    BlockType,
    ExerciseCatalogItem,
    PlannedSession,
    PlannedSessionExercise,
    SessionPlanRequest,
    SessionPlanResponse,
)

POWER_PATTERNS = {"potenza_rotazionale", "sprint_accelerazione", "agilita_reattiva", "spinta_verticale_esplosiva"}
STRENGTH_PATTERNS = {"squat", "hip_hinge", "spinta_orizzontale", "trazione_verticale", "lunge_monolaterale"}
PREHAB_PATTERNS = {
    "core_anti_rotazione",
    "prehab_cuffia_rotatori",
    "prehab_scapolare",
    "forza_eccentrica_ischiocrurali",
}
CONDITIONING_PATTERNS = {"condizionamento_intervallato"}

# Infortunio in fase di recupero (non più attivo, non ancora risolto): l'esercizio
# resta in catalogo ma con volume ridotto — periodizzazione.md non fissa un valore
# esatto, 0.7 è coerente con l'entità di riduzione già usata per il taper leggero.
RECOVERING_VOLUME_FACTOR = 0.7

# (sets, reps, rpe) per category per block type — None reps means "not rep-based"
# (e.g. a timed conditioning interval).
PRESCRIPTIONS: dict[BlockType | None, dict[str, tuple[int, int | None, float]]] = {
    BlockType.accumulo: {"power": (3, 5, 6.5), "strength": (3, 9, 7.0), "prehab": (3, 15, 5.0), "conditioning": (1, None, 6.0)},
    BlockType.trasmutazione: {"power": (4, 3, 7.5), "strength": (4, 5, 8.0), "prehab": (2, 12, 5.0), "conditioning": (1, None, 7.0)},
    BlockType.realizzazione: {"power": (3, 2, 8.0), "strength": (3, 3, 8.5), "prehab": (2, 10, 5.0), "conditioning": (1, None, 6.0)},
    None: {"power": (3, 4, 7.0), "strength": (3, 7, 7.0), "prehab": (2, 12, 5.0), "conditioning": (1, None, 6.5)},
}


def _allowed(exercises: list[ExerciseCatalogItem], excluded_areas) -> list[ExerciseCatalogItem]:
    excluded = set(excluded_areas)
    return [e for e in exercises if not (set(e.body_area_risk_tags) & excluded)]


def _pick(
    exercises: list[ExerciseCatalogItem],
    patterns: set[str],
    count: int,
    offset: int,
    priority_areas: set | None = None,
) -> list[ExerciseCatalogItem]:
    matches = [e for e in exercises if e.movement_pattern in patterns]
    if priority_areas:
        # Prehab preventivo: le zone con storico infortuni passano in testa alla lista.
        matches = sorted(
            matches,
            key=lambda e: 0 if set(e.body_area_risk_tags) & priority_areas else 1,
        )
    if not matches:
        return []
    picked = []
    for i in range(count):
        picked.append(matches[(offset + i) % len(matches)])
    # de-duplicate while preserving order (small catalogs can have fewer distinct matches than `count`)
    seen = set()
    unique = []
    for e in picked:
        if e.id not in seen:
            unique.append(e)
            seen.add(e.id)
    return unique


def build_sessions(request: SessionPlanRequest) -> SessionPlanResponse:
    safe_exercises = _allowed(request.available_exercises, request.excluded_body_areas)
    prescriptions = PRESCRIPTIONS[request.block_type]
    reduced_areas = set(request.reduced_load_body_areas)
    priority_areas = set(request.preventive_focus_areas)

    sessions: list[PlannedSession] = []
    for week_session_index in range(request.sessions_per_week):
        power = _pick(safe_exercises, POWER_PATTERNS, 1, week_session_index)
        strength = _pick(safe_exercises, STRENGTH_PATTERNS, 2, week_session_index)
        prehab = _pick(safe_exercises, PREHAB_PATTERNS, 1, week_session_index, priority_areas=priority_areas)
        conditioning = _pick(safe_exercises, CONDITIONING_PATTERNS, 1, week_session_index)

        planned_exercises: list[PlannedSessionExercise] = []
        order_index = 0
        for category, items in (("power", power), ("strength", strength), ("prehab", prehab), ("conditioning", conditioning)):
            sets, reps, rpe = prescriptions[category]
            for item in items:
                item_sets = sets
                if item_sets is not None and reduced_areas and (set(item.body_area_risk_tags) & reduced_areas):
                    item_sets = max(1, round(item_sets * RECOVERING_VOLUME_FACTOR))
                planned_exercises.append(
                    PlannedSessionExercise(
                        exercise_id=item.id,
                        order_index=order_index,
                        target_sets=item_sets,
                        target_reps=reps,
                        target_rpe=rpe,
                    )
                )
                order_index += 1

        sessions.append(
            PlannedSession(
                session_focus=f"Seduta {week_session_index + 1}/{request.sessions_per_week}",
                exercises=planned_exercises,
            )
        )

    explanation_parts = [
        f"{len(sessions)} sedute generate (ordine: potenza/esplosivo → forza multiarticolare → "
        f"prehab → condizionamento, program-design.md)."
    ]
    if request.excluded_body_areas:
        explanation_parts.append(f"{len(request.excluded_body_areas)} zone escluse dal catalogo per infortunio attivo.")
    if reduced_areas:
        explanation_parts.append(f"Volume ridotto ({int((1 - RECOVERING_VOLUME_FACTOR) * 100)}%) per zone in recupero.")
    if priority_areas:
        explanation_parts.append("Prehab preventivo prioritizzato per lo storico infortuni dell'atleta.")
    explanation = " ".join(explanation_parts)

    return SessionPlanResponse(
        athlete_id=request.athlete_id,
        sessions=sessions,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
