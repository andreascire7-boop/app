from app.engine.nutrition import build_nutrition_recommendation
from app.models.schemas import BodyCompGoal, NutritionContext, NutritionRequest


def test_disordered_eating_flag_suspends_numeric_guidance():
    result = build_nutrition_recommendation(
        NutritionRequest(athlete_id="a1", context=NutritionContext.daily, disordered_eating_flag=True)
    )
    assert result.numeric_guidance_suspended is True
    assert result.macro_guidance == {}


def test_minor_gets_no_fat_loss_framing():
    result = build_nutrition_recommendation(
        NutritionRequest(
            athlete_id="a1",
            context=NutritionContext.daily,
            is_minor=True,
            body_comp_goal=BodyCompGoal.lose_fat,
        )
    )
    assert "composizione_corporea" not in result.macro_guidance
    assert "minorenne" in result.explanation.lower()


def test_adult_fat_loss_goal_gets_body_comp_guidance():
    result = build_nutrition_recommendation(
        NutritionRequest(
            athlete_id="a1",
            context=NutritionContext.daily,
            is_minor=False,
            body_comp_goal=BodyCompGoal.lose_fat,
        )
    )
    assert "composizione_corporea" in result.macro_guidance


def test_long_match_gets_carb_guidance():
    result = build_nutrition_recommendation(
        NutritionRequest(
            athlete_id="a1", context=NutritionContext.during_match, competition_duration_minutes=120
        )
    )
    assert "carboidrati" in result.peri_match_guidance.lower()


def test_short_match_prioritizes_hydration_only():
    result = build_nutrition_recommendation(
        NutritionRequest(
            athlete_id="a1", context=NutritionContext.during_match, competition_duration_minutes=30
        )
    )
    assert "idratazione" in result.peri_match_guidance.lower()
