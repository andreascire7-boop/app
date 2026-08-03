import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { BodyArea } from '@prisma/client';

export class SubstituteExerciseDto {
  @IsEnum(BodyArea)
  painArea!: BodyArea;

  @IsInt()
  @Min(0)
  @Max(10)
  painLevel!: number;
}
