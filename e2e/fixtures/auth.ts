import { test as base, expect, Page, BrowserContext } from "@playwright/test";
import fs from "fs";
import { authFile, TestRole } from "../global-setup";

/**
 * Auth fixtures.
 *
 * Each `<role>Page` fixture returns a Page that is already authenticated as
 * that role. Because the app stores its JWT in sessionStorage, we use
 * addInitScript to inject `accessToken` and `user` before any app code runs.
 */

type RoleFixtures = {
  adminPage: Page;
  chefPage: Page;
  waiterPage: Page;
  orderStaffPage: Page;
  authedRequest: (role: TestRole) => Promise<{ token: string; user: any }>;
};

function readAuth(role: TestRole): { token: string; user: any } {
  const file = authFile(role);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing auth file ${file}. Did global-setup run?`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function makeAuthedPage(context: BrowserContext, role: TestRole): Promise<Page> {
  const { token, user } = readAuth(role);
  await context.addInitScript(
    ({ token, user }) => {
      try {
        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        // sessionStorage may be unavailable on about:blank — safe to ignore.
      }
    },
    { token, user }
  );
  const page = await context.newPage();
  return page;
}

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ context }, use) => {
    const page = await makeAuthedPage(context, "admin");
    await use(page);
    await page.close();
  },
  chefPage: async ({ context }, use) => {
    const page = await makeAuthedPage(context, "chef");
    await use(page);
    await page.close();
  },
  waiterPage: async ({ context }, use) => {
    const page = await makeAuthedPage(context, "waiter");
    await use(page);
    await page.close();
  },
  orderStaffPage: async ({ context }, use) => {
    const page = await makeAuthedPage(context, "order");
    await use(page);
    await page.close();
  },
  authedRequest: async ({}, use) => {
    await use(async (role: TestRole) => readAuth(role));
  },
});

export { expect };

/**
 * Helper for API-only assertions: returns headers with Bearer token for the role.
 */
export function bearerHeaders(role: TestRole): Record<string, string> {
  const { token } = readAuth(role);
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}
