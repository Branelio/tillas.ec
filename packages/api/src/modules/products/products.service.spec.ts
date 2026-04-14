import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          slug: 'product-1',
          status: 'ACTIVE',
        },
        {
          id: 'product-2',
          name: 'Product 2',
          slug: 'product-2',
          status: 'ACTIVE',
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(2);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should apply search filter', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({
        search: 'nike air',
        page: 1,
        limit: 10,
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOneBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Product 1',
        slug: 'product-1',
        brand: { name: 'Nike' },
        category: { name: 'Running' },
        variants: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('product-1');

      expect(result).toBeDefined();
      expect(result.slug).toBe('product-1');
    });

    it('should throw error if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow();
    });
  });

  describe('getFeatured', () => {
    it('should return cached featured products if available', async () => {
      const cachedProducts = [{ id: 'cached-1', name: 'Cached Product' }];
      mockRedisService.get.mockResolvedValue(cachedProducts);

      const result = await service.getFeatured();

      expect(redisService.get).toHaveBeenCalledWith('products:featured');
      expect(result).toEqual(cachedProducts);
    });

    it('should fetch from database and cache if not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.product.findMany.mockResolvedValue([
        { id: 'product-1', name: 'Featured Product', isFeatured: true },
      ]);

      const result = await service.getFeatured();

      expect(prismaService.product.findMany).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        'products:featured',
        expect.any(Array),
        300, // 5 minutes TTL
      );
    });
  });

  describe('getBrands', () => {
    it('should return cached brands if available', async () => {
      const cachedBrands = [{ id: 'brand-1', name: 'Nike' }];
      mockRedisService.get.mockResolvedValue(cachedBrands);

      const result = await service.getBrands();

      expect(result).toEqual(cachedBrands);
    });

    it('should fetch from database and cache if not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: 'Nike', slug: 'nike' },
      ]);

      const result = await service.getBrands();

      expect(result).toHaveLength(1);
      expect(redisService.set).toHaveBeenCalledWith(
        'products:brands',
        expect.any(Array),
        3600, // 1 hour TTL
      );
    });
  });
});
