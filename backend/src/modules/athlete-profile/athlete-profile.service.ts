import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAthleteProfileDto } from './dto/create-athlete-profile.dto';
import { ReportInjuryDto } from './dto/report-injury.dto';

@Injectable()
export class AthleteProfileService {
  constructor(private readonly prisma: PrismaService) {}

  upsertProfile(athleteId: string, dto: CreateAthleteProfileDto) {
    return this.prisma.athleteProfile.upsert({
      where: { userId: athleteId },
      create: { userId: athleteId, ...dto },
      update: { ...dto, onboardingCompletedAt: new Date() },
    });
  }

  getProfile(athleteId: string) {
    return this.prisma.athleteProfile.findUnique({
      where: { userId: athleteId },
      include: { user: { include: { injuryHistory: true } } },
    });
  }

  reportInjury(athleteId: string, dto: ReportInjuryDto) {
    // NOTE: an active injury reported here must block standard-load plan generation
    // (docs/product-design FASE 3, F1 edge cases) — enforced by the periodization
    // engine (ai-engine) when it reads injuryHistory before generating a plan, not here.
    return this.prisma.injuryHistory.create({
      data: { athleteId, ...dto },
    });
  }

  listInjuries(athleteId: string) {
    return this.prisma.injuryHistory.findMany({
      where: { athleteId },
      orderBy: { reportedAt: 'desc' },
    });
  }
}
