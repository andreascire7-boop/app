from app.engine.periodization import choose_model, generate_macrocycle
from app.models.schemas import (
    AthleteLevel,
    AthleteNeedsInput,
    BodyArea,
    InjuryHistoryItem,
    PeriodizationModel,
    Sport,
)


def make_athlete(**overrides) -> AthleteNeedsInput:
    defaults = dict(
        athlete_id="athlete-1",
        primary_sport=Sport.padel,
        level=AthleteLevel.intermediate,
        weekly_availability_days=3,
        competitions_per_year=2,
        injury_history=[],
    )
    defaults.update(overrides)
    return AthleteNeedsInput(**defaults)


def test_beginner_gets_linear_model():
    athlete = make_athlete(level=AthleteLevel.beginner, competitions_per_year=0)
    assert choose_model(athlete) == PeriodizationModel.lineare


def test_intermediate_gets_undulating_model():
    athlete = make_athlete(level=AthleteLevel.intermediate, competitions_per_year=3)
    assert choose_model(athlete) == PeriodizationModel.ondulata


def test_advanced_with_many_competitions_gets_block_model():
    athlete = make_athlete(level=AthleteLevel.advanced, competitions_per_year=8)
    assert choose_model(athlete) == PeriodizationModel.a_blocchi


def test_active_injury_excludes_body_area_from_plan():
    athlete = make_athlete(
        injury_history=[
            InjuryHistoryItem(body_area=BodyArea.spalla, status="active", severity_at_report=6)
        ]
    )
    result = generate_macrocycle(athlete)
    assert BodyArea.spalla in result.excluded_body_areas
    assert "spalla" in result.explanation


def test_recovering_injury_reduces_load_without_excluding():
    athlete = make_athlete(
        injury_history=[
            InjuryHistoryItem(body_area=BodyArea.ginocchio, status="recovering", severity_at_report=4)
        ]
    )
    result = generate_macrocycle(athlete)
    assert BodyArea.ginocchio not in result.excluded_body_areas
    assert BodyArea.ginocchio in result.reduced_load_body_areas
    assert BodyArea.ginocchio in result.preventive_focus_areas


def test_resolved_injury_only_flags_preventive_focus():
    athlete = make_athlete(
        injury_history=[
            InjuryHistoryItem(body_area=BodyArea.caviglia, status="resolved", severity_at_report=3)
        ]
    )
    result = generate_macrocycle(athlete)
    assert BodyArea.caviglia not in result.excluded_body_areas
    assert BodyArea.caviglia not in result.reduced_load_body_areas
    assert BodyArea.caviglia in result.preventive_focus_areas
