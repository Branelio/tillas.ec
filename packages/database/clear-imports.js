const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.telegramImport.deleteMany({
    where: { status: 'PENDING_REVIEW' }
  });
  console.log('Deleted rows:', deleted.count);
}
main().finally(() => prisma.$disconnect());
