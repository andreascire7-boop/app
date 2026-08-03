import { Module } from '@nestjs/common';
import { AthleteProfileController } from './athlete-profile.controller';
import { AthleteProfileService } from './athlete-profile.service';

@Module({
  controllers: [AthleteProfileController],
  providers: [AthleteProfileService],
})
export class AthleteProfileModule {}
