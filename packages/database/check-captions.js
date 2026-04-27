const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.telegramImport.findMany({
    select: { caption: true },
    take: 100,
    orderBy: { createdAt: 'desc' }
  });
  const valid = docs.filter(d => d.caption && d.caption.trim().length > 0);
  console.log(`Found ${valid.length} non-empty captions out of ${docs.length}`);
  valid.slice(0, 5).forEach((d, i) => {
    console.log(`--- MSG ${i} ---`);
    console.log(d.caption);
  });
}
main().finally(() => prisma.$disconnect());
