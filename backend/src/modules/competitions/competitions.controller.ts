import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';

@Controller('athletes/:athleteId/competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Get()
  list(@Param('athleteId') athleteId: string) {
    return this.competitionsService.listForAthlete(athleteId);
  }

  @Post()
  create(@Param('athleteId') athleteId: string, @Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(athleteId, dto);
  }

  @Patch(':competitionId/cancel')
  cancel(@Param('athleteId') athleteId: string, @Param('competitionId') competitionId: string) {
    return this.competitionsService.cancel(athleteId, competitionId);
  }
}
