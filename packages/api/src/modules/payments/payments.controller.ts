import { Controller, Post, Get, Patch, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('bank-info')
  @ApiOperation({ summary: 'Obtener datos bancarios para transferencia' })
  getBankInfo() {
    return this.paymentsService.getBankInfo();
  }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir comprobante de transferencia bancaria' })
  @UseInterceptors(FileInterceptor('receipt'))
  uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { orderId: string; notes?: string },
    @Req() req: any,
  ) {
    return this.paymentsService.uploadReceipt(body.orderId, req.user.id, file, body.notes);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar estado del pago' })
  getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Obtener todos los pagos' })
  getAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.getAllPayments(page, limit, status);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Obtener pagos pendientes de verificación' })
  getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  @Patch('verify/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Verificar pago (aprobar/rechazar)' })
  verifyPayment(
    @Param('orderId') orderId: string,
    @Body() body: { approved: boolean; note?: string },
    @Req() req: any,
  ) {
    return this.paymentsService.verifyPayment(orderId, req.user.id, body.approved, body.note);
  }
}
