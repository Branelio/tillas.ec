// ==============================================
// Script para generar Telegram StringSession
// Ejecutar: npx ts-node scripts/telegram-session.ts
// ==============================================

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || '31423016', 10);
  const apiHash = process.env.TELEGRAM_API_HASH || 'a9613469907d76eb466aadff0c526966';

  console.log('\n🔐 Generador de Telegram StringSession para TILLAS.EC\n');
  console.log(`API ID: ${apiId}`);
  console.log(`API Hash: ${apiHash.substring(0, 8)}...`);
  console.log('');

  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await question('📱 Ingresa tu número de teléfono (con código de país, ej: +593987654321): '),
    password: async () => await question('🔑 Ingresa tu contraseña de 2FA (si la tienes, o presiona Enter): '),
    phoneCode: async () => await question('📨 Ingresa el código que recibiste en Telegram: '),
    onError: (err: Error) => console.error('Error:', err.message),
  });

  console.log('\n✅ ¡Conectado exitosamente!\n');

  const sessionString = client.session.save() as unknown as string;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Tu TELEGRAM_STRING_SESSION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(sessionString);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Copia este valor y ponlo en tu .env como:');
  console.log(`TELEGRAM_STRING_SESSION=${sessionString}\n`);

  await client.disconnect();
  rl.close();
}

main().catch(console.error);
