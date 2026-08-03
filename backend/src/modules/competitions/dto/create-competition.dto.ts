import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CompetitionImportance, Sport } from '@prisma/client';

export class CreateCompetitionDto {
  @IsEnum(Sport)
  sport!: Sport;

  @IsDateString()
  eventDate!: string;

  @IsEnum(CompetitionImportance)
  importance!: CompetitionImportance;

  @IsOptional()
  @IsInt()
  @Min(0)
  expectedMatches?: number;
}
