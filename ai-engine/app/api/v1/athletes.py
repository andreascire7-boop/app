from fastapi import APIRouter

from app.engine.exercise_substitution import evaluate_substitution
from app.engine.explainability import explain
from app.engine.injury_risk import assess_risk
from app.engine.periodization import generate_macrocycle
from app.models.schemas import (
    AthleteNeedsInput,
    InjuryRiskInput,
    InjuryRiskOutput,
    MacrocycleOutput,
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
