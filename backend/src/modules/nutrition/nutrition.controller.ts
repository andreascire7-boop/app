import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { UpsertNutritionProfileDto } from './dto/upsert-nutrition-profile.dto';
import { CreateNutritionRecommendationDto } from './dto/create-nutrition-recommendation.dto';

@Controller('athletes/:athleteId/nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('profile')
  upsertProfile(@Param('athleteId') athleteId: string, @Body() dto: UpsertNutritionProfileDto) {
    return this.nutritionService.upsertProfile(athleteId, dto);
  }

  @Get('profile')
  getProfile(@Param('athleteId') athleteId: string) {
    return this.nutritionService.getProfile(athleteId);
  }

  @Post('recommendations')
  createRecommendation(
    @Param('athleteId') athleteId: string,
    @Body() dto: CreateNutritionRecommendationDto,
  ) {
    return this.nutritionService.createRecommendation(athleteId, dto);
  }

  @Get('supplements')
  listSupplements() {
    return this.nutritionService.listSupplements();
  }
}
