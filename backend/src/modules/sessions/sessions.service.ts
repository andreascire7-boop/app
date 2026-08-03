import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toAiEngineEnum } from '../programming/mappers';
import { AiEngineClient } from '../programming/ai-engine.client';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { SubmitSessionFeedbackDto } from './dto/submit-session-feedback.dto';
import { SubstituteExerciseDto } from './dto/substitute-exercise.dto';
import { categoryPatternsFor } from './exercise-categories';

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

  // F6 (docs/product-design FASE 3/7 §7.5): a pain signal against one specific
  // exercise triggers an immediate, logged substitution — never a silent swap.
  async substituteExercise(
    athleteId: string,
    sessionId: string,
    sessionExerciseId: string,
    dto: SubstituteExerciseDto,
  ) {
    const session = await this.getOne(athleteId, sessionId);
    const sessionExercise = session.exercises.find((e) => e.id === sessionExerciseId);
    if (!sessionExercise) {
      throw new NotFoundException(`Exercise ${sessionExerciseId} not found in session ${sessionId}`);
    }

    await this.prisma.painReport.create({
      data: { athleteId, bodyArea: dto.painArea, painLevel: dto.painLevel, context: 'ALLENAMENTO' },
    });

    const substitution = await this.aiEngineClient.evaluateSubstitution(athleteId, {
      athlete_id: athleteId,
      exercise_body_area_tags: (sessionExercise.exercise.bodyAreaRiskTags as string[]).map((tag) =>
        toAiEngineEnum(tag),
      ),
      reported_pain_area: toAiEngineEnum(dto.painArea),
      pain_level: dto.painLevel,
    });

    if (!substitution.should_substitute) {
      return { substituted: false, requiresProfessionalReferral: false, explanation: substitution.explanation };
    }

    const candidates = await this.prisma.exerciseLibrary.findMany({
      where: {
        id: { not: sessionExercise.exerciseId },
        movementPattern: { in: Array.from(categoryPatternsFor(sessionExercise.exercise.movementPattern)) },
      },
    });
    const painAreaLower = toAiEngineEnum(dto.painArea);
    const safeCandidate = candidates.find(
      (candidate) => !(candidate.bodyAreaRiskTags as string[]).map((t) => t.toLowerCase()).includes(painAreaLower),
    );

    if (!safeCandidate) {
      return {
        substituted: false,
        requiresProfessionalReferral: true,
        explanation:
          'Nessuna alternativa sicura trovata nel catalogo per questa zona: consulta un professionista prima di riprendere questo esercizio.',
      };
    }

    await this.prisma.sessionExercise.update({
      where: { id: sessionExerciseId },
      data: { exerciseId: safeCandidate.id, substitutedFromId: sessionExercise.exerciseId },
    });
    await this.prisma.exerciseSubstitutionLog.create({
      data: { sessionExerciseId, reason: 'PAIN', overriddenByUser: false },
    });
    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'EXERCISE_SUBSTITUTION',
        engineVersion: substitution.engine_version,
        inputSnapshot: { sessionExerciseId, painArea: dto.painArea, painLevel: dto.painLevel } as any,
        outputDecision: { ...substitution, replacementExerciseId: safeCandidate.id } as any,
        explanationText: substitution.explanation,
      },
    });

    return {
      substituted: true,
      replacementExerciseId: safeCandidate.id,
      replacementExerciseName: safeCandidate.name,
      requiresProfessionalReferral: substitution.requires_professional_referral,
      explanation: substitution.explanation,
    };
  }
}
