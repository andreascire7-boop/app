from app.engine.tapering import compute_taper_plan
from app.models.schemas import CompetitionImportance, TaperPlanInput


def test_full_taper_for_national_event_with_enough_notice():
    result = compute_taper_plan(
        TaperPlanInput(athlete_id="a1", days_until_event=25, importance=CompetitionImportance.nazionale)
    )
    assert result.taper_weeks == 3
    assert result.is_partial is False
    assert len(result.weeks) == 3
    # deepest reduction (lowest factor) must be the event week itself
    assert result.weeks[-1].weeks_before_event == 0
    assert result.weeks[-1].volume_adjustment_factor == min(w.volume_adjustment_factor for w in result.weeks)


def test_partial_taper_when_notice_is_short():
    result = compute_taper_plan(
        TaperPlanInput(athlete_id="a1", days_until_event=10, importance=CompetitionImportance.nazionale)
    )
    assert result.is_partial is True
    assert len(result.weeks) == 1  # only 1 full week available (10 // 7)


def test_zero_notice_still_applies_event_week_reduction():
    result = compute_taper_plan(
        TaperPlanInput(athlete_id="a1", days_until_event=2, importance=CompetitionImportance.locale)
    )
    assert result.is_partial is True
    assert len(result.weeks) == 1
    assert result.weeks[0].weeks_before_event == 0


def test_local_event_gets_shorter_taper_than_national():
    local = compute_taper_plan(
        TaperPlanInput(athlete_id="a1", days_until_event=30, importance=CompetitionImportance.locale)
    )
    national = compute_taper_plan(
        TaperPlanInput(athlete_id="a1", days_until_event=30, importance=CompetitionImportance.nazionale)
    )
    assert local.taper_weeks < national.taper_weeks
