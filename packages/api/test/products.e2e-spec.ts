import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Create test user and get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@tillas.ec',
        password: 'admin123',
      });

    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return all products (public)', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return paginated products', () => {
      return request(app.getHttpServer())
        .get('/products?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should filter products by brand', () => {
      return request(app.getHttpServer())
        .get('/products?brand=nike')
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((product: any) => {
            expect(product.brand.slug).toBe('nike');
          });
        });
    });

    it('should search products by name', () => {
      return request(app.getHttpServer())
        .get('/products?search=air')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('/products/featured (GET)', () => {
    it('should return featured products', () => {
      return request(app.getHttpServer())
        .get('/products/featured')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/products/new-arrivals (GET)', () => {
    it('should return new arrivals', () => {
      return request(app.getHttpServer())
        .get('/products/new-arrivals')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/products/brands (GET)', () => {
    it('should return all brands', () => {
      return request(app.getHttpServer())
        .get('/products/brands')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/products/categories (GET)', () => {
    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/products/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/products/:slug (GET)', () => {
    it('should return product by slug', async () => {
      // Get first product from list
      const productsRes = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      if (productsRes.body.data.length > 0) {
        const product = productsRes.body.data[0];
        
        return request(app.getHttpServer())
          .get(`/products/${product.slug}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('slug');
            expect(res.body.slug).toBe(product.slug);
          });
      }
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-product')
        .expect(404);
    });
  });

  describe('/products (POST) [Admin only]', () => {
    it('should create product with admin token', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          brandId: 'test-brand-id',
          model: 'Test Model',
          description: 'Test description',
          slug: 'test-product',
          categoryId: 'test-category-id',
          gender: 'UNISEX',
        })
        .expect(201);
    });

    it('should reject without admin token', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          brandId: 'test-brand-id',
          model: 'Test Model',
          description: 'Test description',
          slug: 'test-product-2',
          categoryId: 'test-category-id',
          gender: 'UNISEX',
        })
        .expect(401); // Unauthorized
    });
  });
});
