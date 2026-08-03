import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient } from '../programming/ai-engine.client';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { SubmitSessionFeedbackDto } from './dto/submit-session-feedback.dto';

// The block's planned/target RPE (FASE 7 §7.2) — v1 uses a single constant across
// blocks; a future iteration should read it from the athlete's active mesocycle.
const DEFAULT_EXPECTED_RPE = 7.0;
const RECENT_SESSIONS_FOR_AUTOREGULATION = 3;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  listForAthlete(athleteId: string) {
    return this.prisma.session.findMany({
      where: { athleteId },
      orderBy: { scheduledDate: 'asc' },
      include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
    });
  }

  async getOne(athleteId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, athleteId },
      include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
    });
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found for athlete ${athleteId}`);
    }
    return session;
  }

  async logExerciseSet(athleteId: string, sessionId: string, dto: CreateExerciseLogDto) {
    await this.getOne(athleteId, sessionId); // 404s if the session isn't this athlete's
    return this.prisma.exerciseLog.create({
      data: {
        sessionExerciseId: dto.sessionExerciseId,
        setNumber: dto.setNumber,
        actualReps: dto.actualReps,
        actualLoad: dto.actualLoad,
        actualRpe: dto.actualRpe,
      },
    });
  }

  // Closes the F4 loop (docs/product-design FASE 3/7 §7.2): the check-in triggers
  // the autoregulation rule, and — if it calls for a reduction — the very next
  // planned session is adjusted immediately, not "eventually".
  async submitFeedback(athleteId: string, sessionId: string, dto: SubmitSessionFeedbackDto) {
    const session = await this.getOne(athleteId, sessionId);

    const feedback = await this.prisma.sessionFeedback.create({
      data: {
        sessionId,
        athleteId,
        sessionRpe: dto.sessionRpe,
        energyLevel: dto.energyLevel,
        notes: dto.notes,
      },
    });

    if (dto.painArea !== undefined && dto.painLevel !== undefined) {
      await this.prisma.painReport.create({
        data: {
          athleteId,
          bodyArea: dto.painArea,
          painLevel: dto.painLevel,
          context: 'ALLENAMENTO',
        },
      });
    }

    await this.prisma.session.update({ where: { id: sessionId }, data: { status: SessionStatus.COMPLETED } });

    const recentFeedback = await this.prisma.sessionFeedback.findMany({
      where: { athleteId, sessionRpe: { not: null } },
      orderBy: { submittedAt: 'desc' },
      take: RECENT_SESSIONS_FOR_AUTOREGULATION,
    });
    const recentRpeChronological = recentFeedback.map((f) => f.sessionRpe!).reverse();

    const autoregulation = await this.aiEngineClient.evaluateAutoregulation(athleteId, {
      athlete_id: athleteId,
      recent_session_rpe: recentRpeChronological,
      expected_rpe: DEFAULT_EXPECTED_RPE,
    });

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'VOLUME_ADJUSTMENT',
        engineVersion: autoregulation.engine_version,
        inputSnapshot: { recentRpeChronological, expectedRpe: DEFAULT_EXPECTED_RPE } as any,
        outputDecision: autoregulation as any,
        explanationText: autoregulation.explanation,
      },
    });

    let adjustedNextSessionId: string | null = null;
    if (autoregulation.volume_adjustment_factor < 1.0) {
      const nextSession = await this.prisma.session.findFirst({
        where: { athleteId, status: SessionStatus.PLANNED, scheduledDate: { gt: session.scheduledDate } },
        orderBy: { scheduledDate: 'asc' },
        include: { exercises: true },
      });
      if (nextSession) {
        for (const exercise of nextSession.exercises) {
          if (exercise.targetSets != null) {
            // A straight round() on small set counts (2-4) often rounds back to the
            // same integer, silently no-opping the reduction — floor it and force at
            // least 1 set of real reduction instead (never below 1 set).
            const flooredSets = Math.floor(exercise.targetSets * autoregulation.volume_adjustment_factor);
            const newTargetSets = Math.max(1, Math.min(flooredSets, exercise.targetSets - 1));
            await this.prisma.sessionExercise.update({
              where: { id: exercise.id },
              data: { targetSets: newTargetSets },
            });
          }
        }
        await this.prisma.session.update({
          where: { id: nextSession.id },
          data: { status: SessionStatus.MODIFIED },
        });
        adjustedNextSessionId = nextSession.id;
      }
    }

    return { feedback, autoregulation, adjustedNextSessionId };
  }
}
