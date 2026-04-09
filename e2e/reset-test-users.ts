/**
 * One-shot helper: reset the four E2E test users to known passwords.
 * Run with: npx tsx e2e/reset-test-users.ts
 *
 * The Prisma seed file uses `update: {}`, so if any of these users already
 * exist with a manually-changed password, the seed won't fix them. This script
 * does — call it before running the suite if global-setup fails on login.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

// Match the fallback URL used by prisma/seed.ts so this script works the
// same way db:seed does, even when DATABASE_URL is not set.
const connectionUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_orfLQ0ygD8uY@ep-polished-base-a10h09ef-pooler.ap-southeast-1.aws.neon.tech/menu_sndr?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } },
});

const USERS: Array<{ username: string; password: string; roleName: string }> = [
  { username: "admin", password: "admin123", roleName: "admin" },
  { username: "chef", password: "chef123", roleName: "chef" },
  { username: "waiter", password: "waiter123", roleName: "waiter" },
  { username: "order", password: "order123", roleName: "order" },
];

async function main() {
  for (const u of USERS) {
    const role = await prisma.role.findUnique({ where: { name: u.roleName } });
    if (!role) {
      console.error(`[reset] role ${u.roleName} not found — run db:seed first`);
      process.exit(1);
    }
    const hash = bcrypt.hashSync(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: hash, isActive: true, roleId: role.id },
      create: {
        username: u.username,
        password: hash,
        isActive: true,
        roleId: role.id,
      },
    });
    console.log(`[reset] ${u.username} → ${u.password}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
