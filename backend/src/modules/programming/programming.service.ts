import { Injectable, NotFoundException } from '@nestjs/common';
import { BlockType, PeriodizationModel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient, MacrocycleResult } from './ai-engine.client';
import { toAiEngineEnum, toPrismaEnum } from './mappers';

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
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
  // macrocycle, then persists it — the Core API never invents the plan itself.
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
}
