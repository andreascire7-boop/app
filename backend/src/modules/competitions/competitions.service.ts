import { Injectable, NotFoundException } from '@nestjs/common';
import { CompetitionStatus, Sport, SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from '../../common/date-utils';
import { AiEngineClient } from '../programming/ai-engine.client';
import { toAiEngineEnum } from '../programming/mappers';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CompetitionImportService } from './competition-import.service';

interface TaperSnapshotEntry {
  sessionExerciseId: string;
  originalTargetSets: number;
}

interface PersistCompetitionInput {
  name?: string;
  eventDate: Date;
  importance: CreateCompetitionDto['importance'];
  expectedMatches?: number;
  sourceFileName?: string;
  autoExtracted?: boolean;
}

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineClient: AiEngineClient,
    private readonly competitionImportService: CompetitionImportService,
  ) {}

  listForAthlete(athleteId: string) {
    return this.prisma.competition.findMany({
      where: { athleteId },
      orderBy: { eventDate: 'asc' },
    });
  }

  // F3 (docs/product-design FASE 3/7 §7.4): creating a competition immediately
  // computes and applies the taper to whatever sessions already fall in its window.
  create(athleteId: string, dto: CreateCompetitionDto) {
    return this.persistCompetitionAndTaper(athleteId, {
      eventDate: new Date(dto.eventDate),
      importance: dto.importance,
      expectedMatches: dto.expectedMatches,
    });
  }

  // Import calendario competitivo (PDF/Excel/CSV): ogni torneo estratto passa dallo
  // stesso calcolo di tapering di un inserimento manuale, con una spiegazione
  // dedicata per ciascuno (docs: "Il programma è stato modificato perché...").
  async importFromFile(athleteId: string, file: Express.Multer.File) {
    const candidates = await this.competitionImportService.parse(file);
    const imported: Array<Awaited<ReturnType<typeof this.persistCompetitionAndTaper>>> = [];

    for (const candidate of candidates) {
      const result = await this.persistCompetitionAndTaper(athleteId, {
        name: candidate.name,
        eventDate: new Date(candidate.eventDate),
        importance: candidate.importance,
        expectedMatches: candidate.expectedMatches,
        sourceFileName: file.originalname,
        autoExtracted: true,
      });
      imported.push(result);
    }

    return { fileName: file.originalname, extractedCount: candidates.length, imported };
  }

  private async persistCompetitionAndTaper(athleteId: string, input: PersistCompetitionInput) {
    const eventDate = input.eventDate;
    const competition = await this.prisma.competition.create({
      data: {
        athleteId,
        name: input.name,
        sport: (await this.athletePrimarySport(athleteId)) ?? Sport.BOTH,
        eventDate,
        importance: input.importance,
        expectedMatches: input.expectedMatches,
        sourceFileName: input.sourceFileName,
        autoExtracted: input.autoExtracted ?? false,
      },
    });

    const daysUntilEvent = Math.max(0, Math.ceil((eventDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

    const taperPlan = await this.aiEngineClient.computeTaperPlan(athleteId, {
      athlete_id: athleteId,
      days_until_event: daysUntilEvent,
      importance: toAiEngineEnum(input.importance),
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

    // Spiegazione sempre visibile all'atleta: l'AI engine conosce solo
    // "giorni all'evento", non la data di calendario reale — la componiamo qui.
    const dateLabel = eventDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const competitionLabel = input.name ? `"${input.name}"` : 'una competizione';
    const explanation =
      `Il programma è stato modificato perché hai ${competitionLabel} il giorno ${dateLabel}. ` +
      taperPlan.explanation;

    await this.prisma.aiDecisionLog.create({
      data: {
        athleteId,
        decisionType: 'TAPER_START',
        engineVersion: taperPlan.engine_version,
        inputSnapshot: { competitionId: competition.id, snapshot } as any,
        outputDecision: taperPlan as any,
        explanationText: explanation,
      },
    });

    return { competition, taperPlan, sessionsAdjusted, explanation };
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
