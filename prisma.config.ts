import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Append timezone parameter to connection string if not already present
const timezone = "Asia/Phnom_Penh";
let urlWithTimezone = databaseUrl;
if (!urlWithTimezone.includes("timezone=")) {
  const separator = urlWithTimezone.includes("?") ? "&" : "?";
  urlWithTimezone = `${urlWithTimezone}${separator}timezone=${encodeURIComponent(timezone)}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: urlWithTimezone,
  },
});
