import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AthleteProfileService } from './athlete-profile.service';
import { CreateAthleteProfileDto } from './dto/create-athlete-profile.dto';
import { ReportInjuryDto } from './dto/report-injury.dto';

@Controller('athletes/:athleteId/profile')
export class AthleteProfileController {
  constructor(private readonly athleteProfileService: AthleteProfileService) {}

  @Post()
  upsert(@Param('athleteId') athleteId: string, @Body() dto: CreateAthleteProfileDto) {
    return this.athleteProfileService.upsertProfile(athleteId, dto);
  }

  @Get()
  get(@Param('athleteId') athleteId: string) {
    return this.athleteProfileService.getProfile(athleteId);
  }

  @Post('injuries')
  reportInjury(@Param('athleteId') athleteId: string, @Body() dto: ReportInjuryDto) {
    return this.athleteProfileService.reportInjury(athleteId, dto);
  }

  @Get('injuries')
  listInjuries(@Param('athleteId') athleteId: string) {
    return this.athleteProfileService.listInjuries(athleteId);
  }
}
