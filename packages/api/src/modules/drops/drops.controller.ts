import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { DropsService } from './drops.service';

@ApiTags('drops')
@Controller('drops')
export class DropsController {
  constructor(private dropsService: DropsService) {}

  @Get()
  @ApiOperation({ summary: 'Drops activos y próximos' })
  getActiveDrops() {
    return this.dropsService.getActiveDrops();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalle de drop' })
  getDropBySlug(@Param('slug') slug: string) {
    return this.dropsService.getDropBySlug(slug);
  }

  @Post(':dropId/enter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Participar en un drop' })
  enterDrop(@Req() req: any, @Param('dropId') dropId: string, @Body() body: { selectedSize: string }) {
    return this.dropsService.enterDrop(req.user.id, dropId, body.selectedSize);
  }

  @Get('my/entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis entradas a drops' })
  getUserEntries(@Req() req: any) {
    return this.dropsService.getUserEntries(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Crear drop' })
  createDrop(@Body() body: any) {
    return this.dropsService.createDrop(body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Actualizar estado del drop' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.dropsService.updateDropStatus(id, body.status);
  }
}
