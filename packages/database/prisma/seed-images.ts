// ==============================================
// TILLAS.EC — Seed de Imágenes para Productos
// Usa imágenes de Unsplash (gratuitas)
// ==============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de productos a imágenes de Unsplash
const productImages: Record<string, string[]> = {
  // NIKE
  'nike-air-force-1-low-white': [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
  ],
  'nike-air-max-90-black': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
  ],
  'nike-dunk-low-panda': [
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
  ],
  'nike-air-max-97-silver-bullet': [
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
  ],
  'nike-blazer-mid-77-vintage': [
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
  ],

  // ADIDAS
  'adidas-ultraboost-22-white': [
    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],
  'adidas-samba-og-white-green': [
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800',
  ],
  'adidas-gazelle-indoor-blue': [
    'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  ],
  'adidas-yeezy-boost-350-v2-onyx': [
    'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800',
    'https://images.unsplash.com/photo-1595642527925-4d41cb781653?w=800',
  ],

  // JORDAN
  'air-jordan-1-retro-high-og-chicago': [
    'https://images.unsplash.com/photo-1600096194435-f29c5e357e4d?w=800',
    'https://images.unsplash.com/photo-1597953601374-af4e2ae0efd1?w=800',
  ],
  'air-jordan-4-retro-military-black': [
    'https://images.unsplash.com/photo-1600096194435-f29c5e357e4d?w=800',
    'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800',
  ],
  'air-jordan-11-retro-cool-grey': [
    'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],
  'air-jordan-3-retro-white-cement': [
    'https://images.unsplash.com/photo-1597953601374-af4e2ae0efd1?w=800',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
  ],

  // NEW BALANCE
  'new-balance-550-white-green': [
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
  ],
  'new-balance-2002r-rain-cloud': [
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
  ],
  'new-balance-990v6-made-in-usa': [
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  ],
  'new-balance-574-classic-navy': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
  ],

  // PUMA
  'puma-suede-classic-black': [
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
  ],
  'puma-rs-x-efekt-white': [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
  ],

  // CONVERSE
  'converse-chuck-taylor-all-star-high-black': [
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
  ],
  'converse-one-star-pro-suede-white': [
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
    'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
  ],

  // VANS
  'vans-old-skool-black-white': [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    'https://images.unsplash.com/photo-1562273175-1f42e358965a?w=800',
  ],
  'vans-sk8-hi-true-white': [
    'https://images.unsplash.com/photo-1562273175-1f42e358965a?w=800',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
  ],

  // ASICS
  'asics-gel-kayano-14-white-pure-silver': [
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
  ],
  'asics-gel-1130-cream-black': [
    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
  ],

  // SAUCONY
  'saucony-shadow-6000-grey-white': [
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
  ],
  'saucony-grid-sd-burgundy': [
    'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
  ],

  // REEBOK
  'reebok-club-c-85-vintage-green': [
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800',
    'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800',
  ],
  'reebok-classic-leather-white-gum': [
    'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=800',
    'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800',
  ],
};

async function main() {
  console.log('🖼️  Actualizando imágenes de productos...\n');

  let updated = 0;
  let notFound = 0;

  for (const [slug, images] of Object.entries(productImages)) {
    const product = await prisma.product.findUnique({ where: { slug } });

    if (!product) {
      console.log(`⚠️  No encontrado: ${slug}`);
      notFound++;
      continue;
    }

    await prisma.product.update({
      where: { slug },
      data: { images },
    });

    console.log(`✅ ${product.name} → ${images.length} imágenes`);
    updated++;
  }

  console.log(`\n🎉 ${updated} productos actualizados con imágenes`);
  if (notFound > 0) {
    console.log(`⚠️  ${notFound} productos no encontrados`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
