import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SubmitWellnessCheckinDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  sleepHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sleepQuality?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  stressLevel?: number;
}
