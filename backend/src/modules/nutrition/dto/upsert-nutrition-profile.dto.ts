import { IsArray, IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpsertNutritionProfileDto {
  @IsOptional()
  @IsIn(['gain_muscle', 'lose_fat', 'maintain'])
  bodyCompGoal?: string;

  @IsOptional()
  @IsArray()
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsBoolean()
  disorderedEatingFlag?: boolean;
}
