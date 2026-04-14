import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyTier } from '@prisma/client';

// Niveles: BRONCE (0-499), PLATA (500-1999), ORO (2000-4999), ELITE (5000+)
const TIER_THRESHOLDS: Record<string, number> = {
  BRONCE: 0,
  PLATA: 500,
  ORO: 2000,
  ELITE: 5000,
};

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getPoints(userId: string) {
    return this.prisma.loyaltyPoints.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async addPoints(
    userId: string,
    points: number,
    type: 'PURCHASE' | 'FIRST_PURCHASE' | 'BIRTHDAY' | 'REVIEW_PHOTO' | 'REFERRAL' | 'ADJUSTMENT',
    description: string,
    orderId?: string,
  ) {
    const loyalty = await this.prisma.loyaltyPoints.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points },
        currentPoints: { increment: points },
      },
      create: { userId, totalPoints: points, currentPoints: points },
    });

    await this.prisma.loyaltyTransaction.create({
      data: { loyaltyId: loyalty.id, points, type, description, orderId },
    });

    // Actualizar nivel
    const newTier = this.calculateTier(loyalty.totalPoints + points);
    if (newTier !== loyalty.tier) {
      await this.prisma.loyaltyPoints.update({
        where: { userId },
        data: { tier: newTier },
      });
    }

    return this.getPoints(userId);
  }

  async redeemPoints(userId: string, points: number, description: string) {
    const loyalty = await this.prisma.loyaltyPoints.findUnique({ where: { userId } });
    if (!loyalty || loyalty.currentPoints < points) {
      throw new BadRequestException('Puntos insuficientes');
    }

    await this.prisma.loyaltyPoints.update({
      where: { userId },
      data: { currentPoints: { decrement: points } },
    });

    await this.prisma.loyaltyTransaction.create({
      data: { loyaltyId: loyalty.id, points: -points, type: 'REDEEM', description },
    });

    return this.getPoints(userId);
  }

  /**
   * Otorgar puntos por compra: 1 punto por cada $1
   */
  async addPointsForOrder(userId: string, orderTotal: number, orderId: string) {
    const points = Math.floor(orderTotal); // 1 punto por $1
    return this.addPoints(userId, points, 'PURCHASE', `Compra - Orden ${orderId}`, orderId);
  }

  private calculateTier(totalPoints: number): LoyaltyTier {
    if (totalPoints >= TIER_THRESHOLDS.ELITE) return LoyaltyTier.ELITE;
    if (totalPoints >= TIER_THRESHOLDS.ORO) return LoyaltyTier.ORO;
    if (totalPoints >= TIER_THRESHOLDS.PLATA) return LoyaltyTier.PLATA;
    return LoyaltyTier.BRONCE;
  }
}
