import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prismaService.user.deleteMany({ where: { email: { contains: 'test' } } });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return OTP', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register@example.com',
          password: 'StrongPassword123!',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test-register@example.com');
          expect(res.body.passwordHash).toBeUndefined();
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'StrongPassword123!',
          name: 'Test User',
        })
        .expect(201)
        .then(() => {
          // Try to register again with same email
          return request(app.getHttpServer())
            .post('/auth/register')
            .send({
              email: 'duplicate@example.com',
              password: 'StrongPassword123!',
              name: 'Test User 2',
            })
            .expect(409); // Conflict
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'StrongPassword123!',
          name: 'Test User',
        })
        .expect(400); // Bad request
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak-password@example.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400); // Bad request
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      await prismaService.user.create({
        data: {
          email: 'login-test@example.com',
          passwordHash: '$2a$10$hashedpassword', // Pre-hashed for testing
          name: 'Login Test User',
          isVerified: true,
        },
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401); // Unauthorized
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrongpassword',
        })
        .expect(401); // Unauthorized
    });
  });

  describe('/auth/verify-otp (POST)', () => {
    it('should verify user with correct OTP', async () => {
      // Register a new user first
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'verify-otp-test@example.com',
          password: 'StrongPassword123!',
          name: 'OTP Test User',
        });

      const userId = registerRes.body.id;

      // Get the OTP from the database (in real tests, you'd mock this)
      const user = await prismaService.user.findUnique({
        where: { id: userId },
      });

      // Verify OTP
      return request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          email: 'verify-otp-test@example.com',
          code: user?.otpCode || '123456',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });
  });
});
