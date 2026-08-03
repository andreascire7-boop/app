import { IsString } from 'class-validator';

export class CreateCoachLinkDto {
  @IsString()
  coachId!: string;
}
