import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { SubmitWellnessCheckinDto } from './dto/submit-wellness-checkin.dto';

@Controller('athletes/:athleteId/wellness-checkins')
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Post()
  submit(@Param('athleteId') athleteId: string, @Body() dto: SubmitWellnessCheckinDto) {
    return this.wellnessService.submitCheckin(athleteId, dto);
  }

  @Get('today')
  today(@Param('athleteId') athleteId: string) {
    return this.wellnessService.getToday(athleteId);
  }
}
