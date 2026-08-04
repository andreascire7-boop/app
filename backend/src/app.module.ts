import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AthleteProfileModule } from './modules/athlete-profile/athlete-profile.module';
import { ProgrammingModule } from './modules/programming/programming.module';
import { MesocyclesModule } from './modules/mesocycles/mesocycles.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RiskModule } from './modules/risk/risk.module';
import { CompetitionsModule } from './modules/competitions/competitions.module';
import { WellnessModule } from './modules/wellness/wellness.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { CoachModule } from './modules/coach/coach.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PerformanceLabModule } from './modules/performance-lab/performance-lab.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AthleteProfileModule,
    ProgrammingModule,
    MesocyclesModule,
    SessionsModule,
    RiskModule,
    CompetitionsModule,
    WellnessModule,
    NutritionModule,
    CoachModule,
    SubscriptionsModule,
    PerformanceLabModule,
  ],
})
export class AppModule {}
