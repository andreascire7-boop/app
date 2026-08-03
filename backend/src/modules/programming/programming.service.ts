import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockType, PeriodizationModel, MicrocycleType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient, MacrocycleResult, SessionPlanResult } from './ai-engine.client';
import { toAiEngineEnum, toPrismaEnum } from './mappers';

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

@Injectable()
export class ProgrammingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  // Orchestrates F2 end to end (docs/product-design FASE 3/7): reads the athlete's
  // profile + active injuries + competition count, asks the AI engine for a
  // macrocycle, persists it, then generates and persists the first week of
  // concrete sessions (F9 prerequisite) for the first mesocycle.
  async generateMacrocycle(athleteId: string) {
    const profile = await this.prisma.athleteProfile.findUnique({ where: { userId: athleteId } });
    if (!profile) {
      throw new NotFoundException(`Athlete profile ${athleteId} not found — complete onboarding first`);
    }

    const activeInjuries = await this.prisma.injuryHistory.findMany({
      where: { athleteId, status: 'ACTIVE' },
    });
    const competitionsPerYear = await this.prisma.competition.count({
      where: { athleteId, status: { not: 'CANCELLED' } },
    });

    const aiResult = await this.aiEngineClient.generateMacrocycle(athleteId, {
      athlete_id: athleteId,
      primary_sport: toAiEngineEnum(profile.primarySport),
      level: toAiEngineEnum(profile.level),
      weekly_availability_days: profile.weeklyAvailabilityDays,
      competitions_per_year: competitionsPerYear,
      injury_history: activeInjuries.map((injury) => ({
        body_area: toAiEngineEnum(injury.bodyArea),
        status: 'active',
        severity_at_report: injury.severityAtReport,
      })),
    });

    const macrocycle = await this.persistMacrocycle(athleteId, aiResult);

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'PLAN_GENERATION',
        engineVersion: aiResult.engine_version,
        inputSnapshot: { profile, activeInjuries, competitionsPerYear } as any,
        outputDecision: aiResult as any,
        explanationText: aiResult.explanation,
      },
    });

    const firstMesocycle = macrocycle.mesocycles[0];
    const microcycle = await this.generateFirstMicrocycle(
      athleteId,
      firstMesocycle.id,
      profile.weeklyAvailabilityDays,
      aiResult,
    );

    return { ...macrocycle, firstMicrocycle: microcycle };
  }

  private async persistMacrocycle(athleteId: string, aiResult: MacrocycleResult) {
    const startDate = new Date();
    let cursor = new Date(startDate);
    const mesocyclesData = aiResult.mesocycles.map((mesocycle) => {
      const mesoStart = new Date(cursor);
      cursor = addWeeks(cursor, mesocycle.duration_weeks);
      return {
        blockType: mesocycle.block_type ? toPrismaEnum<BlockType>(mesocycle.block_type) : undefined,
        startDate: mesoStart,
        endDate: new Date(cursor),
        targetQualities: mesocycle.target_qualities,
      };
    });

    return this.prisma.macrocycle.create({
      data: {
        athleteId,
        modelType: toPrismaEnum<PeriodizationModel>(aiResult.model_type),
        startDate,
        endDate: cursor,
        mesocycles: { create: mesocyclesData },
      },
      include: { mesocycles: true },
    });
  }

  private async generateFirstMicrocycle(
    athleteId: string,
    mesocycleId: string,
    weeklyAvailabilityDays: number,
    macrocycleResult: MacrocycleResult,
  ) {
    const catalog = await this.prisma.exerciseLibrary.findMany({
      select: { id: true, movementPattern: true, bodyAreaRiskTags: true },
    });
    const sessionsPerWeek = Math.max(1, Math.min(weeklyAvailabilityDays, 7));
    const firstMesocycle = macrocycleResult.mesocycles[0];

    const sessionPlan: SessionPlanResult = await this.aiEngineClient.generateSessionPlan(athleteId, {
      athlete_id: athleteId,
      available_exercises: catalog.map((exercise) => ({
        id: exercise.id,
        movement_pattern: exercise.movementPattern,
        body_area_risk_tags: (exercise.bodyAreaRiskTags as string[]) ?? [],
      })),
      excluded_body_areas: macrocycleResult.excluded_body_areas,
      block_type: firstMesocycle?.block_type ?? null,
      sessions_per_week: sessionsPerWeek,
    });

    const weekStart = new Date();
    const dayStep = Math.max(1, Math.floor(7 / sessionsPerWeek));

    const microcycle = await this.prisma.microcycle.create({
      data: {
        mesocycleId,
        weekStartDate: weekStart,
        type: MicrocycleType.ORDINARIO,
      },
    });

    for (const [index, plannedSession] of sessionPlan.sessions.entries()) {
      await this.prisma.session.create({
        data: {
          microcycleId: microcycle.id,
          athleteId,
          scheduledDate: addDays(weekStart, index * dayStep),
          sessionFocus: plannedSession.session_focus,
          exercises: {
            create: plannedSession.exercises.map((exercise) => ({
              exerciseId: exercise.exercise_id,
              orderIndex: exercise.order_index,
              targetSets: exercise.target_sets ?? undefined,
              targetReps: exercise.target_reps ?? undefined,
              targetRpe: exercise.target_rpe ?? undefined,
            })),
          },
        },
      });
    }

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'PLAN_GENERATION',
        engineVersion: sessionPlan.engine_version,
        inputSnapshot: { sessionsPerWeek, excludedBodyAreas: macrocycleResult.excluded_body_areas } as any,
        outputDecision: sessionPlan as any,
        explanationText: sessionPlan.explanation,
      },
    });

    return this.prisma.microcycle.findUnique({
      where: { id: microcycle.id },
      include: { sessions: { include: { exercises: true } } },
    });
  }
}
