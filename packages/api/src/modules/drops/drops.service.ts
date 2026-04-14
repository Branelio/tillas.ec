import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DropsService {
  constructor(private prisma: PrismaService) {}

  async getActiveDrops() {
    return this.prisma.drop.findMany({
      where: { status: { in: ['SCHEDULED', 'LIVE'] } },
      include: { products: { include: { product: { include: { brand: true, variants: true } } } } },
      orderBy: { startsAt: 'asc' },
    });
  }

  async getDropBySlug(slug: string) {
    const drop = await this.prisma.drop.findUnique({
      where: { slug },
      include: {
        products: { include: { product: { include: { brand: true, variants: true } } } },
        entries: { select: { id: true } },
      },
    });
    if (!drop) throw new NotFoundException('Drop no encontrado');
    return { ...drop, totalEntries: drop.entries.length };
  }

  async enterDrop(userId: string, dropId: string, selectedSize: string) {
    const drop = await this.prisma.drop.findUnique({ where: { id: dropId } });
    if (!drop) throw new NotFoundException('Drop no encontrado');
    if (drop.status !== 'LIVE') throw new BadRequestException('Este drop no está activo');

    if (drop.maxEntries) {
      const count = await this.prisma.dropEntry.count({ where: { dropId } });
      if (count >= drop.maxEntries) throw new BadRequestException('Drop lleno, ¡llegaste tarde!');
    }

    return this.prisma.dropEntry.create({
      data: { dropId, userId, selectedSize },
    });
  }

  async getUserEntries(userId: string) {
    return this.prisma.dropEntry.findMany({
      where: { userId },
      include: { drop: { include: { products: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin
  async createDrop(data: any) {
    return this.prisma.drop.create({
      data: {
        ...data,
        products: { create: data.productIds?.map((pid: string) => ({ productId: pid })) },
      },
    });
  }

  async updateDropStatus(dropId: string, status: any) {
    return this.prisma.drop.update({ where: { id: dropId }, data: { status } });
  }
}
