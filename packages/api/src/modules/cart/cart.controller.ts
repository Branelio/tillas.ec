import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener carrito del usuario' })
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar item al carrito' })
  addItem(@Req() req: any, @Body() body: { variantId: string; quantity?: number }) {
    return this.cartService.addItem(req.user.id, body.variantId, body.quantity);
  }

  @Patch(':itemId')
  @ApiOperation({ summary: 'Actualizar cantidad' })
  updateQuantity(@Req() req: any, @Param('itemId') itemId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateQuantity(req.user.id, itemId, body.quantity);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Vaciar carrito' })
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
