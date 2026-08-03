from fastapi import APIRouter

from app.engine.autoregulation import evaluate_autoregulation
from app.engine.exercise_substitution import evaluate_substitution
from app.engine.explainability import explain
from app.engine.injury_risk import assess_risk
from app.engine.nutrition import build_nutrition_recommendation
from app.engine.periodization import generate_macrocycle
from app.engine.readiness import compute_readiness
from app.engine.session_builder import build_sessions
from app.engine.tapering import compute_taper_plan
from app.models.schemas import (
    AthleteNeedsInput,
    AutoregulationInput,
    AutoregulationOutput,
    InjuryRiskInput,
    InjuryRiskOutput,
    MacrocycleOutput,
    NutritionRecommendationOutput,
    NutritionRequest,
    ReadinessInput,
    ReadinessOutput,
    SessionPlanRequest,
    SessionPlanResponse,
    SubstitutionInput,
    SubstitutionOutput,
    TaperPlanInput,
    TaperPlanOutput,
)

router = APIRouter(prefix="/v1/athletes", tags=["athletes"])


@router.post("/{athlete_id}/macrocycle", response_model=MacrocycleOutput)
def post_macrocycle(athlete_id: str, payload: AthleteNeedsInput) -> MacrocycleOutput:
    payload.athlete_id = athlete_id
    result = generate_macrocycle(payload)
    result.explanation = explain(result.explanation)
    return result


@router.post("/{athlete_id}/risk-assessment", response_model=InjuryRiskOutput)
def post_risk_assessment(athlete_id: str, payload: InjuryRiskInput) -> InjuryRiskOutput:
    payload.athlete_id = athlete_id
    result = assess_risk(payload)
    return result


@router.post("/{athlete_id}/exercise-substitution", response_model=SubstitutionOutput)
def post_exercise_substitution(athlete_id: str, payload: SubstitutionInput) -> SubstitutionOutput:
    payload.athlete_id = athlete_id
    result = evaluate_substitution(payload)
    result.explanation = explain(result.explanation)
    return result


@router.post("/{athlete_id}/sessions", response_model=SessionPlanResponse)
def post_session_plan(athlete_id: str, payload: SessionPlanRequest) -> SessionPlanResponse:
    payload.athlete_id = athlete_id
    result = build_sessions(payload)
    result.explanation = explain(result.explanation)
    return result


@router.post("/{athlete_id}/autoregulation", response_model=AutoregulationOutput)
def post_autoregulation(athlete_id: str, payload: AutoregulationInput) -> AutoregulationOutput:
    payload.athlete_id = athlete_id
    result = evaluate_autoregulation(payload)
    result.explanation = explain(result.explanation)
    return result


@router.post("/{athlete_id}/taper-plan", response_model=TaperPlanOutput)
def post_taper_plan(athlete_id: str, payload: TaperPlanInput) -> TaperPlanOutput:
    payload.athlete_id = athlete_id
    result = compute_taper_plan(payload)
    result.explanation = explain(result.explanation)
    return result


@router.post("/{athlete_id}/readiness", response_model=ReadinessOutput)
def post_readiness(athlete_id: str, payload: ReadinessInput) -> ReadinessOutput:
    payload.athlete_id = athlete_id
    result = compute_readiness(payload)
    result.recommendation = explain(result.recommendation)
    return result


@router.post("/{athlete_id}/nutrition-recommendation", response_model=NutritionRecommendationOutput)
def post_nutrition_recommendation(athlete_id: str, payload: NutritionRequest) -> NutritionRecommendationOutput:
    payload.athlete_id = athlete_id
    result = build_nutrition_recommendation(payload)
    result.explanation = explain(result.explanation)
    return result
