import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoyaltyService } from './loyalty.service';

@ApiTags('loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get()
  @ApiOperation({ summary: 'Mis puntos y nivel de fidelidad' })
  getPoints(@Req() req: any) {
    return this.loyaltyService.getPoints(req.user.id);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Canjear puntos' })
  redeem(@Req() req: any, @Body() body: { points: number; description: string }) {
    return this.loyaltyService.redeemPoints(req.user.id, body.points, body.description);
  }
}
