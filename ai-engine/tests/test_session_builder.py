from app.engine.session_builder import build_sessions
from app.models.schemas import BlockType, BodyArea, ExerciseCatalogItem, SessionPlanRequest

CATALOG = [
    ExerciseCatalogItem(id="squat", movement_pattern="squat", body_area_risk_tags=[BodyArea.schiena, BodyArea.ginocchio]),
    ExerciseCatalogItem(id="rdl", movement_pattern="hip_hinge", body_area_risk_tags=[BodyArea.schiena]),
    ExerciseCatalogItem(id="bench", movement_pattern="spinta_orizzontale", body_area_risk_tags=[BodyArea.spalla, BodyArea.gomito]),
    ExerciseCatalogItem(id="med_ball_throw", movement_pattern="potenza_rotazionale", body_area_risk_tags=[BodyArea.schiena, BodyArea.spalla]),
    ExerciseCatalogItem(id="cuffia", movement_pattern="prehab_cuffia_rotatori", body_area_risk_tags=[]),
    ExerciseCatalogItem(id="core_antirot", movement_pattern="core_anti_rotazione", body_area_risk_tags=[BodyArea.spalla]),
    ExerciseCatalogItem(id="shuttle", movement_pattern="condizionamento_intervallato", body_area_risk_tags=[BodyArea.caviglia, BodyArea.ginocchio]),
]


def test_session_respects_order_power_strength_prehab_conditioning():
    request = SessionPlanRequest(athlete_id="a1", available_exercises=CATALOG, sessions_per_week=1)
    result = build_sessions(request)
    patterns = [
        next(e.movement_pattern for e in CATALOG if e.id == pe.exercise_id)
        for pe in result.sessions[0].exercises
    ]
    assert patterns[0] == "potenza_rotazionale"
    assert patterns[-1] == "condizionamento_intervallato"


def test_excluded_body_area_removes_matching_exercises():
    request = SessionPlanRequest(
        athlete_id="a1",
        available_exercises=CATALOG,
        excluded_body_areas=[BodyArea.spalla],
        sessions_per_week=1,
    )
    result = build_sessions(request)
    used_ids = {pe.exercise_id for s in result.sessions for pe in s.exercises}
    assert "bench" not in used_ids
    assert "med_ball_throw" not in used_ids


def test_accumulo_block_prescribes_higher_reps_than_realizzazione():
    accumulo_request = SessionPlanRequest(
        athlete_id="a1", available_exercises=CATALOG, block_type=BlockType.accumulo, sessions_per_week=1
    )
    realizzazione_request = SessionPlanRequest(
        athlete_id="a1", available_exercises=CATALOG, block_type=BlockType.realizzazione, sessions_per_week=1
    )
    accumulo_strength_reps = next(
        pe.target_reps for pe in build_sessions(accumulo_request).sessions[0].exercises if pe.exercise_id == "squat"
    )
    realizzazione_strength_reps = next(
        pe.target_reps for pe in build_sessions(realizzazione_request).sessions[0].exercises if pe.exercise_id == "squat"
    )
    assert accumulo_strength_reps > realizzazione_strength_reps


def test_multiple_sessions_per_week_generated():
    request = SessionPlanRequest(athlete_id="a1", available_exercises=CATALOG, sessions_per_week=3)
    result = build_sessions(request)
    assert len(result.sessions) == 3


def test_recovering_body_area_reduces_volume_without_excluding():
    request = SessionPlanRequest(
        athlete_id="a1",
        available_exercises=CATALOG,
        reduced_load_body_areas=[BodyArea.schiena],
        sessions_per_week=1,
    )
    result = build_sessions(request)
    used_ids = {pe.exercise_id for s in result.sessions for pe in s.exercises}
    assert "rdl" in used_ids  # not excluded, just reduced

    baseline = build_sessions(SessionPlanRequest(athlete_id="a1", available_exercises=CATALOG, sessions_per_week=1))
    baseline_sets = next(pe.target_sets for pe in baseline.sessions[0].exercises if pe.exercise_id == "rdl")
    reduced_sets = next(pe.target_sets for pe in result.sessions[0].exercises if pe.exercise_id == "rdl")
    assert reduced_sets < baseline_sets


PREHAB_PATTERNS = {"prehab_cuffia_rotatori", "core_anti_rotazione"}


def test_preventive_focus_area_prioritized_in_prehab_slot():
    baseline = build_sessions(SessionPlanRequest(athlete_id="a1", available_exercises=CATALOG, sessions_per_week=1))
    baseline_prehab = next(
        pe.exercise_id
        for pe in baseline.sessions[0].exercises
        if next(e.movement_pattern for e in CATALOG if e.id == pe.exercise_id) in PREHAB_PATTERNS
    )
    assert baseline_prehab == "cuffia"  # catalog order without any preventive focus

    request = SessionPlanRequest(
        athlete_id="a1",
        available_exercises=CATALOG,
        preventive_focus_areas=[BodyArea.spalla],
        sessions_per_week=1,
    )
    result = build_sessions(request)
    prioritized_prehab = next(
        pe.exercise_id
        for pe in result.sessions[0].exercises
        if next(e.movement_pattern for e in CATALOG if e.id == pe.exercise_id) in PREHAB_PATTERNS
    )
    assert prioritized_prehab == "core_antirot"  # spalla-tagged prehab now prioritized
