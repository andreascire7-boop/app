import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { toAiEngineEnum } from '../programming/mappers';
import { AiEngineClient } from '../programming/ai-engine.client';
import { UpsertNutritionProfileDto } from './dto/upsert-nutrition-profile.dto';
import { CreateNutritionRecommendationDto } from './dto/create-nutrition-recommendation.dto';

const MINOR_AGE_THRESHOLD = 18;

function isMinor(dateOfBirth: Date | null): boolean {
  if (!dateOfBirth) return false;
  const ageMs = Date.now() - dateOfBirth.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  return ageYears < MINOR_AGE_THRESHOLD;
}

@Injectable()
export class NutritionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  async upsertProfile(athleteId: string, dto: UpsertNutritionProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: athleteId } });
    const minor = isMinor(user?.dateOfBirth ?? null);

    // Guardrail (docs/product-design FASE 3 F8 edge case): never persist a fat-loss
    // goal for a minor, regardless of what the client sends.
    const bodyCompGoal = minor && dto.bodyCompGoal === 'lose_fat' ? undefined : dto.bodyCompGoal;

    return this.prisma.nutritionProfile.upsert({
      where: { userId: athleteId },
      create: {
        userId: athleteId,
        bodyCompGoal,
        dietaryRestrictions: dto.dietaryRestrictions ?? [],
        disorderedEatingFlag: dto.disorderedEatingFlag ?? false,
      },
      update: {
        bodyCompGoal,
        dietaryRestrictions: dto.dietaryRestrictions,
        disorderedEatingFlag: dto.disorderedEatingFlag,
      },
    });
  }

  getProfile(athleteId: string) {
    return this.prisma.nutritionProfile.findUnique({ where: { userId: athleteId } });
  }

  // F8 (docs/product-design FASE 3/7): the disordered-eating guardrail is checked
  // here, server-side, on every request — never left to client-side trust alone.
  async createRecommendation(athleteId: string, dto: CreateNutritionRecommendationDto) {
    const [profile, user] = await Promise.all([
      this.prisma.nutritionProfile.findUnique({ where: { userId: athleteId } }),
      this.prisma.user.findUnique({ where: { id: athleteId } }),
    ]);

    if (profile?.disorderedEatingFlag) {
      await this.prisma.nutritionFlagEvent.create({
        data: {
          athleteId,
          triggerReason: 'disordered_eating_flag_active',
          actionTaken: 'numeric_suspended_redirect_professional',
        },
      });
    }

    const result = await this.aiEngineClient.computeNutritionRecommendation(athleteId, {
      athlete_id: athleteId,
      context: toAiEngineEnum(dto.context),
      is_minor: isMinor(user?.dateOfBirth ?? null),
      disordered_eating_flag: profile?.disorderedEatingFlag ?? false,
      body_comp_goal: profile?.bodyCompGoal ?? undefined,
      competition_duration_minutes: dto.competitionDurationMinutes,
    });

    const recommendation = await this.prisma.nutritionRecommendation.create({
      data: {
        athleteId,
        context: dto.context,
        macroTargets: result as any,
        linkedCompetitionId: dto.linkedCompetitionId,
      },
    });

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'NUTRITION_FLAG',
        engineVersion: result.engine_version,
        inputSnapshot: { context: dto.context, hasDisorderedEatingFlag: !!profile?.disorderedEatingFlag } as any,
        outputDecision: result as any,
        explanationText: result.explanation,
      },
    });

    return recommendation;
  }

  listSupplements() {
    return this.prisma.supplementReference.findMany();
  }
}
