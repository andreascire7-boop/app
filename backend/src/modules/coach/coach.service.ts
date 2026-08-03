import { Injectable, NotFoundException } from '@nestjs/common';
import { LinkStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoachLinkDto } from './dto/create-coach-link.dto';

const RISK_RANK: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2 };

@Injectable()
export class CoachService {
  constructor(private readonly prisma: PrismaService) {}

  // Athlete-initiated: mirrors S22 ("inserisci il codice del tuo coach").
  // Starts PENDING until the coach accepts — never auto-active.
  async requestLink(athleteId: string, dto: CreateCoachLinkDto) {
    const existing = await this.prisma.coachAthleteLink.findUnique({
      where: { coachId_athleteId: { coachId: dto.coachId, athleteId } },
    });
    if (existing && existing.status !== LinkStatus.REVOKED) {
      return existing;
    }
    if (existing) {
      return this.prisma.coachAthleteLink.update({
        where: { id: existing.id },
        data: { status: LinkStatus.PENDING, revokedAt: null },
      });
    }
    return this.prisma.coachAthleteLink.create({
      data: { coachId: dto.coachId, athleteId, status: LinkStatus.PENDING },
    });
  }

  listForAthlete(athleteId: string) {
    return this.prisma.coachAthleteLink.findMany({
      where: { athleteId },
      include: { coach: { select: { id: true, fullName: true, email: true } } },
    });
  }

  // Revocation must be immediate and unconditional (docs/product-design FASE 5
  // §5.2 RLS policy) — the athlete owns this decision, no coach approval needed.
  async revokeLink(athleteId: string, linkId: string) {
    const link = await this.prisma.coachAthleteLink.findFirst({ where: { id: linkId, athleteId } });
    if (!link) {
      throw new NotFoundException(`Link ${linkId} not found for athlete ${athleteId}`);
    }
    return this.prisma.coachAthleteLink.update({
      where: { id: linkId },
      data: { status: LinkStatus.REVOKED, revokedAt: new Date() },
    });
  }

  listPendingForCoach(coachId: string) {
    return this.prisma.coachAthleteLink.findMany({
      where: { coachId, status: LinkStatus.PENDING },
      include: { athlete: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async acceptLink(coachId: string, linkId: string) {
    const link = await this.prisma.coachAthleteLink.findFirst({ where: { id: linkId, coachId } });
    if (!link) {
      throw new NotFoundException(`Link ${linkId} not found for coach ${coachId}`);
    }
    return this.prisma.coachAthleteLink.update({
      where: { id: linkId },
      data: { status: LinkStatus.ACTIVE },
    });
  }

  // F11 (docs/product-design FASE 3/6): athletes in risk must always sort to the
  // top, independent of name/join order.
  async listAthletesForCoach(coachId: string) {
    const links = await this.prisma.coachAthleteLink.findMany({
      where: { coachId, status: LinkStatus.ACTIVE },
      include: { athlete: { select: { id: true, fullName: true, email: true } } },
    });

    const withRisk = await Promise.all(
      links.map(async (link) => {
        const latestRisk = await this.prisma.riskAssessment.findFirst({
          where: { athleteId: link.athleteId },
          orderBy: { assessmentDate: 'desc' },
        });
        return { link, athlete: link.athlete, latestRisk };
      }),
    );

    withRisk.sort((a, b) => {
      const rankA = a.latestRisk ? RISK_RANK[a.latestRisk.riskLevel] : 3;
      const rankB = b.latestRisk ? RISK_RANK[b.latestRisk.riskLevel] : 3;
      return rankA - rankB;
    });

    return withRisk;
  }
}
