import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient } from '../programming/ai-engine.client';

const LOAD_HISTORY_WINDOW_DAYS = 35; // >=28 days needed for a reliable chronic average (FASE 7 §7.3)
const RECENT_PAIN_WINDOW_DAYS = 7;
// Session-RPE method (RPE x duration) needs a real duration per session, which the
// app doesn't capture yet — 60 min is a placeholder until session timing is tracked.
const DEFAULT_SESSION_DURATION_MINUTES = 60;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class RiskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
  ) {}

  async assessRisk(athleteId: string) {
    const since = new Date();
    since.setDate(since.getDate() - LOAD_HISTORY_WINDOW_DAYS);

    const feedbackWithLoad = await this.prisma.sessionFeedback.findMany({
      where: { athleteId, sessionRpe: { not: null }, submittedAt: { gte: since } },
      orderBy: { submittedAt: 'asc' },
    });

    const recentPainSince = new Date();
    recentPainSince.setDate(recentPainSince.getDate() - RECENT_PAIN_WINDOW_DAYS);
    const recentPainReports = await this.prisma.painReport.count({
      where: { athleteId, reportedAt: { gte: recentPainSince } },
    });

    // v1 proxy: "any" active injury history counts as the intrinsic risk factor —
    // the schema doesn't yet discriminate by body area against the current context.
    const hasInjuryHistory = (await this.prisma.injuryHistory.count({ where: { athleteId } })) > 0;

    const riskResult = await this.aiEngineClient.assessRisk(athleteId, {
      athlete_id: athleteId,
      load_history: feedbackWithLoad.map((feedback) => ({
        date: toIsoDate(feedback.submittedAt),
        session_load: feedback.sessionRpe! * DEFAULT_SESSION_DURATION_MINUTES,
      })),
      recent_pain_reports: recentPainReports,
      has_injury_history_same_area: hasInjuryHistory,
    });

    const riskAssessment = await this.prisma.riskAssessment.create({
      data: {
        athleteId,
        assessmentDate: new Date(),
        riskLevel: riskResult.risk_level.toUpperCase() as any,
        contributingFactors: riskResult.contributing_factors as any,
        recommendationText: riskResult.recommendation,
      },
    });

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'RISK_ASSESSMENT',
        engineVersion: riskResult.engine_version,
        inputSnapshot: { recentPainReports, hasInjuryHistory, loadPoints: feedbackWithLoad.length } as any,
        outputDecision: riskResult as any,
        explanationText: riskResult.recommendation,
      },
    });

    return riskAssessment;
  }

  latestForAthlete(athleteId: string) {
    return this.prisma.riskAssessment.findFirst({
      where: { athleteId },
      orderBy: { assessmentDate: 'desc' },
    });
  }
}
