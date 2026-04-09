import { test, expect } from "./fixtures/auth";

/**
 * Smoke tests: every admin page should load without throwing JS errors
 * or 5xx API responses. This is the cheapest way to surface broken pages
 * across the entire app in one shot.
 */
const ADMIN_PAGES = [
  "/admin",
  "/admin/orders",
  "/admin/categories",
  "/admin/menu-items",
  "/admin/tables",
  "/admin/sales",
  "/admin/users",
  "/admin/shop-info",
];

test.describe("Page smoke tests (admin role)", () => {
  for (const path of ADMIN_PAGES) {
    test(`GET ${path} loads with no JS errors or 5xx`, async ({ adminPage }) => {
      const errors: string[] = [];
      adminPage.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      adminPage.on("response", (r) => {
        if (r.url().includes("/api/") && r.status() >= 500) {
          errors.push(`5xx ${r.status()} ${r.url()}`);
        }
      });
      const res = await adminPage.goto(path);
      expect(res?.status() ?? 0).toBeLessThan(500);
      await adminPage.waitForLoadState("networkidle").catch(() => {});
      expect(errors, errors.join("\n")).toHaveLength(0);
    });
  }

  test("GET /login (unauthenticated) loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });
});
