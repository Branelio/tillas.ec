const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config({ path: '../../.env' });

async function main() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const sessionStr = process.env.TELEGRAM_STRING_SESSION;
  const channel = process.env.TELEGRAM_CHANNEL_USERNAME || 'rancyd';

  const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  const messages = await client.getMessages(channel, { limit: 100 });
  
  for (const m of messages) {
    if (m.message) {
      console.log(`[MSG ID: ${m.id}] [GroupOrMedia: ${m.groupedId || Boolean(m.media)}] Text:`, m.message.replace(/\n/g, ' '));
    }
  }

  await client.disconnect();
}
main().catch(console.error);
