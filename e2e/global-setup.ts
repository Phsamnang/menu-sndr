import { request, FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Global setup: log in as each seeded user and write a storageState file with
 * the JWT pre-populated in sessionStorage. Spec files reference these via the
 * authenticated fixtures in e2e/fixtures/auth.ts.
 *
 * NOTE: tokens live in sessionStorage (utils/token.ts), not localStorage.
 * Playwright's storageState only persists localStorage + cookies, so we save
 * the raw token to a JSON sidecar and an addInitScript in the fixture
 * re-installs it into sessionStorage on every page.
 */

export const TEST_USERS = {
  admin: { username: "admin", password: "admin123" },
  chef: { username: "chef", password: "chef123" },
  waiter: { username: "waiter", password: "waiter123" },
  order: { username: "order", password: "order123" },
} as const;

export type TestRole = keyof typeof TEST_USERS;

const AUTH_DIR = path.resolve(__dirname, ".auth");

export function authFile(role: TestRole) {
  return path.join(AUTH_DIR, `${role}.json`);
}

export default async function globalSetup(_config: FullConfig) {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const baseURL = "http://localhost:3000";
  const ctx = await request.newContext({ baseURL });

  for (const [role, creds] of Object.entries(TEST_USERS)) {
    const res = await ctx.post("/api/auth/login", { data: creds });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(
        `[global-setup] Login failed for ${role} (${res.status()}). ` +
          `Did you run 'npm run db:seed'? Response: ${body.slice(0, 300)}`
      );
    }
    const json = await res.json();
    const token: string | undefined = json?.data?.token;
    const user = json?.data?.user;
    if (!token || !user) {
      throw new Error(
        `[global-setup] Login response missing token/user for ${role}: ${JSON.stringify(json).slice(0, 300)}`
      );
    }
    fs.writeFileSync(authFile(role as TestRole), JSON.stringify({ token, user }, null, 2));
  }

  await ctx.dispose();
}
