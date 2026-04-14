import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './common/decorators';

@ApiTags('health')
@Public()
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async health() {
    // Verificar conexión a DB
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      return { status: 'error', db: 'disconnected', timestamp: new Date().toISOString() };
    }
    return { status: 'ok', db: 'connected', timestamp: new Date().toISOString() };
  }
}
