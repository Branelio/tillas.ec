import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReturnDto) {
    // Verificar que la orden pertenece al usuario y está en estado entregado/completado
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new BadRequestException('Esta orden no te pertenece');
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      throw new BadRequestException('Solo puedes solicitar devolución de órdenes entregadas');
    }

    return this.prisma.return.create({
      data: {
        orderId: dto.orderId,
        userId,
        reason: dto.reason,
        images: dto.images || [],
      },
      include: { order: { select: { orderNumber: true } } },
    });
  }

  async getUserReturns(userId: string) {
    return this.prisma.return.findMany({
      where: { userId },
      include: { order: { select: { orderNumber: true, total: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(returnId: string, status: string, adminNote?: string, refundAmount?: number) {
    return this.prisma.return.update({
      where: { id: returnId },
      data: { status: status as any, adminNote, refundAmount },
      include: { order: { select: { orderNumber: true } }, user: { select: { id: true, name: true, email: true } } },
    });
  }

  // Admin: listar todas las devoluciones
  async getAllReturns(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [returns, total] = await Promise.all([
      this.prisma.return.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          order: { select: { orderNumber: true, total: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.return.count(),
    ]);
    return { data: returns, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
