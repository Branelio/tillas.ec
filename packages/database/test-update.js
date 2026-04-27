const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst({ include: { brand: true, category: true } });
  if (!p) return console.log('no product');
  
  const payload = {
    brandName: p.brand.name,
    categoryName: p.category.name,
    variants: [{ size: '40', price: 99, stock: 10, sku: 'TEST-'+Date.now() }]
  };

  try {
    // Mimic payload built in service
    const { brandName, categoryName, variants, ...productData } = payload;
    const finalPayload = { ...productData };
    if (variants) {
      finalPayload.variants = {
        deleteMany: {},
        createMany: { data: variants }
      };
    }
    const res = await prisma.product.update({ where: { id: p.id }, data: finalPayload });
    console.log('Update OK');
  } catch (err) {
    console.error('UPDATE ERROR:', err);
  }
}
main().finally(() => prisma.$disconnect());
