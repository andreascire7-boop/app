from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Sport(str, Enum):
    tennis = "tennis"
    padel = "padel"
    both = "both"


class AthleteLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    semi_pro = "semi_pro"
    pro = "pro"


class PeriodizationModel(str, Enum):
    lineare = "lineare"
    ondulata = "ondulata"
    a_blocchi = "a_blocchi"


class BlockType(str, Enum):
    accumulo = "accumulo"
    trasmutazione = "trasmutazione"
    realizzazione = "realizzazione"


class BodyArea(str, Enum):
    spalla = "spalla"
    gomito = "gomito"
    lombare = "lombare"
    ginocchio = "ginocchio"
    caviglia = "caviglia"
    altro = "altro"


class RiskLevel(str, Enum):
    green = "green"
    yellow = "yellow"
    red = "red"


class InjuryHistoryItem(BaseModel):
    body_area: BodyArea
    status: str  # "active" | "resolved"
    severity_at_report: int = Field(ge=0, le=10)


class AthleteNeedsInput(BaseModel):
    """Mirrors docs/product-design FASE 3 F1 — the minimal onboarding assessment
    required before the engine can generate a first plan."""

    athlete_id: str
    primary_sport: Sport
    level: AthleteLevel
    weekly_availability_days: int = Field(ge=0, le=7)
    competitions_per_year: Optional[int] = None
    injury_history: list[InjuryHistoryItem] = []


class MesocycleOutput(BaseModel):
    block_type: Optional[BlockType]
    duration_weeks: int
    target_qualities: list[str]


class MacrocycleOutput(BaseModel):
    model_config = {"protected_namespaces": ()}

    athlete_id: str
    model_type: PeriodizationModel
    mesocycles: list[MesocycleOutput]
    excluded_body_areas: list[BodyArea]
    explanation: str
    engine_version: str


class LoadPoint(BaseModel):
    date: str  # ISO date
    session_load: float  # e.g. session RPE * duration_minutes


class InjuryRiskInput(BaseModel):
    athlete_id: str
    load_history: list[LoadPoint]  # ideally >=28 days for a reliable chronic average
    recent_pain_reports: int = 0
    has_injury_history_same_area: bool = False


class InjuryRiskOutput(BaseModel):
    athlete_id: str
    acwr: Optional[float]
    risk_level: RiskLevel
    contributing_factors: list[str]
    recommendation: str
    data_sufficient: bool
    engine_version: str


class SubstitutionInput(BaseModel):
    athlete_id: str
    exercise_body_area_tags: list[BodyArea]
    reported_pain_area: BodyArea
    pain_level: int = Field(ge=0, le=10)


class SubstitutionOutput(BaseModel):
    should_substitute: bool
    severity: str  # "lieve" | "moderato" | "severo"
    requires_professional_referral: bool
    explanation: str


class ExerciseCatalogItem(BaseModel):
    """The subset of exercise_library (docs/product-design FASE 5) the ai-engine
    needs to pick a session — the Core API owns the catalog, not this service."""

    id: str
    movement_pattern: str
    body_area_risk_tags: list[BodyArea] = []


class PlannedSessionExercise(BaseModel):
    exercise_id: str
    order_index: int
    target_sets: Optional[int]
    target_reps: Optional[int]
    target_rpe: Optional[float]


class PlannedSession(BaseModel):
    session_focus: str
    exercises: list[PlannedSessionExercise]


class SessionPlanRequest(BaseModel):
    athlete_id: str
    available_exercises: list[ExerciseCatalogItem]
    excluded_body_areas: list[BodyArea] = []
    block_type: Optional[BlockType] = None
    sessions_per_week: int = Field(ge=1, le=7, default=2)


class SessionPlanResponse(BaseModel):
    athlete_id: str
    sessions: list[PlannedSession]
    explanation: str
    engine_version: str


class AutoregulationInput(BaseModel):
    athlete_id: str
    recent_session_rpe: list[float]  # most recent last; ideally >=3 entries
    expected_rpe: float = 7.0  # the block's planned/target RPE (program-design.md)


class AutoregulationOutput(BaseModel):
    athlete_id: str
    volume_adjustment_factor: float  # multiply next session's target_sets/reps by this
    should_trigger_deload: bool
    explanation: str
    engine_version: str
