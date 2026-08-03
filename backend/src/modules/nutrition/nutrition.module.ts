import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [NutritionController],
  providers: [NutritionService, AiEngineClient],
})
export class NutritionModule {}
