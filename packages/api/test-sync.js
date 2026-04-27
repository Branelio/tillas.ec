const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../../.env' });

const prisma = new PrismaClient();

async function main() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionStr = process.env.TELEGRAM_STRING_SESSION;
  const channel = process.env.TELEGRAM_CHANNEL_USERNAME || 'rancyd';

  const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  console.log(`Connected. Fetching messages from ${channel}...`);
  const messages = await client.getMessages(channel, { limit: 20 });
  messages.reverse();
  
  for (const message of messages) {
     const isPhoto = message.media instanceof Api.MessageMediaPhoto;
     const caption = message.message || '';
     const isTextOnly = !message.media && caption.trim().length > 0;
     
     console.log(`\nMSG: ${message.id} | Photo: ${isPhoto} | TextOnly: ${isTextOnly} | Grouped: ${message.groupedId}`);
     if (isTextOnly) {
        console.log(` -> Content: ${caption.substring(0, 50)}`);
     }
  }

  await client.disconnect();
}
main().catch(console.error).finally(() => prisma.$disconnect());
