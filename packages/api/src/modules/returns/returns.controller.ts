import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';

@ApiTags('returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar devolución' })
  create(@Req() req: any, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mis devoluciones' })
  getUserReturns(@Req() req: any) {
    return this.returnsService.getUserReturns(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Todas las devoluciones' })
  getAllReturns(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.returnsService.getAllReturns(page, limit);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Aprobar/rechazar devolución' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNote?: string; refundAmount?: number },
  ) {
    return this.returnsService.updateStatus(id, body.status, body.adminNote, body.refundAmount);
  }
}
