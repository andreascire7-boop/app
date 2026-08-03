import { Injectable, Logger } from '@nestjs/common';

// Thin HTTP client towards the AI/Decision Engine microservice (Python/FastAPI).
// The Core API never re-implements periodization/risk logic itself — see
// docs/product-design FASE 4 (§4.9) and FASE 7 for why the split exists.
@Injectable()
export class AiEngineClient {
  private readonly logger = new Logger(AiEngineClient.name);
  private readonly baseUrl = process.env.AI_ENGINE_BASE_URL ?? 'http://localhost:8000';

  async generateMacrocycle(athleteId: string) {
    const res = await fetch(`${this.baseUrl}/v1/athletes/${athleteId}/macrocycle`, {
      method: 'POST',
    });
    if (!res.ok) {
      this.logger.error(`ai-engine responded ${res.status} for athlete ${athleteId}`);
      throw new Error(`ai-engine request failed with status ${res.status}`);
    }
    return res.json();
  }
}
