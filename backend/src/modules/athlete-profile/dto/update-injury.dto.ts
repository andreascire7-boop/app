import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InjuryStatus } from '@prisma/client';

// Aggiorna un infortunio esistente — transizione di stato (presente → recupero →
// risolto) e/o correzione di gravità/descrizione. Guida scelta esercizi e volume
// nel motore AI (vedi ProgrammingService.generateMacrocycle).
export class UpdateInjuryDto {
  @IsOptional()
  @IsEnum(InjuryStatus)
  status?: InjuryStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  severityAtReport?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
