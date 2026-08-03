import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { BodyArea } from '@prisma/client';

// Mirrors the post-session check-in (docs/product-design FASE 3 F4, FASE 6 S10):
// RPE, dolore ed energia raccolti insieme in un'unica schermata.
export class SubmitSessionFeedbackDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  sessionRpe?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  energyLevel?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(BodyArea)
  painArea?: BodyArea;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel?: number;
}
