// ==============================================
// TILLAS.EC — NestJS Entry Point
// ==============================================

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Validate required environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'MINIO_ENDPOINT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
  ];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    Logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new BadRequestException('Missing required environment variables');
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global guards
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // CORS
  app.enableCors({
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
  });

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('TILLAS.EC API')
    .setDescription('API de la plataforma de sneakers #1 de Ecuador')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios y perfiles')
    .addTag('products', 'Catálogo de sneakers')
    .addTag('cart', 'Carrito de compras')
    .addTag('orders', 'Pedidos y tracking')
    .addTag('payments', 'Pagos por transferencia bancaria')
    .addTag('drops', 'Lanzamientos y sorteos')
    .addTag('loyalty', 'Programa de fidelidad')
    .addTag('media', 'Upload de imágenes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Scalar API docs (alternative to Swagger UI)
  const scalarHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>TILLAS.EC API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api-json"
      data-configuration='{"theme":"purple","layout":"modern","hideDownloadButton":false}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.get('/scalar', (_req: Request, res: Response) => res.type('html').send(scalarHtml));
  instance.get('/docs', (_req: Request, res: Response) => res.type('html').send(scalarHtml));

  const port = process.env.API_PORT || 4000;
  await app.listen(port);
  console.log(`\n🚀 TILLAS.EC API corriendo en http://localhost:${port}`);
  console.log(`📖 Swagger docs en http://localhost:${port}/api\n`);
  console.log(`📘 Scalar docs en http://localhost:${port}/scalar\n`);
}

bootstrap();
