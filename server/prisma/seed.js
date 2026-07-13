require('dotenv').config();
const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Seeding database...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Vegetables' }, update: {}, create: { name: 'Vegetables' } }),
    prisma.category.upsert({ where: { name: 'Fruits' }, update: {}, create: { name: 'Fruits' } }),
    prisma.category.upsert({ where: { name: 'Grains & Cereals' }, update: {}, create: { name: 'Grains & Cereals' } }),
    prisma.category.upsert({ where: { name: 'Pulses & Legumes' }, update: {}, create: { name: 'Pulses & Legumes' } }),
    prisma.category.upsert({ where: { name: 'Spices & Herbs' }, update: {}, create: { name: 'Spices & Herbs' } }),
    prisma.category.upsert({ where: { name: 'Oilseeds' }, update: {}, create: { name: 'Oilseeds' } }),
    prisma.category.upsert({ where: { name: 'Flowers' }, update: {}, create: { name: 'Flowers' } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aifarm.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@aifarm.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      phone: '+91 9000000000',
    },
  });
  console.log('✅ Created admin user');

  // Create Farmers
  const farmers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'farmer1@aifarm.com' },
      update: {},
      create: {
        name: 'Rajan Krishnamurthy',
        email: 'farmer1@aifarm.com',
        password: hashedPassword,
        role: 'FARMER',
        isVerified: true,
        phone: '+91 9876543210',
        village: 'Madurai North',
        district: 'Madurai',
        state: 'Tamil Nadu',
        latitude: 9.9252,
        longitude: 78.1198,
      },
    }),
    prisma.user.upsert({
      where: { email: 'farmer2@aifarm.com' },
      update: {},
      create: {
        name: 'Murugan Selvam',
        email: 'farmer2@aifarm.com',
        password: hashedPassword,
        role: 'FARMER',
        isVerified: true,
        phone: '+91 9765432109',
        village: 'Coimbatore South',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        latitude: 11.0168,
        longitude: 76.9558,
      },
    }),
    prisma.user.upsert({
      where: { email: 'farmer3@aifarm.com' },
      update: {},
      create: {
        name: 'Kavitha Devi',
        email: 'farmer3@aifarm.com',
        password: hashedPassword,
        role: 'FARMER',
        isVerified: true,
        phone: '+91 9654321098',
        village: 'Salem West',
        district: 'Salem',
        state: 'Tamil Nadu',
        latitude: 11.6643,
        longitude: 78.146,
      },
    }),
  ]);
  console.log('✅ Created 3 farmer accounts');

  // Create Buyers
  const buyers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'buyer1@aifarm.com' },
      update: {},
      create: {
        name: 'Priya Suresh',
        email: 'buyer1@aifarm.com',
        password: hashedPassword,
        role: 'BUYER',
        isVerified: true,
        phone: '+91 9543210987',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
    }),
    prisma.user.upsert({
      where: { email: 'buyer2@aifarm.com' },
      update: {},
      create: {
        name: 'Anand Kumar',
        email: 'buyer2@aifarm.com',
        password: hashedPassword,
        role: 'BUYER',
        isVerified: true,
        phone: '+91 9432109876',
        district: 'Trichy',
        state: 'Tamil Nadu',
      },
    }),
  ]);
  console.log('✅ Created 2 buyer accounts');

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        farmerId: farmers[0].id,
        categoryId: categories[0].id,
        name: 'Fresh Tomatoes',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
        quantity: 500,
        unit: 'kg',
        expectedPrice: 25,
        harvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        village: 'Madurai North',
        district: 'Madurai',
        state: 'Tamil Nadu',
        description: 'Fresh organic tomatoes grown without pesticides. Rich in vitamins and minerals.',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        farmerId: farmers[0].id,
        categoryId: categories[0].id,
        name: 'Green Chillies',
        imageUrl: 'https://images.unsplash.com/photo-1599487489002-48ff5b62a8f5?w=400',
        quantity: 200,
        unit: 'kg',
        expectedPrice: 40,
        harvestDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        village: 'Madurai North',
        district: 'Madurai',
        state: 'Tamil Nadu',
        description: 'Spicy green chillies, freshly harvested.',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        farmerId: farmers[1].id,
        categoryId: categories[1].id,
        name: 'Sweet Mangoes',
        imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
        quantity: 300,
        unit: 'kg',
        expectedPrice: 80,
        harvestDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        village: 'Coimbatore South',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        description: 'Alphonso variety mangoes, sweet and juicy.',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        farmerId: farmers[1].id,
        categoryId: categories[2].id,
        name: 'Organic Rice',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        quantity: 1000,
        unit: 'kg',
        expectedPrice: 45,
        harvestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        village: 'Coimbatore South',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        description: 'Ponni variety organic rice, traditionally grown.',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        farmerId: farmers[2].id,
        categoryId: categories[3].id,
        name: 'Black Gram (Urad Dal)',
        imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400',
        quantity: 400,
        unit: 'kg',
        expectedPrice: 90,
        harvestDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        village: 'Salem West',
        district: 'Salem',
        state: 'Tamil Nadu',
        description: 'High quality urad dal, protein rich.',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        farmerId: farmers[2].id,
        categoryId: categories[4].id,
        name: 'Turmeric',
        imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400',
        quantity: 150,
        unit: 'kg',
        expectedPrice: 120,
        harvestDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        village: 'Salem West',
        district: 'Salem',
        state: 'Tamil Nadu',
        description: 'Organic turmeric with high curcumin content.',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${products.length} products`);

  // Create Cold Storages
  const coldStorages = await Promise.all([
    prisma.coldStorage.create({
      data: {
        name: 'Madurai Cold Storage Hub',
        address: '45 Anna Nagar, Madurai, Tamil Nadu 625020',
        latitude: 9.9312,
        longitude: 78.1355,
        capacityTons: 500,
        supportedCrops: ['Tomatoes', 'Onions', 'Potatoes', 'Mangoes', 'Grapes'],
        minTemp: -5,
        maxTemp: 10,
        rentPerDay: 2.5,
        phone: '+91 452 2345678',
        operatingHours: '6:00 AM - 10:00 PM',
      },
    }),
    prisma.coldStorage.create({
      data: {
        name: 'Coimbatore AgroFreeze',
        address: '12 Industrial Estate, Coimbatore, Tamil Nadu 641003',
        latitude: 11.0218,
        longitude: 76.9724,
        capacityTons: 800,
        supportedCrops: ['Bananas', 'Coconut', 'Turmeric', 'Ginger', 'Rice'],
        minTemp: 0,
        maxTemp: 15,
        rentPerDay: 3.0,
        phone: '+91 422 3456789',
        operatingHours: '5:00 AM - 11:00 PM',
      },
    }),
    prisma.coldStorage.create({
      data: {
        name: 'Salem FreshKeep',
        address: '78 Omalur Road, Salem, Tamil Nadu 636004',
        latitude: 11.6751,
        longitude: 78.1618,
        capacityTons: 350,
        supportedCrops: ['Vegetables', 'Flowers', 'Spices', 'Pulses'],
        minTemp: 2,
        maxTemp: 12,
        rentPerDay: 2.0,
        phone: '+91 427 4567890',
        operatingHours: '6:00 AM - 9:00 PM',
      },
    }),
    prisma.coldStorage.create({
      data: {
        name: 'Chennai Metro Cold Chain',
        address: '23 SIDCO Industrial Area, Chennai, Tamil Nadu 600098',
        latitude: 13.0827,
        longitude: 80.2707,
        capacityTons: 1200,
        supportedCrops: ['All Vegetables', 'All Fruits', 'Dairy', 'Flowers'],
        minTemp: -10,
        maxTemp: 8,
        rentPerDay: 4.5,
        phone: '+91 44 56789012',
        operatingHours: '24/7',
      },
    }),
    prisma.coldStorage.create({
      data: {
        name: 'Trichy GrainVault',
        address: '56 Palakarai, Trichy, Tamil Nadu 620001',
        latitude: 10.7905,
        longitude: 78.7047,
        capacityTons: 600,
        supportedCrops: ['Rice', 'Wheat', 'Pulses', 'Oilseeds'],
        minTemp: 5,
        maxTemp: 20,
        rentPerDay: 1.8,
        phone: '+91 431 5678901',
        operatingHours: '7:00 AM - 8:00 PM',
      },
    }),
  ]);
  console.log(`✅ Created ${coldStorages.length} cold storages`);

  // Create Notifications for farmers
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: farmers[0].id,
        type: 'WELCOME',
        message: 'Welcome to AI Farmer Marketplace! Start listing your crops to reach buyers across Tamil Nadu.',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: farmers[1].id,
        type: 'WEATHER_ALERT',
        message: 'Heavy rainfall expected in Coimbatore district. Take preventive measures for your crops.',
        isRead: false,
      },
    }),
  ]);
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Seed complete! Default credentials:');
  console.log('  Admin:  admin@aifarm.com    / Password123!');
  console.log('  Farmer: farmer1@aifarm.com  / Password123!');
  console.log('  Farmer: farmer2@aifarm.com  / Password123!');
  console.log('  Farmer: farmer3@aifarm.com  / Password123!');
  console.log('  Buyer:  buyer1@aifarm.com   / Password123!');
  console.log('  Buyer:  buyer2@aifarm.com   / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
