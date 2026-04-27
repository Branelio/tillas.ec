// ==============================================
// Script para generar Telegram StringSession
// Ejecutar: node scripts/telegram-session.js
// ==============================================

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const API_ID = 31423016;
const API_HASH = 'a9613469907d76eb466aadff0c526966';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  console.log('\n🔐 Generador de Telegram StringSession para TILLAS.EC\n');
  console.log(`API ID: ${API_ID}`);
  console.log(`API Hash: ${API_HASH.substring(0, 8)}...`);
  console.log('');

  const session = new StringSession('');
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  console.log('Conectando a Telegram...\n');

  await client.start({
    phoneNumber: async () => {
      return await question('📱 Ingresa tu número de teléfono (ej: +593983199406): ');
    },
    password: async () => {
      return await question('🔑 Contraseña 2FA (presiona Enter si no tienes): ');
    },
    phoneCode: async () => {
      return await question('📨 Código que recibiste en Telegram: ');
    },
    onError: (err) => {
      console.error('Error:', err.message);
    },
  });

  console.log('\n✅ ¡Conectado exitosamente!\n');

  const sessionString = client.session.save();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Tu TELEGRAM_STRING_SESSION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(sessionString);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Copia este valor y ponlo en tu .env como:');
  console.log(`TELEGRAM_STRING_SESSION=${sessionString}\n`);

  await client.disconnect();
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error fatal:', err);
  rl.close();
  process.exit(1);
});
