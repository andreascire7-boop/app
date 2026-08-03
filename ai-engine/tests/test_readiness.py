from app.engine.readiness import compute_readiness
from app.models.schemas import ReadinessInput


def test_good_sleep_and_no_signals_gives_high_readiness():
    result = compute_readiness(ReadinessInput(athlete_id="a1", sleep_hours=8, sleep_quality=5))
    assert result.level == "alta"
    assert result.readiness_score == 100


def test_low_sleep_lowers_readiness():
    result = compute_readiness(ReadinessInput(athlete_id="a1", sleep_hours=5))
    assert result.readiness_score < 100
    assert any("sonno" in f for f in result.contributing_factors)


def test_combined_negative_signals_trigger_low_readiness():
    result = compute_readiness(
        ReadinessInput(
            athlete_id="a1",
            sleep_hours=5,
            sleep_quality=1,
            recent_session_rpe=[8.5, 9.0],
            recent_pain_reports=2,
            stress_level=9,
        )
    )
    assert result.level == "bassa"
    assert result.readiness_score < 50


def test_score_never_goes_below_zero():
    result = compute_readiness(
        ReadinessInput(
            athlete_id="a1",
            sleep_hours=3,
            sleep_quality=1,
            recent_session_rpe=[9.5, 9.8],
            recent_pain_reports=5,
            stress_level=10,
        )
    )
    assert result.readiness_score >= 0
