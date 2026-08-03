import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient } from '../programming/ai-engine.client';
import { SubmitWellnessCheckinDto } from './dto/submit-wellness-checkin.dto';

const RECENT_SESSIONS_FOR_READINESS = 3;
const RECENT_PAIN_WINDOW_DAYS = 3;

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

@Injectable()
export class WellnessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  // F7 (docs/product-design FASE 3/7 §7.6): readiness is computed and stored
  // proactively, before the athlete starts today's session — not a passive log.
  async submitCheckin(athleteId: string, dto: SubmitWellnessCheckinDto) {
    const recentFeedback = await this.prisma.sessionFeedback.findMany({
      where: { athleteId, sessionRpe: { not: null } },
      orderBy: { submittedAt: 'desc' },
      take: RECENT_SESSIONS_FOR_READINESS,
    });
    const recentRpeChronological = recentFeedback.map((f) => f.sessionRpe!).reverse();

    const painSince = new Date();
    painSince.setDate(painSince.getDate() - RECENT_PAIN_WINDOW_DAYS);
    const recentPainReports = await this.prisma.painReport.count({
      where: { athleteId, reportedAt: { gte: painSince } },
    });

    const readiness = await this.aiEngineClient.computeReadiness(athleteId, {
      athlete_id: athleteId,
      sleep_hours: dto.sleepHours,
      sleep_quality: dto.sleepQuality,
      recent_session_rpe: recentRpeChronological,
      recent_pain_reports: recentPainReports,
      stress_level: dto.stressLevel,
    });

    const checkDate = todayDateOnly();
    const checkin = await this.prisma.wellnessCheckin.upsert({
      where: { athleteId_checkDate: { athleteId, checkDate } },
      create: {
        athleteId,
        checkDate,
        sleepHours: dto.sleepHours,
        sleepQuality: dto.sleepQuality,
        stressLevel: dto.stressLevel,
        readinessScore: readiness.readiness_score,
      },
      update: {
        sleepHours: dto.sleepHours,
        sleepQuality: dto.sleepQuality,
        stressLevel: dto.stressLevel,
        readinessScore: readiness.readiness_score,
      },
    });

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'READINESS_ASSESSMENT',
        engineVersion: readiness.engine_version,
        inputSnapshot: { dto, recentRpeChronological, recentPainReports } as any,
        outputDecision: readiness as any,
        explanationText: readiness.recommendation,
      },
    });

    return { checkin, readiness };
  }

  getToday(athleteId: string) {
    return this.prisma.wellnessCheckin.findUnique({
      where: { athleteId_checkDate: { athleteId, checkDate: todayDateOnly() } },
    });
  }
}
