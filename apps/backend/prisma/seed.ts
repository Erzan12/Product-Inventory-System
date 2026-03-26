import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log('🌱 Seeding...');

  // 🧹 CLEAN DATABASE
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 👤 USERS
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mystore.com',
      password: passwordHash,
      role: Role.admin,
      userProfile: {
        create: {
          firstName: 'Earl',
          lastName: 'Do',
        },
      },
    },
  });

  await prisma.user.createMany({
    data: [
      { email: 'user1@test.com', password: passwordHash },
      { email: 'user2@test.com', password: passwordHash },
    ],
  });

  // 🏪 STORES
  const stores = await Promise.all([
    prisma.store.create({ data: { name: 'Urban Carry Co.', slug: 'urban-carry-co', userId: admin.id } }),
    prisma.store.create({ data: { name: 'Tech Haven', slug: 'tech-haven', userId: admin.id } }),
    prisma.store.create({ data: { name: 'Wellness & Living', slug: 'wellness-and-living', userId: admin.id } }),
    prisma.store.create({ data: { name: 'Style & Shades', slug: 'style-and-shades', userId: admin.id } }),
  ]);

  const storeMap = Object.fromEntries(stores.map(s => [s.slug, s]));

  // 📦 CATEGORIES
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', slug: 'electronics' } }),
    prisma.category.create({ data: { name: 'Fashion', slug: 'fashion' } }),
    prisma.category.create({ data: { name: 'Lifestyle', slug: 'lifestyle' } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories' } }),
  ]);

  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]));

  // 🎲 HELPERS
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const priceRanges = {
    electronics: [50, 500],
    fashion: [20, 150],
    lifestyle: [10, 80],
    accessories: [15, 120],
  };

  const storeByCategory = {
    electronics: 'tech-haven',
    fashion: 'urban-carry-co',
    lifestyle: 'wellness-and-living',
    accessories: 'style-and-shades',
  };

  const templates = {
    electronics: ['Headphones', 'Keyboard', 'Mouse', 'Speaker', 'Smart Watch'],
    fashion: ['Backpack', 'Shoes', 'Hoodie', 'Jacket', 'Shorts'],
    lifestyle: ['Candle', 'Bottle', 'Diffuser', 'Yoga Mat', 'Mug'],
    accessories: ['Wallet', 'Sunglasses', 'Belt', 'Watch'],
  };

  const getImage = (name: string) =>
    `https://source.unsplash.com/featured/?${encodeURIComponent(name)}`;

  // 🛒 GENERATE PRODUCTS (100+)
  const products: any[] = [];

  Object.entries(templates).forEach(([key, items]) => {
    items.forEach((item) => {
      for (let i = 1; i <= 6; i++) {
        const name = `${item} ${i}`;
        const slug = `${item}-${i}`.toLowerCase();

        products.push({
          name,
          slug,
          description: `High-quality ${item.toLowerCase()}`,
          price: parseFloat(
            (
              Math.random() *
                (priceRanges[key][1] - priceRanges[key][0]) +
              priceRanges[key][0]
            ).toFixed(2)
          ),
          quantity: rand(10, 150),
          images: [getImage(item)],
          categoryId: categoryMap[key].id,
          storeId: storeMap[storeByCategory[key]].id,
        });
      }
    });
  });

  // ⭐ FEATURED PRODUCTS (FIXED)
  const featured = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-headphones',
      description: 'Noise-canceling headphones',
      price: 199.99,
      quantity: 50,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
      categoryId: categoryMap.electronics.id,
      storeId: storeMap['tech-haven'].id,
    },
    {
      name: 'Minimalist Backpack',
      slug: 'minimalist-backpack',
      description: 'Water-resistant backpack',
      price: 89.99,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62'],
      categoryId: categoryMap.fashion.id,
      storeId: storeMap['urban-carry-co'].id,
    },
  ];

  // 💾 INSERT
  await prisma.product.createMany({
    data: [...featured, ...products],
  });

  console.log(`✅ Seeded ${products.length + featured.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });