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
     const caption = message.message || '';
     const isTextOnly = !message.media && caption.trim().length > 0;
     const isPhoto = message.media instanceof Api.MessageMediaPhoto;
     
     if (isTextOnly) {
       console.log(`[TEXT] ID: ${message.id}`);
       const recentAlbum = await prisma.telegramImport.findFirst({
         where: { channelId: channel },
         orderBy: { telegramMsgId: 'desc' }
       });
       console.log(`  -> recentAlbum in DB: ${recentAlbum ? recentAlbum.telegramMsgId : 'NULL'}`);
       if (recentAlbum && (message.id - recentAlbum.telegramMsgId < 20)) {
         console.log(`  -> WOULD LINK!`);
       } else {
         console.log(`  -> WOULD NOT LINK! Diff: ${recentAlbum ? message.id - recentAlbum.telegramMsgId : 'N/A'}`);
       }
     } else if (isPhoto) {
       console.log(`[PHOTO] ID: ${message.id} Group: ${message.groupedId}`);
       // simulate insert
       const existing = await prisma.telegramImport.findFirst({
          where: { groupedId: String(message.groupedId) }
       });
       if (!existing && message.groupedId) {
         await prisma.telegramImport.create({
           data: { telegramMsgId: message.id, groupedId: String(message.groupedId), channelId: channel, images: [] }
         });
         console.log(`  -> DB INSERTED NEW ALBUM: ${message.id}`);
       }
     }
  }

  await client.disconnect();
}
main().catch(console.error).finally(() => prisma.$disconnect());
