import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { SubmitSessionFeedbackDto } from './dto/submit-session-feedback.dto';

@Controller('athletes/:athleteId/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(@Param('athleteId') athleteId: string) {
    return this.sessionsService.listForAthlete(athleteId);
  }

  @Get(':sessionId')
  getOne(@Param('athleteId') athleteId: string, @Param('sessionId') sessionId: string) {
    return this.sessionsService.getOne(athleteId, sessionId);
  }

  @Post(':sessionId/logs')
  logExerciseSet(
    @Param('athleteId') athleteId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateExerciseLogDto,
  ) {
    return this.sessionsService.logExerciseSet(athleteId, sessionId, dto);
  }

  @Post(':sessionId/feedback')
  submitFeedback(
    @Param('athleteId') athleteId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitSessionFeedbackDto,
  ) {
    return this.sessionsService.submitFeedback(athleteId, sessionId, dto);
  }
}
