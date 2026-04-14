// ==============================================
// TILLAS.EC — Database Seed (Completo)
// Datos reales de sneakers para Ecuador
// ==============================================

import { PrismaClient, Role, ProductStatus, Gender, DropStatus, DropType, LoyaltyTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...\n');

  // === Admin Users ===
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tillas.ec' },
    update: {},
    create: {
      email: 'admin@tillas.ec',
      name: 'Admin Tillas',
      passwordHash: adminHash,
      role: Role.ADMIN,
      phone: '+593999999999',
      isVerified: true,
      referralCode: 'TIL-ADMIN0001',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // User de ejemplo
  const userHash = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'juan@ejemplo.com' },
    update: {},
    create: {
      email: 'juan@ejemplo.com',
      name: 'Juan Pérez',
      passwordHash: userHash,
      role: Role.USER,
      phone: '+593987654321',
      isVerified: true,
      birthday: new Date('1995-06-15'),
      referralCode: 'TIL-USER0001',
    },
  });
  console.log('✅ User ejemplo:', user.email);

  // === Brands ===
  const brandsData = [
    { name: 'Nike', slug: 'nike', logo: '' },
    { name: 'Adidas', slug: 'adidas', logo: '' },
    { name: 'Jordan', slug: 'jordan', logo: '' },
    { name: 'New Balance', slug: 'new-balance', logo: '' },
    { name: 'Puma', slug: 'puma', logo: '' },
    { name: 'Converse', slug: 'converse', logo: '' },
    { name: 'Reebok', slug: 'reebok', logo: '' },
    { name: 'Vans', slug: 'vans', logo: '' },
    { name: 'ASICS', slug: 'asics', logo: '' },
    { name: 'Saucony', slug: 'saucony', logo: '' },
  ];

  const brands = await Promise.all(
    brandsData.map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      })
    )
  );
  console.log(`✅ ${brands.length} marcas creadas`);

  // === Categories ===
  const categoriesData = [
    { name: 'Running', slug: 'running', image: '' },
    { name: 'Lifestyle', slug: 'lifestyle', image: '' },
    { name: 'Basketball', slug: 'basketball', image: '' },
    { name: 'Skate', slug: 'skate', image: '' },
    { name: 'Retro', slug: 'retro', image: '' },
    { name: 'Limited Edition', slug: 'limited-edition', image: '' },
    { name: 'Training', slug: 'training', image: '' },
    { name: 'Outdoor', slug: 'outdoor', image: '' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${categories.length} categorías creadas`);

  // Get brand and category references
  const getBrand = (slug: string) => brands.find((b) => b.slug === slug)!;
  const getCategory = (slug: string) => categories.find((c) => c.slug === slug)!;

  // === Products (30+ sneakers reales) ===
  const productsData = [
    // NIKE - Lifestyle
    {
      name: 'Nike Air Force 1 Low White',
      brandId: getBrand('nike').id,
      model: 'Air Force 1',
      description: 'El clásico que nunca pasa de moda. Cuero premium blanco, suela Air, estilo eterno. Perfecto para cualquier outfit.',
      slug: 'nike-air-force-1-low-white',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-01-15'),
      colorway: 'Triple White',
      styleCode: 'CW2288-111',
      story: 'Desde 1982, el Air Force 1 ha sido un ícono cultural. Diseñado por Bruce Kilgore, fue el primer zapato de basketball en usar tecnología Nike Air.',
      variants: [
        { size: '7', price: 89.99, compareAt: null, stock: 10, sku: 'NAF1-WHT-7' },
        { size: '8', price: 89.99, compareAt: null, stock: 15, sku: 'NAF1-WHT-8' },
        { size: '9', price: 89.99, compareAt: null, stock: 12, sku: 'NAF1-WHT-9' },
        { size: '10', price: 89.99, compareAt: null, stock: 8, sku: 'NAF1-WHT-10' },
        { size: '11', price: 89.99, compareAt: null, stock: 5, sku: 'NAF1-WHT-11' },
        { size: '12', price: 89.99, compareAt: null, stock: 3, sku: 'NAF1-WHT-12' },
      ],
    },
    {
      name: 'Nike Air Max 90 Black',
      brandId: getBrand('nike').id,
      model: 'Air Max 90',
      description: 'Diseño retro con tecnología moderna. La unidad Air visible es el sello distintivo de este ícono.',
      slug: 'nike-air-max-90-black',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-02-20'),
      colorway: 'Black/White',
      styleCode: 'CN8490-001',
      story: 'Diseñado por Tinker Hatfield en 1990, el Air Max 90 revolucionó el concepto de zapatillas visibles.',
      variants: [
        { size: '7', price: 129.99, compareAt: 149.99, stock: 8, sku: 'NAM90-BLK-7' },
        { size: '8', price: 129.99, compareAt: 149.99, stock: 12, sku: 'NAM90-BLK-8' },
        { size: '9', price: 129.99, compareAt: 149.99, stock: 10, sku: 'NAM90-BLK-9' },
        { size: '10', price: 129.99, compareAt: 149.99, stock: 6, sku: 'NAM90-BLK-10' },
        { size: '11', price: 129.99, compareAt: 149.99, stock: 4, sku: 'NAM90-BLK-11' },
      ],
    },
    {
      name: 'Nike Dunk Low Panda',
      brandId: getBrand('nike').id,
      model: 'Dunk Low',
      description: 'El Dunk Low Panda es uno de los colorways más populares. Blanco y negro para un look limpio.',
      slug: 'nike-dunk-low-panda',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-03-10'),
      colorway: 'Black/White',
      styleCode: 'DD1391-100',
      variants: [
        { size: '7', price: 109.99, compareAt: null, stock: 15, sku: 'NDL-PANDA-7' },
        { size: '8', price: 109.99, compareAt: null, stock: 20, sku: 'NDL-PANDA-8' },
        { size: '9', price: 109.99, compareAt: null, stock: 18, sku: 'NDL-PANDA-9' },
        { size: '10', price: 109.99, compareAt: null, stock: 12, sku: 'NDL-PANDA-10' },
        { size: '11', price: 109.99, compareAt: null, stock: 8, sku: 'NDL-PANDA-11' },
        { size: '12', price: 109.99, compareAt: null, stock: 5, sku: 'NDL-PANDA-12' },
      ],
    },
    {
      name: 'Nike Air Max 97 Silver Bullet',
      brandId: getBrand('nike').id,
      model: 'Air Max 97',
      description: 'Líneas onduladas inspiradas en gotas de agua. El Silver Bullet es el colorway más icónico.',
      slug: 'nike-air-max-97-silver-bullet',
      images: [],
      categoryId: getCategory('retro').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-05'),
      colorway: 'Silver/Red',
      styleCode: '921826-001',
      variants: [
        { size: '8', price: 169.99, compareAt: 189.99, stock: 6, sku: 'NAM97-SILV-8' },
        { size: '9', price: 169.99, compareAt: 189.99, stock: 8, sku: 'NAM97-SILV-9' },
        { size: '10', price: 169.99, compareAt: 189.99, stock: 5, sku: 'NAM97-SILV-10' },
        { size: '11', price: 169.99, compareAt: 189.99, stock: 3, sku: 'NAM97-SILV-11' },
      ],
    },
    {
      name: 'Nike Blazer Mid 77 Vintage',
      brandId: getBrand('nike').id,
      model: 'Blazer Mid 77',
      description: 'Estilo vintage de los 70s. Cuero premium con el clásico swoosh oversized.',
      slug: 'nike-blazer-mid-77-vintage',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-01-25'),
      colorway: 'White/Black',
      styleCode: 'BQ6806-100',
      variants: [
        { size: '7', price: 99.99, compareAt: null, stock: 10, sku: 'NBLZ77-WHT-7' },
        { size: '8', price: 99.99, compareAt: null, stock: 14, sku: 'NBLZ77-WHT-8' },
        { size: '9', price: 99.99, compareAt: null, stock: 11, sku: 'NBLZ77-WHT-9' },
        { size: '10', price: 99.99, compareAt: null, stock: 7, sku: 'NBLZ77-WHT-10' },
        { size: '11', price: 99.99, compareAt: null, stock: 4, sku: 'NBLZ77-WHT-11' },
      ],
    },

    // ADIDAS - Running & Lifestyle
    {
      name: 'Adidas Ultraboost 22 White',
      brandId: getBrand('adidas').id,
      model: 'Ultraboost 22',
      description: 'La mejor amortiguación de Adidas. Boost technology para máximo retorno de energía.',
      slug: 'adidas-ultraboost-22-white',
      images: [],
      categoryId: getCategory('running').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-02-10'),
      colorway: 'Cloud White',
      styleCode: 'GZ0127',
      story: 'Ultraboost ha sido el zapato de running premium de Adidas desde 2015, usado por corredores de élite.',
      variants: [
        { size: '7', price: 179.99, compareAt: 199.99, stock: 8, sku: 'AUB22-WHT-7' },
        { size: '8', price: 179.99, compareAt: 199.99, stock: 12, sku: 'AUB22-WHT-8' },
        { size: '9', price: 179.99, compareAt: 199.99, stock: 10, sku: 'AUB22-WHT-9' },
        { size: '10', price: 179.99, compareAt: 199.99, stock: 6, sku: 'AUB22-WHT-10' },
        { size: '11', price: 179.99, compareAt: 199.99, stock: 4, sku: 'AUB22-WHT-11' },
      ],
    },
    {
      name: 'Adidas Samba OG White Green',
      brandId: getBrand('adidas').id,
      model: 'Samba OG',
      description: 'El Samba es un clásico atemporal. De las canchas de fútbol a las calles del mundo.',
      slug: 'adidas-samba-og-white-green',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-03-15'),
      colorway: 'White/Green',
      styleCode: 'B75806',
      variants: [
        { size: '7', price: 99.99, compareAt: null, stock: 12, sku: 'ASAMBA-WG-7' },
        { size: '8', price: 99.99, compareAt: null, stock: 16, sku: 'ASAMBA-WG-8' },
        { size: '9', price: 99.99, compareAt: null, stock: 14, sku: 'ASAMBA-WG-9' },
        { size: '10', price: 99.99, compareAt: null, stock: 10, sku: 'ASAMBA-WG-10' },
        { size: '11', price: 99.99, compareAt: null, stock: 7, sku: 'ASAMBA-WG-11' },
        { size: '12', price: 99.99, compareAt: null, stock: 4, sku: 'ASAMBA-WG-12' },
      ],
    },
    {
      name: 'Adidas Gazelle Indoor Blue',
      brandId: getBrand('adidas').id,
      model: 'Gazelle',
      description: 'Estilo retro de los 60s. Suela de goma natural y ante premium.',
      slug: 'adidas-gazelle-indoor-blue',
      images: [],
      categoryId: getCategory('retro').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-01'),
      colorway: 'Blue/White',
      styleCode: 'BB5478',
      variants: [
        { size: '7', price: 109.99, compareAt: null, stock: 9, sku: 'AGAZ-BLU-7' },
        { size: '8', price: 109.99, compareAt: null, stock: 13, sku: 'AGAZ-BLU-8' },
        { size: '9', price: 109.99, compareAt: null, stock: 11, sku: 'AGAZ-BLU-9' },
        { size: '10', price: 109.99, compareAt: null, stock: 8, sku: 'AGAZ-BLU-10' },
        { size: '11', price: 109.99, compareAt: null, stock: 5, sku: 'AGAZ-BLU-11' },
      ],
    },
    {
      name: 'Adidas Yeezy Boost 350 V2 Onyx',
      brandId: getBrand('adidas').id,
      model: 'Yeezy 350 V2',
      description: 'Colaboración con Kanye West. Primeknit upper con Boost completo. Uno de los sneakers más buscados.',
      slug: 'adidas-yeezy-boost-350-v2-onyx',
      images: [],
      categoryId: getCategory('limited-edition').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-01-20'),
      colorway: 'Onyx/Onyx',
      styleCode: 'HQ4540',
      story: 'La línea Yeezy revolucionó la cultura sneaker. Cada release genera colas y resale masivo.',
      variants: [
        { size: '8', price: 229.99, compareAt: 279.99, stock: 4, sku: 'AYZY350-ONYX-8' },
        { size: '9', price: 229.99, compareAt: 279.99, stock: 5, sku: 'AYZY350-ONYX-9' },
        { size: '10', price: 229.99, compareAt: 279.99, stock: 3, sku: 'AYZY350-ONYX-10' },
        { size: '11', price: 229.99, compareAt: 279.99, stock: 2, sku: 'AYZY350-ONYX-11' },
      ],
    },

    // JORDAN - Basketball & Retro
    {
      name: 'Air Jordan 1 Retro High OG Chicago',
      brandId: getBrand('jordan').id,
      model: 'Air Jordan 1',
      description: 'El colorway original de Michael Jordan. Rojo, blanco y negro. Historia pura del basketball.',
      slug: 'air-jordan-1-retro-high-og-chicago',
      images: [],
      categoryId: getCategory('basketball').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-02-28'),
      colorway: 'Chicago Red/White/Black',
      styleCode: 'DZ5485-612',
      story: 'Prohibido por la NBA en 1985, MJ lo usó de todos modos. Nike pagó las multas y nació una leyenda.',
      variants: [
        { size: '8', price: 179.99, compareAt: null, stock: 5, sku: 'AJ1-CHI-8' },
        { size: '9', price: 179.99, compareAt: null, stock: 7, sku: 'AJ1-CHI-9' },
        { size: '10', price: 179.99, compareAt: null, stock: 4, sku: 'AJ1-CHI-10' },
        { size: '11', price: 179.99, compareAt: null, stock: 3, sku: 'AJ1-CHI-11' },
        { size: '12', price: 179.99, compareAt: null, stock: 2, sku: 'AJ1-CHI-12' },
      ],
    },
    {
      name: 'Air Jordan 4 Retro Military Black',
      brandId: getBrand('jordan').id,
      model: 'Air Jordan 4',
      description: 'Diseño de Tinker Hatfield con las icónicas alas laterales. El favorito de los coleccionistas.',
      slug: 'air-jordan-4-retro-military-black',
      images: [],
      categoryId: getCategory('basketball').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-03-20'),
      colorway: 'White/Military Black',
      styleCode: 'DR5415-151',
      variants: [
        { size: '8', price: 199.99, compareAt: null, stock: 6, sku: 'AJ4-MIL-8' },
        { size: '9', price: 199.99, compareAt: null, stock: 8, sku: 'AJ4-MIL-9' },
        { size: '10', price: 199.99, compareAt: null, stock: 5, sku: 'AJ4-MIL-10' },
        { size: '11', price: 199.99, compareAt: null, stock: 4, sku: 'AJ4-MIL-11' },
        { size: '12', price: 199.99, compareAt: null, stock: 2, sku: 'AJ4-MIL-12' },
      ],
    },
    {
      name: 'Air Jordan 11 Retro Cool Grey',
      brandId: getBrand('jordan').id,
      model: 'Air Jordan 11',
      description: 'El AJ11 es elegancia pura. Charol y malla, usado por MJ en el playoffs del 96.',
      slug: 'air-jordan-11-retro-cool-grey',
      images: [],
      categoryId: getCategory('basketball').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-04-15'),
      colorway: 'Cool Grey',
      styleCode: 'CT8012-005',
      variants: [
        { size: '8', price: 219.99, compareAt: null, stock: 4, sku: 'AJ11-CG-8' },
        { size: '9', price: 219.99, compareAt: null, stock: 6, sku: 'AJ11-CG-9' },
        { size: '10', price: 219.99, compareAt: null, stock: 3, sku: 'AJ11-CG-10' },
        { size: '11', price: 219.99, compareAt: null, stock: 2, sku: 'AJ11-CG-11' },
      ],
    },
    {
      name: 'Air Jordan 3 Retro White Cement',
      brandId: getBrand('jordan').id,
      model: 'Air Jordan 3',
      description: 'El primer Jordan con el Jumpman logo. Elephant print y Air visible. Diseño revolucionario.',
      slug: 'air-jordan-3-retro-white-cement',
      images: [],
      categoryId: getCategory('retro').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-02-05'),
      colorway: 'White/Fire Red/Cement Grey',
      styleCode: 'DN3707-100',
      variants: [
        { size: '8', price: 189.99, compareAt: null, stock: 5, sku: 'AJ3-WC-8' },
        { size: '9', price: 189.99, compareAt: null, stock: 7, sku: 'AJ3-WC-9' },
        { size: '10', price: 189.99, compareAt: null, stock: 4, sku: 'AJ3-WC-10' },
        { size: '11', price: 189.99, compareAt: null, stock: 3, sku: 'AJ3-WC-11' },
      ],
    },

    // NEW BALANCE - Lifestyle & Running
    {
      name: 'New Balance 550 White Green',
      brandId: getBrand('new-balance').id,
      model: '550',
      description: 'Retro basketball vibes. El modelo que conquistó el streetwear mundial gracias a Aimé Leon Dore.',
      slug: 'new-balance-550-white-green',
      images: [],
      categoryId: getCategory('retro').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-03-01'),
      colorway: 'White/Green',
      styleCode: 'BB550WT1',
      story: 'Lanzado en 1989 como zapato de basketball, el 550 fue redescubierto en 2021 y se convirtió en viral.',
      variants: [
        { size: '7', price: 109.99, compareAt: null, stock: 10, sku: 'NB550-WG-7' },
        { size: '8', price: 109.99, compareAt: null, stock: 14, sku: 'NB550-WG-8' },
        { size: '9', price: 109.99, compareAt: null, stock: 12, sku: 'NB550-WG-9' },
        { size: '10', price: 109.99, compareAt: null, stock: 8, sku: 'NB550-WG-10' },
        { size: '11', price: 109.99, compareAt: null, stock: 5, sku: 'NB550-WG-11' },
        { size: '12', price: 109.99, compareAt: null, stock: 3, sku: 'NB550-WG-12' },
      ],
    },
    {
      name: 'New Balance 2002R Rain Cloud',
      brandId: getBrand('new-balance').id,
      model: '2002R',
      description: 'Tecnología ABZORB + N-ergy para máximo confort. Estética chunky y premium.',
      slug: 'new-balance-2002r-rain-cloud',
      images: [],
      categoryId: getCategory('running').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-10'),
      colorway: 'Rain Cloud/White',
      styleCode: 'M2002RDA',
      variants: [
        { size: '7', price: 139.99, compareAt: 159.99, stock: 8, sku: 'NB2002-RC-7' },
        { size: '8', price: 139.99, compareAt: 159.99, stock: 11, sku: 'NB2002-RC-8' },
        { size: '9', price: 139.99, compareAt: 159.99, stock: 9, sku: 'NB2002-RC-9' },
        { size: '10', price: 139.99, compareAt: 159.99, stock: 6, sku: 'NB2002-RC-10' },
        { size: '11', price: 139.99, compareAt: 159.99, stock: 4, sku: 'NB2002-RC-11' },
      ],
    },
    {
      name: 'New Balance 990v6 Made in USA',
      brandId: getBrand('new-balance').id,
      model: '990v6',
      description: 'Fabricado en USA con materiales premium. La línea 990 es la joya de New Balance.',
      slug: 'new-balance-990v6-made-in-usa',
      images: [],
      categoryId: getCategory('running').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-01-10'),
      colorway: 'Castlerock',
      styleCode: 'M990CR6',
      story: 'La serie 990 se fabrica en New England desde 1982. Cada par pasa por 70 procesos de control de calidad.',
      variants: [
        { size: '8', price: 199.99, compareAt: null, stock: 5, sku: 'NB990-CR-8' },
        { size: '9', price: 199.99, compareAt: null, stock: 7, sku: 'NB990-CR-9' },
        { size: '10', price: 199.99, compareAt: null, stock: 4, sku: 'NB990-CR-10' },
        { size: '11', price: 199.99, compareAt: null, stock: 3, sku: 'NB990-CR-11' },
      ],
    },
    {
      name: 'New Balance 574 Classic Navy',
      brandId: getBrand('new-balance').id,
      model: '574',
      description: 'El 574 es el modelo más versátil de NB. Suela ENCAP, cómodo para todo el día.',
      slug: 'new-balance-574-classic-navy',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-02-15'),
      colorway: 'Navy/White',
      styleCode: 'ML574EVG',
      variants: [
        { size: '7', price: 89.99, compareAt: null, stock: 15, sku: 'NB574-NAVY-7' },
        { size: '8', price: 89.99, compareAt: null, stock: 20, sku: 'NB574-NAVY-8' },
        { size: '9', price: 89.99, compareAt: null, stock: 18, sku: 'NB574-NAVY-9' },
        { size: '10', price: 89.99, compareAt: null, stock: 12, sku: 'NB574-NAVY-10' },
        { size: '11', price: 89.99, compareAt: null, stock: 8, sku: 'NB574-NAVY-11' },
        { size: '12', price: 89.99, compareAt: null, stock: 5, sku: 'NB574-NAVY-12' },
      ],
    },

    // PUMA
    {
      name: 'Puma Suede Classic Black',
      brandId: getBrand('puma').id,
      model: 'Suede Classic',
      description: 'Ícono del hip-hop y el skate desde los 80s. Ante premium y suela de goma.',
      slug: 'puma-suede-classic-black',
      images: [],
      categoryId: getCategory('skate').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-03-05'),
      colorway: 'Black/White',
      styleCode: '374915-01',
      variants: [
        { size: '7', price: 69.99, compareAt: null, stock: 12, sku: 'PUMA-SUEDE-BLK-7' },
        { size: '8', price: 69.99, compareAt: null, stock: 16, sku: 'PUMA-SUEDE-BLK-8' },
        { size: '9', price: 69.99, compareAt: null, stock: 14, sku: 'PUMA-SUEDE-BLK-9' },
        { size: '10', price: 69.99, compareAt: null, stock: 10, sku: 'PUMA-SUEDE-BLK-10' },
        { size: '11', price: 69.99, compareAt: null, stock: 6, sku: 'PUMA-SUEDE-BLK-11' },
      ],
    },
    {
      name: 'Puma RS-X Efekt White',
      brandId: getBrand('puma').id,
      model: 'RS-X',
      description: 'Diseño futurista con Running System technology. Chunky y llamativo.',
      slug: 'puma-rs-x-efekt-white',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-20'),
      colorway: 'White/Blue/Red',
      styleCode: '369572-02',
      variants: [
        { size: '8', price: 109.99, compareAt: 129.99, stock: 7, sku: 'PUMA-RSX-WHT-8' },
        { size: '9', price: 109.99, compareAt: 129.99, stock: 9, sku: 'PUMA-RSX-WHT-9' },
        { size: '10', price: 109.99, compareAt: 129.99, stock: 6, sku: 'PUMA-RSX-WHT-10' },
        { size: '11', price: 109.99, compareAt: 129.99, stock: 4, sku: 'PUMA-RSX-WHT-11' },
      ],
    },

    // CONVERSE
    {
      name: 'Converse Chuck Taylor All Star High Black',
      brandId: getBrand('converse').id,
      model: 'Chuck Taylor',
      description: 'El sneaker más vendido de la historia. Canvas negro, icónico desde 1917.',
      slug: 'converse-chuck-taylor-all-star-high-black',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-01-01'),
      colorway: 'Black/White',
      styleCode: 'M0342C',
      story: 'Más de mil millones de pares vendidos. El Chuck Taylor es el calzado más icónico del siglo XX.',
      variants: [
        { size: '6', price: 59.99, compareAt: null, stock: 20, sku: 'CONV-CHUCK-BLK-6' },
        { size: '7', price: 59.99, compareAt: null, stock: 25, sku: 'CONV-CHUCK-BLK-7' },
        { size: '8', price: 59.99, compareAt: null, stock: 30, sku: 'CONV-CHUCK-BLK-8' },
        { size: '9', price: 59.99, compareAt: null, stock: 28, sku: 'CONV-CHUCK-BLK-9' },
        { size: '10', price: 59.99, compareAt: null, stock: 22, sku: 'CONV-CHUCK-BLK-10' },
        { size: '11', price: 59.99, compareAt: null, stock: 15, sku: 'CONV-CHUCK-BLK-11' },
        { size: '12', price: 59.99, compareAt: null, stock: 10, sku: 'CONV-CHUCK-BLK-12' },
      ],
    },
    {
      name: 'Converse One Star Pro Suede White',
      brandId: getBrand('converse').id,
      model: 'One Star Pro',
      description: 'Estilo minimalista con suede premium. La estrella solitaria es inconfundible.',
      slug: 'converse-one-star-pro-suede-white',
      images: [],
      categoryId: getCategory('skate').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-03-25'),
      colorway: 'White/Navy',
      styleCode: '163260C',
      variants: [
        { size: '7', price: 74.99, compareAt: null, stock: 10, sku: 'CONV-1STAR-WHT-7' },
        { size: '8', price: 74.99, compareAt: null, stock: 14, sku: 'CONV-1STAR-WHT-8' },
        { size: '9', price: 74.99, compareAt: null, stock: 12, sku: 'CONV-1STAR-WHT-9' },
        { size: '10', price: 74.99, compareAt: null, stock: 8, sku: 'CONV-1STAR-WHT-10' },
        { size: '11', price: 74.99, compareAt: null, stock: 5, sku: 'CONV-1STAR-WHT-11' },
      ],
    },

    // VANS
    {
      name: 'Vans Old Skool Black White',
      brandId: getBrand('vans').id,
      model: 'Old Skool',
      description: 'El primer zapato con el icónico side stripe. Skate culture desde 1977.',
      slug: 'vans-old-skool-black-white',
      images: [],
      categoryId: getCategory('skate').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      releaseDate: new Date('2024-02-01'),
      colorway: 'Black/White',
      styleCode: 'VN000D3HY28',
      variants: [
        { size: '7', price: 64.99, compareAt: null, stock: 18, sku: 'VANS-OS-BW-7' },
        { size: '8', price: 64.99, compareAt: null, stock: 22, sku: 'VANS-OS-BW-8' },
        { size: '9', price: 64.99, compareAt: null, stock: 20, sku: 'VANS-OS-BW-9' },
        { size: '10', price: 64.99, compareAt: null, stock: 15, sku: 'VANS-OS-BW-10' },
        { size: '11', price: 64.99, compareAt: null, stock: 10, sku: 'VANS-OS-BW-11' },
        { size: '12', price: 64.99, compareAt: null, stock: 6, sku: 'VANS-OS-BW-12' },
      ],
    },
    {
      name: 'Vans Sk8-Hi True White',
      brandId: getBrand('vans').id,
      model: 'Sk8-Hi',
      description: 'High-top clásico con soporte de tobillo. Perfecto para skate o estilo urbano.',
      slug: 'vans-sk8-hi-true-white',
      images: [],
      categoryId: getCategory('skate').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-05'),
      colorway: 'True White',
      styleCode: 'VN000D5IB8C',
      variants: [
        { size: '7', price: 74.99, compareAt: null, stock: 10, sku: 'VANS-SK8-WHT-7' },
        { size: '8', price: 74.99, compareAt: null, stock: 14, sku: 'VANS-SK8-WHT-8' },
        { size: '9', price: 74.99, compareAt: null, stock: 12, sku: 'VANS-SK8-WHT-9' },
        { size: '10', price: 74.99, compareAt: null, stock: 8, sku: 'VANS-SK8-WHT-10' },
        { size: '11', price: 74.99, compareAt: null, stock: 5, sku: 'VANS-SK8-WHT-11' },
      ],
    },

    // ASICS - Running
    {
      name: 'ASICS Gel-Kayano 14 White Pure Silver',
      brandId: getBrand('asics').id,
      model: 'Gel-Kayano 14',
      description: 'Tecnología GEL para máximo amortiguamiento. El rey del running stability.',
      slug: 'asics-gel-kayano-14-white-pure-silver',
      images: [],
      categoryId: getCategory('running').id,
      gender: Gender.MALE,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-03-10'),
      colorway: 'White/Pure Silver',
      styleCode: '1201A019-100',
      variants: [
        { size: '8', price: 159.99, compareAt: 179.99, stock: 7, sku: 'ASICS-K14-WHT-8' },
        { size: '9', price: 159.99, compareAt: 179.99, stock: 9, sku: 'ASICS-K14-WHT-9' },
        { size: '10', price: 159.99, compareAt: 179.99, stock: 6, sku: 'ASICS-K14-WHT-10' },
        { size: '11', price: 159.99, compareAt: 179.99, stock: 4, sku: 'ASICS-K14-WHT-11' },
      ],
    },
    {
      name: 'ASICS Gel-1130 Cream Black',
      brandId: getBrand('asics').id,
      model: 'Gel-1130',
      description: 'Retro runner con GEL visible. Trendy en la cultura sneaker actual.',
      slug: 'asics-gel-1130-cream-black',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-01'),
      colorway: 'Cream/Black',
      styleCode: '1201A918-100',
      variants: [
        { size: '7', price: 119.99, compareAt: null, stock: 10, sku: 'ASICS-1130-CRM-7' },
        { size: '8', price: 119.99, compareAt: null, stock: 14, sku: 'ASICS-1130-CRM-8' },
        { size: '9', price: 119.99, compareAt: null, stock: 12, sku: 'ASICS-1130-CRM-9' },
        { size: '10', price: 119.99, compareAt: null, stock: 8, sku: 'ASICS-1130-CRM-10' },
        { size: '11', price: 119.99, compareAt: null, stock: 5, sku: 'ASICS-1130-CRM-11' },
      ],
    },

    // SAUCONY
    {
      name: 'Saucony Shadow 6000 Grey White',
      brandId: getBrand('saucony').id,
      model: 'Shadow 6000',
      description: 'Retro runner con estilo clásico. Suela de goma sólida, comodidad duradera.',
      slug: 'saucony-shadow-6000-grey-white',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-03-15'),
      colorway: 'Grey/White',
      styleCode: 'S70357-1',
      variants: [
        { size: '8', price: 99.99, compareAt: null, stock: 8, sku: 'SAUC-SHD6K-GRY-8' },
        { size: '9', price: 99.99, compareAt: null, stock: 11, sku: 'SAUC-SHD6K-GRY-9' },
        { size: '10', price: 99.99, compareAt: null, stock: 7, sku: 'SAUC-SHD6K-GRY-10' },
        { size: '11', price: 99.99, compareAt: null, stock: 4, sku: 'SAUC-SHD6K-GRY-11' },
      ],
    },
    {
      name: 'Saucony Grid SD Burgundy',
      brandId: getBrand('saucony').id,
      model: 'Grid SD',
      description: 'GRID technology para soporte y amortiguamiento. Suede premium y estilo vintage.',
      slug: 'saucony-grid-sd-burgundy',
      images: [],
      categoryId: getCategory('retro').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-04-10'),
      colorway: 'Burgundy/Grey',
      styleCode: 'S1108-590',
      variants: [
        { size: '8', price: 109.99, compareAt: null, stock: 6, sku: 'SAUC-GRIDSD-BUR-8' },
        { size: '9', price: 109.99, compareAt: null, stock: 9, sku: 'SAUC-GRIDSD-BUR-9' },
        { size: '10', price: 109.99, compareAt: null, stock: 5, sku: 'SAUC-GRIDSD-BUR-10' },
        { size: '11', price: 109.99, compareAt: null, stock: 3, sku: 'SAUC-GRIDSD-BUR-11' },
      ],
    },

    // REEBOK
    {
      name: 'Reebok Club C 85 Vintage Green',
      brandId: getBrand('reebok').id,
      model: 'Club C 85',
      description: 'Estilo tennis de los 80s. Cuero suave con el clásico logo verde.',
      slug: 'reebok-club-c-85-vintage-green',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-02-20'),
      colorway: 'Chalk/Green',
      styleCode: 'BS8248',
      variants: [
        { size: '7', price: 74.99, compareAt: null, stock: 12, sku: 'RBK-CC85-GRN-7' },
        { size: '8', price: 74.99, compareAt: null, stock: 16, sku: 'RBK-CC85-GRN-8' },
        { size: '9', price: 74.99, compareAt: null, stock: 14, sku: 'RBK-CC85-GRN-9' },
        { size: '10', price: 74.99, compareAt: null, stock: 10, sku: 'RBK-CC85-GRN-10' },
        { size: '11', price: 74.99, compareAt: null, stock: 6, sku: 'RBK-CC85-GRN-11' },
      ],
    },
    {
      name: 'Reebok Classic Leather White Gum',
      brandId: getBrand('reebok').id,
      model: 'Classic Leather',
      description: 'El Reebok más icónico. Cuero blanco con suela gum. Versatilidad pura.',
      slug: 'reebok-classic-leather-white-gum',
      images: [],
      categoryId: getCategory('lifestyle').id,
      gender: Gender.UNISEX,
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      releaseDate: new Date('2024-03-30'),
      colorway: 'White/Gum',
      styleCode: '100035986',
      variants: [
        { size: '7', price: 79.99, compareAt: null, stock: 10, sku: 'RBK-CL-WG-7' },
        { size: '8', price: 79.99, compareAt: null, stock: 14, sku: 'RBK-CL-WG-8' },
        { size: '9', price: 79.99, compareAt: null, stock: 12, sku: 'RBK-CL-WG-9' },
        { size: '10', price: 79.99, compareAt: null, stock: 8, sku: 'RBK-CL-WG-10' },
        { size: '11', price: 79.99, compareAt: null, stock: 5, sku: 'RBK-CL-WG-11' },
      ],
    },
  ];

  console.log('\n📦 Creando productos...');
  let productCount = 0;
  for (const productData of productsData) {
    const { variants, ...product } = productData;
    
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      console.log(`⏭️  Producto ya existe: ${product.name}`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        ...product,
        variants: {
          createMany: {
            data: variants,
          },
        },
      },
    });
    productCount++;
    console.log(`✅ Producto creado: ${created.name}`);
  }
  console.log(`\n🎉 ${productCount} productos creados`);

  // === Create a Sample Drop ===
  console.log('\n🔥 Creando drop de ejemplo...');
  const drop = await prisma.drop.upsert({
    where: { slug: 'jordan-1-chicago-exclusive' },
    update: {},
    create: {
      title: 'Jordan 1 Chicago - Exclusive Drop',
      slug: 'jordan-1-chicago-exclusive',
      description: 'Drop exclusivo del AJ1 Chicago. Solo para miembros Elite y Oro.',
      image: '',
      startsAt: new Date('2026-05-01T10:00:00.000Z'),
      endsAt: new Date('2026-05-01T12:00:00.000Z'),
      status: DropStatus.SCHEDULED,
      type: DropType.EARLY_ACCESS,
      isRaffle: false,
      maxEntries: null,
      stock: 50,
      minTier: LoyaltyTier.ELITE,
    },
  });
  console.log(`✅ Drop creado: ${drop.title}`);

  // === Sample Reviews ===
  console.log('\n⭐ Creando reviews...');
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct && user) {
    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: firstProduct.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        productId: firstProduct.id,
        userId: user.id,
        rating: 5,
        comment: 'Excelentes zapatillas! Muy cómodas y el envío fue súper rápido a Quito.',
        images: [],
      },
    });
    console.log('✅ Review creada');
  }

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - ${brands.length} marcas`);
  console.log(`   - ${categories.length} categorías`);
  console.log(`   - ${productCount} productos con variantes`);
  console.log(`   - 1 drop programado`);
  console.log(`   - Usuarios: admin@tillas.ec (admin) / juan@ejemplo.com (user)`);
  console.log('\n🔐 Credenciales:');
  console.log('   Admin: admin@tillas.ec / admin123');
  console.log('   User:  juan@ejemplo.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
