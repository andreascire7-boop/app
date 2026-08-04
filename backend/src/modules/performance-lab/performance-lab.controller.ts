import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PerformanceTestType } from '@prisma/client';
import { PerformanceLabService } from './performance-lab.service';
import { CreatePerformanceTestDto } from './dto/create-performance-test.dto';

@Controller('athletes/:athleteId/performance-tests')
export class PerformanceLabController {
  constructor(private readonly performanceLabService: PerformanceLabService) {}

  @Post()
  create(@Param('athleteId') athleteId: string, @Body() dto: CreatePerformanceTestDto) {
    return this.performanceLabService.create(athleteId, dto);
  }

  @Get()
  list(@Param('athleteId') athleteId: string, @Query('testType') testType?: PerformanceTestType) {
    return this.performanceLabService.list(athleteId, testType);
  }

  @Get('progress')
  progress(@Param('athleteId') athleteId: string) {
    return this.performanceLabService.progress(athleteId);
  }
}
