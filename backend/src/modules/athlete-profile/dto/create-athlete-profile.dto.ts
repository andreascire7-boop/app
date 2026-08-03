import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Sport, AthleteLevel } from '@prisma/client';

// Mirrors the onboarding assessment (docs/product-design FASE 3, F1) — the minimal
// data set required before the periodization engine (F2) can generate a first plan.
export class CreateAthleteProfileDto {
  @IsEnum(Sport)
  primarySport!: Sport;

  @IsEnum(AthleteLevel)
  level!: AthleteLevel;

  @IsOptional()
  @IsString()
  dominantHand?: string;

  @IsInt()
  @Min(0)
  @Max(7)
  weeklyAvailabilityDays!: number;

  @IsOptional()
  @IsString()
  goalPrimary?: string;
}
