import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateDeliveryDates } from './utils/delivery-calculator.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, addressId: string) {
    // 1. Obtener carrito
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { variant: { include: { product: true } } },
    });
    if (cartItems.length === 0) throw new BadRequestException('El carrito está vacío');

    // 2. Validar stock
    for (const item of cartItems) {
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(`Sin stock para ${item.variant.product.name} talla ${item.variant.size}`);
      }
    }

    // 3. Obtener dirección
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    // 4. Calcular totales
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity, 0,
    );
    const normalizedCity = String(address.city || '').trim().toLowerCase();
    const shippingCost = normalizedCity === 'quito' ? 3.50 : 7.00;
    const total = subtotal + shippingCost;

    // 5. Generar número de orden
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    const orderNumber = `TIL-${today}-${String(count + 1).padStart(4, '0')}`;

    // 6. Calcular fechas de envío
    const { factoryOrderDate, estimatedDeliveryAt } = calculateDeliveryDates(new Date());

    // 7. Crear orden + items en transacción
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          shippingCost,
          total,
          shippingAddress: address as any,
          factoryOrderDate,
          estimatedDeliveryAt,
          items: {
            create: cartItems.map((item) => ({
              variantId: item.variantId,
              productName: item.variant.product.name,
              productImage: item.variant.product.images?.[0] || null,
              size: item.variant.size,
              quantity: item.quantity,
              unitPrice: item.variant.price,
              totalPrice: Number(item.variant.price) * item.quantity,
            })),
          },
          statusHistory: {
            create: { status: 'PENDING', note: 'Pedido creado' },
          },
        },
        include: { items: true },
      });

      // Reducir stock
      for (const item of cartItems) {
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Stock insuficiente para ${item.variant.product.name} talla ${item.variant.size}. Intenta nuevamente.`,
          );
        }
      }

      // Limpiar carrito
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { variant: { include: { product: { include: { brand: true } } } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { variant: { include: { product: { include: { brand: true } } } } } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(orderId: string, status: any, note?: string) {
    const [order] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status },
      }),
      this.prisma.orderStatusHistory.create({
        data: { orderId, status, note },
      }),
    ]);
    return order;
  }

  // Admin: listar todas las órdenes
  async getAllOrders(page: any = 1, limit: any = 20, status?: string) {
    const pageNum = Number(page || 1);
    const limitNum = Number(limit || 20);
    const skip = (pageNum - 1) * limitNum;
    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: true,
          items: {
            select: {
              id: true, productName: true, productImage: true,
              size: true, quantity: true, unitPrice: true, totalPrice: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
