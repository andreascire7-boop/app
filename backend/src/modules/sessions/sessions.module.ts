import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { AiEngineClient } from '../programming/ai-engine.client';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, AiEngineClient],
})
export class SessionsModule {}
