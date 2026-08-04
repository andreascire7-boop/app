import { Injectable } from '@nestjs/common';
import { PerformanceTestType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePerformanceTestDto } from './dto/create-performance-test.dto';

// Test a tempo/agilità: un valore più basso è un miglioramento. Gli altri (potenza,
// forza) migliorano quando il valore sale.
const LOWER_IS_BETTER = new Set<PerformanceTestType>([
  PerformanceTestType.SPRINT_5M,
  PerformanceTestType.SPRINT_10M,
  PerformanceTestType.TEST_505,
  PerformanceTestType.T_TEST,
  PerformanceTestType.SPIDER_TEST,
]);

@Injectable()
export class PerformanceLabService {
  constructor(private readonly prisma: PrismaService) {}

  create(athleteId: string, dto: CreatePerformanceTestDto) {
    return this.prisma.performanceTest.create({
      data: {
        athleteId,
        testType: dto.testType,
        customName: dto.customName,
        value: dto.value,
        unit: dto.unit,
        phase: dto.phase,
        testDate: dto.testDate ? new Date(dto.testDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  list(athleteId: string, testType?: PerformanceTestType) {
    return this.prisma.performanceTest.findMany({
      where: { athleteId, testType },
      orderBy: { testDate: 'asc' },
    });
  }

  // Sezione "Performance Lab": andamento nel tempo + % miglioramento + confronto
  // iniziale/intermedio/finale, raggruppati per tipo di test.
  async progress(athleteId: string) {
    const tests = await this.prisma.performanceTest.findMany({
      where: { athleteId },
      orderBy: { testDate: 'asc' },
    });

    const byType = new Map<string, typeof tests>();
    for (const test of tests) {
      const key = test.testType === PerformanceTestType.CUSTOM_STRENGTH ? `CUSTOM:${test.customName}` : test.testType;
      const bucket = byType.get(key) ?? [];
      bucket.push(test);
      byType.set(key, bucket);
    }

    return Array.from(byType.entries()).map(([key, series]) => {
      const first = series[0];
      const last = series[series.length - 1];
      const lowerIsBetter = LOWER_IS_BETTER.has(first.testType);

      let improvementPercentage: number | null = null;
      if (series.length > 1 && first.value !== 0) {
        improvementPercentage = lowerIsBetter
          ? ((first.value - last.value) / first.value) * 100
          : ((last.value - first.value) / first.value) * 100;
        improvementPercentage = Math.round(improvementPercentage * 10) / 10;
      }

      const byPhase = {
        iniziale: series.find((t) => t.phase === 'INIZIALE') ?? first,
        intermedio: series.find((t) => t.phase === 'INTERMEDIO') ?? null,
        finale: series.find((t) => t.phase === 'FINALE') ?? (series.length > 1 ? last : null),
      };

      return {
        testType: first.testType,
        customName: first.customName,
        unit: first.unit,
        lowerIsBetter,
        series,
        improvementPercentage,
        comparison: byPhase,
      };
    });
  }
}
