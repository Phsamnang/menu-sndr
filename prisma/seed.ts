import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const connectionUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_orfLQ0ygD8uY@ep-polished-base-a10h09ef-pooler.ap-southeast-1.aws.neon.tech/menu_sndr?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function main() {
  await prisma.price.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.tableType.deleteMany();
  await prisma.category.deleteMany();

  const categories = await prisma.category.createMany({
    data: [
      { name: "appetizer", displayName: "Appetizer" },
      { name: "food", displayName: "Main Course" },
      { name: "dessert", displayName: "Dessert" },
      { name: "drink", displayName: "Beverage" },
      { name: "alcohol", displayName: "Alcoholic Beverage" },
    ],
  });

  const tableTypes = await prisma.tableType.createMany({
    data: [
      { name: "economy", displayName: "Economy", order: 1 },
      { name: "standard", displayName: "Standard", order: 2 },
      { name: "premium", displayName: "Premium", order: 3 },
      { name: "vip", displayName: "VIP", order: 4 },
      { name: "royal", displayName: "Royal", order: 5 },
    ],
  });

  const categoryMap = await prisma.category.findMany();
  const tableTypeMap = await prisma.tableType.findMany();

  const getCategoryId = (name: string) =>
    categoryMap.find((c: { name: string; id: string }) => c.name === name)?.id || "";
  const getTableTypeId = (name: string) =>
    tableTypeMap.find((t: { name: string; id: string }) => t.name === name)?.id || "";

  const menuItems = [
    {
      name: "Bruschetta",
      description: "Toasted bread with tomatoes, garlic, and basil",
      image: "https://images.unsplash.com/photo-1572449063416-c3a1b2b730b5?w=400&h=300&fit=crop",
      categoryName: "appetizer",
      prices: [
        { tableTypeName: "economy", amount: 6.99 },
        { tableTypeName: "standard", amount: 8.99 },
        { tableTypeName: "premium", amount: 10.99 },
        { tableTypeName: "vip", amount: 12.99 },
        { tableTypeName: "royal", amount: 15.99 },
      ],
    },
    {
      name: "Spring Rolls",
      description: "Crispy vegetable spring rolls with sweet chili sauce",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
      categoryName: "appetizer",
      prices: [
        { tableTypeName: "economy", amount: 5.99 },
        { tableTypeName: "standard", amount: 7.99 },
        { tableTypeName: "premium", amount: 9.99 },
        { tableTypeName: "vip", amount: 11.99 },
        { tableTypeName: "royal", amount: 13.99 },
      ],
    },
    {
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with Caesar dressing",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
      categoryName: "food",
      prices: [
        { tableTypeName: "economy", amount: 9.99 },
        { tableTypeName: "standard", amount: 12.99 },
        { tableTypeName: "premium", amount: 15.99 },
        { tableTypeName: "vip", amount: 18.99 },
        { tableTypeName: "royal", amount: 22.99 },
      ],
    },
    {
      name: "Grilled Salmon",
      description: "Atlantic salmon with lemon butter sauce",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      categoryName: "food",
      prices: [
        { tableTypeName: "economy", amount: 19.99 },
        { tableTypeName: "standard", amount: 24.99 },
        { tableTypeName: "premium", amount: 28.99 },
        { tableTypeName: "vip", amount: 32.99 },
        { tableTypeName: "royal", amount: 38.99 },
      ],
    },
    {
      name: "Ribeye Steak",
      description: "12oz prime ribeye with garlic butter",
      image: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
      categoryName: "food",
      prices: [
        { tableTypeName: "economy", amount: 26.99 },
        { tableTypeName: "standard", amount: 32.99 },
        { tableTypeName: "premium", amount: 38.99 },
        { tableTypeName: "vip", amount: 45.99 },
        { tableTypeName: "royal", amount: 54.99 },
      ],
    },
    {
      name: "Pasta Carbonara",
      description: "Creamy pasta with bacon and parmesan",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
      categoryName: "food",
      prices: [
        { tableTypeName: "economy", amount: 12.99 },
        { tableTypeName: "standard", amount: 16.99 },
        { tableTypeName: "premium", amount: 19.99 },
        { tableTypeName: "vip", amount: 22.99 },
        { tableTypeName: "royal", amount: 26.99 },
      ],
    },
    {
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with vanilla ice cream",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      categoryName: "dessert",
      prices: [
        { tableTypeName: "economy", amount: 6.99 },
        { tableTypeName: "standard", amount: 8.99 },
        { tableTypeName: "premium", amount: 10.99 },
        { tableTypeName: "vip", amount: 12.99 },
        { tableTypeName: "royal", amount: 15.99 },
      ],
    },
    {
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
      categoryName: "dessert",
      prices: [
        { tableTypeName: "economy", amount: 7.99 },
        { tableTypeName: "standard", amount: 9.99 },
        { tableTypeName: "premium", amount: 11.99 },
        { tableTypeName: "vip", amount: 13.99 },
        { tableTypeName: "royal", amount: 16.99 },
      ],
    },
    {
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
      categoryName: "drink",
      prices: [
        { tableTypeName: "economy", amount: 3.99 },
        { tableTypeName: "standard", amount: 4.99 },
        { tableTypeName: "premium", amount: 5.99 },
        { tableTypeName: "vip", amount: 6.99 },
        { tableTypeName: "royal", amount: 7.99 },
      ],
    },
    {
      name: "Cappuccino",
      description: "Espresso with steamed milk foam",
      image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
      categoryName: "drink",
      prices: [
        { tableTypeName: "economy", amount: 4.99 },
        { tableTypeName: "standard", amount: 5.99 },
        { tableTypeName: "premium", amount: 6.99 },
        { tableTypeName: "vip", amount: 7.99 },
        { tableTypeName: "royal", amount: 8.99 },
      ],
    },
    {
      name: "Iced Tea",
      description: "Refreshing iced tea with lemon",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
      categoryName: "drink",
      prices: [
        { tableTypeName: "economy", amount: 2.99 },
        { tableTypeName: "standard", amount: 3.99 },
        { tableTypeName: "premium", amount: 4.99 },
        { tableTypeName: "vip", amount: 5.99 },
        { tableTypeName: "royal", amount: 6.99 },
      ],
    },
    {
      name: "Red Wine",
      description: "Premium house red wine",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
      categoryName: "alcohol",
      prices: [
        { tableTypeName: "economy", amount: 9.99 },
        { tableTypeName: "standard", amount: 12.99 },
        { tableTypeName: "premium", amount: 16.99 },
        { tableTypeName: "vip", amount: 22.99 },
        { tableTypeName: "royal", amount: 28.99 },
      ],
    },
    {
      name: "White Wine",
      description: "Premium house white wine",
      image: "https://images.unsplash.com/photo-1553361376-1f8e3e0b0f1e?w=400&h=300&fit=crop",
      categoryName: "alcohol",
      prices: [
        { tableTypeName: "economy", amount: 9.99 },
        { tableTypeName: "standard", amount: 12.99 },
        { tableTypeName: "premium", amount: 16.99 },
        { tableTypeName: "vip", amount: 22.99 },
        { tableTypeName: "royal", amount: 28.99 },
      ],
    },
    {
      name: "Craft Beer",
      description: "Local craft beer selection",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      categoryName: "alcohol",
      prices: [
        { tableTypeName: "economy", amount: 5.99 },
        { tableTypeName: "standard", amount: 7.99 },
        { tableTypeName: "premium", amount: 9.99 },
        { tableTypeName: "vip", amount: 11.99 },
        { tableTypeName: "royal", amount: 13.99 },
      ],
    },
  ];

  for (const item of menuItems) {
    const { prices, categoryName, ...itemData } = item;
    const categoryId = getCategoryId(categoryName);
    
    const menuItem = await prisma.menuItem.create({
      data: {
        ...itemData,
        categoryId,
        prices: {
          create: prices.map((price) => ({
            tableTypeId: getTableTypeId(price.tableTypeName),
            amount: price.amount,
          })),
        },
      },
    });
    console.log(`Created menu item: ${menuItem.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

