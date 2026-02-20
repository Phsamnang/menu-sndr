import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Timezone for all database operations: Asia/Phnom_Penh
// This is configured via the DATABASE_URL connection string parameter
// and documented in the Prisma schema
const TIMEZONE = "Asia/Phnom_Penh";

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Append timezone parameter to connection string if not already present
let urlWithTimezone = databaseUrl;
if (!urlWithTimezone.includes("timezone=")) {
  const separator = urlWithTimezone.includes("?") ? "&" : "?";
  urlWithTimezone = `${urlWithTimezone}${separator}timezone=${encodeURIComponent(TIMEZONE)}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: urlWithTimezone,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

// Set timezone on first connection
if (!globalForPrisma.prisma) {
  // Initialize timezone setting asynchronously
  prisma.$connect().then(async () => {
    try {
      await prisma.$executeRawUnsafe(`SET timezone = '${TIMEZONE}'`);
    } catch (error) {
      // Timezone may already be set or connection string handles it
      if (process.env.NODE_ENV === "development") {
        console.warn("Note: Database timezone setting:", error);
      }
    }
  }).catch(() => {
    // Connection will be established on first query
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
