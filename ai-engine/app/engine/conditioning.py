"""Rules-engine v1 for speed/agility and energy-system conditioning (FASE 7 §7.1 —
the "velocita_agilita_brevi_distanze" and "condizionamento_intervallato_sport_specifico"
qualities from periodization.py's target_qualities_for).

Grounded only in the scienze-motorie-sc skill (velocita-agilita.md,
sistemi-energetici-condizionamento.md, tennis-sport-specifico.md) — tennis/padel are
intermittent sports dominated by the acceleration phase over short distances
(<10-20 m), with a mixed energy-system profile: repeated alactic sprints on an
aerobic base that drives recovery between points/games. No invented thresholds
beyond what those reference files state.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import (
    AgilityMode,
    AthleteLevel,
    BlockType,
    ConditioningPlanInput,
    ConditioningPlanOutput,
    EnergySystemTarget,
    IntervalPrescription,
    SprintPrescription,
)

# velocita-agilita.md: progression goes closed -> semi-open -> open/reactive, and it's
# the perceptual-cognitive (reactive) layer that separates the "expert" agile athlete.
# v1 keeps beginners/intermediates on closed COD drills (mechanics first) and unlocks
# reactive/open drills once an athlete is advanced.
REACTIVE_AGILITY_LEVELS = {AthleteLevel.advanced, AthleteLevel.semi_pro, AthleteLevel.pro}

# Sprint distance fixed at tennis/padel's dominant acceleration window
# (tennis-sport-specifico.md), within velocita-agilita.md's 10-30 m specific-sprint range.
SPRINT_DISTANCE_M = 15
SPRINT_RECOVERY = "pieno (~2-3 min tra le ripetute)"

# Reps per block type: accumulo builds the volume of quality reps, realizzazione trims
# volume to keep freshness/specificity high close to competition. Recovery is always
# full — velocita-agilita.md is explicit that sprint work trains quality, not
# conditioning; incomplete recovery here would defeat the point.
SPRINT_REPS_BY_BLOCK: dict[BlockType | None, int] = {
    BlockType.accumulo: 6,
    BlockType.trasmutazione: 5,
    BlockType.realizzazione: 4,
    None: 5,
}

# RSA work:rest bands from sistemi-energetici-condizionamento.md's interval table:
# fosfageni/quality ~1:12-1:20, glicolitico/capacità ~1:3-1:5. v1 fixes a work duration
# matched to the sprint distance and derives rest from the ratio. trasmutazione is the
# one block explicitly meant to build glycolytic tolerance ("da usare con parsimonia") —
# the only block that shortens the rest ratio, and only when no competition is imminent.
RSA_WORK_SECONDS = 5  # ~15 m sprint effort
RSA_REPS_BY_BLOCK: dict[BlockType | None, int] = {
    BlockType.accumulo: 6,
    BlockType.trasmutazione: 8,
    BlockType.realizzazione: 5,
    None: 6,
}
WEEKS_UNTIL_EVENT_PROTECT_THRESHOLD = 1


def choose_agility_mode(level: AthleteLevel) -> AgilityMode:
    return AgilityMode.reattivo if level in REACTIVE_AGILITY_LEVELS else AgilityMode.chiuso


def build_sprint_prescription(block_type: BlockType | None) -> SprintPrescription:
    reps = SPRINT_REPS_BY_BLOCK[block_type]
    return SprintPrescription(reps=reps, distance_m=SPRINT_DISTANCE_M, recovery=SPRINT_RECOVERY)


def _close_to_event(weeks_until_event: int | None) -> bool:
    return weeks_until_event is not None and weeks_until_event <= WEEKS_UNTIL_EVENT_PROTECT_THRESHOLD


def build_rsa_prescription(block_type: BlockType | None, weeks_until_event: int | None) -> IntervalPrescription:
    reps = RSA_REPS_BY_BLOCK[block_type]
    want_glycolytic = block_type == BlockType.trasmutazione and not _close_to_event(weeks_until_event)

    if want_glycolytic:
        rest_seconds = RSA_WORK_SECONDS * 4  # ~1:4, within the 1:3-1:5 capacità band
        system = EnergySystemTarget.glicolitico
        note = "Recupero incompleto per allenare la tolleranza glicolitica (usare con parsimonia)."
    else:
        rest_seconds = RSA_WORK_SECONDS * 15  # ~1:15, within the 1:12-1:20 qualità band
        system = EnergySystemTarget.fosfageni
        note = "Recupero pieno: qualità della potenza alattacida, non condizionamento."
        if block_type == BlockType.trasmutazione:
            note += " Stimolo glicolitico sospeso per evento imminente."

    return IntervalPrescription(
        energy_system=system,
        work_seconds=RSA_WORK_SECONDS,
        rest_seconds=rest_seconds,
        repetitions=reps,
        note=note,
    )


def energy_system_targets(block_type: BlockType | None, weeks_until_event: int | None) -> list[EnergySystemTarget]:
    # sistemi-energetici-condizionamento.md: sport intermittenti = scatti alattacidi
    # ripetuti su base aerobica per il recupero — questi due sono sempre presenti.
    targets = [EnergySystemTarget.fosfageni, EnergySystemTarget.ossidativo]
    if block_type == BlockType.trasmutazione and not _close_to_event(weeks_until_event):
        targets.append(EnergySystemTarget.glicolitico)
    return targets


def build_conditioning_plan(payload: ConditioningPlanInput) -> ConditioningPlanOutput:
    agility_mode = choose_agility_mode(payload.level)
    sprint = build_sprint_prescription(payload.block_type)
    rsa = build_rsa_prescription(payload.block_type, payload.weeks_until_event)
    targets = energy_system_targets(payload.block_type, payload.weeks_until_event)

    interference_note = (
        "Separare condizionamento e forza pesante di ~6h o su giorni diversi dove possibile "
        "(effetto interferenza, sistemi-energetici-condizionamento.md); nella stessa seduta, "
        "il condizionamento segue sempre la forza (program-design.md)."
    )

    explanation = (
        f"Agilità in modalità '{agility_mode.value}' per livello '{payload.level.value}' "
        "(velocita-agilita.md: progressione chiuso -> reattivo con l'esperienza). "
        f"Sprint: {sprint.reps}x{sprint.distance_m}m, recupero {sprint.recovery}. "
        f"RSA: {rsa.repetitions}x{rsa.work_seconds}s lavoro / {rsa.rest_seconds}s recupero "
        f"(target {rsa.energy_system.value})."
    )
    if _close_to_event(payload.weeks_until_event):
        explanation += " Evento entro 1 settimana: nessun nuovo stimolo glicolitico ad alto impatto."

    return ConditioningPlanOutput(
        athlete_id=payload.athlete_id,
        agility_mode=agility_mode,
        sprint=sprint,
        rsa=rsa,
        energy_system_targets=targets,
        interference_note=interference_note,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
