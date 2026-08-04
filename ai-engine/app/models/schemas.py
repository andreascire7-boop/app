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
    polso = "polso"
    schiena = "schiena"
    anca = "anca"
    ginocchio = "ginocchio"
    caviglia = "caviglia"
    altro = "altro"


class RiskLevel(str, Enum):
    green = "green"
    yellow = "yellow"
    red = "red"


class InjuryHistoryItem(BaseModel):
    body_area: BodyArea
    status: str  # "active" | "recovering" | "resolved"
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
    reduced_load_body_areas: list[BodyArea] = []
    preventive_focus_areas: list[BodyArea] = []
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
    engine_version: str


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
    # zone in recupero: non escluse ma con volume ridotto (vedi session_builder.RECOVERING_VOLUME_FACTOR)
    reduced_load_body_areas: list[BodyArea] = []
    # storico infortuni (attivo/recupero/risolto): priorità agli esercizi di prehab per quella zona
    preventive_focus_areas: list[BodyArea] = []
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


class CompetitionImportance(str, Enum):
    locale = "locale"
    regionale = "regionale"
    nazionale = "nazionale"


class TaperPlanInput(BaseModel):
    athlete_id: str
    days_until_event: int = Field(ge=0)
    importance: CompetitionImportance


class TaperWeek(BaseModel):
    weeks_before_event: int  # 0 = event week itself
    volume_adjustment_factor: float


class TaperPlanOutput(BaseModel):
    athlete_id: str
    taper_weeks: int
    is_partial: bool
    weeks: list[TaperWeek]
    explanation: str
    engine_version: str


class ReadinessInput(BaseModel):
    athlete_id: str
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = Field(default=None, ge=1, le=5)
    recent_session_rpe: list[float] = []
    recent_pain_reports: int = 0
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)


class ReadinessOutput(BaseModel):
    athlete_id: str
    readiness_score: float  # 0-100
    level: str  # "alta" | "media" | "bassa"
    contributing_factors: list[str]
    recommendation: str
    engine_version: str


class NutritionContext(str, Enum):
    daily = "daily"
    pre_match = "pre_match"
    during_match = "during_match"
    post_match = "post_match"


class BodyCompGoal(str, Enum):
    gain_muscle = "gain_muscle"
    lose_fat = "lose_fat"
    maintain = "maintain"


class NutritionRequest(BaseModel):
    athlete_id: str
    context: NutritionContext
    is_minor: bool = False
    disordered_eating_flag: bool = False
    body_comp_goal: Optional[BodyCompGoal] = None
    competition_duration_minutes: Optional[int] = None


class NutritionRecommendationOutput(BaseModel):
    athlete_id: str
    numeric_guidance_suspended: bool
    macro_guidance: dict[str, str]
    peri_match_guidance: Optional[str]
    explanation: str
    engine_version: str


class MesocycleFeedbackInput(BaseModel):
    """Feedback raccolto alla schermata "Mesociclo completato" — guida il volume
    del mesociclo successivo (docs/product-design: Sistema Mesocicli)."""

    athlete_id: str
    difficulty_perceived: int = Field(ge=1, le=10)
    energy_level: int = Field(ge=1, le=10)
    recovery_quality: int = Field(ge=1, le=10)
    pain_level: int = Field(ge=0, le=10, default=0)
    program_satisfaction: int = Field(ge=1, le=10)


class MesocycleAdjustmentOutput(BaseModel):
    athlete_id: str
    volume_adjustment_factor: float
    explanation: str
    engine_version: str
