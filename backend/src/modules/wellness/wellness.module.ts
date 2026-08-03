import { Module } from '@nestjs/common';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [WellnessController],
  providers: [WellnessService, AiEngineClient],
})
export class WellnessModule {}
