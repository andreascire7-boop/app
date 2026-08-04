import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MesocyclesService } from './mesocycles.service';
import { SubmitMesocycleFeedbackDto } from './dto/submit-mesocycle-feedback.dto';

@Controller('athletes/:athleteId/mesocycles/:mesocycleId')
export class MesocyclesController {
  constructor(private readonly mesocyclesService: MesocyclesService) {}

  @Get('summary')
  getSummary(@Param('athleteId') athleteId: string, @Param('mesocycleId') mesocycleId: string) {
    return this.mesocyclesService.getSummary(athleteId, mesocycleId);
  }

  @Post('complete')
  complete(@Param('athleteId') athleteId: string, @Param('mesocycleId') mesocycleId: string) {
    return this.mesocyclesService.complete(athleteId, mesocycleId);
  }

  @Post('feedback')
  submitFeedback(
    @Param('athleteId') athleteId: string,
    @Param('mesocycleId') mesocycleId: string,
    @Body() dto: SubmitMesocycleFeedbackDto,
  ) {
    return this.mesocyclesService.submitFeedback(athleteId, mesocycleId, dto);
  }
}
