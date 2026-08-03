import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BodyArea } from '@prisma/client';

export class ReportInjuryDto {
  @IsEnum(BodyArea)
  bodyArea!: BodyArea;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  @Max(10)
  severityAtReport!: number;
}
