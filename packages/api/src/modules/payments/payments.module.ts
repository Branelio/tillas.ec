import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [LoyaltyModule, MediaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
