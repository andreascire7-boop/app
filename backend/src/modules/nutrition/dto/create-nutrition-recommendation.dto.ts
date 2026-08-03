import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NutritionContext } from '@prisma/client';

export class CreateNutritionRecommendationDto {
  @IsEnum(NutritionContext)
  context!: NutritionContext;

  @IsOptional()
  @IsString()
  linkedCompetitionId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  competitionDurationMinutes?: number;
}
