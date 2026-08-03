from fastapi import APIRouter

from app.engine.autoregulation import evaluate_autoregulation
from app.engine.exercise_substitution import evaluate_substitution
from app.engine.explainability import explain
from app.engine.injury_risk import assess_risk
from app.engine.periodization import generate_macrocycle
from app.engine.session_builder import build_sessions
from app.models.schemas import (
    AthleteNeedsInput,
    AutoregulationInput,
    AutoregulationOutput,
    InjuryRiskInput,
    InjuryRiskOutput,
    MacrocycleOutput,
    SessionPlanRequest,
    SessionPlanResponse,
    SubstitutionInput,
    SubstitutionOutput,
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
