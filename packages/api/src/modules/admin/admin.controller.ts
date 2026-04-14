import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Obtener pedidos recientes' })
  getRecentOrders() {
    return this.adminService.getRecentOrders();
  }

  @Get('sales-report')
  @ApiOperation({ summary: 'Reporte de ventas (últimos 30 días)' })
  getSalesReport() {
    return this.adminService.getSalesReport();
  }

  @Get('brand-sales')
  @ApiOperation({ summary: 'Ventas por marca' })
  getBrandSales() {
    return this.adminService.getBrandSales();
  }
}
