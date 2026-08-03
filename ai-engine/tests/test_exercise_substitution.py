from app.engine.exercise_substitution import evaluate_substitution
from app.models.schemas import BodyArea, SubstitutionInput


def test_no_substitution_when_area_not_at_risk():
    result = evaluate_substitution(
        SubstitutionInput(
            athlete_id="a1",
            exercise_body_area_tags=[BodyArea.lombare],
            reported_pain_area=BodyArea.spalla,
            pain_level=6,
        )
    )
    assert result.should_substitute is False


def test_mild_pain_substitutes_without_referral():
    result = evaluate_substitution(
        SubstitutionInput(
            athlete_id="a1",
            exercise_body_area_tags=[BodyArea.spalla],
            reported_pain_area=BodyArea.spalla,
            pain_level=3,
        )
    )
    assert result.should_substitute is True
    assert result.severity == "lieve"
    assert result.requires_professional_referral is False


def test_severe_pain_requires_professional_referral():
    result = evaluate_substitution(
        SubstitutionInput(
            athlete_id="a1",
            exercise_body_area_tags=[BodyArea.spalla],
            reported_pain_area=BodyArea.spalla,
            pain_level=8,
        )
    )
    assert result.should_substitute is True
    assert result.severity == "severo"
    assert result.requires_professional_referral is True
