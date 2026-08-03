import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [CompetitionsController],
  providers: [CompetitionsService, AiEngineClient],
})
export class CompetitionsModule {}
