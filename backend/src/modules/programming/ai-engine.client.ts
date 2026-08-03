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
    const res = await fetch(`${this.baseUrl}/v1/athletes/${athleteId}/macrocycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      this.logger.error(`ai-engine responded ${res.status} for athlete ${athleteId}`);
      throw new Error(`ai-engine request failed with status ${res.status}`);
    }
    return res.json();
  }
}
