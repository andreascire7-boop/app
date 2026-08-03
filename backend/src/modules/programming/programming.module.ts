import { Module } from '@nestjs/common';
import { ProgrammingController } from './programming.controller';
import { AiEngineClient } from './ai-engine.client';

@Module({
  controllers: [ProgrammingController],
  providers: [AiEngineClient],
})
export class ProgrammingModule {}
