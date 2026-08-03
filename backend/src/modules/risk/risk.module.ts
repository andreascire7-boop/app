import { Module } from '@nestjs/common';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [RiskController],
  providers: [RiskService, AiEngineClient],
})
export class RiskModule {}
