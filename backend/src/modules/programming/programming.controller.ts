import { Controller, Get, Param, Post } from '@nestjs/common';
import { ProgrammingService } from './programming.service';

@Controller('athletes/:athleteId/programming')
export class ProgrammingController {
  constructor(private readonly programmingService: ProgrammingService) {}

  // Triggers F2 (docs/product-design FASE 3): first macrocycle generation after onboarding.
  @Post('macrocycle')
  generateMacrocycle(@Param('athleteId') athleteId: string) {
    return this.programmingService.generateMacrocycle(athleteId);
  }

  @Get('macrocycle')
  getCurrentMacrocycle(@Param('athleteId') athleteId: string) {
    return this.programmingService.getCurrentMacrocycle(athleteId);
  }
}
