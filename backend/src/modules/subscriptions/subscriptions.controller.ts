import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  listPlans() {
    return this.subscriptionsService.listPlans();
  }

  @Get('athletes/:athleteId/subscription')
  getCurrent(@Param('athleteId') athleteId: string) {
    return this.subscriptionsService.getCurrentForAthlete(athleteId);
  }

  @Post('athletes/:athleteId/subscriptions')
  subscribe(@Param('athleteId') athleteId: string, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(athleteId, dto);
  }
}
