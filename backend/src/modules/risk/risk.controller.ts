import { Controller, Get, Param, Post } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('athletes/:athleteId/risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  // F5 (docs/product-design FASE 3/7): recompute the risk assessment now.
  @Post()
  assess(@Param('athleteId') athleteId: string) {
    return this.riskService.assessRisk(athleteId);
  }

  @Get()
  latest(@Param('athleteId') athleteId: string) {
    return this.riskService.latestForAthlete(athleteId);
  }
}
