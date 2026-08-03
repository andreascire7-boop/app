import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CreateCoachLinkDto } from './dto/create-coach-link.dto';

@Controller()
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('athletes/:athleteId/coach-links')
  requestLink(@Param('athleteId') athleteId: string, @Body() dto: CreateCoachLinkDto) {
    return this.coachService.requestLink(athleteId, dto);
  }

  @Get('athletes/:athleteId/coach-links')
  listForAthlete(@Param('athleteId') athleteId: string) {
    return this.coachService.listForAthlete(athleteId);
  }

  @Patch('athletes/:athleteId/coach-links/:linkId/revoke')
  revokeLink(@Param('athleteId') athleteId: string, @Param('linkId') linkId: string) {
    return this.coachService.revokeLink(athleteId, linkId);
  }

  @Patch('coaches/:coachId/athlete-links/:linkId/accept')
  acceptLink(@Param('coachId') coachId: string, @Param('linkId') linkId: string) {
    return this.coachService.acceptLink(coachId, linkId);
  }

  @Get('coaches/:coachId/athletes')
  listAthletesForCoach(@Param('coachId') coachId: string) {
    return this.coachService.listAthletesForCoach(coachId);
  }
}
