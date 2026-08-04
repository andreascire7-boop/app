import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiEngineClient } from '../programming/ai-engine.client';
import { ProgrammingService } from '../programming/programming.service';
import { SubmitMesocycleFeedbackDto } from './dto/submit-mesocycle-feedback.dto';

@Injectable()
export class MesocyclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
    private readonly programmingService: ProgrammingService,
  ) {}

  private async findMesocycleOrThrow(athleteId: string, mesocycleId: string) {
    const mesocycle = await this.prisma.mesocycle.findFirst({
      where: { id: mesocycleId, macrocycle: { athleteId } },
      include: {
        macrocycle: true,
        feedback: true,
        microcycles: { include: { sessions: { include: { exercises: true, feedback: true } } } },
      },
    });
    if (!mesocycle) {
      throw new NotFoundException(`Mesocycle ${mesocycleId} not found for athlete ${athleteId}`);
    }
    return mesocycle;
  }

  private buildSummary(mesocycle: Awaited<ReturnType<typeof this.findMesocycleOrThrow>>) {
    const sessions = mesocycle.microcycles.flatMap((m) => m.sessions);
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED).length;
    const adherencePercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : null;

    const rpeValues = sessions.flatMap((s) => s.feedback.map((f) => f.sessionRpe).filter((v): v is number => v != null));
    const avgSessionRpe = rpeValues.length > 0 ? Math.round((rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length) * 10) / 10 : null;
    const totalSetsLogged = sessions.reduce(
      (sum, s) => sum + s.exercises.reduce((exSum, ex) => exSum + (ex.targetSets ?? 0), 0),
      0,
    );

    return {
      mesocycleId: mesocycle.id,
      blockType: mesocycle.blockType,
      targetQualities: mesocycle.targetQualities,
      startDate: mesocycle.startDate,
      endDate: mesocycle.endDate,
      completedAt: mesocycle.completedAt,
      totalSessions,
      completedSessions,
      adherencePercentage: mesocycle.adherencePercentage ?? adherencePercentage,
      improvements: {
        avgSessionRpe,
        totalSetsLogged,
      },
      feedback: mesocycle.feedback,
    };
  }

  async getSummary(athleteId: string, mesocycleId: string) {
    const mesocycle = await this.findMesocycleOrThrow(athleteId, mesocycleId);
    return this.buildSummary(mesocycle);
  }

  // Schermata "Mesociclo completato": chiude il blocco calcolando aderenza e stato,
  // senza ancora chiedere il feedback (F: schermata poi form).
  async complete(athleteId: string, mesocycleId: string) {
    const mesocycle = await this.findMesocycleOrThrow(athleteId, mesocycleId);
    const summary = this.buildSummary(mesocycle);

    await this.prisma.mesocycle.update({
      where: { id: mesocycleId },
      data: {
        completedAt: mesocycle.completedAt ?? new Date(),
        adherencePercentage: summary.adherencePercentage ?? undefined,
      },
    });

    return summary;
  }

  // Il feedback chiude (se non già chiuso) il mesociclo, poi genera la prima
  // microcycle del mesociclo successivo con il volume aggiustato in base al
  // feedback (difficoltà/energia/recupero/dolore/soddisfazione).
  async submitFeedback(athleteId: string, mesocycleId: string, dto: SubmitMesocycleFeedbackDto) {
    const mesocycle = await this.findMesocycleOrThrow(athleteId, mesocycleId);

    if (!mesocycle.completedAt) {
      await this.complete(athleteId, mesocycleId);
    }

    const feedback = await this.prisma.mesocycleFeedback.upsert({
      where: { mesocycleId },
      create: {
        mesocycleId,
        athleteId,
        difficultyPerceived: dto.difficultyPerceived,
        energyLevel: dto.energyLevel,
        recoveryQuality: dto.recoveryQuality,
        painLevel: dto.painLevel ?? 0,
        programSatisfaction: dto.programSatisfaction,
        notes: dto.notes,
      },
      update: {
        difficultyPerceived: dto.difficultyPerceived,
        energyLevel: dto.energyLevel,
        recoveryQuality: dto.recoveryQuality,
        painLevel: dto.painLevel ?? 0,
        programSatisfaction: dto.programSatisfaction,
        notes: dto.notes,
      },
    });

    const adjustment = await this.aiEngineClient.evaluateMesocycleFeedback(athleteId, {
      athlete_id: athleteId,
      difficulty_perceived: dto.difficultyPerceived,
      energy_level: dto.energyLevel,
      recovery_quality: dto.recoveryQuality,
      pain_level: dto.painLevel ?? 0,
      program_satisfaction: dto.programSatisfaction,
    });

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'VOLUME_ADJUSTMENT',
        engineVersion: adjustment.engine_version,
        inputSnapshot: { mesocycleId, feedback: dto } as any,
        outputDecision: adjustment as any,
        explanationText: adjustment.explanation,
      },
    });

    const nextMesocycle = await this.prisma.mesocycle.findFirst({
      where: {
        macrocycleId: mesocycle.macrocycleId,
        startDate: { gt: mesocycle.startDate },
        microcycles: { none: {} },
      },
      orderBy: { startDate: 'asc' },
    });

    let nextMicrocycle = null;
    if (nextMesocycle) {
      nextMicrocycle = await this.programmingService.generateMicrocycleForMesocycle(
        athleteId,
        nextMesocycle.id,
        adjustment.volume_adjustment_factor,
      );
    }

    return { feedback, adjustment, nextMesocycleId: nextMesocycle?.id ?? null, nextMicrocycle };
  }
}
