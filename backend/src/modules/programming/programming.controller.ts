import { Controller, Param, Post } from '@nestjs/common';
import { AiEngineClient } from './ai-engine.client';

@Controller('athletes/:athleteId/programming')
export class ProgrammingController {
  constructor(private readonly aiEngineClient: AiEngineClient) {}

  // Triggers F2 (docs/product-design FASE 3): first macrocycle generation after onboarding.
  @Post('macrocycle')
  generateMacrocycle(@Param('athleteId') athleteId: string) {
    return this.aiEngineClient.generateMacrocycle(athleteId);
  }
}
