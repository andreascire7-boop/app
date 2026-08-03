import { Injectable, NotFoundException } from '@nestjs/common';
import { CompetitionStatus, Sport, SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from '../../common/date-utils';
import { AiEngineClient } from '../programming/ai-engine.client';
import { toAiEngineEnum } from '../programming/mappers';
import { CreateCompetitionDto } from './dto/create-competition.dto';

interface TaperSnapshotEntry {
  sessionExerciseId: string;
  originalTargetSets: number;
}

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  listForAthlete(athleteId: string) {
    return this.prisma.competition.findMany({
      where: { athleteId },
      orderBy: { eventDate: 'asc' },
    });
  }

  // F3 (docs/product-design FASE 3/7 §7.4): creating a competition immediately
  // computes and applies the taper to whatever sessions already fall in its window.
  async create(athleteId: string, dto: CreateCompetitionDto) {
    const eventDate = new Date(dto.eventDate);
    const competition = await this.prisma.competition.create({
      data: {
        athleteId,
        sport: (await this.athletePrimarySport(athleteId)) ?? Sport.BOTH,
        eventDate,
        importance: dto.importance,
        expectedMatches: dto.expectedMatches,
      },
    });

    const daysUntilEvent = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

    const taperPlan = await this.aiEngineClient.computeTaperPlan(athleteId, {
      athlete_id: athleteId,
      days_until_event: daysUntilEvent,
      importance: toAiEngineEnum(dto.importance),
    });

    const snapshot: TaperSnapshotEntry[] = [];
    let sessionsAdjusted = 0;

    for (const week of taperPlan.weeks) {
      const windowEnd = addDays(eventDate, -7 * week.weeks_before_event);
      const windowStart = addDays(windowEnd, -6);

      const sessions = await this.prisma.session.findMany({
        where: {
          athleteId,
          status: { in: [SessionStatus.PLANNED, SessionStatus.MODIFIED] },
          scheduledDate: { gte: windowStart, lte: windowEnd },
        },
        include: { exercises: true },
      });

      for (const session of sessions) {
        for (const exercise of session.exercises) {
          if (exercise.targetSets == null) continue;
          const reduced = Math.max(1, Math.floor(exercise.targetSets * week.volume_adjustment_factor));
          snapshot.push({ sessionExerciseId: exercise.id, originalTargetSets: exercise.targetSets });
          await this.prisma.sessionExercise.update({
            where: { id: exercise.id },
            data: { targetSets: reduced },
          });
        }
        await this.prisma.session.update({ where: { id: session.id }, data: { status: SessionStatus.MODIFIED } });
        sessionsAdjusted += 1;
      }
    }

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'TAPER_START',
        engineVersion: taperPlan.engine_version,
        inputSnapshot: { competitionId: competition.id, snapshot } as any,
        outputDecision: taperPlan as any,
        explanationText: taperPlan.explanation,
      },
    });

    return { competition, taperPlan, sessionsAdjusted };
  }

  // Edge case from FASE 3 F3: cancelling a competition during its taper window
  // must restore the plan, not just leave it silently reduced.
  async cancel(athleteId: string, competitionId: string) {
    const existing = await this.prisma.competition.findFirst({ where: { id: competitionId, athleteId } });
    if (!existing) {
      throw new NotFoundException(`Competition ${competitionId} not found for athlete ${athleteId}`);
    }

    const competition = await this.prisma.competition.update({
      where: { id: competitionId },
      data: { status: CompetitionStatus.CANCELLED },
    });

    const taperLog = await this.prisma.aiDecisionLog.findFirst({
      where: {
        athleteId,
        decisionType: 'TAPER_START',
        inputSnapshot: { path: ['competitionId'], equals: competitionId },
      },
      orderBy: { createdAt: 'desc' },
    });

    let restoredSessions = 0;
    if (taperLog) {
      const snapshot = (taperLog.inputSnapshot as any).snapshot as TaperSnapshotEntry[];
      const sessionExerciseIds = new Set<string>();
      for (const entry of snapshot) {
        await this.prisma.sessionExercise.update({
          where: { id: entry.sessionExerciseId },
          data: { targetSets: entry.originalTargetSets },
        });
        sessionExerciseIds.add(entry.sessionExerciseId);
      }

      const affectedSessions = await this.prisma.sessionExercise.findMany({
        where: { id: { in: Array.from(sessionExerciseIds) } },
        select: { sessionId: true },
        distinct: ['sessionId'],
      });
      for (const { sessionId } of affectedSessions) {
        await this.prisma.session.update({ where: { id: sessionId }, data: { status: SessionStatus.PLANNED } });
      }
      restoredSessions = affectedSessions.length;

      await this.prisma.aiDecisionLog.create({
        data: {
          athleteId,
          decisionType: 'TAPER_START',
          engineVersion: taperLog.engineVersion,
          inputSnapshot: { competitionId, restored: true } as any,
          outputDecision: { restoredSessions } as any,
          explanationText: `Torneo annullato: piano ripristinato ai valori pre-taper su ${restoredSessions} sedute.`,
        },
      });
    }

    return { competition, restoredSessions };
  }

  private async athletePrimarySport(athleteId: string) {
    const profile = await this.prisma.athleteProfile.findUnique({ where: { userId: athleteId } });
    return profile?.primarySport;
  }
}
