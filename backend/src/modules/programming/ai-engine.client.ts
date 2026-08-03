import { Injectable, Logger } from '@nestjs/common';

export interface AiInjuryHistoryItem {
  body_area: string;
  status: string;
  severity_at_report: number;
}

export interface GenerateMacrocyclePayload {
  athlete_id: string;
  primary_sport: string;
  level: string;
  weekly_availability_days: number;
  competitions_per_year?: number;
  injury_history: AiInjuryHistoryItem[];
}

export interface MesocycleResult {
  block_type: string | null;
  duration_weeks: number;
  target_qualities: string[];
}

export interface MacrocycleResult {
  athlete_id: string;
  model_type: string;
  mesocycles: MesocycleResult[];
  excluded_body_areas: string[];
  explanation: string;
  engine_version: string;
}

export interface ExerciseCatalogItem {
  id: string;
  movement_pattern: string;
  body_area_risk_tags: string[];
}

export interface SessionPlanPayload {
  athlete_id: string;
  available_exercises: ExerciseCatalogItem[];
  excluded_body_areas: string[];
  block_type: string | null;
  sessions_per_week: number;
}

export interface PlannedSessionExercise {
  exercise_id: string;
  order_index: number;
  target_sets: number | null;
  target_reps: number | null;
  target_rpe: number | null;
}

export interface PlannedSession {
  session_focus: string;
  exercises: PlannedSessionExercise[];
}

export interface SessionPlanResult {
  athlete_id: string;
  sessions: PlannedSession[];
  explanation: string;
  engine_version: string;
}

export interface AutoregulationPayload {
  athlete_id: string;
  recent_session_rpe: number[];
  expected_rpe: number;
}

export interface AutoregulationResult {
  athlete_id: string;
  volume_adjustment_factor: number;
  should_trigger_deload: boolean;
  explanation: string;
  engine_version: string;
}

export interface LoadPoint {
  date: string;
  session_load: number;
}

export interface RiskAssessmentPayload {
  athlete_id: string;
  load_history: LoadPoint[];
  recent_pain_reports: number;
  has_injury_history_same_area: boolean;
}

export interface RiskAssessmentResult {
  athlete_id: string;
  acwr: number | null;
  risk_level: string;
  contributing_factors: string[];
  recommendation: string;
  data_sufficient: boolean;
  engine_version: string;
}

export interface SubstitutionPayload {
  athlete_id: string;
  exercise_body_area_tags: string[];
  reported_pain_area: string;
  pain_level: number;
}

export interface SubstitutionResult {
  should_substitute: boolean;
  severity: string;
  requires_professional_referral: boolean;
  explanation: string;
  engine_version: string;
}

export interface TaperPlanPayload {
  athlete_id: string;
  days_until_event: number;
  importance: string;
}

export interface TaperWeekResult {
  weeks_before_event: number;
  volume_adjustment_factor: number;
}

export interface TaperPlanResult {
  athlete_id: string;
  taper_weeks: number;
  is_partial: boolean;
  weeks: TaperWeekResult[];
  explanation: string;
  engine_version: string;
}

// Thin HTTP client towards the AI/Decision Engine microservice (Python/FastAPI).
// The Core API never re-implements periodization/risk logic itself — see
// docs/product-design FASE 4 (§4.9) and FASE 7 for why the split exists.
@Injectable()
export class AiEngineClient {
  private readonly logger = new Logger(AiEngineClient.name);
  private readonly baseUrl = process.env.AI_ENGINE_BASE_URL ?? 'http://localhost:8000';

  async generateMacrocycle(
    athleteId: string,
    payload: GenerateMacrocyclePayload,
  ): Promise<MacrocycleResult> {
    return this.post(`/v1/athletes/${athleteId}/macrocycle`, payload);
  }

  async generateSessionPlan(
    athleteId: string,
    payload: SessionPlanPayload,
  ): Promise<SessionPlanResult> {
    return this.post(`/v1/athletes/${athleteId}/sessions`, payload);
  }

  async evaluateAutoregulation(
    athleteId: string,
    payload: AutoregulationPayload,
  ): Promise<AutoregulationResult> {
    return this.post(`/v1/athletes/${athleteId}/autoregulation`, payload);
  }

  async assessRisk(athleteId: string, payload: RiskAssessmentPayload): Promise<RiskAssessmentResult> {
    return this.post(`/v1/athletes/${athleteId}/risk-assessment`, payload);
  }

  async evaluateSubstitution(athleteId: string, payload: SubstitutionPayload): Promise<SubstitutionResult> {
    return this.post(`/v1/athletes/${athleteId}/exercise-substitution`, payload);
  }

  async computeTaperPlan(athleteId: string, payload: TaperPlanPayload): Promise<TaperPlanResult> {
    return this.post(`/v1/athletes/${athleteId}/taper-plan`, payload);
  }

  private async post<T>(path: string, payload: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      this.logger.error(`ai-engine responded ${res.status} for ${path}`);
      throw new Error(`ai-engine request failed with status ${res.status}`);
    }
    return res.json();
  }
}
