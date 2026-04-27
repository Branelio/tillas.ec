import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockTx = {
    order: {
      create: jest.fn(),
    },
    productVariant: {
      updateMany: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
  };

  const mockPrismaService = {
    cartItem: {
      findMany: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: typeof mockTx) => Promise<unknown>)(mockTx);
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should fail if stock changes during transaction', async () => {
      mockPrismaService.cartItem.findMany.mockResolvedValue([
        {
          variantId: 'variant-1',
          quantity: 1,
          variant: {
            stock: 2,
            size: '9',
            price: 100,
            product: {
              name: 'Test Shoe',
              images: ['image.jpg'],
            },
          },
        },
      ]);

      mockPrismaService.address.findUnique.mockResolvedValue({
        id: 'address-1',
        city: 'Quito',
      });

      mockPrismaService.order.count.mockResolvedValue(0);

      mockTx.order.create.mockResolvedValue({
        id: 'order-1',
        items: [],
      });

      mockTx.productVariant.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.createOrder('user-1', 'address-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return normalized page and limit in metadata', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      const result = await service.getAllOrders('2', '10');

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
