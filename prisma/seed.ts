import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { hashPassword } from "../utils/auth";

dotenv.config();

const connectionUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_orfLQ0ygD8uY@ep-polished-base-a10h09ef-pooler.ap-southeast-1.aws.neon.tech/menu_sndr?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "appetizer" },
      update: {},
      create: { name: "appetizer", displayName: "Appetizer" },
    }),
    prisma.category.upsert({
      where: { name: "food" },
      update: {},
      create: { name: "food", displayName: "Main Course" },
    }),
    prisma.category.upsert({
      where: { name: "dessert" },
      update: {},
      create: { name: "dessert", displayName: "Dessert" },
    }),
    prisma.category.upsert({
      where: { name: "drink" },
      update: {},
      create: { name: "drink", displayName: "Beverage" },
    }),
    prisma.category.upsert({
      where: { name: "alcohol" },
      update: {},
      create: { name: "alcohol", displayName: "Alcoholic Beverage" },
    }),
  ]);

  const tableTypes = await Promise.all([
    prisma.tableType.upsert({
      where: { name: "economy" },
      update: {},
      create: { name: "economy", displayName: "Economy", order: 1 },
    }),
    prisma.tableType.upsert({
      where: { name: "standard" },
      update: {},
      create: { name: "standard", displayName: "Standard", order: 2 },
    }),
    prisma.tableType.upsert({
      where: { name: "premium" },
      update: {},
      create: { name: "premium", displayName: "Premium", order: 3 },
    }),
    prisma.tableType.upsert({
      where: { name: "vip" },
      update: {},
      create: { name: "vip", displayName: "VIP", order: 4 },
    }),
    prisma.tableType.upsert({
      where: { name: "royal" },
      update: {},
      create: { name: "royal", displayName: "Royal", order: 5 },
    }),
  ]);

  const categoryMap = await prisma.category.findMany();
  const tableTypeMap = await prisma.tableType.findMany();

  const getCategoryId = (name: string) =>
    categoryMap.find((c: { name: string; id: string }) => c.name === name)
      ?.id || "";
  const getTableTypeId = (name: string) =>
    tableTypeMap.find((t: { name: string; id: string }) => t.name === name)
      ?.id || "";

  const menuItems = [
    {
      name: "Bruschetta",
      description: "Toasted bread with tomatoes, garlic, and basil",
      image:
        "https://images.unsplash.com/photo-1572449063416-c3a1b2b730b5?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1553361376-1f8e3e0b0f1e?w=400&h=300&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
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

    const existingItem = await prisma.menuItem.findFirst({
      where: { name: itemData.name },
    });

    if (!existingItem) {
      await prisma.menuItem.create({
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
    }
  }

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin", displayName: "Administrator" },
    }),
    prisma.role.upsert({
      where: { name: "chef" },
      update: {},
      create: { name: "chef", displayName: "Chef" },
    }),
    prisma.role.upsert({
      where: { name: "waiter" },
      update: {},
      create: { name: "waiter", displayName: "Waiter" },
    }),
    prisma.role.upsert({
      where: { name: "order" },
      update: {},
      create: { name: "order", displayName: "Order Staff" },
    }),
  ]);

  const roleMap = await prisma.role.findMany();
  const getRoleId = (name: string) =>
    roleMap.find((r: { name: string; id: string }) => r.name === name)?.id ||
    "";

  await Promise.all([
    prisma.user.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        username: "admin",
        password: hashPassword("admin123"),
        roleId: getRoleId("admin"),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { username: "chef" },
      update: {},
      create: {
        username: "chef",
        password: hashPassword("chef123"),
        roleId: getRoleId("chef"),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { username: "waiter" },
      update: {},
      create: {
        username: "waiter",
        password: hashPassword("waiter123"),
        roleId: getRoleId("waiter"),
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { username: "order" },
      update: {},
      create: {
        username: "order",
        password: hashPassword("order123"),
        roleId: getRoleId("order"),
        isActive: true,
      },
    }),
  ]);

  await prisma.adminMenuItemRole.deleteMany();
  await prisma.adminMenuItem.deleteMany();

  const adminMenuItems = [
    {
      href: "/admin/categories",
      iconName: "FaFolder",
      title: "ប្រភេទម្ហូប",
      description: "គ្រប់គ្រងប្រភេទមីនុយ",
      order: 1,
      roles: ["admin"],
    },
    {
      href: "/admin/table-types",
      iconName: "FaLayerGroup",
      title: "ប្រភេទតុ",
      description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
      order: 2,
      roles: ["admin"],
    },
    {
      href: "/admin/tables",
      iconName: "FaTable",
      title: "តុ",
      description: "គ្រប់គ្រងតុក្នុងភោជនីយដ្ឋាន",
      order: 3,
      roles: ["admin"],
    },
    {
      href: "/admin/menu-items",
      iconName: "FaUtensils",
      title: "មុខម្ហូប",
      description: "គ្រប់គ្រងមុខម្ហូប",
      order: 4,
      roles: ["admin"],
    },
    {
      href: "/admin/orders",
      iconName: "FaShoppingCart",
      title: "ការបញ្ជាទិញ",
      description: "គ្រប់គ្រងការបញ្ជាទិញ",
      order: 5,
      roles: ["admin", "order"],
    },
    {
      href: "/admin/table-orders",
      iconName: "FaClipboardList",
      title: "ការបញ្ជាទិញតុ",
      description: "មើលការបញ្ជាទិញតាមតុ",
      order: 6,
      roles: ["admin"],
    },
    {
      href: "/admin/chef",
      iconName: "FaFire",
      title: "ចម្អិន",
      description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
      order: 7,
      roles: ["admin", "chef"],
      iconColor: "text-orange-600",
    },
    {
      href: "/admin/delivery",
      iconName: "FaTruck",
      title: "ការដឹកជញ្ជូន",
      description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
      order: 8,
      roles: ["admin", "waiter", "order"],
      iconColor: "text-blue-600",
    },
    {
      href: "/",
      iconName: "FaBook",
      title: "មើលមីនុយ",
      description: "មើលមីនុយអតិថិជន",
      order: 9,
      roles: ["admin", "chef", "waiter", "order"],
    },
  ];

  for (const item of adminMenuItems) {
    const { roles, ...itemData } = item;
    const menuItem = await prisma.adminMenuItem.create({
      data: itemData,
    });

    for (const roleName of roles) {
      const roleId = getRoleId(roleName);
      if (roleId) {
        await prisma.adminMenuItemRole.create({
          data: {
            adminMenuItemId: menuItem.id,
            roleId: roleId,
          },
        });
      }
    }
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
