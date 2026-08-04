import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// Raccolto nella schermata "Mesociclo completato" — guida volume/adattamento del
// mesociclo successivo (vedi MesocyclesService.submitFeedback).
export class SubmitMesocycleFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(10)
  difficultyPerceived!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  energyLevel!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  recoveryQuality!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  programSatisfaction!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
