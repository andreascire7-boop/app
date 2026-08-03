import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  getCurrentForAthlete(athleteId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId: athleteId, status: SubscriptionStatus.ACTIVE },
      include: { plan: true },
    });
  }

  // DEV-MODE SCAFFOLD ONLY (docs/product-design FASE 4 §4.8, FASE 9 M3.1): this
  // does NOT charge any card or call RevenueCat/Stripe — no payment provider
  // credentials exist in this environment. It exists so the rest of the app
  // (paywall UI, entitlement checks) has something real to read/write against
  // while the real IAP/Stripe wiring is implemented.
  async subscribe(athleteId: string, dto: CreateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException(`Plan ${dto.planId} not found`);
    }

    await this.prisma.subscription.updateMany({
      where: { userId: athleteId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    return this.prisma.subscription.create({
      data: {
        userId: athleteId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        provider: 'REVENUECAT',
        externalRef: 'dev-mode-no-real-payment',
      },
      include: { plan: true },
    });
  }
}
