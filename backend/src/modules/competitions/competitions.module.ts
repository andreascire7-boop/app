import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { CompetitionsService } from './competitions.service';
import { CompetitionImportService } from './competition-import.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [CompetitionsController],
  providers: [CompetitionsService, CompetitionImportService, AiEngineClient],
})
export class CompetitionsModule {}
