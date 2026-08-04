import { Module } from '@nestjs/common';
import { MesocyclesController } from './mesocycles.controller';
import { MesocyclesService } from './mesocycles.service';
import { AiEngineClient } from '../programming/ai-engine.client';
import { ProgrammingModule } from '../programming/programming.module';

@Module({
  imports: [ProgrammingModule],
  controllers: [MesocyclesController],
  providers: [MesocyclesService, AiEngineClient],
})
export class MesocyclesModule {}
