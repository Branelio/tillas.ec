// ==============================================
// Script para actualizar URLs de imágenes en la DB
// Cambia media.158.247.126.105.nip.io por api.158.247.126.105.nip.io/media
// ==============================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  const oldDomain = 'https://media.158.247.126.105.nip.io';
  const newDomain = 'https://api.158.247.126.105.nip.io/media';

  console.log('🔧 Actualizando URLs de imágenes...');

  // 1. Actualizar Product.images
  const products = await prisma.product.findMany();

  for (const product of products) {
    if (!product.images) continue;
    const newImages = product.images.map((url) =>
      url.startsWith(oldDomain) ? url.replace(oldDomain, newDomain) : url,
    );
    if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages },
      });
      console.log(`✅ Producto ${product.id} actualizado`);
    }
  }

  // 2. Actualizar TelegramImport.images
  const imports = await prisma.telegramImport.findMany();

  for (const imp of imports) {
    if (!imp.images) continue;
    const newImages = imp.images.map((url) =>
      url.startsWith(oldDomain) ? url.replace(oldDomain, newDomain) : url,
    );
    if (JSON.stringify(newImages) !== JSON.stringify(imp.images)) {
      await prisma.telegramImport.update({
        where: { id: imp.id },
        data: { images: newImages },
      });
      console.log(`✅ TelegramImport ${imp.id} actualizado`);
    }
  }

  // 3. Actualizar User.avatar
  const users = await prisma.user.findMany({
    where: { avatar: { startsWith: oldDomain } },
  });

  for (const user of users) {
    if (user.avatar) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: user.avatar.replace(oldDomain, newDomain) },
      });
      console.log(`✅ User ${user.id} avatar actualizado`);
    }
  }

  // 4. Actualizar Review.images
  const reviews = await prisma.review.findMany();

  for (const review of reviews) {
    if (!review.images) continue;
    const newImages = review.images.map((url) =>
      url.startsWith(oldDomain) ? url.replace(oldDomain, newDomain) : url,
    );
    if (JSON.stringify(newImages) !== JSON.stringify(review.images)) {
      await prisma.review.update({
        where: { id: review.id },
        data: { images: newImages },
      });
      console.log(`✅ Review ${review.id} actualizado`);
    }
  }

  console.log('✅ Migración completada');
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
