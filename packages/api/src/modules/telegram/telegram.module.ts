// ==============================================
// TILLAS.EC — Telegram Module
// ==============================================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TelegramParserService } from './telegram-parser.service';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramParserService],
  exports: [TelegramService],
})
export class TelegramModule {}
