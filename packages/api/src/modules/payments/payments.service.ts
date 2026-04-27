import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../../mail/mail.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private loyalty: LoyaltyService,
    private mail: MailService,
    private media: MediaService,
    private config: ConfigService,
  ) {}

  /**
   * Obtener datos bancarios para transferencia
   * Retorna la información de la cuenta + QR
   */
  getBankInfo() {
    return {
      bankName: this.config.get<string>('BANK_NAME') || 'Banco Pichincha',
      accountNumber: this.config.get<string>('BANK_ACCOUNT') || '2209004611',
      accountType: this.config.get<string>('BANK_ACCOUNT_TYPE') || 'Ahorros',
      accountHolder: this.config.get<string>('BANK_HOLDER') || 'BRANDON JOEL',
      idNumber: this.config.get<string>('BANK_ID_NUMBER') || null,
      qrImage: '/images/qr-pago.png',
      instructions: [
        'Realiza una transferencia o depósito al número de cuenta indicado.',
        'También puedes escanear el QR desde la app de tu banco.',
        'Sube una foto clara del comprobante de pago.',
        'Tu pedido será verificado y procesado en máximo 24 horas.',
      ],
    };
  }

  /**
   * Subir comprobante de transferencia
   * El usuario sube la foto del comprobante después de hacer la transferencia
   */
  async uploadReceipt(orderId: string, userId: string, file: Express.Multer.File, notes?: string) {
    if (!file) {
      throw new BadRequestException('Debes subir un comprobante de pago');
    }
    if (file.mimetype && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El comprobante debe ser una imagen válida');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.userId !== userId) throw new BadRequestException('Esta orden no te pertenece');
    if (order.payment?.status === 'COMPLETED') {
      throw new BadRequestException('Esta orden ya fue pagada');
    }

    const receiptUrl = await this.media.uploadImage(file, 'receipts');

    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      update: {
        receiptImage: receiptUrl,
        receiptNotes: notes || null,
        status: 'PROCESSING',
      },
      create: {
        orderId,
        amount: order.total,
        method: 'BANK_TRANSFER',
        receiptImage: receiptUrl,
        receiptNotes: notes || null,
        status: 'PROCESSING',
      },
    });

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_PROCESSING' },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'PAYMENT_PROCESSING',
          note: 'Comprobante de transferencia subido, pendiente de verificación',
        },
      }),
    ]);

    this.logger.log(`📎 Comprobante subido para orden ${order.orderNumber}`);

    return {
      paymentId: payment.id,
      status: payment.status,
      receiptImage: receiptUrl,
      message: 'Comprobante recibido. Tu pago será verificado en las próximas horas.',
    };
  }

  /**
   * Verificar estado del pago (para el usuario)
   */
  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: { select: { orderNumber: true, status: true } } },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  /**
   * [ADMIN] Verificar un pago (aprobar/rechazar)
   */
  async verifyPayment(orderId: string, adminId: string, approved: boolean, adminNote?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.status === 'COMPLETED') {
      throw new BadRequestException('Este pago ya fue verificado previamente');
    }
    if (payment.status !== 'PROCESSING') {
      throw new BadRequestException('Este pago no está pendiente de verificación');
    }

    if (approved) {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            verifiedBy: adminId,
            verifiedAt: new Date(),
            adminNote,
          },
        }),
        this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        }),
        this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'PAID',
            note: adminNote || 'Pago verificado — Transferencia bancaria confirmada',
            changedBy: adminId,
          },
        }),
      ]);

      try {
        await this.loyalty.addPointsForOrder(
          payment.order.userId,
          Number(payment.amount),
          payment.orderId,
        );
        this.logger.log(`🏆 Puntos acreditados: ${payment.order.orderNumber}`);
      } catch (err) {
        this.logger.error(`Error acreditando puntos: ${err}`);
      }

      try {
        await this.mail.sendOtp(
          payment.order.user.email,
          payment.order.user.name,
          `✅ ¡Pago confirmado! Tu pedido #${payment.order.orderNumber} por ${Number(payment.amount).toFixed(2)} fue verificado. Estamos preparando tu envío.`,
        );
      } catch (err) {
        this.logger.error(`Error enviando email: ${err}`);
      }

      this.logger.log(`✅ Pago verificado: ${payment.order.orderNumber}`);
      return { status: 'approved', orderNumber: payment.order.orderNumber };
    } else {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            verifiedBy: adminId,
            verifiedAt: new Date(),
            adminNote,
          },
        }),
        this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'PENDING',
            note: adminNote || 'Comprobante rechazado — Por favor sube un comprobante válido',
            changedBy: adminId,
          },
        }),
        this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'PENDING' },
        }),
      ]);

      try {
        await this.mail.sendOtp(
          payment.order.user.email,
          payment.order.user.name,
          `❌ El comprobante de tu pedido #${payment.order.orderNumber} no pudo ser verificado. ${adminNote || 'Por favor sube un nuevo comprobante.'}`,
        );
      } catch (err) {
        this.logger.error(`Error enviando email de rechazo: ${err}`);
      }

      this.logger.warn(`❌ Pago rechazado: ${payment.order.orderNumber}`);
      return { status: 'rejected', orderNumber: payment.order.orderNumber };
    }
  }

  /**
   * [ADMIN] Obtener pagos pendientes de verificación
   */
  async getPendingPayments() {
    return this.prisma.payment.findMany({
      where: { status: 'PROCESSING' },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { select: { productName: true, quantity: true, totalPrice: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * [ADMIN] Obtener todos los pagos
   */
  async getAllPayments(page = 1, limit = 20, status?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where = status ? { status: status as any } : {};
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      data: payments,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
