import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockType, PeriodizationModel, MicrocycleType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays, addWeeks } from '../../common/date-utils';
import { AiEngineClient, MacrocycleResult, SessionPlanResult } from './ai-engine.client';
import { toAiEngineEnum, toPrismaEnum } from './mappers';

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

    // Tutto lo storico (attivo/recupero/risolto) viene inviato: l'AI engine decide
    // da solo cosa escludere, ridurre o trattare come prehab preventivo per stato.
    const injuryHistory = await this.prisma.injuryHistory.findMany({ where: { athleteId } });
    const activeInjuries = injuryHistory.filter((i) => i.status === 'ACTIVE');
    const competitionsPerYear = await this.prisma.competition.count({
      where: { athleteId, status: { not: 'CANCELLED' } },
    });

    const aiResult = await this.aiEngineClient.generateMacrocycle(athleteId, {
      athlete_id: athleteId,
      primary_sport: toAiEngineEnum(profile.primarySport),
      level: toAiEngineEnum(profile.level),
      weekly_availability_days: profile.weeklyAvailabilityDays,
      competitions_per_year: competitionsPerYear,
      injury_history: injuryHistory.map((injury) => ({
        body_area: toAiEngineEnum(injury.bodyArea),
        status: toAiEngineEnum(injury.status),
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
    const microcycle = await this.generateMicrocycle(
      athleteId,
      firstMesocycle.id,
      profile.weeklyAvailabilityDays,
      aiResult,
    );

    return { ...macrocycle, firstMicrocycle: microcycle };
  }

  // Chiamato da MesocyclesService dopo il feedback di chiusura di un mesociclo:
  // rilegge lo storico infortuni corrente (può essere cambiato nel frattempo) e
  // genera la prima microcycle/settimana del mesociclo successivo, applicando il
  // fattore di aggiustamento volume derivato dal feedback (difficoltà/energia/
  // recupero/dolore/soddisfazione).
  async generateMicrocycleForMesocycle(
    athleteId: string,
    mesocycleId: string,
    volumeAdjustmentFactor = 1.0,
  ) {
    const profile = await this.prisma.athleteProfile.findUnique({ where: { userId: athleteId } });
    if (!profile) {
      throw new NotFoundException(`Athlete profile ${athleteId} not found`);
    }
    const mesocycle = await this.prisma.mesocycle.findUnique({ where: { id: mesocycleId } });
    if (!mesocycle) {
      throw new NotFoundException(`Mesocycle ${mesocycleId} not found`);
    }

    const injuryHistory = await this.prisma.injuryHistory.findMany({ where: { athleteId } });
    const competitionsPerYear = await this.prisma.competition.count({
      where: { athleteId, status: { not: 'CANCELLED' } },
    });

    // Riusiamo l'endpoint macrocycle solo per le liste zone-corpo aggiornate
    // (escluse/ridotte/preventive) — il modello di periodizzazione già scelto e
    // persistito per questo mesociclo non viene toccato.
    const areas = await this.aiEngineClient.generateMacrocycle(athleteId, {
      athlete_id: athleteId,
      primary_sport: toAiEngineEnum(profile.primarySport),
      level: toAiEngineEnum(profile.level),
      weekly_availability_days: profile.weeklyAvailabilityDays,
      competitions_per_year: competitionsPerYear,
      injury_history: injuryHistory.map((injury) => ({
        body_area: toAiEngineEnum(injury.bodyArea),
        status: toAiEngineEnum(injury.status),
        severity_at_report: injury.severityAtReport,
      })),
    });

    const macrocycleResult: MacrocycleResult = {
      ...areas,
      mesocycles: [
        {
          block_type: mesocycle.blockType ? toAiEngineEnum(mesocycle.blockType) : null,
          duration_weeks: 0,
          target_qualities: [],
        },
      ],
    };

    return this.generateMicrocycle(
      athleteId,
      mesocycleId,
      profile.weeklyAvailabilityDays,
      macrocycleResult,
      volumeAdjustmentFactor,
    );
  }

  // Read-only view for the mobile "Programma" tab (S7, docs/product-design
  // FASE 6) — the athlete's current macrocycle with its full mesocycle/
  // microcycle/session breakdown, without regenerating anything.
  async getCurrentMacrocycle(athleteId: string) {
    const macrocycle = await this.prisma.macrocycle.findFirst({
      where: { athleteId },
      orderBy: { startDate: 'desc' },
      include: {
        mesocycles: {
          orderBy: { startDate: 'asc' },
          include: {
            microcycles: {
              orderBy: { weekStartDate: 'asc' },
              include: {
                sessions: {
                  orderBy: { scheduledDate: 'asc' },
                  include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
                },
              },
            },
          },
        },
      },
    });
    if (!macrocycle) {
      throw new NotFoundException(`No macrocycle found for athlete ${athleteId} — generate one first`);
    }
    return macrocycle;
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

  private async generateMicrocycle(
    athleteId: string,
    mesocycleId: string,
    weeklyAvailabilityDays: number,
    macrocycleResult: MacrocycleResult,
    volumeAdjustmentFactor = 1.0,
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
      reduced_load_body_areas: macrocycleResult.reduced_load_body_areas,
      preventive_focus_areas: macrocycleResult.preventive_focus_areas,
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
              targetSets:
                exercise.target_sets != null
                  ? Math.max(1, Math.round(exercise.target_sets * volumeAdjustmentFactor))
                  : undefined,
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
        inputSnapshot: {
          sessionsPerWeek,
          excludedBodyAreas: macrocycleResult.excluded_body_areas,
          volumeAdjustmentFactor,
        } as any,
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
