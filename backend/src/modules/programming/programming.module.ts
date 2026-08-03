import { Module } from '@nestjs/common';
import { ProgrammingController } from './programming.controller';
import { AiEngineClient } from './ai-engine.client';
import { ProgrammingService } from './programming.service';

@Module({
  controllers: [ProgrammingController],
  providers: [AiEngineClient, ProgrammingService],
})
export class ProgrammingModule {}
