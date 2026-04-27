// ==============================================
// TILLAS.EC — Telegram Controller
// Endpoints para gestión de importaciones
// ==============================================

import {
  Controller, Get, Patch, Param, Query, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('telegram')
@ApiBearerAuth()
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Estado de conexión del bot de Telegram' })
  getStatus() {
    return this.telegramService.getStatus();
  }

  @Patch('sync-history')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar mensajes históricos de Telegram' })
  syncHistory(@Body() data: { limit?: number }) {
    const limit = data.limit && data.limit > 0 ? data.limit : 50;
    return this.telegramService.syncHistory(limit);
  }

  @Get('imports')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar importaciones de Telegram' })
  getImports(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.telegramService.getImports({
      status,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Get('imports/pending-count')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cantidad de importaciones pendientes' })
  async getPendingCount() {
    const count = await this.telegramService.getPendingCount();
    return { count };
  }

  @Get('imports/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Detalle de una importación' })
  getImportById(@Param('id') id: string) {
    return this.telegramService.getImportById(id);
  }

  @Patch('imports/:id/approve')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar importación y crear producto' })
  approveImport(
    @Param('id') id: string,
    @Body() data: {
      productName: string;
      sellPrice: number;
      brandName?: string;
      categoryName?: string;
      sizes?: string[];
    },
  ) {
    return this.telegramService.approveImport(id, data);
  }

  @Patch('imports/:id/reject')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar importación' })
  rejectImport(
    @Param('id') id: string,
    @Body() data: { reason?: string },
  ) {
    return this.telegramService.rejectImport(id, data.reason);
  }
}
