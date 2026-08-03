import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AthleteProfileModule } from './modules/athlete-profile/athlete-profile.module';
import { ProgrammingModule } from './modules/programming/programming.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AthleteProfileModule,
    ProgrammingModule,
  ],
})
export class AppModule {}
