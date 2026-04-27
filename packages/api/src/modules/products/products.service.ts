import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(params: {
    page?: any;
    limit?: any;
    brand?: string;
    category?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
  }) {
    const { brand, category, size, minPrice, maxPrice, search, sort } = params;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      ...(brand && { brand: { slug: brand } }),
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { colorway: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(size && { variants: { some: { size, stock: { gt: 0 } } } }),
      ...((minPrice || maxPrice) && {
        variants: {
          some: {
            ...(minPrice && { price: { gte: minPrice } }),
            ...(maxPrice && { price: { lte: maxPrice } }),
          },
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc' ? { variants: { _count: 'asc' } } :
      sort === 'price_desc' ? { variants: { _count: 'desc' } } :
      sort === 'newest' ? { createdAt: 'desc' } :
      { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { brand: true, category: true, variants: { orderBy: { size: 'asc' } } },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true, variants: { orderBy: { size: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async getFeatured() {
    const cached = await this.redis.get('products:featured');
    if (cached) return cached;

    const data = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
      include: { brand: true, variants: { take: 1, orderBy: { price: 'asc' } } },
      take: 10,
    });
    await this.redis.set('products:featured', data, 300); // 5 min
    return data;
  }

  async getNewArrivals() {
    const cached = await this.redis.get('products:new-arrivals');
    if (cached) return cached;

    const data = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { brand: true, variants: { take: 1, orderBy: { price: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    await this.redis.set('products:new-arrivals', data, 300); // 5 min
    return data;
  }

  async getBrands() {
    const cached = await this.redis.get('products:brands');
    if (cached) return cached;

    const data = await this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    await this.redis.set('products:brands', data, 3600); // 1 hora
    return data;
  }

  async getCategories() {
    const cached = await this.redis.get('products:categories');
    if (cached) return cached;

    const data = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    await this.redis.set('products:categories', data, 3600); // 1 hora
    return data;
  }

  // === Admin CRUD ===
  async create(data: any) {
    const { brandName, categoryName, variants, ...productData } = data;
    
    let brandId = 'default';
    if (brandName) {
      const brand = await this.prisma.brand.upsert({
        where: { name: brandName.trim() },
        update: {},
        create: { name: brandName.trim(), slug: brandName.trim().toLowerCase().replace(/\s+/g, '-') },
      });
      brandId = brand.id;
    }

    let categoryId = 'default';
    if (categoryName) {
      const category = await this.prisma.category.upsert({
        where: { name: categoryName.trim() },
        update: {},
        create: { name: categoryName.trim(), slug: categoryName.trim().toLowerCase().replace(/\s+/g, '-') },
      });
      categoryId = category.id;
    }

    const safeSlug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    // Autogenerate SKUs and deduplicate sizes if needed
    const safeVariants = variants && variants.length > 0 ? variants.map((v: any, index: number) => ({
      ...v,
      sku: v.sku && v.sku.trim() !== '' ? v.sku : `${safeSlug}-${v.size}-${Date.now()}-${index}`
    })) : [];

    const product = await this.prisma.product.create({
      data: { 
        ...productData, 
        slug: safeSlug,
        brandId,
        categoryId,
        model: data.model || 'Standard',
        variants: safeVariants.length > 0 ? { createMany: { data: safeVariants } } : undefined 
      },
      include: { brand: true, category: true, variants: true },
    });
    await this.invalidateCache();
    return product;
  }

  async update(id: string, data: any) {
    const { brandName, categoryName, variants, ...productData } = data;
    
    const payload: any = { ...productData };

    if (brandName) {
      const brand = await this.prisma.brand.upsert({
        where: { name: brandName.trim() },
        update: {},
        create: { name: brandName.trim(), slug: brandName.trim().toLowerCase().replace(/\s+/g, '-') },
      });
      payload.brandId = brand.id;
    }

    if (categoryName) {
      const category = await this.prisma.category.upsert({
        where: { name: categoryName.trim() },
        update: {},
        create: { name: categoryName.trim(), slug: categoryName.trim().toLowerCase().replace(/\s+/g, '-') },
      });
      payload.categoryId = category.id;
    }

    const safeSlug = productData.slug || productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    if (variants) {
      // Remover duplicados en sizes (El frontend puede enviar [25, 25, 25])
      const uniqueVariantsMap = new Map();
      variants.forEach((v: any) => {
        uniqueVariantsMap.set(v.size, v);
      });
      const deduplicatedVariants = Array.from(uniqueVariantsMap.values());

      const safeVariants = deduplicatedVariants.map((v: any, index: number) => ({
        ...v,
        sku: v.sku && v.sku.trim() !== '' ? v.sku : `${safeSlug || 'upd'}-${v.size}-${Date.now()}-${index}`
      }));

      payload.variants = {
        deleteMany: {},
        createMany: { data: safeVariants }
      };
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: payload,
      include: { brand: true, category: true, variants: true },
    });
    await this.invalidateCache();
    return product;
  }

  async delete(id: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    await this.invalidateCache();
    return product;
  }

  private async invalidateCache() {
    await this.redis.delByPattern('products:*');
  }
}
