import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AthleteProfileService } from './athlete-profile.service';
import { CreateAthleteProfileDto } from './dto/create-athlete-profile.dto';
import { ReportInjuryDto } from './dto/report-injury.dto';
import { UpdateInjuryDto } from './dto/update-injury.dto';

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

  @Patch('injuries/:injuryId')
  updateInjury(
    @Param('athleteId') athleteId: string,
    @Param('injuryId') injuryId: string,
    @Body() dto: UpdateInjuryDto,
  ) {
    return this.athleteProfileService.updateInjury(athleteId, injuryId, dto);
  }

  @Get('injuries/summary')
  injurySummary(@Param('athleteId') athleteId: string) {
    return this.athleteProfileService.injurySummary(athleteId);
  }
}
