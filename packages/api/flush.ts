import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.telegramImport.deleteMany({
    where: { status: 'PENDING_REVIEW' }
  });
  console.log('✅ Pending imports flushed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
