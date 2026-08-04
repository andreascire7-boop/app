import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PerformanceTestType, TestPhase } from '@prisma/client';

export class CreatePerformanceTestDto {
  @IsEnum(PerformanceTestType)
  testType!: PerformanceTestType;

  // Obbligatorio solo per CUSTOM_STRENGTH (es. "Panca piana 1RM").
  @IsOptional()
  @IsString()
  customName?: string;

  @IsNumber()
  value!: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsEnum(TestPhase)
  phase?: TestPhase;

  @IsOptional()
  @IsDateString()
  testDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
