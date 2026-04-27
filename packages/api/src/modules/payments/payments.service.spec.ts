import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../../mail/mail.service';
import { MediaService } from '../media/media.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: unknown) => unknown)({});
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
  };

  const mockLoyaltyService = {
    addPointsForOrder: jest.fn(),
  };

  const mockMailService = {
    sendOtp: jest.fn(),
  };

  const mockMediaService = {
    uploadImage: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        BANK_NAME: 'Banco Prueba',
        BANK_ACCOUNT: '123',
        BANK_ACCOUNT_TYPE: 'Ahorros',
        BANK_HOLDER: 'Test Holder',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoyaltyService, useValue: mockLoyaltyService },
        { provide: MailService, useValue: mockMailService },
        { provide: MediaService, useValue: mockMediaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadReceipt', () => {
    it('should fail when file is missing', async () => {
      await expect(
        service.uploadReceipt('order-1', 'user-1', undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail when uploaded file is not an image', async () => {
      const file = { mimetype: 'application/pdf' } as Express.Multer.File;

      await expect(service.uploadReceipt('order-1', 'user-1', file)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should fail when order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      const file = { mimetype: 'image/png' } as Express.Multer.File;

      await expect(service.uploadReceipt('order-404', 'user-1', file)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyPayment', () => {
    it('should fail when payment is already completed', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        status: 'COMPLETED',
        orderId: 'order-1',
        amount: 10,
        order: {
          orderNumber: 'TIL-1',
          userId: 'user-1',
          user: { email: 'user@example.com', name: 'User' },
        },
      });

      await expect(service.verifyPayment('order-1', 'admin-1', true)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should fail when payment is not pending verification', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        status: 'PENDING',
        orderId: 'order-1',
        amount: 10,
        order: {
          orderNumber: 'TIL-1',
          userId: 'user-1',
          user: { email: 'user@example.com', name: 'User' },
        },
      });

      await expect(service.verifyPayment('order-1', 'admin-1', true)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllPayments', () => {
    it('should normalize invalid page and limit values', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(0);

      const result = await service.getAllPayments(-1 as unknown as number, 9999 as unknown as number);

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 100,
        }),
      );
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(100);
    });
  });
});
