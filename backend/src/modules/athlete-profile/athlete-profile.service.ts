import { Injectable, NotFoundException } from '@nestjs/common';
import { InjuryStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAthleteProfileDto } from './dto/create-athlete-profile.dto';
import { ReportInjuryDto } from './dto/report-injury.dto';
import { UpdateInjuryDto } from './dto/update-injury.dto';

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

  async updateInjury(athleteId: string, injuryId: string, dto: UpdateInjuryDto) {
    const existing = await this.prisma.injuryHistory.findFirst({ where: { id: injuryId, athleteId } });
    if (!existing) {
      throw new NotFoundException(`Injury ${injuryId} not found for athlete ${athleteId}`);
    }

    return this.prisma.injuryHistory.update({
      where: { id: injuryId },
      data: {
        ...dto,
        resolvedAt:
          dto.status === InjuryStatus.RESOLVED
            ? new Date()
            : dto.status
              ? null
              : undefined,
      },
    });
  }

  // Riepilogo per la sezione "Profilo Atleta Avanzato" (nessun infortunio /
  // infortunio passato / infortunio attivo).
  async injurySummary(athleteId: string) {
    const injuries = await this.listInjuries(athleteId);
    const hasActive = injuries.some((i) => i.status === InjuryStatus.ACTIVE || i.status === InjuryStatus.RECOVERING);
    const hasPast = injuries.some((i) => i.status === InjuryStatus.RESOLVED);
    const overallStatus = hasActive ? 'infortunio_attivo' : hasPast ? 'infortunio_passato' : 'nessun_infortunio';
    return { overallStatus, injuries };
  }
}
