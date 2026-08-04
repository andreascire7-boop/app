"""Rules-engine v1 for program generation (docs/product-design FASE 7, §7.1).

Deterministic and auditable on purpose — see FASE 4 §4.9: the decision logic must
never be a free-form LLM prompt on a domain with physical-safety implications.
Grounded only in the scienze-motorie-sc skill (periodizzazione.md, program-design.md,
tennis-sport-specifico.md) — no invented thresholds beyond what that knowledge base states.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import (
    AthleteNeedsInput,
    AthleteLevel,
    BlockType,
    MacrocycleOutput,
    MesocycleOutput,
    PeriodizationModel,
)

# "Molte gare l'anno" — periodizzazione.md's threshold for recommending a blocks model
# over a simpler one for advanced athletes.
MANY_COMPETITIONS_PER_YEAR_THRESHOLD = 6


def choose_model(athlete: AthleteNeedsInput) -> PeriodizationModel:
    competitions = athlete.competitions_per_year or 0

    if athlete.level in (AthleteLevel.beginner,) or competitions < 2:
        return PeriodizationModel.lineare
    if athlete.level in (AthleteLevel.intermediate,):
        return PeriodizationModel.ondulata
    # advanced / semi_pro / pro with a real competitive calendar
    if competitions >= MANY_COMPETITIONS_PER_YEAR_THRESHOLD:
        return PeriodizationModel.a_blocchi
    return PeriodizationModel.ondulata


def target_qualities_for(athlete: AthleteNeedsInput) -> list[str]:
    # Priorities fixed by tennis-sport-specifico.md regardless of model chosen:
    # kinetic-chain power, multi-joint strength/power, short-distance speed/agility,
    # sport-specific interval conditioning, shoulder/elbow/core prehab.
    return [
        "potenza_rotazionale",
        "forza_potenza_multiarticolare",
        "velocita_agilita_brevi_distanze",
        "condizionamento_intervallato_sport_specifico",
        "prehab_spalla_gomito_core",
    ]


def build_mesocycles(model: PeriodizationModel, qualities: list[str]) -> list[MesocycleOutput]:
    if model == PeriodizationModel.a_blocchi:
        return [
            MesocycleOutput(block_type=BlockType.accumulo, duration_weeks=4, target_qualities=qualities),
            MesocycleOutput(block_type=BlockType.trasmutazione, duration_weeks=4, target_qualities=qualities),
            MesocycleOutput(block_type=BlockType.realizzazione, duration_weeks=2, target_qualities=qualities),
        ]
    if model == PeriodizationModel.ondulata:
        return [MesocycleOutput(block_type=None, duration_weeks=4, target_qualities=qualities)]
    # lineare
    return [MesocycleOutput(block_type=None, duration_weeks=6, target_qualities=qualities)]


def excluded_body_areas(athlete: AthleteNeedsInput) -> list:
    # F1 edge case: an active injury blocks standard-load exercises for that area
    # until the substitution/RTP engine (F6) clears it — never silently ignored.
    return [item.body_area for item in athlete.injury_history if item.status == "active"]


def reduced_load_body_areas(athlete: AthleteNeedsInput) -> list:
    # In recupero: non più esclusa a priori, ma il volume resta ridotto finché lo
    # stato non passa a "resolved" (vedi session_builder.RECOVERING_VOLUME_FACTOR).
    return [item.body_area for item in athlete.injury_history if item.status == "recovering"]


def preventive_focus_areas(athlete: AthleteNeedsInput) -> list:
    # Qualunque zona con storico infortuni (attivo, in recupero o risolto) merita
    # priorità di prehab preventivo, non solo le zone attualmente escluse/ridotte.
    seen = []
    for item in athlete.injury_history:
        if item.body_area not in seen:
            seen.append(item.body_area)
    return seen


def generate_macrocycle(athlete: AthleteNeedsInput) -> MacrocycleOutput:
    model = choose_model(athlete)
    qualities = target_qualities_for(athlete)
    mesocycles = build_mesocycles(model, qualities)
    excluded = excluded_body_areas(athlete)
    reduced = reduced_load_body_areas(athlete)
    preventive = preventive_focus_areas(athlete)

    explanation = (
        f"Modello {model.value} scelto per livello '{athlete.level.value}' "
        f"e {athlete.competitions_per_year or 0} competizioni/anno dichiarate."
    )
    if excluded:
        areas = ", ".join(a.value for a in excluded)
        explanation += f" Esercizi a rischio esclusi per: {areas} (infortunio attivo dichiarato)."
    if reduced:
        areas = ", ".join(a.value for a in reduced)
        explanation += f" Volume ridotto per: {areas} (infortunio in fase di recupero)."
    if preventive:
        areas = ", ".join(a.value for a in preventive)
        explanation += f" Prehab preventivo prioritario per: {areas} (storico infortuni)."

    return MacrocycleOutput(
        athlete_id=athlete.athlete_id,
        model_type=model,
        mesocycles=mesocycles,
        excluded_body_areas=excluded,
        reduced_load_body_areas=reduced,
        preventive_focus_areas=preventive,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
