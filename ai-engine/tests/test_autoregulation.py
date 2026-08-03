from app.engine.autoregulation import evaluate_autoregulation
from app.models.schemas import AutoregulationInput


def test_insufficient_history_no_adjustment():
    result = evaluate_autoregulation(
        AutoregulationInput(athlete_id="a1", recent_session_rpe=[8.0, 8.5], expected_rpe=7.0)
    )
    assert result.volume_adjustment_factor == 1.0
    assert result.should_trigger_deload is False


def test_no_pattern_no_adjustment():
    result = evaluate_autoregulation(
        AutoregulationInput(athlete_id="a1", recent_session_rpe=[6.0, 8.5, 6.5], expected_rpe=7.0)
    )
    assert result.volume_adjustment_factor == 1.0


def test_three_high_rpe_sessions_reduce_volume():
    result = evaluate_autoregulation(
        AutoregulationInput(athlete_id="a1", recent_session_rpe=[8.0, 8.2, 8.5], expected_rpe=7.0)
    )
    assert result.volume_adjustment_factor < 1.0
    assert result.should_trigger_deload is False


def test_very_high_rpe_triggers_deload():
    result = evaluate_autoregulation(
        AutoregulationInput(athlete_id="a1", recent_session_rpe=[9.0, 9.5, 9.0], expected_rpe=7.0)
    )
    assert result.should_trigger_deload is True
