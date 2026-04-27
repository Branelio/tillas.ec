const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const skip = 0;
    const limit = 20;
    const where = { status: 'ACTIVE' };
    const orderBy = { createdAt: 'desc' };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { brand: true, category: true, variants: { orderBy: { size: 'asc' } } },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);
    console.log(products.length, total);
  } catch(e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}
main();
