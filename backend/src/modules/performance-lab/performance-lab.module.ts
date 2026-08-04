import { Module } from '@nestjs/common';
import { PerformanceLabController } from './performance-lab.controller';
import { PerformanceLabService } from './performance-lab.service';

@Module({
  controllers: [PerformanceLabController],
  providers: [PerformanceLabService],
})
export class PerformanceLabModule {}
