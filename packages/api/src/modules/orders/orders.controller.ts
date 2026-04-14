import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido desde carrito' })
  createOrder(@Req() req: any, @Body() body: { addressId: string }) {
    return this.ordersService.createOrder(req.user.id, body.addressId);
  }

  @Get()
  @ApiOperation({ summary: 'Mis pedidos' })
  getUserOrders(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Todos los pedidos' })
  getAllOrders(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.ordersService.getAllOrders(page, limit, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de pedido' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '[Admin] Actualizar estado del pedido' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string; note?: string }) {
    return this.ordersService.updateStatus(id, body.status, body.note);
  }
}
