const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.telegramImport.findMany({
    select: { id: true, telegramMsgId: true, caption: true, parsedPrice: true }
  });
  console.log(docs);
}
check().finally(() => prisma.$disconnect());
