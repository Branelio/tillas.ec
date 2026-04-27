const { Test } = require('@nestjs/testing');
const { AppModule } = require('./src/app.module');
const { TelegramService } = require('./src/modules/telegram/telegram.service');

async function bootstrap() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const telegramService = app.get(TelegramService);
  console.log('Connecting...');
  
  // Need to use the real connect method if it's not initialized
  try {
     const res = await telegramService.syncHistory(10);
     console.log('Sync Result:', res);
  } catch(e) {
     console.error('Error', e);
  }

  await app.close();
}
bootstrap();
