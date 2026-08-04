from app.engine.mesocycle_feedback import evaluate_mesocycle_feedback
from app.models.schemas import MesocycleFeedbackInput


def _feedback(**overrides):
    base = dict(
        athlete_id="a1",
        difficulty_perceived=5,
        energy_level=5,
        recovery_quality=5,
        pain_level=0,
        program_satisfaction=5,
    )
    base.update(overrides)
    return MesocycleFeedbackInput(**base)


def test_neutral_feedback_keeps_volume_unchanged():
    result = evaluate_mesocycle_feedback(_feedback())
    assert result.volume_adjustment_factor == 1.0


def test_high_difficulty_reduces_volume():
    result = evaluate_mesocycle_feedback(_feedback(difficulty_perceived=9))
    assert result.volume_adjustment_factor < 1.0


def test_poor_recovery_reduces_volume():
    result = evaluate_mesocycle_feedback(_feedback(recovery_quality=2))
    assert result.volume_adjustment_factor < 1.0


def test_high_pain_reduces_volume():
    result = evaluate_mesocycle_feedback(_feedback(pain_level=8))
    assert result.volume_adjustment_factor < 1.0


def test_easy_block_with_good_recovery_increases_volume():
    result = evaluate_mesocycle_feedback(
        _feedback(difficulty_perceived=3, recovery_quality=8, pain_level=0, program_satisfaction=9)
    )
    assert result.volume_adjustment_factor > 1.0


def test_factor_is_clamped():
    result = evaluate_mesocycle_feedback(
        _feedback(difficulty_perceived=10, recovery_quality=1, pain_level=10)
    )
    assert result.volume_adjustment_factor >= 0.6
