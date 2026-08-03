import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateExerciseLogDto {
  @IsString()
  sessionExerciseId!: string;

  @IsInt()
  @Min(1)
  setNumber!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  actualReps?: number;

  @IsOptional()
  @IsNumber()
  actualLoad?: number;

  @IsOptional()
  @IsNumber()
  actualRpe?: number;
}
